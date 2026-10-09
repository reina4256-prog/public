'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const candidates = require('../experimental_word_diary_candidates');
const api = require('../experimental_word_diary_known_sequence_examples');
const fixtures = require('../scripts/experimental/diary_known_sequence_fixtures').fixtures();
for (const group of [...new Set(fixtures.map(f => f.group))]) test(`known sequence diary: ${group}`, () => {
    for (const fixture of fixtures.filter(f => f.group === group)) {
        const source = JSON.stringify(fixture), buffer = candidates.create();
        const capture = v => api.capture(buffer, v.result, v.context, v.beforeKnowledge, v.beforeExperiences);
        assert.deepEqual(fixture.values.map(capture), fixture.expected, group);
        assert.equal(JSON.stringify(fixture), source);
        const original = buffer.read();
        assert.ok(fixture.values.map(capture).every(v => v === false));
        for (const entry of original) {
            const data = entry.captured;
            assert.equal(entry.kind, 'teaching'); assert.equal(entry.sourceId, data.sources.input.id);
            assert.equal(data.understanding.complete, true); assert.equal(data.roles.actualParticipation, false);
            assert.equal(data.pairing, undefined); assert.deepEqual(data.understanding.unresolved, []);
            assert.deepEqual(data.understanding.relations, ['request', 'sequence']);
            if (data.completionReference.status === 'source_matched') {
                assert.equal(data.sources.referenceLabel.understanding.complete, false);
                assert.equal(data.completionReference.eventReference.experienceId, data.sources.referencedExperience.id);
                assert.equal(data.completionReference.eventReference.inputId, data.sources.referenceLabel.inputId);
            } else assert.equal(data.completionReference.eventReference, null);
            if (data.sources.frame.phase === 'before') assert.equal(data.completionReference.status, 'not_applicable');
            if (['initial-after-unidentified', 'new-meal-no-borrowed-reference', 'no-original-unidentified', 'locale-scope'].includes(group)) {
                assert.equal(data.completionReference.status, 'unidentified');
                assert.equal(data.sources.referencedExperience, null); assert.equal(data.sources.referenceLabel, null);
            }
            if (group === 'later-real-basis-nonreplacement') {
                assert.notDeepEqual(data.basis, data.sources.referenceLabel.basis);
                assert.equal(data.sources.referenceLabel.understanding.roles, undefined);
                assert.deepEqual(data.sources.referenceLabel.understanding.unresolved, [{ type: 'relation', id: 'sequence' }]);
            }
        }
        if (original.length) {
            buffer.read()[0].captured.roles.actualParticipation = true;
            fixture.values[0].result.input.raw = 'changed'; fixture.values[0].beforeKnowledge.meanings = [];
        }
        assert.deepEqual(buffer.read(), original);
    }
});
