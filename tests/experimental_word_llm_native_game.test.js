'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const runtime=require('../experimental_word_llm_native_runtime'),base=require('../experimental_word_llm_native');
const island=require('../scripts/experimental/native_island').createIsland();
// Preserve the old physical-loop fixtures as compatibility tests for saved history.
const make=()=>({...base.create({name:'Pico',self:'I',player:'you'},'en'),version:2,game:runtime.game.create([0,0,0,0,0,0,0],island)});
const response=(p,action=null)=>({reply:'I will try.',interpretation:{kind:'request',summary:'A request.'},memories:[],references:[],terms:[{word:p.input,quote:p.input}],action});

const absence=runtime.game.practice.absence,epoch=Date.UTC(2026,10,27);
function awayFixture(quantity){let s=gatheringState();absence.install(s.game,epoch);const input='Collect wood in known forests while I am away'+(quantity?' '+quantity+' items':'');
    const b=runtime.begin(s,input,'en',epoch),target=b.packet.inventory.targets.find(t=>t.id.startsWith('chip:palms_')&&t.reachable).id;
    const away={kind:'start',type:'wood',targets:[target],quote:input,...(quantity?{quantity}:{})};
    s=runtime.finish(b.state,b.packet.id,b.state.revision,{...response(b.packet),terms:[],focus:null,confirmation:null,away});assert.ok(runtime.validState(s));return s;}
test('away reservation waits for a real departure; partial gathering and positions survive resume',()=>{
    const s=awayFixture(),g=s.game,j=absence.current(g);absence.advance(g,epoch+3600000);assert.equal(j.total,0);assert.equal(j.status,'reserved');
    absence.depart(g,epoch+3600000);absence.resume(g,epoch+3600000+300000);assert.equal(j.total,0);assert.equal(j.status,'paused');assert.equal(j.phase,'gather');assert.ok(j.timer>290000&&j.timer<300000);assert.notDeepEqual({x:g.x,y:g.y},j.home);assert.ok(runtime.validState(s));
    const timer=j.timer,position={x:g.x,y:g.y};absence.settle(g,epoch+7200000);assert.equal(j.timer,timer);assert.deepEqual({x:g.x,y:g.y},position);assert.ok(runtime.validState(s));
});
test('away loops beyond two, waits for resources, returns quantity exactly, and never ages needs',()=>{
    for(const quantity of [undefined,5]){const s=awayFixture(quantity),g=s.game,j=absence.current(g),needs=[g.hunger,g.fatigue,g.elapsed];absence.depart(g,epoch);absence.resume(g,epoch+8*3600000);
        assert.equal(j.total,quantity||9);assert.equal(g.inventory.items.length,j.total);assert.equal(new Set(g.inventory.items.map(i=>i.id)).size,j.total);assert.deepEqual([g.hunger,g.fatigue,g.elapsed],needs);assert.equal(j.status,quantity?'done':'paused');if(quantity)assert.deepEqual({x:g.x,y:g.y},j.home);assert.ok(runtime.validState(s));}
});
test('resource clocks have no full-bank, retain next recovery after second pickup, and ignore rollback',()=>{
    const g=awayFixture().game,target=absence.current(g).plans[0].target;absence.acquire(g,target,'wood','away-turn-1',1,epoch);absence.advance(g,epoch+1000);absence.acquire(g,target,'wood','away-turn-1',1,epoch+1000);
    const r=Object.values(g.absence.resources)[0];assert.equal(r.next,epoch+absence.HOUR);absence.advance(g,epoch+2*absence.HOUR);assert.equal(r.available,2);assert.equal(r.next,null);
    absence.advance(g,epoch+24*absence.HOUR);absence.acquire(g,target,'wood','away-turn-1',1,g.absence.now);assert.equal(r.next,epoch+25*absence.HOUR);const before=structuredClone(g.absence);absence.advance(g,epoch);assert.deepEqual(g.absence,before);
});
test('legacy material and spent IDs stay intact; no adoption-time offline yield',()=>{
    let s=freely(gatheringState(),'wood');completeCollection(s.game);const before=structuredClone(s.game.inventory);absence.install(s.game,epoch);assert.equal(absence.available(s.game,'chip:palms_gift','wood'),0);assert.deepEqual(s.game.inventory,before);assert.equal(absence.resume(s.game,epoch+24*absence.HOUR),null);assert.equal(s.game.inventory.items.length,2);assert.ok(runtime.validState(s));
});
test('regenerated normal gathering uses new IDs at unchanged survey speed and historical packets remain valid',()=>{
    let s=freely(gatheringState(),'wood');completeCollection(s.game);const old=s.game.inventory.items.map(i=>i.id);absence.install(s.game,epoch);absence.advance(s.game,epoch+2*absence.HOUR);
    s=freely(s,'wood');completeCollection(s.game);assert.equal(s.game.inventory.items.length,4);assert.deepEqual(s.game.inventory.items.slice(0,2).map(i=>i.id),old);assert.ok(s.game.inventory.items.slice(2).every(i=>i.id.includes(':r')));assert.ok(runtime.validState(s));const b=runtime.begin(s,'Show belongings','en',epoch+2*absence.HOUR);assert.ok(runtime.validState(b.state));assert.ok(runtime.validPacket(b.packet));
});
test('one recovered normal resource yields one item and records the second empty observation without fabricating a legacy item',()=>{
    let s=freely(gatheringState(),'wood');completeCollection(s.game);absence.install(s.game,epoch);absence.advance(s.game,epoch+absence.HOUR);s=freely(s,'wood');completeCollection(s.game);
    assert.equal(s.game.inventory.items.length,3);assert.equal(s.game.absence.attempts.length,2);assert.equal(s.game.absence.attempts[1].item,null);assert.ok(runtime.validState(s));assert.ok(runtime.validState(runtime.begin(s,'Show inventory','en',epoch+absence.HOUR).state));
});
test('long away quotes stay within budget without dropping the received compass location or inventing a quote',()=>{
    const pr=runtime.game.practice;let s=compassFixture();s=directed(s,'Call with the compass',{compass:{kind:'call',contact:'adventurer',purpose:'location',quote:'Call with the compass'}});finishLine(s.game,'offer',{text:'A'.repeat(300),agree:false});finishLine(s.game,'decision',{agree:false});absence.install(s.game,epoch);
    const input=('Collect stone while I am away '+'.'.repeat(300)).slice(0,300),b=runtime.begin(s,input,'en',epoch);
    s=runtime.finish(b.state,b.packet.id,b.state.revision,{...response(b.packet),terms:[],focus:null,away:{kind:'start',type:'stone',targets:['chip:mountain_gift'],quote:input}});absence.depart(s.game,epoch);absence.resume(s.game,epoch+8*absence.HOUR);s.game.absence.report.calendar=runtime.game.walk.calendar.snapshot(epoch,undefined,'en');
    const next=runtime.begin(s,'Where are we now?','en',epoch+8*absence.HOUR);assert.ok(runtime.validPacket(next.packet));assert.ok(runtime.validState(next.state));assert.ok(JSON.stringify(next.packet.inventory).length<=1200);assert.ok(JSON.stringify(next.packet.inventory.absence).length<=800);assert.ok(next.packet.inventory.compass.last);assert.ok(input.startsWith(next.packet.inventory.absence.quote));assert.ok(next.packet.world.reported);
});
test('away request rejects agreement, questions, invented candidates, busy work and ordinary gather conversion',()=>{
    const s=awayFixture(),b=runtime.begin(s,'Collect wood while I am away','en',epoch),target=absence.current(s.game).target||'chip:palms_gift';
    for(const input of ['Yes','Collect wood while I am away?','Do not collect wood while I am away','「留守の間に木材を集めて」'])assert.equal(absence.directive(input),false);
    const r={...response(b.packet),terms:[],focus:null,confirmation:null,away:{kind:'start',type:'wood',targets:['chip:palms_fake'],quote:b.packet.input}};assert.equal(runtime.validResult(r,b.packet),false);
    assert.equal(runtime.validResult({...r,away:null,gather:{targetId:target,type:'wood',quote:b.packet.input}},b.packet),false);
    assert.equal(absence.start(s.game,{kind:'start',type:'wood',targets:[target],quote:b.packet.input},b.packet.id,b.packet,runtime.game.walk,runtime.game.practice),false);
});
test('away intent and explicit continuation work in all seven languages',()=>{
    const requests=['留守の間に木材を集めて','Collect wood while I am away','我离开时收集木材','Собери дерево пока меня нет','Recolecta madera mientras estoy fuera','Colete madeira enquanto estou ausente','Sammle Holz während ich weg bin'];for(const input of requests)assert.ok(absence.directive(input),input);
    assert.ok(absence.directive('留守番採集を続けて','continue'));assert.equal(absence.directive('はい','continue'),false);
});
test('resume is once per qualifying main absence and not an old-save fabricated absence',()=>{
    const g=awayFixture().game;assert.equal(absence.resume(g,epoch),null);absence.depart(g,epoch);const report=absence.resume(g,epoch+300000);assert.ok(report);assert.equal(report.seconds,300);assert.equal(absence.resume(g,epoch+300001),null);assert.equal(g.absence.report.id,report.id);
});
test('long absence jumps event times without a day cap, and stone uses its actual mountain route',()=>{
    let s=awayFixture();absence.depart(s.game,epoch);absence.resume(s.game,epoch+30*24*absence.HOUR);assert.equal(absence.current(s.game).total,721);assert.ok(runtime.validState(JSON.parse(JSON.stringify(s))));
    s=gatheringState();absence.install(s.game,epoch);const input='Collect stone while I am away 3 items',b=runtime.begin(s,input,'en',epoch);
    s=runtime.finish(b.state,b.packet.id,b.state.revision,{...response(b.packet),terms:[],focus:null,away:{kind:'start',quote:input,type:'stone',targets:['chip:mountain_gift'],quantity:3}});absence.depart(s.game,epoch);absence.resume(s.game,epoch+4*absence.HOUR);assert.equal(s.game.inventory.items.length,3);assert.ok(s.game.inventory.items.every(i=>i.type==='stone'));assert.deepEqual({x:s.game.x,y:s.game.y},absence.current(s.game).home);assert.ok(runtime.validState(s));
});
test('physical record capacity stops safely with an explicit unsettled interval, not a time reward cap',()=>{
    const s=awayFixture(),until=epoch+100*365*24*absence.HOUR;absence.depart(s.game,epoch);absence.resume(s.game,until);const j=absence.current(s.game);
    assert.equal(j.reason,'capacity');assert.equal(j.status,'paused');assert.ok(j.total>10000);assert.ok(j.unsettled.from<j.unsettled.to);assert.equal(j.unsettled.to,until);assert.ok(JSON.stringify(s).length<16*1024*1024);assert.ok(runtime.validState(s));
});
test('explicit away continuation preserves slow partial time; return and cancellation keep acquired material',()=>{
    for(const kind of ['continue','return','cancel']){let s=awayFixture();absence.depart(s.game,epoch);absence.resume(s.game,epoch+15*60000);let j=absence.current(s.game);assert.equal(j.total,1);const timer=j.timer;
        const input=kind==='continue'?'Continue away gathering':kind==='return'?'Return home from gathering':'Cancel gathering';
        s=directed(s,input,{away:{kind,quote:input}});j=absence.current(s.game);assert.equal(j.total,1);if(kind==='continue')assert.equal(j.timer,timer);assert.ok(runtime.validState(s));
        absence.depart(s.game,epoch+20*60000);absence.resume(s.game,epoch+26*60000);assert.equal(j.total,kind==='continue'?2:1);if(kind==='return')assert.deepEqual({x:s.game.x,y:s.game.y},j.home);assert.ok(runtime.validState(s));}
});
test('after away work actual material can fund builder tasks while prior receipts and hearts remain separate',()=>{
    let s=introduceFixture();absence.install(s.game,epoch);const input='Collect wood while I am away',b=runtime.begin(s,input,'en',epoch),target=b.packet.inventory.targets.find(t=>t.id.startsWith('chip:palms_')&&t.reachable).id;
    s=runtime.finish(b.state,b.packet.id,b.state.revision,{...response(b.packet),terms:[],focus:null,away:{kind:'start',quote:input,type:'wood',targets:[target],quantity:undefined}});
    absence.depart(s.game,epoch);absence.resume(s.game,epoch+2*absence.HOUR);const old=runtime.game.practice.relationship(s.game),ids=s.game.inventory.items.map(i=>i.id);
    s=directed(s,'Cancel gathering',{away:{kind:'cancel',quote:'Cancel gathering'}});s=builderTaskVisit(s,'accept-deliver',2);assert.equal(runtime.game.practice.building(s.game).held.wood,2);assert.deepEqual(runtime.game.practice.relationship(s.game),old);assert.ok(s.game.inventory.spent.every(e=>ids.includes(e.item.id)));assert.ok(runtime.validState(s));
});
test('source, resource serial, stock, original route and duplicate item corruption are rejected',()=>{
    const s=awayFixture();absence.depart(s.game,epoch);absence.resume(s.game,epoch+2*absence.HOUR);assert.ok(runtime.validState(s));
    for(const alter of [g=>g.absence.jobs[0].source='turn-999',g=>Object.values(g.absence.resources)[0].serial++,g=>Object.values(g.absence.resources)[0].available=2,g=>g.absence.jobs[0].plans[0].out[1].x+=.1,g=>g.inventory.items.push(structuredClone(g.inventory.items[0]))]){const bad=structuredClone(s);alter(bad.game);assert.equal(runtime.validState(bad),false);}
});
test('session resume failure is not retried and a persisted voice is consumed at most once',async()=>{
    const {createSession}=require('../scripts/experimental/native_store');for(const mode of ['failure','success']){let saved=awayFixture(),now=epoch,calls=0;const quiet={cancel(){},dispose(){}};
        const session=createSession({store:{load:()=>({ok:true,value:structuredClone(saved)}),save:s=>{assert.ok(runtime.validState(s));saved=structuredClone(s);return {ok:true};}},wallClock:()=>now,responder:quiet,resumeResponder:{...quiet,async reply(){calls++;return mode==='success'?{ok:true,proposal:{text:'Welcome back! I collected two wood.'}}:{ok:false,error:'output'};}}});
        session.enter();session.leave();now+=25*60000;session.enter();const r=await session.resumeReport();assert.equal(calls,1);assert.equal(saved.game.inventory.items.length,2);assert.equal(saved.game.absence.report.status,mode==='success'?'complete':'failed');
        if(mode==='success'){assert.ok(session.resumeLine(r.resume));assert.equal(session.resumeLine(r.resume),null);}else assert.equal(session.resumeLine(saved.game.absence.report.id),null);
        await session.resumeReport();assert.equal(calls,1);session.dispose();}
});
test('character switches settle each owner independently; temporary pause never departs',async()=>{
    const {createSession}=require('../scripts/experimental/native_store');let selected='a',now=epoch;const saved={a:awayFixture(),b:gatheringState()},quiet={cancel(){},dispose(){}};
    const store={load:()=>({ok:true,value:structuredClone(saved[selected])}),save:s=>{assert.ok(runtime.validState(s));saved[selected]=structuredClone(s);return {ok:true};},select:id=>{selected=id;return {ok:true,value:structuredClone(saved[id])};}};
    const session=createSession({store,wallClock:()=>now,responder:quiet});session.enter();session.pulse(true);now+=absence.HOUR;session.pulse(true);assert.equal(absence.current(saved.a.game).total,0);
    assert.ok(session.selectCharacter('b').ok);session.enter();now+=25*60000;assert.ok(session.selectCharacter('a').ok);assert.ok(session.enter().ok);assert.equal(saved.a.game.inventory.items.length,2);assert.equal(saved.b.game.inventory?.items?.length||0,0);session.dispose();
});
test('session atomically settles before one resume generation; failure, cancellation and repeated resume retain items',async()=>{
    const {createSession}=require('../scripts/experimental/native_store');let saved=awayFixture(),now=epoch,clock=0,calls=0,release,fail=false;const ordinary={cancel(){},dispose(){},async reply(){return {ok:false,error:'failed'};}};
    const store={load:()=>({ok:true,value:structuredClone(saved)}),save:s=>{assert.ok(runtime.validState(s),'valid persistence');if(fail)return {ok:false,error:'save'};saved=structuredClone(s);return {ok:true};}};
    const options={store,responder:ordinary,clock:()=>clock,wallClock:()=>now,resumeResponder:{...ordinary,async reply(p){calls++;assert.ok(require('../scripts/experimental/native_resume').valid(p));assert.ok(saved.game.inventory.items.length>0,'settlement committed before generation');await new Promise(r=>release=r);return {ok:true,proposal:{text:'Welcome back. I collected two wood and paused.'}};}}};
    let session=createSession(options);assert.ok(session.enter().ok);clock+=10000;now+=10000;session.pulse(false);assert.equal(absence.current(saved.game).total,0);assert.ok(session.leave().ok);now+=1500000;
    fail=true;assert.equal(session.enter().ok,false);assert.equal(saved.game.inventory?.items?.length||0,0);fail=false;assert.ok(session.enter().ok);assert.equal(saved.game.inventory.items.length,2);
    const pending=session.resumeReport();assert.equal(calls,1);session.cancel();release();await pending;assert.equal(saved.game.inventory.items.length,2);assert.ok((await session.resumeReport()).ok);assert.equal(calls,1);session.dispose();
    session=createSession(options);assert.ok(session.enter().ok);await session.resumeReport();assert.equal(calls,1);assert.equal(saved.game.inventory.items.length,2);session.dispose();
});
test('failed acceptance save never establishes an away reservation or yields materials after reload',async()=>{
    const {createSession}=require('../scripts/experimental/native_store');let saved=gatheringState(),now=epoch,fail=true;const quiet={cancel(){},dispose(){}};
    const options={wallClock:()=>now,store:{load:()=>({ok:true,value:structuredClone(saved)}),save:s=>{if(fail&&s.game.absence?.jobs.length)return {ok:false,error:'save'};saved=structuredClone(s);return {ok:true};}},responder:{...quiet,async reply(p){return {ok:true,proposal:{...response(p),terms:[],focus:null,away:{kind:'start',quote:p.input,type:'wood',targets:['chip:palms_gift']}}};}}};
    let session=createSession(options);session.enter();const r=await session.submit('Collect wood while I am away','en');assert.equal(r.ok,false);assert.equal(saved.game.absence.jobs.length,0);session.dispose();fail=false;now+=8*absence.HOUR;session=createSession(options);session.enter();assert.equal(saved.game.absence.jobs.length,0);assert.equal(saved.game.inventory?.items.length||0,0);session.dispose();
});
test('partial outbound movement is saved and crash fallback uses only a saved activity checkpoint',()=>{
    const s=awayFixture();absence.depart(s.game,epoch);absence.resume(s.game,epoch+1000);const j=absence.current(s.game);assert.equal(j.phase,'outbound');assert.ok(j.route.length>0);assert.equal(j.total,0);assert.notDeepEqual({x:s.game.x,y:s.game.y},j.home);assert.ok(runtime.validState(s));
    const {createSession}=require('../scripts/experimental/native_store');let saved=awayFixture(),now=epoch,clock=0;const quiet={cancel(){},dispose(){}},store={load:()=>({ok:true,value:structuredClone(saved)}),save:s=>{assert.ok(runtime.validState(s));saved=structuredClone(s);return {ok:true};}};
    let session=createSession({store,wallClock:()=>now,clock:()=>clock,responder:quiet});session.enter();clock+=11000;now+=11000;session.pulse(false);const checkpoint=saved.game.absence.lastActivity;assert.equal(saved.game.absence.left,null);
    now+=25*60000;session=createSession({store,wallClock:()=>now,responder:quiet});assert.ok(session.enter().ok);assert.equal(saved.game.inventory.items.length,2);assert.equal(saved.game.absence.report.from,checkpoint);session.dispose();
});

