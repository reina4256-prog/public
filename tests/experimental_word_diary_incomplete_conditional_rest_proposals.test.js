'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const api = require('../experimental_word_diary_incomplete_conditional_rest_proposals');
const candidates = require('../experimental_word_diary_candidates');
const fixture = require('../scripts/experimental/diary_incomplete_conditional_rest_proposal_fixtures');
const { fixtures, prepared, setup, hear, core, worldApi, catalog, ordinary, life, condition, learn, raw, copy } = fixture;
const values = fixtures(), accepted = values.filter(f => f.expected);
const capture = (b, v) => api.capture(b, v.result, v.receipt);
for (const group of new Set(values.map(f => f.group))) test(`incomplete conditional rest proposal: ${group}`, () => {
    for (const f of values.filter(f => f.group === group)) {
        const v = copy(f.value), before = JSON.stringify(v), buffer = api.create();
        assert.equal(capture(buffer, v), f.expected, JSON.stringify([group, v.result.input, v.result.understandings]));
        assert.equal(JSON.stringify(v), before); assert.equal(capture(buffer, v), false);
        assert.equal(buffer.read().length, Number(f.expected));
        if (!f.expected) continue;
        const record = buffer.read()[0], c = record.captured, r = v.receipt, u = v.result.understandings[0];
        assert.equal(record.kind, 'incomplete_conditional_rest_proposal'); assert.equal(record.sourceId, v.result.input.id);
        assert.deepEqual(c.understanding, u); assert.equal(u.complete, false); assert.ok(u.unresolved.length);
        assert.deepEqual(c.expression, v.result.expression); assert.deepEqual(c.response, r.reply);
        assert.equal(c.actualSpeech, v.result.expression.channel === 'speech');
        assert.equal(c.answerRecorded, false); assert.equal(c.turnAnswer, null);
        assert.equal(c.compliance, null); assert.equal(c.actionDecisionRecorded, false);
        assert.equal(c.conditionJudgmentRecorded, false); assert.equal(c.conditionJudgment, null);
        assert.equal(v.result.conditionJudgment, undefined); assert.equal(r.afterState.context.turns.at(-1).conditionJudgment, undefined);
        assert.deepEqual(c.sources.state, { before: r.beforeState, after: r.afterState });
        assert.deepEqual(c.inputKnowledge, r.inputKnowledge); assert.deepEqual(c.inputContext, r.inputContext);
        assert.deepEqual(r.beforeWorld.experiences, r.afterWorld.experiences);
        assert.deepEqual(r.beforeState.selectionSources, r.afterState.selectionSources);
        assert.deepEqual(c.missingMeaningsBefore, u.unresolved.filter(x => x.type === 'meaning'));
        assert.deepEqual(c.missingRelationsBefore, u.unresolved.filter(x => x.type === 'relation').map(x => x.id));
        const saved = JSON.stringify(buffer.read()); buffer.read()[0].captured.sources.input.raw = 'edited';
        v.result.input.raw = 'edited'; r.inputKnowledge.meanings = [];
        assert.equal(JSON.stringify(buffer.read()), saved);
    }
});
const edits = [
    v => { v.result.input.raw = 'unrelated'; }, v => { v.result.input.id = 'input:0'; },
    v => { v.result.input.locale = 'other'; }, v => { v.result.input.speaker += ':tampered'; },
    v => { v.result.input.at++; }, v => { v.result.input.scene += ':other'; },
    v => { v.result.interpretations[0].meaning = 'walk'; }, v => { v.result.interpretations[0].kind = 'request_other'; },
    v => { v.result.interpretations[0].target = 'shade'; }, v => { v.result.interpretations[0].time = 'past'; },
    v => { v.result.interpretations[0].conditionMeaning = 'eat'; },
    v => { v.result.understandings[0].complete = true; }, v => { v.result.understandings[0].unresolved = []; },
    v => { v.result.understandings[0].known.meaning = 'rest'; v.result.understandings[0].unresolved = []; },
    v => { v.result.understandings[0].subject = 'invented'; }, v => { v.result.understandings[0].roles = { actualParticipation: true }; },
    v => { v.result.expression.message = 'join'; }, v => { v.result.expression.channel = 'invented'; },
    v => { v.receipt.input.raw += ':changed'; }, v => { v.receipt.inputKnowledge.meanings.push({ id: 'invented', source: 'initial' }); },
    v => { v.receipt.inputContext.scene += ':changed'; }, v => { v.receipt.beforeState.serial++; },
    v => { v.receipt.beforeWorld.elapsed++; }, v => { v.receipt.reply.message = 'invented'; },
    v => { v.receipt.afterState.knowledge.meanings.push({ id: 'invented', source: 'initial' }); },
    v => { v.receipt.afterWorld.elapsed++; }, v => { v.receipt.afterWorld.destination = 'invented'; },
    v => { v.receipt.afterWorld.experiences.push({ id: 999, kind: 'rest' }); },
    v => { v.receipt.afterState.context.turns.at(-1).answer = { response: { message: 'join' } }; },
    v => { v.receipt.afterState.selectionSources = [{ input: { id: v.result.input.id } }]; },
    v => { v.result.interpretations.push(copy(v.result.interpretations[0])); },
    v => { v.result.conditionJudgment = { status: 'met' }; },
    v => { v.receipt.afterState.context.turns.at(-1).conditionJudgment = { status: 'unknown', observation: null }; },
    v => { v.result.understandings[0].conditionStatus = 'met'; },
    v => { v.result.interpretations[0].application = 'after_completion'; },
    v => { v.result.interpretations[0].conditionSubject = 'player'; },
    v => { delete v.receipt.beforeState; }, v => { delete v.receipt.afterWorld; }
];
test('independent input, understanding, response and decision mutations reject without retention', () => {
    for (const f of accepted) for (const edit of edits) {
        const v = copy(f.value), b = api.create(); edit(v);
        assert.equal(capture(b, v), false, JSON.stringify([f.group, f.value.result.input, edits.indexOf(edit)])); assert.deepEqual(b.read(), []);
    }
    console.log(JSON.stringify({ groups: new Set(values.map(f => f.group)).size, originals: values.length,
        accepted: accepted.length, mutations: edits.length, rejectedMutations: accepted.length * edits.length }));
});
test('existing owners never capture the same incomplete proposal, with their proper argument shapes', () => {
    const owners = require('../scripts/experimental/diary_audit').supplementalInventory().filter(r => r.id !== '4d12cr');
    let calls = 0;
    for (const f of accepted) {
        const v = copy(f.value), before = JSON.stringify(v), r = v.receipt;
        for (const owner of owners) {
            const old = require('../' + owner.file), b = old.create ? old.create() : candidates.create();
            assert.equal(old.capture(b, copy(v.result), copy(r)), false, owner.id); calls++;
        }
        const w = r.beforeWorld;
        const context = { scene: r.beforeState.context.scene, attention: r.beforeState.context.attention,
            mode: w.mode, target: w.attention, activityStart: w.activityStart, elapsed: w.elapsed, fatigue: w.fatigue, activityBefore: w.activityBefore };
        const decision = { speech: r.beforeState.settings.speech, before: w, after: r.afterWorld,
            beforeSelections: r.beforeState.selectionSources || [], afterSelections: r.afterState.selectionSources || [], response: r.reply };
        assert.equal(require('../experimental_word_diary_proposals').capture(candidates.create(), copy(v.result), copy(context), copy(r.inputKnowledge), copy(decision)), false);
        for (const name of ['condition', 'sequence']) assert.equal(require('../experimental_word_diary_' + name + '_proposals').capture(candidates.create(), copy(v.result), copy(context), copy(r.inputKnowledge)), false);
        assert.equal(JSON.stringify(v), before);
    }
    console.log(JSON.stringify({ priorOwners: owners.length, calls, oldProposalOwners: ['am', 'm', 'p'] }));
});
test('later actual condition learning cannot change incomplete originals or make an earlier judgment', () => {
    const v = setup({ foundation: false, life: false }), early = hear(v, raw());
    const source = JSON.stringify(early), b = api.create(); assert.equal(capture(b, early), true);
    const saved = JSON.stringify(b.read()); learn(v);
    assert.ok(v.state.knowledge.relations.some(r => r.id === 'condition' && r.source === 'experienced_relation'));
    const later = hear(v, raw()); assert.equal(later.result.understandings[0].complete, true);
    assert.ok(later.result.conditionJudgment); assert.equal(capture(b, later), false);
    assert.equal(capture(b, early), false); assert.equal(JSON.stringify(b.read()), saved);
    const delayed = api.create(); assert.equal(capture(delayed, early), true); assert.equal(JSON.stringify(delayed.read()), saved);
    life.start(v, 'rest'); life.finish(v); life.start(v, 'eat'); life.finish(v);
    assert.equal(JSON.stringify(early), source); assert.equal(JSON.stringify(delayed.read()), saved);
    const next = prepared(8), many = api.create();
    for (let i = 0; i < 13; i++) assert.equal(capture(many, hear(next, raw())), true);
    assert.equal(new Set(many.read().map(r => r.sourceId)).size, 13);
});
test('original experience missing, duplicate or inconsistent rejects even with a replay-consistent receipt', () => {
    const source = values.find(f => f.group === 'original-observation-evidence').value.receipt;
    for (const edit of [v => { v.world.experiences = []; },
        v => { v.world.experiences.push(copy(v.world.experiences.at(-1))); },
        v => { v.world.experiences.at(-1).end += 1; }]) {
        const v = { state: copy(source.beforeState), world: copy(source.beforeWorld) }; edit(v);
        assert.equal(capture(api.create(), hear(v, raw())), false);
    }
});
test('malformed, cyclic or non-data values never partially retain', () => {
    for (const bad of [null, {}, undefined, NaN, () => {}, new Date()]) assert.equal(api.capture(api.create(), bad, bad), false);
    const v = copy(accepted[0].value); v.receipt.loop = v.receipt;
    assert.equal(capture(api.create(), v), false);
    for (const bad of [null, {}, { kind: 'proposal' }, { kind: 'incomplete_conditional_rest_proposal', sourceId: 'input:0' }]) assert.throws(() => api.create().retain(bad), TypeError);
});
