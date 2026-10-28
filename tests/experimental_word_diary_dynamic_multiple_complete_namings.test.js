'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const api = require('../experimental_word_diary_dynamic_multiple_complete_namings');
const f = require('../scripts/experimental/diary_dynamic_multiple_complete_naming_fixtures');
const candidates = require('../experimental_word_diary_candidates');
const { copy, setup, hear, arrive, core, worldApi, raw } = f;
const values = f.fixtures(), accepted = values.filter(row => row.expected);
const capture = (buffer, value) => api.capture(buffer, value.result, value.receipt);
for (const group of new Set(values.map(row => row.group))) test('dynamic multiple naming boundary: ' + group, () => {
    for (const row of values.filter(row => row.group === group)) {
        const v = copy(row.value), stable = JSON.stringify(v), buffer = api.create();
        assert.equal(capture(buffer, v), row.expected, v.result.input.raw);
        assert.equal(JSON.stringify(v), stable); assert.equal(capture(buffer, v), false);
        if (!row.expected) { assert.deepEqual(buffer.read(), []); continue; }
        const record = buffer.read()[0], c = record.captured, r = v.result, q = v.receipt;
        assert.equal(record.kind, 'dynamic_multiple_complete_naming'); assert.equal(record.sourceId, r.input.id);
        assert.deepEqual(c.originalResult, r); assert.deepEqual(c.originalLearning, r.learning);
        assert.deepEqual(c.originalTransfer, r.transfer); assert.deepEqual(c.expression, r.expression);
        assert.deepEqual(c.response, q.reply); assert.deepEqual(c.inputKnowledge, q.inputKnowledge);
        assert.deepEqual(c.inputContext, q.inputContext);
        assert.deepEqual(c.sources.state, { before: q.beforeState, after: q.afterState });
        assert.deepEqual(c.sources.activity, { before: q.beforeWorld, after: q.afterWorld });
        assert.deepEqual(c.sources.antecedent, q.antecedent || null);
        assert.equal(c.sources.antecedentRecorded, !!q.beforeState.context.turns.length);
        assert.deepEqual(c.dynamicNamingSource.pendingQuestion, q.beforeState.context.pendingQuestion);
        assert.deepEqual(c.dynamicNamingSource.output, q.beforeState.context.lastOutput);
        assert.deepEqual(c.dynamicNamingIndices, r.interpretations.flatMap((frame, i) => Object.hasOwn(frame, 'catalogRule') ? [] : [i]));
        assert.deepEqual(c.catalogNamingIndices, r.interpretations.flatMap((frame, i) => Object.hasOwn(frame, 'catalogRule') ? [i] : []));
        assert.deepEqual(c.namingDetails, r.interpretations.map((frame, index) => ({ index, word: frame.word,
            target: r.understandings[index].target, learning: r.learning[index] })));
        assert.deepEqual(c.clauses, r.interpretations.map((frame, index) => ({ index, span: frame.span,
            frame, understanding: r.understandings[index] })));
        assert.equal(c.understandingStatus, 'per_clause');
        const turn = q.afterState.context.turns.at(-1);
        assert.equal(c.answerRecorded, Object.hasOwn(turn, 'answer'));
        assert.deepEqual(c.turnAnswer, Object.hasOwn(turn, 'answer') ? turn.answer : null);
        for (const key of ['captureAddsTeaching', 'captureAddsLearning', 'captureAddsExperience',
            'actionDecisionRecorded', 'conditionJudgmentRecorded', 'sequenceJudgmentRecorded', 'actualParticipation'])
            assert.equal(c[key], false);
        const saved = JSON.stringify(buffer.read());
        buffer.read()[0].captured.dynamicNamingSource.output.response.message = 'edited';
        v.result.input.raw = 'edited'; v.receipt.inputKnowledge.meanings = [];
        assert.equal(JSON.stringify(buffer.read()), saved);
    }
});
const edits = [
    v => { v.result.input.raw += ':changed'; }, v => { v.result.input.id = 'input:0'; },
    v => { v.result.input.locale = 'en'; }, v => { v.result.input.speaker = 'visitor'; },
    v => { v.result.input.at++; }, v => { v.result.input.scene += ':other'; },
    v => { v.result.interpretations[0].kind = 'unknown'; }, v => { v.result.interpretations[0].span += ':other'; },
    v => { v.result.interpretations[0].catalogRule = 'name'; },
    v => { v.result.understandings[0].complete = false; }, v => { v.result.understandings[0].known.meaning = 'rest'; },
    v => { v.result.learning[0].adopted.word += ':other'; }, v => { v.result.learning[0].adopted.target = 'berry:2'; },
    v => { v.result.learning[0].candidates.push(copy(v.result.learning[0].candidates[0])); },
    v => { v.result.learning[0].updated = []; }, v => { v.result.transfer = [{ acquired: true }]; },
    v => { v.result.expression.message = 'invented'; }, v => { v.receipt.input.raw += ':changed'; },
    v => { v.receipt.inputKnowledge.meanings = []; }, v => { v.receipt.inputContext.scene += ':other'; },
    v => { v.receipt.beforeState.serial++; }, v => { v.receipt.beforeWorld.elapsed++; },
    v => { v.receipt.reply.message = 'invented'; }, v => { v.receipt.afterState.context.turns.at(-1).answer = {}; },
    v => { v.receipt.afterState.knowledge.associations = []; }, v => { v.receipt.afterWorld.elapsed++; },
    v => { v.result.interpretations.push(copy(v.result.interpretations[0])); },
    v => { v.result.conditionJudgment = {}; }, v => { v.result.sequenceJudgment = {}; },
    v => { v.result.relationLearning = {}; }, v => { delete v.receipt.beforeState; }, v => { delete v.receipt.afterWorld; }
];
test('changed input, adoptions, effects and reply reject atomically', () => {
    let rejected = 0, equivalent = 0;
    for (const row of accepted) for (const [index, edit] of edits.entries()) {
        const v = copy(row.value), original = JSON.stringify(v), b = api.create(); edit(v);
        if (JSON.stringify(v) === original) { equivalent++; continue; }
        assert.equal(capture(b, v), false, JSON.stringify([row.group, index])); assert.deepEqual(b.read(), []); rejected++;
    }
    console.log(JSON.stringify({ fixtures: values.length, accepted: accepted.length, mutations: edits.length, rejected, equivalent }));
});
test('activity ask_name evidence is required even when receive/respond still replay identically', () => {
    const changes = [
        v => { v.state.context.lastOutput.source.eventId++; }, v => { v.state.context.lastOutput.source.at++; },
        v => { v.state.context.lastOutput.source.inputId = 'input:1'; },
        v => { v.state.context.lastOutput.inputId = 'input:1'; },
        v => { v.state.context.lastOutput.response.target = 'berry:2'; },
        v => { v.state.context.lastOutput.source.message = 'other'; },
        v => { v.state.context.lastOutput.response.message = 'other'; },
        v => { v.state.context.lastOutput.evidence.activity.start++; },
        v => { v.state.context.lastOutput.evidence.activity.target = 'berry:2'; },
        v => { v.state.context.lastOutput.listener = 'visitor'; },
        v => { v.state.context.lastOutput.meanings.push('rest'); },
        v => { v.state.context.lastOutput.requiredMeanings.push('rest'); },
        v => { v.state.context.lastOutput.eventTime = 'past'; },
        v => { v.state.context.lastOutput.response.word = 'invented'; },
        v => { v.state.context.pendingQuestion.expires++; },
        v => { v.state.context.pendingQuestion.target = 'berry:2'; },
        v => { v.state.context.pendingQuestion.speaker = 'visitor'; },
        v => { delete v.state.context.lastOutput; }, v => { delete v.state.context.pendingQuestion; },
        v => { v.world.askedNames = {}; }, v => { v.world.history = []; }, v => { v.world.activityStart++; }
    ];
    for (const change of changes) { const v = setup(); change(v); const value = hear(v, raw);
        assert.equal(capture(api.create(), value), false); }
});
test('real input antecedents are independently replayed, activity outputs never become input ancestors', () => {
    let rejected = 0;
    for (const row of accepted.filter(row => row.value.receipt.antecedent)) {
        for (const edit of [v => { delete v.receipt.antecedent; },
            v => { v.receipt.antecedent.result.input.raw += ':changed'; },
            v => { v.receipt.antecedent.receipt.reply.message = 'invented'; },
            v => { v.receipt.antecedent.receipt.afterState.context.turns.at(-1).raw += ':changed'; },
            v => { v.receipt.antecedent.receipt.beforeWorld.elapsed++; }]) {
            const v = copy(row.value); edit(v); assert.equal(capture(api.create(), v), false); rejected++;
        }
    }
    const v = hear(setup(), raw); v.receipt.antecedent = copy(accepted[0].value);
    assert.equal(capture(api.create(), v), false); assert.ok(rejected > 0);
    console.log(JSON.stringify({ antecedentMutationRejections: rejected }));
});
test('75 prior supplemental and 47 older input contracts preserve their ownership', () => {
    const audit = require('../scripts/experimental/diary_audit');
    const owners = audit.supplementalInventory().filter(r => r.id !== '4d12dm'); assert.equal(owners.length, 84);
    const contracts = audit.inventory().filter(o => !['4d1', '4d3', '4d4'].includes(o.id)).map(o => {
        const old = require('../' + o.file), params = /function capture\(([^)]*)\)/.exec(old.capture.toString())[1].split(',').map(s => s.trim());
        assert.equal(params.length, o.arity); return { ...o, old, params };
    }); assert.equal(contracts.length, 47);
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
test('same-name repetition retains actual updates and new activity inputs remain independent', () => {
    const v = setup(), b = api.create(), first = hear(v, 'ころ\nころ');
    assert.deepEqual(first.result.learning.map(l => l.updated.length), [1, 0]);
    assert.equal(capture(b, first), true); const saved = b.read();
    f.life.start(v, 'eat'); f.life.finish(v); arrive(v);
    const next = hear(v, 'ころ\nころ');
    assert.notEqual(next.result.understandings[0].target.adopted.id, first.result.understandings[0].target.adopted.id);
    assert.equal(capture(b, next), true); assert.equal(b.read().length, 2);
    assert.equal(capture(b, first), false); assert.deepEqual(b.read()[0], saved[0]);
    hear(v, 'さっきの説明は間違えた'); worldApi.approach(v.world, 'shade');
    for (let i = 0; i < 30; i++) worldApi.tick(v.world, .1);
    const delayed = api.create(); assert.equal(capture(delayed, first), true); assert.deepEqual(delayed.read(), saved);
});
test('literal unknown is retained as the actual naming frame and echo does not answer every clause', () => {
    const v = hear(setup(), 'ころ\n未知'), b = api.create(); assert.equal(capture(b, v), true);
    const c = b.read()[0].captured; assert.equal(c.clauses[1].frame.kind, 'naming');
    assert.equal(c.clauses[1].frame.word, '未知'); assert.equal(c.response.word, 'ころ');
    assert.equal(c.understandingStatus, 'per_clause');
});
test('invalid journals and malformed inputs never create occurrences', () => {
    for (const bad of [null, {}, { sourceId: 'input:0' },
        { kind: 'dynamic_multiple_complete_naming', sourceId: 'input:1', occurrenceId: 'wrong', captured: {} }])
        assert.throws(() => api.create().retain(bad), TypeError);
    for (const bad of [null, {}, { input: {} }]) assert.equal(api.capture(api.create(), bad, {}), false);
    const v = hear(setup(), raw); v.receipt.cycle = v.receipt; assert.equal(capture(api.create(), v), false);
});
