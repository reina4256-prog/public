'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const questions = require('../experimental_word_start_questions');
const core = require('../experimental_word_learning_core');
const catalog = require('../experimental_word_learning_catalog.json');
const identity = require('../experimental_word_identity');
const autoTraining = require('../experimental_word_auto_training');
const worldApi = require('../experimental_word_learning_world');
const introduced = (options = {}) => {
    const state = core.create({ foundation: false, life: false, speech: 'short', ...options }, catalog);
    assert.equal(identity.configure(state, { characterName: 'ピコ', firstPerson: 'おれ', playerAddress: 'ご主人様' }), true);
    return state;
};

test('automatic training preferences preserve legacy saves and reject malformed priorities', () => {
    assert.equal(autoTraining.validPreferences(undefined), true);
    assert.equal(autoTraining.validPreferences({version:1,weights:{life:0,conversation:2,exploration:3}}), true);
    for(const value of [{}, {version:1,weights:{life:4,conversation:1,exploration:1}},
        {version:1,weights:{life:1,conversation:NaN,exploration:1}}, {version:1,weights:{life:1,conversation:1}}])
        assert.equal(autoTraining.validPreferences(value),false);
    const storage=require('../scripts/experimental/storage'),value={version:1,appearance:'robot',state:core.create({},catalog),world:worldApi.create()};
    value.state.autoTraining={version:1,weights:{life:0,conversation:2,exploration:3}};assert.ok(storage.valid(value));
    value.state.autoTraining.weights.life=-1;assert.equal(storage.valid(value),false);
});

test('automatic teacher speaks the existing grammar in every supported language', () => {
    for(const locale of Object.keys(autoTraining.questions)){
        const state=core.create({foundation:false,life:false},catalog);
        for(const [id,word]of Object.entries(autoTraining.wordsFor(locale)))
            assert.deepEqual(core.receive(state,'「'+word+'」',catalog,{locale}).lifeLabel,[id],locale+':'+id);
        assert.equal(core.interpret(autoTraining.questions[locale],locale,catalog)[0].slot,'current_activity');
        const example='「'+autoTraining.questions[locale]+'」→「'+autoTraining.wordsFor(locale).rest+'」';
        assert.equal(core.questionDemonstration(example,locale,catalog).kind,'question_demonstration');
        assert.deepEqual(state.knowledge.meanings,[]);
    }
});

test('weighted priorities change teaching opportunities without mutating the child or world', () => {
    const state=core.create({foundation:false,life:false},catalog),world=worldApi.create();
    state.knowledge.meanings.push({id:'eat',source:'initial'});
    Object.assign(world,{mode:'eat',attention:'berry:1',activityStart:1,activityBefore:{hunger:.6,fatigue:.2}});
    const memory=autoTraining.create({life:3,conversation:1,exploration:0}),before=JSON.stringify({state,world});
    const plans=[];for(let i=0;i<4;i++){world.activityStart=1+i;const plan=autoTraining.next(memory,state,world,'ja');plans.push(plan.axis);autoTraining.committed(memory,plan);}
    assert.deepEqual(plans,['life','conversation','life','life']);world.activityStart=1;
    assert.equal(JSON.stringify({state,world}),before);
    assert.equal(autoTraining.next(autoTraining.create({life:0,conversation:0,exploration:0}),state,world,'ja'),null);
});

test('the automatic teacher does not repeat one label within one physical activity', () => {
    const state=core.create({foundation:false,life:false},catalog),world=worldApi.create();
    Object.assign(world,{mode:'rest',attention:'shade',activityStart:1,activityBefore:{hunger:.2,fatigue:.2}});
    const memory=autoTraining.create({life:1,conversation:0,exploration:0});
    for(const id of ['rest','sleep']){const plan=autoTraining.next(memory,state,world,'ja');assert.equal(plan.id,id);autoTraining.committed(memory,plan);}
    assert.equal(autoTraining.next(memory,state,world,'ja'),null);assert.deepEqual(state.knowledge.meanings,[]);
});

