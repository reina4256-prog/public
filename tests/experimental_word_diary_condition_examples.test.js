'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const candidates = require('../experimental_word_diary_candidates');
const examples = require('../experimental_word_diary_condition_examples');
const fixtures = require('../scripts/experimental/diary_condition_fixtures').fixtures();
for (const group of [...new Set(fixtures.map(f => f.group))]) test(`condition diary: ${group}`, () => {
    for (const fixture of fixtures.filter(f => f.group === group)) {
        const source = JSON.stringify(fixture), buffer = candidates.create();
        const capture = value => examples.capture(buffer, value.result, value.context, value.beforeKnowledge);
        assert.deepEqual(fixture.values.map(capture), fixture.expected);
        assert.equal(JSON.stringify(fixture), source);
        const original = buffer.read();
        assert.ok(fixture.values.map(capture).every(v => v === false));
        for (const entry of original) {
            const data = entry.captured;
            assert.equal(entry.kind, 'teaching'); assert.equal(entry.sourceId, data.sources.input.id);
            assert.equal(data.understanding.conditionStatus, 'unknown'); assert.equal(data.understanding.complete, false);
            assert.equal(data.understanding.subject, null); assert.equal(data.understanding.roles, undefined);
            assert.equal(data.sources.frame.roles.actualParticipation, false);
            assert.equal(data.sources.observation.status, data.sources.frame.demonstratedStatus);
            assert.equal(data.conditionBasis.id, 'tired'); assert.equal(data.proposalBasis.id, 'request');
            assert.deepEqual(data.pairing.candidates[0].understanding, data.understanding);
            assert.deepEqual(data.understanding.relationReferences || [],
                data.proposalBasis.source === 'experienced_relation' ? [data.proposalBasis] : []);
            assert.equal(data.conditionJudgment, undefined); assert.equal(data.sources.referencedExperience, undefined);
        }
        if (original.length) {
            buffer.read()[0].captured.sources.observation.status = 'changed';
            fixture.values[0].beforeKnowledge.meanings = [];
            fixture.values[0].result.input.raw = 'changed';
        }
        assert.deepEqual(buffer.read(), original);
    }
});
