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
function createSession({store,responder,mentorResponder=null,practiceResponder=null,recoverMentor=null,record=()=>{},clock=()=>performance.now(),wallClock=()=>Date.now(),islandFactory=()=>require('./native_island').createIsland()}) {
    const talk=require('./native_mentor').createTalk(mentorResponder,(kind,data)=>log(kind,data),()=>state?.game?.walk?.roaming?core.game.walk.calendar.snapshot(wallClock(),state.game.calendarSettings,state.locale):null);
    const practice=core.game.practice,practiceProtocol=require('./native_practice');
    let practiceArmed=false,practicePending=false,practiceTicket=0;
    let introOwner=null,freshArrival=null,freshWalkCause=null;
    let state=null,loaded=false,blocked=false,busy=false;
    let lastClock=clock(),lastSave=lastClock;
    const copy=()=>state ? structuredClone(state) : null;
    const log=(kind,data)=>{ try { record({kind,at:Date.now(),...data}); } catch (_) { /* Save remains the primary evidence. */ } };
    const persist=(value,stage,id=null,result=null)=>{const saved=store.save(value);if(!saved.ok)log('save_error',{id,stage,reason:saved.reason||'unknown',code:saved.code||null,result});return saved;};
    function syncRoaming(){if(!state?.game||blocked)return;const next=copy(),now=wallClock(),p=practice.current(next.game);let changed=false;
        if(!busy&&next.game.walk?.roaming&&now>=next.game.walk.roaming.nextAt&&p&&!p.free&&!p.remote&&p.npc!=='building'&&['offer','decision','consult'].includes(p.phase)&&p.choice!=='accept'){practice.stop(next.game);changed=true;}
        if(core.game.walk.roam(next.game,now,busy))changed=true;
        if(!busy&&p?.npc==='building'&&now>=next.game.walk.builder.nextAt&&practice.active(next.game)){practice.stop(next.game);if(next.game.walk.encounter?.npc==='building')next.game.walk.encounter.phase='done';changed=true;}
        if(core.game.walk.roamBuilder(next.game,now,busy||next.game.walk?.encounter?.npc==='building'&&['video','conversation'].includes(next.game.walk.encounter.phase)))changed=true;
        if(changed){next.revision++;if(persist(next,'roaming').ok)state=next;else blocked=true;}}
    function calendarSettings(value,locale){load();if(blocked||busy||!state?.game||!core.game.walk.calendar.validSettings(value)||locale!==undefined&&!core.locales.includes(locale))return {ok:false,error:blocked?'save':'input'};
        const next=copy();next.game.calendarSettings=structuredClone(value);if(locale!==undefined)next.locale=locale;next.revision++;if(!persist(next,'calendar-settings').ok){blocked=true;return {ok:false,error:'save'};}state=next;return {ok:true,state:copy()};}
    function load() {
        if (!loaded) {
            const result=store.load();loaded=true;blocked=!result.ok;state=result.value || null;
            if (state?.turns.at(-1)?.status === 'pending') {
                state=core.finish(state,state.turns.at(-1).id,state.revision,null);
                if (!persist(state,'resume').ok) blocked=true;
            }
            if(state&&!blocked){const upgraded=core.upgrade(state);if(upgraded!==state){if(persist(upgraded,'map-upgrade').ok)state=upgraded;else blocked=true;}}
            if(state&&!blocked&&practice.active(state.game)){const next=copy();if(practice.suspend(next.game)){next.revision++;if(persist(next,'practice-resume').ok)state=next;else blocked=true;}}
            if(state&&!blocked&&recoverMentor&&!state.mentorConversations?.length){const recovered=recoverMentor(copy());
                if(recovered&&core.validState(recovered)){if(persist(recovered,'mentor-recovery').ok)state=recovered;else blocked=true;}}
            syncRoaming();
        }
        return blocked ? {ok:false,error:'save'} : {ok:true,state:copy()};
    }
    function create(character,locale,answers) {
        load();
        if (blocked || state || busy) return {ok:false,error:'input'};
        try {
            const value=answers?core.create(character,locale,answers,islandFactory()):base.create(character,locale);
            if (!persist(value,'create').ok) return {ok:false,error:'save'};
            state=value;syncRoaming();return blocked?{ok:false,error:'save'}:{ok:true,state:copy()};
        } catch (_) { return {ok:false,error:'input'}; }
    }
    function prepare(answers){
        load();if(blocked||!state||state.game||busy)return {ok:false,error:'input'};
        try{const value=core.adopt(state,answers,islandFactory());if(!persist(value,'adopt').ok)return {ok:false,error:'save'};
            state=value;syncRoaming();lastClock=clock();return blocked?{ok:false,error:'save'}:{ok:true,state:copy()};}catch(_){return {ok:false,error:'input'};}
    }
    function characters(){load();return blocked?{ok:false,error:'save'}:store.list?.()||{ok:true,characters:[]};}
    function selectCharacter(id){
        load();if(blocked||busy||!store.select)return {ok:false,error:'input'};
        if(state){practice.suspend(state.game);if(!persist(state,'character-switch').ok)return {ok:false,error:'save'};}practiceArmed=false;
        responder.cancel();const result=store.select(id);if(!result.ok)return result;
        state=null;loaded=false;freshArrival=freshWalkCause=null;lastClock=lastSave=clock();return load();
    }
    function createCharacter(character,locale,answers){
        load();if(blocked||busy||!state||!store.create)return {ok:false,error:'input'};
        try{const value=core.create(character,locale,answers,islandFactory());
            practice.suspend(state.game);if(!persist(state,'character-switch').ok)return {ok:false,error:'save'};practiceArmed=false;
            responder.cancel();const result=store.create(value);if(!result.ok)return result;
            state=value;syncRoaming();freshArrival=freshWalkCause=null;lastClock=lastSave=clock();return blocked?{ok:false,error:'save'}:{ok:true,state:copy()};
        }catch(_){return {ok:false,error:'input'};}
    }
    function pulse(paused=true){
        const now=clock(),seconds=Math.min(.1,Math.max(0,(now-lastClock)/1000));lastClock=now;
        if(blocked)return {ok:false,error:'save'};
        if(!loaded||!state?.game)return {ok:true};
        if(!busy&&paused===false)syncRoaming();if(blocked)return {ok:false,error:'save'};
        if(!busy&&paused===false){
            const before=state.game.receipts.length,p=practice.current(state.game),stage=p&&p.phase+'|'+p.events?.length;core.game.tick(state.game,seconds);
            const current=practice.current(state.game),changed=current&&current.phase+'|'+current.events?.length!==stage;
            if(state.game.receipts.length!==before||changed||now-lastSave>10000){
                if(!persist(state,'world').ok){blocked=true;return {ok:false,error:'save'};}lastSave=now;
                if(state.game.receipts.length!==before)log('world',{results:state.game.receipts.slice(before)});
            }
            const arrival=state.game.walk?.encounter;
            if(arrival?.phase==='pending'&&state.game.receipts.slice(before).some(r=>r.kind==='walk'&&r.id===arrival.id&&r.cause===freshWalkCause)){freshArrival=arrival.id;freshWalkCause=null;}
        }
        const {island,...dynamic}=state.game;return {ok:true,game:structuredClone(dynamic)};
    }
    async function submit(input,locale) {
        const started=performance.now();
        if(practicePending){practiceCancel();introOwner=null;busy=false;}
        load();if (blocked || !state || busy) return {ok:false,error:blocked?'save':'input'};
        let next;
        syncRoaming();if(blocked)return {ok:false,error:'save'};
        try { next=core.begin(state,input,locale,wallClock()); } catch (_) { return {ok:false,error:'input'}; }
        if (!persist(next.state,'input',next.packet.id).ok) return {ok:false,error:'save'};
        state=next.state;busy=true;log('input',{packet:next.packet,revision:state.revision});
        try {
            const result=await responder.reply(next.packet);
            const receivedMs=performance.now()-started;
            const accepted=result.ok && core.validResult(result.proposal,next.packet);
            const updated=core.finish(state,next.packet.id,next.state.revision,accepted?result.proposal:null);
            if (!persist(updated,'completion',next.packet.id,accepted?result.proposal:null).ok) { blocked=true;return {ok:false,error:'save',state:copy()}; }
            state=updated;
            if(accepted&&state.game?.receipts.some(r=>r.kind==='walk_start'&&r.cause===next.packet.id))freshWalkCause=next.packet.id;
            if(accepted&&result.proposal.practiceChoice&&practice.active(state.game)&&!practice.current(state.game).suspended)practiceArmed=true;
            if(accepted&&result.proposal.gather&&practice.current(state.game)?.id==='gather-'+next.packet.id&&practice.active(state.game)&&!practice.current(state.game).suspended)practiceArmed=true;
            if(accepted&&result.proposal.compass?.kind==='call'&&practice.current(state.game)?.id==='compass-'+next.packet.id)practiceArmed=true;
            const error=accepted?null:(result.ok?'output':result.error || 'failed');
            log('result',{id:next.packet.id,error,result:accepted?result.proposal:null,supplied:next.packet.memories.map(m=>m.sourceId),
                ...(!accepted?{diagnostic:require('./gemini_reply').safeDiagnostic(result.diagnostic)}:{}),
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
        const npc=e?.npc==='building',roaming=npc?state?.game?.walk?.builder:state?.game?.walk?.roaming;
        if(blocked||busy||!e||e.id!==id||e.phase!=='pending'||state.game.mode!=='idle'||roaming&&roaming.target!==e.target)return {ok:false,error:'input'};
        const next=copy();next.game.walk.encounter.phase='video';
        if(roaming&&e.at===undefined){const at=wallClock(),r=npc?next.game.walk.builder:next.game.walk.roaming;next.game.walk.encounter.at=at;next.game.walk.encounter.previous=structuredClone(r.lastMeeting);r.lastMeeting={at,target:e.target};}
        const p=practiceResponder?(practice.current(next.game)?.id===id?practice.current(next.game):practice.create(next.game,e,freshArrival===id)):null;
        if(npc&&!p)return {ok:false,error:'input'};
        if(!persist(next,'encounter-intro').ok){blocked=true;return {ok:false,error:'save'};}
        const automatic=!!p&&freshArrival===id&&!p.suspended&&!p.attempts.offer;freshArrival=null;
        state=next;introOwner=id;busy=true;responder.cancel();return {ok:true,met:npc?state.game.walk.builder.met:state.game.walk.met,automatic,video:npc?'building':e.target.startsWith('chip:mountain_')?'mountain':'forest',...(npc?{npc:'building'}:{}),...(p?{practice:p.id,game:structuredClone(state.game)}:{})};}
    function mentorStart(locale){load();if(blocked||!introOwner||talk.active||state?.game?.walk?.encounter?.id!==introOwner)return {ok:false,error:'input'};
        const r=talk.start(state.character,locale===undefined?state.locale:locale,core.latestConversation(state));if(!r.ok)return r;
        const next=copy();next.game.walk.met=true;next.game.walk.encounter.phase='conversation';if(!persist(next,'encounter-conversation').ok){talk.stop();blocked=true;return {ok:false,error:'save'};}state=next;return r;}
    function mentorStop(){if(introOwner&&practice.current(state?.game)?.id===introOwner)practiceCancel();if(talk.active||introOwner){talk.stop();introOwner=null;busy=false;lastClock=clock();
        if(state?.game?.walk?.encounter){const next=copy();next.game.walk.encounter.phase='done';if(persist(next,'encounter-close').ok)state=next;else blocked=true;}}
        syncRoaming();}
    async function mentorNext(id,round){if(blocked||!talk.active)return {ok:false,error:blocked?'save':'input'};
        const arrival=state.game.walk.encounter,owner=introOwner,r=await talk.next(id,round);
        if(r.ok){
            if(!owner||owner!==introOwner||state.game.walk.encounter?.id!==arrival.id)return {ok:false,error:'cancelled'};
            try{const next=core.rememberConversation(state,arrival,talk.lines);
                if(!persist(next,'mentor-dialogue',id).ok)throw Error('save');state=next;
            }catch(_){blocked=true;mentorStop();return {ok:false,error:'save'};}
        }
        if(!talk.active)mentorStop();return r;}
    function practiceCancel(){practiceTicket++;practiceArmed=false;freshArrival=freshWalkCause=null;practiceResponder?.cancel();if(practicePending)busy=false;
        if(state&&!blocked){const next=copy();if(practice.suspend(next.game)){next.revision++;if(persist(next,'practice-pause').ok)state=next;else blocked=true;}}}
    async function practiceNext(id){load();const p=practice.current(state?.game);
        if(blocked||!practiceResponder||practicePending||!p||p.id!==id||(!practiceArmed&&!(introOwner===id&&p.phase==='offer'&&!p.attempts.offer)))return {ok:false,error:blocked?'save':'input'};
        if(introOwner===id&&p.phase==='offer')p.suspended=false;
        const stage=practice.due(p);if(!stage)return {ok:false,error:'input'};
        const ticket=practiceTicket;practicePending=true;practiceArmed=true;busy=true;
        try{const request=practiceProtocol.packet(state,p,stage,wallClock()),next=copy();practice.current(next.game).attempts[stage]='pending';if(!p.free&&!p.remote&&p.npc!=='building')next.game.walk.met=true;if(!p.remote&&['offer','decision'].includes(stage)&&next.game.walk.encounter)next.game.walk.encounter.phase='conversation';next.revision++;
            if(!persist(next,'practice-input',request.id).ok){blocked=true;return {ok:false,error:'save'};}state=next;log('practice_input',{packet:request});
            const result=await practiceResponder.reply(request);if(ticket!==practiceTicket)return {ok:false,error:'cancelled'};
            const accepted=result.ok&&practiceProtocol.validResult(result.proposal,stage,request.context),updated=copy();
            if(accepted)practice.finish(updated.game,stage,result.proposal,wallClock());else{practice.current(updated.game).attempts[stage]='failed';practice.stop(updated.game,true);}
            if(stage==='decision'&&p.npc!=='building'||!accepted){if(!p.free&&updated.game.walk.encounter)updated.game.walk.encounter.phase='done';introOwner=null;}
            updated.revision++;if(!persist(updated,'practice-completion',request.id).ok){blocked=true;practiceArmed=false;return {ok:false,error:'save'};}state=updated;
            log('practice_result',{id:request.id,error:accepted?null:result.error||'output',result:accepted?result.proposal:null,
                ...(!accepted?{diagnostic:require('./gemini_reply').safeDiagnostic(result.diagnostic)}:{})});
            return {ok:!!accepted,error:accepted?null:result.error||'output',id,line:accepted?structuredClone(practice.current(state.game).lines.at(-1)):null,game:structuredClone(state.game)};
        }catch(_){if(ticket===practiceTicket&&!blocked){const next=copy();practice.stop(next.game,true);next.revision++;if(persist(next,'practice-failure').ok)state=next;else blocked=true;introOwner=null;}
            return {ok:false,error:blocked?'save':'failed'};
        }finally{practicePending=false;if(ticket===practiceTicket)busy=!!introOwner;lastClock=clock();}}
    function practiceLine(id,slot){const p=practice.current(state?.game),line=p?.lines.at(-1);return practiceArmed&&!p.suspended&&p.id===id&&line?.slot===slot?{...line,locale:state.locale}:null;}
    return {load,create,prepare,characters,selectCharacter,createCharacter,calendarSettings,warmup,pulse,submit,mentorIntro,mentorStart,mentorNext,mentorStop,mentorLine:talk.line,practiceNext,practiceLine,cancel:()=>{practiceCancel();mentorStop();responder.cancel();},dispose:()=>{
        practiceCancel();practiceResponder?.dispose();
        mentorStop();
        talk.dispose();
        if(loaded&&state&&!blocked&&!busy&&!persist(state,'close').ok)blocked=true;
        responder.dispose();
    }};
}
module.exports={createStore,createProfiles,createSession,MAX_BYTES};