const searchInput='Walk through mountains and forests nearest first and find the adventurer';
function searching(){const s=gatheringState();runtime.game.walk.roam(s.game,1000);return directed(s,searchInput,{search:{quote:searchInput}});}
test('nearest search needs explicit terrain, order, adventurer and walking in all seven languages',()=>{
    const inputs=['近い順に山か森に歩いて行って、冒険家さんがいたら教えて',searchInput,'请从最近的山和森林走起，寻找冒险家','Обойди ближайшие горы и леса и найди путешественника','Camina por las montañas y bosques más cercanos y busca al aventurero','Caminhe pelas montanhas e florestas mais perto e procure o aventureiro','Gehe zu den nächsten Bergen und Wäldern und suche den Abenteurer'];
    for(const input of inputs){assert.ok(runtime.game.walk.searchDirective(input),input);const b=runtime.begin(gatheringState(),input,'en'),r={...response(b.packet),terms:[],focus:null,confirmation:null,search:{quote:input}};assert.ok(runtime.validResult(r,b.packet),input);}
    for(const input of ['Yes','冒険家を探そう','近い順に山か森に歩いて行かないで、冒険家さんを探さないで','「近い順に山か森に歩いて行って、冒険家さんがいたら教えて」',searchInput+'?','Do not '+searchInput,'What does '+searchInput+' mean'])assert.equal(runtime.game.walk.searchDirective(input),false,input);
});
test('search starts without circle, follows real nearest route and ends at actual encounter only',()=>{
    const s=searching(),g=s.game,w=runtime.game.walk;
    assert.equal(g.walk.confirmed,null);assert.equal(g.walk.search.target,'chip:palms_gift');assert.equal(g.mode,'move');assert.ok(runtime.validState(s));
    g.walk.roaming.target='chip:mountain_gift';
    for(let i=0;i<1000&&w.searchActive(g);i++){runtime.game.tick(g,.1);assert.ok(runtime.validState(s));}
    assert.equal(g.walk.search.phase,'found');assert.equal(g.mode,'idle');assert.deepEqual(g.walk.search.visited.map(v=>v.target),['chip:palms_gift','chip:mountain_gift']);assert.equal(g.walk.encounter.id,g.walk.search.visited.at(-1).arrival);
    const supply=runtime.game.supply(g);assert.deepEqual(supply.search,{phase:'found',target:'chip:mountain_gift',visited:2,npc:'adventurer'});assert.equal(supply.adventurer,undefined);assert.equal(supply.search.candidates,undefined);
    const b=runtime.begin(s,'Tell me what happened','en',2000);assert.ok(runtime.validPacket(b.packet));assert.ok(JSON.stringify(b.packet.world).length+JSON.stringify(b.packet.calendar).length<=2000);
    assert.match(runtime.prompt(b.packet),/NEAREST PERSON SEARCH IS IMPLEMENTED/);
});
test('shared person search accepts the builder in seven languages only after the real introduction',()=>{
    const inputs=['近い順に森に歩いて行って、建築士さんがいたら教えて','Walk through forests nearest first and find the builder','请从最近的森林走起，寻找建筑师','Обойди ближайшие леса и найди строителя','Camina por los bosques más cercanos y busca al constructor','Caminhe pelas florestas mais perto e procure o construtor','Gehe zu den nächsten Wäldern und suche den Baumeister'];
    const introduced=introduceFixture();
    for(const input of inputs){assert.deepEqual(runtime.game.walk.searchRequest(input),{npc:'building',kinds:['forest']});
        const b=runtime.begin(introduced,input,'en'),r={...response(b.packet),terms:[],focus:null,confirmation:null,search:{quote:input}};assert.ok(runtime.validResult(r,b.packet),input);
        const noIntro=runtime.begin(gatheringState(),input,'en');assert.equal(runtime.validResult(r,noIntro.packet),false,input);
        assert.deepEqual(runtime.game.walk.searchOptions(noIntro.packet).map(p=>p.npc),['adventurer']);assert.deepEqual(runtime.game.walk.searchOptions(b.packet).map(p=>p.npc),['adventurer','building']);assert.ok(runtime.game.walk.searchOptions(b.packet).every(p=>Object.keys(p).sort().join(',')==='kinds,name,npc'));
    }
    for(const input of ['近い順に森に歩いて行かないで、建築士さんを探さないで','「近い順に森に歩いて行って、建築士さんがいたら教えて」','近い順に森に歩いて行って、建築士さんがいたら教えて？','Walk through forests nearest first to find the builder and adventurer','Walk through forests nearest first to find the cook','Walk through mountains nearest first to find the builder'])assert.equal(runtime.game.walk.searchDirective(input),false,input);
});
test('builder search visits forests by real distance, ignores the adventurer and opens only the real builder encounter',()=>{
    const w=runtime.game.walk,input='近い順に山か森に歩いて行って、建築士さんがいたら教えて';let s=introduceFixture(),g=s.game;
    w.roam(g,1000);g.walk.roaming.target='chip:palms_gift';
    s=directed(s,searchInput,{search:{quote:searchInput}});g=s.game;for(let i=0;i<1000&&w.searchActive(g);i++)runtime.game.tick(g,.1);
    assert.equal(g.walk.search.phase,'found');assert.equal(g.walk.search.npc,'adventurer');g.walk.encounter.phase='done';g.walk.builder.target='chip:palms_survey';
    const bag=structuredClone(g.inventory),intro=structuredClone(runtime.game.practice.introduction(g));
    s=directed(s,input,{search:{quote:input}});g=s.game;assert.equal(g.mode,'move');assert.equal(g.walk.search.target,'chip:palms_gift');assert.equal(g.walk.confirmed,null);
    for(let i=0;i<2000&&w.searchActive(g);i++){runtime.game.tick(g,.1);assert.ok(runtime.validState(s));}
    assert.equal(g.walk.search.phase,'found');assert.equal(g.walk.search.npc,'building');assert.deepEqual(g.walk.search.kinds,['forest']);assert.deepEqual(g.walk.search.visited.map(v=>v.target),['chip:palms_gift','chip:palms_survey']);
    assert.ok(g.walk.search.candidates.every(w.forest));assert.equal(g.walk.encounter.npc,'building');assert.equal(g.walk.encounter.id,g.walk.search.visited.at(-1).arrival);
    assert.deepEqual(g.inventory,bag);assert.deepEqual(runtime.game.practice.introduction(g),intro);assert.ok(runtime.validState(JSON.parse(JSON.stringify(s))));
    const b=runtime.begin(s,'Tell me what happened','en',2000);assert.ok(runtime.validPacket(b.packet));assert.equal(b.packet.world.search.npc,'building');assert.equal(b.packet.world.search.candidates,undefined);assert.ok(JSON.stringify(b.packet.world).length+JSON.stringify(b.packet.calendar).length<=2000);
    const p=runtime.game.practice.create(g,g.walk.encounter);assert.equal(p.npc,'building');assert.equal(p.phase,'offer');assert.ok(runtime.validState(s),'the builder conversation saves after a real search arrival');
    finishLine(g,'offer',{text:'Hello, I am the builder.'});finishLine(g,'decision',{text:'Good to meet you.',choice:'decline'});finishLine(g,'feedback',{text:'See you again.'});assert.equal(p.phase,'done');assert.equal(g.walk.builder.met,true);assert.ok(runtime.validState(s));
});
test('person search preserves requested terrain, validates recipient and scope quotes, and reads old adventurer saves',()=>{
    const input='Walk through forests nearest first to find the adventurer',w=runtime.game.walk;
    let s=directed(gatheringState(),input,{search:{quote:input}});assert.deepEqual(s.game.walk.search.kinds,['forest']);assert.ok(s.game.walk.search.candidates.every(w.forest));
    const b=runtime.begin(introduceFixture(),'Walk through forests nearest first to find the builder, then walk through mountains nearest first to find the adventurer','en');
    assert.equal(runtime.validResult({...response(b.packet),terms:[],search:{quote:'walk through mountains nearest first to find the adventurer'}},b.packet),false);
    const scope=runtime.begin(gatheringState(),searchInput+'; Walk through forests nearest first to find the adventurer','en');
    assert.equal(runtime.validResult({...response(scope.packet),terms:[],search:{quote:'Walk through forests nearest first to find the adventurer'}},scope.packet),false);
    const forged=structuredClone(s);forged.game.walk.search.npc='building';assert.equal(runtime.validState(forged),false);
    const builderInput='Walk through forests nearest first to find the builder',builder=directed(introduceFixture(),builderInput,{search:{quote:builderInput}});
    const stopped=directed(builder,'stop');assert.equal(stopped.game.walk.search.phase,'stopped');assert.equal(stopped.game.walk.search.npc,'building');assert.ok(runtime.validState(stopped));
    s=searching();delete s.game.walk.search.npc;delete s.game.walk.search.kinds;assert.ok(runtime.validState(s));assert.equal(runtime.game.supply(s.game).search.npc,undefined);
    const legacyInput=searchInput+' before visiting the builder';s.turns.at(-1).input=legacyInput;s.turns.at(-1).result.search.quote=legacyInput;s.game.walk.search.origin.quote=legacyInput;
    assert.ok(runtime.validState(s),'old adventurer search wording remains readable under its original rule');
    const live=runtime.begin(gatheringState(),legacyInput,'en');assert.equal(runtime.validResult({...response(live.packet),terms:[],search:{quote:legacyInput}},live.packet),false,'legacy reading does not permit an ambiguous new search');
    const fresh=directed(directed(s,'stop'),searchInput,{search:{quote:searchInput}});assert.ok(runtime.validState(fresh),'new search preserves old original input without rewriting it');
    const {createSession}=require('../scripts/experimental/native_store');let saved=s,calls=0;const session=createSession({store:{load:()=>({ok:true,value:structuredClone(saved)}),save:value=>{saved=structuredClone(value);return {ok:true};}},responder:{cancel(){},dispose(){},reply(){calls++;}}});
    assert.equal(session.load().state.game.walk.search.reason,'load');assert.equal(session.load().state.game.mode,'idle');assert.equal(calls,0);assert.ok(runtime.validState(session.load().state));session.dispose();
});
test('search exhausts known candidates once without reporting an island-wide absence',()=>{
    const s=searching(),g=s.game,w=runtime.game.walk;
    for(let i=0;i<1000&&w.searchActive(g);i++){g.walk.roaming.target=g.destination==='chip:palms_gift'?'chip:mountain_gift':'chip:palms_gift';runtime.game.tick(g,.1);}
    assert.equal(g.walk.search.phase,'exhausted');assert.equal(g.walk.encounter,null);assert.equal(g.walk.search.visited.length,2);assert.equal(g.mode,'idle');assert.ok(runtime.validState(s));
    const before=g.receipts.length;for(let i=0;i<10;i++)runtime.game.tick(g,.1);assert.equal(g.receipts.length,before);
});
test('explicit stop, failed reply and reload interrupt searches without new movement or generation',()=>{
    let s=searching();s=directed(s,'stop');assert.equal(s.game.walk.search.phase,'stopped');assert.equal(s.game.mode,'idle');assert.ok(runtime.validState(s));
    const b=runtime.begin(searching(),'Hello','en');s=runtime.finish(b.state,b.packet.id,b.state.revision,null);assert.equal(s.game.walk.search.phase,'stopped');assert.ok(runtime.validState(s));
    const {createSession}=require('../scripts/experimental/native_store');let saved=searching(),calls=0;
    const session=createSession({store:{load:()=>({ok:true,value:structuredClone(saved)}),save:value=>{assert.ok(runtime.validState(value));saved=structuredClone(value);return {ok:true};}},responder:{cancel(){},dispose(){},reply(){calls++;throw Error('unexpected');}}});
    assert.equal(session.load().state.game.walk.search.reason,'load');session.pulse(false);assert.equal(calls,0);assert.equal(session.load().state.game.mode,'idle');session.dispose();
});
test('search rejects forged quotes, simultaneous actions and resuming through bare agreement',()=>{
    const b=runtime.begin(gatheringState(),searchInput,'en'),r={...response(b.packet),terms:[],focus:null,confirmation:null,search:{quote:searchInput}};
    assert.equal(runtime.validResult({...r,search:{quote:'Yes'}},b.packet),false);
    assert.equal(runtime.validResult({...r,inventoryView:{kind:'open',quote:searchInput}},b.packet),false);
    const active=searching(),p=runtime.begin(active,searchInput,'en');assert.equal(runtime.validResult({...r},p.packet),false);
    const bad=structuredClone(active);bad.game.walk.search.visited.push({target:bad.game.destination,arrival:'event-999999'});assert.equal(runtime.validState(bad),false);
    for(const value of [null,{},[],{...active.game.walk.search,visited:null},{...active.game.walk.search,visited:[null]}]){const broken=structuredClone(active);broken.game.walk.search=value;assert.equal(runtime.validState(broken),false);}
});
test('search adds only newly visible actual candidates and uses no shortcut across missing ground',()=>{
    const s=gatheringState(),g=s.game;
    for(let x=700;x<=1150;x+=50)g.island.assets['ground_'+x]={...g.island.assets.ground_650,dx:x-10};
    g.island.assets.palms_distant={...g.island.assets.palms_gift,dx:920};
    g.island.assets.mountain_unreachable={...g.island.assets.mountain_gift,dx:400,dy:-40};
    runtime.game.walk.roam(g,1000);g.walk.roaming.target='chip:palms_distant';
    const next=directed(s,searchInput,{search:{quote:searchInput}}),n=next.game;
    assert.equal(n.walk.search.candidates.includes('chip:palms_distant'),false);
    assert.equal(n.walk.search.candidates.includes('chip:mountain_unreachable'),true);
    for(let i=0;i<2000&&runtime.game.walk.searchActive(n);i++)runtime.game.tick(n,.1);
    assert.equal(n.walk.search.phase,'found');assert.equal(n.walk.search.target,'chip:palms_distant');assert.ok(n.seen.includes('chip:palms_distant'));
    assert.equal(n.walk.search.visited.some(v=>v.target==='chip:mountain_unreachable'),false);assert.ok(runtime.validState(next));
});
test('search session saves before departure, emits no per-stop generations and arms only fresh real encounter',async()=>{
    const {createSession}=require('../scripts/experimental/native_store');let saved=gatheringState(),calls=0,clock=0;
    runtime.game.walk.roam(saved.game,1000);saved.game.walk.roaming.target='chip:mountain_gift';
    const session=createSession({clock:()=>clock,wallClock:()=>1000,store:{load:()=>({ok:true,value:structuredClone(saved)}),save:value=>{assert.ok(runtime.validState(value));saved=structuredClone(value);return {ok:true};}},responder:{cancel(){},dispose(){},async reply(p){calls++;return {ok:true,proposal:{...response(p),terms:[],focus:null,confirmation:null,search:{quote:p.input}}};}},practiceResponder:{cancel(){},dispose(){}}});
    assert.ok((await session.submit(searchInput,'en')).ok);assert.equal(saved.game.mode,'move');
    for(let i=0;i<1000&&runtime.game.walk.searchActive(saved.game);i++){clock+=100;assert.ok(session.pulse(false).ok);}
    assert.equal(calls,1);assert.equal(saved.game.walk.search.phase,'found');assert.equal(saved.game.walk.search.visited.length,2);
    const intro=session.mentorIntro(saved.game.walk.encounter.id);assert.ok(intro.ok);assert.equal(intro.automatic,true);session.dispose();
    let writes=0;const failed=createSession({store:{load:()=>({ok:true,value:gatheringState()}),save:()=>({ok:++writes!==4})},responder:{cancel(){},dispose(){},async reply(p){return {ok:true,proposal:{...response(p),terms:[],focus:null,confirmation:null,search:{quote:p.input}}};}}});
    const result=await failed.submit(searchInput,'en');assert.equal(result.ok,false);assert.equal(result.error,'save');assert.equal(result.state.game.mode,'idle');failed.dispose();
});

function directed(s,input,extra={}){const b=runtime.begin(s,input,'en'),r={...response(b.packet),terms:[],focus:null,confirmation:null,...extra};assert.ok(runtime.validResult(r,b.packet));return runtime.finish(b.state,b.packet.id,b.state.revision,r);}
function confirmed(s){const target=runtime.game.supply(s.game).visible.find(v=>/^chip:(mountain_|palms_)/.test(v.id)&&runtime.game.walk.plan(s.game,v.id));assert.ok(target);
    s=directed(s,'Which place?',{focus:{targetId:target.id,quote:'Which place?'}});assert.equal(s.game.walk.confirmed,null);assert.equal(s.game.mode,'idle');
    s=directed(s,'Yes',{confirmation:{targetId:target.id,quote:'Yes'}});return {state:s,target:target.id};}

function arrived(s,target){if(s.game.walk.confirmed?.targetId!==target){s=directed(s,'Which place?',{focus:{targetId:target,quote:'Which place?'}});s=directed(s,'Yes',{confirmation:{targetId:target,quote:'Yes'}});}
    s=directed(s,'walk there',{action:{kind:'walk',targetId:target,quote:'walk there'}});
    for(let i=0;i<2000&&s.game.mode==='move';i++)runtime.game.tick(s.game,.1);
    assert.equal(s.game.mode,'idle');assert.equal(s.game.walk.encounter.phase,'pending');assert.ok(runtime.validState(s));return s;}

