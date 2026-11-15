'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), vm = require('node:vm');
const growth = require('../experimental_word_growth'), core = require('../experimental_word_learning_core');
const worldApi = require('../experimental_word_learning_world'), catalog = require('../experimental_word_learning_catalog.json');
const storage = require('../scripts/experimental/storage');
const fixture = () => { const state = core.create({}, catalog), world = worldApi.create(); growth.init(state, 'robot'); return { state, world }; };
test('all legacy routes, cross edges and stage counts stay identical', () => {
    const source = fs.readFileSync(require.resolve('../data.js'), 'utf8');
    const start = source.indexOf('const evolutionRequirements = '), end = source.indexOf('// ★全キャラクター', start);
    const legacy = vm.runInNewContext(source.slice(start, end) + ';evolutionRequirements');
    assert.equal(JSON.stringify(growth.tree), JSON.stringify(Object.fromEntries(Object.entries(legacy).map(([id, edges]) =>
        [id, Array.from(edges, e => ({ next: e.next, family: Object.keys(e.req)[0] }))]))));
});
test('every legacy target has the approved concrete appearance asset and idle coordinates', () => {
    const source = fs.readFileSync(require.resolve('../data.js'), 'utf8');
    const start = source.indexOf('const defaultAiConfigs ='), end = source.indexOf('const characterConfigs', start);
    const configs = vm.runInNewContext(source.slice(start, end) + ';defaultAiConfigs');
    for (const route of Object.values(growth.tree).flat()) {
        const id = growth.visualSkin(route.next), config = configs[id];
        assert.ok(config?.actions?.idle?.length, route.next);
        assert.ok(fs.existsSync(require('node:path').join(__dirname, '..', (config.img || id) + '.png')), route.next);
    }
    assert.equal(growth.visualSkin('ghost_type3_3'), 'ghost_type3_2');
});
test('quantity and depth are independent and knowledge survives exhaustion', () => {
    const { state, world } = fixture(), before = JSON.stringify(state.knowledge);
    const healthy = growth.budget(state, world); world.fatigue = 1;
    assert.equal(growth.budget(state, world).depth, healthy.depth);
    assert.ok(growth.budget(state, world).units < healthy.units);
    world.hunger = 1;
    const result = core.receive(state, '木の実がある。'.repeat(18), catalog, { body: world });
    assert.ok(result.processing.omitted.some(x => x.reasons.includes('quantity')));
    worldApi.respond(world, result, state, catalog);
    assert.equal(JSON.stringify(state.knowledge), before);
});
test('hunger limits actual conditional reasoning; later recovery does not rewrite the turn', () => {
    const { state, world } = fixture();
    const raw = catalog.conditionTeaching.ja.utterance;
    world.hunger = 1;
    const result = core.receive(state, raw, catalog, { body: world });
    assert.ok(result.processing.omitted.some(x => x.reasons.includes('comparison')));
    const original = JSON.stringify(result), knowledge = JSON.stringify(state.knowledge);
    worldApi.respond(world, result, state, catalog);
    assert.equal(JSON.stringify(state.knowledge), knowledge);
    world.hunger = world.fatigue = 0;
    const recovered = core.receive(state, raw, catalog, { body: world });
    assert.equal(recovered.processing.omitted.length, 0);
    assert.equal(JSON.stringify(result), original);
});
test('a short recovery request and identity remain available at empty reserves', () => {
    const { state, world } = fixture(); world.fatigue = world.hunger = 1;
    const result = core.receive(state, '休んで', catalog, { body: world });
    assert.equal(result.processing.omitted.length, 0);
    assert.ok(result.understandings[0].complete);
    worldApi.respond(world, result, state, catalog);
    assert.equal(world.destination, 'shade');
});
test('simple input costs less than long input and efficiency differs from capacity', () => {
    const a = fixture(), b = fixture();
    const short = core.receive(a.state, '木の実がある', catalog, { body: a.world });
    const long = core.receive(b.state, '木の実がある。'.repeat(9), catalog, { body: b.world });
    assert.ok(long.processing.cost > short.processing.cost);
    a.state.evolution.mind = 'robot_type4';
    assert.ok(growth.budget(a.state, a.world).efficiency > growth.budget(b.state, b.world).efficiency);
});
test('condition readiness does not unlock, choice and ceremony completion are separate', () => {
    const { state, world } = fixture();
    state.evolution.growth.power = Array.from({ length: 8 }, (_, i) => (i % 2 ? 'rest:' : 'walk:') + i);
    assert.ok(growth.choices(state, world).find(c => c.next === 'robot_type4').ready);
    assert.deepEqual(state.evolution.path, ['robot']);
    assert.equal(growth.select(state, 'skin', 'robot_type4'), false);
    assert.equal(growth.begin(state, world, 'robot_type4'), true);
    assert.deepEqual(state.evolution.path, ['robot']);
    assert.equal(growth.complete(state, 'robot_type3'), false);
    assert.equal(growth.complete(state, 'robot_type4'), true);
    assert.deepEqual(state.evolution.path, ['robot', 'robot_type4']);
});
test('independent switching never rolls back route or allows sibling evolution', () => {
    const { state, world } = fixture(), e = state.evolution;
    e.growth.intel = Array.from({ length: 12 }, (_, i) => 'input:' + i);
    assert.ok(growth.begin(state, world, 'robot_type3')); growth.complete(state, 'robot_type3');
    assert.ok(growth.select(state, 'skin', 'robot')); assert.equal(e.mind, 'robot_type3');
    assert.ok(growth.select(state, 'mind', 'robot')); assert.equal(e.path.at(-1), 'robot_type3');
    assert.equal(growth.begin(state, world, 'robot_type3_2'), false);
    assert.ok(growth.begin(state, world, 'robot_type3_4')); growth.complete(state, 'robot_type3_4');
    assert.equal(growth.choices(state, world).length, 0);
});
test('old saves migrate without inferred growth; pending and unlocked selection survive real store', () => {
    const os = require('node:os'), path = require('node:path');
    const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'word-growth-test-')), store = storage.createStore(folder);
    const state = core.create({}, catalog), world = worldApi.create(), value = { version: 1, appearance: 'robot', state, world };
    assert.ok(storage.valid(value)); assert.ok(store.save(value).ok);
    growth.init(state, 'robot'); assert.equal(state.evolution.growth.intel.length, 0);
    state.evolution.growth.intel = Array.from({ length: 6 }, (_, i) => 'input:' + i);
    assert.ok(growth.begin(state, world, 'robot_type3')); assert.ok(store.save(value).ok);
    const saved = storage.createStore(folder).load(); assert.ok(saved.ok);
    assert.equal(saved.value.state.evolution.pending.next, 'robot_type3');
    assert.deepEqual(saved.value.state.evolution.path, ['robot']);
    growth.complete(state, 'robot_type3'); growth.select(state, 'skin', 'robot'); assert.ok(store.save(value).ok);
    assert.equal(storage.createStore(folder).load().value.state.evolution.mind, 'robot_type3');
});
test('save validator rejects forged paths, sibling selections and invalid growth', () => {
    for (const mutate of [e => e.path.push('dragon_type3'), e => e.skin = 'robot_type3', e => e.pending = { from: 'robot', next: 'dragon', phase: 'ceremony' },
        e => e.growth.power = [NaN], e => e.lastInput = 500]) {
        const { state, world } = fixture(); mutate(state.evolution);
        assert.equal(storage.valid({ version: 1, appearance: 'robot', state, world }), false);
    }
});
test('growth counts actual evidence once and never unknown input volume', () => {
    const { state, world } = fixture();
    const event = { id: 1, kind: 'experience', activity: 'rest' };
    growth.observe(state, world, null, event); growth.observe(state, world, null, event);
    assert.deepEqual(state.evolution.growth.power, ['rest:1']);
    const result = core.receive(state, '???', catalog, { body: world });
    growth.observe(state, world, result, null, { message: 'attend' });
    assert.equal(state.evolution.growth.dark.length, 0);
});
test('resource-limited feeling reports save in all languages without relaxing original evidence', () => {
    for (const locale of ['ja', 'en', 'zh-CN', 'ru', 'es-ES', 'pt-BR', 'de']) {
        const { state, world } = fixture(), forms = catalog.feelingContrast[locale];
        world.hunger = world.fatigue = 1;
        const result = core.receive(state, forms.past + forms.join + forms.present, catalog, { body: world, locale });
        assert.ok(result.processing.omitted.length, locale);
        worldApi.respond(world, result, state, catalog);
        const value = { version: 1, appearance: 'robot', state, world };
        assert.ok(storage.valid(value), locale);
        state.context.turns.at(-1).understandings[0].known.meaning = 'happy';
        assert.equal(storage.valid(value), false, locale + '/altered meaning');
    }
});
test('constellation retains unexamined candidates without lighting an understood path', () => {
    const stars = require('../experimental_word_constellation_live'), { state, world } = fixture();
    core.perceive(state, { scene: 'clearing', attention: [{ id: 'berry:1', meaning: 'berry' }, { id: 'shade', meaning: 'rest' }] });
    world.hunger = 1;
    const before = stars.project(state, catalog), result = core.receive(state, 'これはなに', catalog, { body: world });
    assert.ok(result.processing.omitted.some(x => x.reasons.includes('comparison')));
    const reply = worldApi.respond(world, result, state, catalog);
    const trace = stars.capture(before, stars.project(state, catalog, [result]), result, reply, 'test');
    assert.ok(trace.candidates.length >= 2);
    assert.ok(trace.candidates.every(c => !c.selected)); assert.equal(trace.understood.length, 0);
    const frozen = JSON.stringify(trace); world.hunger = 0; assert.equal(JSON.stringify(trace), frozen);
});
