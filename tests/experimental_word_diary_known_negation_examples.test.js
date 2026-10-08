'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const candidates = require('../experimental_word_diary_candidates');
const examples = require('../experimental_word_diary_known_negation_examples');
const fixtures = require('../scripts/experimental/diary_known_negation_fixtures').fixtures();
for (const group of [...new Set(fixtures.map(f => f.group))]) test(`known negation diary: ${group}`, () => {
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
            assert.equal(data.understanding.complete, true);
            assert.equal(data.understanding.polarity, data.sources.frame.polarity);
            assert.equal(data.understanding.subject, 'self'); assert.equal(data.roles.verified, false);
            assert.deepEqual(data.roles, data.understanding.roles);
            assert.equal(data.understanding.reportSource, undefined);
            assert.equal(data.understanding.eventTime, 'unspecified');
            assert.equal(data.observationBasis.id, data.sources.activity.mode);
            assert.deepEqual(data.understanding.relationReferences || [], data.relationBasis.filter(r => r.source === 'experienced_relation'));
        }
        if (original.length) {
            buffer.read()[0].captured.roles.verified = true;
            fixture.values[0].beforeKnowledge.meanings = [];
            fixture.values[0].result.input.raw = 'changed';
        }
        assert.deepEqual(buffer.read(), original);
    }
});
