'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const api = require('../experimental_word_diary_work_observation_questions');
const fixture = require('../scripts/experimental/diary_work_observation_question_fixtures');
const candidates = require('../experimental_word_diary_candidates');
const { fixtures, working, finishWork, forms, setup, hear, copy } = fixture;
const values = fixtures(), accepted = values.filter(f => f.expected);
const capture = (b, v) => api.capture(b, v.result, v.receipt);
for (const group of new Set(values.map(f => f.group))) test(`work observation question: ${group}`, () => {
    for (const f of values.filter(f => f.group === group)) {
        const v = copy(f.value), original = JSON.stringify(v), b = api.create();
        assert.equal(capture(b, v), f.expected, JSON.stringify([group, v.result.input, v.result.understandings]));
        assert.equal(JSON.stringify(v), original); assert.equal(capture(b, v), false);
        assert.equal(b.read().length, Number(f.expected)); if (!f.expected) continue;
        const c = b.read()[0].captured, r = v.receipt;
        assert.equal(b.read()[0].kind, 'work_observation_question'); assert.equal(b.read()[0].sourceId, v.result.input.id);
        assert.deepEqual(c.understanding, v.result.understandings[0]); assert.deepEqual(c.expression, v.result.expression);
        assert.deepEqual(c.response, { message: 'work', observation: true });
        assert.equal(c.actualSpeech, false); assert.equal(c.observationResponse, true);
        assert.equal(c.answerRecorded, false); assert.equal(c.turnAnswer, null);
        for (const field of ['newTeaching', 'newLearning', 'newExperience']) assert.equal(c[field], false);
        assert.deepEqual(c.sources.state, { before: r.beforeState, after: r.afterState });
        assert.deepEqual(c.sources.activity, { before: r.beforeWorld, after: r.afterWorld });
        assert.deepEqual(c.sources.frame, v.result.interpretations[0]);
        assert.deepEqual(c.inputKnowledge, r.inputKnowledge); assert.deepEqual(c.inputContext, r.inputContext);
        const saved = JSON.stringify(b.read()); b.read()[0].captured.sources.input.raw = 'edited';
        v.result.input.raw = 'edited'; r.inputKnowledge.meanings = [];
        assert.equal(JSON.stringify(b.read()), saved);
    }
});
const edits = [
    v => { v.result.input.raw = 'unrelated'; }, v => { v.result.input.id = 'input:0'; },
    v => { v.result.input.locale = 'other'; }, v => { v.result.input.speaker += ':tampered'; },
    v => { v.result.input.at++; }, v => { v.result.input.scene += ':other'; },
    v => { v.result.interpretations[0].slot = 'work_current'; }, v => { v.result.interpretations[0].kind = 'report'; },
    v => { v.result.interpretations[0].subject = 'player'; }, v => { v.result.interpretations[0].time = 'past'; },
    v => { v.result.understandings[0].complete = false; }, v => { v.result.understandings[0].unresolved = [{ type: 'relation', id: 'question' }]; },
    v => { v.result.understandings[0].subject = 'player'; }, v => { v.result.understandings[0].eventTime = 'past'; },
    v => { v.result.understandings[0].polarity = 'negative'; }, v => { v.result.understandings[0].questionSlot = 'work_current'; },
    v => { v.result.expression.message = 'work'; }, v => { v.result.expression.channel = 'speech'; },
    v => { v.receipt.input.raw += ':changed'; }, v => { v.receipt.inputKnowledge.meanings.push({ id: 'invented', source: 'initial' }); },
    v => { v.receipt.inputContext.scene += ':changed'; }, v => { v.receipt.beforeState.serial++; },
    v => { v.receipt.beforeWorld.elapsed++; }, v => { v.receipt.beforeWorld.mode = 'idle'; },
    v => { v.receipt.reply.message = 'answer_unknown'; }, v => { delete v.receipt.reply.observation; },
    v => { v.receipt.afterState.knowledge.meanings.push({ id: 'invented', source: 'initial' }); },
    v => { v.receipt.afterWorld.elapsed++; }, v => { v.receipt.afterWorld.experiences.push({ id: 999, kind: 'rest' }); },
    v => { v.receipt.afterState.context.turns.at(-1).answer = { response: { message: 'work' } }; },
    v => { v.result.interpretations.push(copy(v.result.interpretations[0])); }, v => { v.result.relationLearning = { relationAcquired: true }; },
    v => { v.result.understandings[0].eventReference = { experienceId: 1 }; },
    v => { delete v.receipt.beforeState; }, v => { delete v.receipt.afterWorld; }
];
test('tampered comprehension, observation, answer, origin and snapshots never retain', () => {
    for (const f of accepted) for (const edit of edits) {
        const v = copy(f.value), b = api.create(); edit(v);
        assert.equal(capture(b, v), false, JSON.stringify([f.group, edits.indexOf(edit)])); assert.deepEqual(b.read(), []);
    }
    console.log(JSON.stringify({ groups: new Set(values.map(f => f.group)).size, originals: values.length,
        accepted: accepted.length, mutations: edits.length, rejectedMutations: accepted.length * edits.length }));
});
test('existing owners keep self-answers, gestures, unknown answers, proposals and reports separate', () => {
    const owners = require('../scripts/experimental/diary_audit').supplementalInventory().filter(r => r.id !== '4d12cw');
    for (const f of accepted) {
        const v = f.value, r = v.receipt, w = r.beforeWorld;
        for (const owner of owners) {
            const old = require('../' + owner.file), b = old.create ? old.create() : candidates.create();
            assert.equal(old.capture(b, copy(v.result), copy(r)), false, owner.id);
        }
        const context = { scene: r.beforeState.context.scene, attention: r.beforeState.context.attention,
            mode: w.mode, target: w.attention, activityStart: w.activityStart, elapsed: w.elapsed, fatigue: w.fatigue, activityBefore: w.activityBefore ?? null };
        for (const name of ['reports', 'negation_reports', 'time_reports', 'remaining_time_reports', 'condition_proposals', 'sequence_proposals'])
            assert.equal(require('../experimental_word_diary_' + name).capture(candidates.create(), copy(v.result), copy(context), copy(r.inputKnowledge)), false);
        const decision = { speech: r.beforeState.settings.speech, before: w, after: r.afterWorld,
            beforeSelections: r.beforeState.selectionSources || [], afterSelections: r.afterState.selectionSources || [], response: r.reply };
        assert.equal(require('../experimental_word_diary_proposals').capture(candidates.create(), copy(v.result), copy(context), copy(r.inputKnowledge), copy(decision)), false);
        assert.equal(require('../experimental_word_diary_questions').capture(candidates.create(), copy(v.result), copy(r.reply)), false);
        assert.equal(require('../experimental_word_diary_work').capture(candidates.create(), null, copy(r.inputKnowledge), copy(r.inputKnowledge)), false);
    }
    console.log(JSON.stringify({ priorOwners: owners.length, calls: owners.length * accepted.length }));
});
test('same input stays immutable after actual completion, learning and a new work start', () => {
    const v = working(), original = hear(v, forms.ja), b = api.create();
    const source = JSON.stringify(original); assert.equal(capture(b, original), true); const saved = JSON.stringify(b.read());
    finishWork(v); working('farming', {}, v);
    assert.equal(capture(b, original), false); assert.equal(JSON.stringify(b.read()), saved); assert.equal(JSON.stringify(original), source);
    const delayed = api.create(); assert.equal(capture(delayed, original), true); assert.equal(JSON.stringify(delayed.read()), saved);
    for (let i = 0; i < 3; i++) assert.equal(capture(b, hear(v, forms.ja)), true);
    assert.equal(new Set(b.read().map(r => r.sourceId)).size, 4);
    const early = hear(working('farming', { foundation: false }), forms.ja);
    assert.equal(capture(api.create(), early), false); assert.equal(early.result.understandings[0].complete, false);
});
test('missing, duplicated or inconsistent original experience evidence rejects matching replays', () => {
    const r = values.find(f => f.group === 'retained-original-experience-display' && f.expected).value.receipt;
    for (const edit of [v => { v.world.experiences = []; },
        v => { v.world.experiences.push(copy(v.world.experiences.at(-1))); },
        v => { v.world.experiences.at(-1).end++; }]) {
        const v = { state: copy(r.beforeState), world: copy(r.beforeWorld) }; edit(v);
        assert.equal(capture(api.create(), hear(v, forms.ja)), false);
    }
});
test('non-data and malformed journal material cannot partially retain', () => {
    for (const bad of [null, {}, undefined, NaN, () => {}, new Date()]) assert.equal(api.capture(api.create(), bad, bad), false);
    const v = copy(accepted[0].value); v.receipt.loop = v.receipt; assert.equal(capture(api.create(), v), false);
    for (const bad of [null, {}, { kind: 'question' }, { kind: 'work_observation_question', sourceId: 'input:0' }])
        assert.throws(() => api.create().retain(bad), TypeError);
});
