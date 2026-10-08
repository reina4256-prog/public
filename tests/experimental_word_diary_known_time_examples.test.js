'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const candidates = require('../experimental_word_diary_candidates');
const examples = require('../experimental_word_diary_known_time_examples');
const fixtures = require('../scripts/experimental/diary_known_time_fixtures').fixtures();
for (const group of [...new Set(fixtures.map(f => f.group))]) test(`known time diary: ${group}`, () => {
    for (const fixture of fixtures.filter(f => f.group === group)) {
        const source = JSON.stringify(fixture), buffer = candidates.create();
        const capture = value => examples.capture(buffer, value.result, value.context, value.beforeKnowledge, value.beforeExperiences);
        assert.deepEqual(fixture.values.map(capture), fixture.expected);
        assert.equal(JSON.stringify(fixture), source);
        const original = buffer.read();
        assert.ok(fixture.values.map(capture).every(value => value === false));
        for (const entry of original) {
            const data = entry.captured;
            assert.equal(entry.kind, 'teaching'); assert.equal(entry.sourceId, data.sources.input.id);
            assert.equal(data.understanding.complete, true); assert.equal(data.understanding.eventTime, data.sources.frame.time);
            assert.equal(data.understanding.reportSource, undefined); assert.equal(data.roles.verified, false);
            assert.equal(data.pairing, undefined);
            if (data.pastReference.status === 'source_matched') {
                const ref = data.pastReference.eventReference;
                assert.equal(data.sources.referencedExperience.id, ref.experienceId);
                assert.ok(ref.end <= data.sources.activity.start); assert.notEqual(ref.start, data.sources.activity.start);
                assert.notEqual(ref.inputId, entry.sourceId);
                assert.equal(data.sources.referenceLabel.understanding.eventTime, 'unspecified');
                assert.equal(data.sources.referenceLabel.understanding.roles, undefined);
            } else {
                assert.equal(data.pastReference.status, data.sources.frame.time === 'now' ? 'not_applicable' : 'unidentified');
                assert.equal(data.pastReference.eventReference, null); assert.equal(data.sources.referencedExperience, null);
                assert.equal(data.sources.referenceLabel, null); assert.equal(data.sources.referenceEvidence, null);
            }
        }
        if (original.length) {
            buffer.read()[0].captured.understanding.eventTime = 'changed';
            fixture.values[0].beforeKnowledge.meanings = []; fixture.values[0].beforeExperiences = [];
            fixture.values[0].result.input.raw = 'changed';
        }
        assert.deepEqual(buffer.read(), original);
    }
});