function completeCollection(g){const practice=runtime.game.practice,p=practice.current(g);
    for(let i=0;i<2400&&p.phase!=='done';i++){const slot=practice.due(p);if(slot){p.attempts[slot]='pending';practice.finish(g,slot,{text:'Actual '+slot,choice:slot==='decision'?'accept':null});}
        runtime.game.tick(g,.1);}assert.equal(p.phase,'done');return p;}

function gatheringState(offset={x:0,y:0}){const assets={};for(let x=100;x<=650;x+=50)assets['ground_'+x]={dx:x-10,dy:190,sx:0,sy:0,sw:20,sh:20,scale:1,img:'fixture',type:'ground'};
    assets.palms_gift={dx:420,dy:75,sx:0,sy:0,sw:60,sh:80,scale:1,img:'fixture',type:'nature'};
    assets.mountain_gift={dx:550,dy:75,sx:0,sy:0,sw:60,sh:80,scale:1,img:'fixture',type:'mountain'};
    for(const a of Object.values(assets)){a.dx+=offset.x;a.dy+=offset.y;}
    return runtime.create({name:'Collector',self:'I',player:'you'},'en',[0,0,0,0,0,0,0],{version:1,assets,spawn:{x:(300+offset.x)/800,y:(200+offset.y)/480},places:[
        {id:'berry:1',meaning:'berry',assetKey:'palms_gift',x:(450+offset.x)/800,y:(200+offset.y)/480},{id:'shade',meaning:'rest',assetKey:'palms_gift',x:(500+offset.x)/800,y:(200+offset.y)/480},{id:'path',meaning:'walk',x:(600+offset.x)/800,y:(200+offset.y)/480}]});}
function freely(s,type,input='Gather in the forest'){const target=runtime.game.practice.targets(s.game).find(t=>t.types.includes(type)&&t.reachable);assert.ok(target,'available '+type);
    return directed(s,input,{gather:{type,targetId:target.id,quote:input}});}
function finishLine(g,slot,extra={}){const p=runtime.game.practice.current(g);p.attempts[slot]='pending';runtime.game.practice.finish(g,slot,{text:'Actual '+slot,choice:null,...extra});}
function compassFixture(){let s=gatheringState();const w=runtime.game.walk,pr=runtime.game.practice;w.roam(s.game,Date.now());const target=s.game.walk.roaming.target;
    s=directed(s,'Which forest?',{focus:{targetId:target,quote:'Which forest?'}});s=directed(s,'Yes',{confirmation:{targetId:target,quote:'Yes'}});s=arrived(s,target);const p=pr.create(s.game,s.game.walk.encounter);assert.ok(p);
    for(let i=0;i<3000&&p.phase!=='done';i++){const slot=pr.due(p);if(slot)finishLine(s.game,slot,{choice:slot==='decision'?'accept':null,...(slot==='feedback'?{text:'Take my spare compass and exchange contacts.',linkOffer:{quote:'Take my spare compass and exchange contacts.'}}:{})});runtime.game.tick(s.game,.1);}
    assert.ok(p.linkOffer);assert.equal(pr.compass.received(s.game),false);assert.ok(runtime.validState(s));
    s=directed(s,'Receive the compass',{compass:{kind:'receive',contact:'adventurer',quote:'Receive the compass'}});assert.ok(runtime.validState(s));return s;}

test('compass requires completed collection, proposed spare, personal acceptance and separate contacts',()=>{
    const pr=runtime.game.practice,c=pr.compass,s=compassFixture();assert.equal(c.received(s.game),true);assert.deepEqual(c.contacts(s.game),['adventurer']);
    assert.equal(pr.bottle(s.game),'empty');assert.equal(s.game.inventory.items.length,2);assert.equal(runtime.game.supply(s.game).reported,undefined);
    const fresh=gatheringState();assert.equal(c.received(fresh.game),false);assert.equal(c.source(fresh.game),undefined);
    for(const change of [q=>q.linkOffer.quote='unspoken',q=>q.linkAccept.quote='unspoken',q=>delete q.linkOffer]){const bad=structuredClone(s);change(bad.game.practices[0]);assert.equal(runtime.validState(bad),false);}
    for(const input of ['Yes','Do not call with the compass','Say "call with the compass"']){const b=runtime.begin(s,input,'en'),r={...response(b.packet),terms:[],focus:null,confirmation:null,compass:{kind:'call',contact:'adventurer',purpose:'meet',quote:input}};assert.equal(runtime.validResult(r,b.packet),false);}
    const b=runtime.begin(s,'Call the builder with the compass','en'),r={...response(b.packet),terms:[],focus:null,confirmation:null,compass:{kind:'call',contact:'building',purpose:'location',quote:b.packet.input}};assert.equal(runtime.validResult(r,b.packet),false);
    const next=runtime.begin(s,'Hello','en');assert.ok(runtime.validState(next.state));assert.ok(JSON.stringify(next.packet.inventory).length<=1200);assert.deepEqual(next.packet.inventory.compass.contacts,['adventurer']);assert.match(runtime.prompt(next.packet),/,"compass":null/);
});

test('compass location call is bounded, private, saved, and never starts movement or waiting',()=>{
    let s=compassFixture();const pr=runtime.game.practice,protocol=require('../scripts/experimental/native_practice');s=directed(s,'Call with the compass',{compass:{kind:'call',contact:'adventurer',purpose:'location',quote:'Call with the compass'}});
    const p=pr.current(s.game);assert.ok(runtime.validState(s));const before=structuredClone(s.game.inventory),at=Date.now();
    const packet=protocol.packet(s,p,'offer',at);assert.ok(protocol.protocol.valid(packet));assert.equal(packet.recent.length+packet.previous.length,0);assert.equal(packet.context.relationship,undefined);assert.equal(packet.context.collection,undefined);
    assert.equal(packet.context.location.target,s.game.walk.roaming.target);assert.ok(JSON.stringify(packet.context).length<=1200);assert.ok(JSON.stringify(packet).length<4000);
    assert.equal(protocol.validResult({text:'Wait.',choice:null,agree:true},'offer',packet.context),false);
    p.attempts.offer='pending';pr.finish(s.game,'offer',{text:'I am at this forest now.',choice:null,agree:false},at);assert.ok(runtime.validState(s));
    p.attempts.decision='pending';pr.finish(s.game,'decision',{text:'Thank you for telling me.',choice:null,agree:false},at+1);assert.ok(runtime.validState(s));
    assert.equal(p.phase,'done');assert.equal(p.remote.until,undefined);assert.equal(s.game.mode,'idle');assert.deepEqual(s.game.inventory,before);assert.deepEqual(pr.compass.contacts(s.game),['adventurer']);
    const t=runtime.begin(s,'Where was the reply from?','en',at+2);assert.ok(runtime.validState(t.state));assert.equal(t.packet.world.reported.id,p.remote.target);assert.equal(t.packet.inventory.compass.last.at,at);
    assert.ok(JSON.stringify(t.packet.world).length+JSON.stringify(t.packet.calendar).length<=2000);assert.ok(runtime.validState(JSON.parse(JSON.stringify(s))));
    for(const change of [c=>c.contact='building',c=>c.location.target='chip:mountain_gift',c=>c.answer='Unspoken answer']){const bad=structuredClone(t.state);change(bad.turns.at(-1).practice.context);assert.equal(runtime.validState(bad),false);}
});

test('compass meeting waits exactly ten real minutes after both decisions, not the location answer',()=>{
    let s=compassFixture();const pr=runtime.game.practice,w=runtime.game.walk;s=directed(s,'Call with the compass to meet',{compass:{kind:'call',contact:'adventurer',purpose:'meet',quote:'Call with the compass to meet'}});const p=pr.current(s.game),at=Date.now();
    p.attempts.offer='pending';pr.finish(s.game,'offer',{text:'Yes, we can meet here.',choice:null,agree:true},at);assert.equal(p.remote.until,undefined);
    p.attempts.decision='pending';pr.finish(s.game,'decision',{text:'I agree to meet.',choice:null,agree:true},at+1234);assert.equal(p.remote.until,at+1234+600000);assert.equal(s.game.mode,'idle');assert.ok(runtime.validState(s));
    const target=p.remote.target;assert.equal(w.roam(s.game,p.remote.until-1),false);assert.equal(s.game.walk.roaming.target,target);assert.equal(w.roam(s.game,p.remote.until),true);assert.notEqual(s.game.walk.roaming.target,target);
    assert.equal(pr.compass.snapshot(s.game).last.target,target,'last answer remains historical after patrol');assert.ok(runtime.validState(s));
});

test('old completed saves offer only at a new real meeting, decline preserves items, and introductions share slots',()=>{
    const pr=runtime.game.practice,protocol=require('../scripts/experimental/native_practice');let s=compassFixture();const first=s.game.practices[0];delete first.linkAccept;delete first.linkOffer;delete first.linkEnabled;s.turns.pop();first.affinity={slot:'feedback',delta:1,kind:'conduct',quote:'Actual report',reason:'Actual return.'};
    assert.ok(runtime.validState(s));assert.equal(pr.compass.face(s.game,first,'feedback'),null,'old completed speech is never replayed as a grant');
    const target=first.homeTarget;s=arrived(s,target);const p=pr.create(s.game,s.game.walk.encounter);const packet=protocol.packet(s,p,'offer');assert.equal(packet.context.link.grant,true);
    finishLine(s.game,'offer',{text:'You may have my spare compass.',linkOffer:{quote:'You may have my spare compass.'}});finishLine(s.game,'decision',{text:'Not this time. Thank you.',choice:'decline',affinity:{delta:1,kind:'conversation',quote:'Thank you.',reason:'Polite direct reply.'}});assert.equal(pr.compass.received(s.game),false);assert.ok(runtime.validState(s));
    s.game.island.assets.palms_survey={...s.game.island.assets.palms_gift,dx:270};runtime.game.perception.observe(s.game);s=arrived(s,target);const next=pr.create(s.game,s.game.walk.encounter),combined=protocol.packet(s,next,'offer');assert.ok(combined.context.introduce);assert.equal(combined.context.link.grant,true);assert.ok(JSON.stringify(combined.context).length<=1200);
    const offer={text:'The builder surveys that forest. My spare compass is yours if you want it.',choice:null,introduction:{quote:'The builder surveys that forest.'},linkOffer:{quote:'My spare compass is yours if you want it.'}};assert.ok(protocol.validResult(offer,'offer',combined.context));finishLine(s.game,'offer',offer);finishLine(s.game,'decision',{text:'I accept your compass and contact.',choice:'decline',linkAccept:{quote:'I accept your compass and contact.'}});
    assert.equal(pr.compass.received(s.game),true);assert.equal(next.lines.length,2);assert.equal(pr.allItems(s.game).length,2);assert.ok(runtime.validState(s));
});

test('actual builder meeting can exchange only his own contact after compass acquisition',()=>{
    const pr=runtime.game.practice,protocol=require('../scripts/experimental/native_practice');let s=compassFixture();const first=s.game.practices[0];s.game.island.assets.palms_survey={...s.game.island.assets.palms_gift,dx:270};runtime.game.perception.observe(s.game);
    // Two considerate direct conversations establish the existing introduction threshold.
    for(let i=0;i<2;i++){s=arrived(s,first.homeTarget);pr.create(s.game,s.game.walk.encounter);finishLine(s.game,'offer');finishLine(s.game,'decision',{text:'Thank you.',choice:'decline',affinity:{delta:1,kind:'conversation',quote:'Thank you.',reason:'Kind direct reply.'}});}
    s=arrived(s,first.homeTarget);const intro=pr.create(s.game,s.game.walk.encounter);assert.ok(intro.introduce);finishLine(s.game,'offer',{text:'The builder visits that forest.',introduction:{quote:'The builder visits that forest.'}});finishLine(s.game,'decision',{choice:'decline'});
    assert.deepEqual(pr.compass.contacts(s.game),['adventurer']);const target=s.game.walk.builder.target;
    s=directed(s,'Which forest?',{focus:{targetId:target,quote:'Which forest?'}});s=directed(s,'Yes',{confirmation:{targetId:target,quote:'Yes'}});s=directed(s,'Walk to meet the builder',{action:{kind:'walk',targetId:target,quote:'Walk to meet the builder'}});
    for(let i=0;i<2000&&s.game.mode==='move';i++)runtime.game.tick(s.game,.1);const p=pr.create(s.game,s.game.walk.encounter);assert.equal(p.npc,'building');
    const packet=protocol.packet(s,p,'offer');assert.deepEqual(packet.context.link,{grant:false,contact:'building'});assert.equal(packet.context.relationship,undefined);
    finishLine(s.game,'offer',{text:'Let us exchange compass contacts.',linkOffer:{quote:'Let us exchange compass contacts.'}});finishLine(s.game,'decision',{text:'Yes, let us exchange contacts.',choice:'decline',linkAccept:{quote:'Yes, let us exchange contacts.'}});finishLine(s.game,'feedback');assert.deepEqual(pr.compass.contacts(s.game),['adventurer','building']);assert.equal(p.lines.length,3);assert.ok(runtime.validState(s));
    s=directed(s,'Call the builder with the compass',{compass:{kind:'call',contact:'building',purpose:'location',quote:'Call the builder with the compass'}});finishLine(s.game,'offer',{text:'PRIVATE BUILDER ANSWER',agree:false});finishLine(s.game,'decision',{agree:false});assert.ok(runtime.validState(s));
    s=arrived(s,first.homeTarget);const reunion=pr.create(s.game,s.game.walk.encounter);assert.ok(reunion);assert.doesNotMatch(JSON.stringify(protocol.packet(s,reunion,'offer').previous),/PRIVATE BUILDER ANSWER/,'another person never receives this private call as adventurer history');
});

test('received offscreen location is one real chip, circle and agreement never walk, later explicit walk follows real ground',()=>{
    const pr=runtime.game.practice;let s=compassFixture();for(let x=700;x<=1300;x+=50)s.game.island.assets['ground_'+x]={dx:x-10,dy:190,sx:0,sy:0,sw:20,sh:20,scale:1,img:'fixture',type:'ground'};
    s.game.island.assets.palms_far={...s.game.island.assets.palms_gift,dx:1220};s.game.walk.roaming.target='chip:palms_far';
    s=directed(s,'Call with the compass',{compass:{kind:'call',contact:'adventurer',purpose:'location',quote:'Call with the compass'}});finishLine(s.game,'offer',{agree:false});finishLine(s.game,'decision',{agree:false});
    assert.equal(runtime.game.perception.chips(s.game).some(p=>p.id==='chip:palms_far'),false);
    s=directed(s,'Show the received location',{focus:{targetId:'chip:palms_far',quote:'Show the received location'}});assert.equal(s.game.mode,'idle');s=directed(s,'Yes',{confirmation:{targetId:'chip:palms_far',quote:'Yes'}});assert.equal(s.game.mode,'idle');assert.ok(runtime.validState(s));
    s=directed(s,'walk there',{action:{kind:'walk',targetId:'chip:palms_far',quote:'walk there'}});assert.equal(s.game.mode,'move');for(let i=0;i<4000&&s.game.mode==='move';i++)runtime.game.tick(s.game,.1);assert.equal(s.game.walk.encounter.target,'chip:palms_far');assert.ok(runtime.validState(s));
    const bad=structuredClone(s);bad.turns.at(-1).world.reported.id='chip:mountain_gift';assert.equal(runtime.validState(bad),false);
});

test('compass session saves two remote lines, cancels late replies, rejects failed persistence and never restarts a call on load',async()=>{
    const {createSession}=require('../scripts/experimental/native_store'),pr=runtime.game.practice;const initial=compassFixture();let now=Date.now(),saved=structuredClone(initial),calls=0,release,fail=false;
    const store={load:()=>({ok:true,value:structuredClone(saved)}),save:s=>{assert.ok(runtime.validState(s));if(fail)return {ok:false,reason:'fixture'};saved=structuredClone(s);return {ok:true};}};
    const responder={cancel(){},dispose(){},async reply(p){return {ok:true,proposal:{...response(p),terms:[],focus:null,confirmation:null,compass:{kind:'call',contact:'adventurer',purpose:'meet',quote:p.input}}};}};
    const practiceResponder={cancel(){},dispose(){},async reply(p){calls++;if(release!==false)await new Promise(r=>release=r);return {ok:true,proposal:{text:p.stage==='offer'?'We can meet at this forest.':'I agree.',choice:null,agree:true}};}};
    const options={store,responder,practiceResponder,wallClock:()=>now};let session=createSession(options);assert.ok(session.load().ok);assert.ok((await session.submit('Call with the compass','en')).ok);const id=pr.current(saved.game).id;
    const pending=session.practiceNext(id);await new Promise(r=>setImmediate(r));session.cancel();release();assert.equal((await pending).ok,false);assert.equal(pr.current(saved.game).remote.target,undefined);assert.equal(pr.current(saved.game).remote.until,undefined);session.dispose();
    release=false;session=createSession(options);session.load();assert.equal(calls,1);assert.ok((await session.submit('Call with the compass','en')).ok);const nextId=pr.current(saved.game).id;assert.ok((await session.practiceNext(nextId)).ok);now+=500;assert.ok((await session.practiceNext(nextId)).ok);assert.equal(calls,3);const until=pr.current(saved.game).remote.until;assert.equal(until,now+600000);assert.equal(pr.current(saved.game).lines.length,2);session.dispose();
    session=createSession(options);session.load();assert.equal(calls,3);assert.equal(pr.current(saved.game).remote.until,until);assert.equal((await session.practiceNext(nextId)).ok,false);
    assert.ok((await session.submit('Call with the compass','en')).ok);const failureId=pr.current(saved.game).id;fail=true;assert.equal((await session.practiceNext(failureId)).ok,false);assert.equal(calls,3,'failure to save input prevents generation');session.dispose();
});
function builderMeeting(s){const pr=runtime.game.practice,target=s.game.walk.builder.target;
    if(pr.active(s.game))pr.stop(s.game);s.game.walk.encounter.phase='done';
    s=directed(s,'Which forest?',{focus:{targetId:target,quote:'Which forest?'}});s=directed(s,'Yes',{confirmation:{targetId:target,quote:'Yes'}});
    s=directed(s,'Walk to the forest to meet the builder',{action:{kind:'walk',targetId:target,quote:'Walk to the forest to meet the builder'}});
    for(let i=0;i<2000&&s.game.mode==='move';i++)runtime.game.tick(s.game,.1);
    const p=pr.create(s.game,s.game.walk.encounter);assert.equal(p.npc,'building');return s;}
