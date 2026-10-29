'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const api = require('../experimental_word_diary_incomplete_name_response_report_materials');
const f = require('../scripts/experimental/diary_incomplete_name_response_report_material_fixtures');
const candidates = require('../experimental_word_diary_candidates');
const { copy } = f, rows = f.fixtures(), accepted = rows.filter(row => row.expected);
const capture = (journal, value) => api.capture(journal, value.result, value.receipt);

test('incomplete name responses and reports preserve original clauses and occurrence snapshots', () => {
    for (const row of rows) {
        const value = copy(row.value), stable = JSON.stringify(value), journal = api.create();
        assert.equal(capture(journal, value), row.expected, row.group + ':' + value.result.input.raw);
        assert.equal(JSON.stringify(value), stable);
        if (!row.expected) { assert.deepEqual(journal.read(), []); continue; }
        const c = journal.read()[0].captured, r = value.result, q = value.receipt;
        assert.equal(journal.read()[0].kind, 'incomplete_name_response_report_material');
        assert.equal(journal.read()[0].occurrenceId, 'incomplete_name_response_report_material:' + r.input.id);
        assert.deepEqual(c.originalResult, r); assert.deepEqual(c.originalLearning, r.learning);
        assert.deepEqual(c.originalTransfer, r.transfer); assert.deepEqual(c.expression, r.expression);
        assert.deepEqual(c.response, q.reply); assert.deepEqual(c.sources.input, r.input);
        assert.deepEqual(c.sources.state, { before: q.beforeState, after: q.afterState });
        assert.deepEqual(c.sources.activity, { before: q.beforeWorld, after: q.afterWorld });
        assert.deepEqual(c.sources.antecedent, q.antecedent || null); assert.deepEqual(c.sources.origin, q.origin || null);
        assert.deepEqual(c.inputKnowledge, q.inputKnowledge); assert.deepEqual(c.inputContext, q.inputContext);
        assert.deepEqual(c.inputFeelingLearning, q.beforeState.feelingLearning || null);
        assert.deepEqual(c.clauses, r.interpretations.map((frame, index) => ({ index, span: frame.span, frame, understanding: r.understandings[index] })));
        assert.deepEqual(c.missingBefore, r.understandings.map(u => u.unresolved));
        assert.equal(c.understandingStatus, 'per_clause'); assert.equal(c.actualSpeaker, r.input.speaker);
        assert.deepEqual(c.actualTurn, q.afterState.context.turns.at(-1));
        assert.equal(c.answerRecorded, Object.hasOwn(c.actualTurn, 'answer')); assert.deepEqual(c.turnAnswer, c.actualTurn.answer ?? null);
        for (const [field, kind] of [['correctionIndices', 'correction'], ['replyIndices', 'reply'], ['unknownIndices', 'unknown']])
            assert.deepEqual(c[field], r.interpretations.flatMap((frame, index) => frame.kind === kind ? [index] : []));
        for (const source of [...c.responseSources, ...c.reportSources]) {
            assert.deepEqual(source.frame, r.interpretations[source.index]);
            assert.deepEqual(source.understanding, r.understandings[source.index]);
            assert.deepEqual(source.learning, r.learning[source.index]);
        }
        for (const source of c.responseSources) {
            assert.equal(source.understanding.complete, false);
            assert.ok(!Object.hasOwn(source.understanding, 'corrects'));
            assert.deepEqual(source.origin, source.frame.kind === 'reply' ? q.origin : null);
        }
        for (const key of ['captureAddsTeaching', 'captureAddsLearning', 'captureAddsExperience', 'captureAddsFeeling']) assert.equal(c[key], false);
    }
    console.log(JSON.stringify({ fixtures: rows.length, accepted: accepted.length }));
});

const edits = [
    v => { v.result.input.raw += ':changed'; }, v => { v.result.input.id = 'input:0'; },
    v => { v.result.input.locale = 'en'; }, v => { v.result.input.speaker += ':wrong'; },
    v => { v.result.input.at++; }, v => { v.result.input.scene += ':wrong'; },
    v => { v.result.interpretations[0].span += ':changed'; },
    v => { v.result.understandings[0].complete = !v.result.understandings[0].complete; },
    v => { v.result.learning = []; }, v => { v.result.transfer = [{ acquired: true }]; },
    v => { v.result.expression.message = 'invented'; }, v => { v.receipt.input.raw += ':changed'; },
    v => { v.receipt.inputKnowledge.meanings.push({ id: 'invented' }); }, v => { v.receipt.inputContext.scene += ':changed'; },
    v => { v.receipt.beforeState.serial++; }, v => { v.receipt.beforeWorld.elapsed++; },
    v => { v.receipt.reply.message = 'invented'; }, v => { v.receipt.afterState.context.turns.at(-1).answer = {}; },
    v => { v.receipt.afterWorld.elapsed++; }, v => { v.result.conditionJudgment = {}; },
    v => { v.result.sequenceJudgment = {}; }, v => { v.result.relationLearning = {}; },
    v => { delete v.receipt.beforeState; }, v => { delete v.receipt.afterWorld; },
    v => { v.receipt.beforeState.feelingLearning = { events: [{ invented: true }], knowledge: [] }; }
];
test('incomplete name response report occurrence alterations reject atomically', () => {
    for (const row of accepted) for (const edit of edits) {
        const value = copy(row.value), journal = api.create(); edit(value); assert.notDeepEqual(value, row.value);
        assert.equal(capture(journal, value), false, row.group); assert.deepEqual(journal.read(), []);
    }
    console.log(JSON.stringify({ edits: edits.length, rejections: accepted.length * edits.length }));
});