test('automatic walking teaching requires real displacement and normal experience completion', () => {
    const state=core.create({foundation:false,life:false},catalog),world=worldApi.create(),memory=autoTraining.create({life:0,conversation:0,exploration:1});
    assert.equal(worldApi.approach(world,'path'),true);
    const plan=autoTraining.next(memory,state,world,'ja');assert.equal(plan.id,'walk');
    core.perceive(state,worldApi.perception(world));const result=core.receive(state,plan.text,catalog);
    worldApi.respond(world,result,state,catalog);autoTraining.committed(memory,plan);
    assert.deepEqual(state.knowledge.meanings,[]);
    for(let i=0;i<300&&world.mode==='move';i++){const event=worldApi.tick(world,.1);core.perceive(state,worldApi.perception(world));worldApi.onArrival(world,state,event);}
    assert.ok(state.knowledge.meanings.some(entry=>entry.id==='walk'&&entry.source==='experienced_life'));
    assert.ok(state.experiences.some(entry=>entry.activity==='walk'&&entry.after.x!==entry.before.x));
});

test('from no foundation, normal automatic inputs and completed experiences can teach action questions', () => {
    const state=core.create({foundation:false,life:false,speech:'gesture'},catalog),world=worldApi.create(),memory=autoTraining.create();
    let due=0;
    for(let i=0;i<12000;i++){
        const event=worldApi.tick(world,.1);core.perceive(state,worldApi.perception(world));worldApi.onArrival(world,state,event);
        if(world.elapsed<due)continue;due=world.elapsed+2;
        const plan=autoTraining.next(memory,state,world,'ja');if(!plan)continue;
        if(plan.kind==='move')worldApi.approach(world,plan.target,'pointing');
        else worldApi.respond(world,core.receive(state,plan.text,catalog),state,catalog);
        autoTraining.committed(memory,plan);
    }
    assert.ok(['walk','eat','rest'].every(id=>state.knowledge.meanings.some(entry=>entry.id===id&&entry.source==='experienced_life')));
    assert.ok(state.knowledge.relations.some(entry=>entry.id==='question'&&entry.source!=='initial'));
    assert.equal(state.settings.foundation,false);assert.equal(state.settings.speech,'gesture');
    assert.equal(core.validExperienceLearning(state,require('../experimental_word_life_learning').rules),true);
});

test('introductions keep names, first person and forms of address separate from general knowledge', () => {
    const state = introduced(), knowledge = structuredClone(state.knowledge);
    assert.deepEqual(state.identity, { version: 1, characterName: 'ピコ', firstPerson: 'おれ', playerAddress: 'ご主人様' });
    assert.deepEqual(state.records, []); assert.deepEqual(state.notes, []); assert.equal(state.serial, 0);
    assert.equal(identity.configure(state, state.identity), true); assert.equal(state.identityHistory, undefined);
    for (const appearance of questions.appearances) for (const values of Object.values(identity.suggestions(appearance))) assert.equal(values.length, 3);
    assert.deepEqual(identity.suggestions('robot').playerAddress, ['ご主人様', 'あなた', '相棒']);
    assert.deepEqual(state.knowledge, knowledge);
});

test('names are literal Unicode values; invalid or oversized introductions never replace the current one', () => {
    const state = introduced(), before = structuredClone(state);
    for (const value of ['', 'x'.repeat(33), 'a\nb', 'a\u202eb']) {
        assert.equal(identity.configure(state, { ...state.identity, characterName: value }), false);
        assert.deepEqual(state, before);
    }
    assert.equal(identity.configure(state, { ...state.identity, firstPerson: 'x'.repeat(17) }), false);
    const name = 'A.$&<b>🌸';
    assert.equal(identity.configure(state, { ...state.identity, characterName: name, playerAddress: 'あなた' }), true);
    assert.equal(identity.format('{firstPerson}:{characterName}:{playerAddress}', state.identity), 'おれ:' + name + ':あなた');
    assert.ok(identity.identify(state, name + '！', 'ja'));
    assert.equal(identity.identify(state, 'Axxxxxxxxb', 'ja'), null);
});

test('an exact self-call is understood from the introduction without granting walking or question vocabulary', () => {
    const state = introduced(), world = worldApi.create(), before = structuredClone(state.knowledge);
    const unknown = core.receive(state, 'ピコの新しいお願いです', catalog, { at: 1 });
    const old = structuredClone(unknown.understandings);
    const result = core.receive(state, 'ピコ！', catalog, { at: 2 });
    assert.equal(result.input.raw, 'ピコ！'); assert.equal(result.understandings[0].complete, true);
    assert.equal(result.understandings[0].identitySource.kind, 'introduction');
    assert.equal(worldApi.respond(world, result, state, catalog).message, 'identity_called');
    assert.equal(worldApi.validContext(state, world), true);
    assert.deepEqual(state.knowledge, before); assert.deepEqual(unknown.understandings, old);
    identity.configure(state, { ...state.identity, characterName: '歩く' });
    const walk = core.receive(state, '歩く', catalog, { at: 3 });
    assert.equal(walk.understandings[0].kind, 'identity'); assert.deepEqual(walk.lifeLabel, []);
    assert.equal(identity.identify(state, '歩く', 'ja', 'another-player'), null);
    assert.equal(core.receive(state, '休む？', catalog).understandings[0].complete, false);
});

