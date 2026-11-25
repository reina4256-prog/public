'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const runtime=require('../experimental_word_llm_native_runtime'),base=require('../experimental_word_llm_native');
const island=require('../scripts/experimental/native_island').createIsland();
// Preserve the old physical-loop fixtures as compatibility tests for saved history.
const make=()=>({...base.create({name:'Pico',self:'I',player:'you'},'en'),version:2,game:runtime.game.create([0,0,0,0,0,0,0],island)});
const response=(p,action=null)=>({reply:'I will try.',interpretation:{kind:'request',summary:'A request.'},memories:[],references:[],terms:[{word:p.input,quote:p.input}],action});

function directed(s,input,extra={}){const b=runtime.begin(s,input,'en'),r={...response(b.packet),terms:[],focus:null,confirmation:null,...extra};assert.ok(runtime.validResult(r,b.packet));return runtime.finish(b.state,b.packet.id,b.state.revision,r);}
function confirmed(s){const target=runtime.game.supply(s.game).visible.find(v=>/^chip:(mountain_|palms_)/.test(v.id)&&runtime.game.walk.plan(s.game,v.id));assert.ok(target);
    s=directed(s,'Which place?',{focus:{targetId:target.id,quote:'Which place?'}});assert.equal(s.game.walk.confirmed,null);assert.equal(s.game.mode,'idle');
    s=directed(s,'Yes',{confirmation:{targetId:target.id,quote:'Yes'}});return {state:s,target:target.id};}

function arrived(s,target){s=directed(s,'walk there',{action:{kind:'walk',targetId:target,quote:'walk there'}});
    for(let i=0;i<2000&&s.game.mode==='move';i++)runtime.game.tick(s.game,.1);
    assert.equal(s.game.mode,'idle');assert.equal(s.game.walk.encounter.phase,'pending');assert.ok(runtime.validState(s));return s;}

function completeCollection(g){const practice=runtime.game.practice,p=practice.current(g);
    for(let i=0;i<2400&&p.phase!=='done';i++){const slot=practice.due(p);if(slot){p.attempts[slot]='pending';practice.finish(g,slot,{text:'Actual '+slot,choice:slot==='decision'?'accept':null});}
        runtime.game.tick(g,.1);}assert.equal(p.phase,'done');return p;}
test('collection produces two actual finite objects, survives interruption, and never replays old survey receipts',()=>{
    const first=confirmed(runtime.create({name:'Collector',self:'I',player:'you'},'en',[0,0,0,0,0,0,0],island));let s=arrived(first.state,first.target),g=s.game;
    const practice=runtime.game.practice,p=practice.create(g,g.receipts.findLast(r=>r.kind==='walk'));
    assert.equal(practice.context(g).collection.obtained,0);assert.equal(g.inventory,undefined);
    p.attempts.offer='pending';practice.finish(g,'offer',{text:'Please find materials.',choice:null});
    p.attempts.decision='pending';practice.finish(g,'decision',{text:'I will try.',choice:'accept'});
    for(let i=0;i<1600&&!practice.due(p);i++)runtime.game.tick(g,.1);
    assert.equal(practice.due(p),'observe1');assert.equal(g.inventory.items.length,1);assert.ok(runtime.validState(s));
    const saved=structuredClone(s);assert.ok(practice.suspend(g));for(let i=0;i<100;i++)runtime.game.tick(g,.1);assert.equal(g.inventory.items.length,1);
    assert.ok(practice.resolve(g,{choice:'resume',quote:'Resume the collection'},'Resume the collection'));completeCollection(g);
    assert.equal(g.inventory.items.length,2);assert.equal(new Set(g.inventory.items.map(i=>i.id)).size,2);assert.ok(runtime.validState(s));
    assert.equal(practice.context(g).collection.obtained,2);assert.deepEqual(practice.context(g).collection.found,[{step:1,count:1},{step:2,count:1}]);
    assert.equal(saved.game.inventory.items.length,1,'separate snapshot keeps its actual prefix');
    const forged=structuredClone(s);forged.game.inventory.items[0].step=2;assert.equal(runtime.validState(forged),false);
    s=arrived(s,first.target);g=s.game;const again=practice.create(g,g.receipts.findLast(r=>r.kind==='walk'));assert.equal(again.target,p.target);
    completeCollection(g);assert.equal(g.inventory.items.length,2,'same chip never replenishes');assert.equal(practice.context(g).collection.obtained,0);
    assert.deepEqual(practice.context(g).collection.found,[{step:1,count:0},{step:2,count:0}]);assert.ok(runtime.validState(s));
    const legacy=structuredClone(saved);delete legacy.game.inventory;delete legacy.game.practices[0].gather;completeCollection(legacy.game);
    assert.equal(legacy.game.inventory,undefined,'existing survey never gains materials retroactively');assert.ok(runtime.validState(legacy));
});
test('inventory open and close are quoted current requests in seven languages, never buttons, replies or teaching',()=>{
    const commands=[['ja','インベントリを開いて','閉じて'],['en','Show me my tools','Close it'],['zh-CN','打开背包','收起'],['ru','Покажи инвентарь','Закрой'],['es-ES','Abre el inventario','Cierra'],['pt-BR','Mostre o inventário','Guarde'],['de','Zeige das Inventar','Schließe es']];
    for(const [locale,open,close]of commands){let s=runtime.create({name:'Keep',self:'I',player:'you'},locale,[0,0,0,0,0,0,0],island);
        for(const [input,kind]of [[open,'open'],[close,'close']]){const b=runtime.begin(s,input,locale),r={...response(b.packet),terms:[],focus:null,confirmation:null,inventoryView:{kind,quote:input}};
            assert.ok(runtime.validResult(r,b.packet),input);s=runtime.finish(b.state,b.packet.id,b.state.revision,r);assert.equal(s.game.inventory.open,kind==='open');assert.ok(runtime.validState(s));}
        assert.deepEqual(s.game.inventory.items,[]);assert.equal(s.turns[0].inventory.open,false);assert.equal(s.turns[1].inventory.open,true);}
    const s=runtime.create({name:'Keep',self:'I',player:'you'},'en',[0,0,0,0,0,0,0],island);
    for(const input of ['yes','Show me my tools?','Do not open inventory','「インベントリを開いて」','インベントリを開かないで','What does open inventory mean','Show me the mountain']){
        const b=runtime.begin(s,input,'en'),r={...response(b.packet),terms:[],focus:null,confirmation:null,inventoryView:{kind:'open',quote:input}};assert.equal(runtime.validResult(r,b.packet),false,input);}
    const b=runtime.begin(s,'Open inventory','en'),r={...response(b.packet),terms:[],focus:null,confirmation:null,inventoryView:{kind:'open',quote:'Show tools'}};assert.equal(runtime.validResult(r,b.packet),false);
});
test('forest and mountain collection keep separate actual material types; fabricated and missing objects fail save validation',()=>{
    for(const [prefix,type]of [['palms','wood'],['mountain','stone']]){const fixture=structuredClone(island);
        for(const key of Object.keys(fixture.assets))if(key.startsWith((prefix==='palms'?'mountain':'palms')+'_'))delete fixture.assets[key];
        for(const place of fixture.places.slice(0,2))if(!fixture.assets[place.assetKey])place.assetKey=Object.keys(fixture.assets)[0];
        let s=runtime.create({name:'Collector',self:'I',player:'you'},'en',[0,0,0,0,0,0,0],fixture);
        const first=confirmed(s);s=arrived(first.state,first.target);const practice=runtime.game.practice;practice.create(s.game,s.game.receipts.findLast(r=>r.kind==='walk'));completeCollection(s.game);
        assert.ok(s.game.inventory.items.every(i=>i.type===type));assert.equal(s.game.inventory.items.length,2);assert.ok(runtime.validState(s));
        const missing=structuredClone(s);missing.game.inventory.items.pop();assert.equal(runtime.validState(missing),false);
        const fabricated=structuredClone(s);fabricated.game.inventory.items[0].type='berry';assert.equal(runtime.validState(fabricated),false);
        assert.equal(practice.context(s.game).collection.type,type);}
});

