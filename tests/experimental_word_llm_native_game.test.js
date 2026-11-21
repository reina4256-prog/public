'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const runtime=require('../experimental_word_llm_native_runtime'),base=require('../experimental_word_llm_native');
const island=require('../scripts/experimental/native_island').createIsland();
const make=()=>runtime.create({name:'Pico',self:'I',player:'you'},'en',[0,0,0,0,0,0,0],island);
const response=(p,action=null)=>({reply:'I will try.',interpretation:{kind:'request',summary:'A request.'},memories:[],references:[],terms:[{word:p.input,quote:p.input}],action});
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
