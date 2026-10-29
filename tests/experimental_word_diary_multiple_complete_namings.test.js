'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const api = require('../experimental_word_diary_multiple_complete_namings');
const f = require('../scripts/experimental/diary_multiple_complete_naming_fixtures');
const candidates = require('../experimental_word_diary_candidates');
const { copy, setup, hear, core, worldApi, catalog, raw } = f;
const values = f.fixtures(), accepted = values.filter(v => v.expected);
const capture = (b, v) => api.capture(b, v.result, v.receipt);
test('every naming clause retains its own word, unique target and original learning', () => {
    for (const row of accepted) {
        const b = api.create(), v = row.value; assert.equal(capture(b, v), true);
        const c = b.read()[0].captured;
        assert.deepEqual(c.namingDetails, v.result.interpretations.map((frame, index) => ({
            index, word: frame.word, target: v.result.understandings[index].target, learning: v.result.learning[index] })));
        assert.ok(c.clauses.length >= 2);
        assert.deepEqual(c.sources.antecedent, v.receipt.antecedent || null);
    }
});
for (const group of new Set(values.map(v => v.group))) test('multiple-complete-naming boundary: ' + group, () => {
    for (const row of values.filter(v => v.group === group)) {
        const v = copy(row.value), stable = JSON.stringify(v), b = api.create();
        assert.equal(capture(b, v), row.expected, v.result.input.raw);
        assert.equal(JSON.stringify(v), stable);
        assert.equal(capture(b, v), false);
        if (!row.expected) { assert.deepEqual(b.read(), []); continue; }
        const c = b.read()[0].captured;
        assert.equal(b.read()[0].kind, 'multiple_complete_naming');
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
        assert.deepEqual(c.namingIndices, v.result.interpretations.map((_, i) => i));
        c.clauses.forEach((clause, i) => {
            assert.deepEqual(clause, { index: i, span: v.result.interpretations[i].span,
                frame: v.result.interpretations[i], understanding: v.result.understandings[i] });
            assert.equal(clause.understanding.complete, true);
        });
        assert.equal(c.understandingStatus, 'per_clause');
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
    v => { v.result.interpretations[0].kind = 'unknown'; },
    v => { v.result.interpretations[0].span += ':other'; },
    v => { v.result.interpretations[0].roles = { actor: 'self' }; },
    v => { v.result.understandings[0].complete = false; },
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
test('73 prior supplemental and 47 older input contracts retain their ownership', () => {
    const audit = require('../scripts/experimental/diary_audit');
    const owners = audit.supplementalInventory().filter(r => r.id !== '4d12dk'); assert.equal(owners.length, 85);
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

test('repeated names and newly delivered teachings preserve actual updates and one material per input', () => {
    const v = setup(), b = api.create();
    const first = hear(v, 'これをころって呼ぼう\nこれをころって呼ぼう');
    assert.deepEqual(first.result.learning.map(l => l.updated.length), [1, 0]);
    assert.equal(capture(b, first), true); const saved = b.read();
    const next = hear(v, 'これをころって呼ぼう\nこれをころって呼ぼう');
    assert.deepEqual(next.result.learning.map(l => l.updated.length), [0, 0]);
    assert.equal(capture(b, next), true); assert.equal(b.read().length, 2);
    assert.equal(capture(b, first), false); assert.deepEqual(b.read()[0], saved[0]);
    hear(v, 'さっきの説明は間違えた');
    worldApi.approach(v.world, 'shade'); for (let i = 0; i < 20; i++) worldApi.tick(v.world, .1);
    const delayed = api.create(); assert.equal(capture(delayed, first), true);
    assert.deepEqual(delayed.read(), saved);
    assert.deepEqual(b.read()[0], saved[0]);
});

test('old unique naming, mixed partial naming and dynamic answers keep their original owner', () => {
    const names = require('../experimental_word_diary_names');
    for (const value of [hear(setup(), 'これをころって呼ぼう'),
        hear(setup({ life: false }), 'これをころって呼ぼう\n木の実をぽぽって呼ぼう')]) {
        assert.equal(capture(api.create(), value), false);
        assert.equal(names.capture(candidates.create(), value.result, value.receipt.inputContext), true);
    }
    const arrived = require('../scripts/experimental/diary_all_unknown_material_fixtures').arrival();
    const value = hear(arrived, 'ころ');
    assert.equal(capture(api.create(), value), false);
    assert.equal(names.capture(candidates.create(), value.result, value.receipt.inputContext), true);
});

test('original target, per-clause adoption and output cannot be repaired or exchanged', () => {
    const value = hear(setup(), raw);
    const changes = [
        v => { v.result.learning[1].adopted.word = v.result.learning[0].adopted.word; },
        v => { v.result.learning[1].adopted.target = 'berry:2'; },
        v => { v.result.learning[1].candidates.push(copy(v.result.learning[1].candidates[0])); },
        v => { v.result.learning[1].updated = []; },
        v => { v.result.understandings[1].target.adopted.id = 'berry:2'; },
        v => { v.result.interpretations.reverse(); },
        v => { delete v.receipt.inputContext; }, v => { delete v.receipt.inputKnowledge; }
    ];
    for (const change of changes) { const v = copy(value), b = api.create(); change(v);
        assert.equal(capture(b, v), false); assert.deepEqual(b.read(), []); }
    const b = api.create(); capture(b, value); const saved = b.read();
    value.result.learning[1].updated = []; value.receipt.afterState.records = [];
    assert.deepEqual(b.read(), saved);
});

test('invalid journals and malformed JSON never create occurrences', () => {
    for (const bad of [null, {}, { sourceId: 'input:0' },
        { kind: 'multiple_complete_naming', sourceId: 'input:1', occurrenceId: 'wrong', captured: {} }])
        assert.throws(() => api.create().retain(bad), TypeError);
    for (const bad of [null, {}, { input: {} }]) assert.equal(api.capture(api.create(), bad, {}), false);
    const v = copy(accepted[0].value); v.receipt.cycle = v.receipt;
    assert.equal(capture(api.create(), v), false);
});

test('missing original experience, selection and activity evidence is not synthesized', () => {
    const row = accepted.find(v => v.group === 'actual-completed-experience:rest'); assert.ok(row);
    for (const edit of [v => { v.world.experiences = []; },
        v => { v.world.experiences.push(copy(v.world.experiences.at(-1))); },
        v => { v.world.experiences.at(-1).end++; }]) {
        const v = { state: copy(row.value.receipt.beforeState), world: copy(row.value.receipt.beforeWorld) };
        edit(v); assert.equal(capture(api.create(), hear(v, raw)), false);
    }
    const selected = accepted.find(v => v.group === 'original-selection-source'); assert.ok(selected);
    const value = copy(selected.value); value.receipt.beforeState.selectionSources = [];
    assert.equal(capture(api.create(), value), false);
});
