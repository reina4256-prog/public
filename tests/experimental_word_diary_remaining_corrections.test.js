'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const candidates = require('../experimental_word_diary_candidates');
const api = require('../experimental_word_diary_remaining_corrections');
const fixtures = require('../scripts/experimental/diary_remaining_correction_fixtures').fixtures();
for (const group of [...new Set(fixtures.map(f => f.group))]) test(`remaining correction diary: ${group}`, () => {
    for (const fixture of fixtures.filter(f => f.group === group)) {
        const source = JSON.stringify(fixture), buffer = candidates.create();
        const capture = v => api.capture(buffer, v.result, v.context, v.beforeKnowledge,
            v.beforeExperiences, v.beforeRecords, v.beforeReceipts);
        assert.deepEqual(fixture.values.map(capture), fixture.expected, fixture.values[0].result.input.raw);
        assert.equal(JSON.stringify(fixture), source);
        const original = buffer.read();
        assert.ok(fixture.values.map(capture).every(v => v === false));
        for (const entry of original) {
            const d = entry.captured;
            assert.equal(entry.kind, 'teaching'); assert.equal(entry.sourceId, d.sources.input.id);
            assert.equal(d.understanding.complete, true); assert.equal(d.sources.chain.at(-1).retractedBy, entry.sourceId);
            assert.equal(d.correction.retraction, d.sources.originalRecord.id);
            assert.deepEqual(d.namingBasis, [{ id: 'naming', source: 'initial' }]);
            assert.deepEqual(d.correctionBasis, [{ id: 'correction', source: 'initial' }]);
            for (const field of ['ownFeeling', 'experience', 'cause', 'calendarDate', 'relationAcquired']) assert.equal(field in d, false);
        }
        if (original.length) {
            buffer.read()[0].captured.sources.chain = [];
            fixture.values[0].beforeReceipts = []; fixture.values[0].result.input.raw = 'changed';
        }
        assert.deepEqual(buffer.read(), original);
    }
});