test('seven locales answer only bounded introduction questions and preserve selected literal forms of address', () => {
    const forms = { ja: ['名前は？', '一人称は？', '私の呼び方は？'], en: ['What is your name?', 'What do you call yourself?', 'What do you call me?'],
        'zh-CN': ['你叫什么名字？', '你怎么称呼自己？', '你怎么称呼我？'], ru: ['Как тебя зовут?', 'Как ты называешь себя?', 'Как ты называешь меня?'],
        'es-ES': ['¿Cómo te llamas?', '¿Cómo te refieres a ti?', '¿Cómo me llamas?'], 'pt-BR': ['Como você se chama?', 'Como você se refere a si?', 'Como você me chama?'],
        de: ['Wie heißt du?', 'Wie nennst du dich selbst?', 'Wie nennst du mich?'] };
    for (const [locale, inputs] of Object.entries(forms)) {
        const state = introduced(), world = worldApi.create();
        for (const [i, raw] of inputs.entries()) {
            const result = core.receive(state, raw, catalog, { locale, at: i });
            const response = worldApi.respond(world, result, state, catalog);
            assert.equal(response.message, ['identity_named', 'identity_first_person', 'identity_player_address'][i]);
            assert.deepEqual(response.identity, state.identity); assert.equal(worldApi.validContext(state, world), true);
        }
        assert.deepEqual(state.knowledge.meanings, []); assert.deepEqual(state.knowledge.relations, []);
    }
});

test('gesture-only children recognize their introductions without acquiring spoken dialogue', () => {
    const state = introduced({ speech: 'gesture' }), world = worldApi.create();
    for (const raw of ['ピコ', '名前は？']) {
        const result = core.receive(state, raw, catalog);
        assert.equal(result.understandings[0].complete, true); assert.equal(result.expression.channel, 'gesture');
        assert.deepEqual(worldApi.respond(world, result, state, catalog), { message: 'identity_called_gesture', observation: true });
    }
});

test('an understood greeting uses the chosen address without changing the greeting prerequisites', () => {
    for (const speech of ['short', 'gesture']) {
        const state = introduced({ foundation: true, life: true, speech }), world = worldApi.create();
        const result = core.receive(state, 'おはよう', catalog);
        const response = worldApi.respond(world, result, state, catalog);
        assert.equal(response.message, speech === 'short' ? 'identity_greeted' : 'attend');
        if (speech === 'short') assert.equal(response.identity.playerAddress, 'ご主人様');
        assert.equal(state.knowledge.relations.every(entry => entry.source === 'initial'), true);
    }
});

test('revising introductions retains old names and actual past understandings without rewriting them', () => {
    const state = introduced();
    const result = core.receive(state, '名前は？', catalog), previous = structuredClone(state.context.turns);
    identity.configure(state, { ...state.identity, characterName: 'コロ', firstPerson: 'わたし', playerAddress: 'あなた' });
    assert.deepEqual(state.context.turns, previous); assert.equal(result.identityReply.identity.characterName, 'ピコ');
    assert.equal(identity.identify(state, 'ピコ', 'ja').slot, 'call');
    assert.equal(identity.identify(state, 'あなた', 'ja'), null, 'player address is not a self-name or a universal pronoun rule');
    assert.equal(state.identityHistory[0].characterName, 'ピコ');
});

test('old saves remain unchanged, while configured introductions and history survive validated storage', () => {
    const fs = require('node:fs'), os = require('node:os'), path = require('node:path');
    const storage = require('../scripts/experimental/storage'), directory = fs.mkdtempSync(path.join(os.tmpdir(), 'word-identity-store-'));
    const value = { version: 1, appearance: 'robot', state: core.create({}, catalog), world: worldApi.create() };
    assert.ok(storage.valid(value)); const legacy = structuredClone(value);
    assert.equal(identity.validState(value.state), true); assert.deepEqual(value, legacy);
    identity.configure(value.state, { characterName: 'ピコ', firstPerson: 'ぼく', playerAddress: 'ご主人様' });
    identity.configure(value.state, { ...value.state.identity, playerAddress: 'あなた' });
    const store = storage.createStore(directory); assert.equal(store.save(value).ok, true); assert.deepEqual(store.load().value, value);
    for (const invalid of [{ ...value.state.identity, extra: true }, { ...value.state.identity, firstPerson: '' }])
        assert.equal(storage.valid({ ...value, state: { ...value.state, identity: invalid } }), false);
    assert.equal(storage.valid({ ...value, state: { ...value.state, identityHistory: [null] } }), false);
});

