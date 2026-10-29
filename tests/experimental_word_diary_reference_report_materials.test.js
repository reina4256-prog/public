'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const api = require('../experimental_word_diary_reference_report_materials');
const f = require('../scripts/experimental/diary_reference_report_material_fixtures');
const candidates = require('../experimental_word_diary_candidates');
const { copy } = f, values = f.fixtures(), accepted = values.filter(row => row.expected);
const capture = (journal, value) => api.capture(journal, value.result, value.receipt);

test('reference report materials preserve all original clauses, sources and responses independently', () => {
    for (const row of values) {
        const v = copy(row.value), before = JSON.stringify(v), journal = api.create();
        assert.equal(capture(journal, v), row.expected, row.group); assert.equal(JSON.stringify(v), before);
        if (!row.expected) { assert.deepEqual(journal.read(), []); continue; }
        const c = journal.read()[0].captured, r = v.result, q = v.receipt;
        assert.equal(journal.read()[0].kind, 'reference_report_material');
        assert.equal(journal.read()[0].occurrenceId, 'reference_report_material:' + r.input.id);
        assert.deepEqual(c.sources.input, r.input); assert.deepEqual(c.sources.frames, r.interpretations);
        assert.deepEqual(c.sources.state, { before: q.beforeState, after: q.afterState });
        assert.deepEqual(c.sources.activity, { before: q.beforeWorld, after: q.afterWorld });
        assert.deepEqual(c.sources.antecedent, q.antecedent || null);
        assert.deepEqual(c.inputKnowledge, q.inputKnowledge); assert.deepEqual(c.inputContext, q.inputContext);
        assert.deepEqual(c.inputFeelingLearning, q.beforeState.feelingLearning || null);
        assert.deepEqual(c.referenceOrigins, q.origins); assert.deepEqual(c.originalResult, r);
        assert.deepEqual(c.originalLearning, r.learning); assert.deepEqual(c.originalTransfer, r.transfer);
        assert.deepEqual(c.expression, r.expression); assert.deepEqual(c.response, q.reply);
        assert.deepEqual(c.clauseIndices, r.interpretations.map((_, index) => index));
        assert.deepEqual(c.clauses, r.interpretations.map((frame, index) => ({ index, span: frame.span, frame, understanding: r.understandings[index] })));
        assert.deepEqual(c.understandings, r.understandings); assert.deepEqual(c.missingBefore, r.understandings.map(u => u.unresolved));
        for (const [field, kind] of [['referenceIndices', 'reference'], ['wordReferenceIndices', 'word_reference'], ['reportIndices', 'report'], ['unknownIndices', 'unknown']])
            assert.deepEqual(c[field], r.interpretations.flatMap((frame, i) => frame.kind === kind ? [i] : []));
        assert.equal(c.understandingStatus, 'per_clause'); assert.equal(c.actualSpeaker, r.input.speaker);
        assert.deepEqual(c.actualTurn, q.afterState.context.turns.at(-1));
        assert.equal(c.answerRecorded, Object.hasOwn(c.actualTurn, 'answer')); assert.deepEqual(c.turnAnswer, c.actualTurn.answer ?? null);
        for (const source of [...c.referenceSources, ...c.wordReferenceSources, ...c.reportSources]) assert.deepEqual(source.originalUnderstanding || source.understanding, r.understandings[source.index]);
        for (const key of ['captureAddsTeaching', 'captureAddsLearning', 'captureAddsExperience', 'captureAddsFeeling', 'actionDecisionRecorded', 'actualParticipation']) assert.equal(c[key], false);
        const saved = JSON.stringify(journal.read()); assert.equal(capture(journal, v), false);
        journal.read()[0].captured.referenceOrigins = []; v.receipt.origins = []; v.result.understandings = [];
        assert.equal(JSON.stringify(journal.read()), saved);
    }
    console.log(JSON.stringify({ fixtures: values.length, accepted: accepted.length }));
});

