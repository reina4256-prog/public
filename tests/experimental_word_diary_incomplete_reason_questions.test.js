'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const api = require('../experimental_word_diary_incomplete_reason_questions');
const candidates = require('../experimental_word_diary_candidates');
const oldQuestions = require('../experimental_word_diary_questions');
const { fixtures, setup, hear } = require('../scripts/experimental/diary_incomplete_reason_question_fixtures');
const copy = value => JSON.parse(JSON.stringify(value));
const { missing, core, worldApi, catalog } = require('../scripts/experimental/diary_incomplete_reason_question_fixtures');
const values = fixtures();
const capture = (buffer, v) => api.capture(buffer, v.result, v.receipt);
for (const group of new Set(values.map(f => f.group))) test(`incomplete reason: ${group}`, () => {
    for (const f of values.filter(item => item.group === group)) {
        const v = copy(f.value), source = JSON.stringify(v), buffer = api.create();
        assert.equal(capture(buffer, v), f.expected, JSON.stringify([group, v.result.input, v.result.understandings]));
        assert.equal(JSON.stringify(v), source); assert.equal(buffer.read().length, Number(f.expected));
        assert.equal(capture(buffer, v), false);
        if (!f.expected) continue;
        const record = buffer.read()[0], u = v.result.understandings[0], retained = JSON.stringify(buffer.read());
        assert.equal(record.kind, 'incomplete_reason_question');
        assert.deepEqual(record.captured.understanding, u); assert.equal(u.complete, false);
        assert.equal(v.result.interpretations[0].slot, 'reason');
        assert.equal(Object.hasOwn(u, 'reportSource'), false);
        assert.deepEqual(record.captured.missingRelationsBefore, u.unresolved.filter(e => e.type === 'relation').map(e => e.id));
        assert.deepEqual(record.captured.missingMeaningsBefore, u.unresolved.filter(e => e.type === 'meaning').map(e => e.token));
        assert.deepEqual(record.captured.inputKnowledge, v.receipt.inputKnowledge);
        assert.deepEqual(record.captured.inputContext, v.receipt.inputContext);
        assert.deepEqual(record.captured.response, v.receipt.reply);
        assert.deepEqual(record.captured.expression, v.result.expression);
        assert.equal(record.captured.speechSetting, v.receipt.beforeState.settings.speech);
        assert.equal(record.captured.actualSpeech, v.result.expression.channel === 'speech');
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
    console.log(JSON.stringify({ cj: { original: values.length, accepted: values.filter(f => f.expected).length,
        editKinds: edits.length, rejected, groups: Object.fromEntries([...new Set(values.map(f => f.group))]
            .map(group => [group, [values.filter(f => f.group === group).length, values.filter(f => f.group === group && f.expected).length]])) } }));
});

test('cj preserves all 46 prior supplemental owners and the complete-answer boundary', () => {
    const owners = require('../scripts/experimental/diary_audit').supplementalInventory().slice(0, 46);
    assert.equal(owners.length, 46);
    for (const f of values.filter(item => item.expected)) for (const owner of owners) {
        const v = copy(f.value), source = JSON.stringify(v);
        assert.equal(require('../' + owner.file).capture(candidates.create(), v.result, v.receipt), false, owner.id);
        assert.equal(JSON.stringify(v), source);
    }
    const completed = hear(setup({ speech: 'short' }));
    assert.equal(oldQuestions.capture(candidates.create(), completed.result, completed.receipt.reply), true);
    assert.equal(capture(api.create(), completed), false);
});

test('missing subject and question slot stay null; utterance and delivered response remain distinct', () => {
    for (const speech of ['short', 'gesture']) for (let mask = 1; mask < 8; mask++) {
        const v = hear(missing(mask, speech)), buffer = api.create();
        assert.equal(capture(buffer, v), true);
        const c = buffer.read()[0].captured;
        assert.equal(c.understanding.subject, mask === 1 ? 'self' : null);
        assert.equal(c.understanding.questionSlot, mask === 1 ? 'reason' : null);
        assert.equal(c.response.message, speech === 'short' && [2, 4, 6].includes(mask) ? 'uncertain' : 'attend');
        assert.equal(Object.hasOwn(c, 'actualAnswer'), false);
        assert.equal(Object.hasOwn(c.response, 'experienceId'), false);
    }
});

test('later real learning and changed activities never rewrite early materials', () => {
    for (const speech of ['short', 'gesture']) {
        const v = setup({ foundation: false, life: false, speech }), early = hear(v), buffer = api.create();
        const source = JSON.stringify(early);
        assert.equal(capture(buffer, early), true);
        const original = JSON.stringify(buffer.read());
        require('../scripts/experimental/diary_known_reason_explanation_fixtures').prepareReason(v);
        const later = hear(v); assert.equal(later.result.understandings[0].complete, true);
        assert.equal(capture(api.create(), later), false);
        worldApi.approach(v.world, 'path');
        assert.equal(capture(buffer, early), false);
        const delayed = api.create(); assert.equal(capture(delayed, early), true);
        assert.equal(JSON.stringify(delayed.read()), original);
        assert.equal(JSON.stringify(early), source);
    }
    const v = missing(4), buffer = api.create();
    for (let i = 0; i < 13; i++) assert.equal(capture(buffer, hear(v)), true);
    assert.equal(buffer.read().length, 13);
    assert.equal(new Set(buffer.read().map(r => r.sourceId)).size, 13);
});

test('non-JSON, missing, cyclic and malformed journal inputs cannot partially retain', () => {
    for (const value of [null, {}, {kind: 'report'}, {kind: 'incomplete_reason_question', sourceId: 'input:0'}])
        assert.throws(() => api.create().retain(value));
    for (const malformed of [Infinity, undefined, () => {}, new Date(), Symbol('invalid')]) {
        const v = copy(values.find(f => f.expected).value); v.receipt.invalid = malformed;
        assert.equal(capture(api.create(), v), false);
    }
    const v = copy(values.find(f => f.expected).value); v.result.invalid = v.result;
    assert.equal(capture(api.create(), v), false);
});