function builderLine(s,slot,result){const pr=runtime.game.practice,protocol=require('../scripts/experimental/native_practice'),p=pr.current(s.game),packet=protocol.packet(s,p,slot);
    assert.ok(protocol.protocol.valid(packet));assert.ok(protocol.validResult(result,slot,packet.context),JSON.stringify(result));finishLine(s.game,slot,result);assert.ok(runtime.validState(s),'builder '+slot);return packet;}
function builderTaskVisit(s,kind,count=0,delta=0){s=builderMeeting(s);const pr=runtime.game.practice,type=pr.building(s.game).task.type;
    const offer='Please bring the remaining '+type+' for this task.';builderLine(s,'offer',{text:offer,choice:null,builderOffer:{quote:offer}});
    const text=kind==='accept'?'I accept this materials task.':kind==='accept-deliver'?'I accept the task and hand over '+count+' '+type+' now.':kind==='deliver'?'I hand over '+count+' '+type+' for the task.':'I prefer to leave it for now.';
    builderLine(s,'decision',{text,choice:'decline',builderChoice:{kind,count,quote:text}});
    builderLine(s,'feedback',{text:'Thank you for telling me.',choice:null,affinity:{delta,kind:pr.builderDelivery({kind})?'conduct':'conversation',quote:text,reason:'A thoughtful exchange.'}});return s;}

function homeFixture(materials=true){const pr=runtime.game.practice;let s=introduceFixture();
    // Retain the existing graph centres; supply contiguous actual grass for this fixture.
    for(const a of Object.values(s.game.island.assets).filter(a=>a.type==='ground')){a.dx-=15;a.dy-=15;a.sw=50;a.sh=50;}
    for(const type of ['wood','stone']){s=freely(s,type);completeCollection(s.game);s=builderTaskVisit(s,'accept-deliver',2,1);}
    pr.home.refresh(s.game,epoch,pr);assert.ok(s.game.home);absence.install(s.game,epoch);
    if(!materials)return s;
    for(let n=1;n<=3;n++){absence.advance(s.game,epoch+n*2*absence.HOUR);s=freely(s,'wood');completeCollection(s.game);}
    s=freely(s,'stone');completeCollection(s.game);assert.ok(runtime.validState(s));return s;}
function homeOrder(s,input,kind){const b=runtime.begin(s,input,'en');assert.ok(runtime.game.practice.home.validRequest({kind,quote:input},b.packet),JSON.stringify({kind,home:b.packet.inventory.home,action:b.packet.world.currentAction,phase:b.packet.practice?.context.phase}));return directed(s,input,{home:{kind,quote:input}});}
function homePlan(){let s=homeFixture();s=homeOrder(s,'Mark a place for my house','site');s=homeOrder(s,'Yes','confirm');s=homeOrder(s,'Build my house','build');assert.equal(s.game.home.phase,'planning');assert.ok(runtime.validState(s));return s;}
function homeApprove(s,accept=true){s=builderMeeting(s);
    const offer='I approve this hut: total 8 wood and 4 stone, including your deposits; ten minutes, no cancellation after start.';
    builderLine(s,'offer',{text:offer,choice:null,homeConsent:accept?{quote:offer}:null});
    const answer=accept?'I agree to spend the additional six wood and two stone and start construction here.':'I will think about this.';
    builderLine(s,'decision',{text:answer,choice:'decline',homeConsent:accept?{quote:answer}:null});
    builderLine(s,'feedback',{text:accept?'Construction has started.':'No construction started.',choice:null});return s;}

function homeConsult(s,accept=true){s=builderMeeting(s);const offer='Would you like a hut? Total wood8 stone4 includes your deposits; ten minutes to build.';
    const packet=builderLine(s,'offer',{text:offer,choice:null,homeConsent:{quote:offer}});assert.equal(packet.context.construction.mode,'consult');
    const answer=accept?'I would like to plan my home and choose an empty site with my player.':'I prefer not to plan a home yet.';
    builderLine(s,'decision',{text:answer,choice:'decline',homeConsent:accept?{quote:answer}:null});
    builderLine(s,'feedback',{text:'Choose and confirm an empty site, collect any missing materials, then visit me again to decide.',choice:null});return s;}

test('qualified builder proactively proposes a home without a private build command, then the companion decides within three lines',()=>{
    const pr=runtime.game.practice;let s=homeFixture(),bag=structuredClone(s.game.inventory);s=homeConsult(s);
    assert.ok(pr.home.consultation(s.game));assert.equal(pr.current(s.game).lines.length,3);assert.equal(s.game.home.phase,'planning');assert.equal(s.game.home.request,undefined);assert.deepEqual(s.game.inventory,bag);
    s=JSON.parse(JSON.stringify(s));s=homeOrder(s,'Mark a place for my house','site');s=homeOrder(s,'Yes','confirm');
    assert.equal(s.game.home.phase,'planning','a circle and yes never start work');assert.deepEqual(s.game.inventory,bag);
    s=homeApprove(s);assert.equal(s.game.home.request,undefined);assert.equal(s.game.home.phase,'building');assert.equal(s.game.home.payment.source,s.game.home.confirmed.turn);assert.equal(s.game.home.payment.items.length,8);
    assert.ok(runtime.validState(s));const forged=structuredClone(s),c=pr.home.consultation(forged.game);delete c.homeConsent.decision;assert.equal(runtime.validState(forged),false,'payment needs the actual prior mutual planning proposal');
});

test('home consultation supports a material shortfall and refusal, without charging, auto-gathering or expanding seven-locale packets',()=>{
    const pr=runtime.game.practice,protocol=require('../scripts/experimental/native_practice');let s=homeFixture(false),bag=structuredClone(s.game.inventory);s=homeConsult(s,false);assert.equal(pr.home.consultation(s.game),undefined);
    s=homeConsult(s);assert.ok(pr.home.consultation(s.game));assert.deepEqual(s.game.inventory,bag);assert.equal(s.game.home.phase,'planning');
    s=homeOrder(s,'Mark a place for my house','site');s=homeOrder(s,'Yes','confirm');s=builderMeeting(s);
    for(const locale of runtime.locales){s.locale=locale;const p=protocol.packet(s,pr.current(s.game),'offer');assert.ok(protocol.protocol.valid(p));assert.equal(p.context.construction.mode,'build');
        assert.equal(protocol.validResult({text:'I approve building now.',choice:null,homeConsent:{quote:'I approve building now.'}},'offer',p.context),false);
        assert.ok(JSON.stringify(p.context).length<=1200);assert.ok(protocol.protocol.prompt(p).includes('Do not stop at saying the materials are ready'));
        const b=runtime.begin(s,'Hello',locale);assert.ok(JSON.stringify(b.packet.inventory).length<=1200);assert.ok(runtime.validPacket(b.packet));}
    assert.deepEqual(s.game.inventory,bag);assert.equal(s.game.home.phase,'planning');assert.equal(s.game.mode,'idle');
});

test('home proposal, separate confirmation/request and actual builder/companion consent charge only remaining real materials once',()=>{
    const pr=runtime.game.practice;let s=homePlan();const ids=pr.allItems(s.game).map(i=>i.id),held=structuredClone(pr.building(s.game).held),hearts=pr.relationship(s.game).hearts;
    s=homeApprove(s);assert.equal(s.game.home.phase,'building');assert.equal(s.game.home.payment.items.length,8);assert.deepEqual(pr.building(s.game).held,held);assert.deepEqual(held,{wood:2,stone:2});assert.equal(pr.relationship(s.game).hearts,hearts);
    assert.equal(s.game.inventory.spent.filter(i=>i.by.startsWith('house-')).length,8);assert.deepEqual([...pr.allItems(s.game).map(i=>i.id)].sort(),[...ids].sort());
    assert.equal(pr.home.commit(s.game,pr.current(s.game),pr),false);assert.ok(runtime.validState(s));
    const b=runtime.begin(s,'Show inventory','en');assert.ok(runtime.validState(b.state));assert.ok(runtime.validPacket(b.packet));assert.ok(JSON.stringify(b.packet.inventory).length<=1200);
});

test('home clock rollback/reload/long absence complete once, real-route entrance and explicit exit preserve resources and state',async()=>{
    const pr=runtime.game.practice;let s=homeApprove(homePlan()),h=s.game.home,items=structuredClone(s.game.inventory),start=h.startedAt;
    pr.home.refresh(s.game,start-1000,pr);assert.equal(h.now,start);pr.home.refresh(s.game,start+599999,pr);assert.equal(h.phase,'building');
    s=JSON.parse(JSON.stringify(s));pr.home.refresh(s.game,start+100*86400000,pr);assert.equal(s.game.home.phase,'ready');assert.deepEqual(s.game.inventory,items);assert.ok(runtime.validState(s));
    const invented=structuredClone(s);invented.game.home.inside=true;assert.equal(runtime.validState(invented),false,'indoor state requires an actual explicit entry source');
    s=homeOrder(s,'Enter my house','enter');assert.ok(s.game.home.travel);assert.equal(s.game.home.inside,false);
    for(let i=0;i<2000&&s.game.home.travel;i++)runtime.game.tick(s.game,.1);assert.equal(s.game.home.inside,true);assert.ok(runtime.validState(s));
    const b=runtime.begin(s,'How are you?','en');assert.equal(b.packet.world.location,'home');assert.deepEqual(b.packet.world.visible,[]);assert.ok(runtime.validPacket(b.packet));assert.ok(runtime.validState(b.state));
    // An old indoor save without a room position still exits through the real room entrance.
    delete s.game.home.room;const insideSeed=structuredClone(s);s=homeOrder(s,'Exit the house','exit');assert.equal(s.game.home.inside,true);assert.equal(s.game.home.exit.phase,'walk');
    const outdoor={x:s.game.x,y:s.game.y},startRoom=structuredClone(s.game.home.room);
    runtime.game.tick(s.game,.1);assert.notDeepEqual(s.game.home.room,startRoom);assert.deepEqual({x:s.game.x,y:s.game.y},outdoor);assert.ok(runtime.validState(s));
    const supply=runtime.game.supply(s.game);assert.equal(supply.currentAction,'move');assert.equal(supply.location,'home');assert.deepEqual(supply.availableActions,['stop']);
    const busy=runtime.begin(s,'Exit the house','en');assert.equal(pr.home.validRequest({kind:'exit',quote:'Exit the house'},busy.packet),false);
    const stopped=structuredClone(s);runtime.game.apply(stopped.game,{kind:'stop'},'turn-999',{});assert.equal(stopped.game.home.exit,undefined);assert.ok(stopped.game.home.inside);assert.ok(runtime.validState(stopped));
    for(let i=0;i<100&&s.game.home.exit.phase==='walk';i++)runtime.game.tick(s.game,.1);
    assert.equal(s.game.home.exit.phase,'out');assert.ok(s.game.home.inside);assert.equal(s.game.home.room.y,pr.home.ROOM_DOOR.y);assert.equal(s.game.home.room.dir,'down');
    runtime.game.tick(s.game,.1);assert.ok(s.game.home.inside);assert.ok(runtime.validState(s));
    const mid=JSON.parse(JSON.stringify(s));assert.ok(runtime.validState(mid));
    runtime.game.tick(s.game,.1);runtime.game.tick(s.game,.1);assert.equal(s.game.home.inside,false);assert.equal(s.game.home.exit.phase,'in');assert.ok(runtime.validState(s));const outsideFade=structuredClone(s);
    for(let i=0;i<4;i++)runtime.game.tick(s.game,.1);assert.equal(s.game.home.exit,undefined);assert.deepEqual(s.game.inventory,items);assert.deepEqual({x:s.game.x,y:s.game.y},outdoor);assert.ok(runtime.validState(s));
    // Saved departure boundaries never auto-resume a partial indoor walk or fade.
    for(const phase of ['walk','out','in']){let saved=structuredClone(phase==='in'?outsideFade:mid);if(phase==='walk'){saved.game.home.exit.phase='walk';saved.game.home.exit.elapsed=0;}
        const session=require('../scripts/experimental/native_store').createSession({store:{load:()=>({ok:true,value:structuredClone(saved)}),save:v=>{assert.ok(runtime.validState(v));saved=structuredClone(v);return {ok:true};}},clock:()=>0,wallClock:()=>saved.game.home.now,responder:{cancel(){},dispose(){}}});
        assert.ok(session.enter().ok);assert.equal(saved.game.home.exit,undefined);assert.equal(saved.game.home.inside,phase!=='in');const room=structuredClone(saved.game.home.room);session.pulse(false);assert.deepEqual(saved.game.home.room,room);assert.ok(session.leave().ok);session.dispose();}
    for(const cancel of [false,true]){let saved=structuredClone(insideSeed),release;const quiet={cancel(){},dispose(){}};
        const session=require('../scripts/experimental/native_store').createSession({store:{load:()=>({ok:true,value:structuredClone(saved)}),save:v=>{if(v.game.home.exit)return {ok:false,error:'save'};saved=structuredClone(v);return {ok:true};}},clock:()=>0,wallClock:()=>saved.game.home.now,responder:{...quiet,async reply(p){if(cancel)await new Promise(r=>release=r);return {ok:true,proposal:{...response(p),terms:[],focus:null,confirmation:null,home:{kind:'exit',quote:p.input}}};}}});
        assert.ok(session.enter().ok);const pending=session.submit('Exit the house','en');if(cancel){assert.ok(release);session.cancel();release();}assert.equal((await pending).ok,false);assert.ok(saved.game.home.inside);assert.equal(saved.game.home.exit,undefined);assert.deepEqual(saved.game.inventory,items);assert.ok(runtime.validState(saved));session.dispose();}
});

test('home refusals, cancellation and malformed or forged state cannot start or consume construction',()=>{
    const pr=runtime.game.practice;let s=homeFixture();const bag=structuredClone(s.game.inventory),p=runtime.begin(s,'Yes','en').packet;
    assert.equal(pr.home.validRequest({kind:'confirm',quote:'Yes'},p),false);
    for(const input of ['Build my house?','Do not build my house','Yes'])assert.equal(pr.home.directive(input,'build'),false);
    s=homeOrder(s,'Mark a place for my house','site');s=homeOrder(s,'Cancel my house','cancel');assert.equal(s.game.home.site,undefined);assert.deepEqual(s.game.inventory,bag);assert.ok(runtime.validState(s));
    s=homeApprove(homePlan(),false);assert.equal(s.game.home.phase,'planning');assert.equal(s.game.home.payment,undefined);assert.ok(runtime.validState(s));
    const good=homeApprove(homePlan());for(const mutate of [g=>g.home.readyAt--,g=>g.home.site.x+=.1,g=>g.home.payment.items.pop(),g=>g.home.confirmed.quote='invented',g=>g.home.inside=true]){const bad=structuredClone(good);mutate(bad.game);assert.equal(runtime.validState(bad),false);}
});

test('home completion survives a failed save without a second material payment',async()=>{
    const pr=runtime.game.practice;let saved=homePlan(),fail=false,now=epoch,request;
    const store={load:()=>({ok:true,value:structuredClone(saved)}),save:v=>{if(fail)return {ok:false,error:'save'};assert.ok(runtime.validState(v));saved=structuredClone(v);return {ok:true};}};
    let s=homeApprove(saved);const built=structuredClone(s);saved=structuredClone(built);now=s.game.home.readyAt;
    const session=require('../scripts/experimental/native_store').createSession({store,responder:{reply:async p=>{request=p;return {ok:false,error:'cancelled'};},cancel(){},dispose(){}},wallClock:()=>now});
    fail=true;assert.equal(session.load().ok,false);assert.equal(saved.game.home.phase,'building');assert.equal(saved.game.home.payment.items.length,8);session.dispose();
    fail=false;const next=require('../scripts/experimental/native_store').createSession({store,responder:{cancel(){},dispose(){}},wallClock:()=>now});assert.equal(next.load().state.game.home.phase,'ready');assert.equal(saved.game.home.payment.items.length,8);assert.ok(runtime.validState(saved));next.dispose();
});

test('home start save failure and cancellation during consent retain materials without automatic retry',async()=>{
    for(const plan of [homePlan,()=>homeOrder(homeOrder(homeConsult(homeFixture()),'Mark a place for my house','site'),'Yes','confirm')])for(const cancel of [false,true]){let saved=plan(),time=0,release,calls=0;saved.game.walk.encounter.phase='done';const original=structuredClone(saved.game.inventory),pr=runtime.game.practice,quiet={cancel(){},dispose(){}};
        const session=require('../scripts/experimental/native_store').createSession({clock:()=>time,wallClock:()=>epoch,store:{load:()=>({ok:true,value:structuredClone(saved)}),save:v=>{if(v.game.home.phase==='building')return {ok:false,error:'save'};assert.ok(runtime.validState(v));saved=structuredClone(v);return {ok:true};}},responder:{...quiet,async reply(p){return {ok:true,proposal:{...response(p),terms:[],focus:null,confirmation:null,search:{quote:p.input}}};}},practiceResponder:{...quiet,async reply(p){calls++;if(cancel&&p.stage==='decision')await new Promise(r=>release=r);const text=p.stage==='offer'?'I approve this hut and its ten-minute construction, including the deposited materials.':'I agree to spend the additional six wood and two stone and start building.';return {ok:true,proposal:{text,choice:p.stage==='decision'?'decline':null,homeConsent:{quote:text}}};}}});
        assert.ok((await session.submit('Walk through forests nearest first to find the builder','en')).ok);
        for(let i=0;i<3000&&saved.game.mode==='move';i++){time+=100;session.pulse(false);}const id=saved.game.walk.encounter.id;assert.ok(session.mentorIntro(id).ok);assert.ok((await session.practiceNext(id)).ok);
        const pending=session.practiceNext(id);if(cancel){for(let i=0;i<10&&!release;i++)await Promise.resolve();assert.ok(release);session.cancel();release();}
        assert.equal((await pending).ok,false);assert.equal(saved.game.home.phase,'planning');assert.equal(saved.game.home.payment,undefined);assert.deepEqual(saved.game.inventory,original);assert.equal(calls,2);assert.ok(runtime.validState(saved));session.dispose();
    }
});

test('home clauses cover seven locales, reject wishes/negation, and do not duplicate an old encounter',()=>{
    const pr=runtime.game.practice;
    for(const input of ['家を建てて','Build my house','请建造房子','Построй дом','Construye mi casa','Construa minha casa','Baue mein Haus'])assert.ok(pr.home.directive(input,'build'),input);
    for(const input of ['I want to build a house','私は家を建てている','家を建ててと言って','Do not build my house','Yes','Build my house?'])assert.equal(pr.home.directive(input,'build'),false,input);
    const s=homeFixture(),old=s.game.practices.find(p=>p.npc==='building');assert.equal(pr.create(s.game,{id:old.id,target:old.homeTarget,npc:'building'}),null);
    s.game.island.assets={};assert.equal(pr.home.site(s.game,runtime.game.walk),null);
});