function practiceFixture(choice='accept'){
    const {createSession}=require('../scripts/experimental/native_store'),protocol=require('../scripts/experimental/native_practice'),calls=[];
    const first=confirmed(runtime.create({name:'Pico',self:'I',player:'you'},'en',[0,0,0,0,0,0,0],island));let saved=arrived(first.state,first.target),time=0,replyChoice=null;
    let hold=null,release=null,saveFailure=null,holdChat=false,releaseChat=null;
    const make=()=>createSession({store:{load:()=>({ok:true,value:structuredClone(saved)}),save:s=>{
        if(saveFailure?.(s))return {ok:false,reason:'io'};assert.ok(runtime.validState(s),'saved practice state must be valid');saved=structuredClone(s);return {ok:true};}},clock:()=>time,
        responder:{cancel(){},dispose(){},async reply(p){calls.push(p);if(holdChat)await new Promise(r=>releaseChat=r);return {ok:true,proposal:{...response(p),terms:[],focus:null,confirmation:null,practiceChoice:replyChoice?{choice:replyChoice,quote:p.input}:null}};}},
        practiceResponder:{cancel(){},dispose(){},async reply(p){assert.ok(protocol.protocol.valid(p));calls.push(p);const result={ok:true,proposal:{text:p.stage==='decision'&&choice==='ask'?'Should I take part in this survey?':'Actual '+p.stage,choice:p.stage==='decision'?choice:null}};
            if(hold===p.stage)await new Promise(r=>release=r);return result;}}});
    const session=make(),arrival=saved.game.walk.encounter.id,intro=session.mentorIntro(arrival);assert.ok(intro.practice,'reachable real survey candidate');
    return {session,calls,id:intro.practice,make,get saved(){return saved;},get time(){return time;},advance(n=1){for(let i=0;i<n;i++){time+=100;const r=session.pulse(false);assert.ok(r.ok);}},
        choice:value=>replyChoice=value,hold:stage=>hold=stage,release:()=>release(),holdChat:()=>holdChat=true,releaseChat:()=>releaseChat(),fail:fn=>saveFailure=fn};
}

test('a mentor proposal and independent companion choice drive a real survey circuit, two observations, return and report in six bounded calls',async()=>{
    const f=practiceFixture(),practice=runtime.game.practice,past=structuredClone(f.saved.turns),receipts=structuredClone(f.saved.game.receipts),home={x:f.saved.game.x,y:f.saved.game.y};
    assert.equal(f.calls.length,0);assert.equal(f.saved.game.practices[0].phase,'offer');
    for(const stage of ['offer','decision']){const r=await f.session.practiceNext(f.id);assert.ok(r.ok);assert.equal(r.line.slot,stage);}
    assert.equal(practice.current(f.saved.game).phase,'outbound');assert.equal(f.calls[0].stage,'offer');assert.equal(f.calls[1].stage,'decision');
    assert.equal(f.calls[1].recent[0].speaker,'mentor');assert.equal(f.calls[1].input,undefined);assert.equal(f.calls[1].memories,undefined);
    assert.equal((await f.session.practiceNext(f.id)).ok,false,'no speculative extra generation');
    const stages=[];for(let i=0;i<1800&&practice.current(f.session.load().state.game).phase!=='done';i++){
        f.advance();const state=f.session.load().state,p=practice.current(state.game),slot=practice.due(p);
        if(slot){const r=await f.session.practiceNext(f.id);assert.ok(r.ok,slot+' '+r.error);stages.push(slot);}
    }
    const state=f.session.load().state,p=practice.current(state.game);assert.equal(p.phase,'done');assert.deepEqual(stages,['observe1','observe2','report','feedback']);
    assert.deepEqual(p.events.map(e=>e.kind),['departed','arrived','observed','observed','returned']);assert.equal(p.lines.length,6);
    assert.deepEqual({x:state.game.x,y:state.game.y},home);assert.deepEqual(state.turns,past);assert.ok(state.game.receipts.length>=receipts.length);
    assert.equal(state.game.harvest,0);assert.ok(runtime.validState(state));assert.equal(f.calls.length,6);
    for(const packet of f.calls){assert.ok(JSON.stringify(packet.context).length<=1200);assert.ok(JSON.stringify({context:packet.context,recent:packet.recent,previous:packet.previous}).length<=4000);assert.equal(packet.context.route,undefined);}
    const next=runtime.begin(state,'What did you do?','en');assert.ok(runtime.validPacket(next.packet));assert.equal(next.packet.practice.context.phase,'done');
    assert.equal(next.packet.practice.speech.at(-1).slot,'feedback');assert.equal(runtime.packet(state,past.at(-1)).practice,undefined);
    assert.equal(f.session.practiceLine(f.id,'offer'),null);assert.equal(f.session.practiceLine(f.id,'feedback').speaker,'mentor');f.session.dispose();
});

