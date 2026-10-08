'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const candidates = require('../experimental_word_diary_candidates');
const examples = require('../experimental_word_diary_negation_examples');
const fixtures = require('../scripts/experimental/diary_negation_fixtures').fixtures();
for (const group of [...new Set(fixtures.map(f => f.group))]) test(`negation diary: ${group}`, () => {
    for (const fixture of fixtures.filter(f => f.group === group)) {
        const source = JSON.stringify(fixture), buffer = candidates.create();
        const capture = value => examples.capture(buffer, value.result, value.context, value.beforeKnowledge);
        assert.deepEqual(fixture.values.map(capture), fixture.expected);
        assert.equal(JSON.stringify(fixture), source);
        const original = buffer.read();
        assert.ok(fixture.values.map(capture).every(v => v === false));
        for (const entry of original) {
            const data = entry.captured;
            assert.equal(entry.kind, 'teaching'); assert.equal(entry.sourceId, data.sources.input.id);
            assert.equal(data.understanding.polarity, 'unknown'); assert.equal(data.understanding.subject, null);
            assert.equal(data.understanding.roles, undefined); assert.equal(data.understanding.reportSource, undefined);
            assert.equal(data.understanding.eventTime, 'unspecified'); assert.equal(data.understanding.complete, false);
            assert.equal(data.sources.frame.roles.verified, false);
            assert.equal(data.observationBasis.id, data.sources.activity.mode);
            assert.equal(data.reportBasis.id, 'report');
            assert.deepEqual(data.pairing.candidates[0].understanding, data.understanding);
            assert.equal(data.sources.frame.polarity, data.pairing.candidates[0].polarity);
            assert.deepEqual(data.understanding.relationReferences || [],
                data.reportBasis.source === 'experienced_relation' ? [data.reportBasis] : []);
        }
        if (original.length) {
            buffer.read()[0].captured.sources.frame.polarity = 'changed';
            fixture.values[0].beforeKnowledge.meanings = [];
            fixture.values[0].result.input.raw = 'changed';
        }
        assert.deepEqual(buffer.read(), original);
    }
});
