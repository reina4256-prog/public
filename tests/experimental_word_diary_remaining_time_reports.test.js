'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const candidates = require('../experimental_word_diary_candidates');
const reports = require('../experimental_word_diary_remaining_time_reports');
const { fixtures, forms, raw } = require('../scripts/experimental/diary_remaining_time_report_fixtures');
const { setup, hear } = require('../scripts/experimental/diary_negation_fixtures');
const copy = value => JSON.parse(JSON.stringify(value));
const capture = (buffer, v) => reports.capture(buffer, v.result, v.context, v.beforeKnowledge);
const all = fixtures();
for (const group of [...new Set(all.map(f => f.group))]) test('remaining time report: ' + group, () => {
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
            assert.equal(entry.occurrenceId, 'remaining_time_report:' + entry.sourceId);
            assert.equal(data.understanding.complete, true);
            assert.equal(data.understanding.polarity, data.sources.frame.polarity);
            assert.equal(data.understanding.eventTime, data.sources.frame.time);
            assert.equal(data.roles.contentSubject, data.sources.frame.subject);
            assert.equal(data.roles.verified, false); assert.equal(data.roles.status, 'reported');
            assert.deepEqual(data.reportSource, data.understanding.reportSource);
            assert.deepEqual(data.understanding.relationReferences || [], data.relationBasis.filter(r => r.source === 'experienced_relation'));
            for (const field of ['eventReference', 'pastReference', 'observationBasis', 'referencedExperience']) assert.equal(data[field], undefined);
        }
    }
});
test('remaining time testimony never changes experience or delegates into j/d/g', () => {
    for (const time of ['now', 'past']) for (const form of forms) {
        const value = setup({ foundation: true }), world = copy(value.world), knowledge = copy(value.state.knowledge);
        const v = hear(value, raw(form, time)); assert.equal(capture(candidates.create(), v), true);
        for (const field of ['mode', 'destination', 'hunger', 'fatigue', 'experiences']) assert.deepEqual(value.world[field], world[field]);
        assert.deepEqual(value.state.knowledge, knowledge); assert.equal((value.state.experiences || []).length, 0);
        assert.equal(value.state.records.at(-1).source, 'speaker_report');
        for (const module of ['reports', 'negation_reports', 'time_reports'])
            assert.equal(require('../experimental_word_diary_' + module).capture(candidates.create(), v.result, v.context, v.beforeKnowledge), false);
    }
});
test('new input repetition remains distinct and original snapshots survive copy editing', () => {
    const value = setup({ foundation: true }), buffer = candidates.create();
    const first = hear(value, raw('playerNegative', 'past')), second = hear(value, raw('playerNegative', 'past'));
    assert.equal(capture(buffer, first), true); assert.equal(capture(buffer, second), true);
    const original = buffer.read(); assert.notEqual(original[0].sourceId, original[1].sourceId);
    first.result.input.raw = 'changed'; first.beforeKnowledge.relations = []; value.state.knowledge.relations = [];
    buffer.read()[0].captured.roles.verified = true;
    assert.deepEqual(buffer.read(), original); assert.equal(capture(buffer, second), false);
});
