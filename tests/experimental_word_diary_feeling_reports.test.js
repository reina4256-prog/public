'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const candidates = require('../experimental_word_diary_candidates');
const api = require('../experimental_word_diary_feeling_reports');
const { fixtures, acquire } = require('../scripts/experimental/diary_single_feeling_report_fixtures');
const { setup, hear } = require('../scripts/experimental/diary_feeling_word_fixtures');
const copy = v => JSON.parse(JSON.stringify(v));
const capture = (buffer, v) => api.capture(buffer, v.result, v.context, v.beforeKnowledge, v.beforeFeelingLearning, v.beforeTurns, v.beforeRecords);
const all = fixtures();
for (const group of [...new Set(all.map(f => f.group))]) test('ordinary single feeling report: ' + group, () => {
    for (const fixture of all.filter(f => f.group === group)) {
        const supplied = JSON.stringify(fixture), buffer = candidates.create();
        assert.deepEqual(fixture.values.map(v => capture(buffer, v)), fixture.expected);
        assert.equal(JSON.stringify(fixture), supplied);
        const original = buffer.read();
        assert.ok(fixture.values.map(v => capture(buffer, v)).every(v => v === false));
        for (const entry of original) {
            const d = entry.captured, u = d.understanding;
            assert.equal(entry.kind, 'report'); assert.equal(entry.sourceId, d.sources.input.id);
            assert.equal(entry.occurrenceId, `feeling_report:${entry.sourceId}`);
            assert.equal(u.complete, true); assert.equal(u.kind, 'report'); assert.equal(u.subject, 'player');
            assert.equal(u.eventTime, d.sources.frame.time); assert.equal(u.testimony.verified, false);
            assert.deepEqual(u.relations, ['report', 'time']); assert.equal(u.contrastConnection, undefined);
            assert.ok((u.feelingReferences || []).every(e => e.id !== 'contrast'));
            assert.deepEqual(d.reportSource, u.reportSource); assert.deepEqual(d.testimony, u.testimony);
            assert.deepEqual(d.basis, u.feelingBasis);
            for (const field of ['ownFeeling', 'experience', 'cause', 'calendarDate', 'pairing', 'relationAcquired']) assert.equal(field in d, false);
        }
        if (original.length) {
            buffer.read()[0].captured.testimony.verified = true;
            fixture.values[0].result.input.raw = 'changed'; fixture.values[0].beforeFeelingLearning.events = [];
        }
        assert.deepEqual(buffer.read(), original);
    }
});
test('single reporting never learns or changes bodily experience and speech settings do not gate understanding', () => {
    for (const v of [setup({ foundation: true, life: true, speech: 'gesture' }), acquire()]) {
        const world = copy(v.world), knowledge = copy(v.state.knowledge), learned = copy(v.state.feelingLearning || null);
        const first = hear(v, '今はうれしい'), second = hear(v, '今はうれしい'), buffer = candidates.create();
        assert.equal(capture(buffer, first), true); assert.equal(capture(buffer, second), true);
        assert.equal(buffer.read().length, 2);
        for (const field of ['mode', 'destination', 'hunger', 'fatigue', 'experiences', 'elapsed', 'activityStart']) assert.deepEqual(v.world[field], world[field]);
        assert.deepEqual(v.state.knowledge, knowledge); assert.deepEqual(v.state.feelingLearning || null, learned);
        assert.equal(v.state.records.at(-1).source, 'speaker_report');
        for (const name of ['reports', 'time_reports', 'known_feeling_words', 'feeling_contrast_examples']) {
            assert.equal(require('../experimental_word_diary_' + name).capture(candidates.create(), first.result, first.context,
                first.beforeKnowledge, first.beforeFeelingLearning, first.beforeTurns, first.beforeRecords), false);
        }
    }
});
