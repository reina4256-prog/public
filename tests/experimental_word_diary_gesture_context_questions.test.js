'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const api = require('../experimental_word_diary_gesture_context_questions');
const candidates = require('../experimental_word_diary_candidates');
const oldQuestions = require('../experimental_word_diary_questions');
const { fixtures, setup, hear } = require('../scripts/experimental/diary_gesture_context_question_fixtures');
const copy = value => JSON.parse(JSON.stringify(value));
const { prepared, core, worldApi, catalog } = require('../scripts/experimental/diary_gesture_context_question_fixtures');
const values = fixtures();
const capture = (buffer, v) => api.capture(buffer, v.result, v.receipt);
for (const group of new Set(values.map(f => f.group))) test(`gesture context: ${group}`, () => {
    for (const f of values.filter(item => item.group === group)) {
        const v = copy(f.value), source = JSON.stringify(v), buffer = api.create();
        assert.equal(capture(buffer, v), f.expected, JSON.stringify([group, v.result.input, v.result.understandings]));
        assert.equal(JSON.stringify(v), source); assert.equal(buffer.read().length, Number(f.expected));
        assert.equal(capture(buffer, v), false);
        if (!f.expected) continue;
        const record = buffer.read()[0], u = v.result.understandings[0], retained = JSON.stringify(buffer.read());
        assert.equal(record.kind, 'gesture_context_question');
        assert.deepEqual(record.captured.understanding, u); assert.equal(u.complete, true);
        assert.equal(v.result.interpretations[0].slot, 'context_detail');
        assert.deepEqual(record.captured.sources.originalOutput, v.receipt.beforeState.context.lastOutput);
        assert.equal(Object.hasOwn(u, 'reportSource'), false);
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
    v => { v.result.understandings[0].complete = false; },
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
    v => { v.result.understandings[0].unresolved = [{ type: 'meaning', token: 'invented' }]; },
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
    console.log(JSON.stringify({ cl: { original: values.length, accepted: values.filter(f => f.expected).length,
        editKinds: edits.length, rejected, groups: Object.fromEntries([...new Set(values.map(f => f.group))]
            .map(group => [group, [values.filter(f => f.group === group).length, values.filter(f => f.group === group && f.expected).length]])) } }));
});

test('cl preserves all 48 prior supplemental owners and complete context responses', () => {
    const owners = require('../scripts/experimental/diary_audit').supplementalInventory().slice(0, 48);
    assert.equal(owners.length, 48);
    for (const f of values.filter(item => item.expected)) for (const owner of owners) {
        const v = copy(f.value), source = JSON.stringify(v);
        assert.equal(require('../' + owner.file).capture(candidates.create(), v.result, v.receipt), false, owner.id);
        assert.equal(JSON.stringify(v), source);
    }
    for (const speech of ['short']) {
        const completed = hear(prepared(0, speech), '甘いの？');
        assert.equal(completed.result.understandings[0].complete, true);
        assert.equal(capture(api.create(), completed), false);
    }
});

test('original output and unique original experience are required independently of replay', () => {
    const original = values.find(f => f.expected && f.value.receipt.beforeState.context.lastOutput.evidence.experienceId !== null).value;
    const edits = [
        v => { delete v.receipt.beforeState.context.lastOutput; },
        v => { v.receipt.beforeState.context.lastOutput.listener = 'other'; },
        v => { v.receipt.beforeState.context.lastOutput.serial++; },
        v => { v.result.interpretations[0].contextReference.source.kind = 'speech'; },
        v => { v.result.understandings[0].contextReference.evidence.activity.target = 'invented'; },
        v => { v.receipt.beforeWorld.experiences = []; },
        v => { v.receipt.beforeWorld.experiences.push(copy(v.receipt.beforeWorld.experiences.at(-1))); },
        v => { v.receipt.beforeWorld.experiences.at(-1).target = 'invented'; }
    ];
    for (const edit of edits) {
        const v = copy(original); edit(v); assert.notEqual(JSON.stringify(v), JSON.stringify(original));
        assert.equal(capture(api.create(), v), false);
    }
});

test('complete understanding and gesture response remain distinct from an answer', () => {
    const v = hear(prepared(0, 'gesture'), '甘いの？'), buffer = api.create();
    assert.equal(capture(buffer, v), true);
    const c = buffer.read()[0].captured;
    assert.equal(c.understanding.complete, true); assert.deepEqual(c.understanding.unresolved, []);
    assert.equal(c.expression.channel, 'gesture'); assert.equal(c.response.message, 'attend');
    assert.equal(c.actualSpeech, false); assert.equal(c.turnAnswer, null);
    assert.equal(c.sources.originalOutput.source.kind, 'observation');
    assert.equal(Object.hasOwn(c, 'actualAnswer'), false);
});

test('real later learning and activity changes cannot rewrite early or delayed evidence', () => {
    const v = prepared(0, 'gesture'), early = hear(v, '甘いの？'), buffer = api.create();
    const source = JSON.stringify(early); assert.equal(capture(buffer, early), true);
    const original = JSON.stringify(buffer.read());
    require('../scripts/experimental/diary_known_reason_explanation_fixtures').prepareReason(v);
    worldApi.approach(v.world, 'path');
    assert.equal(capture(buffer, early), false);
    const delayed = api.create(); assert.equal(capture(delayed, early), true);
    assert.equal(JSON.stringify(delayed.read()), original); assert.equal(JSON.stringify(early), source);
    const active = prepared(0, 'gesture'), many = api.create();
    const follow = require('../scripts/experimental/diary_followup_fixtures');
    for (let i = 0; i < 13; i++) {
        follow.start(active, 'eat'); follow.finish(active);
        assert.equal(capture(many, hear(active, '甘いの？')), true);
    }
    assert.equal(many.read().length, 13); assert.equal(new Set(many.read().map(r => r.sourceId)).size, 13);
});

test('non-JSON, missing and cyclic materials cannot partially retain', () => {
    for (const value of [null, {}, { kind: 'report' }, { kind: 'gesture_context_question', sourceId: 'input:0' }])
        assert.throws(() => api.create().retain(value));
    for (const malformed of [Infinity, undefined, () => {}, new Date(), Symbol('invalid')]) {
        const v = copy(values.find(f => f.expected).value); v.receipt.invalid = malformed;
        assert.equal(capture(api.create(), v), false);
    }
    const v = copy(values.find(f => f.expected).value); v.result.invalid = v.result;
    assert.equal(capture(api.create(), v), false);
});
