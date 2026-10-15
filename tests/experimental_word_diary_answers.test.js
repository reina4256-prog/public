'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const candidates = require('../experimental_word_diary_candidates');
const api = require('../experimental_word_diary_answers');
const { fixtures, hear, setup } = require('../scripts/experimental/diary_answer_fixtures');
const copy = value => JSON.parse(JSON.stringify(value));
const values = fixtures();
const capture = (buffer, value) => api.capture(buffer, value.result, value.receipt);
for (const group of new Set(values.map(f => f.group))) test(`direct self-answer diary: ${group}`, () => {
    for (const { value, expected, slot, message } of values.filter(f => f.group === group)) {
        const source = JSON.stringify(value), buffer = candidates.create();
        assert.equal(capture(buffer, value), expected, JSON.stringify([value.result.input, value.receipt.reply]));
        assert.equal(JSON.stringify(value), source);
        if (expected) {
            const entry = buffer.read()[0], data = entry.captured;
            if (slot) assert.equal(data.understanding.questionSlot, slot);
            if (message) assert.equal(data.answer.message, message);
            assert.equal(entry.sourceId, value.result.input.id);
            assert.equal(entry.kind, 'question'); assert.equal(data.actualAnswer, true);
            assert.deepEqual(data.retainedAnswer, value.receipt.answer);
            assert.equal(data.retainedAnswer.source.answeredAt, value.result.input.at);
            assert.deepEqual(data.inputKnowledge, value.receipt.beforeState.knowledge);
            assert.equal(capture(buffer, value), false);
            const original = buffer.read(); buffer.read()[0].captured.answer.message = 'edited';
            const edited = copy(value); edited.receipt.beforeState.knowledge.meanings = [];
            edited.receipt.reply.message = 'edited';
            assert.deepEqual(buffer.read(), original);
        } else assert.deepEqual(buffer.read(), []);
    }
});
test('direct self-answer diary: mismatched occurrence, understanding, evidence, retained reply and snapshots are rejected', () => {
    const edits = [
        v => { v.result.input.id = 'input:999'; }, v => { v.result.input.raw = 'unrelated'; },
        v => { v.result.input.locale = 'other'; }, v => { v.result.input.speaker = 'other'; },
        v => { v.result.input.at++; }, v => { v.result.input.scene = 'other'; },
        v => { v.result.interpretations[0].slot = 'reason'; }, v => { v.result.understandings[0].complete = false; },
        v => { v.result.understandings[0].subject = 'player'; }, v => { v.result.understandings[0].roles = {}; },
        v => { v.result.understandings.push(copy(v.result.understandings[0])); },
        v => { v.receipt.beforeState.knowledge.meanings = []; }, v => { v.receipt.beforeState.knowledge.relations = []; },
        v => { v.receipt.beforeState.settings.speech = 'gesture'; }, v => { v.receipt.beforeState.serial++; },
        v => { v.receipt.answer = null; }, v => { v.receipt.answer.source.inputId = 'input:999'; },
        v => { v.receipt.answer.source.experienceId = 99999; }, v => { v.receipt.answer.eventTime = 'future'; },
        v => { v.receipt.reply.message = 'invented'; v.receipt.answer.response.message = 'invented'; },
        v => { v.receipt.afterWorld.elapsed++; }, v => { v.receipt.afterWorld.experiences.push({ id: 999 }); },
        v => { v.receipt.beforeState.knowledge.meanings.push(copy(v.receipt.beforeState.knowledge.meanings[0])); },
        v => { v.receipt.beforeWorld.activityStart = v.receipt.beforeWorld.elapsed + 1; }
    ];
    for (const root of values.filter(f => f.expected)) for (const edit of edits) {
        const v = copy(root.value); edit(v);
        assert.equal(capture(candidates.create(), v), false, `${root.group}: ${edit}`);
    }
});
test('direct self-answer diary: answer evidence is the actual reference, not a newly completed or reconstructed experience', () => {
    for (const root of values.filter(f => f.expected && f.value.receipt.answer.source.experienceId !== null)) {
        for (const field of ['beforeWorld', 'afterWorld']) {
            const v = copy(root.value); v.receipt[field].experiences = [];
            assert.equal(capture(candidates.create(), v), false);
        }
        const duplicate = copy(root.value), world = duplicate.receipt.beforeWorld;
        world.experiences.push(copy(world.experiences.find(e => e.id === duplicate.receipt.answer.source.experienceId)));
        assert.equal(capture(candidates.create(), duplicate), false);
    }
});
test('direct self-answer diary: new input is a new occurrence; reading and later knowledge never rewrite the original', () => {
    const value = setup(), buffer = candidates.create();
    const first = hear(value, 'どこに行くの？'), second = hear(value, 'どこに行くの？');
    assert.equal(capture(buffer, first), true); assert.equal(capture(buffer, second), true);
    const original = buffer.read(); first.receipt.beforeWorld.destination = 'shade';
    first.receipt.beforeState.knowledge.meanings = []; first.receipt.answer.response.message = 'edited';
    assert.equal(capture(buffer, first), false); assert.deepEqual(buffer.read(), original);
    assert.notEqual(original[0].sourceId, original[1].sourceId);
    for (const entry of original) assert.equal(entry.captured.sources.referencedExperience, null);
});
