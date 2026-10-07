'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const core = require('../experimental_word_learning_core');
const catalog = require('../experimental_word_learning_catalog.json');
const candidates = require('../experimental_word_diary_candidates');
const definitions = require('../experimental_word_diary_definitions');
const copy = value => JSON.parse(JSON.stringify(value));
const forms = Object.fromEntries(Object.entries(catalog.correctionTeaching).map(([locale, value]) => [locale, value.exampleSource]));
function setup(options = {}) {
    const state = core.create(options, catalog);
    core.perceive(state, { scene: 'clearing', attention: [{ id: 'berry:1', meaning: 'berry' }] });
    return state;
}
function receive(state, raw = forms.ja, options = {}) {
    const context = copy({ scene: state.context.scene, attention: state.context.attention });
    const beforeKnowledge = copy(state.knowledge);
    return { context, beforeKnowledge, result: core.receive(state, raw, catalog, { at: 100 + state.serial, ...options }) };
}
const capture = (buffer, value) => definitions.capture(buffer, value.result, value.context, value.beforeKnowledge);

test('definitions retain actual input, scope, known basis and final understanding separately without mutation', () => {
    const state = setup(), value = receive(state), buffer = candidates.create();
    const before = JSON.stringify({ state, value });
    assert.equal(capture(buffer, value), true);
    const entry = buffer.read()[0];
    assert.equal(entry.kind, 'teaching');
    assert.equal(entry.sourceId, value.result.input.id);
    assert.deepEqual(entry.captured.sources, { input: value.result.input, scene: value.context.scene,
        attention: value.context.attention, frame: value.result.interpretations[0], index: 0 });
    assert.deepEqual(entry.captured.basis, value.beforeKnowledge.meanings.find(item => item.id === 'rest'));
    assert.deepEqual(entry.captured.understanding, value.result.understandings[0]);
    assert.deepEqual(entry.captured.explanation, value.result.learning[0]);
    assert.equal(JSON.stringify({ state, value }), before);
});
test('new repeated input retains a teaching despite no new explanation evidence or selected record', () => {
    const state = setup(), buffer = candidates.create();
    for (let i = 0; i < 2; i++) {
        const value = receive(state);
        assert.equal(capture(buffer, value), true);
        assert.equal(value.result.learning[0].updated.length, i === 0 ? 1 : 0);
    }
    assert.deepEqual(buffer.read().map(entry => entry.sourceId), ['input:1', 'input:2']);
    assert.equal(state.knowledge.wordExplanations.length, 1);
    assert.equal(state.records.length, 1);
});
test('later correction and caller or reader edits never rewrite past definitions or add on redelivery', () => {
    const state = setup(), buffer = candidates.create(), value = receive(state);
    capture(buffer, value);
    const original = buffer.read();
    const correction = receive(state, 'さっき間違えた。ぽぽは眠ることだよ');
    assert.ok(correction.result.learning[0].retraction);
    assert.equal(capture(buffer, correction), false);
    assert.equal(capture(buffer, value), false);
    value.result.input.raw = 'changed'; value.beforeKnowledge.meanings[0].source = 'changed';
    buffer.read()[0].captured.basis.source = 'changed';
    assert.deepEqual(buffer.read(), original);
});
test('eight settings across seven existing grammars separate understanding from expression', () => {
    for (const [locale, raw] of Object.entries(forms)) for (const foundation of [false, true]) {
        for (const life of [false, true]) for (const speech of ['short', 'gesture']) {
            const value = receive(setup({ foundation, life, speech }), raw, { locale });
            assert.equal(capture(candidates.create(), value), foundation && life, `${locale}/${foundation}/${life}/${speech}`);
        }
    }
});
test('unknown meanings, relations, built-in overwrite, labels, individual names and applications are excluded', () => {
    for (const raw of ['ぽぽは謎語のことだよ', '休むは眠ることだよ', '「甘い」', 'これを「ころ」と呼ぶよ', 'ぽぽ']) {
        assert.equal(capture(candidates.create(), receive(setup(), raw)), false);
    }
    const state = setup(); receive(state);
    assert.equal(capture(candidates.create(), receive(state, 'ぽぽ')), false);
});
test('different speakers, target scopes and attention-free explanations preserve their own sources', () => {
    const state = setup(), buffer = candidates.create();
    capture(buffer, receive(state));
    core.perceive(state, { scene: 'shore', attention: [{ id: 'berry:2', meaning: 'berry' }] });
    capture(buffer, receive(state, undefined, { speaker: 'visitor' }));
    core.perceive(state, { scene: 'shade', attention: [] });
    assert.equal(capture(buffer, receive(state)), true);
    assert.deepEqual(buffer.read().map(entry => entry.captured.explanation.adopted.scope), [
        { scene: 'clearing', targets: ['berry:1'] }, { scene: 'shore', targets: ['berry:2'] }, { scene: 'shade', targets: [] }]);
});
test('missing input-time basis, mismatched scopes and malformed adoption do not yield candidates', () => {
    const value = receive(setup());
    for (const mutate of [v => { v.beforeKnowledge.meanings = []; },
        v => { v.context.scene = 'shore'; }, v => { v.context.attention = []; },
        v => { v.result.learning[0].adopted.meaning = 'sleep'; },
        v => { v.result.learning[0].candidates = []; }, v => { v.result.interpretations.push(v.result.interpretations[0]); }]) {
        const invalid = copy(value); mutate(invalid);
        assert.equal(capture(candidates.create(), invalid), false);
    }
});
