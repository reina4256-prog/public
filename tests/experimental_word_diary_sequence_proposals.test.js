'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const candidates = require('../experimental_word_diary_candidates');
const proposals = require('../experimental_word_diary_sequence_proposals');
const fixtures = require('../scripts/experimental/diary_sequence_proposal_fixtures').fixtures();
for (const group of [...new Set(fixtures.map(f => f.group))]) test(`sequence proposal diary: ${group}`, () => {
    for (const fixture of fixtures.filter(f => f.group === group)) {
        const source = JSON.stringify(fixture), buffer = candidates.create();
        const capture = v => proposals.capture(buffer, v.result, v.context, v.beforeKnowledge);
        assert.deepEqual(fixture.values.map(capture), fixture.expected);
        assert.equal(JSON.stringify(fixture), source);
        const original = buffer.read();
        assert.ok(fixture.values.map(capture).every(v => v === false));
        for (const entry of original) {
            const data = entry.captured;
            assert.equal(entry.kind, 'proposal'); assert.equal(entry.sourceId, data.sources.input.id);
            assert.equal(data.understanding.complete, true); assert.equal(data.roles.actualParticipation, false);
            assert.deepEqual(data.understanding.relations, ['request', 'sequence']);
            assert.deepEqual(data.understanding.relationReferences || [], data.relationBasis.filter(r => r.source === 'experienced_relation'));
            assert.equal(data.basis.id, 'rest'); assert.equal(data.eventBasis.id, 'eat');
            for (const field of ['pairing', 'conditionJudgment', 'sequenceJudgment', 'completionReference', 'eventReference', 'relationAcquired'])
                assert.equal(data[field], undefined);
            assert.equal(data.sources.referencedExperience, undefined); assert.equal(data.sources.referenceLabel, undefined);
        }
        if (group === 'later-real-basis-originals-preserved') {
            assert.notDeepEqual(original[0].captured.basis, original[1].captured.basis);
            assert.deepEqual(original[0].captured.relationBasis, original[1].captured.relationBasis);
        }
        if (original.length) {
            buffer.read()[0].captured.roles.actualParticipation = true;
            fixture.values[0].beforeKnowledge.meanings = []; fixture.values[0].result.input.raw = 'changed';
        }
        assert.deepEqual(buffer.read(), original);
    }
});