const edits = [
    v => { v.result.input.raw += ':changed'; }, v => { v.result.input.id = 'input:0'; },
    v => { v.result.input.locale = 'en'; }, v => { v.result.input.speaker += ':wrong'; },
    v => { v.result.input.at++; }, v => { v.result.input.scene += ':wrong'; },
    v => { v.result.interpretations[0].span += ':changed'; }, v => { v.result.understandings[0].complete = !v.result.understandings[0].complete; },
    v => { v.result.learning = []; }, v => { v.result.transfer = [{ acquired: true }]; },
    v => { v.result.expression.message = 'invented'; }, v => { v.receipt.input.raw += ':changed'; },
    v => { v.receipt.inputKnowledge.meanings.push({ id: 'invented' }); }, v => { v.receipt.inputContext.scene += ':changed'; },
    v => { v.receipt.beforeState.serial++; }, v => { v.receipt.beforeWorld.elapsed++; },
    v => { v.receipt.reply.message = 'invented'; }, v => { v.receipt.afterState.context.turns.at(-1).answer = {}; },
    v => { v.receipt.afterWorld.elapsed++; }, v => { v.result.conditionJudgment = {}; },
    v => { v.result.sequenceJudgment = {}; }, v => { v.result.relationLearning = {}; },
    v => { delete v.receipt.beforeState; }, v => { delete v.receipt.afterWorld; },
    v => { delete v.receipt.origins; }, v => { v.receipt.beforeState.feelingLearning = { events: [{ invented: true }], knowledge: [] }; }
];
test('reference report occurrence alterations reject atomically', () => {
    for (const row of accepted) for (const edit of edits) {
        const v = copy(row.value), journal = api.create(); edit(v); assert.notDeepEqual(v, row.value);
        assert.equal(capture(journal, v), false, row.group); assert.deepEqual(journal.read(), []);
    }
    console.log(JSON.stringify({ occurrenceMutationKinds: edits.length, occurrenceRejections: edits.length * accepted.length }));
});

test('each reference origin must be present, unique and independently reproducible', () => {
    let rejected = 0;
    for (const row of accepted) for (let i = 0; i < row.value.receipt.origins.length; i++) for (const edit of [
        v => { v.receipt.origins.splice(i, 1); }, v => { v.receipt.origins.push(copy(v.receipt.origins[i])); },
        v => { v.receipt.origins[i].result.input.speaker += ':wrong'; }, v => { v.receipt.origins[i].beforeState.serial++; },
        v => { v.receipt.origins[i].afterState.knowledge.associations = []; v.receipt.origins[i].afterState.knowledge.wordExplanations = []; }
    ]) {
        const v = copy(row.value), journal = api.create(); edit(v); assert.notDeepEqual(v, row.value);
        assert.equal(capture(journal, v), false, row.group); assert.deepEqual(journal.read(), []); rejected++;
    }
    console.log(JSON.stringify({ originRejections: rejected }));
});

test('extra unrelated sources do not rescue a reference report', () => {
    const v = f.prepare(); f.hear(v, 'これを無関係って呼ぼう'); const value = f.hear(v, f.raw);
    assert.equal(capture(api.create(), value), true); value.receipt.origins.push(copy(v.origins.at(-2)));
    assert.equal(capture(api.create(), value), false);
});

test('shared source is supplied once with separate individual and word usages', () => {
    const row = accepted.find(r => r.group === 'source:shared-origin' && r.value.result.interpretations.some(f => f.kind === 'reference') && r.value.result.interpretations.some(f => f.kind === 'word_reference'));
    assert.ok(row); const journal = api.create(); assert.equal(capture(journal, row.value), true);
    const c = journal.read()[0].captured, shared = c.referenceOriginUsages.filter(u => u.individualIndices.length && u.wordIndices.length);
    assert.equal(shared.length, 1); assert.equal(c.referenceOrigins.filter(o => o.result.input.id === shared[0].inputId).length, 1);
    assert.equal(c.wordReferenceSources[0].resolution.adopted, null); assert.equal(c.wordReferenceSources[0].originalUnderstanding.complete, false);
});