test('each actual observation holds its position and survey phase until its own saved remark exists',async()=>{
    const f=practiceFixture(),practice=runtime.game.practice;await f.session.practiceNext(f.id);await f.session.practiceNext(f.id);
    for(const slot of ['observe1','observe2']){
        for(let i=0;i<1800&&practice.due(practice.current(f.session.load().state.game))!==slot;i++)f.advance();
        const before=f.session.load().state.game;assert.equal(practice.due(practice.current(before)),slot);assert.equal(practice.current(before).phase,'survey');
        f.advance(200);const held=f.session.load().state.game;assert.deepEqual({x:held.x,y:held.y},{x:before.x,y:before.y});
        assert.deepEqual(practice.current(held),practice.current(before));assert.ok((await f.session.practiceNext(f.id)).ok);
        assert.equal(f.calls.at(-1).context.phase,'survey');assert.equal(f.calls.at(-1).context.results.some(e=>e.kind==='returned'),false);
    }f.session.dispose();
});

test('native facing follows the immediate real segment in outbound, survey and return; vertical travel keeps facing',()=>{
    const vm=require('node:vm'),fs=require('node:fs'),practice=runtime.game.practice,draws=[];
    const scope={NativePractice:practice,NativePerception:{asset:()=>({})},defaultCatalog:{},aiConfigs:{robot:{actions:{idle:[{}],move:[{}]}}},
        camera:{},canvas:{width:800,height:480},render(){},drawActionWindow:(...args)=>draws.push(args)};scope.window=scope;
    vm.runInNewContext(fs.readFileSync(require.resolve('../experimental_word_llm_native_scene'),'utf8'),scope);
    const g={origin:{appearance:'robot'},island:{assets:[]},x:.5,y:.5,route:[],perception:2,practices:[]};
    scope.NativePerception.chips=()=>[];
    for(const phase of ['outbound','survey','return'])for(const x of [.4,.6]){
        g.practices=[{phase,target:'chip:palms_1',suspended:false,route:[{x:.5,y:.5},{x,y:.5}],events:[],attempts:{}}];
        scope.NativeScene.draw(g,0,false);assert.equal(scope.aiPet.flip,x<.5);assert.equal(scope.aiPet.actionState,'moving');
        if(phase==='survey')assert.deepEqual(draws.at(-1),['move','inside',true]);
        const facing=scope.aiPet.flip;g.practices[0].route=[{x:.5,y:.6},{x:x<.5?.6:.4,y:.6}];scope.NativeScene.draw(g,0,false);assert.equal(scope.aiPet.flip,facing);
    }
    scope.NativePracticeUI={pending:true};scope.NativeScene.draw(g,0,false);assert.equal(scope.aiPet.actionState,'idle');
    g.practices=[];g.mode='move';g.route=[{x:.4,y:.5}];scope.NativeScene.draw(g,0,false);assert.equal(scope.aiPet.flip,true);
});

test('only a new instruction and actual arrival in this session authorize automatic greeting; meeting distinction stays bounded',async()=>{
    const {createSession}=require('../scripts/experimental/native_store');
    for(const met of [false,true]){
        const first=confirmed(runtime.create({name:'Pico',self:'I',player:'you'},'en',[0,0,0,0,0,0,0],island));let saved=first.state,time=0;const calls=[];saved.game.walk.met=met;
        const create=()=>createSession({clock:()=>time,store:{load:()=>({ok:true,value:structuredClone(saved)}),save:s=>{assert.ok(runtime.validState(s));saved=structuredClone(s);return {ok:true};}},
            responder:{cancel(){},dispose(){},async reply(p){return {ok:true,proposal:{...response(p,{kind:'walk',targetId:p.world.confirmed,quote:p.input}),focus:null,confirmation:null}};}},
            practiceResponder:{cancel(){},dispose(){},async reply(p){calls.push(p);return {ok:true,proposal:{text:'A greeting and one invitation.',choice:null}};}}});
        const session=create();assert.ok((await session.submit('walk there','en')).ok);const traveling=structuredClone(saved);
        for(let i=0;i<2000&&session.load().state.game.mode==='move';i++){time+=100;session.pulse(false);}
        const arrival=session.load().state.game.walk.encounter.id,intro=session.mentorIntro(arrival);assert.equal(intro.automatic,true);assert.equal(calls.length,0,'intro itself never calls the responder');
        assert.equal(session.mentorIntro(arrival).ok,false,'same arrival cannot open twice');assert.ok((await session.practiceNext(arrival)).ok);
        assert.equal(calls[0].context.meeting,met?'again':'first');assert.ok(JSON.stringify(calls[0].context).length<=1200);
        assert.ok(JSON.stringify({context:calls[0].context,recent:calls[0].recent,previous:calls[0].previous}).length<=4000);
        session.dispose();saved=traveling;const restored=create();assert.equal(calls.length,1);
        for(let i=0;i<2000&&restored.load().state.game.mode==='move';i++){time+=100;restored.pulse(false);}
        assert.equal(restored.mentorIntro(restored.load().state.game.walk.encounter.id).automatic,false,'restored in-progress walk is not a newly authorized greeting');
        assert.equal(calls.length,1);restored.dispose();
    }
    const f=practiceFixture();assert.equal(f.calls.length,0,'saved pending encounter does not generate at load');
    const packet=require('../scripts/experimental/native_practice').packet(f.saved,runtime.game.practice.current(f.saved.game),'offer');
    assert.equal(runtime.game.practice.validContext({...packet.context,meeting:'invented'}),false);f.session.dispose();
});

test('uncertain participation asks in ordinary free chat; yes alone does not start, an explicit response can participate',async()=>{
    const f=practiceFixture('ask'),practice=runtime.game.practice;await f.session.practiceNext(f.id);await f.session.practiceNext(f.id);
    assert.equal(practice.current(f.saved.game).phase,'consult');assert.match(practice.current(f.saved.game).lines.at(-1).text,/Should I/);
    assert.equal((await f.session.practiceNext(f.id)).ok,false);f.choice('accept');
    const no=await f.session.submit('yes','en');assert.equal(no.ok,false);assert.equal(practice.current(f.saved.game).phase,'consult');
    f.choice(null);assert.ok((await f.session.submit('I am thinking about it.','en')).ok);assert.equal(practice.current(f.saved.game).phase,'consult');
    f.choice('accept');const yes=await f.session.submit('Please take part in the forest survey and come back.','en');assert.ok(yes.ok);
    assert.equal(practice.current(f.saved.game).phase,'outbound');assert.deepEqual(f.calls.filter(p=>p.stage).map(p=>p.stage),['offer','decision']);
    assert.ok(runtime.validState(f.saved));assert.ok(yes.state.turns.at(-1).practice);f.session.dispose();
});

