'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const core = require('../experimental_word_learning_core');
const worldApi = require('../experimental_word_learning_world');
const catalog = require('../experimental_word_learning_catalog.json');
const candidates = require('../experimental_word_diary_candidates');
const labels = require('../experimental_word_diary_relation_labels');
const copy = value => JSON.parse(JSON.stringify(value));
const forms = Object.fromEntries(Object.entries(catalog.correctionTeaching).map(([locale, value]) => [locale, value.exampleSource]));
function setup(activity = 'rest', options = {}) {
    const state = core.create({ foundation: false, life: true, ...options }, catalog), world = worldApi.create();
    Object.assign(world, { mode: activity, attention: activity === 'eat' ? 'berry:1' : 'shade',
        elapsed: 1, activityStart: 1, dwell: .1, harvest: 1, hunger: .8, fatigue: .7,
        activityBefore: { hunger: .8, fatigue: .7 } });
    if (activity === 'eat') world.mealTaste = { quality: 'sweet', pleasant: true };
    core.perceive(state, { scene: 'clearing', attention: [{ id: world.attention, meaning: activity === 'eat' ? 'berry' : 'rest' }] });
    return { state, world };
}
function hear(value, raw = forms.ja, locale = 'ja', speaker = 'player') {
    const { state, world } = value;
    const context = copy({ scene: state.context.scene, attention: state.context.attention,
        mode: world.mode, target: world.attention, activityStart: world.activityStart, elapsed: world.elapsed });
    const beforeKnowledge = copy(state.knowledge);
    const result = core.receive(state, raw, catalog, { locale, speaker, at: 100 + state.serial });
    worldApi.respond(world, result, state, catalog);
    return { result, context, beforeKnowledge };
}
const capture = (buffer, v) => labels.capture(buffer, v.result, v.context, v.beforeKnowledge);
test('unknown explanation relation preserves source and known action separately without mutation', () => {
    const value = setup(), v = hear(value), before = JSON.stringify({ value, v }), buffer = candidates.create();
    assert.equal(capture(buffer, v), true);
    const entry = buffer.read()[0];
    assert.equal(entry.kind, 'teaching'); assert.equal(entry.sourceId, v.result.input.id);
    assert.equal(entry.captured.sources.activity.target, 'shade');
    assert.deepEqual(entry.captured.basis, v.beforeKnowledge.meanings.find(m => m.id === 'rest'));
    assert.deepEqual(entry.captured.understanding.unresolved, [{ type: 'relation', id: 'naming' }]);
    assert.equal(entry.captured.understanding.complete, false);
    assert.equal(JSON.stringify({ value, v }), before);
});
test('seven existing grammars and eight starts accept only unknown relation with known action', () => {
    for (const [locale, raw] of Object.entries(forms)) for (const foundation of [false, true])
        for (const life of [false, true]) for (const speech of ['short', 'gesture']) {
            for (const activity of ['rest', 'eat']) {
                const text = activity === 'rest' ? raw : catalog.correctionTeaching[locale].exampleReplacement.replace(/^.*?[.。]\s*/u, '');
                assert.equal(capture(candidates.create(), hear(setup(activity, { foundation, life, speech }), text, locale)),
                    !foundation && life, `${locale}/${activity}/${foundation}/${life}/${speech}`);
            }
        }
    assert.equal(capture(candidates.create(), hear(setup('eat'), 'もぐは食べることだよ')), true);
});
test('new repeated and alternate-word input retains its own candidate despite first-only adoption', () => {
    const value = setup(), buffer = candidates.create();
    for (const raw of [forms.ja, forms.ja, 'るるは休むことだよ']) assert.equal(capture(buffer, hear(value, raw)), true);
    const entries = buffer.read();
    assert.deepEqual(entries.map(e => e.sourceId), ['input:1', 'input:2', 'input:3']);
    assert.equal(value.world.relationLabels.length, 1);
    assert.equal(entries[2].captured.pairing.adopted.inputId, 'input:1');
    assert.equal(entries[2].captured.pairing.candidates[0].inputId, 'input:3');
    assert.equal(entries[2].captured.pairing.candidates[0].word, 'るる');
});
test('two completed activities acquire relation without upgrading earlier teaching or learning the old word', () => {
    const value = setup(), buffer = candidates.create(), v = hear(value); capture(buffer, v);
    const original = buffer.read(); value.world.pause = 0;
    worldApi.onArrival(value.world, value.state, worldApi.tick(value.world, .1));
    Object.assign(value.world, { mode: 'eat', attention: 'berry:1', activityStart: value.world.elapsed,
        dwell: .1, harvest: 1, mealTaste: { quality: 'sweet', pleasant: true },
        activityBefore: { hunger: .8, fatigue: value.world.fatigue } });
    core.perceive(value.state, { scene: 'clearing', attention: [{ id: 'berry:1', meaning: 'berry' }] });
    assert.equal(capture(buffer, hear(value, 'もぐは食べることだよ')), true);
    value.world.pause = 0; worldApi.onArrival(value.world, value.state, worldApi.tick(value.world, .1));
    assert.ok(value.state.knowledge.relations.some(r => r.id === 'naming' && r.source === 'experienced_relation'));
    assert.equal((value.state.knowledge.wordExplanations || []).length, 0);
    assert.deepEqual(buffer.read()[0], original[0]); assert.equal(capture(buffer, v), false);
    v.result.input.raw = 'changed'; buffer.read()[0].captured.basis.source = 'changed';
    assert.deepEqual(buffer.read()[0], original[0]);
});
test('interruption and later knowledge keep accepted teaching but never turn it into completion', () => {
    const value = setup(), buffer = candidates.create(), v = hear(value); capture(buffer, v);
    const original = buffer.read(); value.world.relationLabels = []; value.world.mode = 'observe';
    value.state.knowledge.relations.push({ id: 'naming', source: 'initial' });
    assert.equal(capture(buffer, v), false); assert.deepEqual(buffer.read(), original);
    assert.equal((value.state.experiences || []).length, 0);
});
test('unmatched activity scope speaker unknown content and other teaching stay excluded', () => {
    for (const raw of ['もぐは食べることだよ', 'ぽぽは謎語のことだよ', 'これを「ころ」と呼ぶよ', '休む',
        'ぽぽは休むことだよ。もぐは食べることだよ', 'さっき間違えた。ぽぽは眠ることだよ'])
        assert.equal(capture(candidates.create(), hear(setup(), raw)), false);
    assert.equal(capture(candidates.create(), hear(setup(), forms.ja, 'ja', 'visitor')), false);
    const value = setup(); value.state.context.attention.push({ id: 'berry:1', meaning: 'berry' });
    assert.equal(capture(candidates.create(), hear(value)), false);
});
test('missing or mismatched input-time material cannot manufacture an accepted teaching', () => {
    const v = hear(setup());
    for (const mutate of [v => { delete v.beforeKnowledge.meanings; }, v => { v.context.scene = 'other'; },
        v => { v.context.target = 'berry:2'; }, v => { v.context.activityStart = 2; },
        v => { v.result.relationLearning.candidates[0].inputId = 'input:9'; },
        v => { v.result.relationLearning.adopted.relation = 'question'; },
        v => { v.result.relationLearning.updated = ['naming']; }, v => { v.beforeKnowledge.meanings = []; }]) {
        const invalid = copy(v); mutate(invalid); assert.equal(capture(candidates.create(), invalid), false);
    }
});
