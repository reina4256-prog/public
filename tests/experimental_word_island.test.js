'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.join(__dirname, '..');
const navigation = require('../experimental_word_island_navigation');
const worldApi = require('../experimental_word_learning_world');
const core = require('../experimental_word_learning_core');
const notebook = require('../experimental_word_learning_notebook');
const catalog = require('../experimental_word_learning_catalog.json');
const { valid } = require('../scripts/experimental/storage');
function context() {
    const context = vm.createContext({ window: { WordIslandMode: true }, console, setTimeout() {},
        localStorage: { getItem() { throw new Error('Legacy storage read'); }, setItem() { throw new Error('Legacy storage write'); } } });
    vm.runInContext(fs.readFileSync(path.join(root, 'data.js'), 'utf8'), context);
    vm.runInContext(fs.readFileSync(path.join(root, 'island_shared.js'), 'utf8'), context);
    vm.runInContext('var catalog = defaultCatalog;', context);
    return context;
}
function island() { return vm.runInContext('generateNatureMap()', context()); }
function until(world, state, predicate) {
    for (let i = 0; i < 5000; i++) {
        const event = worldApi.tick(world, .1);
        core.perceive(state, worldApi.perception(world));
        worldApi.onArrival(world, state, event);
        if (predicate(event)) return event;
    }
    throw new Error('Expected life event did not occur');
}
test('shared generator keeps legacy terrain and facilities, all life sites are reachable across random layouts', () => {
    const c = context();
    for (let i = 0; i < 30; i++) {
        const assets = vm.runInContext('generateNatureMap()', c);
        const layout = navigation.create(assets);
        assert.equal(navigation.valid(layout), true);
        for (const prefix of ['palms_', 'mountain_', 'farm_', 'restaurant_', 'pharmacy_', 'skull_', 'crystal_']) {
            assert.ok(Object.keys(assets).some(key => key.startsWith(prefix)), prefix);
        }
        const world = { island: layout, ...layout.spawn };
        for (const place of layout.places) {
            const route = navigation.route(world, place.id);
            assert.ok(route.length);
            for (const p of route) assert.ok(Object.values(assets).some(a => a.type === 'ground' &&
                Math.abs((a.dx + a.sw * a.scale / 2) / 800 - p.x) < .00001 &&
                Math.abs((a.dy + a.sh * a.scale / 2) / 480 - p.y) < .00001));
        }
    }
});
test('all eight settings reach food and rest on the island, with grounded notebook and round-trip save', () => {
    worldApi.setNavigation(navigation.route);
    for (const foundation of [false, true]) for (const life of [false, true]) for (const speech of ['short', 'gesture']) {
        const state = core.create({ foundation, life, speech }, catalog), world = worldApi.create();
        const initialKnowledge = JSON.stringify(state.knowledge);
        navigation.attach(world, island());
        world.hunger = .8;
        assert.equal(worldApi.approach(world, 'berry:1', 'pointing'), true);
        assert.deepEqual(worldApi.perception(world).attention, []);
        until(world, state, e => e?.kind === 'experience' && e.activity === 'eat');
        assert.ok(world.experiences[0].before.hunger > world.experiences[0].after.hunger);
        world.fatigue = .7;
        worldApi.approach(world, 'shade', 'pointing');
        until(world, state, e => e?.kind === 'experience' && e.activity === 'rest');
        assert.equal(JSON.stringify(state.knowledge), initialKnowledge, 'life actions do not secretly grant words');
        assert.ok(notebook.entries(state).some(e => e.group === 'experiences'));
        const save = { version: 1, appearance: 'robot', state, world };
        assert.ok(valid(save));
        const restored = JSON.parse(JSON.stringify(save));
        navigation.attach(restored.world, null);
        assert.deepEqual(restored.world.island, JSON.parse(JSON.stringify(world.island)));
        assert.deepEqual(restored.state.settings, state.settings);
        const before = world.elapsed;
        worldApi.tick(world, 20, true); assert.equal(world.elapsed, before);
    }
});
test('legacy prototype records and in-progress meal survive attachment without replaying consumption', () => {
    const state = core.create({ foundation: true, life: true, speech: 'short' }, catalog);
    const world = worldApi.create(); world.mode = 'eat'; world.harvest = 1; world.fruit = 1;
    world.dwell = 2; world.attention = 'berry:1'; world.activityBefore = { hunger: .8, fatigue: .3 };
    const knowledge = JSON.stringify(state);
    navigation.attach(world, island());
    assert.equal(world.mode, 'eat'); assert.equal(world.fruit, 1); assert.equal(world.dwell, 2);
    assert.equal(JSON.stringify(state), knowledge);
    until(world, state, e => e?.kind === 'experience');
    assert.equal(world.experiences.length, 1); assert.equal(world.fruit, 1);
});
test('chat does not freeze island recovery and valid names still bind to arrival perception', () => {
    const world = worldApi.create(), state = core.create({ foundation: true, life: true, speech: 'short' }, catalog);
    navigation.attach(world, island()); worldApi.setNavigation(navigation.route);
    worldApi.approach(world, 'berry:1');
    until(world, state, e => e?.kind === 'arrive');
    worldApi.respond(world, core.receive(state, 'これはぽぽだよ', catalog, { locale: 'ja' }), state);
    assert.equal(state.knowledge.associations[0].target, world.attention);
    assert.equal(world.pause, 0);
    const before = world.elapsed; worldApi.tick(world, .1); assert.ok(world.elapsed > before);
});
test('comparison entry loads shared renderer but no legacy AI, save or life loop; audio supports range', async () => {
    const server = require('../scripts/experimental/serve').createServer();
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    try {
        const url = `http://127.0.0.1:${server.address().port}`;
        const html = await (await fetch(url)).text();
        assert.match(html, /view_renderer.js/); assert.match(html, /island_shared.js/);
        assert.doesNotMatch(html, /(?:system|main|ai_core|schedule_runtime|cloud_manager)\.js/);
        for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) assert.equal((await fetch(`${url}/${match[1]}`)).status, 200);
        for (const species of ['robot', 'spirit', 'seed']) {
            const response = await fetch(`${url}/bgm_${species}.mp3`, { headers: { Range: 'bytes=0-31' } });
            assert.equal(response.status, 206); assert.equal((await response.arrayBuffer()).byteLength, 32);
            assert.equal(response.headers.get('content-type'), 'audio/mpeg');
        }
        for (const file of ['system.js', 'main.js', 'ai_core.js', 'scripts/experimental/storage.js', 'word-life.json']) {
            assert.equal((await fetch(`${url}/${file}`)).status, 404);
        }
    } finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
});

