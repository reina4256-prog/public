'use strict';
const fs = require('node:fs'), path = require('node:path');
const base = require('../../experimental_word_llm_native');
const core = require('../../experimental_word_llm_native_runtime');
const MAX_BYTES = 16*1024*1024;
function createStore(directory) {
    fs.mkdirSync(directory,{recursive:true});
    const file=path.join(directory,'native-memory.json'), backup=file+'.backup', temp=file+'.tmp';
    let blocked=false;
    function load() {
        try {
            if (!fs.existsSync(file)) {
                if (fs.existsSync(backup)) throw Error('missing');
                return {ok:true,value:null};
            }
            if (fs.statSync(file).size > MAX_BYTES) throw Error('size');
            const value=JSON.parse(fs.readFileSync(file,'utf8'));
            if (!core.validState(value)) throw Error('invalid');
            return {ok:true,value};
        } catch (error) { blocked=true; return {ok:false,error:'save',reason:error instanceof SyntaxError?'invalid':['invalid','size','missing'].includes(error.message)?error.message:'io',code:error.code||null}; }
    }
    function save(value) {
        if (blocked) return {ok:false,error:'save',reason:'blocked'};
        let validating=true;
        try {
            if(!core.validState(value))return {ok:false,error:'save',reason:'invalid'};
            const data=JSON.stringify(value);
            if (Buffer.byteLength(data) > MAX_BYTES) throw Error('size');
            validating=false;
            const fd=fs.openSync(temp,'w');
            try { fs.writeFileSync(fd,data,'utf8'); fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
            if (fs.existsSync(file)) fs.copyFileSync(file,backup);
            fs.renameSync(temp,file);
            return {ok:true};
        } catch (error) { return {ok:false,error:'save',reason:error.message==='size'?'size':validating?'invalid':'io',code:error.code||null}; }
    }
    return {load,save,file};
}
function createSession({store,responder,record=()=>{},clock=()=>performance.now(),islandFactory=()=>require('./native_island').createIsland()}) {
    let state=null,loaded=false,blocked=false,busy=false;
    let lastClock=clock(),lastSave=lastClock;
    const copy=()=>state ? structuredClone(state) : null;
    const log=(kind,data)=>{ try { record({kind,at:Date.now(),...data}); } catch (_) { /* Save remains the primary evidence. */ } };
    const persist=(value,stage,id=null,result=null)=>{const saved=store.save(value);if(!saved.ok)log('save_error',{id,stage,reason:saved.reason||'unknown',code:saved.code||null,result});return saved;};
    function load() {
        if (!loaded) {
            const result=store.load();loaded=true;blocked=!result.ok;state=result.value || null;
            if (state?.turns.at(-1)?.status === 'pending') {
                state=core.finish(state,state.turns.at(-1).id,state.revision,null);
                if (!persist(state,'resume').ok) blocked=true;
            }
            if(state&&!blocked){const upgraded=core.upgrade(state);if(upgraded!==state){if(persist(upgraded,'map-upgrade').ok)state=upgraded;else blocked=true;}}
        }
        return blocked ? {ok:false,error:'save'} : {ok:true,state:copy()};
    }
    function create(character,locale,answers) {
        load();
        if (blocked || state || busy) return {ok:false,error:'input'};
        try {
            const value=answers?core.create(character,locale,answers,islandFactory()):base.create(character,locale);
            if (!persist(value,'create').ok) return {ok:false,error:'save'};
            state=value;return {ok:true,state:copy()};
        } catch (_) { return {ok:false,error:'input'}; }
    }
    function prepare(answers){
        load();if(blocked||!state||state.game||busy)return {ok:false,error:'input'};
        try{const value=core.adopt(state,answers,islandFactory());if(!persist(value,'adopt').ok)return {ok:false,error:'save'};
            state=value;lastClock=clock();return {ok:true,state:copy()};}catch(_){return {ok:false,error:'input'};}
    }
    function pulse(paused=true){
        const now=clock(),seconds=Math.min(.1,Math.max(0,(now-lastClock)/1000));lastClock=now;
        if(blocked)return {ok:false,error:'save'};
        if(!loaded||!state?.game)return {ok:true};
        if(!busy&&paused===false){
            const before=state.game.receipts.length;core.game.tick(state.game,seconds);
            if(state.game.receipts.length!==before||now-lastSave>10000){
                if(!persist(state,'world').ok){blocked=true;return {ok:false,error:'save'};}lastSave=now;
                if(state.game.receipts.length!==before)log('world',{results:state.game.receipts.slice(before)});
            }
        }
        const {island,...dynamic}=state.game;return {ok:true,game:structuredClone(dynamic)};
    }
    async function submit(input,locale) {
        const started=performance.now();
        load();if (blocked || !state || busy) return {ok:false,error:blocked?'save':'input'};
        let next;
        try { next=core.begin(state,input,locale); } catch (_) { return {ok:false,error:'input'}; }
        if (!persist(next.state,'input',next.packet.id).ok) return {ok:false,error:'save'};
        state=next.state;busy=true;log('input',{packet:next.packet,revision:state.revision});
        try {
            const result=await responder.reply(next.packet);
            const receivedMs=performance.now()-started;
            const accepted=result.ok && core.validResult(result.proposal,next.packet);
            const updated=core.finish(state,next.packet.id,next.state.revision,accepted?result.proposal:null);
            if (!persist(updated,'completion',next.packet.id,accepted?result.proposal:null).ok) { blocked=true;return {ok:false,error:'save',state:copy()}; }
            state=updated;
            const error=accepted?null:(result.ok?'output':result.error || 'failed');
            log('result',{id:next.packet.id,error,result:accepted?result.proposal:null,supplied:next.packet.memories.map(m=>m.sourceId),
                timing:{helper:result.timing||null,receivedMs,totalMs:performance.now()-started}});
            return {ok:!!accepted,error,state:copy()};
        } catch (_) {
            const updated=core.finish(state,next.packet.id,next.state.revision,null);
            if (persist(updated,'failure',next.packet.id).ok) state=updated;else blocked=true;
            log('result',{id:next.packet.id,error:'failed',result:null});
            return {ok:false,error:blocked?'save':'failed',state:copy()};
        } finally { busy=false;lastClock=clock(); }
    }
    function warmup(){if(!loaded)load();if(blocked||busy||!state?.game)return {ok:false};return responder.prepare?.()||{ok:true};}
    return {load,create,prepare,warmup,pulse,submit,cancel:()=>responder.cancel(),dispose:()=>{
        if(loaded&&state&&!blocked&&!busy&&!persist(state,'close').ok)blocked=true;
        responder.dispose();
    }};
}
module.exports={createStore,createSession,MAX_BYTES};
