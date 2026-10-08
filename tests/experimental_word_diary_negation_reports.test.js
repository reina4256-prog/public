'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const candidates = require('../experimental_word_diary_candidates');
const reports = require('../experimental_word_diary_negation_reports');
const positiveReports = require('../experimental_word_diary_reports');
const knownExamples = require('../experimental_word_diary_known_negation_examples');
const unknownExamples = require('../experimental_word_diary_negation_examples');
const { fixtures, acquire, raw } = require('../scripts/experimental/diary_negation_report_fixtures');
const { setup, hear } = require('../scripts/experimental/diary_negation_fixtures');
const copy = value => JSON.parse(JSON.stringify(value));
const capture = (buffer, v) => reports.capture(buffer, v.result, v.context, v.beforeKnowledge);
const all = fixtures();
for (const group of [...new Set(all.map(f => f.group))]) test('ordinary negative report boundary: ' + group, () => {
    for (const fixture of all.filter(f => f.group === group)) {
        const buffer = candidates.create(), supplied = JSON.stringify(fixture);
        assert.deepEqual(fixture.values.map(v => capture(buffer, v)), fixture.expected);
        assert.equal(JSON.stringify(fixture), supplied);
        const original = buffer.read();
        assert.ok(fixture.values.map(v => capture(buffer, v)).every(v => v === false));
        assert.deepEqual(buffer.read(), original);
        for (const entry of original) {
            const data = entry.captured;
            assert.equal(entry.kind, 'report'); assert.equal(entry.sourceId, data.sources.input.id);
            assert.equal(data.understanding.complete, true); assert.equal(data.understanding.polarity, 'negative');
            assert.equal(data.understanding.eventTime, 'unspecified'); assert.equal(data.roles.verified, false);
            assert.equal(data.roles.status, 'reported'); assert.equal(data.roles.contentSubject, 'self');
            assert.deepEqual(data.reportSource, data.understanding.reportSource);
            assert.deepEqual(data.understanding.relationReferences || [], data.relationBasis.filter(r => r.source === 'experienced_relation'));
            assert.equal(data.observationBasis, undefined);
        }
    }
});
test('heard negation never creates an activity, verification or child speech and is separate from teaching', () => {
    const value = setup({ foundation: true }), before = copy(value.world), knowledge = copy(value.state.knowledge);
    const v = hear(value, raw()), buffer = candidates.create();
    assert.equal(capture(buffer, v), true);
    for (const field of ['mode', 'destination', 'hunger', 'fatigue', 'experiences'])
        assert.deepEqual(value.world[field], before[field]);
    assert.deepEqual(value.state.knowledge, knowledge); assert.equal((value.state.experiences || []).length, 0);
    assert.equal(value.state.records.at(-1).source, 'speaker_report');
    assert.equal(value.state.context.turns.at(-1).answer, undefined);
    for (const other of [positiveReports, knownExamples, unknownExamples])
        assert.equal(other.capture(candidates.create(), v.result, v.context, v.beforeKnowledge), false);
});
test('new input identity and copy isolation preserve past hearing after learning and source edits', () => {
    const value = acquire(), buffer = candidates.create(), first = hear(value, raw()), second = hear(value, raw());
    assert.equal(capture(buffer, first), true); assert.equal(capture(buffer, second), true);
    const original = buffer.read(); assert.notEqual(original[0].sourceId, original[1].sourceId);
    first.result.input.raw = 'changed'; first.beforeKnowledge.relations = [];
    buffer.read()[0].captured.roles.verified = true;
    assert.deepEqual(buffer.read(), original);
    assert.equal(capture(buffer, second), false);
});