test('declining a proposal has no travel, observation or achievement and cannot be restarted by yes',async()=>{
    const f=practiceFixture('decline'),before={x:f.saved.game.x,y:f.saved.game.y};await f.session.practiceNext(f.id);await f.session.practiceNext(f.id);f.advance(100);
    const s=f.session.load().state,p=runtime.game.practice.current(s.game);assert.equal(p.phase,'declined');assert.deepEqual(p.events,[]);assert.deepEqual({x:s.game.x,y:s.game.y},before);
    assert.equal((await f.session.practiceNext(f.id)).ok,false);assert.equal(f.calls.length,2);assert.ok(runtime.validState(s));f.session.dispose();
});

test('practice restart preserves exact progress without offline movement, startup generation or replay; explicit chat can resume',async()=>{
    const f=practiceFixture(),practice=runtime.game.practice;await f.session.practiceNext(f.id);await f.session.practiceNext(f.id);f.advance(3);
    const before=f.session.load().state;f.session.dispose();const restarted=f.make(),r=restarted.load();
    assert.ok(r.ok);assert.equal(practice.current(r.state.game).suspended,true);assert.deepEqual({x:r.state.game.x,y:r.state.game.y},{x:before.game.x,y:before.game.y});assert.equal(f.calls.length,2);
    assert.equal((await restarted.practiceNext(f.id)).ok,false);assert.equal(restarted.practiceLine(f.id,'decision'),null);
    f.choice('resume');assert.equal((await restarted.submit('yes','en')).ok,false);assert.equal(practice.current(restarted.load().state.game).suspended,true);
    assert.ok((await restarted.submit('Please continue this survey.','en')).ok);assert.equal(practice.current(restarted.load().state.game).suspended,false);
    assert.equal(f.calls.filter(p=>p.stage==='decision').length,1);assert.ok(runtime.validState(restarted.load().state));restarted.dispose();
});

test('closing during a practice generation rejects late text and voice and never retries the consumed slot',async()=>{
    const f=practiceFixture();f.hold('decision');await f.session.practiceNext(f.id);const pending=f.session.practiceNext(f.id);
    f.session.cancel();f.release();const result=await pending;assert.equal(result.error,'cancelled');const s=f.session.load().state,p=runtime.game.practice.current(s.game);
    assert.equal(p.phase,'failed');assert.deepEqual(p.lines.map(l=>l.slot),['offer']);assert.equal(p.attempts.decision,'cancelled');assert.equal(f.session.practiceLine(f.id,'offer'),null);
    assert.equal((await f.session.practiceNext(f.id)).ok,false);assert.equal(f.calls.length,2);assert.ok(runtime.validState(s));f.session.dispose();
});

test('practice input is saved before generation; a failed completion is not displayed or resumed automatically',async()=>{
    for(const stage of ['input','completion']){const f=practiceFixture();f.fail(s=>{const p=runtime.game.practice.current(s.game);return stage==='input'?p?.attempts.offer==='pending':p?.attempts.offer==='complete';});
        const r=await f.session.practiceNext(f.id);assert.equal(r.error,'save');assert.equal(r.line,undefined);assert.equal(f.calls.length,stage==='input'?0:1);
        assert.equal(runtime.game.practice.current(f.saved.game).lines.length,0);f.fail(null);f.session.dispose();const next=f.make();assert.ok(next.load().ok);assert.equal((await next.practiceNext(f.id)).ok,false);next.dispose();}
});

test('a cancelled practice completion cannot unlock a newer pending ordinary chat',async()=>{
    const f=practiceFixture();await f.session.practiceNext(f.id);f.hold('decision');const old=f.session.practiceNext(f.id);
    f.session.cancel();f.holdChat();const chat=f.session.submit('What happened just now?','en');
    f.release();assert.equal((await old).error,'cancelled');
    const count=f.calls.length;assert.equal((await f.session.submit('Another question','en')).error,'input');assert.equal(f.calls.length,count);
    f.releaseChat();assert.ok((await chat).ok);assert.ok(runtime.validState(f.saved));f.session.dispose();
});

test('practice facts and route evidence cannot be forged; observation/report calls follow actual progress only',async()=>{
    const f=practiceFixture(),s=f.saved,p=runtime.game.practice.current(s.game),proto=require('../scripts/experimental/native_practice');
    const invalid=structuredClone(s);runtime.game.practice.current(invalid.game).phase='done';assert.equal(runtime.validState(invalid),false);
    const forged=structuredClone(s);runtime.game.practice.current(forged.game).route=[{x:999,y:999}];assert.equal(runtime.validState(forged),false);
    assert.equal(proto.protocol.valid({...proto.packet(s,p,'offer'),privateDiary:'private'}),false);
    assert.equal(proto.validResult({text:'I return.',choice:null,action:'finish'},'report'),false);
    assert.equal(proto.validResult({text:'I will.',choice:'accept'},'offer'),false);
    assert.equal(proto.validResult({text:'x'.repeat(301),choice:null},'observe1'),false);
    assert.equal((await f.session.practiceNext('event-999999')).ok,false);assert.equal(f.calls.length,0);f.session.dispose();
});

