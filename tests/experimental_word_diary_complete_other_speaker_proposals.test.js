'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const api = require('../experimental_word_diary_complete_other_speaker_proposals');
const fixture = require('../scripts/experimental/diary_complete_other_speaker_proposal_fixtures');
const candidates = require('../experimental_word_diary_candidates');
const { fixtures, setup, hear, prepared, copy, life } = fixture;
const values = fixtures(), accepted = values.filter(f => f.expected);
const capture = (b, v) => api.capture(b, v.result, v.receipt);
for (const group of new Set(values.map(f => f.group))) test(`complete other-speaker proposal: ${group}`, () => {
    for (const f of values.filter(f => f.group === group)) {
        const v = copy(f.value), source = JSON.stringify(v), b = api.create();
        assert.equal(capture(b, v), f.expected, JSON.stringify([group, v.result.input, v.result.understandings]));
        assert.equal(JSON.stringify(v), source); assert.equal(capture(b, v), false);
        assert.equal(b.read().length, Number(f.expected)); if (!f.expected) continue;
        const record = b.read()[0], c = record.captured, r = v.receipt;
        assert.equal(record.kind, 'complete_other_speaker_proposal'); assert.equal(record.sourceId, v.result.input.id);
        assert.deepEqual(c.sources.input, v.result.input); assert.deepEqual(c.sources.frame, v.result.interpretations[0]);
        assert.deepEqual(c.understanding, v.result.understandings[0]); assert.deepEqual(c.expression, v.result.expression);
        assert.deepEqual(c.response, r.reply); assert.equal(c.actualSpeaker, v.result.input.speaker);
        assert.equal(c.actualSpeech, v.result.expression.channel === 'speech' && !r.reply.observation);
        assert.equal(c.observationResponse, !!r.reply.observation); assert.equal(c.answerRecorded, false); assert.equal(c.turnAnswer, null);
        assert.equal(c.actualParticipation, false); for (const name of ['desire', 'refusal', 'completedExperience']) assert.equal(c[name], null);
        for (const name of ['newTeaching', 'newLearning', 'newExperience']) assert.equal(c[name], false);
        assert.deepEqual(c.sources.state, { before: r.beforeState, after: r.afterState });
        assert.deepEqual(c.sources.activity, { before: r.beforeWorld, after: r.afterWorld });
        assert.deepEqual(c.inputKnowledge, r.inputKnowledge); assert.deepEqual(c.inputContext, r.inputContext);
        assert.equal(c.decision.selectedSource !== null, c.decision.outcome === 'approaching' && c.understanding.known.meaning === 'rest');
        const saved = JSON.stringify(b.read()); b.read()[0].captured.sources.input.raw = 'edited';
        v.result.input.raw = 'edited'; r.inputKnowledge.meanings = []; assert.equal(JSON.stringify(b.read()), saved);
    }
});
const edits = [
    v => { v.result.input.raw = 'unrelated'; }, v => { v.result.input.id = 'input:0'; },
    v => { v.result.input.locale = 'other'; }, v => { v.result.input.speaker = 'player'; },
    v => { v.result.input.at++; }, v => { v.result.input.scene += ':other'; },
    v => { v.result.interpretations[0].kind = 'report'; }, v => { v.result.interpretations[0].meaning = 'eat'; },
    v => { v.result.interpretations[0].conditionMeaning = 'tired'; }, v => { v.result.interpretations[0].roles = { proposer: 'visitor' }; },
    v => { v.result.understandings[0].complete = false; }, v => { v.result.understandings[0].unresolved = [{ type: 'relation', id: 'request' }]; },
    v => { v.result.understandings[0].subject = 'invented'; }, v => { v.result.understandings[0].eventTime = 'past'; },
    v => { v.result.understandings[0].polarity = 'negative'; }, v => { v.result.understandings[0].roles = { actualParticipation: true }; },
    v => { v.result.expression.message = 'invented'; }, v => { v.result.expression.channel = 'invented'; },
    v => { v.receipt.input.raw += ':changed'; }, v => { v.receipt.inputKnowledge.meanings.push({ id: 'invented', source: 'initial' }); },
    v => { v.receipt.inputContext.scene += ':changed'; }, v => { v.receipt.beforeState.serial++; },
    v => { v.receipt.beforeWorld.elapsed++; }, v => { v.receipt.reply.message = 'invented'; },
    v => { v.receipt.afterState.knowledge.meanings.push({ id: 'invented', source: 'initial' }); },
    v => { v.receipt.afterWorld.elapsed++; }, v => { v.receipt.afterWorld.experiences.push({ id: 999, kind: 'rest' }); },
    v => { v.receipt.afterState.context.turns.at(-1).answer = { response: { message: 'join' } }; },
    v => { v.result.interpretations.push(copy(v.result.interpretations[0])); }, v => { v.result.relationLearning = { relationAcquired: true }; },
    v => { delete v.receipt.beforeState; }, v => { delete v.receipt.afterWorld; }
];
test('conflicting actor, comprehension, decisions and original receipts reject without retention', () => {
    for (const f of accepted) for (const edit of edits) {
        const v = copy(f.value), b = api.create(); edit(v);
        assert.equal(capture(b, v), false, JSON.stringify([f.group, edits.indexOf(edit)])); assert.deepEqual(b.read(), []);
    }
    console.log(JSON.stringify({ groups: new Set(values.map(f => f.group)).size, originals: values.length,
        accepted: accepted.length, mutations: edits.length, rejectedMutations: accepted.length * edits.length }));
});
test('the original fixed player roles and absent generic roles remain separate from the real speaker', () => {
    const a = api.create(); assert.equal(capture(a, hear(setup(), fixture.catalog.proposalTeaching.ja.invitation.utterance, { speaker: 'visitor' })), true);
    const c = a.read()[0].captured; assert.equal(c.actualSpeaker, 'visitor'); assert.equal(c.sources.frame.roles.proposer, 'player');
    assert.deepEqual(c.sources.frame.roles.actors, ['player', 'self']); assert.equal(c.understanding.roles.actualParticipation, false);
    const b = api.create(); assert.equal(capture(b, hear(setup(), '一緒に散歩しよう', { speaker: 'neighbor:2' })), true);
    assert.equal(Object.hasOwn(b.read()[0].captured.sources.frame, 'roles'), false);
});
test('all three decisions stay distinct and no movement failure is a refusal', () => {
    const outcomes = new Set();
    for (const mode of ['rest', 'eat', 'work', 'berry-low', 'berry-high', 'no-target', 'no-route', 'moving-no-route']) {
        const b = api.create(); assert.equal(capture(b, hear(prepared(mode), '休んでね', { speaker: 'visitor' })), true);
        const c = b.read()[0].captured; outcomes.add(c.decision.outcome);
        assert.equal(c.refusal, null); if (mode === 'work') { assert.equal(c.actualSpeech, false); assert.equal(c.observationResponse, true); }
        if (mode === 'moving-no-route') assert.equal(c.decision.outcome, 'not_started');
    }
    assert.deepEqual([...outcomes].sort(), ['approaching', 'continuing', 'not_started']);
});
test('previous owners retain player proposals, incomplete proposals, questions and reports', () => {
    const owners = require('../scripts/experimental/diary_audit').supplementalInventory().filter(r => r.id !== '4d12cx');
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
    }
    console.log(JSON.stringify({ priorOwners: owners.length, calls: owners.length * accepted.length }));
});
test('later actual completion and learning do not alter early inputs or delayed copies', () => {
    const v = prepared('eat'), old = hear(v, '休んでね', { speaker: 'visitor' }), b = api.create();
    assert.equal(capture(b, old), true); const source = JSON.stringify(old), saved = JSON.stringify(b.read());
    life.finish(v); life.start(v, 'rest'); life.finish(v);
    assert.equal(capture(b, old), false); assert.equal(JSON.stringify(b.read()), saved); assert.equal(JSON.stringify(old), source);
    const delayed = api.create(); assert.equal(capture(delayed, old), true); assert.deepEqual(delayed.read(), b.read());
    for (let i = 0; i < 3; i++) assert.equal(capture(b, hear(v, '休んでね', { speaker: 'visitor' })), true);
    assert.equal(new Set(b.read().map(r => r.sourceId)).size, 4);
    const unknown = setup({ life: false }), early = hear(unknown, '休んでね', { speaker: 'visitor' });
    assert.equal(capture(api.create(), early), false); life.start(unknown, 'rest'); life.hear(unknown, '休む'); life.finish(unknown);
    assert.equal(capture(api.create(), hear(unknown, '休んでね', { speaker: 'visitor' })), true);
    assert.equal(capture(api.create(), early), false); assert.equal(early.result.understandings[0].complete, false);
});
test('original observation evidence and selection sources reject missing, duplicate and inconsistent data', () => {
    const r = values.find(f => f.group === 'original-experience-observation' && f.expected).value.receipt;
    for (const edit of [v => { v.world.experiences = []; },
        v => { v.world.experiences.push(copy(v.world.experiences.at(-1))); }, v => { v.world.experiences.at(-1).end++; }]) {
        const v = { state: copy(r.beforeState), world: copy(r.beforeWorld) }; edit(v);
        assert.equal(capture(api.create(), hear(v, '休んでね', { speaker: 'visitor' })), false);
    }
    const v = setup(); hear(v, '休んでね', { speaker: 'visitor' });
    v.state.selectionSources.push(copy(v.state.selectionSources[0]));
    assert.equal(capture(api.create(), hear(v, '散歩しよう', { speaker: 'visitor' })), false);
});
test('non-data and malformed journal material cannot partially retain', () => {
    for (const bad of [null, {}, undefined, NaN, () => {}, new Date()]) assert.equal(api.capture(api.create(), bad, bad), false);
    const v = copy(accepted[0].value); v.receipt.loop = v.receipt; assert.equal(capture(api.create(), v), false);
    for (const bad of [null, {}, { kind: 'proposal' }, { kind: 'complete_other_speaker_proposal', sourceId: 'input:0' }])
        assert.throws(() => api.create().retain(bad), TypeError);
});
