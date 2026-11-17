'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const core=require('../experimental_word_learning_core'),worldApi=require('../experimental_word_learning_world');
const connection=require('../experimental_word_adventure_connection'),navigation=require('../experimental_word_island_navigation');
const catalog=connection.language(require('../experimental_word_learning_catalog.json'));
const storage=require('../scripts/experimental/storage');
function setup(options={}) {
    const context=vm.createContext({window:{WordIslandMode:true},console,setTimeout(){},localStorage:{getItem(){throw Error('legacy');}}});
    for(const file of ['data.js','island_shared.js'])vm.runInContext(fs.readFileSync(file,'utf8'),context);
    vm.runInContext('var catalog=defaultCatalog;',context);
    const state=core.create(options,catalog),world=worldApi.create();
    navigation.attach(world,JSON.parse(JSON.stringify(vm.runInContext('generateNatureMap()',context))));
    worldApi.setNavigation(navigation.route);connection.init(state,world);return {state,world};
}
function tick(p) {
    const e=worldApi.tick(p.world,.1);worldApi.onArrival(p.world,p.state,e);const reply=connection.tick(p.state,p.world,.1,false,e);
    if(reply && p.replies)p.replies.push(reply);
    if(p.guidance && reply?.teaching) {
        if(!connection.perceive(p.state,p.world))core.perceive(p.state,worldApi.perception(p.world));
        const result=core.receive(p.state,connection.words.ja[connection.actions.indexOf(reply.teaching)],catalog,{locale:'ja',body:p.world,speaker:reply.mentor||'player'});
        connection.receive(p.state,p.world,result,'ja',true);
    }
}

test('lesson dialogue reports actual stages and completed events without ending ongoing work or teaching words',()=>{
    const p=setup();learnWork(p);visit(p,'master:explore');p.replies=[];
    for(let stage=0;stage<4;stage++) {
        const offered=speak(p,'何を手伝える？');
        assert.equal(offered.reply.progress.npc,'advLessonGoal'+stage);
        assert.equal(p.state.adventure.connection.task,null,'an explanation does not accept the task');
        const accepted=speak(p,'手伝って');
        assert.equal(accepted.reply.npc,'advLessonGoal'+stage);
        assert.equal(accepted.reply.progress.spoken,'advAccepted');
        assert.equal(connection.taskStatus(p.state.adventure),'advLessonGoal'+stage);
        assert.equal(p.state.adventure.mastery.stage,stage,'acceptance is not completion');
        finish(p);
        assert.equal(p.state.adventure.mastery.stage,stage+1);
        const review=p.replies.at(-1);
        assert.equal(review.npc,'advLessonReview'+stage);
        assert.equal(review.npcAfter,true,'the child reports before the mentor reviews');
        assert.equal(review.progress.spoken,'advReportedSaid');
    }
    const gathered=p.replies.filter(r=>r.progress?.spoken==='advFoundSaid');
    assert.equal(gathered.length,2);
    for(const r of gathered) {
        const event=p.state.adventure.events.find(e=>e.id===r.progress.source);
        assert.equal(event.kind,'gather');assert.equal(r.progress.item,'wood');
    }
    assert.equal(p.replies.filter(r=>r.progress?.spoken==='advDeliveredSaid').length,2);
    assert.equal(p.state.knowledge.meanings.some(m=>m.id.startsWith('action:')),false,'progress speech alone does not teach adventure actions');
    visit(p,'master:building');speak(p,'何を手伝える？');speak(p,'手伝って');
    assert.equal(connection.taskStatus(p.state.adventure),'advMaking');finish(p);
    const built=p.replies.at(-1);
    assert.equal(built.progress.spoken,'advFinishedSaid');assert.equal(built.progress.item,'bridge');
    assert.equal(p.state.adventure.events.find(e=>e.id===built.progress.source).kind,'craft');
    assert.ok(storage.valid({version:1,appearance:'robot',state:p.state,world:p.world}));
});
function until(p,condition,label) {for(let i=0;i<150000&&!condition();i++)tick(p);assert.ok(condition(),label);}
function visit(p,id) {worldApi.approach(p.world,id,'pointing');until(p,()=>p.world.attention===id&&p.world.mode!=='move','visit '+id);}
function speak(p,text,locale='ja') {
    if(!connection.perceive(p.state,p.world))core.perceive(p.state,worldApi.perception(p.world));
    const result=core.receive(p.state,text,catalog,{locale,body:p.world});
    return {result,reply:connection.receive(p.state,p.world,result,locale)||worldApi.respond(p.world,result,p.state,catalog)};
}
function finish(p) {until(p,()=>!p.state.adventure.connection.task,'actual task finishes');}
function restForJourney(p) {
    until(p,()=>!['eat','work'].includes(p.world.mode),'finish the current activity');
    for(let round=0;round<3;round++) {
        const previous=p.world.experiences.filter(e=>e.kind==='rest').length;
        assert.ok(worldApi.approach(p.world,'shade','pointing'));
        until(p,()=>p.world.experiences.filter(e=>e.kind==='rest').length>previous,'complete a real rest');
    }
    assert.ok(p.world.fatigue<.05,'real rests prepare the journey; entry still handles actual hunger');
    if(p.world.hunger>=.45) {
        const previous=p.world.experiences.filter(e=>e.kind==='eat').length;
        assert.ok(worldApi.approach(p.world,'berry:1','pointing'));
        until(p,()=>p.world.experiences.filter(e=>e.kind==='eat').length>previous,'complete a real meal after resting');
    }
}
function learnWork(p) {visit(p,'master:explore');until(p,()=>p.state.knowledge.meanings.some(m=>m.id==='work'),'completed original mentor work');}

