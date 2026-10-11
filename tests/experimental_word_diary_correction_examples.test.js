'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const candidates = require('../experimental_word_diary_candidates');
const api = require('../experimental_word_diary_correction_examples');
const fixtures = require('../scripts/experimental/diary_correction_fixtures').fixtures();
for (const group of [...new Set(fixtures.map(f => f.group))]) test(`correction diary: ${group}`, () => {
    for (const fixture of fixtures.filter(f => f.group === group)) {
        const source = JSON.stringify(fixture), buffer = candidates.create();
        const capture = v => api.capture(buffer, v.result, v.context, v.beforeKnowledge, v.beforeExperiences, v.beforeLessons, v.beforeRecords);
        assert.deepEqual(fixture.values.map(capture), fixture.expected);
        assert.equal(JSON.stringify(fixture), source);
        const original = buffer.read();
        assert.ok(fixture.values.map(capture).every(v => v === false));
        for (const entry of original) {
            const data = entry.captured;
            assert.equal(entry.kind, 'teaching'); assert.equal(entry.sourceId, data.sources.input.id);
            assert.equal(data.understanding.complete, true); assert.deepEqual(data.understanding.relations, ['naming']);
            assert.equal(data.correctionKnownBefore, false); assert.equal(data.sources.original.retractedBy, undefined);
            if (data.sources.frame.phase === 'source') {
                assert.equal(data.pairing.relationAcquired, false); assert.equal(data.pairing.candidates[0].replacement, undefined);
            }
            else { assert.equal(data.pairing.relationAcquired, true); assert.ok(data.sources.sourceTeaching); }
        }
        if (original.length) {
            buffer.read()[0].captured.understanding.complete = false;
            fixture.values[0].result.input.raw = 'changed'; fixture.values[0].beforeKnowledge.meanings = [];
        }
        assert.deepEqual(buffer.read(), original);
    }
});
