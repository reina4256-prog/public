'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const core = require('../experimental_word_learning_core');
const catalog = require('../experimental_word_learning_catalog.json');
const candidates = require('../experimental_word_diary_candidates');
const reports = require('../experimental_word_diary_external_reports');
const { fixtures, setup, hear } = require('../scripts/experimental/diary_external_report_fixtures');
const capture = (buffer, v) => reports.capture(buffer, v.result, v.context, v.beforeKnowledge,
    v.beforeFeelingLearning, v.beforeTurns, v.beforeRecords, v.beforeReports);
const cases = fixtures();
for (const group of [...new Set(cases.map(f => f.group))]) test('1c diary reports: ' + group, () => {
    for (const fixture of cases.filter(f => f.group === group)) {
        const buffer = candidates.create(), supplied = JSON.stringify(fixture);
        const accepted = fixture.values.map(v => capture(buffer, v));
        assert.deepEqual(accepted, fixture.expected, JSON.stringify(fixture.values.map(v => v.result.input)));
        assert.equal(JSON.stringify(fixture), supplied);
        const original = buffer.read();
        assert.ok(fixture.values.every(v => capture(buffer, v) === false));
        if (original.length) {
            buffer.read()[0].captured.testimony.verified = true;
            fixture.values[0].beforeKnowledge.meanings = [];
            fixture.values[0].result.input.raw = 'changed';
        }
        assert.deepEqual(buffer.read(), original);
        for (const e of original) {
            const d = e.captured;
            assert.equal(e.kind, 'report'); assert.equal(e.sourceId, d.sources.input.id);
            assert.equal(d.testimony.verified, false); assert.equal(d.testimony.status, 'reported');
            assert.equal(d.understanding.subject, 'player'); assert.equal(d.reportSource.inputId, e.sourceId);
            assert.ok(d.understanding.unresolved.every(item => item.type === 'detail'));
            assert.equal(d.understoodContentOnly, !d.understanding.complete);
            assert.equal(d.experience, undefined); assert.equal(d.ownFeeling, undefined);
            if (d.reportReference) {
                assert.equal(d.sources.originalReport.result.input.id, d.reportReference.inputId);
                assert.equal(d.sources.previousReport.result.input.id, d.reportReference.previousInputId);
            }
        }
    }
});
test('1c diary keeps unknown real details, relative time and attributed reason without rewriting the original', () => {
    const v = setup(), buffer = candidates.create();
    const first = hear(v, '昨日は量子実験で失敗した');
    const confirm = hear(v, 'その話だよ'), next = hear(v, 'それで悲しかった');
    assert.equal(capture(buffer, first), true); assert.equal(capture(buffer, confirm), false); assert.equal(capture(buffer, next), true);
    const [old, added] = buffer.read().map(e => e.captured);
    assert.deepEqual(old.understanding.known, { meaning: 'failure' });
    assert.deepEqual(added.understanding.known, { meaning: 'sad' });
    assert.deepEqual(added.understanding.unresolved, [{ type: 'detail', token: '量子実験' }]);
    assert.equal(added.timeSource, 'report_reference'); assert.equal(added.understanding.eventTime, 'yesterday');
    assert.equal(added.reportReference.heardAt, first.result.input.at);
    assert.equal(added.reportSource.heardAt, next.result.input.at);
    assert.deepEqual(added.sources.originalReport.result.understandings[0], old.understanding);
    assert.deepEqual(added.understanding.relations, ['report', 'time', 'reason']);
    assert.equal(added.understanding.known.eventMeaning, undefined);
    assert.equal(added.testimony.verified, false); assert.equal(old.understanding.complete, false);
});
test('1c diary hearings and captures leave bodily state, action, knowledge and own experiences unchanged', () => {
    const v = setup(), buffer = candidates.create();
    const body = () => JSON.stringify({ mode: v.world.mode, destination: v.world.destination,
        hunger: v.world.hunger, fatigue: v.world.fatigue, experiences: v.world.experiences,
        knowledge: v.state.knowledge, own: v.state.experiences || [] });
    const initial = body();
    for (const raw of ['昨日は仕事で失敗した', 'その話だよ', 'それで悲しかった']) capture(buffer, hear(v, raw));
    assert.equal(body(), initial); assert.equal(buffer.read().length, 2);
    const entries = buffer.read(); v.state.knowledge = core.create({ foundation: false, life: false }, catalog).knowledge;
    assert.deepEqual(buffer.read(), entries);
});
test('1c diary rejects missing or non-JSON input-before material without repairing it', () => {
    for (const v of [null, {}, { result: {} }]) assert.equal(capture(candidates.create(), v || {}), false);
    const v = hear(setup(), '悲しい'); v.context.attention = [null];
    assert.equal(capture(candidates.create(), v), false);
});
module.exports = { capture };
