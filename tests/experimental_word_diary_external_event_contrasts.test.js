'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const api = require('../experimental_word_diary_external_event_contrasts');
const candidates = require('../experimental_word_diary_candidates');
const f = require('../scripts/experimental/diary_external_event_contrast_fixtures');
const copy = value => JSON.parse(JSON.stringify(value));
const values = f.fixtures();
const capture = (buffer, v) => api.capture(buffer, v.result, v.receipt);
for (const group of new Set(values.map(v => v.group))) test(`external event contrast: ${group}`, () => {
    for (const item of values.filter(v => v.group === group)) {
        const value = copy(item.value), source = JSON.stringify(value), buffer = candidates.create();
        assert.equal(capture(buffer, value), item.expected, JSON.stringify([group, value.result.input]));
        assert.equal(JSON.stringify(value), source); assert.equal(capture(buffer, value), false);
        assert.equal(buffer.read().length, Number(item.expected));
        if (!item.expected) continue;
        const record = buffer.read()[0], c = record.captured, retained = JSON.stringify(buffer.read());
        assert.equal(record.kind, 'report'); assert.equal(record.sourceId, value.result.input.id);
        assert.equal(record.occurrenceId, `external_event_contrast:${record.sourceId}`);
        assert.deepEqual(c.understandings, value.result.understandings);
        assert.deepEqual(c.sources.frames, value.result.interpretations);
        assert.deepEqual(c.inputKnowledge, value.receipt.inputKnowledge);
        assert.deepEqual(c.response, value.receipt.reply);
        for (const field of ['contrast', 'testimony', 'reportSources']) assert.equal(Object.hasOwn(c, field), false);
        assert.deepEqual(c.clauseOrder, [0, 1]);
        assert.deepEqual(c.missingRelationsBefore, value.result.understandings.map(u => u.unresolved.filter(e => e.type === 'relation').map(e => e.id)));
        assert.deepEqual(c.missingMeaningsBefore, value.result.understandings.map(u => u.unresolved.filter(e => e.type === 'meaning')));
        assert.deepEqual(c.meaningKnownBefore, value.result.understandings.map(u => Object.hasOwn(u.known, 'meaning')));
        assert.equal(c.relationsKnownBefore, c.missingRelationsBefore.every(ids => ids.length === 0));
        assert.equal(c.detailsUnderstood, false);
        assert.ok(c.sources.frames.some(frame => frame.detail));
        c.sources.frames.forEach((frame, index) => {
            assert.deepEqual(c.understandings[index], value.result.understandings[index]);
            if (frame.detail) assert.ok(c.understandings[index].unresolved.some(e => e.type === 'detail' && e.token === frame.detail));
        });
        for (const flag of ['newTeaching', 'newLearning', 'newExperience']) assert.equal(c[flag], false);
        for (const field of ['knowledge', 'experiences', 'selectionSources'])
            assert.deepEqual(value.receipt.beforeState[field], value.receipt.afterState[field]);
        for (const field of ['experiences', 'mode', 'destination', 'attention', 'history', 'reasons', 'activityStart'])
            assert.deepEqual(value.receipt.beforeWorld[field], value.receipt.afterWorld[field]);
        assert.equal(Object.hasOwn(value.receipt.afterState.context.turns.at(-1), 'answer'), false);
        c.understandings[0].known.meaning = 'changed'; c.sources.input.raw = 'changed';
        value.receipt.inputKnowledge.meanings = []; assert.equal(JSON.stringify(buffer.read()), retained);
    }
});
const edits = [
    v => { v.result.interpretations[0].aspect = 'feeling'; },
    v => { v.result.interpretations[1].catalogRule = 'external_event_report'; },
    v => { delete v.result.interpretations[0].detail; },
    v => { v.result.interpretations[0].eventMeaning = 'invented'; },
    v => { v.result.understandings[0].known.eventMeaning = 'invented'; },
    v => { v.result.understandings[0].complete = true; },
    v => { v.result.input.id = 'input:999'; }, v => { v.result.input.at++; },
    v => { v.result.input.raw += 'changed'; }, v => { v.result.input.speaker = 'other'; },
    v => { v.result.input.locale = 'en'; }, v => { v.result.input.scene += ':changed'; },
    v => { v.result.interpretations.reverse(); }, v => { v.result.interpretations.pop(); },
    v => { v.result.interpretations[0].catalogRule = 'feeling_contrast'; },
    v => { v.result.interpretations[0].detail = 'invented'; },
    v => { v.receipt.input.at++; }, v => { v.receipt.inputKnowledge.relations = []; },
    v => { v.receipt.inputContext.scene += ':changed'; }, v => { v.receipt.beforeState.serial++; },
    v => { v.receipt.beforeState.context.attention.push({ id: 'other' }); }, v => { v.receipt.afterState.serial++; },
    v => { v.receipt.reply.message = 'invented'; }, v => { v.receipt.afterWorld.elapsed++; },
    v => { v.receipt.afterState.context.turns.at(-1).speaker = 'other'; },
    v => { delete v.receipt.beforeWorld; }, v => { delete v.receipt.afterState; },
    v => { v.receipt.afterState.context.turns.at(-1).answer = { actualAnswer: true }; },
    v => { v.receipt.afterWorld.experiences.push({ id: 'invented' }); }
];
for (const index of [0, 1]) for (const [field, value] of Object.entries({ complete: false, subject: 'self',
    aspect: 'activity', polarity: 'negative', eventTime: 'invented', conditionStatus: 'met',
    questionSlot: 'reason', relations: [], reportSource: null, unresolved: [{ type: 'meaning', token: 'sad' }] }))
    edits.push(v => { v.result.understandings[index][field] = value; });
