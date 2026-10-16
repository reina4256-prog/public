'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const api = require('../experimental_word_diary_incomplete_feeling_contrasts');
const candidates = require('../experimental_word_diary_candidates');
const f = require('../scripts/experimental/diary_incomplete_feeling_contrast_fixtures');
const copy = value => JSON.parse(JSON.stringify(value));
const values = f.fixtures();
const capture = (buffer, v) => api.capture(buffer, v.result, v.receipt);
for (const group of new Set(values.map(v => v.group))) test(`incomplete feeling contrast: ${group}`, () => {
    for (const item of values.filter(v => v.group === group)) {
        const value = copy(item.value), source = JSON.stringify(value), buffer = candidates.create();
        assert.equal(capture(buffer, value), item.expected, JSON.stringify([group, value.result.input]));
        assert.equal(JSON.stringify(value), source); assert.equal(capture(buffer, value), false);
        assert.equal(buffer.read().length, Number(item.expected));
        if (!item.expected) continue;
        const record = buffer.read()[0], c = record.captured, retained = JSON.stringify(buffer.read());
        assert.equal(record.kind, 'report'); assert.equal(record.sourceId, value.result.input.id);
        assert.equal(record.occurrenceId, `incomplete_feeling_contrast:${record.sourceId}`);
        assert.deepEqual(c.understandings, value.result.understandings);
        assert.deepEqual(c.sources.frames, value.result.interpretations);
        assert.deepEqual(c.sources.input, value.result.input);
        assert.deepEqual(c.inputKnowledge, value.receipt.inputKnowledge);
        assert.deepEqual(c.response, value.receipt.reply);
        assert.deepEqual(c.clauseOrder, [0, 1]);
        for (const key of ['contrast', 'testimony', 'reportSources']) assert.equal(Object.hasOwn(c, key), false);
        assert.ok(c.missingRelationsBefore.some(ids => ids.includes('report') || ids.includes('time')));
        assert.deepEqual(c.meaningKnownBefore, value.result.understandings.map(u => Object.hasOwn(u.known, 'meaning')));
        assert.deepEqual(c.missingRelationsBefore, value.result.understandings.map(u =>
            u.unresolved.filter(item => item.type === 'relation').map(item => item.id)));
        assert.deepEqual(c.clauseRelationsKnownBefore, c.missingRelationsBefore.map(ids => ids.length === 0));
        assert.equal(c.relationsKnownBefore, false);
        for (const owner of ['general', 'partial', 'unresolved', 'mixed'])
            assert.equal(require(`../experimental_word_diary_${owner}_feeling_contrasts`)
                .capture(candidates.create(), value.result, value.receipt), false);
        assert.deepEqual(c.sources.activity, { before: value.receipt.beforeWorld, after: value.receipt.afterWorld });
        assert.deepEqual(c.inputFeelingLearning, value.receipt.beforeState.feelingLearning || null);
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
for (const index of [0, 1]) for (const [field, value] of Object.entries({ complete: 'invented', known: { meaning: 'invented' }, subject: 'self',
    aspect: 'activity', polarity: 'negative', eventTime: 'invented', conditionStatus: 'met',
    questionSlot: 'reason', relations: [], reportSource: null, unresolved: [{ type: 'meaning', token: 'sad' }], testimony: { verified: true }, contrastConnection: { causalClaim: false } }))
    edits.push(v => { v.result.understandings[index][field] = value; });
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
test('new inputs stay separate and replay/view never appends or overwrites', () => {
    const v = f.incomplete(), first = f.hear(v, f.raw), buffer = candidates.create();
    assert.equal(capture(buffer, first), true); const retained = JSON.stringify(buffer.read());
    const second = f.hear(v, f.raw); assert.equal(capture(buffer, second), true);
    assert.equal(buffer.read().length, 2);
    for (let i = 0; i < 3; i++) { buffer.read(); assert.equal(capture(buffer, first), false); }
    assert.equal(JSON.stringify(buffer.read().slice(0, 1)), retained);
});
test('later knowledge cannot rewrite originals, fix invalid receipts or move historical ownership', () => {
    const v = f.setup(), knowledge = copy(v.state.knowledge);
    v.state.knowledge.relations = v.state.knowledge.relations.filter(e => e.id !== 'time');
    const original = f.hear(v, f.raw), buffer = candidates.create();
    assert.equal(capture(buffer, original), true);
    const retained = JSON.stringify(buffer.read()), source = JSON.stringify(original);
    v.state.knowledge = copy(knowledge);
    const later = f.hear(v, f.raw);
    assert.equal(capture(buffer, later), false);
    assert.equal(require('../experimental_word_diary_general_feeling_contrasts')
        .capture(candidates.create(), later.result, later.receipt), true);
    assert.equal(capture(buffer, original), false);
    assert.equal(JSON.stringify(buffer.read()), retained); assert.equal(JSON.stringify(original), source);
    const delayed = candidates.create(); assert.equal(capture(delayed, original), true);
    assert.deepEqual(delayed.read(), buffer.read());
    // The prior complete occurrence belongs to bf even after live knowledge is removed.
    v.state.knowledge.relations = [];
    assert.equal(capture(candidates.create(), later), false);
    const invalid = copy(original); delete invalid.receipt.beforeWorld;
    assert.equal(capture(candidates.create(), invalid), false);
    invalid.receipt.beforeWorld = copy(original.receipt.beforeWorld);
    invalid.receipt.afterWorld.elapsed++;
    assert.equal(capture(candidates.create(), invalid), false);
    const patched = copy(original); patched.result.understandings[0].eventTime = 'yesterday';
    assert.equal(capture(candidates.create(), patched), false);
});
test('mixed complete/partial clauses keep original absence and presence of reportSource', () => {
    for (const text of ['つらいけど今はうれしい', '今はうれしいけどつらい']) {
        const value = f.hear(f.incomplete({}, ['time']), text), buffer = candidates.create();
        assert.equal(capture(buffer, value), true);
        const u = buffer.read()[0].captured.understandings;
        assert.equal(u.filter(item => item.complete).length, 1);
        assert.equal(u.filter(item => Object.hasOwn(item, 'reportSource')).length, 1);
        const missing = value.result.understandings.find(item => !item.complete);
        assert.equal(missing.eventTime, 'unspecified');
        const altered = copy(value);
        altered.result.understandings.find(item => !item.complete).reportSource =
            copy(u.find(item => item.complete).reportSource);
        assert.equal(capture(candidates.create(), altered), false);
    }
});
test('malformed non-JSON or cyclic material is rejected without writes', () => {
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
