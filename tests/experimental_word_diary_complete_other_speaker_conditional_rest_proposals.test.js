'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const api = require('../experimental_word_diary_complete_other_speaker_conditional_rest_proposals');
const fixture = require('../scripts/experimental/diary_complete_other_speaker_conditional_rest_proposal_fixtures');
const candidates = require('../experimental_word_diary_candidates');
const { setup, hear, copy, raw, life, condition, core, worldApi } = fixture;
const values = fixture.fixtures(), accepted = values.filter(f => f.expected);
const capture = (buffer, value) => api.capture(buffer, value.result, value.receipt);
for (const group of new Set(values.map(f => f.group))) test(`complete other-speaker conditional rest: ${group}`, () => {
    for (const f of values.filter(f => f.group === group)) {
        const v = copy(f.value), source = JSON.stringify(v), b = api.create();
        assert.equal(capture(b, v), f.expected, JSON.stringify([group, v.result.input, v.result.understandings]));
        assert.equal(JSON.stringify(v), source); assert.equal(capture(b, v), false);
        assert.equal(b.read().length, Number(f.expected)); if (!f.expected) continue;
        const c = b.read()[0].captured, r = v.receipt, j = v.result.conditionJudgment;
        assert.equal(b.read()[0].kind, 'complete_other_speaker_conditional_rest_proposal');
        assert.deepEqual(c.sources.input, v.result.input); assert.deepEqual(c.sources.frame, v.result.interpretations[0]);
        assert.deepEqual(c.understanding, v.result.understandings[0]); assert.equal(c.understanding.conditionStatus, 'unknown');
        assert.equal(c.sources.frame.roles.proposer, 'player'); assert.equal(c.understanding.roles.proposer, c.actualSpeaker);
        assert.equal(c.actualSpeaker, v.result.input.speaker); assert.equal(c.conditionJudgmentRecorded, true);
        assert.deepEqual(c.conditionJudgment, j); assert.deepEqual(c.observation, j.observation);
        assert.deepEqual(c.conditionJudgment, r.afterState.context.turns.at(-1).conditionJudgment);
        assert.deepEqual(c.expression, v.result.expression); assert.deepEqual(c.response, r.reply);
        assert.equal(c.actualSpeech, v.result.expression.channel === 'speech' && !r.reply.observation);
        assert.equal(c.observationResponse, !!r.reply.observation); assert.equal(c.speechSetting, r.beforeState.settings.speech);
        assert.equal(c.answerRecorded, false); assert.equal(c.turnAnswer, null);
        assert.equal(c.actionDecisionRecorded, false); assert.equal(c.compliance, null); assert.equal(c.actualParticipation, false);
        for (const name of ['desire', 'refusal', 'completedExperience']) assert.equal(c[name], null);
        for (const name of ['newTeaching', 'newLearning', 'newExperience']) assert.equal(c[name], false);
        assert.deepEqual(c.sources.state, { before: r.beforeState, after: r.afterState });
        assert.deepEqual(c.sources.activity, { before: r.beforeWorld, after: r.afterWorld });
        assert.deepEqual(c.inputKnowledge, r.inputKnowledge); assert.deepEqual(c.inputContext, r.inputContext);
        assert.deepEqual(c.meaningBasis.map(x => x.id), ['rest', 'tired']);
        assert.deepEqual(c.relationBasis.map(x => x.id), ['request', 'condition']);
        const saved = JSON.stringify(b.read()); b.read()[0].captured.conditionJudgment.status = 'invented';
        v.result.input.raw = 'edited'; r.inputKnowledge.meanings = []; assert.equal(JSON.stringify(b.read()), saved);
    }
});
test('observed threshold judgments and absent sensations remain separate from understanding', () => {
    const statuses = new Set(), unobserved = [];
    for (const f of accepted) {
        const j = f.value.result.conditionJudgment, r = f.value.receipt;
        if (j.observation) {
            assert.equal(j.status, j.observation.fatigue >= .55 ? 'met' : j.observation.fatigue <= .25 ? 'unmet' : 'unknown');
            assert.equal(j.observation.source, 'self_sensation'); assert.equal(j.observation.subject, 'self');
            assert.equal(j.observation.activity, 'rest'); assert.equal(j.observation.target, 'shade');
            assert.equal(j.observation.fatigue, r.beforeWorld.fatigue); statuses.add(j.status);
        } else { assert.equal(j.status, 'unknown'); unobserved.push(f); }
        assert.equal(r.reply.message, r.beforeState.settings.speech === 'short' ? 'condition_' + j.status : 'attend');
    }
    assert.deepEqual([...statuses].sort(), ['met', 'unknown', 'unmet']); assert.ok(unobserved.length >= 42);
});
const edits = [
    v => { v.result.input.raw += ':unrelated'; }, v => { v.result.input.id = 'input:0'; },
    v => { v.result.input.locale = 'invalid'; }, v => { v.result.input.speaker = 'player'; },
    v => { v.result.input.at++; }, v => { v.result.input.scene += ':changed'; },
    v => { v.result.interpretations[0].kind = 'request'; }, v => { v.result.interpretations[0].subject = 'visitor'; },
    v => { v.result.interpretations[0].roles.proposer = 'visitor'; }, v => { v.result.interpretations[0].conditionMeaning = 'hungry'; },
    v => { v.result.interpretations[0].application = 'always'; }, v => { v.result.interpretations[0].duration = 'forever'; },
    v => { v.result.understandings[0].complete = false; }, v => { v.result.understandings[0].unresolved.push({ type: 'relation', id: 'condition' }); },
    v => { v.result.understandings[0].roles.proposer = 'player'; }, v => { v.result.understandings[0].roles.actualParticipation = true; },
    v => { v.result.understandings[0].subject = 'visitor'; }, v => { v.result.understandings[0].conditionStatus = 'met'; },
    v => { v.result.understandings[0].known.meaning = 'eat'; }, v => { v.result.understandings[0].relations = ['request']; },
    v => { v.result.expression.message = 'invented'; }, v => { v.result.expression.channel = 'invented'; },
    v => { v.result.conditionJudgment.status = v.result.conditionJudgment.status === 'met' ? 'unmet' : 'met'; },
    v => { delete v.result.conditionJudgment; }, v => { v.result.conditionJudgment.speaker = 'player'; },
    v => { v.result.conditionJudgment.inputId = 'input:999'; }, v => { v.result.conditionJudgment.at++; },
    v => { v.result.conditionJudgment.observation = { source: 'invented' }; },
    v => { v.receipt.input.raw += ':changed'; }, v => { v.receipt.inputKnowledge.meanings = []; },
    v => { v.receipt.inputContext.scene += ':changed'; }, v => { v.receipt.beforeState.serial++; },
    v => { v.receipt.beforeWorld.fatigue += .01; }, v => { v.receipt.reply.message = 'invented'; },
    v => { v.receipt.afterState.knowledge.meanings.push({ id: 'invented', source: 'initial' }); },
    v => { v.receipt.afterWorld.elapsed++; }, v => { v.receipt.afterWorld.experiences.push({ id: 999, kind: 'rest' }); },
    v => { v.receipt.afterState.context.turns.at(-1).answer = { response: { message: 'join' } }; },
    v => { v.receipt.afterState.context.turns.at(-1).conditionJudgment.status = 'invented'; },
    v => { v.result.interpretations.push(copy(v.result.interpretations[0])); },
    v => { v.result.relationLearning = { relationAcquired: true }; },
    v => { delete v.receipt.beforeState; }, v => { delete v.receipt.afterWorld; }
];
test('tampered roles, judgments, sensations, responses and evidence reject without retention', () => {
    for (const f of accepted) for (const edit of edits) {
        const v = copy(f.value), b = api.create(); edit(v);
        assert.equal(capture(b, v), false, JSON.stringify([f.group, edits.indexOf(edit)])); assert.deepEqual(b.read(), []);
    }
    console.log(JSON.stringify({ groups: new Set(values.map(f => f.group)).size, originals: values.length,
        accepted: accepted.length, mutations: edits.length, rejectedMutations: accepted.length * edits.length }));
});
test('existing owners preserve their boundaries with canonical argument counts', () => {
    const owners = require('../scripts/experimental/diary_audit').supplementalInventory().filter(r => r.id !== '4d12cz');
    assert.equal(owners.length, 87);
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
test('later actual meaning learning never retroactively completes the early hearing', () => {
    for (const speech of ['short', 'gesture']) {
        const v = setup({ life: false, speech }), early = hear(v, raw(), { speaker: 'visitor' }), source = JSON.stringify(early);
        assert.equal(early.result.understandings[0].complete, false); assert.equal(capture(api.create(), early), false);
        condition.condition.prepare(v, 'ja'); const later = hear(v, raw(), { speaker: 'visitor' });
        assert.equal(later.result.understandings[0].complete, true); assert.equal(capture(api.create(), later), true);
        assert.equal(capture(api.create(), early), false); assert.equal(JSON.stringify(early), source);
    }
});
test('later sensation, completed activity and new inputs cannot replace an original judgment', () => {
    for (const speech of ['short', 'gesture']) {
        const v = setup({ speech }), old = hear(v, raw(), { speaker: 'visitor' }), b = api.create();
        assert.equal(capture(b, old), true); const saved = JSON.stringify(b.read()), source = JSON.stringify(old);
        v.world.fatigue = .4; v.world.elapsed += .1;
        const middle = hear(v, raw(), { speaker: 'visitor' }); assert.equal(capture(b, middle), true);
        assert.equal(middle.result.conditionJudgment.status, 'unknown'); assert.ok(middle.result.conditionJudgment.observation);
        life.finish(v); worldApi.approach(v.world, 'path');
        const later = hear(v, raw(), { speaker: 'visitor' }); assert.equal(capture(b, later), true);
        assert.equal(later.result.conditionJudgment.observation, null); assert.equal(capture(b, old), false);
        const delayed = api.create(); assert.equal(capture(delayed, old), true); assert.equal(JSON.stringify(delayed.read()), saved);
        assert.equal(JSON.stringify(b.read()[0]), JSON.stringify(JSON.parse(saved)[0])); assert.equal(JSON.stringify(old), source);
        assert.equal(new Set(b.read().map(r => r.sourceId)).size, 3);
        condition.learn(v, 'ja'); assert.equal(capture(delayed, old), false); assert.equal(JSON.stringify(delayed.read()), saved);
    }
});
test('missing, duplicate and inconsistent original experience or selection evidence rejects', () => {
    const receipt = values.find(f => f.group === 'original-experience-observation').value.receipt;
    for (const edit of [v => { v.world.experiences = []; },
        v => { v.world.experiences.push(copy(v.world.experiences.at(-1))); }, v => { v.world.experiences.at(-1).end++; }]) {
        const v = { state: copy(receipt.beforeState), world: copy(receipt.beforeWorld) }; edit(v);
        assert.equal(capture(api.create(), hear(v, raw(), { speaker: 'visitor' })), false);
    }
    const v = setup(); hear(v, '休んでね'); v.state.selectionSources.push(copy(v.state.selectionSources[0]));
    assert.equal(capture(api.create(), hear(v, raw(), { speaker: 'visitor' })), false);
    for (const field of ['meanings', 'relations']) {
        const v = setup(), id = field === 'meanings' ? 'rest' : 'request';
        v.state.knowledge[field].push(copy(v.state.knowledge[field].find(item => item.id === id)));
        assert.equal(capture(api.create(), hear(v, raw(), { speaker: 'visitor' })), false);
    }
});
test('non-JSON and malformed material cannot partially retain', () => {
    for (const bad of [null, {}, undefined, NaN, () => {}, new Date()]) assert.equal(api.capture(api.create(), bad, bad), false);
    const v = copy(accepted[0].value); v.receipt.loop = v.receipt; assert.equal(capture(api.create(), v), false);
    for (const bad of [null, {}, { kind: 'proposal' }, { kind: 'complete_other_speaker_conditional_rest_proposal', sourceId: 'input:0' }])
        assert.throws(() => api.create().retain(bad), TypeError);
});
