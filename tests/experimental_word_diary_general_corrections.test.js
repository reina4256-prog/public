'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const candidates = require('../experimental_word_diary_candidates');
const api = require('../experimental_word_diary_general_corrections');
const fixtures = require('../scripts/experimental/diary_general_correction_fixtures').fixtures();
for (const group of [...new Set(fixtures.map(f => f.group))]) test(`general correction diary: ${group}`, () => {
    for (const fixture of fixtures.filter(f => f.group === group)) {
        const source = JSON.stringify(fixture), buffer = candidates.create();
        const capture = v => api.capture(buffer, v.result, v.context, v.beforeKnowledge, v.beforeExperiences, v.beforeRecords);
        assert.deepEqual(fixture.values.map(capture), fixture.expected);
        assert.equal(JSON.stringify(fixture), source);
        const original = buffer.read();
        assert.ok(fixture.values.map(capture).every(v => v === false));
        for (const entry of original) {
            const d = entry.captured;
            assert.equal(entry.kind, 'teaching'); assert.equal(entry.sourceId, d.sources.input.id);
            assert.equal(d.understanding.complete, true);
            assert.deepEqual(d.namingBasis, [{ id: 'naming', source: 'initial' }]);
            assert.deepEqual(d.correctionBasis, [{ id: 'correction', source: 'initial' }]);
            assert.equal(d.correction.retraction, d.sources.original.inputId);
            assert.equal(d.sources.original.corrects, undefined); assert.equal(d.sources.original.retractedBy, undefined);
            for (const k of ['ownFeeling', 'experience', 'calendarDate', 'cause', 'relationAcquired']) assert.equal(k in d, false);
        }
        if (original.length) {
            buffer.read()[0].captured.sources.original.basis = {};
            fixture.values[0].result.input.raw = 'changed'; fixture.values[0].beforeKnowledge.meanings = [];
        }
        assert.deepEqual(buffer.read(), original);
    }
});