for (const group of ['two-targets', 'multiple-evidence', 'meaning-conflict', 'same-meaning', 'chain', 'individual-conflict', 'individual-corrected'])
    test('reference report preserves original source resolution: ' + group, () => {
        const row = accepted.find(r => r.group === 'source:' + group && r.value.result.interpretations.some(f => f.kind === 'reference') && r.value.result.interpretations.some(f => f.kind === 'word_reference'));
        assert.ok(row); const journal = api.create(); assert.equal(capture(journal, row.value), true); const c = journal.read()[0].captured;
        if (group === 'two-targets') { assert.equal(c.referenceSources[0].candidates.length, 2); assert.equal(c.referenceSources[0].resolution.adopted, null); }
        if (group === 'multiple-evidence') assert.equal(c.referenceSources[0].candidates[0].evidence.length, 2);
        if (group === 'same-meaning') assert.equal(c.wordReferenceSources[0].candidates.length, 2);
        if (group.includes('conflict')) { assert.equal(c.wordReferenceSources[0].resolution.adopted, null); assert.equal(c.wordReferenceSources[0].originalUnderstanding.complete, false); }
        if (['chain', 'individual-corrected'].includes(group)) {
            const v = copy(row.value), entry = v.receipt.beforeState.knowledge.wordExplanations.find(e => e.corrects);
            assert.ok(entry); entry.corrects = 'input:999'; assert.equal(capture(api.create(), v), false);
        }
    });

test('real antecedent is required independently of reference origins and current report', () => {
    let rejected = 0;
    for (const row of accepted) for (const edit of [
        v => { delete v.receipt.antecedent; }, v => { v.receipt.antecedent.result.input.at++; },
        v => { v.receipt.antecedent.receipt.reply.message = 'invented'; },
        v => { v.receipt.antecedent.receipt.antecedent = {}; }
    ]) { const v = copy(row.value); edit(v); assert.equal(capture(api.create(), v), false); rejected++; }
    console.log(JSON.stringify({ antecedentRejections: rejected }));
});

test('report subject time polarity testimony and unknown detail cannot be supplied by references', () => {
    let rejected = 0;
    for (const row of accepted) for (const edit of [
        frame => { frame.subject = frame.subject === 'other' ? 'self' : 'other'; },
        frame => { frame.eventTime = 'invented-time'; }, frame => { frame.aspect = 'invented-aspect'; },
        frame => { frame.polarity = 'invented-polarity'; }, frame => { frame.reportSource = { invented: true }; },
        frame => { frame.testimony = { invented: true }; }, frame => { frame.time = 'invented-time'; },
        (_frame, u) => { u.subject = 'invented-subject'; }, (_frame, u) => { u.eventTime = 'invented-time'; },
        (_frame, u) => { u.polarity = 'invented-polarity'; }, (_frame, u) => { u.aspect = 'invented-aspect'; },
        (_frame, u) => { u.reportSource = { invented: true }; }, (_frame, u) => { u.testimony = { invented: true }; }
    ]) {
        const v = copy(row.value), index = v.result.interpretations.findIndex(f => f.kind === 'report');
        edit(v.result.interpretations[index], v.result.understandings[index]);
        assert.notDeepEqual(v, row.value); assert.equal(capture(api.create(), v), false); rejected++;
    }
    for (const row of accepted) {
        const journal = api.create(); assert.equal(capture(journal, row.value), true); const c = journal.read()[0].captured;
        for (const s of c.reportSources) assert.deepEqual(s.frame, row.value.result.interpretations[s.index]);
    }
    console.log(JSON.stringify({ reportRejections: rejected }));
});

test('coherent current replays cannot substitute altered individual naming evidence for its original source', () => {
    const row = accepted.find(r => r.value.result.interpretations.some(f => f.kind === 'reference'));
    assert.ok(row); const value = copy(row.value), q = value.receipt;
    const link = q.beforeState.knowledge.associations.find(link => link.word === 'ぴぴ'); assert.ok(link);
    link.evidence[0].scene += ':altered'; q.inputKnowledge = copy(q.beforeState.knowledge);
    const state = copy(q.beforeState), world = copy(q.beforeWorld), i = value.result.input;
    assert.ok(f.worldApi.validContext(state, world)); assert.ok(f.worldApi.validSelections(state, world, f.catalog));
    value.result = f.core.receive(state, i.raw, f.catalog, { locale: i.locale, speaker: i.speaker, at: i.at });
    q.reply = f.worldApi.respond(world, value.result, state, f.catalog); q.afterState = state; q.afterWorld = world;
    assert.ok(f.worldApi.validContext(state, world)); assert.ok(f.worldApi.validSelections(state, world, f.catalog));
    assert.equal(f.expected(value), true); assert.equal(capture(api.create(), value), false);
});

