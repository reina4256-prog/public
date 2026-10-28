'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const api = require('../experimental_word_diary_dynamic_individual_reference_materials');
const f = require('../scripts/experimental/diary_dynamic_individual_reference_material_fixtures');
const candidates = require('../experimental_word_diary_candidates');
const { copy } = f, values = f.fixtures(), accepted = values.filter(row => row.expected);
const capture = (buffer, value) => api.capture(buffer, value.result, value.receipt);
test('82 prior supplemental and 47 older input contracts retain dynamic individual reference boundaries', () => {
    const audit = require('../scripts/experimental/diary_audit');
    const owners = audit.supplementalInventory().filter(r => r.id !== '4d12dt'); assert.equal(owners.length, 82);
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
for (const group of new Set(values.map(row => row.group))) test('dynamic individual reference material: ' + group, () => {
    for (const row of values.filter(item => item.group === group)) {
        const value = copy(row.value), stable = JSON.stringify(value), journal = api.create();
        assert.equal(capture(journal, value), row.expected, JSON.stringify([group, value.result.input.raw]));
        assert.equal(JSON.stringify(value), stable); assert.equal(capture(journal, value), false);
        if (!row.expected) { assert.deepEqual(journal.read(), []); continue; }
        const record = journal.read()[0], c = record.captured, r = value.result, q = value.receipt;
        assert.equal(record.kind, 'dynamic_individual_reference_material'); assert.equal(record.sourceId, r.input.id);
        assert.deepEqual(c.originalResult, r); assert.deepEqual(c.originalLearning, r.learning);
        assert.deepEqual(c.originalTransfer, r.transfer); assert.deepEqual(c.response, q.reply);
        assert.deepEqual(c.expression, r.expression); assert.deepEqual(c.inputKnowledge, q.inputKnowledge);
        assert.deepEqual(c.inputContext, q.inputContext); assert.equal(c.understandingStatus, 'per_clause');
        assert.deepEqual(c.sources.state, { before: q.beforeState, after: q.afterState });
        assert.deepEqual(c.sources.activity, { before: q.beforeWorld, after: q.afterWorld });
        assert.deepEqual(c.referenceOrigins, q.origins);
        assert.deepEqual(c.referenceIndices, r.interpretations.flatMap((frame, i) => frame.kind === 'reference' ? [i] : []));
        assert.deepEqual(c.clauses, r.interpretations.map((frame, index) => ({ index, span: frame.span, frame, understanding: r.understandings[index] })));
        assert.deepEqual(c.wordReferenceIndices, r.interpretations.flatMap((frame, i) => frame.kind === 'word_reference' ? [i] : []));
        assert.equal(c.wordReferenceSources.length, c.wordReferenceIndices.length);
        assert.deepEqual(c.dynamicNamingIndices, r.interpretations.flatMap((frame,i)=>frame.kind==='naming'&&!Object.hasOwn(frame,'catalogRule')?[i]:[]));
        assert.deepEqual(c.dynamicNamingSource.pendingQuestion,q.beforeState.context.pendingQuestion);
        assert.deepEqual(c.dynamicNamingSource.output,q.beforeState.context.lastOutput);
        for (const source of [...c.referenceSources, ...c.wordReferenceSources]) assert.deepEqual(source.originalUnderstanding, r.understandings[source.index]);
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
test('dynamic individual references reject occurrence tampering atomically', () => {
    let rejected = 0;
    for (const row of accepted) for (const edit of edits) {
        const value = copy(row.value), journal = api.create(); edit(value);
        assert.equal(capture(journal, value), false, row.group); assert.deepEqual(journal.read(), []); rejected++;
    }
    console.log(JSON.stringify({ fixtures: values.length, accepted: accepted.length, occurrenceMutations: edits.length, rejected }));
});

test('both reference families require their exact independent origins', () => {
    let rejected = 0;
    for (const row of accepted) for (let i = 0; i < row.value.receipt.origins.length; i++) for (const edit of [
        v => { v.receipt.origins.splice(i, 1); },
        v => { v.receipt.origins.push(copy(v.receipt.origins[i])); },
        v => { v.receipt.origins[i].result.input.speaker += ':wrong'; },
        v => { v.receipt.origins[i].beforeState.serial++; },
        v => { v.receipt.origins[i].afterState.knowledge.associations = []; v.receipt.origins[i].afterState.knowledge.wordExplanations = []; }
    ]) { const value = copy(row.value), journal = api.create(); edit(value); assert.equal(capture(journal, value), false, row.group); assert.deepEqual(journal.read(), []); rejected++; }
    const v = f.prepare({}, 'normal', 'player', false); f.focus(v, ['berry:2']); f.hear(v, 'これを無関係って呼ぼう'); f.focus(v); f.arrive(v); const row = f.hear(v, f.raw);
    assert.equal(capture(api.create(), row), true); row.receipt.origins.push(copy(v.origins.at(-2)));
    assert.equal(capture(api.create(), row), false);
    console.log(JSON.stringify({ originMutationRejections: rejected }));
});

test('later teaching corrections and activities never rewrite the retained input', () => {
    const v = f.prepare(), first = f.hear(v, f.raw), journal = api.create(); assert.equal(capture(journal, first), true);
    const saved = JSON.stringify(journal.read()); const newer = f.prepare({}, 'normal', 'player', false);
    f.hear(newer, '未解析!'); f.arrive(newer); const next = f.hear(newer, f.raw); assert.equal(capture(journal, next), true);
    f.hear(v, 'さっき間違えた。ぽぽは眠ることだよ'); f.life.start(v, 'rest'); f.life.finish(v);
    assert.equal(JSON.stringify(journal.read().slice(0, 1)), saved); assert.equal(capture(journal, first), false);
    const unknown = f.setup(), old = f.hear(unknown, f.raw); f.hear(unknown, 'これをぴぴって呼ぼう'); f.hear(unknown, 'ぽぽは休むことだよ');
    assert.equal(capture(api.create(), old), false);
});

test('dynamic individual reference journal rejects malformed and non-JSON values', () => {
    for (const value of [null, {}, { kind: 'wrong' }, { kind: 'dynamic_individual_reference_material', sourceId: 'input:0' }]) assert.throws(() => api.create().retain(value), TypeError);
    const circular = {}; circular.self = circular; assert.equal(api.capture(api.create(), circular, {}), false);
    assert.equal(api.capture(api.create(), null, null), false);
});

test('actual activity evidence and player antecedents are separately required', () => {
    const edits = [v => { delete v.receipt.beforeState.context.pendingQuestion; },
        v => { v.receipt.beforeState.context.lastOutput.source.eventId++; },
        v => { v.receipt.beforeState.context.lastOutput.response.message = 'invented'; },
        v => { v.receipt.beforeWorld.askedNames = {}; },
        v => { v.receipt.beforeWorld.history = []; },
        v => { v.receipt.beforeWorld.activityStart++; },
        v => { v.receipt.beforeState.context.pendingQuestion.expires++; },
        v => { v.receipt.beforeState.context.lastOutput.source.at++; },
        v => { delete v.receipt.antecedent; },
        v => { v.receipt.antecedent.result.input.at++; }];
    let rejected = 0;
    for (const row of accepted) for (const edit of edits) {
        const v = copy(row.value); edit(v); const journal = api.create();
        assert.equal(capture(journal, v), false, row.group); assert.deepEqual(journal.read(), []); rejected++;
    }
    console.log(JSON.stringify({ activityAndAntecedentMutationRejections: rejected }));
});

test('incomplete naming and individual ambiguity remain separate from activity output', () => {
    const partials = accepted.filter(row => row.value.result.understandings.some((u,i)=>row.value.result.interpretations[i].kind==='naming'&&!u.complete));
    assert.ok(partials.length);
    assert.ok(partials.some(row=>row.value.result.understandings.some((u,i)=>row.value.result.interpretations[i].kind==='naming'&&u.target.adopted===null)));
    for(const row of partials){const journal=api.create();assert.equal(capture(journal,row.value),true);
        assert.deepEqual(journal.read()[0].captured.understandings,row.value.result.understandings);}
    const ambiguous=accepted.find(row=>row.value.result.understandings.some((u,i)=>row.value.result.interpretations[i].kind==='reference'&&!u.complete));assert.ok(ambiguous);
    const journal=api.create();assert.equal(capture(journal,ambiguous.value),true);assert.equal(journal.read()[0].captured.referenceSources[0].candidates.length,2);
});

test('optional word sources retain correction chains and per-use origin mapping', () => {
    const withWords=accepted.filter(row=>row.value.result.interpretations.some(f=>f.kind==='word_reference'));assert.ok(withWords.length);
    assert.ok(accepted.some(row=>!row.value.result.interpretations.some(f=>f.kind==='word_reference')));
    for(const row of withWords){const journal=api.create();assert.equal(capture(journal,row.value),true);const c=journal.read()[0].captured;
        assert.deepEqual(c.referenceOriginUsages,c.referenceOrigins.map(o=>({inputId:o.result.input.id,
            individualIndices:c.referenceSources.filter(s=>s.originIds.includes(o.result.input.id)).map(s=>s.index),
            wordIndices:c.wordReferenceSources.filter(s=>s.originIds.includes(o.result.input.id)).map(s=>s.index)})));
        assert.deepEqual(c.wordReferenceSources.map(s=>s.originalUnderstanding),c.wordReferenceIndices.map(i=>row.value.result.understandings[i]));}
    const chain=withWords.find(row=>row.group==='source:chain');assert.ok(chain);
    for(const origin of chain.value.receipt.origins){const altered=copy(chain.value);altered.receipt.origins=altered.receipt.origins.filter(o=>o.result.input.id!==origin.result.input.id);assert.equal(capture(api.create(),altered),false);}
});
