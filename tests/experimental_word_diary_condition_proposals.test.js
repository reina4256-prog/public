'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const candidates = require('../experimental_word_diary_candidates');
const proposals = require('../experimental_word_diary_condition_proposals');
const fixtures = require('../scripts/experimental/diary_condition_proposal_fixtures').fixtures();
for (const group of [...new Set(fixtures.map(f => f.group))]) test(`condition proposal diary: ${group}`, () => {
    for (const fixture of fixtures.filter(f => f.group === group)) {
        const source = JSON.stringify(fixture), buffer = candidates.create();
        const capture = value => proposals.capture(buffer, value.result, value.context, value.beforeKnowledge);
        assert.deepEqual(fixture.values.map(capture), fixture.expected);
        assert.equal(JSON.stringify(fixture), source);
        const original = buffer.read();
        assert.ok(fixture.values.map(capture).every(v => v === false));
        for (const entry of original) {
            const data = entry.captured;
            assert.equal(entry.kind, 'proposal'); assert.equal(entry.sourceId, data.sources.input.id);
            assert.equal(data.understanding.conditionStatus, 'unknown'); assert.equal(data.understanding.complete, true);
            assert.equal(data.roles.actualParticipation, false);
            assert.deepEqual(data.conditionJudgment.observation, data.sources.observation);
            assert.equal(data.conditionJudgment.status, data.sources.observation?.status || 'unknown');
            assert.equal(data.basis.id, 'rest'); assert.equal(data.conditionBasis.id, 'tired');
            assert.deepEqual(data.understanding.relationReferences || [], data.relationBasis.filter(r => r.source === 'experienced_relation'));
            assert.equal(data.pairing, undefined); assert.equal(data.sources.referencedExperience, undefined);
        }
        if (original.length) {
            buffer.read()[0].captured.conditionJudgment.status = 'changed';
            fixture.values[0].beforeKnowledge.meanings = []; fixture.values[0].result.input.raw = 'changed';
        }
        assert.deepEqual(buffer.read(), original);
    }
});
