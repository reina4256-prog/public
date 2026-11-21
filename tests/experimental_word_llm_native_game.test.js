'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const runtime=require('../experimental_word_llm_native_runtime'),base=require('../experimental_word_llm_native');
const island=require('../scripts/experimental/native_island').createIsland();
// Preserve the old physical-loop fixtures as compatibility tests for saved history.
const make=()=>({...base.create({name:'Pico',self:'I',player:'you'},'en'),version:2,game:runtime.game.create([0,0,0,0,0,0,0],island)});
const response=(p,action=null)=>({reply:'I will try.',interpretation:{kind:'request',summary:'A request.'},memories:[],references:[],terms:[{word:p.input,quote:p.input}],action});

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
