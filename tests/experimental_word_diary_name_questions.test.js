'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const api = require('../experimental_word_diary_name_questions');
const candidates = require('../experimental_word_diary_candidates');
const f = require('../scripts/experimental/diary_name_question_fixtures');
const copy = value => JSON.parse(JSON.stringify(value));
const values = f.fixtures();
const capture = (buffer, value) => api.capture(buffer, value.result, value.receipt);
for (const group of new Set(values.map(v => v.group))) test(`name question material: ${group}`, () => {
    for (const item of values.filter(v => v.group === group)) {
        const value = copy(item.value), source = JSON.stringify(value), buffer = api.create();
        assert.equal(capture(buffer, value), item.expected, JSON.stringify([group, value.result.input]));
        assert.equal(JSON.stringify(value), source); assert.equal(capture(buffer, value), false);
        assert.equal(buffer.read().length, Number(item.expected));
        if (!item.expected) continue;
        const record = buffer.read()[0], retained = JSON.stringify(buffer.read());
        assert.equal(record.kind, 'name_question_response');
        assert.deepEqual(record.captured.understanding, value.result.understandings[0]);
        assert.equal(record.captured.responseKind, value.receipt.reply.message);
        assert.equal(record.captured.actualSpeech, true); assert.equal(record.captured.turnAnswer, null);
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
    v => { v.result.understandings[0].complete = false; },
    v => { v.result.interpretations.push(copy(v.result.interpretations[0])); },
    v => { v.receipt.input.at++; }, v => { v.receipt.inputKnowledge.relations = []; },
    v => { v.receipt.inputContext.scene += ':changed'; }, v => { v.receipt.beforeState.serial++; },
    v => { v.receipt.beforeState.context.attention.push({ id: 'other' }); }, v => { v.receipt.afterState.serial++; },
    v => { v.receipt.reply.message = 'invented'; }, v => { v.receipt.afterWorld.elapsed++; },
    v => { v.receipt.afterState.context.turns.at(-1).speaker = 'other'; },
    v => { delete v.receipt.beforeWorld; }, v => { delete v.receipt.afterState; },
    v => { v.result.understandings[0].subject = 'player'; }, v => { v.result.understandings[0].aspect = 'preference'; },
    v => { v.result.understandings[0].polarity = 'negative'; }, v => { v.result.understandings[0].eventTime = 'past'; },
    v => { v.result.understandings[0].questionSlot = 'current_activity'; },
    v => { v.result.understandings[0].target.adopted.id = 'berry:99'; },
    v => { v.receipt.afterState.context.turns.at(-1).answer = { actualAnswer: true }; },
    v => { v.receipt.afterWorld.experiences.push({ id: 'invented' }); },
    v => { v.receipt.afterState.context.pendingQuestion = { kind: 'invented' }; },
    v => { delete v.receipt.origins; }, v => { delete v.receipt.confirmation; }
];
test('current input, independent context, understanding, actual reply and state tampering is rejected', () => {
    for (const item of values.filter(v => v.expected)) for (const edit of edits) {
        const value = copy(item.value); edit(value);
        assert.equal(capture(api.create(), value), false, `${item.group}: ${edit}`);
    }
});
const originEdits = [
    o => { o.result.input.at++; }, o => { o.result.input.speaker = 'other'; },
    o => { o.result.input.raw += 'changed'; }, o => { o.receipt.inputKnowledge.relations = []; },
    o => { o.receipt.inputContext.scene += ':changed'; }, o => { o.receipt.beforeState.serial++; },
    o => { o.receipt.afterState.serial++; }, o => { o.receipt.reply.message = 'invented'; },
    o => { o.receipt.afterWorld.elapsed++; }, o => { delete o.receipt.beforeWorld; },
    o => { delete o.receipt.afterState; }, o => { o.receipt.origins = []; }
];
test('each active naming origin and confirmation must retain its separate full source receipt', () => {
    for (const item of values.filter(v => v.expected)) {
        for (let i = 0; i < item.value.receipt.origins.length; i++) {
            for (const edit of originEdits) {
                const value = copy(item.value); edit(value.receipt.origins[i]);
                assert.equal(capture(api.create(), value), false, `${item.group}: origin ${i}: ${edit}`);
            }
            for (const duplicate of [false, true]) {
                const value = copy(item.value);
                if (duplicate) value.receipt.origins.push(copy(value.receipt.origins[i]));
                else value.receipt.origins.splice(i, 1);
                assert.equal(capture(api.create(), value), false);
            }
        }
        if (item.value.receipt.confirmation) for (const edit of originEdits) {
            const value = copy(item.value); edit(value.receipt.confirmation);
            assert.equal(capture(api.create(), value), false, `${item.group}: confirmation: ${edit}`);
        }
    }
});
test('new input records remain distinct and old responses never become later confirmations', () => {
    const v = f.named(), buffer = api.create(), first = f.hear(v);
    assert.equal(capture(buffer, first), true); const old = buffer.read()[0];
    for (let i = 0; i < 12; i++) assert.equal(capture(buffer, f.hear(v)), true);
    f.hear(v, 'うん'); const confirmed = f.hear(v);
    assert.equal(capture(buffer, confirmed), true); assert.equal(buffer.read().at(-1).captured.responseKind, 'name_known');
    assert.deepEqual(buffer.read()[0], old); assert.equal(old.captured.responseKind, 'name_echo');
    assert.equal(capture(buffer, first), false); assert.equal(buffer.read().length, 14);
});
test('later knowledge, naming and attention cannot retroactively establish earlier material', () => {
    const v = f.setup({ foundation: false }), buffer = api.create(), early = f.hear(v);
    assert.equal(capture(buffer, early), false);
    v.state.knowledge.relations = copy(f.setup().state.knowledge.relations);
    assert.equal(capture(buffer, f.hear(v)), true); assert.equal(capture(buffer, early), false);
    const n = f.setup({ life: false }), unnamed = f.hear(n);
    assert.equal(capture(buffer, unnamed), false); f.hear(n, 'これをころって呼ぼう');
    assert.equal(capture(api.create(), f.hear(n)), true); assert.equal(capture(buffer, unnamed), false);
    const a = f.setup(); f.focus(a, 'clearing', []); const ambiguous = f.hear(a);
    f.focus(a); assert.equal(capture(api.create(), f.hear(a)), true);
    assert.equal(capture(buffer, ambiguous), false);
});
test('returned origins and pending material are independent copies and foreign candidate buffers reject the kind', () => {
    const value = f.hear(f.named({}, true)), buffer = api.create(); assert.equal(capture(buffer, value), true);
    const retained = JSON.stringify(buffer.read()), record = buffer.read()[0];
    record.captured.sources.origins[0].result.input.raw = 'edited';
    record.captured.sources.confirmation.result.input.raw = 'edited';
    value.receipt.origins.length = 0; value.receipt.confirmation = null;
    assert.equal(JSON.stringify(buffer.read()), retained);
    assert.throws(() => candidates.create().retain(record), TypeError);
});
test('invalid journal and non-JSON or cyclic supply are rejected', () => {
    for (const value of [null, {}, { kind: 'question' }, { kind: 'name_question_response', sourceId: 'input:0' },
        { kind: 'name_question_response', sourceId: 'input:99999999999999999999', captured: {} }])
        assert.throws(() => api.create().retain(value), TypeError);
    for (const invalid of [Infinity, undefined, () => {}, new Date(), Symbol('invalid')]) {
        const value = copy(values.find(v => v.expected).value); value.receipt.invalid = invalid;
        assert.equal(capture(api.create(), value), false);
    }
    const value = copy(values.find(v => v.expected).value); value.receipt.invalid = value.receipt;
    assert.equal(capture(api.create(), value), false);
});