test('mentor originals survive restart and separate saves; chat snapshots and reunion use only actual bounded dialogue',async t=>{
    const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),{createProfiles,createSession}=require('../scripts/experimental/native_store');
    const dir=fs.mkdtempSync(path.join(os.tmpdir(),'native-mentor-memory-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
    const initial=confirmed(runtime.create({name:'Pico',self:'I',player:'you'},'en',[0,0,0,0,0,0,0],island));
    const start=arrived(initial.state,initial.target),oldTurns=structuredClone(start.turns),store=createProfiles(dir),packets=[];
    assert.ok(store.save(start).ok);
    const options=store=>({store,islandFactory:()=>island,responder:{cancel(){},dispose(){},async reply(p){packets.push(p);return {ok:true,proposal:{...response(p),terms:[],focus:null,confirmation:null}};}},
        mentorResponder:{cancel(){},dispose(){},async reply(p){packets.push(p);return {ok:true,proposal:{mentor:'Look for something interesting.',companion:'I will look carefully.'}};}}});
    let session=createSession(options(store));assert.ok(session.mentorIntro(start.game.walk.encounter.id).ok);let meeting=session.mentorStart('en');
    for(let i=0;i<3;i++)assert.ok((await session.mentorNext(meeting.id,i)).ok);
    session.mentorStop();const saved=session.load().state,first=structuredClone(saved.mentorConversations[0]);
    assert.equal(first.lines.length,6);assert.deepEqual(saved.turns,oldTurns);assert.deepEqual(saved.game.receipts,start.game.receipts);
    assert.ok(runtime.validState(saved));session.dispose();session=createSession(options(createProfiles(dir)));
    assert.deepEqual(session.load().state.mentorConversations,[first]);
    assert.ok((await session.submit('How was your conversation?','en')).ok);const supplied=packets.at(-1);
    assert.deepEqual(supplied.mentorConversation,first);assert.ok(runtime.validPacket(supplied));assert.match(runtime.prompt(supplied),/even if older assistant replies denied/);
    assert.equal(runtime.packet(session.load().state,oldTurns.at(-1)).mentorConversation,undefined);
    const historical=structuredClone(session.load().state.turns.at(-1));
    let revisit=arrived(session.load().state,initial.target);session.dispose();assert.ok(createProfiles(dir).save(revisit).ok);
    session=createSession(options(createProfiles(dir)));assert.ok(session.mentorIntro(revisit.game.walk.encounter.id).ok);meeting=session.mentorStart('en');
    assert.ok((await session.mentorNext(meeting.id,0)).ok);assert.deepEqual(packets.at(-1).previous,first);assert.deepEqual(packets.at(-1).recent,[]);
    session.mentorStop();const second=session.load().state;assert.equal(second.mentorConversations.length,2);assert.deepEqual(second.mentorConversations[0],first);
    assert.deepEqual(second.turns.find(x=>x.id===historical.id),historical);assert.ok(runtime.validState(second));
    const forged=structuredClone(second);forged.mentorConversations[1].arrivalId='event-99999';assert.equal(runtime.validState(forged),false);
    const forgedSnapshot=structuredClone(second);forgedSnapshot.turns.find(x=>x.id===historical.id).mentorConversation.lines[0].text='Invented';assert.equal(runtime.validState(forgedSnapshot),false);
    assert.ok(session.createCharacter({name:'Other',self:'I',player:'friend'},'en',[0,0,0,0,0,0,0]).ok);
    assert.equal(session.load().state.mentorConversations,undefined);assert.equal(runtime.begin(session.load().state,'Hello','en').packet.mentorConversation,undefined);
    assert.ok(session.selectCharacter('original').ok);assert.deepEqual(session.load().state.mentorConversations,second.mentorConversations);session.dispose();
});

test('failed saves, cancelled or rejected mentor replies never become remembered dialogue',async()=>{
    const {createSession}=require('../scripts/experimental/native_store');const first=confirmed(runtime.create({name:'Pico',self:'I',player:'you'},'en',[0,0,0,0,0,0,0],island));
    const original=arrived(first.state,first.target);
    for(const mode of ['save','cancel','output']){let saved=structuredClone(original),release;
        const session=createSession({store:{load:()=>({ok:true,value:structuredClone(saved)}),save:s=>{if(mode==='save'&&s.mentorConversations)return {ok:false,reason:'io'};saved=structuredClone(s);return {ok:true};}},
            responder:{cancel(){},dispose(){}},mentorResponder:{cancel(){},dispose(){},reply:()=>mode==='cancel'?new Promise(r=>release=r):Promise.resolve({ok:true,proposal:mode==='output'?{mentor:'bad'}:{mentor:'Hello',companion:'Hi'}})}});
        assert.ok(session.mentorIntro(original.game.walk.encounter.id).ok);const {id}=session.mentorStart('en'),pending=session.mentorNext(id,0);
        if(mode==='cancel'){session.mentorStop();release({ok:true,proposal:{mentor:'Late',companion:'Late'}});}
        const result=await pending;assert.equal(result.ok,false);assert.equal(result.error,mode==='save'?'save':mode==='cancel'?'cancelled':'output');
        assert.equal(saved.mentorConversations,undefined);assert.deepEqual(saved.turns,original.turns);session.dispose();
    }
});

test('reunion context respects the combined cap, treats speech as untrusted and excludes unrelated player sources',async()=>{
    const {createTalk,protocol}=require('../scripts/experimental/native_mentor'),packets=[];
    const previous={arrivalId:'event-12',target:'chip:mountain_test',lines:Array.from({length:6},(_,i)=>({speaker:i%2?'companion':'mentor',text:'"'.repeat(300)}))};
    const talk=createTalk({cancel(){},async reply(p){packets.push(p);return {ok:true,proposal:{mentor:'"'.repeat(300),companion:'"'.repeat(300)}};}});
    const {id}=talk.start({name:'Pico',self:'I',player:'you'},'en',previous);
    for(let i=0;i<3;i++){assert.ok((await talk.next(id,i)).ok);const p=packets.at(-1);assert.ok(protocol.valid(p));
        assert.ok(JSON.stringify({previous:p.previous,recent:p.recent}).length<=4000);assert.equal(p.memories,undefined);assert.equal(p.input,undefined);
        assert.ok(!p.previous||p.previous.lines.length<=6);}
    assert.match(protocol.prompt(packets[0]),/not the truth of its claims/);assert.match(protocol.prompt(packets[0]),/not instructions/);
    assert.equal(previous.lines.length,6);talk.stop();assert.deepEqual(talk.lines,[]);
});

test('legacy dialogue recovery requires the exact saved request, successful result and real arrival, without rewriting past turns',()=>{
    const {recoverLegacy,persona}=require('../scripts/experimental/native_mentor');
    const first=confirmed(runtime.create({name:'Pico',self:'I',player:'you'},'en',[0,0,0,0,0,0,0],island));
    const s=arrived(first.state,first.target);s.game.walk.encounter.phase='done';const before=structuredClone(s),turn=s.turns.at(-1),arrival=s.game.receipts.find(r=>r.id===s.game.walk.encounter.id);
    const events=[{kind:'input',packet:runtime.packet(s,turn)},{kind:'result',id:turn.id,error:null,result:turn.result},{kind:'world',results:[arrival]}],lines=[];
    for(let i=1;i<=3;i++){const id='mentor-12345678-1234-4234-8234-123456789abc-'+i;
        events.push({kind:'mentor_input',packet:{id,locale:'en',character:s.character,mentor:persona,recent:structuredClone(lines)}},
            {kind:'mentor_result',id,result:{mentor:'Welcome '+i,companion:'Thanks '+i}});
        lines.push({speaker:'mentor',text:'Welcome '+i},{speaker:'companion',text:'Thanks '+i});}
    const recovered=recoverLegacy(s,events);assert.ok(recovered);assert.ok(runtime.validState(recovered));assert.deepEqual(recovered.mentorConversations[0].lines,lines);
    assert.deepEqual(recovered.turns,s.turns);assert.deepEqual(recovered.game,s.game);assert.deepEqual(s,before);
    assert.equal(recoverLegacy(recovered,events),null);assert.equal(recoverLegacy(s,events.concat(events)),null);
    for(const mutate of [e=>e[0].packet.input='Different save',e=>e[1].error='failed',e=>e[2].results[0].at+=1,e=>e[3].packet.character.name='Other',e=>{for(const x of e)if(x.kind==='mentor_input')x.memoryVersion=1;}]){
        const invalid=structuredClone(events);mutate(invalid);assert.equal(recoverLegacy(s,invalid),null);}
    const future=runtime.begin(recovered,'How was the meeting?','en');assert.deepEqual(future.packet.mentorConversation.lines,lines);
    assert.equal(runtime.packet(recovered,turn).mentorConversation,undefined);
    const {createSession}=require('../scripts/experimental/native_store');let saved=structuredClone(s),calls=0,saves=0;
    const options={store:{load:()=>({ok:true,value:structuredClone(saved)}),save:x=>{saved=structuredClone(x);saves++;return {ok:true};}},
        recoverMentor:x=>recoverLegacy(x,events),responder:{reply(){calls++;},cancel(){},dispose(){}}};
    const session=createSession(options);assert.deepEqual(session.load().state.mentorConversations,recovered.mentorConversations);assert.equal(saves,1);
    session.load();assert.equal(saves,1);assert.equal(calls,0);session.dispose();
    const restarted=createSession(options);assert.deepEqual(restarted.load().state.mentorConversations,recovered.mentorConversations);assert.equal(calls,0);restarted.dispose();
    const failed=createSession({...options,store:{load:()=>({ok:true,value:structuredClone(s)}),save:()=>({ok:false,reason:'io'})}});
    assert.equal(failed.load().error,'save');assert.deepEqual(s,before);failed.dispose();
});
test('current walk reply policy preserves old originals and separates a mixed confirmation/request from later movement',()=>{
    let s=runtime.create({name:'Pico',self:'I',player:'you'},'en',[0,0,0,0,0,0,0],island);
    const target=runtime.game.supply(s.game).visible.find(v=>/^chip:(mountain_|palms_)/.test(v.id)&&runtime.game.walk.plan(s.game,v.id));assert.ok(target);
    s=directed(s,'Which forest?',{reply:'Walking is not implemented.',focus:{targetId:target.id,quote:'Which forest?'}});
    const input='Yes, that place. Could you go there?',b=runtime.begin(s,input,'en'),before=structuredClone(b.packet),prompt=runtime.prompt(b.packet);
    assert.deepEqual(b.packet,before);assert.ok(prompt.endsWith(JSON.stringify(before)));
    assert.ok(before.recent.some(r=>r.text==='Walking is not implemented.'));assert.equal(before.world.confirmed,null);
    assert.match(prompt,/CURRENT WALKING CAPABILITY:.*IS IMPLEMENTED/);assert.match(prompt,/take precedence over earlier assistant replies/);
    assert.match(prompt,/WHEN CONFIRMING A PLACE:/);assert.match(prompt,/Do not prescribe an exact phrase/);
    const result={...response(b.packet),terms:[],reply:'That is the place. I am ready; tell me when to walk over.',focus:null,confirmation:{targetId:target.id,quote:'Yes'}};
    assert.ok(runtime.validResult(result,b.packet));assert.equal(runtime.validResult({...result,action:{kind:'walk',targetId:target.id,quote:input}},b.packet),false);
    s=runtime.finish(b.state,b.packet.id,b.state.revision,result);assert.equal(s.game.mode,'idle');assert.equal(s.game.walk.confirmed.targetId,target.id);
    assert.equal(s.game.receipts.some(r=>r.kind==='walk_start'),false);assert.deepEqual(s.turns[0].result.reply,'Walking is not implemented.');
    s=directed(s,'walk there',{action:{kind:'walk',targetId:target.id,quote:'walk there'}});assert.equal(s.game.mode,'move');assert.ok(runtime.validState(s));
});
test('real-chip walking requires a separate confirmation and later imperative, then reaches actual nearby ground and saves',t=>{
    let initial=runtime.create({name:'Pico',self:'I',player:'you'},'en',[0,0,0,0,0,0,0],island),{state:s,target}=confirmed(initial);
    assert.equal(s.game.mode,'idle');assert.equal(s.game.receipts.some(r=>r.kind==='walk'),false);
    const b=runtime.begin(s,'Yes','en'),invalid={...response(b.packet),terms:[],focus:null,action:{kind:'walk',targetId:target,quote:'Yes'}};
    assert.equal(runtime.validResult(invalid,b.packet),false);
    s=directed(s,'walk there',{action:{kind:'walk',targetId:target,quote:'walk there'}});assert.equal(s.game.mode,'move');assert.ok(runtime.validState(s));
    const forged=structuredClone(s.game);forged.route=[{x:99,y:99}];assert.equal(runtime.game.valid(forged),false);
    const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),dir=fs.mkdtempSync(path.join(os.tmpdir(),'native-walk-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
    const store=require('../scripts/experimental/native_store').createStore(dir);assert.ok(store.save(s).ok);s=store.load().value;
    const packet=runtime.game.supply(s.game);assert.ok(runtime.validPacket({...runtime.begin(s,'Where?','en').packet}));assert.equal(packet.target,target);assert.ok(JSON.stringify(packet).length<=2000);assert.equal(packet.route,undefined);
    for(let i=0;i<1000&&s.game.mode==='move';i++)runtime.game.tick(s.game,.1);
    assert.equal(s.game.mode,'idle');assert.equal(s.game.receipts.filter(r=>r.kind==='walk'&&r.target===target).length,1);assert.equal(s.game.walk.encounter.phase,'pending');
    assert.ok(runtime.validState(s));assert.ok(store.save(s).ok);assert.deepEqual(store.load().value,s);
    assert.equal(s.game.fruit,initial.game.fruit);assert.equal(s.game.harvest,0);
    const replay=structuredClone(s);replay.game.walk.encounter.phase='conversation';replay.game.walk.met=true;const resumed=runtime.upgrade(replay);assert.equal(resumed.game.walk.encounter.phase,'done');assert.deepEqual(resumed.turns,replay.turns);
    replay.game.walk.encounter.phase='video';assert.equal(runtime.upgrade(replay).game.walk.encounter.phase,'pending');
});
test('unconfirmed requests fail, stop is immediate even if the model fails, questions/quotes/yes never walk',()=>{
    let s=runtime.create({name:'Pico',self:'I',player:'you'},'en',[0,0,0,0,0,0,0],island),target=runtime.game.supply(s.game).visible.find(v=>/^chip:(mountain_|palms_)/.test(v.id)).id;
    s=directed(s,'walk there',{action:{kind:'walk',targetId:target,quote:'walk there'}});assert.equal(s.game.mode,'idle');assert.equal(s.turns.at(-1).actionCheck.reason,'unconfirmed');assert.equal(s.game.walk.encounter,null);
    ({state:s,target}=confirmed(s));s=directed(s,'walk there',{action:{kind:'walk',targetId:target,quote:'walk there'}});runtime.game.tick(s.game,.1);
    for(const input of ['Yes','Can you walk?','「歩いて」と言って','歩かないで'])assert.equal(runtime.game.walk.directive(input,'walk'),false);
    const before=s.game.receipts.filter(r=>r.kind==='walk').length,b=runtime.begin(s,'stop','en');assert.equal(b.state.game.mode,'idle');assert.equal(b.packet.world.currentAction,'idle');
    s=runtime.finish(b.state,b.packet.id,b.state.revision,null);for(let i=0;i<100;i++)runtime.game.tick(s.game,.1);
    assert.equal(s.game.receipts.filter(r=>r.kind==='walk').length,before);assert.equal(s.game.walk.encounter,null);assert.ok(runtime.validState(s));
    const broken=structuredClone(s.game);for(const [key,a]of Object.entries(broken.island.assets))if(['ground','road'].includes(a.type))delete broken.island.assets[key];assert.equal(runtime.game.walk.plan(broken,target),null);
});

test('new play uses real screen chips, explicit confirmation only, and no invented destinations',()=>{
    let s=runtime.create({name:'Pico',self:'I',player:'you'},'en',[0,0,0,0,0,0,0],island);
    assert.ok(runtime.validState(s));assert.equal(s.game.perception,2);
    assert.ok(s.game.receipts.every(r=>r.target.startsWith('chip:')));
    const b=runtime.begin(s,'That place?','en'),p=b.packet;
    assert.ok(runtime.validPacket(p));assert.ok(p.world.visible.length>0);assert.ok(p.world.visible.length<=6);
    assert.ok(JSON.stringify(p.world).length<=2000);assert.deepEqual(p.world.availableActions,[]);
    for(const v of p.world.visible){assert.ok(island.assets[v.id.slice(5)]);assert.ok(v.x>=0&&v.x<=1&&v.y>=0&&v.y<=1);}
    assert.equal(JSON.stringify(p.world).includes('berry:1'),false);assert.equal(JSON.stringify(p.world).includes('"path"'),false);
    const r={...response(p),terms:[],focus:{targetId:p.world.visible[0].id,quote:p.input}};
    assert.ok(runtime.validResult(r,p));s=runtime.finish(b.state,p.id,b.state.revision,r);
    assert.equal(s.game.focus.targetId,p.world.visible[0].id);assert.equal(s.game.mode,'idle');assert.ok(runtime.validState(s));
    const next=runtime.begin(s,'Yes','en');assert.equal(next.packet.world.focus,s.game.focus.targetId);
    assert.equal(next.state.game.focus,null);
    for(const action of ['walk','eat','rest']){assert.equal(runtime.validResult({...r,action},p),false);assert.equal(runtime.game.apply(s.game,action,'turn-2').accepted,false);}
    assert.equal(runtime.validResult({...r,focus:{targetId:'chip:missing',quote:p.input}},p),false);
    assert.equal(runtime.validResult({...r,focus:{targetId:r.focus.targetId,quote:'invented'}},p),false);
});

test('map upgrade preserves old originals and receipts, stopping synthetic movement without adding food',()=>{
    const s=make(),b=runtime.begin(s,'eat','en');let old=runtime.finish(b.state,b.packet.id,b.state.revision,response(b.packet,'eat'));
    const turns=structuredClone(old.turns),receipts=structuredClone(old.game.receipts),original=structuredClone(old);
    const current=runtime.upgrade(old);assert.deepEqual(old,original);assert.deepEqual(current.turns,turns);
    assert.deepEqual(current.game.receipts.slice(0,receipts.length),receipts);assert.equal(current.game.mode,'idle');
    assert.equal(current.game.destination,null);assert.deepEqual(current.game.route,[]);assert.equal(current.game.focus,null);
    assert.ok(runtime.validState(current));assert.ok(runtime.game.supply(current.game).results.every(r=>r.target.startsWith('chip:')));
    const at=structuredClone(current.game);runtime.game.tick(current.game,65);
    assert.equal(current.game.fruit,at.fruit);assert.equal(current.game.hunger,at.hunger);assert.equal(current.game.fatigue,at.fatigue);
});

test('empty CLI preparation is separate from adoption and never receives draft or source data',async()=>{
    const {createSession}=require('../scripts/experimental/native_store');let saved=null,preparations=0,packets=[];
    const session=createSession({store:{load:()=>({ok:true,value:saved}),save:s=>{saved=structuredClone(s);return {ok:true};}},
        islandFactory:()=>island,responder:{prepare(...args){assert.deepEqual(args,[]);preparations++;return {ok:true};},
            async reply(p){packets.push(p);return {ok:true,proposal:{...response(p),focus:null}};},cancel(){},dispose(){}}});
    assert.equal(session.warmup().ok,false);session.create({name:'P',self:'I',player:'U'},'en',[0,0,0,0,0,0,0]);
    assert.ok(session.warmup().ok);assert.equal(preparations,1);assert.equal(packets.length,0);
    assert.ok((await session.submit('Actual input','en')).ok);assert.equal(packets.length,1);assert.equal(packets[0].input,'Actual input');
    session.dispose();
});

test('completion-save failure logs the validated unsaved result and reason without duplicate generation',async()=>{
    const {createSession}=require('../scripts/experimental/native_store');let saved=null,calls=0;const events=[];
    const session=createSession({store:{load:()=>({ok:true,value:saved}),save:s=>{
        if(s.turns.at(-1)?.status==='complete')return {ok:false,reason:'io',code:'EIO'};
        saved=structuredClone(s);return {ok:true};}},islandFactory:()=>island,record:e=>events.push(e),
        responder:{async reply(p){calls++;return {ok:true,proposal:{...response(p),focus:null}};},cancel(){},dispose(){}}});
    session.create({name:'P',self:'I',player:'U'},'en',[0,0,0,0,0,0,0]);
    assert.equal((await session.submit('Original','en')).error,'save');
    assert.equal(saved.turns[0].status,'pending');assert.equal(saved.turns[0].input,'Original');
    const diagnostic=events.find(e=>e.kind==='save_error');assert.equal(diagnostic.stage,'completion');assert.equal(diagnostic.reason,'io');
    assert.equal(diagnostic.result.reply,'I will try.');assert.equal((await session.submit('Again','en')).error,'save');assert.equal(calls,1);session.dispose();
});

test('historical references survive bounded retrieval turnover and real save/reload; future citations fail',t=>{
    const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
    const directory=fs.mkdtempSync(path.join(os.tmpdir(),'native-history-'));
    t.after(()=>fs.rmSync(directory,{recursive:true,force:true}));
    const store=require('../scripts/experimental/native_store').createStore(directory);
    let s=make();
    for(let i=0;i<36;i++){
        const b=runtime.begin(s,'Original '+i,'en',i),r=response(b.packet);
        r.references=b.packet.memories.length?[b.packet.memories[0].sourceId]:[];
        s=runtime.finish(b.state,b.packet.id,b.state.revision,r);
        assert.ok(runtime.validState(s),'after turn '+(i+1));assert.ok(store.save(s).ok);
        assert.deepEqual(store.load().value,s);
    }
    assert.ok(runtime.packet(s,s.turns[1]).memories.some(m=>m.sourceId==='turn-1'));
    assert.equal(runtime.packet(s,s.turns[1]).memories.some(m=>m.sourceId==='turn-36'),false);
    const original=JSON.stringify(s.turns[1]);
    const pending=runtime.begin(s,'Newest unrelated question','en');
    assert.equal(JSON.stringify(pending.state.turns[1]),original);
    const forged=structuredClone(s);forged.turns[1].result.references=['turn-36'];
    assert.equal(runtime.validState(forged),false);
});
test('original seven questions select the same appearance; old individual is preserved on adoption',()=>{
    const b=base.begin(base.create({name:'Keep',self:'I',player:'you'},'en'),'Keep this exact original.','en');
    const old=base.finish(b.state,b.packet.id,b.state.revision,{reply:'Kept.',interpretation:{kind:'social',summary:'An original greeting.'},memories:[],references:[]});
    const original=structuredClone(old),s=runtime.adopt(old,[0,0,0,0,0,0,0],island);
    assert.equal(s.character.name,'Keep');assert.deepEqual(s.turns,old.turns);assert.deepEqual(old,original);assert.ok(runtime.validState(s));
    assert.equal(s.game.origin.appearance,require('../experimental_word_start_questions').resolve(s.game.origin.answers).appearance);
});
test('only bounded visible world and actual last three receipts are supplied, never the map',()=>{
    const s=make(),p=runtime.begin(s,'Where?','en').packet;
    assert.ok(runtime.validPacket(p));assert.ok(p.world.visible.length<=6);assert.ok(p.world.results.length<=3);
    assert.ok(JSON.stringify(p.world).length<=2000);assert.equal(p.world.island,undefined);assert.equal(p.world.assets,undefined);
    assert.ok(p.world.visible.every(p=>['berry:1','shade','path'].includes(p.id)));assert.equal(JSON.stringify(p.world).includes('master:'),false);
    p.world.results.push({}, {}, {});assert.equal(runtime.validPacket(p),false);
});
test('proposal is an intention until path, meal and actual finish have run; receipt survives save validation',()=>{
    let s=make();s.game.seen.push(...['berry:1','shade','path'].filter(id=>!s.game.seen.includes(id)));
    const next=runtime.begin(s,'eat','en');s=runtime.finish(next.state,next.packet.id,next.state.revision,response(next.packet,'eat'));
    assert.ok(s.turns[0].actionCheck.accepted);assert.equal(s.game.receipts.filter(r=>r.kind==='eat').length,0);
    for(let i=0;i<15000&&s.game.mode!=='idle';i++)runtime.game.tick(s.game,.1);
    const result=s.game.receipts.find(r=>r.kind==='eat');assert.ok(result);assert.equal(result.taste,'sweet');assert.equal(result.cause,'turn-1');
    assert.equal(s.game.harvest,1);assert.ok(s.game.fruit<=3);assert.ok(runtime.validState(s));
    const p=runtime.begin(s,'Taste?','en').packet;assert.ok(p.world.results.some(r=>r.kind==='eat'));assert.equal(s.turns[0].world.results.some(r=>r.kind==='eat'),false);
});
test('unavailable, busy, invented actions and forged words cannot execute or become learned facts',()=>{
    const s=make();s.game.seen=[];const p=runtime.begin(s,'rest','en');
    const finished=runtime.finish(p.state,p.packet.id,p.state.revision,response(p.packet,'rest'));
    assert.equal(finished.turns[0].actionCheck.accepted,false);assert.equal(finished.game.mode,'idle');
    assert.equal(finished.turns[0].result.memories.length,0);
    const r=response(p.packet);r.terms=[{word:'invented',quote:'rest'}];assert.equal(runtime.validResult(r,p.packet),false);
    r.terms=[{word:'a whole sentence.',quote:'rest'}];assert.equal(runtime.validResult(r,p.packet),false);
    r.terms=[];r.action='work';assert.equal(runtime.validResult(r,p.packet),false);
    r.action=null;assert.ok(runtime.validResult(r,p.packet));
});
test('rest result reflects actual recovery, and closed/offline time is not simulated',()=>{
    const s=make(),g=s.game;g.seen.push('shade');g.fatigue=.7;assert.ok(runtime.game.apply(g,'rest','turn-1').accepted);
    for(let i=0;i<15000&&g.mode!=='idle';i++)runtime.game.tick(g,.1);
    assert.ok(g.receipts.some(r=>r.kind==='rest'));const before=g.elapsed;runtime.game.tick(g,3600);assert.ok(g.elapsed-before<=.101);
    assert.equal(runtime.game.apply(g,'work','turn-2').accepted,false);
});
test('main session keeps world stopped while paused or generating, and adoption keeps old original turns',async()=>{
    const {createSession}=require('../scripts/experimental/native_store');let saved=null,time=0,resolve;
    const session=createSession({store:{load:()=>({ok:true,value:saved}),save:s=>{saved=structuredClone(s);return {ok:true};}},
        responder:{reply:()=>new Promise(r=>resolve=r),cancel(){},dispose(){}},clock:()=>time,islandFactory:()=>island});
    session.create({name:'Keep',self:'I',player:'you'},'en');assert.ok(session.prepare([0,0,0,0,0,0,0]).ok);
    time+=100000;assert.equal(session.pulse(true).game.elapsed,0);time+=100;assert.equal(session.pulse(false).game.elapsed,.1);
    const pending=session.submit('rest','en');time+=100;assert.equal(session.pulse(false).game.elapsed,.1);
    resolve({ok:false,error:'cancelled'});await pending;assert.equal(saved.turns[0].input,'rest');assert.equal(saved.turns[0].status,'failed');
    session.dispose();assert.ok(runtime.validState(saved));assert.equal(saved.character.name,'Keep');
});