test('the dungeon shares the same introduction and never turns a self-name into an object definition', () => {
    const dungeonApi = require('../experimental_word_dungeon_learning');
    const state = introduced(), world = worldApi.create();
    const session = dungeonApi.create(state, world), before = structuredClone(state.knowledge);
    const answer = dungeonApi.receive(session, 'ピコ', catalog);
    assert.equal(answer.result.understandings[0].kind, 'identity'); assert.equal(answer.reply.message, 'identity_called');
    assert.equal(session.state, state); assert.deepEqual(state.knowledge, before);
    assert.equal(session.goal, null); assert.equal(core.validClauseSources(state, catalog), true);
});

test('all everyday answer combinations preserve independent starts without invented experience', () => {
    const combinations = new Set(), appearances = new Set();
    for (let n = 0; n < 3 ** 7; n++) {
        let rest = n;
        const answers = Array.from({ length: 7 }, () => { const a = rest % 3; rest = Math.floor(rest / 3); return a; });
        const result = questions.resolve(answers, 0, 1);
        const state = core.create(result.settings, catalog);
        state.startOrigin = { version: 1, answers: answers.slice() };
        assert.equal(questions.validOrigin(state.startOrigin, state.settings, result.appearance), true);
        assert.deepEqual(state.records, []); assert.deepEqual(state.notes, []);
        assert.equal(state.experiences, undefined);
        assert.ok(state.knowledge.meanings.every(k => k.source === 'initial'));
        assert.ok(state.knowledge.relations.every(k => k.source === 'initial'));
        assert.equal(state.knowledge.meanings.length > 0, result.settings.life);
        assert.equal(state.knowledge.relations.length > 0, result.settings.foundation);
        combinations.add(JSON.stringify(result.settings)); appearances.add(result.appearance);
        for (const axis of [1, 5, 6]) {
            const changed = answers.slice(); changed[axis] = (changed[axis] + 1) % 3;
            const next = questions.resolve(changed).settings;
            for (const key of ['foundation', 'life', 'speech']) {
                if (key !== { 1: 'foundation', 5: 'life', 6: 'speech' }[axis]) assert.equal(next[key], result.settings[key]);
            }
        }
    }
    assert.equal(combinations.size, 8); assert.equal(appearances.size, 3);
});

test('start provenance rejects incomplete or altered answers, while older starts stay valid', () => {
    for (const answers of [[], new Array(7), [0,0,0,0,0,0], [0,0,0,0,0,0,3], [0,0,0,0,0,0,.5]]) {
        assert.equal(questions.validAnswers(answers), false);
        assert.throws(() => questions.resolve(answers));
    }
    const origin = { version: 1, answers: [0,1,1,1,0,0,0] }, result = questions.resolve(origin.answers, 0, 1);
    assert.equal(questions.validOrigin(undefined, result.settings, result.appearance), true);
    assert.equal(questions.validOrigin(JSON.parse(JSON.stringify(origin)), result.settings, result.appearance), true);
    assert.equal(questions.validOrigin(origin, { ...result.settings, life: false }, result.appearance), false);
    assert.equal(questions.validOrigin(origin, result.settings, 'spirit'), false);
    assert.equal(questions.validOrigin({ ...origin, experience: true }, result.settings, result.appearance), false);
});

test('legacy-style tied appearance draws change only the preview species and preserve old provenance', () => {
    const answers = [0, 0, 0, 2, 0, 1, 1]; // robot=2, seed=2, spirit=1
    const first = questions.resolve(answers, 0, 2), second = questions.resolve(answers, .99, 2);
    assert.notEqual(first.appearance, second.appearance);
    assert.deepEqual(first.settings, second.settings);
    assert.equal(questions.validOrigin({ version: 2, answers, draw: .99 }, second.settings, second.appearance), true);
    assert.equal(questions.validOrigin({ version: 1, answers }, first.settings, first.appearance), true);
    assert.equal(questions.validOrigin({ version: 2, answers, draw: 1 }, second.settings, second.appearance), false);
    assert.equal(questions.validOrigin({ version: 2, answers }, second.settings, second.appearance), false);
});