test('actual preceding input is required and replayed separately without fabricated correction success', () => {
    let count = 0;
    for (const row of accepted.filter(row => row.value.receipt.antecedent)) for (const edit of [
        v => { delete v.receipt.antecedent; },
        v => { v.receipt.antecedent.result.input.raw += ':changed'; },
        v => { v.receipt.antecedent.receipt.afterState.context.turns.at(-1).id = 'input:0'; },
        v => { v.receipt.antecedent.receipt.reply.message = 'invented'; },
        v => { v.receipt.antecedent.receipt.antecedent = copy(v.receipt.antecedent); }
    ]) {
        const value = copy(row.value), journal = api.create(); edit(value);
        assert.equal(capture(journal, value), false); assert.deepEqual(journal.read(), []); count++;
    }
    for (const row of accepted.filter(row => !row.value.receipt.antecedent)) {
        assert.ok(row.value.result.interpretations.every(frame => frame.kind !== 'reply'));
        const value = copy(row.value); value.receipt.antecedent = copy(accepted.find(r => r.value.receipt.antecedent).value.receipt.antecedent);
        assert.equal(capture(api.create(), value), false);
    }
    console.log(JSON.stringify({ antecedentRejections: count }));
});

const replyRows = accepted.filter(row => row.value.result.interpretations.some(frame => frame.kind === 'reply'));
test('unresolved replies require the original naming occurrence and unmodified active evidence', () => {
    assert.ok(replyRows.length);
    let count = 0;
    for (const row of replyRows) for (const edit of [
        v => { delete v.receipt.origin; },
        v => { v.receipt.origin.result.input.raw += ':changed'; },
        v => { v.receipt.origin.receipt.reply.message = 'invented'; },
        v => { v.receipt.origin.receipt.beforeState.serial++; },
        v => { v.receipt.origin.receipt.afterState.knowledge.associations = []; },
        v => { v.receipt.origin.receipt.antecedent = copy(v.receipt.origin); },
        v => { v.receipt.origin = copy(v.receipt.antecedent); v.receipt.origin.result.input.speaker = 'other'; }
    ]) {
        const value = copy(row.value), journal = api.create(); edit(value); assert.notDeepEqual(value, row.value);
        assert.equal(capture(journal, value), false); assert.deepEqual(journal.read(), []); count++;
    }
    console.log(JSON.stringify({ replySources: replyRows.length, originRejections: count }));
});

function replayCurrent(value) {
    const q = value.receipt, input = value.result.input, state = copy(q.beforeState), world = copy(q.beforeWorld);
    q.inputKnowledge = copy(state.knowledge); q.inputContext = copy(state.context);
    value.result = f.core.receive(state, input.raw, f.catalog, { locale: input.locale, speaker: input.speaker, at: input.at });
    q.reply = f.worldApi.respond(world, value.result, state, f.catalog); q.afterState = state; q.afterWorld = world;
}
test('coherently replayed current input cannot replace the original naming evidence', () => {
    for (const row of replyRows) {
        const value = copy(row.value), pending = value.receipt.beforeState.context.pendingQuestion;
        const link = value.receipt.beforeState.knowledge.associations.find(link => link.word === pending.word && link.target === pending.target);
        link.evidence.find(e => e.inputId === pending.inputId).raw += ':tampered';
        replayCurrent(value);
        assert.equal(capture(api.create(), value), false);
    }
});

test('corrections without a result target reject a fabricated success origin', () => {
    for (const row of accepted.filter(row => !row.value.receipt.origin)) {
        const value = copy(row.value); value.receipt.origin = copy(replyRows[0].value.receipt.origin);
        assert.equal(capture(api.create(), value), false);
    }
});

test('extra and duplicate origin containers cannot substitute for the response origin', () => {
    for (const row of accepted) {
        const value = copy(row.value); value.receipt.origins = [copy(replyRows[0].value.receipt.origin)];
        assert.equal(capture(api.create(), value), false);
    }
});