test('later teaching correction and actual activities cannot rewrite or retrospectively add a reference', () => {
    const v = f.prepare(), value = f.hear(v, f.raw), journal = api.create(); assert.equal(capture(journal, value), true);
    const saved = JSON.stringify(journal.read()); const next = f.hear(v, f.raw); assert.equal(capture(journal, next), true);
    f.hear(v, 'さっき間違えた。ぽぽは眠ることだよ'); f.life.start(v, 'rest'); f.life.finish(v);
    assert.equal(JSON.stringify(journal.read().slice(0, 1)), saved); assert.equal(capture(journal, value), false);
    const blank = f.setup(), old = f.hear(blank, f.raw); f.hear(blank, 'これをぴぴって呼ぼう'); f.hear(blank, 'ぽぽは休むことだよ');
    assert.equal(capture(api.create(), old), false);
});

test('reference report journal rejects malformed cyclic non-JSON and unsafe identifiers', () => {
    for (const value of [null, {}, { kind: 'wrong' }, { kind: 'reference_report_material', sourceId: 'input:0' },
        { kind: 'reference_report_material', sourceId: 'input:9007199254740992', occurrenceId: 'reference_report_material:input:9007199254740992', captured: {} }]) assert.throws(() => api.create().retain(value), TypeError);
    const circular = {}; circular.self = circular; assert.equal(api.capture(api.create(), circular, {}), false);
    assert.equal(api.capture(api.create(), null, null), false);
    const v = copy(accepted[0].value); v.result.nonJSON = NaN; assert.equal(capture(api.create(), v), false);
});

test('86 prior supplemental and 47 older input contracts retain reference report boundaries', () => {
    const audit = require('../scripts/experimental/diary_audit');
    const owners = audit.supplementalInventory().filter(o => o.id !== '4d12dx'); assert.equal(owners.length, 87);
    const legacy = audit.inventory().filter(o => !['4d1', '4d3', '4d4'].includes(o.id)).map(o => {
        const old = require('../' + o.file), params = /function capture\(([^)]*)\)/.exec(old.capture.toString())[1].split(',').map(p => p.trim());
        assert.equal(params.length, o.arity); return { ...o, old, params };
    }); assert.equal(legacy.length, 47);
    for (const row of accepted) {
        const v = row.value, q = v.receipt, s = q.beforeState, w = q.beforeWorld, stable = JSON.stringify(v);
        for (const o of owners) { const old = require('../' + o.file); assert.equal(old.capture(old.create ? old.create() : candidates.create(), copy(v.result), copy(q)), false, o.id); }
        const context = { scene: s.context.scene, attention: s.context.attention, mode: w.mode, target: w.attention,
            activityStart: w.activityStart, elapsed: w.elapsed, hunger: w.hunger, fatigue: w.fatigue, mealTaste: w.mealTaste ?? null,
            destination: w.destination, history: w.history, experiences: w.experiences, priorExperiences: w.experiences,
            activityBefore: w.activityBefore ?? null, lastOutput: s.context.lastOutput };
        const named = { result: v.result, reply: q.reply, context, beforeKnowledge: s.knowledge,
            beforeExperiences: s.experiences || [], beforeSelections: s.selectionSources || [], beforeLessons: s.correctionLessons || [],
            beforeRecords: s.records, beforeTurns: s.context.turns, beforeFeelingLearning: s.feelingLearning || { events: [], knowledge: [] },
            beforeReports: [], beforeReceipts: [], decision: { speech: s.settings.speech, before: w, after: q.afterWorld,
                beforeSelections: s.selectionSources || [], afterSelections: q.afterState.selectionSources || [], response: q.reply } };
        for (const o of legacy) {
            const args = o.params.slice(1).map(p => { assert.ok(Object.hasOwn(named, p), p); return copy(named[p]); });
            assert.equal(o.old.capture(candidates.create(), ...args), false, o.id);
        }
        assert.equal(JSON.stringify(v), stable);
    }
    console.log(JSON.stringify({ priorSupplementalCalls: accepted.length * owners.length, priorInputCalls: accepted.length * legacy.length }));
});