test('home qualification persists after a later relationship decrease and materials alone cannot bypass confirmation',()=>{
    const pr=runtime.game.practice;let s=homeFixture(),qualified=s.game.home.qualified;
    s=builderMeeting(s);builderLine(s,'offer',{text:'Hello again.',choice:null});builderLine(s,'decision',{text:'An unkind direct reply.',choice:'decline'});
    builderLine(s,'feedback',{text:'Please be considerate.',choice:null,affinity:{delta:-1,kind:'conversation',quote:'An unkind direct reply.',reason:'The actual direct reply was hurtful.'}});
    assert.equal(pr.building(s.game).hearts,2);pr.home.refresh(s.game,epoch+86400000,pr);assert.equal(s.game.home.qualified,qualified);assert.ok(runtime.validState(s));
    const b=runtime.begin(s,'Build my house','en');assert.equal(pr.home.validRequest({kind:'build',quote:b.packet.input},b.packet),false);
});
test('builder may personally accept and deliver old materials together without another trip or extra generation',()=>{
    const pr=runtime.game.practice;let s=introduceFixture();s=freely(s,'wood');completeCollection(s.game);s=builderTaskVisit(s,'accept-deliver',2,1);
    assert.deepEqual(pr.building(s.game).held,{wood:2,stone:0});assert.equal(pr.building(s.game).task.index,1);assert.equal(pr.building(s.game).task.phase,'unstarted');
    assert.equal(pr.current(s.game).lines.length,3);assert.equal(pr.current(s.game).builderAction.kind,'accept-deliver');assert.equal(pr.building(s.game).hearts,2);assert.ok(runtime.validState(s));
    s=directed(s,'Show tasks',{taskView:{kind:'open',quote:'Show tasks'}});assert.ok(runtime.validState(s));
});
test('builder tasks accept once in order, transfer old real items partially and preserve separate relationships and snapshots',()=>{
    const pr=runtime.game.practice;let s=introduceFixture();const oldHearts=pr.relationship(s.game).hearts;
    // Real gathering before the builder task; these are old items, not fabricated inventory.
    for(const [n,type,target]of [[1,'wood','chip:palms_gift'],[2,'stone','chip:mountain_gift']]){
        s=directed(s,'Collect '+type,{gather:{targetId:target,type,quote:'Collect '+type}});
        for(let i=0;i<4000&&pr.active(s.game);i++){const p=pr.current(s.game),slot=pr.due(p);if(slot)finishLine(s.game,slot);else runtime.game.tick(s.game,.1);}assert.ok(runtime.validState(s));}
    assert.equal(s.game.inventory.items.length,4);
    s=builderTaskVisit(s,'accept');assert.equal(pr.building(s.game).task.phase,'accepted');
    s=directed(s,'Show tasks',{taskView:{kind:'open',quote:'Show tasks'}});assert.ok(runtime.validState(s));
    s=builderTaskVisit(s,'deliver',1,1);assert.deepEqual(pr.building(s.game).held,{wood:1,stone:0});assert.equal(pr.building(s.game).task.phase,'partial');
    const partial=structuredClone(s);s=builderTaskVisit(s,'deliver',1);assert.equal(pr.building(s.game).task.index,1);assert.equal(pr.building(s.game).task.phase,'unstarted');
    s=builderTaskVisit(s,'accept');s=builderTaskVisit(s,'deliver',2,1);assert.deepEqual(pr.building(s.game).held,{wood:2,stone:2});assert.equal(pr.building(s.game).task.phase,'done');assert.equal(pr.building(s.game).hearts,3);
    assert.equal(pr.relationship(s.game).hearts,oldHearts);assert.equal(s.game.inventory.items.length,0);assert.equal(s.game.inventory.spent.length,4);assert.ok(runtime.validState(JSON.parse(JSON.stringify(s))));
    s=directed(s,'Show tasks',{taskView:{kind:'open',quote:'Show tasks'}});assert.ok(runtime.validState(s));
    const bad=structuredClone(s);bad.turns.at(-1).inventory.building.held.wood=0;assert.equal(runtime.validState(bad),false);
    for(const alter of [g=>g.inventory.spent.pop(),g=>g.inventory.items.push(g.inventory.spent[0].item),g=>g.practices.find(p=>p.builderAction?.kind==='deliver').builderAction.items.push(g.inventory.spent[0].item.id)]){const b=structuredClone(s);alter(b.game);assert.equal(runtime.validState(b),false);}
    assert.ok(runtime.validState(partial));assert.deepEqual(pr.building(partial.game).held,{wood:1,stone:0});
    const final=builderMeeting(s),p=pr.current(final.game),packet=require('../scripts/experimental/native_practice').packet(final,p,'offer');assert.equal(packet.context.building.task.phase,'done');
    assert.equal(packet.context.available,undefined);assert.equal(packet.context.exchange,undefined);assert.equal(packet.context.relationship,undefined);assert.deepEqual(packet.previous,[]);
});
test('builder refuses impossible decisions, bare agreement, duplicate acceptance, private evidence and retroactive scoring',()=>{
    const pr=runtime.game.practice,protocol=require('../scripts/experimental/native_practice');let s=builderMeeting(introduceFixture()),p=pr.current(s.game);
    const offer='Please bring two wood for shed posts.';builderLine(s,'offer',{text:offer,choice:null,builderOffer:{quote:offer}});
    const c=protocol.packet(s,p,'decision').context;
    for(const a of [{kind:'deliver',count:2,quote:'I hand over wood.'},{kind:'accept',count:1,quote:'I accept.'},{kind:'accept',count:0,quote:'Yes'}])assert.equal(protocol.validResult({text:a.quote,choice:'decline',builderChoice:a},'decision',c),false);
    builderLine(s,'decision',{text:'I accept the materials task.',choice:'decline',builderChoice:{kind:'accept',count:0,quote:'I accept the materials task.'}});
    const f=protocol.packet(s,p,'feedback').context;assert.equal(protocol.validResult({text:'Fine.',choice:null,affinity:{delta:1,kind:'conversation',quote:'Private player words',reason:'Private'}},'feedback',f),false);
    builderLine(s,'feedback',{text:'We can discuss it again.',choice:null});s=builderMeeting(s);p=pr.current(s.game);builderLine(s,'offer',{text:offer,choice:null,builderOffer:{quote:offer}});
    assert.equal(protocol.validResult({text:'I accept the task.',choice:'decline',builderChoice:{kind:'accept',count:0,quote:'I accept the task.'}},'decision',protocol.packet(s,p,'decision').context),false);
    const legacy=builderMeeting(introduceFixture());delete pr.current(legacy.game).builderEnabled;finishLine(legacy.game,'offer');finishLine(legacy.game,'decision',{choice:'decline'});finishLine(legacy.game,'feedback',{affinity:{delta:1,kind:'conversation',quote:'Actual decision',reason:'Old'}});
    assert.equal(pr.building(legacy.game).hearts,1);assert.equal(pr.current(legacy.game).affinity,undefined);assert.ok(runtime.validState(legacy));
});
test('builder delivery is atomic on failed saves and cancellation, reload never repeats consumption or calls',async()=>{
    const {createSession}=require('../scripts/experimental/native_store'),pr=runtime.game.practice;
    let initial=introduceFixture();initial=freely(initial,'wood');completeCollection(initial.game);initial=builderTaskVisit(initial,'accept');initial.game.walk.encounter.phase='done';
    for(const mode of ['save','cancel','success']){let saved=structuredClone(initial),time=0,calls=0,release,fail=false;
        const store={load:()=>({ok:true,value:structuredClone(saved)}),save:s=>{assert.ok(runtime.validState(s));if(fail&&pr.current(s.game).builderAction?.kind==='deliver')return {ok:false,reason:'fixture'};saved=structuredClone(s);return {ok:true};}};
        const options={store,clock:()=>time,responder:{cancel(){},dispose(){},async reply(p){const target=saved.game.walk.builder.target;
            return {ok:true,proposal:{...response(p),terms:[],focus:null,confirmation:null,...(p.input==='Which forest?'?{focus:{targetId:target,quote:p.input}}:p.input==='Yes'?{confirmation:{targetId:target,quote:p.input}}:{action:{kind:'walk',targetId:target,quote:p.input}})}};}},
            practiceResponder:{cancel(){},dispose(){},async reply(p){calls++;if(p.stage==='decision'&&mode==='cancel')await new Promise(r=>release=r);
                const text=p.stage==='offer'?'Please bring the remaining wood.':p.stage==='decision'?'I hand over two wood for the posts.':'I have stored both pieces.';
                return {ok:true,proposal:{text,choice:p.stage==='decision'?'decline':null,...(p.stage==='offer'?{builderOffer:{quote:text}}:p.stage==='decision'?{builderChoice:{kind:'deliver',count:2,quote:text}}:{})}};}}};
        const session=createSession(options);assert.ok(session.load().ok);
        for(const input of ['Which forest?','Yes','Walk to the forest to meet the builder'])assert.ok((await session.submit(input,'en')).ok);
        for(let i=0;i<2000&&saved.game.mode==='move';i++){time+=100;session.pulse(false);}const id=saved.game.walk.encounter.id;assert.ok(session.mentorIntro(id).automatic);
        assert.ok((await session.practiceNext(id)).ok);fail=mode==='save';const pending=session.practiceNext(id);
        if(mode==='cancel'){await new Promise(r=>setImmediate(r));session.cancel();release();}
        const r=await pending;assert.equal(r.ok,mode==='success');assert.equal(r.error,mode==='save'?'save':mode==='cancel'?'cancelled':null);
        assert.equal(pr.building(saved.game).held.wood,mode==='success'?2:0);assert.equal(saved.game.inventory.items.filter(i=>i.type==='wood').length,mode==='success'?0:2);
        if(mode==='success')assert.ok((await session.practiceNext(id)).ok);const count=calls;session.dispose();fail=false;
        const reopened=createSession(options);assert.ok(reopened.load().ok);assert.equal(calls,count);assert.equal((await reopened.practiceNext(id)).ok,false);
        assert.equal(pr.building(saved.game).held.wood,mode==='success'?2:0);assert.ok(runtime.validState(saved));reopened.dispose();}
});
test('builder heart bounds, recovery and offer threshold do not touch adventurer history',()=>{
    const pr=runtime.game.practice,protocol=require('../scripts/experimental/native_practice');let s=introduceFixture();
    const speak=delta=>{s=builderMeeting(s);builderLine(s,'offer',{text:'Hello again.',choice:null});const text=delta<0?'Your work is worthless.':'I am sorry for my earlier words and appreciate your care.';
        builderLine(s,'decision',{text,choice:'decline'});builderLine(s,'feedback',{text:'I heard what you said.',choice:null,affinity:{delta,kind:'conversation',quote:text,reason:delta<0?'The remark was hurtful.':'The sincere words helped.'}});};
    speak(-1);assert.equal(pr.building(s.game).hearts,0);s=builderMeeting(s);let p=pr.current(s.game),c=protocol.packet(s,p,'offer').context;
    assert.equal(protocol.validResult({text:'Bring wood.',choice:null,builderOffer:{quote:'Bring wood.'}},'offer',c),false);pr.stop(s.game);
    for(let i=0;i<7;i++)speak(1);assert.equal(pr.building(s.game).hearts,5);for(let i=0;i<7;i++)speak(-1);assert.equal(pr.building(s.game).hearts,0);
    assert.equal(pr.relationship(s.game).hearts,3);assert.deepEqual(pr.building(s.game).held,{wood:0,stone:0});assert.ok(runtime.validState(s));
});
function introductionFixture(){let s=gatheringState();const practice=runtime.game.practice;
    s.game.island.assets.palms_survey={...s.game.island.assets.palms_gift,dx:270};runtime.game.perception.observe(s.game);
    const target='chip:palms_gift';s=directed(s,'Which forest?',{focus:{targetId:target,quote:'Which forest?'}});s=directed(s,'Yes',{confirmation:{targetId:target,quote:'Yes'}});
    for(let i=0;i<2;i++){s=arrived(s,target);const p=practice.create(s.game,s.game.walk.encounter);assert.equal(p.introduce,undefined);finishLine(s.game,'offer');
        const text='Thank you for your consideration.';finishLine(s.game,'decision',{text,choice:'decline',affinity:{delta:1,kind:'conversation',quote:text,reason:'Considerate direct conversation.'}});assert.ok(runtime.validState(s));}
    assert.equal(practice.relationship(s.game).hearts,3);s=arrived(s,target);const p=practice.create(s.game,s.game.walk.encounter);assert.equal(p.visit,true);assert.ok(p.introduce);return {s,p};}
function introduceFixture(){const {s,p}=introductionFixture(),text='The builder surveys trees in the other forest, but moves between forests.';
    finishLine(s.game,'offer',{text,introduction:{quote:text}});finishLine(s.game,'decision',{text:'Thank you, I may visit him later.',choice:'decline'});assert.ok(runtime.validState(s));return s;}

test('relationship tone, next real encounter introduction, immutable history and bounded audience-specific packets',()=>{
    const practice=runtime.game.practice,protocol=require('../scripts/experimental/native_practice'),{s,p}=introductionFixture();
    const packet=protocol.packet(s,p,'offer',Date.UTC(2026,10,27));assert.ok(protocol.protocol.valid(packet));assert.ok(JSON.stringify(packet.context).length<=1200);
    assert.match(protocol.protocol.prompt(packet),/0 cautious.*1 polite.*2 familiar.*3 trusting.*4 personally considerate.*5 happy/s);
    assert.equal(protocol.validResult({text:'A greeting only.',choice:null},'offer',packet.context),false);
    const text='The builder surveys trees in the other forest and moves between forests.',result={text,choice:null,introduction:{quote:text}};
    assert.ok(protocol.validResult(result,'offer',packet.context));assert.equal(protocol.validResult({...result,introduction:{quote:'fabricated'}},'offer',packet.context),false);
    finishLine(s.game,'offer',result);finishLine(s.game,'decision',{text:'I do not want to talk to you.',choice:'decline',affinity:{delta:-1,kind:'conversation',quote:'I do not want to talk to you.',reason:'A hurtful direct response.'}});
    assert.equal(practice.relationship(s.game).hearts,2);const original=structuredClone(practice.introduction(s.game));assert.ok(runtime.validState(s));
    const saved=JSON.parse(JSON.stringify(s));assert.deepEqual(practice.introduction(saved.game),original);assert.ok(runtime.validState(saved));
    const chat=runtime.begin(saved,'Where was I told to visit?','en');assert.deepEqual(chat.packet.practice.introduction,original);assert.ok(runtime.validState(chat.state));
    const future=structuredClone(chat.state);future.turns.at(-1).practice.introduction.met=true;assert.equal(runtime.validState(future),false,'a later meeting cannot appear in an earlier snapshot');
    assert.equal(Object.hasOwn(chat.packet.world,'builder'),false);assert.equal(Object.hasOwn(chat.packet.world,'adventurer'),false);
    assert.ok(JSON.stringify(chat.packet.practice).length<=4000);assert.ok(JSON.stringify(chat.packet.world).length<=2000);
    const next=arrived(saved,p.homeTarget),again=practice.create(next.game,next.game.walk.encounter);assert.equal(again.introduce,undefined);
    const loaded=introductionFixture();loaded.s.game.practices.pop();assert.equal(practice.create(loaded.s.game,loaded.s.game.walk.encounter,false).introduce,undefined,'a loaded arrival cannot introduce retroactively');
    for(const change of [q=>q.introduction.quote='unspoken',q=>q.introduce='chip:mountain_gift']){const bad=structuredClone(saved);change(bad.game.practices.at(-1));assert.equal(runtime.validState(bad),false);}
});

test('builder visit requires a named explicit walk and actual arrival; three lines stay private and preserve every item',()=>{
    let s=introduceFixture();const practice=runtime.game.practice,target=s.game.walk.builder.target,protocol=require('../scripts/experimental/native_practice'),bag=structuredClone(s.game.inventory);
    s=directed(s,'Which forest?',{focus:{targetId:target,quote:'Which forest?'}});s=directed(s,'Yes',{confirmation:{targetId:target,quote:'Yes'}});
    for(const input of ['Yes','Walk to meet the builder?','Do not walk to meet the builder','Say "walk to the builder"']){
        const b=runtime.begin(s,input,'en'),r={...response(b.packet),terms:[],focus:null,confirmation:null,action:{kind:'walk',targetId:target,quote:input}};assert.equal(runtime.validResult(r,b.packet),false);}
    s=directed(s,'Walk to that forest to meet the builder. '+ 'This is a longer original player message. '.repeat(30),{action:{kind:'walk',targetId:target,quote:'Walk to that forest to meet the builder'}});
    assert.equal(s.game.walk.encounter.npc,undefined,'a request alone is not a meeting');assert.ok(runtime.validState(s));
    for(let i=0;i<2000&&s.game.mode==='move';i++)runtime.game.tick(s.game,.1);assert.equal(s.game.walk.encounter.npc,'building');assert.ok(runtime.validState(s));
    runtime.game.walk.roam(s.game,0);runtime.game.walk.roam(s.game,runtime.game.walk.stayMs);assert.equal(s.game.walk.encounter.phase,'pending','an unrelated adventurer departure cannot cancel a builder arrival');
    const p=practice.create(s.game,s.game.walk.encounter);assert.equal(p.npc,'building');
    for(const slot of ['offer','decision','feedback']){const packet=protocol.packet(s,p,slot);assert.ok(protocol.protocol.valid(packet));assert.deepEqual(packet.previous,[]);
        for(const key of ['relationship','exchange','collection','hunger','fatigue'])assert.equal(packet.context[key],undefined);
        assert.deepEqual(packet.context.experience,[]);assert.ok(JSON.stringify(packet.context).length<=1200);assert.ok(JSON.stringify({context:packet.context,recent:packet.recent,previous:packet.previous}).length<=4000);
        const result={text:slot==='offer'?'Hello. I survey trees in these forests.':slot==='decision'?'Hello, the adventurer told me about you.':'Nice to meet you.',choice:slot==='decision'?'decline':null};
        assert.ok(protocol.validResult(result,slot,packet.context));finishLine(s.game,slot,result);assert.ok(runtime.validState(s));}
    assert.equal(p.phase,'done');assert.equal(practice.due(p),null);assert.equal(p.lines.length,3);assert.deepEqual(s.game.inventory,bag);
    assert.ok(s.game.walk.builder.met);assert.equal(practice.relationship(s.game).hearts,3);
    const adventurer=arrived(s,s.game.walk.roaming.target);practice.create(adventurer.game,adventurer.game.walk.encounter);
    const packet=protocol.packet(adventurer,practice.current(adventurer.game),'offer');assert.ok(packet.previous.every(l=>!l.text.includes('survey trees in these forests')),'builder dialogue never enters adventurer recall');
});

