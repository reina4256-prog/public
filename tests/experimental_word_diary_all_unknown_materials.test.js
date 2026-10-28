'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const api = require('../experimental_word_diary_all_unknown_materials');
const f = require('../scripts/experimental/diary_all_unknown_material_fixtures');
const candidates = require('../experimental_word_diary_candidates');
const { copy, setup, hear, core, worldApi, catalog, raw } = f;
const values = f.fixtures(), accepted = values.filter(v => v.expected);
const capture = (b, v) => api.capture(b, v.result, v.receipt);
for (const group of new Set(values.map(v => v.group))) test('all-unknown boundary: ' + group, () => {
    for (const row of values.filter(v => v.group === group)) {
        const v = copy(row.value), stable = JSON.stringify(v), b = api.create();
        assert.equal(capture(b, v), row.expected, v.result.input.raw);
        assert.equal(JSON.stringify(v), stable);
        assert.equal(capture(b, v), false);
        if (!row.expected) { assert.deepEqual(b.read(), []); continue; }
        const c = b.read()[0].captured;
        assert.equal(b.read()[0].kind, 'all_unknown_material');
        assert.equal(b.read()[0].sourceId, v.result.input.id);
        assert.deepEqual(c.originalResult, v.result);
        assert.deepEqual(c.originalLearning, v.result.learning);
        assert.deepEqual(c.originalTransfer, v.result.transfer);
        assert.deepEqual(c.expression, v.result.expression);
        assert.deepEqual(c.response, v.receipt.reply);
        assert.deepEqual(c.inputKnowledge, v.receipt.inputKnowledge);
        assert.deepEqual(c.inputContext, v.receipt.inputContext);
        assert.deepEqual(c.sources.state, { before: v.receipt.beforeState, after: v.receipt.afterState });
        assert.deepEqual(c.sources.activity, { before: v.receipt.beforeWorld, after: v.receipt.afterWorld });
        assert.deepEqual(c.unknownIndices, v.result.interpretations.map((_, i) => i));
        c.clauses.forEach((clause, i) => {
            assert.deepEqual(clause, { index: i, span: v.result.interpretations[i].span,
                frame: v.result.interpretations[i], understanding: v.result.understandings[i] });
            assert.equal(clause.understanding.complete, false);
        });
        assert.equal(c.understandingStatus, c.clauses.length === 1 ? 'incomplete' : 'per_clause');
        assert.equal(c.answerRecorded, Object.hasOwn(v.receipt.afterState.context.turns.at(-1), 'answer'));
        assert.deepEqual(c.turnAnswer, v.receipt.afterState.context.turns.at(-1).answer ?? null);
        for (const key of ['captureAddsTeaching', 'captureAddsLearning', 'captureAddsExperience',
            'actionDecisionRecorded', 'conditionJudgmentRecorded', 'sequenceJudgmentRecorded', 'actualParticipation'])
            assert.equal(c[key], false);
        const saved = JSON.stringify(b.read());
        b.read()[0].captured.clauses[0].span = 'edited'; v.result.input.raw = 'edited';
        v.receipt.inputKnowledge.meanings = []; assert.equal(JSON.stringify(b.read()), saved);
    }
});
const edits = [
    v => { v.result.input.raw += ':changed'; }, v => { v.result.input.id = 'input:0'; },
    v => { v.result.input.locale = 'en'; }, v => { v.result.input.speaker += ':other'; },
    v => { v.result.input.at++; }, v => { v.result.input.scene += ':other'; },
    v => { v.result.interpretations[0].kind = 'naming'; },
    v => { v.result.interpretations[0].span += ':other'; },
    v => { v.result.interpretations[0].roles = { actor: 'self' }; },
    v => { v.result.understandings[0].complete = true; },
    v => { v.result.understandings[0].unresolved = []; },
    v => { v.result.understandings[0].subject = 'self'; },
    v => { v.result.understandings[0].eventTime = 'past'; },
    v => { v.result.understandings[0].polarity = 'negative'; },
    v => { v.result.understandings[0].conditionStatus = 'met'; },
    v => { v.result.understandings[0].known.meaning = 'rest'; },
    v => { v.result.learning = [{ retraction: true }]; }, v => { v.result.transfer = [{ acquired: true }]; },
    v => { v.result.expression.message = 'invented'; }, v => { v.result.expression.channel = 'invented'; },
    v => { v.receipt.input.raw += ':other'; }, v => { v.receipt.inputContext.scene += ':other'; },
    v => { v.receipt.inputKnowledge.meanings = []; }, v => { v.receipt.beforeState.serial++; },
    v => { v.receipt.beforeWorld.elapsed++; }, v => { v.receipt.reply.message = 'invented'; },
    v => { v.receipt.afterState.knowledge.associations.push({ word: 'invented' }); },
    v => { v.receipt.afterWorld.elapsed++; }, v => { v.receipt.afterState.context.turns.at(-1).answer = {}; },
    v => { v.result.interpretations.push(copy(v.result.interpretations[0])); },
    v => { v.result.relationLearning = {}; }, v => { v.result.conditionJudgment = {}; },
    v => { v.result.sequenceJudgment = {}; }, v => { delete v.receipt.beforeState; },
    v => { delete v.receipt.afterWorld; }, v => { v.result.input.id = 'input:9007199254740992'; }
];
test('changed input, clauses, actual effects and response reject atomically', () => {
    let rejected = 0, equivalent = 0;
    for (const row of accepted) for (const [index, edit] of edits.entries()) {
        const v = copy(row.value), stable = JSON.stringify(v), b = api.create(); edit(v);
        if (JSON.stringify(v) === stable) { equivalent++; continue; }
        assert.equal(capture(b, v), false, JSON.stringify([row.group, index]));
        assert.deepEqual(b.read(), []); rejected++;
    }
    console.log(JSON.stringify({ fixtures: values.length, accepted: accepted.length, mutations: edits.length, rejected, equivalent }));
});
test('real antecedents are required and independently replayed without invented ancestry', () => {
    let cases = 0;
    for (const row of accepted.filter(v => v.value.receipt.antecedent)) {
        const baseline = copy(row.value); assert.equal(capture(api.create(), baseline), true);
        for (const edit of [v => { delete v.receipt.antecedent; },
            v => { v.receipt.antecedent.result.input.raw += ':changed'; },
            v => { v.receipt.antecedent.receipt.reply.message = 'invented'; },
            v => { v.receipt.antecedent.receipt.afterState.context.turns.at(-1).raw += ':changed'; },
            v => { v.receipt.antecedent.receipt.beforeWorld.elapsed++; }]) {
            const v = copy(baseline); edit(v); assert.equal(capture(api.create(), v), false); cases++;
        }
    }
    const v = hear(setup(), raw); v.receipt.antecedent = copy(accepted[0].value);
    assert.equal(capture(api.create(), v), false); assert.ok(cases > 0);
    console.log(JSON.stringify({ antecedentMutationRejections: cases }));
});
test('72 prior supplemental and 47 older input contracts retain their ownership', () => {
    const audit = require('../scripts/experimental/diary_audit');
    const owners = audit.supplementalInventory().filter(r => r.id !== '4d12dj'); assert.equal(owners.length, 80);
    const oldOwners = audit.inventory().filter(r => !['4d1', '4d3', '4d4'].includes(r.id)); assert.equal(oldOwners.length, 47);
    const contracts = oldOwners.map(o => { const old = require('../' + o.file);
        const params = /function capture\(([^)]*)\)/.exec(old.capture.toString())[1].split(',').map(s => s.trim());
        assert.equal(params.length, o.arity); return { ...o, old, params }; });
    for (const row of accepted) {
        const v = row.value, r = v.receipt, s = r.beforeState, w = r.beforeWorld, stable = JSON.stringify(v);
        for (const owner of owners) { const old = require('../' + owner.file);
            assert.equal(old.capture(old.create ? old.create() : candidates.create(), copy(v.result), copy(r)), false, owner.id); }
        const context = { scene: s.context.scene, attention: s.context.attention, mode: w.mode, target: w.attention,
            activityStart: w.activityStart, elapsed: w.elapsed, hunger: w.hunger, fatigue: w.fatigue, mealTaste: w.mealTaste ?? null,
            destination: w.destination, history: w.history, experiences: w.experiences, activityBefore: w.activityBefore ?? null };
        const named = { result: v.result, reply: r.reply, context, beforeKnowledge: s.knowledge,
            beforeExperiences: s.experiences || [], beforeSelections: s.selectionSources || [], beforeLessons: s.correctionLessons || [],
            beforeRecords: s.records, beforeTurns: s.context.turns, beforeFeelingLearning: s.feelingLearning || { events: [], knowledge: [] },
            beforeReports: [], beforeReceipts: [], decision: { speech: s.settings.speech, before: w, after: r.afterWorld,
                beforeSelections: s.selectionSources || [], afterSelections: r.afterState.selectionSources || [], response: r.reply } };
        for (const owner of contracts) {
            const args = owner.params.slice(1).map(p => { assert.ok(Object.hasOwn(named, p), p); return copy(named[p]); });
            assert.equal(owner.old.capture(candidates.create(), ...args), false, owner.id);
        }
        assert.equal(JSON.stringify(v), stable);
    }
    console.log(JSON.stringify({ priorSupplementalCalls: accepted.length * owners.length, priorInputCalls: accepted.length * contracts.length }));
});
test('new inputs, later naming knowledge, actual activity and delayed captures never rewrite the past', () => {
    const v = setup(), early = hear(v, 'ころ'), b = api.create(); assert.equal(capture(b, early), true);
    const saved = b.read(); hear(v, 'これをころって呼ぼう'); const later = hear(v, 'ころ');
    assert.notEqual(later.result.interpretations[0].kind, 'unknown'); assert.equal(capture(b, later), false);
    worldApi.approach(v.world, 'shade'); for (let i = 0; i < 20; i++) worldApi.tick(v.world, .1);
    assert.deepEqual(b.read(), saved); const delayed = api.create(); assert.equal(capture(delayed, early), true);
    assert.deepEqual(delayed.read(), saved);
    const fresh = hear(v, raw); assert.equal(capture(b, fresh), true); assert.equal(b.read().length, 2);
    assert.deepEqual(b.read()[0], saved[0]);
});
test('actual ask_name dynamic naming stays with the older unique naming adapter', () => {
    const v = f.arrival(); assert.equal(v.state.context.pendingQuestion.kind, 'ask_name');
    const value = hear(v, 'ころ'), names = require('../experimental_word_diary_names');
    assert.equal(value.result.understandings[0].complete, true); assert.equal(capture(api.create(), value), false);
    assert.equal(names.capture(candidates.create(), value.result, value.receipt.inputContext), true);
});
test('invalid journals and malformed JSON do not create occurrences', () => {
    for (const bad of [null, {}, { sourceId: 'input:0' }, { kind: 'all_unknown_material', sourceId: 'input:1', occurrenceId: 'wrong', captured: {} }])
        assert.throws(() => api.create().retain(bad), TypeError);
    for (const bad of [null, {}, { input: {} }]) assert.equal(api.capture(api.create(), bad, {}), false);
    const v = copy(accepted[0].value); v.receipt.cycle = v.receipt;
    assert.equal(capture(api.create(), v), false);
});

test('missing original experience, selection and activity output evidence is never repaired', () => {
    const row = accepted.find(v => v.group === 'actual-completed-experience:rest');
    assert.ok(row);
    for (const edit of [v => { v.world.experiences = []; },
        v => { v.world.experiences.push(copy(v.world.experiences.at(-1))); },
        v => { v.world.experiences.at(-1).end++; }]) {
        const v = { state: copy(row.value.receipt.beforeState), world: copy(row.value.receipt.beforeWorld) };
        edit(v); assert.equal(capture(api.create(), hear(v, raw)), false);
    }
    const selected = setup(); hear(selected, '休んでね');
    const step = hear(selected, raw); assert.equal(capture(api.create(), step), true);
    step.receipt.beforeState.selectionSources = [];
    assert.equal(capture(api.create(), step), false);
    const asked = f.arrival(), value = hear(asked, '木の実');
    assert.equal(capture(api.create(), value), true);
    value.receipt.beforeState.context.lastOutput.response.message = 'invented';
    assert.equal(capture(api.create(), value), false);
});
