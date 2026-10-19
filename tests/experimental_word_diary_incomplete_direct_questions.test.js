'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const api = require('../experimental_word_diary_incomplete_direct_questions');
const candidates = require('../experimental_word_diary_candidates');
const oldQuestions = require('../experimental_word_diary_questions');
const { fixtures, setup, hear } = require('../scripts/experimental/diary_incomplete_direct_question_fixtures');
const copy = value => JSON.parse(JSON.stringify(value));
const { forms } = require('../scripts/experimental/diary_incomplete_direct_question_fixtures');
const values = fixtures();
const capture = (buffer, v) => api.capture(buffer, v.result, v.receipt);
for (const group of new Set(values.map(f => f.group))) test(`incomplete direct: ${group}`, () => {
    for (const f of values.filter(item => item.group === group)) {
        const v = copy(f.value), source = JSON.stringify(v), buffer = api.create();
        assert.equal(capture(buffer, v), f.expected, JSON.stringify([group, v.result.input, v.result.understandings]));
        assert.equal(JSON.stringify(v), source); assert.equal(buffer.read().length, Number(f.expected));
        assert.equal(capture(buffer, v), false);
        if (!f.expected) continue;
        const record = buffer.read()[0], u = v.result.understandings[0], retained = JSON.stringify(buffer.read());
        assert.equal(record.kind, 'incomplete_direct_question');
        assert.deepEqual(record.captured.understanding, u); assert.equal(u.complete, false);
        assert.ok(require('../scripts/experimental/diary_incomplete_direct_question_fixtures').forms.some(f => f[0] === v.result.interpretations[0].slot));
        assert.equal(Object.hasOwn(u, 'reportSource'), false);
        assert.deepEqual(record.captured.missingRelationsBefore, u.unresolved.filter(e => e.type === 'relation').map(e => e.id));
        assert.deepEqual(record.captured.missingMeaningsBefore, u.unresolved.filter(e => e.type === 'meaning').map(e => e.token));
        assert.deepEqual(record.captured.inputKnowledge, v.receipt.inputKnowledge);
        assert.deepEqual(record.captured.inputContext, v.receipt.inputContext);
        assert.deepEqual(record.captured.response, v.receipt.reply);
        assert.equal(record.captured.actualSpeech, v.receipt.beforeState.settings.speech === 'short');
        assert.deepEqual(record.captured.sources.state, { before: v.receipt.beforeState, after: v.receipt.afterState });
        assert.deepEqual(record.captured.sources.activity, { before: v.receipt.beforeWorld, after: v.receipt.afterWorld });
        assert.equal(record.captured.turnAnswer, null);
        assert.equal(Object.hasOwn(v.receipt.afterState.context.turns.at(-1), 'answer'), false);
        for (const key of ['newTeaching', 'newLearning', 'newExperience']) assert.equal(record.captured[key], false);
        for (const key of ['knowledge', 'experiences', 'selectionSources'])
            assert.deepEqual(v.receipt.beforeState[key], v.receipt.afterState[key]);
        for (const key of ['mode', 'destination', 'attention', 'history', 'reasons', 'activityStart', 'experiences'])
            assert.deepEqual(v.receipt.beforeWorld[key], v.receipt.afterWorld[key]);
        assert.equal(oldQuestions.capture(candidates.create(), v.result, v.receipt.reply), false);
        assert.throws(() => candidates.create().retain(record));
        record.captured.understanding.subject = 'invented'; v.receipt.beforeState.serial++;
        assert.equal(JSON.stringify(buffer.read()), retained);
    }
});
const edits = [
    v => { v.result.input.id = 'input:999'; }, v => { v.result.input.at++; },
    v => { v.result.input.raw += 'changed'; }, v => { v.result.input.speaker = 'other'; },
    v => { v.result.input.locale = 'invalid'; }, v => { v.result.input.scene += ':changed'; },
    v => { v.result.understandings[0].complete = true; },
    v => { v.result.interpretations.push(copy(v.result.interpretations[0])); },
    v => { v.result.understandings.push(copy(v.result.understandings[0])); },
    v => { v.receipt.input.at++; }, v => { v.receipt.inputKnowledge.relations.push({ id: 'invented' }); },
    v => { v.receipt.inputContext.scene += ':changed'; }, v => { v.receipt.beforeState.serial++; },
    v => { v.receipt.beforeState.context.attention.push({ id: 'other', meaning: 'berry' }); },
    v => { v.receipt.afterState.serial++; }, v => { v.receipt.reply.message = 'invented'; },
    v => { v.receipt.afterWorld.elapsed++; }, v => { v.receipt.afterState.context.turns.at(-1).speaker = 'other'; },
    v => { delete v.receipt.beforeWorld; }, v => { delete v.receipt.afterState; },
    v => { delete v.receipt.inputKnowledge; }, v => { delete v.receipt.inputContext; },
    v => { v.result.understandings[0].subject = 'invented'; },
    v => { v.result.understandings[0].aspect = 'invented'; },
    v => { v.result.understandings[0].polarity = 'invented'; },
    v => { v.result.understandings[0].eventTime = 'invented'; },
    v => { v.result.understandings[0].known.meaning = 'invented'; },
    v => { v.receipt.beforeWorld.attention = 'berry:tampered'; },
    v => { v.receipt.afterWorld.experiences.push({ id: 'invented' }); },
    v => { v.result.understandings[0].unresolved = []; },
    v => { v.result.interpretations[0].catalogRule = 'name_question'; },
    v => { v.result.interpretations[0].slot = 'outside_slot'; },
    v => { v.result.understandings[0].conditionStatus = 'met'; },
    v => { v.result.understandings[0].questionSlot = 'name'; },
    v => { v.result.understandings[0].reportSource = { kind: 'speaker_report' }; },
    v => { v.receipt.afterState.context.turns.at(-1).answer = { slot: 'outside_slot' }; },
    v => { v.result.understandings[0].target = { candidates: [{ id: 'invented' }], adopted: null }; }
];
test('independent input, knowledge, context and all original response fields are required', () => {
    let rejected = 0;
    for (const f of values.filter(item => item.expected)) for (const edit of edits) {
        const v = copy(f.value); edit(v); assert.notEqual(JSON.stringify(v), JSON.stringify(f.value));
        assert.equal(capture(api.create(), v), false, `${f.group}: ${edit}`); rejected++;
    }
    console.log(JSON.stringify({ cd: { original: values.length, accepted: values.filter(f => f.expected).length,
        editKinds: edits.length, rejected, groups: Object.fromEntries([...new Set(values.map(f => f.group))]
            .map(group => [group, [values.filter(f => f.group === group).length, values.filter(f => f.group === group && f.expected).length]])) } }));
});
test('cd stays separate from all 40 prior supplemental owners', () => {
    const owners = require('../scripts/experimental/diary_audit').supplementalInventory().slice(0, 40);
    assert.equal(owners.length, 40);
    for (const f of values.filter(item => item.expected)) for (const owner of owners) {
        const v = copy(f.value), source = JSON.stringify(v);
        assert.equal(require('../' + owner.file).capture(candidates.create(), v.result, v.receipt), false, owner.id);
        assert.equal(JSON.stringify(v), source);
    }
});
test('later understanding cannot complete old inputs; delayed supply and new inputs remain distinct', () => {
    for (const [slot, raw] of forms) {
        const v = setup({ foundation: false, life: false }), buffer = api.create();
        const early = hear(v, raw), source = JSON.stringify(early);
        assert.equal(capture(buffer, early), true);
        const retained = JSON.stringify(buffer.read());
        const seed = require('../scripts/experimental/diary_answer_fixtures').fixtures()
            .find(f => f.expected && f.slot === slot);
        assert.ok(seed, slot);
        v.state.knowledge = copy(seed.value.receipt.beforeState.knowledge);
        const later = hear(v, raw); assert.equal(later.result.understandings[0].complete, true);
        assert.equal(capture(api.create(), later), false);
        assert.equal(capture(buffer, early), false);
        const delayed = api.create(); assert.equal(capture(delayed, early), true);
        assert.equal(JSON.stringify(delayed.read()), retained); assert.equal(JSON.stringify(early), source);
        delayed.read()[0].captured.inputKnowledge.meanings = [];
        assert.equal(JSON.stringify(delayed.read()), retained);
    }
    const v = setup({ foundation: false }), buffer = api.create();
    for (let i = 0; i < 13; i++) assert.equal(capture(buffer, hear(v, forms[0][1])), true);
    assert.equal(buffer.read().length, 13);
    assert.equal(new Set(buffer.read().map(e => e.sourceId)).size, 13);
});
test('prior complete answers, name/sour/confirmation materials and followups keep their owners', () => {
    for (const name of ['answer', 'name_response', 'name_question', 'incomplete_name_question',
        'unresolved_name_target', 'sour_question', 'incomplete_sour_question', 'incomplete_confirmation_question']) {
        for (const f of require('../scripts/experimental/diary_' + name + '_fixtures').fixtures()) {
            // Prior negative fixtures include the nine entries now owned by cd.
            if (!f.expected) continue;
            const source = JSON.stringify(f.value);
            assert.equal(capture(api.create(), f.value), false, name + ':' + f.group);
            assert.equal(JSON.stringify(f.value), source);
        }
    }
    const old = require('../experimental_word_diary_questions'), value = hear(setup(), forms[8][1]);
    assert.equal(value.result.understandings[0].complete, true);
    assert.equal(old.capture(candidates.create(), value.result, value.receipt.reply), true);
    assert.equal(capture(api.create(), value), false);
    const gesture = hear(setup({ speech: 'gesture' }), forms[8][1]);
    assert.equal(gesture.result.understandings[0].complete, true);
    assert.equal(capture(api.create(), gesture), false);
});
test('malformed, non-JSON and cyclic data never partially retain', () => {
    for (const value of [null, {}, {kind: 'report'}, {kind: 'incomplete_direct_question', sourceId: 'input:0'}])
        assert.throws(() => api.create().retain(value));
    for (const malformed of [Infinity, undefined, () => {}, new Date(), Symbol('invalid')]) {
        const v = copy(values.find(f => f.expected).value); v.receipt.invalid = malformed;
        assert.equal(capture(api.create(), v), false);
    }
    const v = copy(values.find(f => f.expected).value); v.result.invalid = v.result;
    assert.equal(capture(api.create(), v), false);
});