test('success flags, retraction and confirmation are never invented for incomplete responses', () => {
    for (const row of accepted) for (const edit of [
        v => { const i = v.result.interpretations.findIndex(frame => ['correction', 'reply'].includes(frame.kind)); v.result.understandings[i].corrects = 'input:1'; },
        v => { v.result.learning[0].retraction = 'input:1'; },
        v => { (v.receipt.afterState.knowledge.associations[0] ||= { word: 'invented', evidence: [] }).confirmedBy = v.result.input.id; },
        v => { (v.receipt.afterState.records[0] ||= { id: 'invented' }).retractedBy = v.result.input.id; }
    ]) {
        const value = copy(row.value); edit(value); assert.equal(capture(api.create(), value), false);
    }
});

test('complete reports do not make the incomplete response or the entire input complete', () => {
    const completeReport = accepted.filter(row => row.value.result.understandings.some(u => u.kind === 'report' && u.complete));
    assert.ok(completeReport.length);
    for (const row of completeReport) {
        const journal = api.create(); assert.equal(capture(journal, row.value), true);
        const c = journal.read()[0].captured;
        assert.equal(c.understandingStatus, 'per_clause'); assert.ok(c.responseSources.every(s => !s.understanding.complete));
    }
});

test('repetition keeps every clause and does not add confirmation evidence or repeat activities', () => {
    for (const row of accepted.filter(row => row.group === 'repetition-aliases-unknown')) {
        const journal = api.create(), q = row.value.receipt;
        assert.equal(capture(journal, row.value), true);
        assert.equal(journal.read()[0].captured.clauses.length, row.value.result.interpretations.length);
        assert.deepEqual(q.afterState.experiences, q.beforeState.experiences);
        assert.deepEqual(q.afterWorld.experiences, q.beforeWorld.experiences);
        assert.deepEqual(q.afterState.selectionSources, q.beforeState.selectionSources);
    }
});

test('retained copies and delayed captures are independent of future knowledge and activities', () => {
    for (const row of accepted) {
        const value = copy(row.value), journal = api.create(); assert.equal(capture(journal, value), true);
        const stable = JSON.stringify(journal.read()); assert.equal(capture(journal, value), false);
        journal.read()[0].captured.sources.state.before.knowledge.associations = [];
        value.receipt.beforeState.knowledge.meanings = []; value.result.understandings = [];
        assert.equal(JSON.stringify(journal.read()), stable); assert.equal(capture(journal, value), false);
        assert.equal(JSON.stringify(journal.read()), stable);
        const later = f.named(); f.life.start(later, 'rest'); f.life.finish(later);
        const delayed = api.create(); assert.equal(capture(delayed, row.value), true);
        assert.equal(JSON.stringify(delayed.read()), stable);
    }
});

test('new input occurrences remain separate while the same input never overwrites a record', () => {
    const v = f.setup(), journal = api.create();
    const one = f.hear(v, 'さっきの説明は間違えた\n私は悲しい');
    const two = f.hear(v, 'さっきの説明は間違えた\n私は悲しい');
    assert.equal(capture(journal, one), true); assert.equal(capture(journal, two), true);
    assert.equal(journal.read().length, 2); assert.notEqual(journal.read()[0].sourceId, journal.read()[1].sourceId);
    assert.equal(capture(journal, one), false); assert.equal(journal.read().length, 2);
});

test('invalid journal records reject without retaining partial data', () => {
    const journal = api.create();
    for (const value of [null, {}, { kind: 'incomplete_name_response_report_material', sourceId: 'input:0' }]) assert.throws(() => journal.retain(value), TypeError);
    assert.deepEqual(journal.read(), []);
});

test('all locales preserve actual parsing and existing owners keep the boundary controls', () => {
    for (const row of rows.filter(row => row.group === 'locale-control' || row.group === 'old-owner-boundary')) {
        assert.equal(capture(api.create(), row.value), row.expected);
        if (row.value.result.input.locale !== 'ja') assert.equal(row.expected, false);
    }
});

test('87 prior supplemental and 47 older input contracts retain incomplete response report boundaries', () => {
    const audit = require('../scripts/experimental/diary_audit');
    const owners = audit.supplementalInventory().filter(o => o.id !== '4d12dy'); assert.equal(owners.length, 87);
    const legacy = audit.inventory().filter(o => !['4d1', '4d3', '4d4'].includes(o.id)).map(o => {
        const old = require('../' + o.file), params = /function capture\(([^)]*)\)/.exec(old.capture.toString())[1].split(',').map(p => p.trim());
        assert.equal(params.length, o.arity); return { ...o, old, params };
    }); assert.equal(legacy.length, 47);
    for (const row of accepted) {
        const v = row.value, q = v.receipt, s = q.beforeState, w = q.beforeWorld;
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
    }
    console.log(JSON.stringify({ priorSupplementalCalls: accepted.length * owners.length, priorInputCalls: accepted.length * legacy.length }));
});