test('eleven appearances remain reachable with every answer set; dragon is rarer without a knowledge advantage', () => {
    const skins = new Set(), settings = new Set();
    for (let n = 0; n < 3 ** 7; n++) {
        let rest = n;
        const answers = Array.from({length:7}, () => { const a=rest%3; rest=Math.floor(rest/3); return a; });
        const pool = questions.appearanceWeights(answers), total = pool.reduce((sum,item)=>sum+item.weight,0);
        const dragon = pool.find(item=>item.id==='dragon');
        assert.ok(pool.every(item=>item.weight>0));
        assert.ok(pool.filter(item=>item.id!=='dragon').every(item=>item.weight>dragon.weight));
        assert.ok(dragon.weight / total < .01);
        let offset = 0, expectedSettings;
        for (const item of pool) {
            const draw = (offset+item.weight/2)/total, result = questions.resolve(answers,draw,3);
            assert.equal(result.appearance,item.id);
            assert.equal(questions.validOrigin({version:3,answers,draw},result.settings,item.id),true);
            if (expectedSettings) assert.deepEqual(result.settings,expectedSettings);
            expectedSettings=result.settings; settings.add(JSON.stringify(result.settings)); skins.add(item.id);
            const state=core.create(result.settings,catalog);
            assert.deepEqual(state.records,[]); assert.deepEqual(state.notes,[]);
            offset+=item.weight;
        }
    }
    assert.equal(skins.size,11); assert.equal(settings.size,8);
    assert.equal(questions.resolve([0,0,0,0,0,0,0],1-Number.EPSILON,3).appearance,'dragon');
    assert.throws(()=>questions.resolve([0,0,0,0,0,0,0],0,5));
});

test('same answers fix species; all eleven retain eight starts and scarce dragon patterns',()=>{
    const counts=new Map(), starts=new Map();
    for(let n=0;n<3**7;n++) {
        let rest=n;
        const answers=Array.from({length:7},()=>{const a=rest%3;rest=Math.floor(rest/3);return a;});
        const first=questions.resolve(answers);
        for(const draw of [0,.01,.5,.99,1-Number.EPSILON]) assert.deepEqual(questions.resolve(answers,draw),first);
        assert.deepEqual(questions.resolve(JSON.parse(JSON.stringify(answers))),first);
        assert.ok(questions.validOrigin({version:4,answers},first.settings,first.appearance));
        assert.equal(questions.validOrigin({version:4,answers,draw:.5},first.settings,first.appearance),false);
        assert.equal(questions.validOrigin({version:4,answers},first.settings,'unknown'),false);
        const state=core.create(first.settings,catalog);
        assert.deepEqual(state.records,[]); assert.deepEqual(state.notes,[]);
        counts.set(first.appearance,(counts.get(first.appearance)||0)+1);
        if(!starts.has(first.appearance))starts.set(first.appearance,new Set());
        starts.get(first.appearance).add(JSON.stringify(first.settings));
    }
    assert.equal(counts.size,11); assert.equal(counts.get('dragon'),18);
    assert.ok([...counts].filter(([skin])=>skin!=='dragon').every(([,count])=>count>18));
    assert.ok([...starts.values()].every(set=>set.size===8));
});

test('eleven base appearances have valid existing frames and sound assets without legacy ability import', () => {
    const fs=require('node:fs'),path=require('node:path');
    const visuals=require('../experimental_word_learning_visuals.json');
    assert.deepEqual(Object.keys(visuals),questions.appearances);
    for(const id of questions.appearances) {
        const png=fs.readFileSync(path.join(__dirname,'..',visuals[id].image));
        const width=png.readUInt32BE(16),height=png.readUInt32BE(20);
        assert.deepEqual(Object.keys(visuals[id]).sort(),['actions','image']);
        for(const action of ['idle','move','sleep']) {
            assert.ok(visuals[id].actions[action].length>0);
            for(const f of visuals[id].actions[action]) {
                assert.ok(f.sx>=0 && f.sy>=0 && f.sw>0 && f.sh>0 && f.sx+f.sw<=width && f.sy+f.sh<=height,id+': '+action);
            }
        }
        assert.ok(fs.statSync(path.join(__dirname,'..','bgm_'+id+'.mp3')).size>0);
    }
});
