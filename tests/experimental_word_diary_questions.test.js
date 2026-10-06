'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const core = require('../experimental_word_learning_core');
const worldApi = require('../experimental_word_learning_world');
const catalog = require('../experimental_word_learning_catalog.json');
const candidates = require('../experimental_word_diary_candidates');
const questions = require('../experimental_word_diary_questions');
const notebook = require('../experimental_word_learning_notebook');
function occurrence(text = 'どうして休んだの？', options = {}) {
    const state = core.create(options, catalog);
    const world = worldApi.create();
    const result = core.receive(state, text, catalog, { at: 100 });
    const reply = worldApi.respond(world, result, state);
    return { state, world, result, reply };
}
test('actual understood unanswered question passes with its original input and understanding', () => {
    const { state, world, result, reply } = occurrence();
    const before = JSON.stringify({ state, world, result, reply });
    const buffer = candidates.create();
    assert.equal(questions.capture(buffer, result, reply), true);
    assert.deepEqual(buffer.read(), [{ occurrenceId: 'question:input:1', kind: 'question',
        sourceId: 'input:1', captured: { raw: result.input.raw, locale: 'ja',
            understanding: result.understandings.at(-1), answer: 'unknown' } }]);
    assert.equal(JSON.stringify({ state, world, result, reply }), before);
    notebook.rememberQuestion(state, result, reply);
    assert.equal(state.notebookQuestions[0].inputId, buffer.read()[0].sourceId);
});
test('unrecognized input and missing question meanings do not become unanswered candidates', () => {
    for (const value of [occurrence('全く対応していない文'), occurrence(undefined, { foundation: false, life: false })]) {
        const buffer = candidates.create();
        assert.equal(questions.capture(buffer, value.result, { message: 'answer_unknown' }), false);
        assert.deepEqual(buffer.read(), []);
    }
});
test('gesture and answered replies preserve the existing question gate', () => {
    const value = occurrence(undefined, { speech: 'gesture' });
    assert.equal(value.result.understandings.at(-1).complete, true);
    assert.equal(value.reply.message, 'attend');
    const buffer = candidates.create();
    assert.equal(questions.capture(buffer, value.result, value.reply), false);
    assert.equal(questions.capture(buffer, value.result, { message: 'rest_helped' }), false);
    assert.deepEqual(buffer.read(), []);
});
test('repeat delivery and later answer cannot rewrite the original unanswered occurrence', () => {
    const value = occurrence();
    const buffer = candidates.create();
    questions.capture(buffer, value.result, value.reply);
    const original = buffer.read();
    value.result.understandings.at(-1).known.meaning = 'sweet';
    assert.equal(questions.capture(buffer, value.result, value.reply), false);
    assert.equal(questions.capture(buffer, value.result, { message: 'rest_helped' }), false);
    buffer.read()[0].captured.answer = 'found';
    assert.deepEqual(buffer.read(), original);
});
test('a genuinely new input with the same wording remains a separate question occurrence', () => {
    const value = occurrence();
    const buffer = candidates.create();
    questions.capture(buffer, value.result, value.reply);
    const next = core.receive(value.state, value.result.input.raw, catalog, { at: 101 });
    const reply = worldApi.respond(value.world, next, value.state);
    assert.equal(questions.capture(buffer, next, reply), true);
    assert.deepEqual(buffer.read().map(item => item.sourceId), ['input:1', 'input:2']);
});