test('six masters are encountered through actual arrival; all eight settings can try their work', () => {
    const jobs = require('../experimental_word_careers').JOBS;
    worldApi.setNavigation(navigation.route);
    const assets = island();
    for (const foundation of [false, true]) for (const life of [false, true]) for (const speech of ['short', 'gesture']) {
        const state = core.create({ foundation, life, speech }, catalog), world = worldApi.create();
        const knowledge = JSON.stringify(state.knowledge);
        navigation.attach(world, JSON.parse(JSON.stringify(assets)));
        assert.equal(world.careers, undefined);
        for (const id of Object.keys(jobs)) {
            world.hunger = .1; world.fatigue = .1;
            assert.ok(worldApi.approach(world, `master:${id}`, 'pointing'));
            assert.ok(!world.careers?.people[id], 'pointing does not invent a meeting');
            until(world, state, e => e?.kind === 'work_start' && e.master === id);
            assert.equal(worldApi.approach(world, 'shade'), false, 'unfinished work is not silently lost');
            const save = JSON.parse(JSON.stringify({ version: 1, appearance: 'robot', state, world }));
            assert.ok(valid(save), 'in-progress work is saveable');
            const resumed = save.world, resumedState = save.state;
            navigation.attach(resumed, null);
            const completed = until(resumed, resumedState, e => e?.kind === 'experience' && e.activity === 'work');
            assert.equal(completed.result, jobs[id].result);
            assert.equal(completed.after.completed - completed.before.completed, 1);
            assert.equal(resumed.careers.people[id].completed, 1);
            assert.equal(resumed.careers.people[id].outcomes.length, 1);
            until(world, state, e => e?.kind === 'experience' && e.activity === 'work');
            assert.equal(world.careers.people[id].completed, 1);
            const clarification = core.receive(state, `${catalog.experienceMeanings[`work:${id}`][0]}って？`, catalog, { locale: 'ja' });
            assert.equal(clarification.understandings[0].contextReference.source.kind, 'observation');
            assert.equal(clarification.understandings[0].complete, foundation);
            const clarified = worldApi.respond(world, clarification, state);
            if (foundation && speech === 'short') {
                assert.equal(clarified.message, `work_did_${id}`);
                assert.equal(clarified.experienceId, world.experiences.at(-1).id);
            } else assert.equal(clarified.message, 'attend');
            assert.ok(valid({ version: 1, appearance: 'robot', state, world }));
        }
        assert.equal(state.encounters.length, 6);
        assert.equal(notebook.entries(state).filter(e => e.detail === 'note_work_result').length, 6);
        assert.equal(Object.values(world.careers.people).filter(p => p.learning).length, 6, 'trying another teacher does not erase prior learning');
        assert.deepEqual(state.knowledge.relations, JSON.parse(knowledge).relations, 'work does not grant grammatical relations');
        assert.equal(state.knowledge.meanings.filter(m => m.source === 'demonstrated_work').length, 7);
        assert.ok(state.knowledge.meanings.filter(m => m.source === 'demonstrated_work').every(m => m.evidence.length));
        const question = core.receive(state, 'どんな仕事をしたの？', catalog, { locale: 'ja' });
        assert.equal(question.understandings[0].complete, foundation);
        const reply = worldApi.respond(world, question, state);
        if (foundation && speech === 'short') assert.equal(reply.message, 'work_did_building');
        else assert.notEqual(reply.message, 'work_did_building', 'learning work words does not bypass relation or speech settings');
        const before = JSON.stringify(state); notebook.groupedEntries(state); assert.equal(JSON.stringify(state), before);
    }
});

