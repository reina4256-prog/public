'use strict';
const fs = require('node:fs'), path = require('node:path');
const core = require('../../experimental_word_llm_native');
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
        } catch (_) { blocked=true; return {ok:false,error:'save'}; }
    }
    function save(value) {
        if (blocked || !core.validState(value)) return {ok:false,error:'save'};
        try {
            const data=JSON.stringify(value);
            if (Buffer.byteLength(data) > MAX_BYTES) throw Error('size');
            const fd=fs.openSync(temp,'w');
            try { fs.writeFileSync(fd,data,'utf8'); fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
            if (fs.existsSync(file)) fs.copyFileSync(file,backup);
            fs.renameSync(temp,file);
            return {ok:true};
        } catch (_) { return {ok:false,error:'save'}; }
    }
    return {load,save,file};
}
function createSession({store,responder,record=()=>{}}) {
    let state=null,loaded=false,blocked=false,busy=false;
    const copy=()=>state ? structuredClone(state) : null;
    const log=(kind,data)=>{ try { record({kind,at:Date.now(),...data}); } catch (_) { /* Save remains the primary evidence. */ } };
    function load() {
        if (!loaded) {
            const result=store.load();loaded=true;blocked=!result.ok;state=result.value || null;
            if (state?.turns.at(-1)?.status === 'pending') {
                state=core.finish(state,state.turns.at(-1).id,state.revision,null);
                if (!store.save(state).ok) blocked=true;
            }
        }
        return blocked ? {ok:false,error:'save'} : {ok:true,state:copy()};
    }
    function create(character,locale) {
        load();
        if (blocked || state || busy) return {ok:false,error:'input'};
        try {
            const value=core.create(character,locale);
            if (!store.save(value).ok) return {ok:false,error:'save'};
            state=value;return {ok:true,state:copy()};
        } catch (_) { return {ok:false,error:'input'}; }
    }
    async function submit(input,locale) {
        load();if (blocked || !state || busy) return {ok:false,error:blocked?'save':'input'};
        let next;
        try { next=core.begin(state,input,locale); } catch (_) { return {ok:false,error:'input'}; }
        if (!store.save(next.state).ok) return {ok:false,error:'save'};
        state=next.state;busy=true;log('input',{packet:next.packet,revision:state.revision});
        try {
            const result=await responder.reply(next.packet);
            const accepted=result.ok && core.validResult(result.proposal,next.packet);
            const updated=core.finish(state,next.packet.id,next.state.revision,accepted?result.proposal:null);
            if (!store.save(updated).ok) { blocked=true;return {ok:false,error:'save',state:copy()}; }
            state=updated;
            const error=accepted?null:(result.ok?'output':result.error || 'failed');
            log('result',{id:next.packet.id,error,result:accepted?result.proposal:null,supplied:next.packet.memories.map(m=>m.sourceId)});
            return {ok:!!accepted,error,state:copy()};
        } catch (_) {
            const updated=core.finish(state,next.packet.id,next.state.revision,null);
            if (store.save(updated).ok) state=updated;else blocked=true;
            log('result',{id:next.packet.id,error:'failed',result:null});
            return {ok:false,error:blocked?'save':'failed',state:copy()};
        } finally { busy=false; }
    }
    return {load,create,submit,cancel:()=>responder.cancel(),dispose:()=>responder.dispose()};
}
module.exports={createStore,createSession,MAX_BYTES};
