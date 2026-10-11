'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const candidates = require('../experimental_word_diary_candidates');
const api = require('../experimental_word_diary_feeling_report_examples');
const fixtures = require('../scripts/experimental/diary_feeling_report_fixtures').fixtures();
for (const group of [...new Set(fixtures.map(f => f.group))]) test(`feeling report teaching diary: ${group}`, () => {
    for (const fixture of fixtures.filter(f => f.group === group)) {
        const source = JSON.stringify(fixture), buffer = candidates.create();
        const capture = v => api.capture(buffer, v.result, v.context, v.beforeKnowledge, v.beforeFeelingLearning, v.beforeTurns, v.beforeRecords);
        assert.deepEqual(fixture.values.map(capture), fixture.expected);
        assert.equal(JSON.stringify(fixture), source);
        const original = buffer.read();
        assert.ok(fixture.values.map(capture).every(v => v === false));
        for (const entry of original) {
            const d = entry.captured;
            assert.equal(entry.kind, 'teaching'); assert.equal(entry.sourceId, d.sources.input.id);
            assert.equal(d.sources.frame.stage, 'report');
            assert.equal(d.understanding.complete, false); assert.equal(d.meaningKnownBefore, true);
            assert.equal(d.reportKnownBefore, false); assert.equal(d.contentUnderstanding.subject, null);
            assert.equal(d.contentUnderstanding.eventTime, 'unspecified');
            assert.equal(d.contentUnderstanding.known.meaning, d.sources.original.frames[d.sources.clauseIndex].meaning);
            assert.ok(d.contentUnderstanding.unresolved.some(e => e.type === 'relation' && e.id === 'report'));
            assert.ok(d.contentUnderstanding.unresolved.some(e => e.type === 'relation' && e.id === 'time'));
            assert.ok(d.contentUnderstanding.unresolved.some(e => e.type === 'relation' && e.id === 'contrast'));
            assert.equal(d.sources.original.understandings[0].subject, null);
            assert.equal(d.sources.original.understandings[1].subject, null);
            assert.equal(d.relationAcquired, d.pairing.updated.length === 2);
            assert.ok([0, 2].includes(d.pairing.updated.length));
            for (const e of d.pairing.updated) {
                assert.equal(e.type, 'relation'); assert.equal(e.id, 'report');
                assert.equal(e.scope.speaker, 'player'); assert.equal(e.evidence.length, 2);
                assert.equal(e.evidence[1], entry.sourceId);
            }
            assert.equal(d.sources.selection.original.input.id, d.pairing.adopted.sourceId);
            assert.equal('ownFeeling' in d, false); assert.equal('experience' in d, false);
        }
        if (original.length) {
            buffer.read()[0].captured.contentUnderstanding.subject = 'player';
            fixture.values[0].result.input.raw = 'changed'; fixture.values[0].beforeFeelingLearning.events = [];
        }
        assert.deepEqual(buffer.read(), original);
    }
});
