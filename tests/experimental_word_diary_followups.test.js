'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const api = require('../experimental_word_diary_followups');
const answers = require('../experimental_word_diary_answers');
const { fixtures, setup, hear, forms } = require('../scripts/experimental/diary_followup_fixtures');
const copy = value => JSON.parse(JSON.stringify(value));
const values = fixtures();
const capture = (buffer, value) => api.capture(buffer, value.result, value.receipt);
for (const group of new Set(values.map(f => f.group))) test(`follow-up diary: ${group}`, () => {
    for (const { value, expected, type, message } of values.filter(f => f.group === group)) {
        const original = JSON.stringify(value), buffer = api.create();
        assert.equal(capture(buffer, value), expected, JSON.stringify([value.result.input, value.receipt.reply]));
        assert.equal(JSON.stringify(value), original);
        assert.equal(buffer.read().length, expected && type === 'detail' ? 1 : 0);
        assert.equal(buffer.readRepetitions().length, expected && type === 'repeat' ? 1 : 0);
        if (!expected) continue;
        const record = [...buffer.read(), ...buffer.readRepetitions()][0];
        assert.equal(record.captured.answer.message, message);
        assert.equal(record.captured.newExperience, false);
        assert.deepEqual(record.captured.inputKnowledge, value.receipt.beforeState.knowledge);
        assert.deepEqual(record.captured.sources.originalOutput, value.receipt.beforeState.context.lastOutput || null);
        assert.deepEqual(record.captured.retainedAnswer, value.receipt.answer);
        assert.equal(record.sourceId, value.result.input.id);
        const retained = JSON.stringify([buffer.read(), buffer.readRepetitions()]);
        assert.equal(capture(buffer, value), false);
        record.captured.answer.message = 'edited'; value.receipt.reply.message = 'edited';
        assert.equal(JSON.stringify([buffer.read(), buffer.readRepetitions()]), retained);
        // Restore fixture input after testing caller-owned edits.
        value.receipt.reply.message = JSON.parse(original).receipt.reply.message;
    }
});
const edits = [
    v => { v.result.input.id = 'input:999'; }, v => { v.result.input.raw = 'unrelated'; },
    v => { v.result.input.locale = 'other'; }, v => { v.result.input.speaker = 'other'; },
    v => { v.result.input.at++; }, v => { v.result.input.scene = 'other'; },
    v => { v.result.interpretations[0].catalogRule = 'question'; },
    v => { v.result.understandings[0].complete = false; }, v => { v.result.understandings[0].subject = 'player'; },
    v => { v.result.understandings[0].roles = {}; },
    v => { v.result.understandings.push(copy(v.result.understandings[0])); },
    v => { v.receipt.beforeState.knowledge.meanings = []; }, v => { v.receipt.beforeState.knowledge.relations = []; },
    v => { v.receipt.beforeState.settings.speech = 'gesture'; }, v => { v.receipt.beforeState.serial++; },
    v => { v.receipt.answer = null; }, v => { v.receipt.answer.source.inputId = 'input:999'; },
    v => { v.receipt.answer.source.experienceId = 99999; }, v => { v.receipt.answer.eventTime = 'future'; },
    v => { v.receipt.reply.message = 'invented'; v.receipt.answer.response.message = 'invented'; },
    v => { v.receipt.afterWorld.elapsed++; }, v => { v.receipt.afterWorld.experiences.push({ id: 999 }); },
    v => { v.receipt.beforeState.knowledge.meanings.push(copy(v.receipt.beforeState.knowledge.meanings[0])); },
    v => { v.receipt.beforeWorld.activityStart = v.receipt.beforeWorld.elapsed + 1; },
    v => { v.receipt.turn.speaker = 'other'; }, v => { v.receipt.turn.answer.source.answeredAt++; },
    v => { const turns = v.receipt.beforeState.context.turns;
        if (!turns.length) turns.push({ id: 'input:1' });
        turns.push(copy(turns.at(-1))); }
];
test('follow-up diary: occurrence, understanding, original context, answer and world tampering is rejected', () => {
    for (const root of values.filter(f => f.expected)) for (const edit of edits) {
        const value = copy(root.value); edit(value);
        const buffer = api.create();
        assert.equal(capture(buffer, value), false, `${root.group}: ${edit}`);
        assert.deepEqual([buffer.read(), buffer.readRepetitions()], [[], []]);
    }
});
test('follow-up diary: original output provenance and referenced experience cannot be replaced', () => {
    for (const root of values.filter(f => f.expected && f.value.receipt.beforeState.context.lastOutput?.topic)) {
        for (const edit of [f => { f.source.kind = 'player_report'; }, f => { f.listener = 'other'; },
            f => { f.source.at++; }, f => { f.evidence.activity.mode = 'invented'; },
            f => { f.evidence.experienceId = 99999; }, f => { f.eventTime = 'future'; }]) {
            const value = copy(root.value); edit(value.receipt.beforeState.context.lastOutput);
            assert.equal(capture(api.create(), value), false, `${root.group}: ${edit}`);
        }
    }
    for (const root of values.filter(f => f.expected && f.value.receipt.beforeState.context.lastOutput?.evidence?.experienceId != null)) {
        const id = root.value.receipt.beforeState.context.lastOutput.evidence.experienceId;
        for (const duplicate of [false, true]) {
            const value = copy(root.value), world = value.receipt.beforeWorld;
            if (duplicate) world.experiences.push(copy(world.experiences.find(e => e.id === id)));
            else world.experiences = world.experiences.filter(e => e.id !== id);
            assert.equal(capture(api.create(), value), false);
        }
    }
});
test('follow-up diary: repetitions preserve the original candidate and answer identity across repeated deliveries', () => {
    const v = setup(), buffer = api.create(), original = hear(v, '何してる？');
    assert.equal(answers.capture(buffer, original.result, original.receipt), true);
    const first = buffer.read();
    for (let i = 0; i < 12; i++) {
        const repeated = hear(v, forms.ja[0]);
        assert.equal(capture(buffer, repeated), true);
        assert.equal(capture(buffer, repeated), false);
        assert.deepEqual(buffer.read(), first);
        assert.deepEqual(buffer.readRepetitions().at(-1).captured.retainedAnswer, original.receipt.answer);
    }
    assert.equal(buffer.readRepetitions().length, 12);
    const snapshot = buffer.readRepetitions(); snapshot[0].captured.sources.previousTurn.answer = null;
    assert.ok(buffer.readRepetitions()[0].captured.sources.previousTurn.answer);
});
test('follow-up diary: new clarification inputs stay separate without overwriting earlier understanding', () => {
    const v = setup(), buffer = api.create(); hear(v, '何してる？');
    const first = hear(v, forms.ja[1]), second = hear(v, forms.ja[3]);
    assert.equal(capture(buffer, first), true); assert.equal(capture(buffer, second), true);
    const original = buffer.read();
    first.receipt.beforeState.knowledge.meanings = [];
    assert.equal(capture(buffer, first), false);
    assert.deepEqual(buffer.read(), original); assert.notEqual(original[0].sourceId, original[1].sourceId);
    assert.equal(original[0].captured.sources.originalOutput.source.inputId, 'input:1');
    assert.equal(original[1].captured.sources.originalOutput.source.inputId, 'input:1');
});
