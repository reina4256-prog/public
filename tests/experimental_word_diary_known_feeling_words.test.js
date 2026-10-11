'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const candidates = require('../experimental_word_diary_candidates');
const api = require('../experimental_word_diary_known_feeling_words');
const fixtures = require('../scripts/experimental/diary_known_feeling_word_fixtures').fixtures();
for (const group of [...new Set(fixtures.map(f => f.group))]) test(`known feeling word diary: ${group}`, () => {
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
            assert.equal(d.meaningKnownBefore, true); assert.equal(d.understanding.complete, false);
            assert.equal(d.contentUnderstanding.known.meaning, d.sources.frame.stage);
            assert.deepEqual(d.pairing.updated, []);
            assert.deepEqual(d.basis.meanings.map(e => e.source), ['initial', 'initial']);
            assert.equal(d.sources.original.understandings[d.sources.clauseIndex].known.meaning, d.sources.frame.stage);
            assert.equal(d.contentUnderstanding.complete, !d.contentUnderstanding.unresolved.length);
            assert.equal(d.sources.selection.original.input.id, d.pairing.adopted.sourceId);
            assert.equal('ownFeeling' in d, false); assert.equal('experience' in d, false);
        }
        if (original.length) {
            buffer.read()[0].captured.contentUnderstanding.known.meaning = 'changed';
            fixture.values[0].result.input.raw = 'changed'; fixture.values[0].beforeFeelingLearning.events = [];
        }
        assert.deepEqual(buffer.read(), original);
    }
});