test('meeting is idempotent, poor body state can defer work, and old islands upgrade without replacing land', () => {
    const state = core.create({ foundation: false, life: false, speech: 'gesture' }, catalog), world = worldApi.create();
    navigation.attach(world, island());
    world.island.places = world.island.places.slice(0, 3);
    const savedLand = JSON.stringify(world.island.assets), oldPlaces = JSON.stringify(world.island.places);
    assert.ok(navigation.valid(world.island)); navigation.attach(world, null);
    assert.equal(JSON.stringify(world.island.assets), savedLand);
    assert.equal(JSON.stringify(world.island.places.slice(0, 3)), oldPlaces);
    assert.equal(world.island.places.length, 9);
    worldApi.setNavigation(navigation.route);
    world.hunger = .9;
    worldApi.approach(world, 'master:farming');
    const event = until(world, state, e => e?.kind === 'arrive');
    assert.equal(worldApi.onArrival(world, state, event), null);
    assert.equal(state.encounters.length, 1);
    until(world, state, e => e?.kind === 'master_defer');
    assert.equal(world.careers.people.farming.learning, false);
    assert.equal(world.careers.people.farming.completed, 0);
    const bad = { version: 1, appearance: 'robot', state, world: JSON.parse(JSON.stringify(world)) };
    bad.world.mode = 'work'; bad.world.careers.current = 'cooking';
    assert.equal(!!valid(bad), false);
});

