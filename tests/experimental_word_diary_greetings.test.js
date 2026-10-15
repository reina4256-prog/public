'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const api = require('../experimental_word_diary_greetings');
const candidates = require('../experimental_word_diary_candidates');
const { fixtures, setup, hear } = require('../scripts/experimental/diary_greeting_fixtures');
const copy = value => JSON.parse(JSON.stringify(value));
const values = fixtures();
const capture = (buffer, value) => api.capture(buffer, value.result, value.receipt);
for (const group of new Set(values.map(f => f.group))) test(`greeting material: ${group}`, () => {
    for (const f of values.filter(item => item.group === group)) {
        const v = copy(f.value), source = JSON.stringify(v), buffer = api.create();
        assert.equal(capture(buffer, v), f.expected, JSON.stringify([group, v.result.input]));
        assert.equal(JSON.stringify(v), source); assert.equal(buffer.read().length, Number(f.expected));
        assert.equal(capture(buffer, v), false);
        if (!f.expected) continue;
        const record = buffer.read()[0], retained = JSON.stringify(buffer.read());
        assert.equal(record.kind, 'greeting');
        assert.deepEqual(record.captured.understanding, v.result.understandings[0]);
        assert.equal(record.captured.actualSpeech, v.receipt.beforeState.settings.speech === 'short');
        for (const flag of ['newTeaching', 'newLearning', 'newExperience', 'morningVerified'])
            assert.equal(record.captured[flag], false);
        for (const field of ['knowledge', 'experiences', 'selectionSources'])
            assert.deepEqual(v.receipt.beforeState[field], v.receipt.afterState[field]);
        assert.deepEqual(v.receipt.beforeWorld.experiences, v.receipt.afterWorld.experiences);
        record.captured.sources.input.raw = 'changed'; v.result.input.raw = 'changed';
        assert.equal(JSON.stringify(buffer.read()), retained);
        assert.throws(() => candidates.create().retain(record), TypeError);
    }
});
const edits = [
    v => { v.result.input.id = 'input:999'; }, v => { v.result.input.at++; },
    v => { v.result.input.raw += 'changed'; }, v => { v.result.input.speaker = 'other'; },
    v => { v.result.input.locale = 'en'; }, v => { v.result.input.scene += ':changed'; },
    v => { v.result.understandings[0].complete = false; },
    v => { v.result.interpretations.push(copy(v.result.interpretations[0])); },
    v => { v.receipt.input.at++; }, v => { v.receipt.inputKnowledge.relations = []; },
    v => { v.receipt.inputContext.scene += ':changed'; }, v => { v.receipt.beforeState.serial++; },
    v => { v.receipt.beforeState.context.attention.push({ id: 'other', meaning: 'berry' }); }, v => { v.receipt.afterState.serial++; },
    v => { v.receipt.reply.message = 'invented'; }, v => { v.receipt.afterWorld.elapsed++; },
    v => { v.receipt.afterState.context.turns.at(-1).speaker = 'other'; },
    v => { delete v.receipt.beforeWorld; }, v => { delete v.receipt.afterState; }
];
test('greeting material rejects mismatched inputs, knowledge, actual expression and before/after copies', () => {
    for (const f of values.filter(item => item.expected)) for (const edit of edits) {
        const v = copy(f.value); edit(v);
        assert.equal(capture(api.create(), v), false, `${f.group}: ${edit}`);
    }
});
test('new greeting inputs remain separate while duplicate input cannot overwrite material', () => {
    const v = setup(), buffer = api.create(), first = hear(v);
    assert.equal(capture(buffer, first), true); const retained = buffer.read()[0];
    for (let i = 0; i < 12; i++) assert.equal(capture(buffer, hear(v)), true);
    assert.equal(buffer.read().length, 13);
    assert.equal(capture(buffer, first), false);
    assert.deepEqual(buffer.read()[0], retained);
    assert.equal(new Set(buffer.read().map(item => item.sourceId)).size, 13);
});
test('later initial knowledge cannot retroactively turn an old partial greeting into material', () => {
    const v = setup({ foundation: false }), buffer = api.create(), early = hear(v);
    assert.equal(capture(buffer, early), false);
    v.state.knowledge.relations = copy(setup().state.knowledge.relations);
    assert.equal(capture(buffer, hear(v)), true);
    assert.equal(capture(buffer, early), false); assert.equal(buffer.read().length, 1);
});
test('greeting journal rejects invalid or non-JSON data and keeps independent retained copies', () => {
    for (const value of [null, {}, { kind: 'teaching' }, { kind: 'greeting', sourceId: 'input:0' },
        { kind: 'greeting', sourceId: 'input:99999999999999999999', captured: {} }])
        assert.throws(() => api.create().retain(value), TypeError);
    for (const malformed of [Infinity, undefined, () => {}, new Date(), Symbol('invalid')]) {
        const v = copy(values.find(f => f.expected).value); v.receipt.invalid = malformed;
        assert.equal(capture(api.create(), v), false);
    }
    const v = copy(values.find(f => f.expected).value); v.receipt.invalid = v.receipt;
    assert.equal(capture(api.create(), v), false);
});