test('builder moves only between actual reachable forests, respects holds and never leaks live location or fabricates a meeting',()=>{
    let s=introduceFixture();const walk=runtime.game.walk,b=s.game.walk.builder,original=structuredClone(practiceIntroduction(s.game));
    function practiceIntroduction(g){return runtime.game.practice.introduction(g);}
    const target=b.target,deadline=b.nextAt;assert.equal(walk.roamBuilder(s.game,deadline-1),false);assert.equal(walk.roamBuilder(s.game,deadline,true),false);
    assert.equal(walk.roamBuilder(s.game,deadline),true);assert.notEqual(b.target,target);assert.ok(walk.forest(b.target));assert.ok(walk.plan(s.game,b.target));
    assert.deepEqual(practiceIntroduction(s.game),original);assert.ok(runtime.validState(s));
    s=directed(s,'Which forest?',{focus:{targetId:target,quote:'Which forest?'}});s=directed(s,'Yes',{confirmation:{targetId:target,quote:'Yes'}});
    s=directed(s,'Walk to the forest to meet the builder',{action:{kind:'walk',targetId:target,quote:'Walk to the forest to meet the builder'}});
    const previous=s.game.walk.encounter.id;for(let i=0;i<2000&&s.game.mode==='move';i++)runtime.game.tick(s.game,.1);
    assert.equal(s.game.walk.encounter.id,previous,'the old introduction does not guarantee a meeting');assert.ok(runtime.validState(s));
    const bad=structuredClone(s);bad.game.walk.builder.target='chip:mountain_gift';assert.equal(runtime.validState(bad),false);
    assert.ok(!JSON.stringify(runtime.game.supply(s.game)).includes('builder'));
});

test('builder session preserves three-slot saves, Charon ownership, deadlines and reload without a new call',async()=>{
    const {createSession}=require('../scripts/experimental/native_store'),protocol=require('../scripts/experimental/native_practice');let saved=introduceFixture(),time=0,now=saved.game.walk.builder.nextAt-runtime.game.walk.stayMs;
    saved.game.walk.encounter.phase='done';const calls=[],store={load:()=>({ok:true,value:structuredClone(saved)}),save:s=>{assert.ok(runtime.validState(s));saved=structuredClone(s);return {ok:true};}};
    const make=()=>createSession({store,clock:()=>time,wallClock:()=>now,responder:{cancel(){},dispose(){},async reply(p){const target=p.practice.introduction.target;return {ok:true,proposal:{...response(p),terms:[],focus:null,confirmation:null,
        ...(p.input==='Which forest?'?{focus:{targetId:target,quote:p.input}}:p.input==='Yes'?{confirmation:{targetId:target,quote:p.input}}:{action:{kind:'walk',targetId:target,quote:p.input}})}};}},
        practiceResponder:{cancel(){},dispose(){},async reply(p){calls.push(p);assert.ok(protocol.protocol.valid(p));return {ok:true,proposal:{text:'Builder '+p.stage,choice:p.stage==='decision'?'decline':null}};}}});
    const session=make();assert.ok(session.load().ok);const deadline=saved.game.walk.builder.nextAt;
    for(const text of ['Which forest?','Yes','Walk to the forest to meet the builder'])assert.ok((await session.submit(text,'en')).ok);
    for(let i=0;i<2000&&session.load().state.game.mode==='move';i++){time+=100;assert.ok(session.pulse(false).ok);}
    const id=saved.game.walk.encounter.id,intro=session.mentorIntro(id);assert.equal(intro.npc,'building');assert.equal(intro.video,'building');assert.equal(intro.automatic,true);
    for(const slot of ['offer','decision','feedback']){assert.ok((await session.practiceNext(id)).ok);assert.equal(session.practiceLine(id,slot).slot,slot);}
    assert.equal(calls.length,3);assert.deepEqual(calls.map(p=>p.stage),['offer','decision','feedback']);assert.equal(saved.game.walk.builder.nextAt,deadline);
    const first=saved.game.walk.builder.target;now=deadline+1;session.pulse(true);assert.equal(saved.game.walk.builder.target,first);session.mentorStop();assert.notEqual(saved.game.walk.builder.target,first);
    assert.equal(calls.length,3);assert.equal((await session.practiceNext(id)).ok,false);
    const kept=structuredClone(saved);session.dispose();const reopened=make();assert.ok(reopened.load().ok);assert.equal(calls.length,3);assert.ok(reopened.load().state.game.walk.builder.met);assert.deepEqual(saved.game.inventory,kept.game.inventory);reopened.dispose();
});

test('failed introduction persistence and cancelled delayed offers never create introduction history or a builder',async()=>{
    const {createSession}=require('../scripts/experimental/native_store');
    for(const mode of ['save','cancel']){const f=introductionFixture();let saved=structuredClone(f.s),release,calls=0;
        const session=createSession({store:{load:()=>({ok:true,value:structuredClone(saved)}),save:s=>{assert.ok(runtime.validState(s));if(mode==='save'&&runtime.game.practice.introduction(s.game))return {ok:false,reason:'io'};saved=structuredClone(s);return {ok:true};}},
            responder:{cancel(){},dispose(){},reply(){throw Error('No normal call expected');}},practiceResponder:{cancel(){},dispose(){},async reply(){calls++;if(mode==='cancel')await new Promise(r=>release=r);const text='The builder surveys trees in the other forest.';return {ok:true,proposal:{text,choice:null,introduction:{quote:text}}};}}});
        const id=saved.game.walk.encounter.id;assert.ok(session.mentorIntro(id).ok);const pending=session.practiceNext(id);
        if(mode==='cancel'){session.cancel();release();}
        const result=await pending;assert.equal(result.ok,false);assert.equal(result.error,mode==='save'?'save':'cancelled');assert.equal(runtime.game.practice.introduction(saved.game),null);assert.equal(saved.game.walk.builder,undefined);
        assert.equal(calls,1);session.dispose();}
});

test('builder visit aliases retain explicit movement and forest boundaries in seven languages',()=>{
    const walk=runtime.game.walk;
    for(const input of ['建築士に会いにその森へ歩いて行って','Walk to the forest to meet the builder','请去森林找建筑师','Иди в лес к строителю','Ve al bosque a ver al constructor','Vá à floresta encontrar o construtor','Geh in den Wald zum Architekten'])assert.ok(walk.builderDirective(input),input);
    for(const input of ['Yes','はい','建築士の意味を教えて','建築士に会いに行かないで','Do not walk to the builder','Walk to the builder?'])assert.equal(walk.builderDirective(input),false,input);
});
function reconfirmed(s){return s.game.walk.confirmed?{state:s,target:s.game.walk.confirmed.targetId}:confirmed(s);}
function giftEncounter(s,type,accepted=true,delta=0){const first=reconfirmed(s);s=arrived(first.state,first.target);const p=runtime.game.practice.create(s.game,s.game.walk.encounter);
    finishLine(s.game,'offer');const quote='I would like to give you '+type;finishLine(s.game,'decision',{text:quote,choice:'decline',gift:{type,quote}});assert.equal(p.phase,'feedback');
    const reaction=accepted?'Thank you, I accept it.':'Please keep it, I do not want it.';
    finishLine(s.game,'feedback',{text:reaction,giftResponse:{accepted,quote:reaction},affinity:{delta,kind:'gift',quote,reason:'An actual response to this gift.'}});assert.ok(runtime.validState(s));return s;}

test('collection saves and reloads on real island ground beyond viewport coordinate bounds',()=>{
    const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
    const folder=fs.mkdtempSync(path.join(os.tmpdir(),'native-ground-coordinates-'));
    const store=require('../scripts/experimental/native_store').createStore(folder),practice=runtime.game.practice;
    try{for(const offset of [{x:900,y:500},{x:-900,y:-500}])for(const free of [false,true]){
        let s=gatheringState(offset);
        if(free)s=freely(s,'wood');else{const first=confirmed(s);s=arrived(first.state,first.target);practice.create(s.game,s.game.walk.encounter);}
        const p=practice.current(s.game);let savedEvents=-1;
        for(let i=0;i<2400&&p.phase!=='done';i++){
            const slot=practice.due(p);if(slot)finishLine(s.game,slot,{choice:slot==='decision'?'accept':null});
            runtime.game.tick(s.game,.1);
            if(p.events.length!==savedEvents){assert.ok(runtime.validState(s),p.phase);assert.equal(store.save(s).ok,true,p.phase);
                const loaded=store.load();assert.equal(loaded.ok,true);assert.deepEqual(loaded.value,s);savedEvents=p.events.length;}
        }
        assert.equal(p.phase,'done');assert.equal(practice.possessions(s.game)[practice.context(s.game).collection.type],2);
        assert.ok(p.events.some(e=>e.kind==='arrived'&&(e.y>1||e.y<0)));
        assert.equal(store.save(s).ok,true);assert.ok(runtime.validState(store.load().value));
        for(const x of [NaN,Infinity,p.events[0].x+10/800]){
            const bad=structuredClone(s);practice.current(bad.game).events.find(e=>e.kind==='arrived').x=x;
            assert.equal(runtime.validState(bad),false,'non-finite and off-ground arrivals remain invalid');
            assert.equal(store.save(bad).ok,false);
        }
    }}finally{fs.rmSync(folder,{recursive:true,force:true});}
});

test('free collection follows explicit multilingual requests, physically searches twice, waits for remarks and never meets a mentor',()=>{
    const practice=runtime.game.practice;
    for(const input of ['森で花を探して','Collect flowers in the forest','在森林收集花','Собери цветы в лесу','Recoge flores en el bosque','Colete flores na floresta','Sammle Blumen im Wald']){
        let s=freely(gatheringState(),'flower',input),p=practice.current(s.game);assert.ok(runtime.validState(s));assert.equal(s.game.walk.encounter,null);assert.equal(s.game.walk.met,false);
        const malformed=structuredClone(s);delete practice.current(malformed.game).target;assert.equal(runtime.validState(malformed),false);
        for(let i=0;i<1000&&!practice.due(p);i++)runtime.game.tick(s.game,.1);assert.equal(practice.due(p),'observe1');assert.equal(s.game.inventory.items.length,1);
        const before=structuredClone(s.game);for(let i=0;i<30;i++)runtime.game.tick(s.game,.1);assert.equal(s.game.x,before.x);assert.equal(p.events.length,before.practices.at(-1).events.length);
        completeCollection(s.game);assert.equal(p.lines.length,2);assert.equal(s.game.inventory.items.length,2);assert.equal(s.game.walk.encounter,null);assert.ok(runtime.validState(s));
        assert.equal(practice.targets(s.game).find(t=>t.id===p.target).types.includes('flower'),false);assert.equal(practice.relationship(s.game).hearts,1);}
    for(const input of ['はい','yes','Collect flowers?','Do not collect flowers','「森で花を探して」','森で花を探さないで','Не собирай цветы','Não colete flores','Sammle nicht Blumen','不要收集花','No recojas flores'])assert.equal(practice.gatheringDirective(input),false,input);
    const s=gatheringState(),b=runtime.begin(s,'Collect water','en'),target=b.packet.inventory.targets[0],r={...response(b.packet),terms:[],focus:null,confirmation:null,gather:{type:'water',targetId:target.id,quote:b.packet.input}};
    assert.equal(runtime.validResult(r,b.packet),false,'no canteen means no water');assert.equal(s.game.inventory,undefined);
    assert.equal(runtime.validResult({...r,gather:{type:'flower',targetId:'chip:palms_fake',quote:b.packet.input}},b.packet),false);
});

test('one canteen is awarded only with actual first collection success and an accepted mentor line, including existing saves',()=>{
    const practice=runtime.game.practice,first=confirmed(gatheringState());let s=arrived(first.state,first.target),p=practice.create(s.game,s.game.walk.encounter);
    assert.equal(practice.bottle(s.game),'none');finishLine(s.game,'offer');assert.equal(practice.bottle(s.game),'none');completeCollection(s.game);
    assert.equal(practice.bottle(s.game),'empty');assert.equal(p.bottleAward.source,p.id);assert.equal(p.bottleAward.slot,'feedback');assert.ok(runtime.validState(s));
    const old=structuredClone(s);delete old.game.practices[0].bottleAward;delete old.game.practices[0].exchange;assert.ok(runtime.validState(old));
    assert.equal(practice.bottle(runtime.upgrade(old).game),'none','loading does not award anything');
    const next=reconfirmed(old);s=arrived(next.state,next.target);p=practice.create(s.game,s.game.walk.encounter);assert.equal(practice.bottle(s.game),'none');
    const packet=require('../scripts/experimental/native_practice').packet(s,p,'offer');assert.equal(packet.context.exchange.award,true);finishLine(s.game,'offer');assert.equal(practice.bottle(s.game),'empty');assert.ok(runtime.validState(s));
    finishLine(s.game,'decision',{choice:'decline'});const again=reconfirmed(s);s=arrived(again.state,again.target);p=practice.create(s.game,s.game.walk.encounter);finishLine(s.game,'offer');assert.equal(p.bottleAward,undefined);assert.ok(runtime.validState(s));
});

test('accepted and refused gifts preserve immutable acquisition evidence, actual history and tentative private memories',()=>{
    const practice=runtime.game.practice;let s=freely(gatheringState(),'flower');completeCollection(s.game);s=directed(s,'Remember my inventory');
    const old=structuredClone(s.turns.at(-1));s=giftEncounter(s,'flower',true,1);assert.equal(practice.possessions(s.game).flower,1);assert.equal(s.game.inventory.spent.length,1);
    assert.equal(practice.allItems(s.game).filter(i=>i.type==='flower').length,2);assert.deepEqual(s.turns.find(t=>t.id===old.id),old);assert.equal(practice.relationship(s.game).hearts,2);
    const record=practice.current(s.game),protocol=require('../scripts/experimental/native_practice'),self=protocol.packet(s,record,'decision'),npc=protocol.packet(s,record,'feedback');
    assert.equal(self.context.exchange.taste,undefined);assert.ok(self.context.exchange.memory.length<=3);assert.equal(npc.context.exchange.available,undefined);assert.equal(npc.context.exchange.memory,undefined);assert.equal(npc.context.exchange.offered,'flower');
    s=giftEncounter(s,'flower',false,-1);assert.equal(practice.possessions(s.game).flower,1);assert.equal(s.game.inventory.spent.length,1);assert.equal(practice.relationship(s.game).hearts,1);
    assert.equal(practice.giftMemory(s.game).length,2);assert.equal(practice.giftMemory(s.game)[1].accepted,false);
    const forged=structuredClone(s);forged.game.inventory.spent[0].item.type='wood';assert.equal(runtime.validState(forged),false);
    const duplicate=structuredClone(s);duplicate.game.inventory.items.push(structuredClone(duplicate.game.inventory.spent[0].item));assert.equal(runtime.validState(duplicate),false);
    assert.equal(practice.targets(s.game).find(t=>t.types.includes('wood')).types.includes('flower'),false,'giving never replenishes the site');
});

test('water requires a real awarded empty canteen, fills once, survives reload and leaves the canteen when gifted',()=>{
    const practice=runtime.game.practice,first=confirmed(gatheringState());let s=arrived(first.state,first.target);practice.create(s.game,s.game.walk.encounter);completeCollection(s.game);
    s=freely(s,'water','Fetch water in the forest');assert.equal(practice.context(s.game).collection.goal,1);completeCollection(s.game);assert.equal(practice.possessions(s.game).water,1);assert.equal(practice.bottle(s.game),'full');assert.ok(runtime.validState(JSON.parse(JSON.stringify(s))));
    assert.ok(practice.targets(s.game).every(t=>!t.types.includes('water')),'full canteen cannot be filled again');
    s=giftEncounter(s,'water',true,0);assert.equal(practice.bottle(s.game),'empty');assert.equal(practice.possessions(s.game).water,0);
    s=freely(s,'water','Fetch water in the forest');completeCollection(s.game);assert.equal(practice.bottle(s.game),'full');assert.ok(runtime.validState(s));
    s=giftEncounter(s,'water',true,0);assert.equal(practice.bottle(s.game),'empty');
    const water=practice.allItems(s.game).filter(i=>i.type==='water');assert.equal(water.length,2);assert.equal(practice.targets(s.game).find(t=>t.id===water[0].target).types.includes('water'),false);
});

test('gift protocol rejects unavailable, forged, forced acceptance and unquoted outcomes; task material is reserved',()=>{
    const practice=runtime.game.practice,protocol=require('../scripts/experimental/native_practice'),first=confirmed(gatheringState());let s=arrived(first.state,first.target),p=practice.create(s.game,s.game.walk.encounter);completeCollection(s.game);
    const again=reconfirmed(s);s=arrived(again.state,again.target);p=practice.create(s.game,s.game.walk.encounter);finishLine(s.game,'offer');finishLine(s.game,'decision',{choice:'accept'});
    for(let i=0;i<1500&&p.phase!=='report';i++){const slot=practice.due(p);if(slot)finishLine(s.game,slot);runtime.game.tick(s.game,.1);}assert.equal(p.phase,'report');
    const c=protocol.packet(s,p,'report').context,r={text:'Have a flower',choice:null,gift:{type:'flower',quote:'Have a flower'}};
    assert.equal(protocol.validResult(r,'report',c),false);assert.ok(c.exchange.available[p.target.startsWith('chip:mountain_')?'stone':'wood']>=0);
    assert.equal(protocol.validResult({...r,gift:{type:'wood',quote:'fabricated'}},'report',c),false);
    const feedback={...c,exchange:{offered:'water',taste:1,award:false}};assert.equal(protocol.validResult({text:'Thanks',choice:null},'feedback',feedback),false);
    assert.equal(protocol.validResult({text:'Thanks',choice:null,giftResponse:{accepted:'yes',quote:'Thanks'}},'feedback',feedback),false);
});

