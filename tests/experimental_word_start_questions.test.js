'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const questions = require('../experimental_word_start_questions');
const core = require('../experimental_word_learning_core');
const catalog = require('../experimental_word_learning_catalog.json');

test('all everyday answer combinations preserve independent starts without invented experience', () => {
    const combinations = new Set(), appearances = new Set();
    for (let n = 0; n < 3 ** 7; n++) {
        let rest = n;
        const answers = Array.from({ length: 7 }, () => { const a = rest % 3; rest = Math.floor(rest / 3); return a; });
        const result = questions.resolve(answers);
        const state = core.create(result.settings, catalog);
        state.startOrigin = { version: 1, answers: answers.slice() };
        assert.equal(questions.validOrigin(state.startOrigin, state.settings, result.appearance), true);
        assert.deepEqual(state.records, []); assert.deepEqual(state.notes, []);
        assert.equal(state.experiences, undefined);
        assert.ok(state.knowledge.meanings.every(k => k.source === 'initial'));
        assert.ok(state.knowledge.relations.every(k => k.source === 'initial'));
        assert.equal(state.knowledge.meanings.length > 0, result.settings.life);
        assert.equal(state.knowledge.relations.length > 0, result.settings.foundation);
        combinations.add(JSON.stringify(result.settings)); appearances.add(result.appearance);
        for (const axis of [1, 5, 6]) {
            const changed = answers.slice(); changed[axis] = (changed[axis] + 1) % 3;
            const next = questions.resolve(changed).settings;
            for (const key of ['foundation', 'life', 'speech']) {
                if (key !== { 1: 'foundation', 5: 'life', 6: 'speech' }[axis]) assert.equal(next[key], result.settings[key]);
            }
        }
    }
    assert.equal(combinations.size, 8); assert.equal(appearances.size, 3);
});

test('start provenance rejects incomplete or altered answers, while older starts stay valid', () => {
    for (const answers of [[], new Array(7), [0,0,0,0,0,0], [0,0,0,0,0,0,3], [0,0,0,0,0,0,.5]]) {
        assert.equal(questions.validAnswers(answers), false);
        assert.throws(() => questions.resolve(answers));
    }
    const origin = { version: 1, answers: [0,1,1,1,0,0,0] }, result = questions.resolve(origin.answers);
    assert.equal(questions.validOrigin(undefined, result.settings, result.appearance), true);
    assert.equal(questions.validOrigin(JSON.parse(JSON.stringify(origin)), result.settings, result.appearance), true);
    assert.equal(questions.validOrigin(origin, { ...result.settings, life: false }, result.appearance), false);
    assert.equal(questions.validOrigin(origin, result.settings, 'spirit'), false);
    assert.equal(questions.validOrigin({ ...origin, experience: true }, result.settings, result.appearance), false);
});

test('legacy-style tied appearance draws change only the preview species and preserve old provenance', () => {
    const answers = [0, 0, 0, 2, 0, 1, 1]; // robot=2, seed=2, spirit=1
    const first = questions.resolve(answers, 0), second = questions.resolve(answers, .99);
    assert.notEqual(first.appearance, second.appearance);
    assert.deepEqual(first.settings, second.settings);
    assert.equal(questions.validOrigin({ version: 2, answers, draw: .99 }, second.settings, second.appearance), true);
    assert.equal(questions.validOrigin({ version: 1, answers }, first.settings, first.appearance), true);
    assert.equal(questions.validOrigin({ version: 2, answers, draw: 1 }, second.settings, second.appearance), false);
    assert.equal(questions.validOrigin({ version: 2, answers }, second.settings, second.appearance), false);
});