test('old exact shortcuts do not execute; grammar recognition never grants knowledge',()=>{
    const p=setup();
    for(const text of ['冒険家の課題','橋を依頼する','スカルへ行く','棒を作る','使う','攻撃して']) {
        const serial=p.state.adventure.serial;speak(p,text);assert.equal(p.state.adventure.connection.task,null,text);assert.equal(p.state.adventure.serial,serial,text);
    }
    assert.equal(speak(p,'何を手伝える？').result.understandings[0].complete,false);
    assert.equal(p.state.knowledge.meanings.some(m=>m.id==='work'||m.id.startsWith('action:')),false);
});
test('omakase first waits for actual mentor work instead of monopolising path and shade',()=>{
    const p=setup();const first=connection.autoConversation(p.state,p.world);assert.equal(first.kind,'move');assert.equal(first.target,'master:explore');
    visit(p,first.target);assert.equal(connection.autoConversation(p.state,p.world).kind,'watch');
    assert.equal(p.state.knowledge.meanings.some(m=>m.id==='work'),false);
    until(p,()=>p.state.knowledge.meanings.some(m=>m.id==='work'),'actual completed work, no vocabulary grant');
    assert.equal(connection.autoConversation(p.state,p.world).kind,'say');
});
test('common understood conversation, actual mentor work and retained proposals start real lessons',()=>{
    const p=setup();learnWork(p);visit(p,'master:explore');
    const question=speak(p,'どんな仕事を手伝えばいい？');assert.equal(question.result.understandings[0].complete,true);assert.equal(question.reply.npc,'advOffer_lesson');
    assert.equal(p.state.adventure.connection.task,null);
    const accepted=speak(p,'手伝ってください');assert.equal(accepted.result.understandings[0].complete,true);assert.equal(accepted.reply.message,'advStarted');
    finish(p);assert.equal(p.state.adventure.mastery.stage,1);
    assert.ok(storage.valid({version:1,appearance:'robot',state:p.state,world:p.world}));
    for(let i=1;i<4;i++){speak(p,'何を手伝える？');speak(p,'一緒に手伝おう');finish(p);assert.equal(p.state.adventure.mastery.stage,i+1);}
    visit(p,'master:building');speak(p,'何を手伝える？');
    assert.equal(p.state.adventure.connection.proposal.project,'bridge');
    speak(p,'これを「わたるもの」と呼ぼう');
    const unknown=speak(p,'知らないものを作って');assert.equal(unknown.reply.message,'advUnknown');assert.equal(p.state.adventure.connection.task,null);
    const known=speak(p,'わたるものを作ってください');assert.equal(known.result.understandings[0].complete,true);assert.equal(known.reply.message,'advStarted');
    finish(p);assert.equal(p.state.adventure.building.bridge,true);assert.equal(p.state.adventure.mastery.stage,4);
    assert.ok(storage.valid({version:1,appearance:'robot',state:p.state,world:p.world}));
    restForJourney(p);
    visit(p,'master:explore');speak(p,'何を手伝える？');speak(p,'手伝って');finish(p);
    assert.ok(p.state.adventure.run?.training);
    assert.ok(storage.valid({version:1,appearance:'robot',state:p.state,world:p.world}));
    const pausedTurn=p.state.adventure.run.turn;
    speak(p,'止まって');assert.equal(connection.choice(p.state,p.world),null);assert.equal(p.state.adventure.run.turn,pausedTurn);
    assert.ok(storage.valid({version:1,appearance:'robot',state:p.state,world:p.world}));
    assert.equal(speak(p,'手伝って').reply.message,'advStarted');assert.ok(connection.choice(p.state,p.world));
    speak(p,'これは何？');assert.equal(connection.choice(p.state,p.world),null,'manual conversation pauses the mentor and preserves time to answer');
    speak(p,'手伝って');assert.ok(connection.choice(p.state,p.world));
    for(let i=0;i<1500 && p.state.adventure.run;i++) {
        const next=connection.choice(p.state,p.world);connection.hand(p.state,p.world,next.action,next.target);
        if(connection.teachable.includes(next.action) && !p.state.knowledge.meanings.some(m=>m.id===connection.meaningFor(next.action))) {
            const text=next.action==='walk'?connection.walkLabels.ja:connection.words.ja[connection.actions.indexOf(next.action)];
            const result=core.receive(p.state,text,catalog,{locale:'ja',speaker:'master:explore',body:p.world});
            const turn=p.state.adventure.run?.turn;
            connection.receive(p.state,p.world,result,'ja',true);
            assert.equal(p.state.adventure.run?.turn,turn,'mentor labels add no physical hand');
        }
    }
    assert.equal(p.state.adventure.training.completed,true);
    assert.ok(p.state.adventure.connection.receipts.some(r=>r.input.speaker==='master:explore' && r.action==='attack'));
    assert.ok(storage.valid({version:1,appearance:'robot',state:p.state,world:p.world}));
    restForJourney(p);
    // A long random island route may consume the preparation meal. Carry and
    // actually use crafted food before checking language processing in Crystal.
    visit(p,'master:cooking');speak(p,'何を手伝える？');speak(p,'手伝って');
    assert.equal(p.state.adventure.connection.task?.project,'ration');finish(p);
    const ration=p.state.adventure.items.find(i=>i.type==='ration' && ['hand','bag'].includes(i.location));assert.ok(ration);
    visit(p,'master:explore');const crystal=speak(p,'クリスタルへ行ける？');
    assert.equal(crystal.reply.npc,'advOffer_crystal');
    assert.equal(crystal.result.understandings[0].complete,false,'a mentor answer does not repair the child’s unknown noun');
    speak(p,'手伝って');finish(p);assert.equal(p.state.adventure.run.dungeon,'crystal');
    connection.hand(p.state,p.world,'use',ration.id);
    assert.equal(ration.location,'consumed');assert.ok(p.world.hunger<.45,'actual food leaves room for the language assertions');
    speak(p,'何が見える？');speak(p,'これを「こわい子」と呼ぼう');
    const definition=speak(p,'「ぱしっ」は攻撃することだよ');
    assert.equal(definition.result.understandings[0].complete,true);
    const synonym=speak(p,'「ぱしっ」をして');
    assert.equal(synonym.result.understandings[0].known.meaning,'action:attack');
    assert.notEqual(synonym.reply.message,'advUnknown','shared learned aliases reach the same semantic action');
    const exploring=speak(p,'自分で歩いてみて');assert.equal(p.state.adventure.connection.goal?.action,'explore',JSON.stringify({reply:exploring.reply,fatigue:p.world.fatigue,hunger:p.world.hunger}));
    const stopped=speak(p,'止まって');assert.equal(stopped.reply.message,'advStopped');assert.equal(p.state.adventure.connection.goal,undefined);
    assert.equal(speak(p,'休んでね').reply.message,'advCannot');assert.equal(p.world.destination,null);assert.equal(p.world.mode,'idle','a dungeon request cannot move the off-screen actor to island shade');
    assert.equal(speak(p,'散歩しよう').reply.message,'advStarted');assert.equal(p.state.adventure.connection.goal?.action,'explore');
    speak(p,'おはよう');assert.equal(p.state.adventure.connection.goal,undefined,'a new conversation cancels the previous walking goal');
    assert.ok(storage.valid({version:1,appearance:'robot',state:p.state,world:p.world}));
});
test('missing relation, ambiguous reference, negation and multiple clauses do not run a task',()=>{
    for(const options of [{},{foundation:false}]) {
        const p=setup(options);learnWork(p);visit(p,'master:explore');
        speak(p,'何を手伝える？');
        for(const text of ['手伝わないで','もし手伝ったら帰って','手伝って。帰って。','あれを作って']) {
            speak(p,text);assert.equal(p.state.adventure.connection.task,null,text);
        }
        if(options.foundation===false){speak(p,'手伝って');assert.equal(p.state.adventure.connection.task,null);assert.equal(p.state.adventure.mastery.stage,0);}
    }
});
test('a free-input stop cancels actual island movement without teleporting or completing a task',()=>{
    const p=setup();learnWork(p);visit(p,'master:building');speak(p,'橋は作れる？');speak(p,'手伝って');
    until(p,()=>p.world.mode==='move','actual material journey starts');
    tick(p);const position={x:p.world.x,y:p.world.y};const reply=speak(p,'止まって').reply;
    assert.equal(reply.message,'advStopped');assert.equal(p.state.adventure.connection.task,null);assert.equal(p.world.mode,'idle');assert.deepEqual({x:p.world.x,y:p.world.y},position);
    assert.equal(p.world.destination,null);assert.deepEqual(p.world.route,[]);assert.equal(p.state.adventure.building.bridge,false);
    tick(p);assert.deepEqual({x:p.world.x,y:p.world.y},position,'the interrupted movement does not resume on the next frame');
    assert.ok(storage.valid({version:1,appearance:'robot',state:p.state,world:p.world}));
});
test('all seven locales use shared mentor questions and understood participation',()=>{
    for(const locale of Object.keys(connection.words)) {
        const p=setup();learnWork(p);visit(p,'master:explore');
        const question=connection.autoConversation(p.state,p.world,locale);assert.equal(question.kind,'say');
        assert.equal(speak(p,question.text,locale).reply.npc,'advOffer_lesson',locale);
        const acceptance=connection.autoConversation(p.state,p.world,locale);
        const result=speak(p,acceptance.text,locale);assert.equal(result.result.understandings[0].complete,true,locale);assert.equal(result.reply.message,'advStarted',locale);
        finish(p);assert.equal(p.state.adventure.mastery.stage,1,locale);
        assert.ok(storage.valid({version:1,appearance:'robot',state:p.state,world:p.world}),locale);
    }
});
test('actual ground recovery and coached home storage teach words without inventory buttons or replacement goods',()=>{
    const p=setup();p.guidance=true;learnWork(p);visit(p,'master:building');
    function craft(name){visit(p,'master:building');speak(p,name+'は作れる？');assert.equal(speak(p,'手伝って').reply.message,'advStarted');finish(p);}
    craft('棒');speak(p,'これを「たから」と呼ぼう');const stick=p.state.adventure.items.find(i=>i.type==='stick');
    craft('橋');assert.equal(stick.location,'ground');
    assert.ok(p.state.knowledge.meanings.some(m=>m.id==='action:drop'));
    craft('かばん');
    const candidate=connection.autoConversation(p.state,p.world);assert.equal(candidate.kind,'move');visit(p,candidate.target);
    assert.equal(connection.autoConversation(p.state,p.world).kind,'recover');connection.recover(p.state,p.world,stick.id);finish(p);
    assert.equal(stick.location,'bag');assert.ok(p.state.knowledge.meanings.some(m=>m.id==='action:pick'));
    assert.equal(speak(p,'たからを地面に置いて').result.understandings[0].complete,true);assert.equal(stick.location,'ground');
    const namedDrop=speak(p,'「おろす」は地面に置くことだよ');assert.equal(namedDrop.result.understandings[0].complete,true);
    assert.ok(storage.valid({version:1,appearance:'robot',state:p.state,world:p.world}),'the shared save catalog must also recognise the learned drop meaning');
    speak(p,'拾って');finish(p);assert.equal(stick.location,'bag');
    craft('盾');craft('手当て布');craft('家');
    visit(p,'master:building');assert.equal(speak(p,'何を手伝える？').reply.npc,'advOffer_storage');
    assert.equal(speak(p,'たからの手伝いをして').reply.message,'advStarted');finish(p);assert.equal(stick.location,'home');
    assert.ok(p.state.knowledge.meanings.some(m=>m.id==='action:store'));
    visit(p,'master:building');speak(p,'何を手伝える？');speak(p,'手伝って');finish(p);assert.ok(['hand','bag'].includes(stick.location));
    assert.ok(p.state.knowledge.meanings.some(m=>m.id==='action:take'));
    assert.equal(p.state.adventure.items.filter(i=>i.id===stick.id).length,1);
    assert.ok(storage.valid({version:1,appearance:'robot',state:p.state,world:p.world}));
    const corrupted=JSON.parse(JSON.stringify(p));corrupted.state.adventure.connection.receipts.find(r=>r.action==='store').original.guidance.master='explore';
    assert.equal(connection.valid(corrupted.state,corrupted.world),false);
    const wrongLocale=JSON.parse(JSON.stringify(p));wrongLocale.state.adventure.connection.dialogues[0].input.locale='not-a-locale';assert.equal(connection.valid(wrongLocale.state,wrongLocale.world),false);
});
test('understood combat, named stairs and a return request traverse floors without AUTO or teleporting',()=>{
    const p=setup();learnWork(p);
    for(let n=0;n<4;n++){visit(p,'master:explore');speak(p,'何を手伝える？');speak(p,'手伝って');finish(p);}
    visit(p,'master:building');speak(p,'橋は作れる？');speak(p,'手伝って');finish(p);
    visit(p,'master:explore');speak(p,'何を手伝える？');speak(p,'手伝って');finish(p);
    for(let i=0;i<1500 && p.state.adventure.run;i++) {
        const next=connection.choice(p.state,p.world);connection.hand(p.state,p.world,next.action,next.target);
        if(connection.teachable.includes(next.action) && !p.state.knowledge.meanings.some(m=>m.id===connection.meaningFor(next.action))) {
            const text=next.action==='walk'?connection.walkLabels.ja:connection.words.ja[connection.actions.indexOf(next.action)];
            const r=core.receive(p.state,text,catalog,{locale:'ja',speaker:'master:explore',body:p.world});connection.receive(p.state,p.world,r,'ja',true);
        }
    }
    assert.equal(p.state.adventure.training.completed,true);
    until(p,()=>p.world.fatigue<.25 && p.world.hunger<.3 && ['idle','observe'].includes(p.world.mode),'actual island care');
    visit(p,'master:explore');speak(p,'クリスタルへ行ける？');speak(p,'手伝って');finish(p);
    const a=p.state.adventure;let evaded=false;
    for(let n=0;n<60 && a.run && !a.run.enemy.defeated;n++) {
        const adjacent=Math.abs(a.run.position.x-a.run.enemy.x)+Math.abs(a.run.position.y-a.run.enemy.y)===1;
        const reply=speak(p,adjacent?'攻撃して':'何が見える？').reply;
        if(reply.message==='advAvoidReason')evaded=true;
    }
    assert.ok(a.run?.enemy.defeated);assert.equal(evaded,true,'the child may choose a learned evasion with a reason');
    speak(p,'これを「下への階段」と呼ぼう');const target=speak(p,'下への階段へ歩いて');assert.equal(target.result.understandings[0].complete,true);
    for(let n=0;n<100 && a.connection.goal;n++){p.world.elapsed+=1.2;const next=connection.choice(p.state,p.world);connection.hand(p.state,p.world,next.action,next.target,next.input);assert.ok(storage.valid({version:1,appearance:'robot',state:p.state,world:p.world}));}
    assert.equal(a.run?.floor,2);
    assert.ok(a.events.some(e=>e.kind==='action'&&e.action==='down'&&e.inputId===target.result.input.id));
    const before=a.serial;assert.equal(speak(p,'帰って').result.understandings[0].complete,true);
    for(let n=0;n<100 && a.connection.goal && a.run;n++){p.world.elapsed+=1.2;const next=connection.choice(p.state,p.world);connection.hand(p.state,p.world,next.action,next.target,next.input);}
    assert.equal(a.run,null);assert.equal(a.connection.goal,undefined);assert.ok(a.serial>before+2);
    assert.equal(a.events.at(-1).reason,'walked_out');assert.equal(a.events.at(-1).floor,1);
    assert.ok(storage.valid({version:1,appearance:'robot',state:p.state,world:p.world}));
});
