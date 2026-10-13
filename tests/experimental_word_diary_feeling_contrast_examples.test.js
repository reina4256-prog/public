'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const candidates = require('../experimental_word_diary_candidates');
const api = require('../experimental_word_diary_feeling_contrast_examples');
const fixtures = require('../scripts/experimental/diary_feeling_contrast_fixtures').fixtures();
for (const group of [...new Set(fixtures.map(f => f.group))]) test(`feeling contrast teaching diary: ${group}`, () => {
    for (const fixture of fixtures.filter(f => f.group === group)) {
        const source = JSON.stringify(fixture), buffer = candidates.create();
        const capture = v => api.capture(buffer, v.result, v.context, v.beforeKnowledge, v.beforeFeelingLearning, v.beforeTurns, v.beforeRecords);
        assert.deepEqual(fixture.values.map(capture), fixture.expected);
        assert.equal(JSON.stringify(fixture), source);
        const original = buffer.read();
        assert.ok(fixture.values.map(capture).every(v => v === false));
        for (const entry of original) {
            const d = entry.captured, stage = d.sources.frame.stage;
            assert.equal(entry.kind, 'teaching'); assert.equal(entry.sourceId, d.sources.input.id);
            assert.ok(['retain', 'difference', 'noncausal'].includes(stage));
            assert.equal(d.understanding.complete, false); assert.equal(d.understanding.subject, null);
            assert.equal(d.meaningKnownBefore, true); assert.equal(d.reportKnownBefore, true);
            assert.equal(d.timeKnownBefore, true); assert.equal(d.contrastKnownBefore, false);
            assert.equal(d.contentUnderstandings.length, 2);
            for (const [index, u] of d.contentUnderstandings.entries()) {
                assert.equal(u.kind, 'partial'); assert.equal(u.complete, false); assert.equal(u.subject, 'player');
                assert.equal(u.eventTime, index ? 'now' : 'yesterday'); assert.equal(u.testimony.verified, false);
                assert.equal(u.known.meaning, index ? 'happy' : 'sad');
                assert.deepEqual(u.relations, ['report', 'time']);
                assert.deepEqual(u.unresolved, [{ type: 'relation', id: 'contrast' }]);
                assert.equal(d.sources.original.understandings[index].subject, null);
                assert.equal(d.sources.original.understandings[index].eventTime, 'unspecified');
            }
            assert.equal(d.relationAcquired, stage === 'noncausal');
            assert.equal(d.pairing.updated.length, stage === 'noncausal' ? 2 : 0);
            for (const [index, e] of d.pairing.updated.entries()) {
                assert.equal(e.type, 'relation'); assert.equal(e.id, 'contrast'); assert.equal(e.source, 'feeling_teaching');
                assert.equal(e.scope.meaning, index ? 'happy' : 'sad'); assert.equal(e.scope.time, index ? 'now' : 'yesterday');
                assert.equal(e.scope.speaker, 'player'); assert.equal(e.evidence.length, 3); assert.equal(e.evidence[2], entry.sourceId);
                assert.deepEqual(e.scope.connection.retainedClauses, [0, 1]);
                assert.deepEqual(e.scope.connection.difference, ['sad', 'happy']);
                assert.equal(e.scope.connection.replaces, false); assert.equal(e.scope.connection.causalClaim, false);
                assert.equal(e.scope.connection.sourceId, d.sources.original.input.id);
                assert.equal(e.scope.connection.form, d.sources.original.input.raw.normalize('NFKC').trim().toLocaleLowerCase());
            }
            assert.equal(d.sources.selection.original.input.id, d.pairing.adopted.sourceId);
            assert.equal('ownFeeling' in d, false); assert.equal('experience' in d, false);
            assert.equal('cause' in d, false); assert.equal('calendarDate' in d, false);
        }
        if (original.length) {
            buffer.read()[0].captured.contentUnderstandings[0].subject = 'self';
            fixture.values[0].result.input.raw = 'changed'; fixture.values[0].beforeFeelingLearning.events = [];
        }
        assert.deepEqual(buffer.read(), original);
    }
});