test('gift transfer is saved atomically and a failed or cancelled response never consumes or scores the item',async()=>{
    const practice=runtime.game.practice,{createSession}=require('../scripts/experimental/native_store');
    for(const kind of ['save','cancel']){let saved=freely(gatheringState(),'flower');completeCollection(saved.game);const first=reconfirmed(saved);saved=arrived(first.state,first.target);
        const id=saved.game.walk.encounter.id;let fail=false,release,calls=0;const store={load:()=>({ok:true,value:structuredClone(saved)}),save:s=>{if(fail&&practice.current(s.game)?.attempts.feedback==='complete')return {ok:false,reason:'io'};assert.ok(runtime.validState(s));saved=structuredClone(s);return {ok:true};}};
        const responder={cancel(){},dispose(){},async reply(){throw Error('no normal generation');}},practiceResponder={cancel(){},dispose(){},async reply(p){calls++;
            const quote='I would like to give you a flower.';
            if(p.stage==='feedback'&&kind==='cancel')await new Promise(resolve=>release=resolve);
            return {ok:true,proposal:p.stage==='offer'?{text:'Hello.',choice:null}:p.stage==='decision'?{text:quote,choice:'decline',gift:{type:'flower',quote}}:
                {text:'Thank you.',choice:null,giftResponse:{accepted:true,quote:'Thank you.'},affinity:{delta:1,kind:'gift',quote,reason:'A kind gift.'}}};}};
        const session=createSession({store,responder,practiceResponder});session.load();assert.ok(session.mentorIntro(id).ok);assert.ok((await session.practiceNext(id)).ok);assert.ok((await session.practiceNext(id)).ok);
        fail=kind==='save';const pending=session.practiceNext(id);if(kind==='cancel'){for(let i=0;i<50&&!release;i++)await new Promise(resolve=>setImmediate(resolve));assert.ok(release);session.cancel();release();}
        const result=await pending;assert.equal(result.error,kind==='save'?'save':'cancelled');assert.equal(saved.game.inventory.items.filter(i=>i.type==='flower').length,2);assert.equal(saved.game.inventory.spent,undefined);assert.equal(practice.relationship(saved.game).hearts,1);
        session.dispose();fail=false;const reopened=createSession({store,responder,practiceResponder});assert.ok(reopened.load().ok);assert.equal(practice.current(saved.game).phase,'failed');assert.equal((await reopened.practiceNext(id)).ok,false);assert.equal(calls,3);reopened.dispose();}
});

test('gift reception cites only actual earlier reactions and never reveals hidden tastes or creates taught memories',()=>{
    const practice=runtime.game.practice,protocol=require('../scripts/experimental/native_practice');let s=freely(gatheringState(),'flower');completeCollection(s.game);s=giftEncounter(s,'flower');
    const first=reconfirmed(s);s=arrived(first.state,first.target);const p=practice.create(s.game,s.game.walk.encounter);finishLine(s.game,'offer');
    const packet=protocol.packet(s,p,'decision'),memory=packet.context.exchange.memory[0],r={text:'I remember the reaction.',choice:'decline',reception:{source:memory.id,quote:memory.text,text:'Maybe flowers are welcome.'}};
    assert.ok(protocol.validResult(r,'decision',packet.context));assert.equal(protocol.validResult({...r,reception:{...r.reception,source:p.id}},'decision',packet.context),false);
    finishLine(s.game,'decision',r);assert.ok(runtime.validState(s));assert.equal(practice.giftMemory(s.game)[0].thought,r.reception.text);assert.equal(packet.context.exchange.taste,undefined);
    const bad=structuredClone(s);bad.game.practices.at(-1).reception.quote='Invented reaction';assert.equal(runtime.validState(bad),false);
    assert.ok(s.turns.every(t=>!t.result?.memories.length));
});

test('free outings can start after a walk stopped between ground nodes and visit-only cancellation stays saveable',()=>{
    const practice=runtime.game.practice;let s=gatheringState();s.game.x+=.01;assert.ok(runtime.validState(s));s=freely(s,'flower');assert.ok(runtime.validState(s));completeCollection(s.game);assert.ok(runtime.validState(s));
    const first=reconfirmed(s);s=arrived(first.state,first.target);let p=practice.create(s.game,s.game.walk.encounter);completeCollection(s.game);
    const second=reconfirmed(s);s=arrived(second.state,second.target);p=practice.create(s.game,s.game.walk.encounter);completeCollection(s.game);
    const third=reconfirmed(s);s=arrived(third.state,third.target);p=practice.create(s.game,s.game.walk.encounter);assert.equal(p.visit,true);p.attempts.offer='pending';practice.suspend(s.game);assert.equal(p.phase,'failed');assert.ok(runtime.validState(s));
});

test('an immediate stop snapshots released task reservations even when the following chat generation fails',()=>{
    const practice=runtime.game.practice;let s=freely(gatheringState(),'wood'),p=practice.current(s.game);
    for(let i=0;i<1000&&!practice.due(p);i++)runtime.game.tick(s.game,.1);assert.equal(s.game.inventory.items.length,1);practice.stop(s.game);
    const first=reconfirmed(s);s=arrived(first.state,first.target);p=practice.create(s.game,s.game.walk.encounter);completeCollection(s.game);
    const again=reconfirmed(s);s=arrived(again.state,again.target);p=practice.create(s.game,s.game.walk.encounter);finishLine(s.game,'offer');finishLine(s.game,'decision',{choice:'accept'});
    assert.equal(practice.possessions(s.game).reserved.wood,1);const b=runtime.begin(s,'stop','en');assert.equal(b.packet.inventory.reserved.wood,0);s=runtime.finish(b.state,b.packet.id,b.state.revision,null);assert.ok(runtime.validState(s));assert.equal(p.events.some(e=>e.kind==='returned'),false);
});

test('a later reception in the same encounter cannot rewrite an earlier chat snapshot',()=>{
    const practice=runtime.game.practice;let s=freely(gatheringState(),'flower');completeCollection(s.game);s=giftEncounter(s,'flower');
    const first=reconfirmed(s);s=arrived(first.state,first.target);const p=practice.create(s.game,s.game.walk.encounter);finishLine(s.game,'offer');const memory=practice.giftMemory(s.game)[0],reception={source:memory.id,quote:memory.text,text:'Maybe flowers are welcome.'};
    finishLine(s.game,'decision',{choice:'accept',reception});s=directed(s,'How are you doing?');const original=structuredClone(s.turns.at(-1));
    for(let i=0;i<1500&&p.phase!=='report';i++){const slot=practice.due(practice.current(s.game));if(slot)finishLine(s.game,slot);runtime.game.tick(s.game,.1);if(practice.current(s.game).phase==='report')break;}
    assert.equal(practice.current(s.game).phase,'report');finishLine(s.game,'report',{reception:{...reception,text:'A later different interpretation.'}});finishLine(s.game,'feedback');
    assert.equal(practice.current(s.game).reception.text,reception.text);assert.deepEqual(s.turns.at(-1),original);assert.ok(runtime.validState(s));
});
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
    s=arrived(s,first.target);g=s.game;const again=practice.create(g,g.receipts.findLast(r=>r.kind==='walk'));assert.notEqual(again.target,p.target,'a fresh request avoids exhausted resources');
    completeCollection(g);assert.equal(g.inventory.items.length,4);assert.equal(g.inventory.items.filter(i=>i.target===p.target).length,2,'exhausted chip never replenishes');
    assert.deepEqual(practice.context(g).collection.found,[{step:1,count:1},{step:2,count:1}]);assert.ok(runtime.validState(s));
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
    // Both materials use the same bounded connected ground, independent of the
    // random map's distant resources. This fixture tests physical item integrity.
    for(const [prefix,type]of [['palms','wood'],['mountain','stone']]){const assets={};
        for(let x=100;x<=650;x+=50)assets['ground_'+x]={dx:x-10,dy:190,sx:0,sy:0,sw:20,sh:20,scale:1,img:'fixture',type:'ground'};
        const key=prefix+'_material';assets[key]={dx:420,dy:75,sx:0,sy:0,sw:60,sh:80,scale:1,img:'fixture',type:prefix==='palms'?'nature':'mountain'};
        const fixture={version:1,assets,spawn:{x:300/800,y:200/480},places:[{id:'berry:1',meaning:'berry',assetKey:key,x:450/800,y:200/480},
            {id:'shade',meaning:'rest',assetKey:key,x:500/800,y:200/480},{id:'path',meaning:'walk',x:600/800,y:200/480}]};
        let s=runtime.create({name:'Collector',self:'I',player:'you'},'en',[0,0,0,0,0,0,0],fixture);
        const first=confirmed(s);s=arrived(first.state,first.target);const practice=runtime.game.practice;practice.create(s.game,s.game.receipts.findLast(r=>r.kind==='walk'));completeCollection(s.game);
        assert.ok(s.game.inventory.items.every(i=>i.type===type));assert.equal(s.game.inventory.items.length,2);assert.ok(runtime.validState(s));
        const missing=structuredClone(s);missing.game.inventory.items.pop();assert.equal(runtime.validState(missing),false);
        const fabricated=structuredClone(s);fabricated.game.inventory.items[0].type='berry';assert.equal(runtime.validState(fabricated),false);
        assert.equal(practice.context(s.game).collection.type,type);}
});

test('task status opens and closes by explicit quoted requests in all seven languages without changing gameplay',()=>{
    const commands=[['ja','練習の状況を教えて','課題をしまって'],['en','Show me my task','Close my task'],['zh-CN','给我看任务','收起任务'],['ru','Покажи задание','Закрой задание'],['es-ES','Abre mi tarea','Cierra mi tarea'],['pt-BR','Mostre a tarefa','Feche a tarefa'],['de','Zeige meine Aufgabe','Schließe meine Aufgabe']];
    for(const [locale,open,close]of commands){let s=runtime.create({name:'Pico',self:'I',player:'you'},locale,[0,0,0,0,0,0,0],island);const before=structuredClone(s.game);
        for(const [input,kind]of [[open,'open'],[close,'close']]){const b=runtime.begin(s,input,locale),r={...response(b.packet),terms:[],focus:null,confirmation:null,taskView:{kind,quote:input}};
            assert.ok(runtime.validResult(r,b.packet),input);s=runtime.finish(b.state,b.packet.id,b.state.revision,r);assert.equal(s.game.taskPanelOpen,kind==='open');assert.ok(runtime.validState(s));
            assert.equal(b.packet.taskPanelOpen,undefined,'no extra context field is sent');}
        const after=structuredClone(s.game);delete after.taskPanelOpen;assert.deepEqual(after,before,'no movement, participation, acquisition or practice progress');
        const bad=structuredClone(s);bad.game.taskPanelOpen='yes';assert.equal(runtime.validState(bad),false);}
    const s=runtime.create({name:'Pico',self:'I',player:'you'},'ja',[0,0,0,0,0,0,0],island);
    for(const input of ['はい','課題を見せないで','「課題をみせて」','課題とは何ですか','Show me my task?','Do not show my task','Show me the mountain','練習の意味を教えて','課題をみせてと言って']){
        const b=runtime.begin(s,input,'ja'),r={...response(b.packet),terms:[],focus:null,confirmation:null,taskView:{kind:'open',quote:input}};assert.equal(runtime.validResult(r,b.packet),false,input);}
    const b=runtime.begin(s,'課題をみせて','ja'),r={...response(b.packet),terms:[],focus:null,confirmation:null,taskView:{kind:'open',quote:'練習の状況を教えて'}};assert.equal(runtime.validResult(r,b.packet),false);
    assert.ok(runtime.validResult({...r,taskView:{kind:'open',quote:'課題をみせて'}},b.packet));
    assert.equal(runtime.validResult({...r,taskView:{kind:'open',quote:'課題をみせて'},inventoryView:{kind:'open',quote:'課題をみせて'}},b.packet),false);
});

function practiceFixture(choice='accept'){
    const {createSession}=require('../scripts/experimental/native_store'),protocol=require('../scripts/experimental/native_practice'),calls=[];
    const first=confirmed(runtime.create({name:'Pico',self:'I',player:'you'},'en',[0,0,0,0,0,0,0],island));let saved=arrived(first.state,first.target),time=0,replyChoice=null;
    let hold=null,release=null,saveFailure=null,holdChat=false,releaseChat=null,replyFailure=null;const records=[];
    const make=()=>createSession({record:e=>records.push(e),store:{load:()=>({ok:true,value:structuredClone(saved)}),save:s=>{
        if(saveFailure?.(s))return {ok:false,reason:'io'};assert.ok(runtime.validState(s),'saved practice state must be valid');saved=structuredClone(s);return {ok:true};}},clock:()=>time,
        responder:{cancel(){},dispose(){},async reply(p){calls.push(p);if(holdChat)await new Promise(r=>releaseChat=r);return {ok:true,proposal:{...response(p),terms:[],focus:null,confirmation:null,practiceChoice:replyChoice?{choice:replyChoice,quote:p.input}:null}};}},
        practiceResponder:{cancel(){},dispose(){},async reply(p){assert.ok(protocol.protocol.valid(p));calls.push(p);const result={ok:true,proposal:{text:p.stage==='decision'&&choice==='ask'?'Should I take part in this survey?':'Actual '+p.stage,choice:p.stage==='decision'?choice:null}};
            if(hold===p.stage)await new Promise(r=>release=r);return replyFailure?.(p)||result;}}});
    const session=make(),arrival=saved.game.walk.encounter.id,intro=session.mentorIntro(arrival);assert.ok(intro.practice,'reachable real survey candidate');
    return {session,calls,id:intro.practice,make,get saved(){return saved;},get time(){return time;},advance(n=1){for(let i=0;i<n;i++){time+=100;const r=session.pulse(false);assert.ok(r.ok);}},
        records,replyFailure:fn=>replyFailure=fn,choice:value=>replyChoice=value,hold:stage=>hold=stage,release:()=>release(),holdChat:()=>holdChat=true,releaseChat:()=>releaseChat(),fail:fn=>saveFailure=fn};
}

test('affinity display has quoted commands in seven locales and never changes the relationship or world',()=>{
    const commands=[['ja','好感度を教えて','好感度をしまって'],['en','Show relationships','Close relationships'],['zh-CN','给我看好感度','收起好感度'],['ru','Покажи отношения','Закрой отношения'],['es-ES','Abre las relaciones','Cierra las relaciones'],['pt-BR','Mostre as relações','Feche as relações'],['de','Zeige die Beziehungen','Schließe die Beziehungen']];
    for(const [locale,open,close]of commands){let s=runtime.create({name:'Pico',self:'I',player:'you'},locale,[0,0,0,0,0,0,0],island);const before=structuredClone(s.game);
        for(const [input,kind]of [[open,'open'],[close,'close']]){const b=runtime.begin(s,input,locale),r={...response(b.packet),terms:[],focus:null,confirmation:null,affinityView:{kind,quote:input}};
            assert.ok(runtime.validResult(r,b.packet),input);s=runtime.finish(b.state,b.packet.id,b.state.revision,r);assert.equal(s.game.affinityPanelOpen,kind==='open');assert.ok(runtime.validState(s));}
        const after=structuredClone(s.game);delete after.affinityPanelOpen;assert.deepEqual(after,before);
        s.game.affinityPanelOpen='open';assert.equal(runtime.validState(s),false);}
    const s=runtime.create({name:'Pico',self:'I',player:'you'},'ja',[0,0,0,0,0,0,0],island);
    for(const input of ['はい','好感度を見せないで','「好感度をみせて」','好感度の意味を教えて','Show relationships?','Do not show relationships','Show my task']){
        const b=runtime.begin(s,input,'ja'),r={...response(b.packet),terms:[],focus:null,confirmation:null,affinityView:{kind:'open',quote:input}};assert.equal(runtime.validResult(r,b.packet),false,input);}
    const b=runtime.begin(s,'好感度を教えて','ja'),r={...response(b.packet),terms:[],focus:null,confirmation:null,affinityView:{kind:'open',quote:'好感度を教えて'}};
    assert.equal(runtime.validResult({...r,taskView:{kind:'open',quote:b.packet.input}},b.packet),false);
    assert.equal(runtime.validResult({...r,affinityView:{kind:'open',quote:'Show relationships'}},b.packet),false);
});

test('one actual encounter assessment survives reload, excludes private remarks and cannot be replayed',async()=>{
    const f=practiceFixture(),practice=runtime.game.practice;
    f.replyFailure(p=>p.stage==='feedback'?{ok:true,proposal:{text:'Thank you for your honest report.',choice:null,affinity:{delta:1,kind:'conduct',quote:'Actual report',reason:'You came back and reported honestly.'}}}:null);
    for(let i=0;i<2400&&practice.current(f.saved.game).phase!=='done';i++){
        if(practice.due(practice.current(f.saved.game)))assert.ok((await f.session.practiceNext(f.id)).ok);else f.advance();}
    const s=f.saved,p=practice.current(s.game);assert.equal(practice.relationship(s.game).hearts,2);assert.equal(p.affinity.slot,'feedback');
    assert.equal(f.calls.filter(c=>c.stage).length,6);const packet=f.calls.find(c=>c.stage==='feedback');
    assert.deepEqual(packet.recent.map(l=>l.slot),['offer','decision','report']);assert.equal(packet.context.relationship.hearts,1);
    assert.deepEqual(packet.context.experience,[],'private world experiences are not supplied to the adventurer');
    assert.ok(JSON.stringify(packet.context).length<=1200);assert.ok(JSON.stringify({context:packet.context,recent:packet.recent,previous:packet.previous}).length<=4000);
    assert.equal((await f.session.practiceNext(f.id)).ok,false);assert.equal(practice.relationship(f.saved.game).hearts,2);
    const chat=runtime.begin(s,'Show relationships','en');assert.equal(chat.packet.practice.context.relationship.hearts,2,'normal chat receives the new value after the encounter');assert.ok(runtime.validState(chat.state));
    f.session.dispose();const again=f.make();assert.equal(practice.relationship(again.load().state.game).hearts,2);assert.equal((await again.practiceNext(f.id)).ok,false);again.dispose();
    for(const change of [a=>a.quote='Actual observe1',a=>a.slot='observe1',a=>a.delta=2,a=>a.kind='reward']){const bad=structuredClone(s);change(bad.game.practices.at(-1).affinity);assert.equal(runtime.validState(bad),false);}
    const protocol=require('../scripts/experimental/native_practice');const privateGame=structuredClone(s);privateGame.game.practices.at(-1).decisionAudience='player';
    const filtered=protocol.packet(privateGame,privateGame.game.practices.at(-1),'feedback');assert.deepEqual(filtered.recent.map(l=>l.slot),['offer','report','feedback']);
});

