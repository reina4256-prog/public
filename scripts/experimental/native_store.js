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
function createProfiles(directory){
    const root=path.join(directory,'native-characters'),pointer=path.join(directory,'native-active-character.json');
    const validId=id=>id==='original'||typeof id==='string'&&id.length===36&&/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(id);
    const at=id=>createStore(id==='original'?directory:path.join(root,id));
    let selected='original',store=null,blocked=false;
    try{const hasPointer=fs.existsSync(pointer);if(hasPointer){if(fs.statSync(pointer).size>256)throw Error('pointer');const p=JSON.parse(fs.readFileSync(pointer,'utf8'));
        if(!p||Object.keys(p).sort().join(',')!=='id,version'||p.version!==1||!validId(p.id))throw Error('pointer');selected=p.id;}
        store=at(selected);if(hasPointer&&!fs.existsSync(store.file))throw Error('missing');
    }catch(_){blocked=true;}
    const fail=()=>({ok:false,error:'save',reason:'profiles'});
    function activate(id){fs.writeFileSync(pointer+'.tmp',JSON.stringify({version:1,id}),{encoding:'utf8',flush:true});fs.renameSync(pointer+'.tmp',pointer);}
    function list(){try{if(blocked)return fail();const ids=[];
        if(fs.existsSync(at('original').file)||fs.existsSync(at('original').file+'.backup'))ids.push('original');
        if(fs.existsSync(root))for(const entry of fs.readdirSync(root,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name)))if(entry.isDirectory()&&entry.name!=='original'&&validId(entry.name)&&fs.existsSync(at(entry.name).file))ids.push(entry.name);
        const characters=[];for(const id of ids){const r=at(id).load();if(!r.ok||!r.value)return fail();characters.push({id,name:r.value.character.name});}
        return {ok:true,selected,characters};
    }catch(_){return fail();}}
    function select(id){try{if(blocked||!validId(id))return fail();const target=at(id);if(!fs.existsSync(target.file))return fail();const r=target.load();if(!r.ok||!r.value)return fail();activate(id);selected=id;store=target;return r;}catch(_){return fail();}}
    function create(value){try{if(blocked||!core.validState(value)||!list().ok)return fail();const id=require('node:crypto').randomUUID(),target=at(id),r=target.save(value);if(!r.ok)return r;
        // Keep the previous character intact. If pointer persistence fails the new save remains recoverable in the list.
        activate(id);selected=id;store=target;return {ok:true};
    }catch(_){return fail();}}
    return {load:()=>blocked?fail():store.load(),save:value=>blocked?fail():store.save(value),list,select,create,get file(){return store?.file;}};
}
function createSession({store,responder,mentorResponder=null,record=()=>{},clock=()=>performance.now(),islandFactory=()=>require('./native_island').createIsland()}) {
    const talk=require('./native_mentor').createTalk(mentorResponder,(kind,data)=>log(kind,data));
    let introOwner=null;
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
    function characters(){load();return blocked?{ok:false,error:'save'}:store.list?.()||{ok:true,characters:[]};}
    function selectCharacter(id){
        load();if(blocked||busy||!store.select)return {ok:false,error:'input'};
        if(state&&!persist(state,'character-switch').ok)return {ok:false,error:'save'};
        responder.cancel();const result=store.select(id);if(!result.ok)return result;
        state=null;loaded=false;lastClock=lastSave=clock();return load();
    }
    function createCharacter(character,locale,answers){
        load();if(blocked||busy||!state||!store.create)return {ok:false,error:'input'};
        try{const value=core.create(character,locale,answers,islandFactory());
            if(!persist(state,'character-switch').ok)return {ok:false,error:'save'};
            responder.cancel();const result=store.create(value);if(!result.ok)return result;
            state=value;lastClock=lastSave=clock();return {ok:true,state:copy()};
        }catch(_){return {ok:false,error:'input'};}
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
    function mentorIntro(id){load();const e=state?.game?.walk?.encounter;
        if(blocked||busy||!e||e.id!==id||e.phase!=='pending'||state.game.mode!=='idle')return {ok:false,error:'input'};
        const next=copy();next.game.walk.encounter.phase='video';if(!persist(next,'encounter-intro').ok){blocked=true;return {ok:false,error:'save'};}
        state=next;introOwner=id;busy=true;responder.cancel();return {ok:true,met:state.game.walk.met,video:e.target.startsWith('chip:mountain_')?'mountain':'forest'};}
    function mentorStart(locale){load();if(blocked||!introOwner||talk.active||state?.game?.walk?.encounter?.id!==introOwner)return {ok:false,error:'input'};
        const r=talk.start(state.character,locale===undefined?state.locale:locale);if(!r.ok)return r;
        const next=copy();next.game.walk.met=true;next.game.walk.encounter.phase='conversation';if(!persist(next,'encounter-conversation').ok){talk.stop();blocked=true;return {ok:false,error:'save'};}state=next;return r;}
    function mentorStop(){if(talk.active||introOwner){talk.stop();introOwner=null;busy=false;lastClock=clock();
        if(state?.game?.walk?.encounter){const next=copy();next.game.walk.encounter.phase='done';if(persist(next,'encounter-close').ok)state=next;else blocked=true;}}}
    async function mentorNext(id,round){if(!talk.active)return {ok:false,error:'input'};const r=await talk.next(id,round);if(!talk.active)mentorStop();return r;}
    return {load,create,prepare,characters,selectCharacter,createCharacter,warmup,pulse,submit,mentorIntro,mentorStart,mentorNext,mentorStop,mentorLine:talk.line,cancel:()=>{mentorStop();responder.cancel();},dispose:()=>{
        mentorStop();
        talk.dispose();
        if(loaded&&state&&!blocked&&!busy&&!persist(state,'close').ok)blocked=true;
        responder.dispose();
    }};
}
module.exports={createStore,createProfiles,createSession,MAX_BYTES};