for (const index of [0, 1]) for (const field of ['kind', 'known', 'testimony', 'contrastConnection'])
    edits.push(v => { v.result.understandings[index][field] = 'invented'; });
test('each supplied clause and independent before/after receipt rejects tampering', t => {
    let rejected = 0;
    for (const item of values.filter(v => v.expected)) for (const edit of edits) {
        const value = copy(item.value); edit(value);
        // Swapping identical clauses has no semantic or data change.
        if (JSON.stringify(value) === JSON.stringify(item.value)) continue;
        assert.equal(capture(candidates.create(), value), false, `${item.group}: ${edit}`);
        rejected++;
    }
    t.diagnostic(JSON.stringify({ editKinds: edits.length, rejected }));
});
test('new input retains a separate pair; prior receipt stays unchanged after later knowledge and views', () => {
    const v = f.incomplete(), first = f.hear(v, f.raw), buffer = candidates.create();
    assert.equal(capture(buffer, first), true); const retained = JSON.stringify(buffer.read());
    const second = f.hear(v, f.raw); assert.equal(capture(buffer, second), true);
    assert.equal(buffer.read().length, 2); assert.equal(capture(buffer, first), false);
    assert.equal(JSON.stringify(buffer.read().slice(0, 1)), retained);
    // A delayed original receipt uses its own input-time knowledge, never the
    // caller's later knowledge or a fabricated replacement for missing material.
    v.state.knowledge.meanings = []; v.state.knowledge.relations = [];
    const delayed = candidates.create();
    assert.equal(capture(delayed, { result: first.result, receipt: null }), false);
    assert.equal(capture(delayed, first), true);
    assert.equal(JSON.stringify(delayed.read()), retained);
    for (let i = 0; i < 3; i++) { buffer.read(); assert.equal(capture(buffer, first), false); }
});
test('later knowledge retains a separate occurrence without rewriting original missing relations', () => {
    const v = f.incomplete(), root = f.setup().state.knowledge.relations.find(e => e.id === 'reason');
    const original = f.hear(v, f.raw), buffer = candidates.create();
    assert.equal(capture(buffer, original), true); const retained = JSON.stringify(buffer.read());
    assert.ok(buffer.read()[0].captured.missingRelationsBefore[1].includes('reason'));
    v.state.knowledge.relations.push(root);
    const later = f.hear(v, f.raw); assert.equal(capture(buffer, later), true);
    assert.equal(buffer.read()[1].captured.relationsKnownBefore, true);
    assert.equal(capture(buffer, original), false);
    assert.equal(JSON.stringify(buffer.read().slice(0, 1)), retained);
    const changed = copy(original); changed.result.understandings[0].unresolved = [];
    assert.equal(capture(candidates.create(), changed), false);
});
test('external-event and feeling fields remain distinct, with absent sources never filled', () => {
    const value = f.hear(f.incomplete(['report', 'time', 'failure']), f.raw), buffer = candidates.create();
    assert.equal(capture(buffer, value), true);
    const c = buffer.read()[0].captured;
    assert.equal(c.sources.frames[0].aspect, 'external_event');
    assert.equal(c.sources.frames[0].meaning, 'failure');
    assert.equal(Object.hasOwn(c.sources.frames[0], 'eventMeaning'), false);
    assert.equal(c.sources.frames[1].eventMeaning, 'success');
    c.understandings.forEach(u => {
        assert.equal(u.kind, 'partial'); assert.equal(Object.hasOwn(u, 'reportSource'), false);
    });
    assert.equal(Object.hasOwn(c, 'testimony'), false);
});
test('malformed non-JSON or cyclic source material is rejected without writes', () => {
    const original = values.find(v => v.expected).value;
    for (const value of [null, undefined, NaN, () => {}, new Date(), { cyclic: null }]) {
        const v = copy(original); v.receipt.extra = value;
        if (value && Object.hasOwn(value, 'cyclic')) value.cyclic = value;
        const buffer = candidates.create(); assert.equal(capture(buffer, v), value === null);
        assert.equal(buffer.read().length, Number(value === null));
    }
    assert.equal(api.capture(candidates.create(), null, null), false);
    assert.equal(api.capture(null, original.result, original.receipt), false);
});
