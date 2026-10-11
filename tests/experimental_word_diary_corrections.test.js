'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const candidates = require('../experimental_word_diary_candidates');
const api = require('../experimental_word_diary_corrections');
const fixtures = require('../scripts/experimental/diary_actual_correction_fixtures').fixtures();
for (const group of [...new Set(fixtures.map(f => f.group))]) test(`actual correction diary: ${group}`, () => {
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
            assert.equal(data.understanding.complete, true);
            assert.deepEqual(data.understanding.relations, ['naming', 'correction']);
            assert.equal(data.correction.retraction, data.sources.original.inputId);
            assert.equal(data.correction.relationAcquired, false);
            assert.equal(data.sources.original.retractedBy, undefined);
            assert.equal(data.sources.original.corrects, undefined);
            if (data.correctionBasis[0].source === 'experienced_relation') assert.ok(data.sources.correctionLesson);
            else assert.equal(data.sources.correctionLesson, null);
        }
        if (original.length) {
            buffer.read()[0].captured.sources.original.basis = {};
            fixture.values[0].result.input.raw = 'changed'; fixture.values[0].beforeKnowledge.meanings = [];
        }
        assert.deepEqual(buffer.read(), original);
    }
});
