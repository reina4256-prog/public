'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const candidates = require('../experimental_word_diary_candidates');
const api = require('../experimental_word_diary_known_feeling_contrast_examples');
const fixtures = require('../scripts/experimental/diary_known_feeling_contrast_fixtures').fixtures();
for (const group of [...new Set(fixtures.map(f => f.group))]) test(`known feeling contrast teaching diary: ${group}`, () => {
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
            assert.equal(entry.occurrenceId, `known_feeling_contrast_example:${entry.sourceId}`);
            assert.equal(d.understanding.complete, false); assert.equal(d.understanding.subject, null);
            assert.equal(d.meaningKnownBefore, true); assert.equal(d.reportKnownBefore, true);
            assert.equal(d.timeKnownBefore, true); assert.equal(d.contrastKnownBefore, true);
            assert.equal(d.relationAcquired, false); assert.deepEqual(d.pairing.updated, []);
            assert.equal(d.contentUnderstandings.length, 2);
            for (const [index, u] of d.contentUnderstandings.entries()) {
                assert.equal(u.kind, 'report'); assert.equal(u.complete, true); assert.equal(u.subject, 'player');
                assert.equal(u.eventTime, index ? 'now' : 'yesterday'); assert.equal(u.testimony.verified, false);
                assert.equal(u.known.meaning, index ? 'happy' : 'sad');
                assert.deepEqual(u.relations, ['report', 'time', 'contrast']); assert.deepEqual(u.unresolved, []);
                assert.equal(d.sources.original.understandings[index].subject, 'player');
                assert.equal(d.sources.original.understandings[index].eventTime, index ? 'now' : 'yesterday');
                assert.equal(d.sources.original.understandings[index].testimony.verified, false);
                const original = d.sources.original.understandings[index];
                const wasKnown = original.feelingBasis.meanings.some(e => e.id === (index ? 'happy' : 'sad'));
                assert.deepEqual(original.known, wasKnown ? { meaning: index ? 'happy' : 'sad' } : {});
                assert.equal(original.complete, wasKnown);
                assert.equal('contrastConnection' in u, false);
            }
            const evidence = [...d.sources.priorTeachings, d.pairing.adopted]
                .filter(e => e.sourceId === d.sources.original.input.id && ['retain', 'difference', 'noncausal'].includes(e.frame.stage));
            assert.deepEqual(d.contrastTeaching.evidence, evidence.map(e => e.input.id));
            assert.equal(evidence.length, ['retain', 'difference', 'noncausal'].indexOf(stage) + 1);
            assert.deepEqual(d.contrastTeaching.connection, { kind: 'contrast', sourceId: d.sources.original.input.id,
                form: d.sources.original.input.raw.normalize('NFKC').trim().toLocaleLowerCase(),
                retainedClauses: [0, 1], difference: ['sad', 'happy'], replaces: false, causalClaim: false });
            assert.equal(d.sources.selection.original.input.id, d.pairing.adopted.sourceId);
            for (const field of ['ownFeeling', 'experience', 'cause', 'calendarDate']) assert.equal(field in d, false);
        }
        if (original.length) {
            const read = buffer.read(); read[0].captured.contentUnderstandings[0].subject = 'self';
            read[0].captured.contrastTeaching.connection.causalClaim = true;
            read[0].captured.contrastTeaching.evidence.reverse();
            fixture.values[0].result.input.raw = 'changed'; fixture.values[0].beforeFeelingLearning.events = [];
        }
        assert.deepEqual(buffer.read(), original);
    }
});
