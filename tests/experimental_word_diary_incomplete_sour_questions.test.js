'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const api = require('../experimental_word_diary_incomplete_sour_questions');
const be = require('../experimental_word_diary_sour_questions');
const candidates = require('../experimental_word_diary_candidates');
const { fixtures, make, setup, hear, eat } = require('../scripts/experimental/diary_incomplete_sour_question_fixtures');
const copy = value => JSON.parse(JSON.stringify(value));
const values = fixtures();
const capture = (buffer, v) => api.capture(buffer, v.result, v.receipt);
for (const group of new Set(values.map(f => f.group))) test(`incomplete sour question: ${group}`, () => {
    for (const f of values.filter(item => item.group === group)) {
        const v = copy(f.value), source = JSON.stringify(v), buffer = api.create();
        assert.equal(capture(buffer, v), f.expected, JSON.stringify([group, v.result.input]));
        assert.equal(JSON.stringify(v), source); assert.equal(buffer.read().length, Number(f.expected));
        assert.equal(capture(buffer, v), false);
        if (!f.expected) continue;
        const record = buffer.read()[0], u = v.result.understandings[0], retained = JSON.stringify(buffer.read());
        assert.equal(record.kind, 'incomplete_sour_question');
        assert.deepEqual(record.captured.understanding, u);
        assert.equal(u.complete, false); assert.equal(u.target, null);
        assert.ok(u.unresolved.some(e => e.type === 'detail' && e.token === 'sour'));
        const missingRelations = u.unresolved.filter(e => e.type === 'relation').map(e => e.id);
        assert.deepEqual(record.captured.missingRelationsBefore, missingRelations);
        assert.deepEqual(record.captured.missingMeaningsBefore, u.known.meaning === 'eat' ? [] : ['eat']);
        assert.equal(u.kind, missingRelations.length ? 'partial' : 'question');
        assert.equal(u.subject, missingRelations.length ? null : 'self');
        assert.equal(u.questionSlot, missingRelations.length ? null : 'sour_evaluation');
        assert.equal(u.polarity, missingRelations.includes('negation') ? 'unknown' : 'positive');
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
        assert.equal(be.capture(be.create(), v.result, v.receipt), false);
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
    v => { v.result.understandings[0].aspect = 'activity_report'; },
    v => { v.result.understandings[0].polarity = 'negative'; },
    v => { v.result.understandings[0].eventTime = 'past'; },
    v => { v.result.understandings[0].known.meaning = 'berry'; },
    v => { v.receipt.beforeWorld.attention = 'berry:tampered'; },
    v => { v.receipt.afterWorld.experiences.push({ id: 'invented' }); },
    v => { v.result.understandings[0].unresolved = []; },
    v => { v.result.interpretations[0].catalogRule = 'name_question'; },
    v => { v.result.interpretations[0].slot = 'attention'; },
    v => { v.result.understandings[0].conditionStatus = 'met'; },
    v => { v.result.understandings[0].questionSlot = 'name'; },
    v => { v.result.understandings[0].reportSource = { kind: 'speaker_report' }; },
    v => { v.receipt.afterState.context.turns.at(-1).answer = { slot: 'sour_evaluation' }; },
    v => { v.result.understandings[0].target = { candidates: [], adopted: null }; }
];
test('incomplete sour question rejects changed originals and independent receipt fields', () => {
    let rejected = 0;
    for (const f of values.filter(item => item.expected)) for (const edit of edits) {
        const v = copy(f.value); edit(v); assert.notEqual(JSON.stringify(v), JSON.stringify(f.value));
        assert.equal(capture(api.create(), v), false, `${f.group}: ${edit}`); rejected++;
    }
    console.log(JSON.stringify({ cb: { original: values.length, accepted: values.filter(f => f.expected).length,
        editKinds: edits.length, rejected, groups: Object.fromEntries([...new Set(values.map(f => f.group))]
            .map(group => [group, [values.filter(f => f.group === group).length, values.filter(f => f.group === group && f.expected).length]])) } }));
});
test('cb stays separate from all 38 previous supplemental owners', () => {
    const owners = require('../scripts/experimental/diary_audit').supplementalInventory().slice(0, 38);
    assert.equal(owners.length, 38);
    for (const f of values.filter(item => item.expected)) for (const owner of owners) {
        const v = copy(f.value), source = JSON.stringify(v);
        assert.equal(require('../' + owner.file).capture(candidates.create(), v.result, v.receipt), false, owner.id);
        assert.equal(JSON.stringify(v), source);
    }
});
test('all be accepted originals retain their existing owner', () => {
    for (const f of require('../scripts/experimental/diary_sour_question_fixtures').fixtures().filter(f => f.expected)) {
        assert.equal(capture(api.create(), f.value), false);
        assert.equal(be.capture(be.create(), f.value.result, f.value.receipt), true);
    }
});
test('later knowledge and actual completed meals never rewrite an earlier incomplete question', () => {
    for (const mask of [1, 2, 4, 7]) {
        const v = make(mask), buffer = api.create(), early = hear(v), source = JSON.stringify(early);
        assert.equal(capture(buffer, early), true); const retained = JSON.stringify(buffer.read());
        for (let i = 0; i < 12; i++) assert.equal(capture(buffer, hear(v)), true);
        assert.equal(buffer.read().length, 13); assert.equal(new Set(buffer.read().map(e => e.sourceId)).size, 13);
        v.state.knowledge = copy(setup().state.knowledge); eat(v);
        const later = hear(v); assert.equal(capture(api.create(), later), false);
        assert.equal(be.capture(be.create(), later.result, later.receipt), true);
        assert.equal(capture(buffer, early), false);
        const delayed = api.create(); assert.equal(capture(delayed, early), true);
        assert.equal(JSON.stringify(delayed.read()), retained); assert.equal(JSON.stringify(early), source);
        delayed.read()[0].captured.inputKnowledge.meanings = []; early.receipt.beforeState.serial++;
        assert.equal(JSON.stringify(delayed.read()), retained);
    }
});
test('journal and capture reject malformed, non-JSON and cyclic data without partial retention', () => {
    for (const value of [null, {}, {kind: 'report'}, {kind: 'incomplete_sour_question', sourceId: 'input:0'}])
        assert.throws(() => api.create().retain(value));
    for (const malformed of [Infinity, undefined, () => {}, new Date(), Symbol('invalid')]) {
        const v = copy(values.find(f => f.expected).value); v.receipt.invalid = malformed;
        assert.equal(capture(api.create(), v), false);
    }
    const v = copy(values.find(f => f.expected).value); v.result.invalid = v.result;
    assert.equal(capture(api.create(), v), false);
});
