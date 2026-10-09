'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const candidates = require('../experimental_word_diary_candidates');
const api = require('../experimental_word_diary_known_reason_explanation_examples');
const fixtures = require('../scripts/experimental/diary_known_reason_explanation_fixtures').fixtures();
for (const group of [...new Set(fixtures.map(f => f.group))]) test(`known reason explanation diary: ${group}`, () => {
    for (const fixture of fixtures.filter(f => f.group === group)) {
        const source = JSON.stringify(fixture), buffer = candidates.create();
        const capture = v => api.capture(buffer, v.result, v.context, v.beforeKnowledge, v.beforeExperiences, v.beforeSelections);
        assert.deepEqual(fixture.values.map(capture), fixture.expected);
        assert.equal(JSON.stringify(fixture), source);
        const original = buffer.read(); assert.ok(fixture.values.map(capture).every(v => v === false));
        for (const entry of original) {
            const data = entry.captured;
            assert.equal(entry.kind, 'teaching'); assert.equal(entry.sourceId, data.sources.input.id);
            assert.equal(data.understanding.complete, true); assert.equal(data.understanding.subject, 'self');
            assert.deepEqual(data.understanding.relations, ['question', 'reason']);
            assert.deepEqual(data.understanding.unresolved, []);
            assert.equal(data.questionBasis.length, 1);
            assert.equal(data.reasonBasis.length, 1);
            assert.equal(data.pairing.relationAcquired, false);
            assert.deepEqual(data.pairing.candidates[0].questionBasis, data.questionBasis[0]);
            assert.equal(data.sources.selectionSource.understanding.roles.actualParticipation, false);
            assert.equal(data.pairing.candidates[0].eventReference.experienceId, data.sources.referencedExperience.id);
            assert.deepEqual(data.basis, data.sources.selectionSource.meaningBasis);
            for (const key of ['answer', 'actualAnswer', 'conditionJudgment', 'sequenceJudgment']) assert.equal(data[key], undefined);
        }
        if (original.length) {
            buffer.read()[0].captured.understanding.complete = false;
            buffer.read()[0].captured.questionBasis = [];
            fixture.values[0].result.input.raw = 'changed'; fixture.values[0].beforeKnowledge.meanings = [];
        }
        assert.deepEqual(buffer.read(), original);
    }
});
