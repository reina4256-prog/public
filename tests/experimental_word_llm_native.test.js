'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const core=require('../experimental_word_llm_native'),{createStore,createSession}=require('../scripts/experimental/native_store');
const character={name:'A',self:'I',player:'you'};
test('interactive launcher uses a visible Windows startup and reports spawn and abnormal exit failures',()=>{
    const {EventEmitter}=require('node:events'),{launch}=require('../scripts/experimental/native');
    const oldExit=process.exitCode,env={ELECTRON_RUN_AS_NODE:'1',KEEP:'yes'},messages=[];let actual;
    try{
        const child=launch({executable:'test-electron',env,report:message=>messages.push(message),spawn:(exe,args,settings)=>{
            actual={exe,args,settings};return new EventEmitter();
        }});
        assert.equal(actual.settings.windowsHide,false);assert.equal(actual.settings.stdio,'inherit');
        assert.equal(actual.settings.env.ELECTRON_RUN_AS_NODE,undefined);assert.equal(env.ELECTRON_RUN_AS_NODE,'1');
        child.emit('error',new Error('spawn denied'));assert.equal(process.exitCode,1);assert.match(messages[0],/spawn denied/);
        child.emit('exit',null,'SIGTERM');assert.equal(process.exitCode,1);assert.match(messages.at(-1),/SIGTERM/);
        child.emit('exit',0,null);assert.equal(process.exitCode,0);
    }finally{process.exitCode=oldExit;}
});
const start=()=>core.begin(core.create(character,'en'),'Koro is sweet.','en',1);
function result(p,kind='teaching') {return {reply:'You told me that.',interpretation:{kind,summary:'The player explained Koro.'},memories:kind==='teaching'?[{sourceId:p.id,quote:p.input,text:'The player says Koro is sweet; unverified.'}]:[],references:[]};}
function directory(t) {const dir=fs.mkdtempSync(path.join(os.tmpdir(),'native-memory-test-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));return dir;}
test('teaching keeps the exact original, a separate interpretation, and quoted unverified claim',()=>{
    const s=start(),before=JSON.stringify(s.state),r=result(s.packet),done=core.finish(s.state,s.packet.id,s.state.revision,r);
    assert.equal(JSON.stringify(s.state),before);assert.ok(core.validState(done));assert.equal(done.turns[0].input,'Koro is sweet.');
    assert.equal(done.turns[0].result.memories[0].sourceId,'turn-1');assert.equal(Object.hasOwn(done,'achievements'),false);
});
test('questions, social chat, requests, and unclear inputs cannot create taught memories',()=>{
    const s=start();for(const kind of ['question','social','request','unclear']){
        const r=result(s.packet);r.interpretation.kind=kind;assert.equal(core.validResult(r,s.packet),false);
        r.memories=[];assert.equal(core.validResult(r,s.packet),true);
    }
});
test('fabricated citations, generated replies as evidence, hidden fields and unsupplied references fail closed',()=>{
    const s=start();for(const edit of [r=>r.memories[0].sourceId='assistant',r=>r.memories[0].quote='invented',r=>r.references=['turn-99'],r=>r.action='rest',r=>r.memories[0].verified=true,r=>r.interpretation.kind='experienced']){
        const r=result(s.packet);edit(r);assert.equal(core.validResult(r,s.packet),false);
    }
});
test('later questions can recall taught originals without using assistant replies as sources',()=>{
    const s=start(),done=core.finish(s.state,s.packet.id,s.state.revision,result(s.packet));
    const next=core.begin(done,'What is Koro like?','en',2),r=result(next.packet,'question');r.references=['turn-1'];
    assert.ok(core.validResult(r,next.packet));assert.equal(next.packet.memories[0].raw,'Koro is sweet.');
    assert.deepEqual(Object.keys(next.packet).sort(),['character','id','input','locale','memories','recent'].sort());
    assert.equal(next.packet.memories[0].sourceId,'turn-1');assert.ok(!JSON.stringify(next.packet.memories).includes('You told me that.'));
});
test('corrections preserve previous claims and then survive save validation',()=>{
    const s=start(),done=core.finish(s.state,s.packet.id,s.state.revision,result(s.packet));
    const next=core.begin(done,'Correction: Koro is sour.','en',2),r=result(next.packet,'correction');
    r.memories=[{sourceId:next.packet.id,quote:next.packet.input,text:'Correction: sour, not sweet; unverified.'}];r.references=['turn-1'];
    const corrected=core.finish(next.state,next.packet.id,next.state.revision,r);assert.ok(core.validState(corrected));
    assert.equal(corrected.turns[0].input,'Koro is sweet.');assert.equal(corrected.turns[1].input,'Correction: Koro is sour.');
});
test('packet budgets use whole original/interpretation pairs, at most 12 and 8000 characters',()=>{
    let state=core.create(character,'en');for(let i=0;i<20;i++){
        const s=core.begin(state,String(i)+' '+ 'x'.repeat(1500),'en',i),r=result(s.packet,'social');state=core.finish(s.state,s.packet.id,s.state.revision,r);
    }
    const p=core.begin(state,'x','en',21).packet;assert.ok(core.validPacket(p));assert.ok(p.memories.length<=12);
    assert.ok(p.memories.reduce((n,m)=>n+m.raw.length+m.interpretation.length,0)<=8000);
    assert.ok(p.memories.every(m=>m.raw.length>1500));assert.equal(p.recent.length,0);
    for(const field of ['world','selfState','actions','species'])assert.equal(core.validPacket({...p,[field]:'secret'}),false);
});
test('stale revision and double results cannot replace an accepted turn',()=>{
    const s=start();assert.throws(()=>core.finish(s.state,s.packet.id,99,result(s.packet)),/stale/);
    const done=core.finish(s.state,s.packet.id,s.state.revision,result(s.packet));assert.throws(()=>core.finish(done,s.packet.id,done.revision,result(s.packet)),/stale/);
});
test('invalid storage blocks overwrite instead of silently resetting the character',t=>{
    const store=createStore(directory(t));fs.writeFileSync(store.file,'corrupt');assert.equal(store.load().ok,false);
    assert.equal(store.save(core.create(character,'en')).ok,false);assert.equal(fs.readFileSync(store.file,'utf8'),'corrupt');
});
test('atomic store keeps a backup and reloads original sources and references',t=>{
    const store=createStore(directory(t)),s=start();assert.ok(store.save(s.state).ok);
    const done=core.finish(s.state,s.packet.id,s.state.revision,result(s.packet));assert.ok(store.save(done).ok);
    assert.deepEqual(store.load().value,done);assert.deepEqual(JSON.parse(fs.readFileSync(store.file+'.backup')),s.state);
});
test('session owns state, validates output before persistence, and records no failed proposal',async t=>{
    const store=createStore(directory(t)),events=[],packets=[];
    const responder={reply:async p=>{packets.push(p);const r=result(p);r.memories[0].quote='forged';return {ok:true,proposal:r};},cancel(){},dispose(){}};
    const session=createSession({store,responder,record:e=>events.push(e)});assert.ok(session.create(character,'en').ok);
    const reply=await session.submit('A statement','en');assert.equal(reply.ok,false);assert.equal(reply.error,'output');
    assert.equal(store.load().value.turns[0].status,'failed');assert.equal(store.load().value.turns[0].result,null);
    assert.equal(events.at(-1).result,null);assert.ok(core.validPacket(packets[0]));
});
test('reopening an interrupted request preserves its original and permits the next request',t=>{
    const store=createStore(directory(t)),s=start();store.save(s.state);
    const session=createSession({store,responder:{cancel(){},dispose(){}}});const loaded=session.load();
    assert.equal(loaded.state.turns[0].status,'failed');assert.equal(loaded.state.turns[0].input,s.packet.input);assert.ok(core.validState(loaded.state));
});
test('quota failure cannot create memories and concurrent inputs do not start a second generation',async t=>{
    let release,calls=0;const store=createStore(directory(t));
    const session=createSession({store,responder:{reply:()=>{calls++;return new Promise(resolve=>release=resolve);},cancel(){release({ok:false,error:'cancelled'});},dispose(){}}});
    session.create(character,'en');const first=session.submit('Original','en');assert.equal((await session.submit('Second','en')).ok,false);
    release({ok:false,error:'quota'});const reply=await first;assert.equal(reply.error,'quota');assert.equal(calls,1);assert.equal(reply.state.turns[0].result,null);
});
test('structured protocol uses the same no-tools no-paid-fallback transport and rejects malformed JSON',async t=>{
    const {EventEmitter}=require('node:events'),{PassThrough}=require('node:stream');let child,call;
    const spawn=(exe,args,settings)=>{call={args,settings};child=new EventEmitter();child.stdout=new PassThrough();child.stderr=new PassThrough();child.stdin=new PassThrough();child.kill=()=>{};return child;};
    const responder=require('../scripts/experimental/gemini_reply').createResponder(directory(t),{spawn,entry:__filename,skipAuthCheck:true,protocol:core.protocol});t.after(()=>responder.dispose());
    const p=start().packet,pending=responder.reply(p);
    const settings=JSON.parse(fs.readFileSync(responder.config.session));assert.equal(settings.useG1Credits,false);assert.equal(settings.permissions.allow.length,0);assert.equal(call.settings.shell,false);
    child.stdout.write(JSON.stringify({event:'result',result:{status:'SUCCESS',response:JSON.stringify(result(p)),stats:{tools:{totalCalls:0}}}})+'\n');child.exitCode=0;child.emit('close',0);
    const output=await pending;assert.ok(output.ok);assert.ok(core.validResult(output.proposal,p));
    assert.equal(core.protocol.decode('not json'),null);assert.equal(core.validPacket({...p,input:'x'.repeat(4001)}),false);
});
