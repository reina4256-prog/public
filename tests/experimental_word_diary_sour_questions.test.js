'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const api = require('../experimental_word_diary_sour_questions');
const candidates = require('../experimental_word_diary_candidates');
const f = require('../scripts/experimental/diary_sour_question_fixtures');
const copy = value => JSON.parse(JSON.stringify(value));
const values = f.fixtures();
const capture = (buffer, value) => api.capture(buffer, value.result, value.receipt);
for (const group of new Set(values.map(v => v.group))) test(`sour question material: ${group}`, () => {
    for (const item of values.filter(v => v.group === group)) {
        const value = copy(item.value), source = JSON.stringify(value), buffer = api.create();
        assert.equal(capture(buffer, value), item.expected, JSON.stringify([group, value.result.input]));
        assert.equal(JSON.stringify(value), source); assert.equal(capture(buffer, value), false);
        assert.equal(buffer.read().length, Number(item.expected));
        if (!item.expected) continue;
        const record = buffer.read()[0], retained = JSON.stringify(buffer.read()), u = record.captured.understanding;
        assert.equal(record.kind, 'sour_question_response');
        assert.deepEqual(u, value.result.understandings[0]);
        assert.equal(u.complete, false); assert.deepEqual(u.unresolved, [{ type: 'detail', token: 'sour' }]);
        assert.equal(u.polarity, 'positive'); assert.equal(record.captured.turnAnswer, null);
        assert.equal(record.captured.actualSpeech, true);
        assert.equal(record.captured.responseKind, value.receipt.reply.message);
        const meal = value.receipt.beforeWorld.experiences.filter(e => e.kind === 'eat').at(-1) || null;
        assert.deepEqual(record.captured.sources.meal, meal);
        const sweet = value.receipt.beforeState.knowledge.meanings.some(e => e.id === 'sweet');
        assert.equal(record.captured.responseKind, sweet && meal?.taste?.quality === 'sweet' ? 'unknown_taste_word' : 'uncertain');
        for (const flag of ['newTeaching', 'newLearning', 'newExperience']) assert.equal(record.captured[flag], false);
        for (const field of ['knowledge', 'experiences', 'selectionSources'])
            assert.deepEqual(value.receipt.beforeState[field], value.receipt.afterState[field]);
        for (const field of ['experiences', 'mode', 'destination', 'attention', 'history', 'reasons', 'activityStart'])
            assert.deepEqual(value.receipt.beforeWorld[field], value.receipt.afterWorld[field]);
        assert.equal(Object.hasOwn(value.receipt.afterState.context.turns.at(-1), 'answer'), false);
        record.captured.sources.input.raw = 'changed'; value.receipt.input.raw = 'changed';
        assert.equal(JSON.stringify(buffer.read()), retained);
        assert.throws(() => candidates.create().retain(record), TypeError);
    }
});
const edits = [
    v => { v.result.input.id = 'input:999'; }, v => { v.result.input.at++; },
    v => { v.result.input.raw += 'changed'; }, v => { v.result.input.speaker = 'other'; },
    v => { v.result.input.locale = 'en'; }, v => { v.result.input.scene += ':changed'; },
    v => { v.result.understandings[0].complete = true; },
    v => { v.result.interpretations.push(copy(v.result.interpretations[0])); },
    v => { v.receipt.input.at++; }, v => { v.receipt.inputKnowledge.relations = []; },
    v => { v.receipt.inputContext.scene += ':changed'; }, v => { v.receipt.beforeState.serial++; },
    v => { v.receipt.beforeState.context.attention.push({ id: 'other' }); }, v => { v.receipt.afterState.serial++; },
    v => { v.receipt.reply.message = 'invented'; }, v => { v.receipt.afterWorld.elapsed++; },
    v => { v.receipt.afterState.context.turns.at(-1).speaker = 'other'; },
    v => { delete v.receipt.beforeWorld; }, v => { delete v.receipt.afterState; },
    v => { v.result.understandings[0].subject = 'player'; }, v => { v.result.understandings[0].aspect = 'preference'; },
    v => { v.result.understandings[0].polarity = 'negative'; }, v => { v.result.understandings[0].eventTime = 'past'; },
    v => { v.result.understandings[0].questionSlot = 'taste_now'; },
    v => { v.result.understandings[0].target = { adopted: { id: 'berry:99' } }; },
    v => { v.receipt.afterState.context.turns.at(-1).answer = { actualAnswer: true }; },
    v => { v.receipt.afterWorld.experiences.push({ id: 'invented' }); },
    v => { v.result.understandings[0].unresolved = []; },
    v => { v.result.understandings[0].known.meaning = 'sour'; },
    v => { v.result.understandings[0].conditionStatus = 'met'; },
    v => { v.receipt.afterState.context.pendingQuestion = { kind: 'invented' }; }
];
test('current input, understanding, independent receipt and actual reply tampering is rejected', () => {
    for (const item of values.filter(v => v.expected)) for (const edit of edits) {
        const value = copy(item.value); edit(value);
        assert.equal(capture(api.create(), value), false, `${item.group}: ${edit}`);
    }
});
test('new inputs are separate and later meals never rewrite original uncertainty', () => {
    const v = f.setup(), buffer = api.create(), first = f.hear(v);
    assert.equal(capture(buffer, first), true); const old = buffer.read()[0];
    for (let i = 0; i < 12; i++) assert.equal(capture(buffer, f.hear(v)), true);
    f.eat(v); assert.equal(capture(buffer, f.hear(v)), true);
    assert.equal(buffer.read().at(-1).captured.responseKind, 'unknown_taste_word');
    assert.deepEqual(buffer.read()[0], old); assert.equal(old.captured.responseKind, 'uncertain');
    assert.equal(old.captured.sources.meal, null);
    assert.equal(capture(buffer, first), false); assert.equal(buffer.read().length, 14);
});
test('later knowledge or completed food never establishes old missing-knowledge input', () => {
    const v = f.setup({ foundation: false }), early = f.hear(v), buffer = api.create();
    assert.equal(capture(buffer, early), false);
    v.state.knowledge.relations = copy(f.setup().state.knowledge.relations);
    assert.equal(capture(buffer, f.hear(v)), true); assert.equal(capture(buffer, early), false);
    const n = f.setup({ life: false }), noEat = f.hear(n);
    f.eat(n); n.state.knowledge.meanings = copy(f.setup().state.knowledge.meanings);
    assert.equal(capture(api.create(), f.hear(n)), true); assert.equal(capture(buffer, noEat), false);
});
test('supplied completed meal details are copied and cross-receipt tampering is rejected', () => {
    const item = values.find(v => v.expected && v.value.receipt.reply.message === 'unknown_taste_word');
    for (const edit of [
        v => { v.receipt.beforeWorld.experiences = []; },
        v => { v.receipt.afterWorld.experiences = []; },
        v => { v.receipt.beforeWorld.experiences.filter(e => e.kind === 'eat').at(-1).taste.quality = 'sour'; },
        v => { v.receipt.beforeState.knowledge.meanings = v.receipt.beforeState.knowledge.meanings.filter(e => e.id !== 'sweet'); }
    ]) {
        const value = copy(item.value); edit(value); assert.equal(capture(api.create(), value), false);
    }
    const value = copy(item.value), buffer = api.create(); assert.equal(capture(buffer, value), true);
    const retained = JSON.stringify(buffer.read());
    buffer.read()[0].captured.sources.meal.taste.quality = 'edited';
    value.receipt.beforeWorld.experiences.length = 0;
    assert.equal(JSON.stringify(buffer.read()), retained);
});
test('independent journal rejects invalid records and non-JSON supply', () => {
    for (const value of [null, {}, { kind: 'question' }, { kind: 'sour_question_response', sourceId: 'input:0' },
        { kind: 'sour_question_response', sourceId: 'input:99999999999999999999', captured: {} }])
        assert.throws(() => api.create().retain(value), TypeError);
    for (const invalid of [Infinity, undefined, () => {}, new Date(), Symbol('invalid')]) {
        const value = copy(values.find(v => v.expected).value); value.receipt.invalid = invalid;
        assert.equal(capture(api.create(), value), false);
    }
    const value = copy(values.find(v => v.expected).value); value.receipt.invalid = value.receipt;
    assert.equal(capture(api.create(), value), false);
});