test('hurtful direct speech can lower affinity, apologies can recover it, bounds are clamped without old-history awards',()=>{
    const practice=runtime.game.practice,first=confirmed(runtime.create({name:'Pico',self:'I',player:'you'},'en',[0,0,0,0,0,0,0],island));let s=first.state;
    for(const delta of [...Array(7).fill(1),...Array(8).fill(-1),1]){s=arrived(s,first.target);const p=practice.create(s.game,s.game.receipts.findLast(r=>r.kind==='walk'));
        p.attempts.offer='pending';practice.finish(s.game,'offer',{text:'Would you help?',choice:null});p.attempts.decision='pending';
        const text=delta>0?'I am sorry; I cannot help today.':'Go away, you are worthless.';
        practice.finish(s.game,'decision',{text,choice:'decline',affinity:{delta,kind:'conversation',quote:text,reason:delta>0?'A considerate reply.':'A hurtful reply.'}});assert.ok(runtime.validState(s));
        assert.ok(practice.relationship(s.game).hearts>=0&&practice.relationship(s.game).hearts<=5);}
    assert.equal(practice.relationship(s.game).hearts,1);
    const legacy=structuredClone(s);for(const p of legacy.game.practices){delete p.social;delete p.affinity;delete p.decisionAudience;delete p.introduce;}
    for(const turn of legacy.turns)if(turn.practice)delete turn.practice.context.relationship;
    assert.equal(practice.relationship(legacy.game).hearts,1);assert.ok(runtime.validState(legacy));
});

test('invalid or unperformed affinity evidence and technical failures never reduce hearts',async()=>{
    const f=practiceFixture(),practice=runtime.game.practice;
    f.replyFailure(p=>p.stage==='feedback'?{ok:true,proposal:{text:'Thanks for checking.',choice:null,affinity:{delta:-1,kind:'conduct',quote:'Actual report',reason:'No material.'}}}:null);
    for(let i=0;i<2400&&practice.current(f.saved.game).phase!=='done';i++){if(practice.due(practice.current(f.saved.game)))assert.ok((await f.session.practiceNext(f.id)).ok);else f.advance();}
    assert.equal(practice.current(f.saved.game).affinity,undefined);assert.equal(practice.relationship(f.saved.game).hearts,1);f.session.dispose();
    const failure=practiceFixture();failure.replyFailure(()=>({ok:false,error:'output'}));await failure.session.practiceNext(failure.id);assert.equal(practice.relationship(failure.saved.game).hearts,1);failure.session.dispose();
});

test('a failed final reply keeps the actual report, records only fixed failure facts and never retries',async()=>{
    const f=practiceFixture(),practice=runtime.game.practice;
    f.replyFailure(p=>p.stage==='feedback'?{ok:false,error:'output',diagnostic:{version:1,reason:'protocol_decode',exitCode:0,raw:'never retain this'}}:null);
    for(let i=0;i<2400&&practice.current(f.saved.game).phase!=='failed';i++){
        const p=practice.current(f.saved.game);if(practice.due(p))await f.session.practiceNext(f.id);else f.advance();}
    const p=practice.current(f.saved.game);assert.equal(p.phase,'failed');assert.equal(p.lines.at(-1).slot,'report');
    assert.equal(p.lines.length,5);assert.equal(f.calls.length,6);assert.ok(p.events.some(e=>e.kind==='returned'));
    const event=f.records.filter(e=>e.kind==='practice_result').at(-1);
    assert.deepEqual(event.diagnostic,{version:1,reason:'protocol_decode',exitCode:0});assert.equal(event.result,null);
    assert.equal((await f.session.practiceNext(f.id)).ok,false);assert.equal(f.calls.length,6);
    f.session.dispose();const next=f.make();assert.ok(next.load().ok);assert.equal((await next.practiceNext(f.id)).ok,false);next.dispose();
});

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
    scope.NativePracticeUI.pending=false;g.route=[];g.practices=[{phase:'survey',target:'chip:palms_1',gather:true,suspended:false,route:[],surveyIndex:0,events:[],attempts:{}}];
    const position={x:g.x,y:g.y};scope.NativeScene.draw(g,0,false);const left=scope.aiPet.flip;
    scope.NativeScene.draw(g,1.2,false);assert.notEqual(scope.aiPet.flip,left,'searching looks both ways');assert.deepEqual({x:g.x,y:g.y},position);
    assert.deepEqual(draws.at(-1),['idle','inside',true],'stationary search does not walk in place or draw an extra circle');
    const facing=scope.aiPet.flip;scope.NativeScene.draw(g,2.4,true);assert.equal(scope.aiPet.flip,facing,'reduced motion keeps a stable direction');
    scope.NativePracticeUI.pending=true;scope.NativeScene.draw(g,2.4,false);assert.equal(scope.aiPet.flip,facing,'speaking and generation hold the search motion');
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
    const session=createSession(options);assert.deepEqual(session.load().state.mentorConversations,recovered.mentorConversations);assert.equal(saves,3,'recovery, resource installation and initial roaming state are saved separately');
    session.load();assert.equal(saves,3);assert.equal(calls,0);session.dispose();
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
    ({state:s,target}=confirmed(s));s=directed(s,'walk there',{action:{kind:'walk',targetId:target,quote:'walk there'}});
    // A random map may put the destination within one tick. Stop the pending
    // movement before ticking so this test always exercises the stop boundary.
    assert.equal(s.game.mode,'move');
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

test('civil calendar uses the selected time zone and language default hemisphere, with explicit overrides',()=>{
    const c=runtime.game.walk.calendar,at=Date.UTC(2026,10,30,23,30);
    const tokyo=c.snapshot(at,{zone:'Asia/Tokyo',hemisphere:'language'},'ja');assert.equal(tokyo.date,'2026-12-01');assert.equal(tokyo.time,'08:30');assert.equal(tokyo.season,'winter');
    const brazil=c.snapshot(at,{zone:'America/Sao_Paulo',hemisphere:'language'},'pt-BR');assert.equal(brazil.date,'2026-11-30');assert.equal(brazil.season,'spring');assert.ok(c.valid(brazil));
    assert.equal(c.snapshot(at,{zone:'Asia/Tokyo',hemisphere:'south'},'en').season,'summer');
    assert.equal(c.snapshot(at,{zone:'UTC',hemisphere:'language'},'en').season,'autumn');
    assert.equal(c.valid({...tokyo,date:'2026-02-30'}),false);assert.equal(c.valid({...tokyo,season:'summer'}),false);
    assert.equal(c.validSettings({zone:'missing/place',hemisphere:'north'}),false);assert.equal(c.validSettings({zone:'UTC',hemisphere:'north',location:'private'}),false);
});

test('roaming changes only to a reachable real place, keeps its deadline, and gates actual arrival',()=>{
    const s=gatheringState(),g=s.game,w=runtime.game.walk;assert.ok(w.roam(g,100));const first=g.walk.roaming.target,deadline=g.walk.roaming.nextAt;
    assert.equal(w.roam(g,deadline-1),false);assert.equal(w.roam(g,deadline+1,true),false);assert.equal(g.walk.roaming.nextAt,deadline);
    assert.ok(w.roam(g,deadline+200));assert.notEqual(g.walk.roaming.target,first);assert.ok(w.plan(g,g.walk.roaming.target));assert.ok(runtime.validState(s));
    const destination=first;g.mode='move';g.intent='walk';g.destination=destination;g.cause='turn-1';g.route=w.plan(g,destination);
    for(let i=0;i<2000&&g.mode==='move';i++)runtime.game.tick(g,.1);assert.equal(g.walk.encounter,null,'arrival at an absent adventurer is ordinary arrival');
    g.mode='move';g.intent='walk';g.destination=g.walk.roaming.target;g.cause='turn-1';g.route=w.plan(g,g.destination);
    for(let i=0;i<2000&&g.mode==='move';i++)runtime.game.tick(g,.1);assert.equal(g.walk.encounter.target,g.walk.roaming.target);
    g.mode='move';g.intent='walk';g.destination=first;g.cause='turn-1';g.route=w.plan(g,first);const route=structuredClone(g.route),oldPlace=g.walk.roaming.target;
    assert.ok(w.roam(g,g.walk.roaming.nextAt+1));assert.notEqual(g.walk.roaming.target,oldPlace);assert.equal(g.mode,'move');assert.deepEqual(g.route,route,'ordinary walking does not pin the NPC or change the companion route');
});

test('calendar snapshots remain historical across language and region changes; no hidden NPC position leaks',()=>{
    let s=gatheringState();runtime.game.walk.roam(s.game,100);const at=Date.UTC(2026,11,1,0,1);
    s.game.calendarSettings={zone:'UTC',hemisphere:'language'};const a=runtime.begin(s,'hello','pt-BR',at);assert.equal(a.packet.calendar.season,'summer');
    s=runtime.finish(a.state,a.packet.id,a.state.revision,{...response(a.packet),terms:[],focus:null,confirmation:null});
    s.game.calendarSettings={zone:'Asia/Tokyo',hemisphere:'north'};const b=runtime.begin(s,'hello again','en',at+1000);
    assert.equal(b.packet.calendar.season,'winter');assert.equal(runtime.packet(b.state,b.state.turns[0]).calendar.season,'summer');assert.ok(runtime.validState(b.state));
    assert.equal(Object.hasOwn(runtime.game.supply(s.game),'adventurer'),false,'even an on-screen stay is not observable before entry');
    const historical=structuredClone(s);historical.turns[0].world.adventurer=historical.game.walk.roaming.target;assert.ok(runtime.validState(historical),'original saved location metadata remains readable without rewriting history');
    s.game.walk.roaming.target=null;assert.equal(Object.hasOwn(runtime.game.supply(s.game),'adventurer'),false);
    const target=runtime.game.practice.targets(s.game).find(t=>t.reachable).id,id='event-'+(s.game.receipts.length+1);
    s.game.receipts.push({id,kind:'walk',target,label:'Forest',at:s.game.elapsed,cause:null,hunger:.35,fatigue:.15});
    const p=runtime.game.practice.create(s.game,{id,target});assert.ok(p);
    const packet=require('../scripts/experimental/native_practice').packet(s,p,'offer',at);assert.ok(packet.context.calendar);assert.ok(JSON.stringify(packet.context).length<=1200);
});

test('overdue conversations depart on close, never renew their stay, and reload generates nothing',async()=>{
    const {createSession}=require('../scripts/experimental/native_store');let saved=gatheringState(),now=1000,calls=0;
    // Seed a genuine arrived encounter and preserve its place on the first upgrade.
    const target=runtime.game.practice.targets(saved.game).find(t=>t.reachable).id;
    saved.game.receipts.push({id:'event-'+(saved.game.receipts.length+1),kind:'walk',target,label:'Forest',at:saved.game.elapsed,cause:null,hunger:.35,fatigue:.15});
    const id=saved.game.receipts.at(-1).id;saved.game.walk.encounter={id,target,phase:'pending'};
    const options={wallClock:()=>now,store:{load:()=>({ok:true,value:structuredClone(saved)}),save:s=>{assert.ok(runtime.validState(s));saved=structuredClone(s);return {ok:true};}},responder:{cancel(){},dispose(){}},
        practiceResponder:{cancel(){},dispose(){},async reply(){calls++;return {ok:true,proposal:{text:'Hello.',choice:null}};}}};
    const session=createSession(options);session.load();const deadline=saved.game.walk.roaming.nextAt;assert.ok(session.mentorIntro(id).ok);assert.ok((await session.practiceNext(id)).ok);
    now=deadline+5000;session.pulse(true);assert.equal(saved.game.walk.roaming.target,target);assert.equal(saved.game.walk.roaming.nextAt,deadline);
    session.mentorStop();assert.notEqual(saved.game.walk.roaming.target,target);assert.equal(runtime.game.practice.current(saved.game).phase,'stopped');assert.equal(calls,1);
    const departed=saved.game.walk.roaming.target;assert.equal(session.mentorIntro(id).ok,false);session.dispose();
    const reopened=createSession(options);reopened.load();assert.equal(saved.game.walk.roaming.target,departed);assert.equal(calls,1);reopened.dispose();
});

test('an accepted collection keeps its report place until the final conversation closes',()=>{
    const s=gatheringState(),g=s.game,w=runtime.game.walk,practice=runtime.game.practice;w.roam(g,0);
    const id='event-'+(g.receipts.length+1);g.receipts.push({id,kind:'walk',target:g.walk.roaming.target,label:'Forest',at:g.elapsed,cause:null,hunger:.35,fatigue:.15});
    const p=practice.create(g,{id,target:g.walk.roaming.target});assert.ok(p);p.attempts.offer='pending';practice.finish(g,'offer',{text:'Please help.',choice:null});p.attempts.decision='pending';practice.finish(g,'decision',{text:'I will.',choice:'accept'});
    const target=g.walk.roaming.target,deadline=g.walk.roaming.nextAt;assert.equal(w.roam(g,deadline+1),false);assert.equal(g.walk.roaming.target,target);
    for(let i=0;i<2400&&p.phase!=='done';i++){const slot=practice.due(p);if(slot){p.attempts[slot]='pending';practice.finish(g,slot,{text:'Actual '+slot,choice:null});}runtime.game.tick(g,.1);}
    assert.equal(p.phase,'done');assert.equal(w.roam(g,deadline+1,true),false);assert.ok(w.roam(g,deadline+1));assert.notEqual(g.walk.roaming.target,target);
});

test('calendar settings save without calls or deadline changes; invalid values and failed saves are rejected',()=>{
    const {createSession}=require('../scripts/experimental/native_store');let saved=gatheringState(),fail=false;
    const session=createSession({wallClock:()=>1000,store:{load:()=>({ok:true,value:structuredClone(saved)}),save:s=>{if(fail)return {ok:false};saved=structuredClone(s);return {ok:true};}},responder:{cancel(){},dispose(){},reply(){throw Error('No generation');}}});
    session.load();const deadline=saved.game.walk.roaming.nextAt;assert.ok(session.calendarSettings({zone:'UTC',hemisphere:'south'}).ok);assert.equal(saved.game.walk.roaming.nextAt,deadline);
    assert.equal(session.calendarSettings({zone:'invalid',hemisphere:'south'}).ok,false);assert.ok(runtime.validState(saved));
    fail=true;assert.equal(session.calendarSettings({zone:'Asia/Tokyo',hemisphere:'north'}).error,'save');assert.equal(saved.game.calendarSettings.zone,'UTC');session.dispose();
});

test('current reunion timing uses actual previous encounter and is supplied only for the new greeting',()=>{
    const s=gatheringState(),g=s.game,practice=runtime.game.practice,w=runtime.game.walk;w.roam(g,1000);
    const target=g.walk.roaming.target,id='event-'+(g.receipts.length+1);g.receipts.push({id,kind:'walk',target,label:'Forest',at:g.elapsed,cause:null,hunger:.35,fatigue:.15});
    const p=practice.create(g,{id,target});assert.ok(p);g.walk.met=true;g.walk.encounter={id,target,phase:'video',at:121000,previous:{at:1000,target}};
    const packets=require('../scripts/experimental/native_practice');assert.deepEqual(packets.packet(s,p,'offer',121000).context.reunion,{minutes:2,place:'same'});
    g.walk.met=false;assert.equal(packets.packet(s,p,'offer',121000).context.reunion,undefined);g.walk.met=true;
    g.walk.encounter.previous.target=Object.keys(g.island.assets).map(k=>'chip:'+k).find(k=>/^chip:mountain_/.test(k)&&k!==target)||'chip:palms_gift';
    if(g.walk.encounter.previous.target===target)g.walk.encounter.previous.target='chip:mountain_gift';
    assert.equal(packets.packet(s,p,'offer',121000).context.reunion.place,'different');assert.equal(packets.packet(s,p,'decision',121000).context.reunion,undefined);
});

test('calendar shares the 2000-character world budget even after stop and target rejection; malformed packets fail safely',()=>{
    let s=runtime.create({name:'Beat',self:'I',player:'you'},'en',[0,0,0,0,0,0,0],island);runtime.game.walk.roam(s.game,1000);
    for(const input of ['hello','no','stop']){const b=runtime.begin(s,input,'en',Date.UTC(2026,11,1));assert.ok(runtime.validPacket(b.packet));assert.ok(JSON.stringify(b.packet.world).length+JSON.stringify(b.packet.calendar).length<=2000);
        assert.equal(runtime.validPacket({...b.packet,world:undefined}),false);assert.equal(runtime.validPacket({...b.packet,calendar:null}),false);
        s=runtime.finish(b.state,b.packet.id,b.state.revision,{...response(b.packet),terms:[],focus:null,confirmation:null});assert.ok(runtime.validState(s));}
});

test('failed departure save blocks progress without adopting a moved location or renewing the original deadline',()=>{
    const {createSession}=require('../scripts/experimental/native_store');let saved=gatheringState(),now=1000,fail=false;
    const options={wallClock:()=>now,store:{load:()=>({ok:true,value:structuredClone(saved)}),save:s=>{if(fail)return {ok:false};saved=structuredClone(s);return {ok:true};}},responder:{cancel(){},dispose(){},reply(){throw Error('No generation');}}};
    const session=createSession(options);session.load();const before=structuredClone(saved.game.walk.roaming);now=before.nextAt+1;fail=true;session.mentorStop();assert.equal(session.load().error,'save');assert.deepEqual(saved.game.walk.roaming,before);session.dispose();
    fail=false;const restarted=createSession(options);assert.ok(restarted.load().ok);assert.notEqual(saved.game.walk.roaming.target,before.target);restarted.dispose();
});

test('closing before the deadline cannot pin an unaccepted proposal across an overdue reload',async()=>{
    const {createSession}=require('../scripts/experimental/native_store');let saved=gatheringState(),now=1000,calls=0;
    const target=runtime.game.practice.targets(saved.game).find(t=>t.reachable).id,id='event-'+(saved.game.receipts.length+1);
    saved.game.receipts.push({id,kind:'walk',target,label:'Forest',at:saved.game.elapsed,cause:null,hunger:.35,fatigue:.15});saved.game.walk.encounter={id,target,phase:'pending'};
    const options={wallClock:()=>now,store:{load:()=>({ok:true,value:structuredClone(saved)}),save:s=>{assert.ok(runtime.validState(s));saved=structuredClone(s);return {ok:true};}},responder:{cancel(){},dispose(){}},practiceResponder:{cancel(){},dispose(){},async reply(){calls++;return {ok:true,proposal:{text:'Would you help?',choice:null}};}}};
    const session=createSession(options);session.load();assert.ok(session.mentorIntro(id).ok);assert.ok((await session.practiceNext(id)).ok);const deadline=saved.game.walk.roaming.nextAt;
    session.mentorStop();assert.equal(saved.game.walk.roaming.target,target);session.dispose();now=deadline+1000;
    const reopened=createSession(options);assert.ok(reopened.load().ok);assert.notEqual(saved.game.walk.roaming.target,target);assert.equal(runtime.game.practice.current(saved.game).phase,'stopped');assert.equal(calls,1);reopened.dispose();
});