test('demonstrated work grounds words, recall, willingness and autonomous choice without question rewards', () => {
    const careers = require('../experimental_word_careers');
    const state = core.create({ foundation: true, life: false, speech: 'short' }, catalog), world = worldApi.create();
    navigation.attach(world, island()); worldApi.setNavigation(navigation.route);
    const ask = text => worldApi.respond(world, core.receive(state, text, catalog, { locale: 'ja' }), state);
    assert.equal(core.receive(state, 'どんな仕事をしたの？', catalog, { locale: 'ja' }).understandings[0].complete, false);
    world.hunger = 0; world.fatigue = 0;
    worldApi.approach(world, 'master:cooking');
    until(world, state, e => e?.kind === 'work_start');
    assert.equal(state.knowledge.meanings.length, 0, 'hearing a label is not completion');
    const event = until(world, state, e => e?.activity === 'work');
    const knowledge = JSON.stringify(state.knowledge);
    worldApi.onArrival(world, state, event);
    assert.equal(JSON.stringify(state.knowledge), knowledge, 'replayed result adds no evidence');
    assert.equal(ask('何をしたの？').message, 'work_did_cooking');
    assert.equal(ask('さっき何してた？').message, 'work_did_cooking');
    const repeated = ask('もう一度教えて');
    assert.equal(repeated.message, 'work_did_cooking');
    assert.equal(repeated.experienceId, world.experiences.at(-1).id);
    assert.equal(JSON.stringify(state.knowledge), knowledge);
    assert.equal(ask('皿洗いをまたしたい？').master, 'cooking');
    const before = JSON.stringify({ interest: world.careers.people.cooking.interest, destination: world.destination, knowledge: state.knowledge });
    assert.equal(ask('またやりたい？').message, 'work_again');
    assert.equal(JSON.stringify({ interest: world.careers.people.cooking.interest, destination: world.destination, knowledge: state.knowledge }), before);
    world.hunger = .8; assert.equal(ask('その人の仕事学びたい？').message, 'work_hungry');
    world.hunger = .1; world.fatigue = .8; assert.equal(ask('仕事手伝う？').message, 'work_tired');
    const places = world.island.places.filter(p => ['master:cooking', 'master:farming'].includes(p.id));
    world.visited[places[0].id] = world.visited[places[1].id] = world.elapsed;
    assert.equal(careers.choose(world, places).id, 'master:cooking', 'actual interest changes otherwise equal choices');
    world.careers.people.cooking.interest = .01;
    assert.equal(careers.choose(world, places).id, 'master:farming', 'low interest favors trying the alternative');
    assert.ok(valid({ version: 1, appearance: 'robot', state, world }));
    const damaged = JSON.parse(JSON.stringify(state)); damaged.knowledge.meanings[0].evidence[0].experienceId = -1;
    assert.equal(careers.validLearning(damaged), false);
    const old = core.create({}, catalog); careers.learn(old, { ...event, demonstration: null });
    assert.ok(!old.knowledge.meanings.some(m => m.id === 'work'), 'legacy completion is not retroactively taught');
    for (const text of ['私はまたやりたい', 'やりたくない？', '疲れたら仕事手伝う？']) {
        assert.notEqual(core.receive(state, text, catalog, { locale: 'ja' }).understandings[0].questionSlot, 'work_again');
    }
});

test('work recall and intention have input boundaries in every supported locale', () => {
    const questions = {
        ja: ['どんな仕事をしたの？', 'またやりたい？'], en: ['What work did you do?', 'Do you want to help again?'],
        'zh-CN': ['你做了什么工作？', '你还想帮忙吗？'], ru: ['Какую работу ты сделал?', 'Ты хочешь помочь снова?'],
        'es-ES': ['¿Qué trabajo hiciste?', '¿Quieres ayudar otra vez?'],
        'pt-BR': ['Que trabalho você fez?', 'Você quer ajudar de novo?'], de: ['Welche Arbeit hast du gemacht?', 'Möchtest du wieder helfen?']
    };
    for (const [locale, pair] of Object.entries(questions)) {
        const state = core.create({}, catalog);
        assert.ok(!state.knowledge.meanings.some(m => m.id.startsWith('work')), 'not initial vocabulary');
        state.knowledge.meanings.push({ id: 'work', source: 'test' });
        pair.forEach((text, index) => {
            const u = core.receive(state, text, catalog, { locale }).understandings[0];
            assert.equal(u.complete, true, locale);
            assert.equal(u.questionSlot, index ? 'work_again' : 'work_past', locale);
        });
    }
});
