'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const candidates = require('../experimental_word_diary_candidates');
const api = require('../experimental_word_diary_feeling_contrast_reports');
const single = require('../experimental_word_diary_feeling_reports');
const { fixtures } = require('../scripts/experimental/diary_contrast_feeling_report_fixtures');
const { acquire } = require('../scripts/experimental/diary_single_feeling_report_fixtures');
const { setup, hear, texts } = require('../scripts/experimental/diary_feeling_word_fixtures');
const copy = v => JSON.parse(JSON.stringify(v));
const capture = (buffer, v) => api.capture(buffer, v.result, v.context, v.beforeKnowledge, v.beforeFeelingLearning, v.beforeTurns, v.beforeRecords);
const all = fixtures();
for (const group of [...new Set(all.map(f => f.group))]) test('ordinary two-clause feeling report: ' + group, () => {
    for (const fixture of all.filter(f => f.group === group)) {
        const supplied = JSON.stringify(fixture), buffer = candidates.create();
        assert.deepEqual(fixture.values.map(v => capture(buffer, v)), fixture.expected);
        assert.equal(JSON.stringify(fixture), supplied);
        const original = buffer.read();
        assert.ok(fixture.values.map(v => capture(buffer, v)).every(v => v === false));
        for (const entry of original) {
            const d = entry.captured;
            assert.equal(entry.kind, 'report'); assert.equal(entry.sourceId, d.sources.input.id);
            assert.equal(entry.occurrenceId, `feeling_contrast_report:${entry.sourceId}`);
            assert.equal(d.understandings.length, 2); assert.equal(d.contrastKnownBefore, true);
            assert.deepEqual(d.reportSources, d.understandings.map(u => u.reportSource));
            assert.deepEqual(d.testimonies, d.understandings.map(u => u.testimony));
            for (const [index, u] of d.understandings.entries()) {
                assert.equal(u.complete, true); assert.equal(u.kind, 'report'); assert.equal(u.subject, 'player');
                assert.equal(u.eventTime, index ? 'now' : 'yesterday'); assert.equal(u.testimony.verified, false);
                assert.deepEqual(u.relations, ['report', 'time', 'contrast']);
                assert.deepEqual(u.clauseSource, { input: d.sources.input, index, frame: d.sources.frames[index] });
                assert.deepEqual(d.basis, u.feelingBasis);
                if (d.basis.relations.some(e => e.id === 'contrast')) assert.equal(u.contrastConnection, undefined);
                else {
                    const ref = u.feelingReferences.find(e => e.id === 'contrast');
                    assert.deepEqual(u.contrastConnection, ref.scope.connection);
                    assert.notEqual(u.contrastConnection.sourceId, entry.sourceId);
                    assert.equal(u.contrastConnection.replaces, false); assert.equal(u.contrastConnection.causalClaim, false);
                }
            }
            for (const field of ['ownFeeling', 'experience', 'cause', 'calendarDate', 'pairing', 'relationAcquired']) assert.equal(field in d, false);
        }
        if (original.length) {
            buffer.read()[0].captured.understandings[0].testimony.verified = true;
            fixture.values[0].result.input.raw = 'changed'; fixture.values[0].beforeFeelingLearning.events = [];
        }
        assert.deepEqual(buffer.read(), original);
    }
});
test('two clauses preserve learning and bodily experience; new input repeats, ag never receives a split', () => {
    for (const v of [setup({ foundation: true, life: true, speech: 'gesture' }), acquire(undefined, 'ja', true)]) {
        const world = copy(v.world), knowledge = copy(v.state.knowledge), learned = copy(v.state.feelingLearning || null);
        const first = hear(v, texts().full), second = hear(v, texts().full), buffer = candidates.create();
        assert.equal(capture(buffer, first), true); assert.equal(capture(buffer, second), true);
        assert.equal(buffer.read().length, 2);
        assert.equal(single.capture(candidates.create(), first.result, first.context, first.beforeKnowledge,
            first.beforeFeelingLearning, first.beforeTurns, first.beforeRecords), false);
        for (const field of ['mode', 'destination', 'hunger', 'fatigue', 'experiences', 'elapsed', 'activityStart']) assert.deepEqual(v.world[field], world[field]);
        assert.deepEqual(v.state.knowledge, knowledge); assert.deepEqual(v.state.feelingLearning || null, learned);
    }
});
