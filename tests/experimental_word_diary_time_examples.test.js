'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const candidates = require('../experimental_word_diary_candidates');
const examples = require('../experimental_word_diary_time_examples');
const fixtures = require('../scripts/experimental/diary_time_fixtures').fixtures();
for (const group of [...new Set(fixtures.map(f => f.group))]) test(`time diary: ${group}`, () => {
    for (const fixture of fixtures.filter(f => f.group === group)) {
        const source = JSON.stringify(fixture), buffer = candidates.create();
        const capture = value => examples.capture(buffer, value.result, value.context, value.beforeKnowledge, value.beforeExperiences);
        assert.deepEqual(fixture.values.map(capture), fixture.expected);
        assert.equal(JSON.stringify(fixture), source);
        const original = buffer.read();
        assert.ok(fixture.values.map(capture).every(value => value === false));
        for (const entry of original) {
            const data = entry.captured, label = data.pairing.candidates[0];
            assert.equal(entry.kind, 'teaching'); assert.equal(entry.sourceId, data.sources.input.id);
            assert.equal(data.understanding.complete, false); assert.equal(data.understanding.eventTime, 'unspecified');
            assert.equal(data.understanding.subject, null); assert.equal(data.understanding.roles, undefined);
            assert.equal(data.understanding.reportSource, undefined); assert.equal(data.sources.frame.roles.verified, false);
            assert.deepEqual(label.understanding, data.understanding);
            if (data.sources.frame.time === 'past') {
                assert.equal(data.sources.referencedExperience.id, label.eventReference.experienceId);
                assert.ok(label.eventReference.end <= data.sources.activity.start);
                assert.notEqual(label.eventReference.inputId, entry.sourceId);
            } else assert.equal(data.sources.referencedExperience, null);
        }
        if (original.length) {
            buffer.read()[0].captured.understanding.eventTime = 'changed';
            fixture.values[0].beforeKnowledge.meanings = [];
            fixture.values[0].beforeExperiences = [];
            fixture.values[0].result.input.raw = 'changed';
        }
        assert.deepEqual(buffer.read(), original);
    }
});
