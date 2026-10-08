'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const candidates = require('../experimental_word_diary_candidates');
const reports = require('../experimental_word_diary_time_reports');
const { fixtures, acquire, raw } = require('../scripts/experimental/diary_time_report_fixtures');
const { setup, hear } = require('../scripts/experimental/diary_negation_fixtures');
const copy = value => JSON.parse(JSON.stringify(value));
const capture = (buffer, v) => reports.capture(buffer, v.result, v.context, v.beforeKnowledge);
const all = fixtures();
for (const group of [...new Set(all.map(f => f.group))]) test('ordinary time report boundary: ' + group, () => {
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
            assert.equal(data.understanding.complete, true); assert.equal(data.understanding.polarity, 'positive');
            assert.equal(data.understanding.eventTime, data.sources.frame.time); assert.equal(data.roles.verified, false);
            assert.equal(data.roles.status, 'reported'); assert.equal(data.roles.contentSubject, 'self');
            assert.deepEqual(data.reportSource, data.understanding.reportSource);
            assert.deepEqual(data.understanding.relationReferences || [], data.relationBasis.filter(r => r.source === 'experienced_relation'));
            for (const field of ['eventReference', 'pastReference', 'observationBasis']) assert.equal(data[field], undefined);
            assert.equal(data.sources.referencedExperience, undefined);
        }
    }
});
test('ordinary relative time never creates rest verification, child speech or a teaching event', () => {
    for (const time of ['now', 'past']) {
        const value = setup({ foundation: true }), before = copy(value.world), knowledge = copy(value.state.knowledge);
        const v = hear(value, raw(time)); assert.equal(capture(candidates.create(), v), true);
        for (const field of ['mode', 'destination', 'hunger', 'fatigue', 'experiences']) assert.deepEqual(value.world[field], before[field]);
        assert.deepEqual(value.state.knowledge, knowledge); assert.equal((value.state.experiences || []).length, 0);
        assert.equal(value.state.records.at(-1).source, 'speaker_report');
        assert.equal(value.state.context.turns.at(-1).answer, undefined);
        for (const module of ['reports', 'negation_reports', 'time_examples', 'known_time_examples']) {
            const other = require('../experimental_word_diary_' + module);
            assert.equal(other.capture(candidates.create(), v.result, v.context, v.beforeKnowledge, []), false);
        }
    }
});
test('new input identity and copied learning roots preserve hearing independently of original teaching rest', () => {
    const value = acquire(), buffer = candidates.create(), first = hear(value, raw('past')), second = hear(value, raw('past'));
    assert.equal(capture(buffer, first), true); assert.equal(capture(buffer, second), true);
    const original = buffer.read(); assert.notEqual(original[0].sourceId, original[1].sourceId);
    const originalNow = value.state.experiences.find(e => e.relationLabels?.some(l => l.eventTime === 'now'));
    assert.ok(originalNow);
    const learnedPast = original[0].captured.relationBasis.find(r => r.id === 'time');
    assert.ok(learnedPast.evidence.includes(originalNow.relationLabels.find(l => l.eventTime === 'now').inputId));
    assert.deepEqual(learnedPast, value.state.knowledge.relations.find(r => r.id === 'time' && r.scope.eventTime === 'past'));
    assert.equal(original[0].captured.understanding.eventReference, undefined);
    first.result.input.raw = 'changed'; first.beforeKnowledge.relations = [];
    originalNow.relationLabels[0].utterance = 'changed'; value.state.knowledge.relations = [];
    buffer.read()[0].captured.roles.verified = true;
    assert.deepEqual(buffer.read(), original); assert.equal(capture(buffer, second), false);
});
