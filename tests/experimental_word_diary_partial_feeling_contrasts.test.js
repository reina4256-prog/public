'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const api = require('../experimental_word_diary_partial_feeling_contrasts');
const candidates = require('../experimental_word_diary_candidates');
const f = require('../scripts/experimental/diary_partial_feeling_contrast_fixtures');
const copy = value => JSON.parse(JSON.stringify(value));
const values = f.fixtures();
const capture = (buffer, v) => api.capture(buffer, v.result, v.receipt);
for (const group of new Set(values.map(v => v.group))) test(`partial feeling contrast: ${group}`, () => {
    for (const item of values.filter(v => v.group === group)) {
        const value = copy(item.value), source = JSON.stringify(value), buffer = candidates.create();
        assert.equal(capture(buffer, value), item.expected, JSON.stringify([group, value.result.input]));
        assert.equal(JSON.stringify(value), source); assert.equal(capture(buffer, value), false);
        assert.equal(buffer.read().length, Number(item.expected));
        if (!item.expected) continue;
        const record = buffer.read()[0], c = record.captured, retained = JSON.stringify(buffer.read());
        assert.equal(record.kind, 'report'); assert.equal(record.sourceId, value.result.input.id);
        assert.equal(record.occurrenceId, `partial_feeling_contrast:${record.sourceId}`);
        assert.deepEqual(c.understandings, value.result.understandings);
        assert.deepEqual(c.sources.frames, value.result.interpretations);
        assert.deepEqual(c.inputKnowledge, value.receipt.inputKnowledge);
        assert.deepEqual(c.response, value.receipt.reply);
        assert.deepEqual(c.contrast, { clauseOrder: [0, 1], replaces: false, causalClaim: false });
        assert.deepEqual(c.testimony, { reporter: value.result.input.speaker, contentSubject: value.result.input.speaker,
            status: 'reported', verified: false });
        assert.ok(c.understandings.some(u => !u.complete));
        assert.deepEqual(c.meaningKnownBefore, value.result.understandings.map(u => Object.hasOwn(u.known, 'meaning')));
        assert.equal(c.relationsKnownBefore, true);
        assert.deepEqual(c.reportSources, value.result.understandings.map(u => u.reportSource));
        const bf = require('../experimental_word_diary_general_feeling_contrasts');
        assert.equal(bf.capture(candidates.create(), value.result, value.receipt), false);
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
    questionSlot: 'reason', relations: [], reportSource: null, unresolved: [{ type: 'meaning', token: 'sad' }] }))
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
test('new input retains a separate pair; prior receipt stays unchanged after later knowledge and views', () => {
    const v = f.partial(), first = f.hear(v, f.raw), buffer = candidates.create();
    assert.equal(capture(buffer, first), true); const retained = JSON.stringify(buffer.read());
    const second = f.hear(v, f.raw); assert.equal(capture(buffer, second), true);
    assert.equal(buffer.read().length, 2); assert.equal(capture(buffer, first), false);
    assert.equal(JSON.stringify(buffer.read().slice(0, 1)), retained);
    for (let i = 0; i < 3; i++) { buffer.read(); assert.equal(capture(buffer, first), false); }
});
test('later knowledge cannot repair an incomplete original receipt or rewrite the earlier candidate', () => {
    const v = f.partial(), root = v.state.knowledge.relations.find(e => e.id === 'contrast');
    v.state.knowledge.relations = v.state.knowledge.relations.filter(e => e.id !== 'contrast');
    const original = f.hear(v, f.raw), buffer = candidates.create();
    assert.equal(capture(buffer, original), false); v.state.knowledge.relations.push(root);
    const later = f.hear(v, f.raw); assert.equal(capture(buffer, later), true);
    assert.equal(capture(buffer, original), false); assert.equal(buffer.read().length, 1);
    const changed = copy(original); changed.result.understandings[0].complete = true;
    changed.result.understandings[0].unresolved = []; assert.equal(capture(buffer, changed), false);
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


test('real later tired learning leaves the earlier two-clause partial candidate unchanged', () => {
    const life = require('../scripts/experimental/diary_negation_fixtures');
    const bf = require('../experimental_word_diary_general_feeling_contrasts');
    const v = f.partial({}, ['tired']), raw = '昨日は疲れていたけど今はうれしい';
    const original = f.hear(v, raw), buffer = candidates.create();
    assert.equal(capture(buffer, original), true);
    const retained = JSON.stringify(buffer.read()), source = JSON.stringify(original);
    life.start(v, 'rest'); f.hear(v, '"疲れた"'); life.finish(v);
    assert.ok(v.state.knowledge.meanings.some(e => e.id === 'tired' && e.source === 'experienced_life'));
    const later = f.hear(v, raw);
    assert.equal(capture(candidates.create(), later), false);
    assert.equal(bf.capture(candidates.create(), later.result, later.receipt), true);
    assert.equal(capture(buffer, original), false);
    assert.equal(JSON.stringify(buffer.read()), retained);
    assert.equal(JSON.stringify(original), source);
    const independentlyDelivered = candidates.create();
    assert.equal(capture(independentlyDelivered, original), true);
    assert.deepEqual(independentlyDelivered.read(), buffer.read());
});
