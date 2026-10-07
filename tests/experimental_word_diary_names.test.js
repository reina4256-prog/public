'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const core = require('../experimental_word_learning_core');
const catalog = require('../experimental_word_learning_catalog.json');
const candidates = require('../experimental_word_diary_candidates');
const names = require('../experimental_word_diary_names');
const copy = value => JSON.parse(JSON.stringify(value));
function setup(options = {}) {
    const state = core.create(options, catalog);
    core.perceive(state, { attention: [{ id: 'berry:1', meaning: 'berry' }], scene: 'clearing' });
    return state;
}
function receive(state, raw = 'これを「ころ」と呼ぶよ', options = {}) {
    const context = copy({ scene: state.context.scene, attention: state.context.attention });
    const result = core.receive(state, raw, catalog, { at: 100 + state.serial, ...options });
    return { result, context };
}

test('individual naming captures actual original input and situated understanding without mutating game data', () => {
    const state = setup(), value = receive(state), buffer = candidates.create();
    const before = JSON.stringify({ state, value });
    assert.equal(names.capture(buffer, value.result, value.context), true);
    const entry = buffer.read()[0];
    assert.equal(entry.kind, 'teaching');
    assert.equal(entry.sourceId, value.result.input.id);
    assert.deepEqual(entry.captured.sources, { input: value.result.input, scene: 'clearing',
        attention: value.context.attention, frame: value.result.interpretations[0], index: 0 });
    assert.deepEqual(entry.captured.understanding, value.result.understandings[0]);
    assert.deepEqual(entry.captured.association, value.result.learning[0]);
    assert.equal(entry.captured.association.adopted.status, 'tentative');
    assert.equal(state.knowledge.associations[0].status, 'situated');
    assert.equal(JSON.stringify({ state, value }), before);
});

test('a newly heard identical name is a separate teaching even without new evidence or record', () => {
    const state = setup(), buffer = candidates.create();
    for (let index = 0; index < 2; index++) {
        const value = receive(state);
        assert.equal(names.capture(buffer, value.result, value.context), true);
        assert.equal(value.result.learning[0].updated.length, index === 0 ? 1 : 0);
    }
    assert.deepEqual(buffer.read().map(entry => entry.sourceId), ['input:1', 'input:2']);
    assert.equal(state.records.length, 1);
    assert.equal(state.knowledge.associations[0].evidence.length, 1);
});

test('later correction, redelivery, rereading and caller edits do not rewrite the captured teaching', () => {
    const state = setup(), value = receive(state), buffer = candidates.create();
    names.capture(buffer, value.result, value.context);
    const original = buffer.read();
    const corrected = receive(state, 'さっき間違えた。ころは木の実のことだよ');
    assert.ok(corrected.result.learning[0].retraction);
    assert.equal(names.capture(buffer, corrected.result, corrected.context), false);
    assert.equal(names.capture(buffer, value.result, value.context), false);
    value.context.attention[0].id = 'berry:2';
    value.result.input.raw = 'changed';
    value.result.learning[0].adopted.word = 'changed';
    buffer.read()[0].captured.understanding.complete = false;
    assert.deepEqual(buffer.read(), original);
});

test('all eight settings keep naming understanding separate from speech and life knowledge', () => {
    for (const foundation of [false, true]) for (const life of [false, true]) {
        for (const speech of ['short', 'gesture']) {
            const state = setup({ foundation, life, speech }), value = receive(state);
            const buffer = candidates.create();
            assert.equal(names.capture(buffer, value.result, value.context), foundation);
            assert.equal(buffer.read().length, foundation ? 1 : 0);
        }
    }
});

test('ambiguous attention and bare cooccurrence never become understood naming teachings', () => {
    const state = setup();
    core.perceive(state, { attention: [{ id: 'berry:1', meaning: 'berry' }, { id: 'berry:2', meaning: 'berry' }], scene: 'clearing' });
    for (const raw of ['これを「ころ」と呼ぶよ', 'ころ']) {
        const value = receive(state, raw), buffer = candidates.create();
        assert.equal(names.capture(buffer, value.result, value.context), false);
        assert.deepEqual(buffer.read(), []);
    }
});

test('definitions, life labels and incorrect context or correspondence stay outside this adapter', () => {
    const state = setup();
    for (const raw of ['ぽぽは休むことだよ', '「甘い」']) {
        const value = receive(state, raw);
        assert.equal(names.capture(candidates.create(), value.result, value.context), false);
    }
    const value = receive(state);
    assert.equal(names.capture(candidates.create(), value.result, { ...value.context, scene: 'shade' }), false);
    assert.equal(names.capture(candidates.create(), value.result, { ...value.context, attention: [] }), false);
    value.result.learning[0].adopted.target = 'berry:2';
    assert.equal(names.capture(candidates.create(), value.result, value.context), false);
});

test('the same name on another individual or from another speaker retains its own source and scope', () => {
    const state = setup(), buffer = candidates.create();
    const first = receive(state);
    names.capture(buffer, first.result, first.context);
    core.perceive(state, { attention: [{ id: 'berry:2', meaning: 'berry' }], scene: 'shore' });
    const next = receive(state, undefined, { speaker: 'visitor' });
    assert.equal(names.capture(buffer, next.result, next.context), true);
    assert.deepEqual(buffer.read().map(entry => [entry.captured.sources.input.speaker,
        entry.captured.association.adopted.target]), [['player', 'berry:1'], ['visitor', 'berry:2']]);
});
