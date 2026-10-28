'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const api = require('../experimental_word_diary_multiple_naming_additional_clause_materials');
const f = require('../scripts/experimental/diary_multiple_naming_additional_clause_material_fixtures');
const candidates = require('../experimental_word_diary_candidates');
const { copy, setup, arrived, hear, raw, dynamicRaw } = f;
const values = f.fixtures(), accepted = values.filter(row => row.expected);
const capture = (b, v) => api.capture(b, v.result, v.receipt);
for (const group of new Set(values.map(row => row.group))) test('multiple naming additional clauses: ' + group, () => {
    for (const row of values.filter(row => row.group === group)) {
        const v = copy(row.value), stable = JSON.stringify(v), b = api.create();
        assert.equal(capture(b, v), row.expected, v.result.input.raw);
        assert.equal(JSON.stringify(v), stable); assert.equal(capture(b, v), false);
        if (!row.expected) { assert.deepEqual(b.read(), []); continue; }
        const record = b.read()[0], c = record.captured, r = v.result, q = v.receipt;
        assert.equal(record.kind, 'multiple_naming_additional_clause_material');
        assert.equal(record.sourceId, r.input.id); assert.deepEqual(c.originalResult, r);
        assert.deepEqual(c.originalLearning, r.learning); assert.deepEqual(c.originalTransfer, r.transfer);
        assert.deepEqual(c.inputKnowledge, q.inputKnowledge); assert.deepEqual(c.inputContext, q.inputContext);
        assert.deepEqual(c.sources.state, { before: q.beforeState, after: q.afterState });
        assert.deepEqual(c.sources.activity, { before: q.beforeWorld, after: q.afterWorld });
        assert.deepEqual(c.sources.antecedent, q.antecedent || null);
        assert.deepEqual(c.response, q.reply); assert.deepEqual(c.expression, r.expression);
        assert.equal(c.understandingStatus, 'per_clause');
        assert.deepEqual(c.clauses, r.interpretations.map((frame, index) => ({ index, span: frame.span, frame, understanding: r.understandings[index] })));
        assert.deepEqual(c.additionalIndices, r.interpretations.flatMap((frame, i) => Object.hasOwn(f.forms, frame.catalogRule) ? [i] : []));
        assert.deepEqual(c.recoveryExplanationIndices, r.interpretations.flatMap((frame, i) => frame.catalogRule === 'rest_explanation' ? [i] : []));
        if (c.dynamicNamingIndices.length) {
            assert.deepEqual(c.dynamicNamingSource.pendingQuestion, q.beforeState.context.pendingQuestion);
            assert.deepEqual(c.dynamicNamingSource.output, q.beforeState.context.lastOutput);
        } else assert.equal(c.dynamicNamingSource, null);
        const turn = q.afterState.context.turns.at(-1);
        assert.equal(c.answerRecorded, Object.hasOwn(turn, 'answer'));
        assert.deepEqual(c.turnAnswer, Object.hasOwn(turn, 'answer') ? turn.answer : null);
        for (const key of ['captureAddsTeaching', 'captureAddsLearning', 'captureAddsExperience', 'actionDecisionRecorded',
            'conditionJudgmentRecorded', 'sequenceJudgmentRecorded', 'actualParticipation']) assert.equal(c[key], false);
        const saved = JSON.stringify(b.read());
        b.read()[0].captured.sources.input.raw = 'changed'; v.receipt.inputKnowledge.meanings = []; v.result.learning = [];
        assert.equal(JSON.stringify(b.read()), saved);
    }
});
const edits = [
    v => { v.result.input.raw += ':changed'; }, v => { v.result.input.id = 'input:0'; },
    v => { v.result.input.locale = 'en'; }, v => { v.result.input.speaker += ':other'; },
    v => { v.result.input.at++; }, v => { v.result.input.scene += ':other'; },
    v => { v.result.interpretations[0].kind = 'unknown'; }, v => { v.result.interpretations[0].span += ':other'; },
    v => { v.result.interpretations.at(-1).catalogRule = 'retract_explanation'; },
    v => { v.result.understandings[0].complete = !v.result.understandings[0].complete; },
    v => { v.result.understandings[0].known.meaning = 'rest'; },
    v => { v.result.learning = []; }, v => { v.result.transfer = [{ acquired: true }]; },
    v => { v.result.expression.message = 'invented'; }, v => { v.receipt.input.raw += ':changed'; },
    v => { v.receipt.inputKnowledge.meanings = []; }, v => { v.receipt.inputContext.scene += ':other'; },
    v => { v.receipt.beforeState.serial++; }, v => { v.receipt.beforeWorld.elapsed++; },
    v => { v.receipt.reply.message = 'invented'; }, v => { v.receipt.afterState.context.turns.at(-1).answer = {}; },
    v => { v.receipt.afterState.knowledge.associations = []; }, v => { v.receipt.afterWorld.elapsed++; },
    v => { v.result.interpretations.push(copy(v.result.interpretations[0])); },
    v => { v.result.conditionJudgment = {}; }, v => { v.result.sequenceJudgment = {}; },
    v => { v.result.relationLearning = {}; }, v => { delete v.receipt.beforeState; }, v => { delete v.receipt.afterWorld; }
];
test('changed source, learning, replies and effects reject atomically', () => {
    let rejected = 0, equivalent = 0;
    for (const row of accepted) for (const [index, edit] of edits.entries()) {
        const v = copy(row.value), original = JSON.stringify(v), b = api.create(); edit(v);
        if (JSON.stringify(v) === original) { equivalent++; continue; }
        assert.equal(capture(b, v), false, JSON.stringify([row.group, index])); assert.deepEqual(b.read(), []); rejected++;
    }
    console.log(JSON.stringify({ fixtures: values.length, accepted: accepted.length, mutations: edits.length, rejected, equivalent }));
});
test('all actual input ancestors are independently replayed without inventing ancestry', () => {
    let rejected = 0;
    for (const row of accepted.filter(r => r.value.receipt.antecedent)) for (const edit of [
        v => { delete v.receipt.antecedent; }, v => { v.receipt.antecedent.result.input.raw += ':changed'; },
        v => { v.receipt.antecedent.receipt.reply.message = 'invented'; },
        v => { v.receipt.antecedent.receipt.afterState.context.turns.at(-1).raw += ':changed'; },
        v => { v.receipt.antecedent.receipt.beforeWorld.elapsed++; }
    ]) { const v = copy(row.value); edit(v); assert.equal(capture(api.create(), v), false); rejected++; }
    const v = hear(setup(), raw); v.receipt.antecedent = copy(accepted[0].value);
    assert.equal(capture(api.create(), v), false); assert.ok(rejected > 0);
    console.log(JSON.stringify({ antecedentMutationRejections: rejected }));
});
test('activity evidence is required only for actual dynamic naming', () => {
    const changes = [
        v => { v.state.context.lastOutput.source.eventId++; }, v => { v.state.context.lastOutput.source.at++; },
        v => { v.state.context.lastOutput.inputId = 'input:1'; }, v => { v.state.context.lastOutput.source.inputId = 'input:1'; },
        v => { v.state.context.lastOutput.response.target = 'berry:2'; },
        v => { v.state.context.lastOutput.source.message = 'other'; }, v => { v.state.context.lastOutput.response.message = 'other'; },
        v => { v.state.context.lastOutput.evidence.activity.target = 'berry:2'; },
        v => { v.state.context.lastOutput.listener = 'visitor'; }, v => { v.state.context.lastOutput.meanings.push('rest'); },
        v => { v.state.context.lastOutput.requiredMeanings.push('rest'); }, v => { v.state.context.lastOutput.eventTime = 'past'; },
        v => { v.state.context.lastOutput.response.word = 'invented'; }, v => { v.state.context.pendingQuestion.expires++; },
        v => { v.world.askedNames = {}; }, v => { v.world.history = []; }, v => { v.world.activityStart++; }
    ];
    for (const change of changes) { const v = arrived(); change(v); assert.equal(capture(api.create(), hear(v, dynamicRaw)), false); }
    const ordinary = hear(setup(), raw), b = api.create(); assert.equal(capture(b, ordinary), true);
    assert.equal(b.read()[0].captured.dynamicNamingSource, null);
});
test('recovery requires the real preceding understood rest and rejects missing or changed prior material', () => {
    const text = 'これをころって呼ぼう\nこれをぽぽって呼ぼう\n体力や眠気が回復するからね';
    for (const activity of [false, true]) for (const speaker of ['player', 'visitor']) {
        const v = setup(); hear(v, '休むことは大事', { speaker: speaker === 'player' ? 'visitor' : 'player' });
        if (activity) f.arrive(v);
        const value = hear(v, text, { speaker }); assert.equal(capture(api.create(), value), true);
        for (const edit of [q => { delete q.antecedent; }, q => { q.antecedent.result.understandings[0].known = {}; },
            q => { q.antecedent.receipt.inputKnowledge.meanings = []; }]) {
            const changed = copy(value); edit(changed.receipt); assert.equal(capture(api.create(), changed), false);
        }
    }
    const absent = hear(setup(), text); assert.equal(absent.result.interpretations[2].kind, 'unknown');
    assert.equal(capture(api.create(), absent), false);
});
test('unknown and incomplete clauses remain distinct from recognized teaching and complete naming', () => {
    for (const tail of ['うん', 'ぽぽは休むことだよ']) {
        const v = hear(arrived(), dynamicRaw + '\n' + tail), b = api.create(); assert.equal(capture(b, v), true);
        const c = b.read()[0].captured; assert.deepEqual(c.unknownIndices, [3]); assert.equal(c.clauses[3].understanding.complete, false);
    }
    const v = hear(arrived({ life: false }), dynamicRaw + '\n木の実をももって呼ぼう'), b = api.create();
    assert.equal(capture(b, v), true); const c = b.read()[0].captured;
    assert.deepEqual(c.completeNamingIndices, [0, 1]); assert.deepEqual(c.incompleteNamingIndices, [3]);
    assert.deepEqual(c.namingDetails[2].learning, v.result.learning[3]); assert.ok(c.missingBefore[3].length);
    for (const i of [2, 3]) { const changed = copy(v); changed.result.learning[i] = { invented: true }; assert.equal(capture(api.create(), changed), false); }
});
test('repetition, new inputs, delayed copies and later activity never rewrite earlier understanding', () => {
    const v = setup(), b = api.create(), text = 'これをころって呼ぼう\nこれをころって呼ぼう\n何を手伝った？';
    const first = hear(v, text); assert.deepEqual(first.result.learning.slice(0, 2).map(l => l.updated.length), [1, 0]);
    assert.equal(capture(b, first), true); const saved = b.read();
    const next = hear(v, text); assert.equal(capture(b, next), true); assert.equal(b.read().length, 2);
    assert.equal(capture(b, first), false); assert.deepEqual(b.read()[0], saved[0]);
    f.life.start(v, 'rest'); f.life.finish(v); hear(v, 'さっきの説明は間違えた');
    const delayed = api.create(); assert.equal(capture(delayed, first), true); assert.deepEqual(delayed.read(), saved);
});
test('77 prior supplemental and 47 older input contracts retain ownership', () => {
    const audit = require('../scripts/experimental/diary_audit');
    const owners = audit.supplementalInventory().filter(r => r.id !== '4d12do'); assert.equal(owners.length, 82);
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
test('malformed journals cannot retain invalid data and copied records remain independent', () => {
    for (const value of [null, {}, { kind: 'wrong' }, { kind: 'multiple_naming_additional_clause_material', sourceId: 'input:0' }])
        assert.throws(() => api.create().retain(value), TypeError);
    const circular = {}; circular.self = circular; assert.equal(api.capture(api.create(), circular, {}), false);
    assert.equal(api.capture(api.create(), null, null), false);
});
