'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const connection = require('../experimental_word_adventure_connection');
const physical = require('../experimental_word_adventure');
const navigation = require('../experimental_word_island_navigation');
const worldApi = require('../experimental_word_learning_world');
const core = require('../experimental_word_learning_core');
const catalog = connection.language(require('../experimental_word_learning_catalog.json'));
const storage = require('../scripts/experimental/storage');
function setup(options = {}) {
    const context = vm.createContext({ window: { WordIslandMode: true }, console, setTimeout() {}, localStorage: { getItem() { throw Error('legacy'); } } });
    for (const name of ['data.js','island_shared.js']) vm.runInContext(fs.readFileSync(name,'utf8'), context);
    vm.runInContext('var catalog = defaultCatalog;',context);
    const state = core.create(options,catalog), world = worldApi.create();
    navigation.attach(world,JSON.parse(JSON.stringify(vm.runInContext('generateNatureMap()',context))));
    worldApi.setNavigation(navigation.route); connection.init(state,world);
    return {state,world};
}
function rawSay(pair, text, locale = 'ja', labelOnly = false) {
    if(!connection.perceive(pair.state,pair.world))core.perceive(pair.state,worldApi.perception(pair.world));
    const r = core.receive(pair.state,text,catalog,{locale,body:pair.world});
    const reply = connection.receive(pair.state,pair.world,r,locale,labelOnly) || worldApi.respond(pair.world,r,pair.state,catalog);
    return {r,reply};
}
// Physical regression fixtures now enter through the actual mentor conversation.
// The old test shorthand is confined here; it is not a production input route.
function say(pair,text,locale='ja',labelOnly=false) {
    const fixtureNames={'冒険家の課題':'lesson','橋を依頼する':'bridge','橋を建てる':'self','橋の建築を学ぶ':'building','家を依頼する':'home','かばんを作る':'bag','棒を作る':'stick','盾を作る':'shield','携行食を作る':'ration','手当て布を作る':'cloth','スカルへ行く':'skull','クリスタルへ行く':'crystal'};
    const id=fixtureNames[text]||connection.parse(text,locale), projects={bridge:'橋',self:'橋',building:'橋',home:'家',bag:'かばん',stick:'棒',shield:'盾',ration:'携行食',cloth:'手当て布'};
    if(locale!=='ja' || !['lesson','bridge','self','building','home','bag','stick','shield','ration','cloth','skull','crystal','pick'].includes(id))return rawSay(pair,text,locale,labelOnly);
    if(id==='pick' && !pair.state.knowledge.meanings.some(m=>m.id==='action:pick')) {
        const item=pair.state.adventure.items.find(i=>i.location==='ground');
        connection.start(pair.state,pair.world,'pickup',{item:item.id});finish(pair);
        return rawSay(pair,text,locale,true);
    }
    if(id==='pick')return rawSay(pair,text,locale,labelOnly);
    const master=projects[id]?'master:building':'master:explore';
    worldApi.approach(pair.world,master,'pointing');
    for(let i=0;i<50000 && (pair.world.attention!==master || !pair.state.knowledge.meanings.some(m=>m.id==='work') || !['idle','observe'].includes(pair.world.mode));i++) {
        const e=worldApi.tick(pair.world,.1);worldApi.onArrival(pair.world,pair.state,e);connection.tick(pair.state,pair.world,.1,false,e);
    }
    if(['skull','crystal'].includes(id) && pair.state.adventure.mastery.stage<4)return {reply:{message:'advNeedMastery'}};
    rawSay(pair,projects[id]?projects[id]+'は作れる？':'何を手伝える？');
    if(id==='self'||id==='building') {
        rawSay(pair,'これを橋と呼ぼう');return rawSay(pair,id==='self'?'自分で橋を建てて':'橋の建築を教わろう');
    }
    const accepted=rawSay(pair,'手伝って');
    // The second entrance shares the same already-understood route task. Its
    // physical-layout/recovery regression is independent of proposal wording.
    if(id==='crystal' && pair.state.adventure.connection.task)pair.state.adventure.connection.task.dungeon='crystal';
    return accepted;
}
test('island ground retains the same objects, releases a blocked hand and requires a real return route',()=>{
    const p=setup(),a=p.state.adventure;
    say(p,'棒を作る');finish(p);
    const stick=a.items.find(i=>i.type==='stick');assert.equal(stick.location,'hand');
    worldApi.approach(p.world,'adventure:forest','pointing');worldApi.tick(p.world,.1);
    const position={x:p.world.x,y:p.world.y};
    connection.drop(p.state,p.world,stick.id);
    assert.deepEqual(stick.position,position);assert.equal(stick.location,'ground');
    assert.ok(storage.valid({version:1,appearance:'robot',state:p.state,world:p.world}));
    const saved=JSON.parse(JSON.stringify({state:p.state,world:p.world}));
    assert.deepEqual(saved.state.adventure.items.find(i=>i.id===stick.id).position,position);
    say(p,'かばんを作る');finish(p);assert.equal(physical.capacity(a),6);
    assert.ok(a.items.some(i=>i.location==='ground'));
    say(p,'拾う');finish(p);
    assert.equal(stick.location,'bag');assert.equal(a.items.filter(i=>i.id===stick.id).length,1);
    assert.ok(Math.hypot(p.world.x-position.x,p.world.y-position.y)<1e-6);
    assert.ok(p.state.knowledge.meanings.some(m=>m.id==='action:pick'));
    assert.ok(storage.valid({version:1,appearance:'robot',state:p.state,world:p.world}));
    const q=setup();say(q,'手当て布を作る');finish(q);
    const cloth=q.state.adventure.items.find(i=>i.type==='cloth');
    say(q,'橋を依頼する');finish(q);
    assert.equal(q.state.adventure.building.bridge,true);assert.equal(cloth.location,'ground');
    const bad=JSON.parse(JSON.stringify(q));bad.world.island.places.find(i=>i.id==='adventure:item:'+cloth.id).x+=.01;
    assert.equal(connection.valid(bad.state,bad.world),false);
    assert.ok(storage.valid({version:1,appearance:'robot',state:q.state,world:q.world}));
});
function finish(pair) {
    for (let i=0;i<100000 && pair.state.adventure.connection.task;i++) {
        const e=worldApi.tick(pair.world,.1); worldApi.onArrival(pair.world,pair.state,e);
        const r=connection.tick(pair.state,pair.world,.1,false,e);
        if(r && ['advFull','advCannot','advNoMaterial'].includes(r.message)) throw Error(JSON.stringify({r,task:pair.state.adventure.connection.task}));
    }
    assert.equal(pair.state.adventure.connection.task,null,JSON.stringify(pair.state.adventure.connection.task));
}
test('real island round trips, delivered materials and timed work unlock bridge and mastery without granting action words',()=>{
    const p=setup(), a=p.state.adventure;
    assert.equal(navigation.route(p.world,'adventure:skull'),null);
    say(p,'橋を依頼する'); finish(p);
    assert.equal(a.building.bridge,true); assert.equal(a.mastery.stage,0);
    assert.ok(navigation.route(p.world,'adventure:skull'));
    assert.equal(a.items.filter(i=>i.location==='consumed'&&i.type==='wood').length,4);
    assert.equal(a.items.filter(i=>i.location==='consumed'&&i.type==='stone').length,2);
    for(let i=0;i<4;i++){say(p,'冒険家の課題');finish(p);assert.equal(a.mastery.stage,i+1);}
    assert.equal(p.state.knowledge.meanings.some(m=>m.id.startsWith('action:')),false);
    assert.equal(navigation.valid(p.world.island),true);
    assert.equal(connection.valid(p.state,p.world),true);
    assert.ok(storage.valid({version:1,appearance:'robot',state:p.state,world:p.world}));
});
test('five-floor practical training, common action teaching and stopped JSON state share actual hands',()=>{
    const p=setup(),a=p.state.adventure;
    for(let i=0;i<4;i++){say(p,'冒険家の課題');finish(p);}
    say(p,'橋を依頼する');finish(p);
    // Explicitly finish real rests. Autonomous meal/rest thresholds need not
    // produce both low hunger and low fatigue at the same instant on every map.
    // Three complete rests suffice even after a long route at maximum fatigue.
    for(let round=0;round<3;round++) {
        for(let i=0;i<1000 && ['eat','work'].includes(p.world.mode);i++) {
            const e=worldApi.tick(p.world,.1);worldApi.onArrival(p.world,p.state,e);connection.tick(p.state,p.world,.1,false,e);
        }
        assert.ok(worldApi.approach(p.world,'shade','pointing'));
        const start=p.world.elapsed;let rested=false;
        for(let i=0;i<50000 && !rested;i++) {
            const e=worldApi.tick(p.world,.1);worldApi.onArrival(p.world,p.state,e);connection.tick(p.state,p.world,.1,false,e);
            rested=e?.kind==='experience' && e.activity==='rest' && e.start>=start;
        }
        assert.ok(rested,'the complete rest is witnessed');
    }
    assert.ok(p.world.fatigue<.05,'actual rest prepares the course');
    say(p,'スカルへ行く');finish(p);
    assert.ok(a.run?.training);
    for(let i=0;i<1500 && a.run;i++){
        const c=connection.choice(p.state,p.world); assert.ok(c);
        connection.hand(p.state,p.world,c.action,c.target);
        if(connection.actions.includes(c.action)){
            const word=connection.words.ja[connection.actions.indexOf(c.action)];
            const turn=a.run?.turn; const label=say(p,word,'ja',true); assert.equal(a.run?.turn,turn,'teaching cannot add a second hand');
        }
        assert.equal(connection.valid(p.state,p.world),true,JSON.stringify({c,run:a.run,events:a.events.slice(-4)}));
        assert.ok(storage.valid({version:1,appearance:'robot',state:p.state,world:p.world}),'whole saved child must validate after every hand');
    }
    assert.equal(a.run,null,JSON.stringify(a.run)); assert.equal(a.training.completed,true,JSON.stringify(a.training));
    assert.equal(p.world.dwell,0,'return must release island bodily care and curiosity');
    for(const id of ['attack','avoid','equip','use'])assert.ok(p.state.knowledge.meanings.some(m=>m.id==='action:'+id),id+JSON.stringify(a.connection.receipts.map(r=>r.action)));
    assert.equal(a.items.some(i=>i.loan&&['hand','bag','body'].includes(i.location)),false);
    const cloned=JSON.parse(JSON.stringify(p));assert.equal(connection.valid(cloned.state,cloned.world),true);
    const removed=JSON.parse(JSON.stringify(p));delete removed.state.adventure;assert.equal(connection.valid(removed.state,removed.world),false);
    const meaning=cloned.state.knowledge.meanings.find(m=>m.id==='action:attack');meaning.evidence[0].scope.physicalSource++;
    assert.equal(connection.valid(cloned.state,cloned.world),false);
    for(const command of ['家を依頼する','かばんを作る','棒を作る','盾を作る','携行食を作る']){say(p,command);finish(p);}
    const stored=a.items.find(i=>i.type==='ration'&&['hand','bag'].includes(i.location));
    connection.start(p.state,p.world,'storage',{action:'store',item:stored.id});finish(p);
    function heal(){while(a.damage){
        for(let i=0;i<20000&&(!['idle','observe'].includes(p.world.mode)||p.world.fatigue>=.5||p.world.hunger>=.6);i++){
            const e=worldApi.tick(p.world,.1);worldApi.onArrival(p.world,p.state,e);connection.tick(p.state,p.world,.1,false,e);
        }
        const made=say(p,'手当て布を作る');finish(p);
        if(a.damage)assert.equal(say(p,'使う').reply.message,'advUsed',JSON.stringify({made:made.reply,items:a.items.filter(i=>i.type==='cloth'),events:a.events.slice(-4)}));
    }
        const unused=a.items.find(i=>i.type==='cloth'&&i.location==='hand');
        if(unused){connection.start(p.state,p.world,'storage',{action:'store',item:unused.id});finish(p);}
    }
    heal();say(p,'スカルへ行く');finish(p);
    for(let i=0;i<40&&a.run;i++)connection.hand(p.state,p.world,'observe');
    assert.equal(a.run,null);assert.equal(a.recoveries.length,1);assert.equal(stored.location,'home');
    assert.ok(a.items.some(i=>i.location==='floor'&&i.floor===1&&i.dungeon==='skull'));
    assert.ok(storage.valid({version:1,appearance:'robot',state:p.state,world:p.world}));
    heal();say(p,'クリスタルへ行く');finish(p);assert.equal(a.run.dungeon,'crystal');
    assert.equal(a.items.some(i=>i.location==='floor'&&i.dungeon==='crystal'),false);
    connection.hand(p.state,p.world,'up');say(p,'スカルへ行く');finish(p);
    connection.hand(p.state,p.world,'walk',{x:2,y:1});
    const bag=a.items.find(i=>i.type==='bag'&&i.location==='floor');
    connection.hand(p.state,p.world,'pick',bag.id);connection.hand(p.state,p.world,'equip',bag.id);
    assert.equal(bag.location,'body');assert.equal(a.recoveries.length,1,'recovery does not erase the rescue original');
    const latest=JSON.parse(JSON.stringify(p));assert.ok(storage.valid({version:1,appearance:'robot',state:latest.state,world:latest.world}));
});
test('legacy state has no retroactive mastery, bridge or training; all seven input languages are finite',()=>{
    const p=setup();assert.equal(p.state.adventure.mastery.stage,0);assert.equal(p.state.adventure.building.bridge,false);
    assert.equal(p.state.adventure.training.completed,false);
    for(const locale of Object.keys(connection.words)){
        assert.equal(connection.parse('冒険家の課題',locale),null);
        assert.equal(connection.parse(connection.words[locale][0],locale),'attack');
        assert.equal(connection.parse(connection.words[locale][0]+' ???',locale),null);
    }
    assert.equal(say(p,'スカルへ行く').reply.message,'advNeedMastery');
    const walking=core.receive(p.state,'歩く',catalog,{locale:'ja',body:p.world}),fatigue=p.world.fatigue;
    assert.equal(connection.receive(p.state,p.world,walking,'ja'),null);assert.equal(p.world.fatigue,fatigue,'ordinary input cost stays with the original world owner');
    connection.start(p.state,p.world,'craft',{project:'bag'});connection.stop(p.state,p.world);assert.equal(p.world.dwell,0);
    delete p.state.adventure;assert.equal(connection.valid(p.state,p.world),true);
});
test('learned bridge practice supports self building and home storage without free goods',()=>{
    const p=setup(),a=p.state.adventure;
    assert.equal(say(p,'橋を建てる').reply.message,'advNeedBuilding');
    say(p,'橋の建築を学ぶ');finish(p);assert.equal(a.building.learned,true);assert.equal(a.building.bridge,true);
    say(p,'橋を建てる');finish(p);assert.equal(a.building.bridge,true);
    assert.ok(a.events.some(e=>e.kind==='craft'&&e.project==='bridge'&&e.method==='self'));
    for(const command of ['家を依頼する','かばんを作る','棒を作る','盾を作る','携行食を作る','手当て布を作る']){say(p,command);finish(p);}
    assert.ok(a.building.home);
    const stick=a.items.find(i=>i.type==='stick');
    connection.start(p.state,p.world,'storage',{action:'store',item:stick.id});finish(p);assert.equal(stick.location,'home');
    connection.start(p.state,p.world,'storage',{action:'take',item:stick.id});finish(p);assert.ok(['hand','bag'].includes(stick.location));
    assert.ok(storage.valid({version:1,appearance:'robot',state:p.state,world:p.world}));
    const bad=JSON.parse(JSON.stringify(p));bad.state.adventure.events.find(e=>e.kind==='craft'&&e.project==='bridge').materials.pop();
    assert.equal(connection.valid(bad.state,bad.world),false);
    const unknown=JSON.parse(JSON.stringify(p));unknown.state.adventure.connection.task={kind:'craft',phase:'steps',start:0,index:0,remaining:0,steps:[{effect:'grant'}],project:'bridge'};
    assert.equal(connection.valid(unknown.state,unknown.world),false);
});
test('ordinary island life does not select locked expedition places or freeze on a nonexistent route',()=>{
    const p=setup();
    for(let i=0;i<7000;i++){const e=worldApi.tick(p.world,.1);worldApi.onArrival(p.world,p.state,e);connection.tick(p.state,p.world,.1,false,e);}
    assert.ok(p.world.recovery.eat);assert.ok(p.world.recovery.rest);
    assert.equal(Object.keys(p.world.visited).some(id=>id.startsWith('adventure:')),false);
    assert.equal(p.state.adventure.mastery.stage,0);assert.equal(p.state.adventure.building.bridge,false);
    assert.ok(storage.valid({version:1,appearance:'robot',state:p.state,world:p.world}));
});
test('new-floor walking is common actual experience, and an exhausted attempted action grants nothing',()=>{
    const p=setup({life:false}),a=p.state.adventure;
    for(let i=0;i<4;i++){say(p,'冒険家の課題');finish(p);}say(p,'橋を依頼する');finish(p);say(p,'スカルへ行く');finish(p);
    assert.equal(p.state.knowledge.meanings.some(m=>m.id==='walk'),false);
    connection.hand(p.state,p.world,'walk',{x:2,y:1});say(p,'歩く','ja',true);
    assert.ok(p.state.knowledge.meanings.some(m=>m.id==='walk'&&m.source==='experienced_adventure'));
    const input=core.receive(p.state,'攻撃する',catalog,{locale:'ja',body:p.world}).input,receipts=a.connection.receipts.length;
    p.world.fatigue=1;connection.hand(p.state,p.world,'attack',null,input);
    assert.equal(a.run,null);assert.equal(a.connection.receipts.length,receipts);
    assert.equal(a.events.at(-1).reason,'master_safety');assert.ok(storage.valid({version:1,appearance:'robot',state:p.state,world:p.world}));
});
