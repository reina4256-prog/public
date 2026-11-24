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
