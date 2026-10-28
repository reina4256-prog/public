'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const api = require('../experimental_word_diary_individual_reference_materials');
const f = require('../scripts/experimental/diary_individual_reference_material_fixtures');
const candidates = require('../experimental_word_diary_candidates');
const { copy } = f, values = f.fixtures(), accepted = values.filter(row => row.expected);
const capture = (buffer, value) => api.capture(buffer, value.result, value.receipt);
test('80 prior supplemental and 47 older input contracts retain individual reference boundaries', () => {
    const audit = require('../scripts/experimental/diary_audit');
    const owners = audit.supplementalInventory().filter(r => r.id !== '4d12dr'); assert.equal(owners.length, 82);
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
for (const group of new Set(values.map(row => row.group))) test('individual reference material: ' + group, () => {
    for (const row of values.filter(item => item.group === group)) {
        const value = copy(row.value), stable = JSON.stringify(value), journal = api.create();
        assert.equal(capture(journal, value), row.expected, JSON.stringify([group, value.result.input.raw]));
        assert.equal(JSON.stringify(value), stable); assert.equal(capture(journal, value), false);
        if (!row.expected) { assert.deepEqual(journal.read(), []); continue; }
        const record = journal.read()[0], c = record.captured, r = value.result, q = value.receipt;
        assert.equal(record.kind, 'individual_reference_material'); assert.equal(record.sourceId, r.input.id);
        assert.deepEqual(c.originalResult, r); assert.deepEqual(c.originalLearning, r.learning);
        assert.deepEqual(c.originalTransfer, r.transfer); assert.deepEqual(c.response, q.reply);
        assert.deepEqual(c.expression, r.expression); assert.deepEqual(c.inputKnowledge, q.inputKnowledge);
        assert.deepEqual(c.inputContext, q.inputContext); assert.equal(c.understandingStatus, 'per_clause');
        assert.deepEqual(c.sources.state, { before: q.beforeState, after: q.afterState });
        assert.deepEqual(c.sources.activity, { before: q.beforeWorld, after: q.afterWorld });
        assert.deepEqual(c.referenceOrigins, q.origins);
        assert.deepEqual(c.referenceIndices, r.interpretations.flatMap((frame, i) => frame.kind === 'reference' ? [i] : []));
        assert.deepEqual(c.clauses, r.interpretations.map((frame, index) => ({ index, span: frame.span, frame, understanding: r.understandings[index] })));
        for (const source of c.referenceSources) {
            assert.deepEqual(source.originalUnderstanding, r.understandings[source.index]);
            assert.deepEqual(source.resolution, source.originalUnderstanding.target);
            assert.ok(source.candidates.length);
            if (!source.originalUnderstanding.complete) assert.equal(source.resolution.adopted, null);
        }
        const turn = q.afterState.context.turns.at(-1);
        assert.equal(c.answerRecorded, Object.hasOwn(turn, 'answer'));
        assert.deepEqual(c.turnAnswer, Object.hasOwn(turn, 'answer') ? turn.answer : null);
        for (const key of ['captureAddsTeaching', 'captureAddsLearning', 'captureAddsExperience',
            'actionDecisionRecorded', 'conditionJudgmentRecorded', 'sequenceJudgmentRecorded', 'actualParticipation']) assert.equal(c[key], false);
        const saved = JSON.stringify(journal.read()); journal.read()[0].captured.referenceSources = [];
        value.receipt.origins = []; value.result.understandings = []; assert.equal(JSON.stringify(journal.read()), saved);
    }
});
const edits = [
    v => { v.result.input.raw += ':changed'; }, v => { v.result.input.id = 'input:0'; },
    v => { v.result.input.locale = 'en'; }, v => { v.result.input.speaker += ':other'; },
    v => { v.result.input.at++; }, v => { v.result.input.scene += ':other'; },
    v => { v.result.interpretations[0].span += ':other'; },
    v => { v.result.understandings[0].complete = !v.result.understandings[0].complete; },
    v => { v.result.learning = []; }, v => { v.result.transfer = [{ acquired: true }]; },
    v => { v.result.expression.message = 'invented'; }, v => { v.receipt.input.raw += ':changed'; },
    v => { v.receipt.inputKnowledge.meanings.push({ id: 'invented' }); }, v => { v.receipt.inputContext.scene += ':other'; },
    v => { v.receipt.beforeState.serial++; }, v => { v.receipt.beforeWorld.elapsed++; },
    v => { v.receipt.reply.message = 'invented'; }, v => { v.receipt.afterState.context.turns.at(-1).answer = {}; },
    v => { v.receipt.afterWorld.elapsed++; }, v => { v.result.conditionJudgment = {}; },
    v => { v.result.sequenceJudgment = {}; }, v => { v.result.relationLearning = {}; },
    v => { delete v.receipt.beforeState; }, v => { delete v.receipt.afterWorld; }
];
test('individual references reject occurrence tampering atomically', () => {
    let rejected = 0;
    for (const row of accepted) for (const edit of edits) {
        const value = copy(row.value), journal = api.create(); edit(value);
        assert.equal(capture(journal, value), false, row.group); assert.deepEqual(journal.read(), []); rejected++;
    }
    console.log(JSON.stringify({ fixtures: values.length, accepted: accepted.length, occurrenceMutations: edits.length, rejected }));
});
test('every candidate evidence requires its independently replayed original naming', () => {
    let rejected = 0;
    for (const row of accepted) for (let i = 0; i < row.value.receipt.origins.length; i++) for (const edit of [
        v => { v.receipt.origins.splice(i, 1); },
        v => { v.receipt.origins[i].result.input.raw += ':wrong'; },
        v => { v.receipt.origins[i].result.input.speaker += ':wrong'; },
        v => { v.receipt.origins[i].beforeState.serial++; },
        v => { v.receipt.origins[i].afterState.knowledge.associations = []; },
        v => { v.receipt.origins.push(copy(v.receipt.origins[i])); }
    ]) {
        const value = copy(row.value), journal = api.create(); edit(value);
        assert.equal(capture(journal, value), false, row.group); assert.deepEqual(journal.read(), []); rejected++;
    }
    const v = f.prepare(); f.hear(v, 'これをももって呼ぼう'); const row = f.hear(v, f.raw);
    assert.equal(capture(api.create(), row), true); row.receipt.origins.push(copy(v.origins[1]));
    assert.equal(capture(api.create(), row), false);
    console.log(JSON.stringify({ originMutationRejections: rejected }));
});
test('attention adoption and unresolved competitors remain separate from retained naming evidence', () => {
    for (const ids of [[], ['berry:1'], ['berry:2'], ['berry:1', 'berry:2']]) {
        const v = f.ambiguous({}, ids), row = f.hear(v, f.raw), journal = api.create();
        assert.equal(capture(journal, row), true); const source = journal.read()[0].captured.referenceSources[0];
        assert.equal(source.candidates.length, 2); assert.equal(journal.read()[0].captured.referenceOrigins.length, 2);
        assert.equal(source.originalUnderstanding.complete, ids.length === 1);
        assert.equal(source.resolution.adopted?.id || null, ids.length === 1 ? ids[0] : null);
    }
});
test('multiple same-target evidence and multi-clause naming origins are not collapsed', () => {
    for (const group of ['source:multiple-evidence', 'source:multiple-naming-origin']) {
        const row = accepted.find(r => r.group === group), journal = api.create(); assert.ok(row);
        assert.equal(capture(journal, row.value), true); const c = journal.read()[0].captured;
        if (group === 'source:multiple-evidence') {
            assert.equal(c.referenceSources[0].candidates.length, 1);
            assert.equal(c.referenceSources[0].candidates[0].evidence.length, 2); assert.equal(c.referenceOrigins.length, 2);
        } else assert.equal(c.referenceOrigins[0].result.interpretations.length, 2);
    }
});
test('actual immediate occurrences and confirmation sources cannot be replaced', () => {
    let rejected = 0;
    for (const row of accepted) for (const edit of [
        v => { delete v.receipt.antecedent; }, v => { v.receipt.antecedent.result.input.at++; },
        v => { v.receipt.antecedent.receipt.reply.message = 'invented'; }
    ]) { const value = copy(row.value); edit(value); assert.equal(capture(api.create(), value), false); rejected++; }
    for (const row of accepted.filter(r => r.value.result.interpretations.some(f => f.kind === 'reply'))) {
        assert.equal(row.value.receipt.beforeState.context.pendingQuestion.kind, 'confirm_name');
        for (const edit of [
            v => { v.receipt.beforeState.context.pendingQuestion.word += ':wrong'; },
            v => { v.receipt.beforeState.context.pendingQuestion.inputId = 'input:999'; },
            v => { v.receipt.beforeState.context.pendingQuestion.expires = 0; },
            v => { v.receipt.antecedent.receipt.afterState.context.pendingQuestion = null; },
            v => { delete v.receipt.origin; }
        ]) { const value = copy(row.value); edit(value); assert.equal(capture(api.create(), value), false); rejected++; }
    }
    console.log(JSON.stringify({ prerequisiteMutationRejections: rejected }));
});
test('new inputs remain separate and later retraction or activity never rewrites old references', () => {
    const v = f.prepare(), first = f.hear(v, f.raw), journal = api.create();
    assert.equal(capture(journal, first), true); const saved = JSON.stringify(journal.read());
    const next = f.hear(v, f.raw); assert.equal(capture(journal, next), true);
    assert.equal(JSON.stringify(journal.read().slice(0, 1)), saved);
    f.hear(v, 'ぴぴ'); f.hear(v, '違う');
    assert.equal(capture(journal, first), false); assert.equal(journal.read().length, 2);
    assert.equal(JSON.stringify(journal.read().slice(0, 1)), saved);
    const unknown = f.setup(), old = f.hear(unknown, f.raw); f.hear(unknown, 'これをぴぴって呼ぼう');
    assert.equal(capture(api.create(), old), false);
});
test('malformed individual reference journal data is rejected', () => {
    for (const value of [null, {}, { kind: 'wrong' }, { kind: 'individual_reference_material', sourceId: 'input:0' }]) assert.throws(() => api.create().retain(value), TypeError);
    const circular = {}; circular.self = circular;
    assert.equal(api.capture(api.create(), circular, {}), false); assert.equal(api.capture(api.create(), null, null), false);
});
