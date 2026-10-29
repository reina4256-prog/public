'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const api = require('../experimental_word_diary_dynamic_naming_report_materials');
const f = require('../scripts/experimental/diary_dynamic_naming_report_material_fixtures');
const candidates = require('../experimental_word_diary_candidates');
const { copy } = f, values = f.fixtures(), accepted = values.filter(row => row.expected);
const capture = (buffer, value) => api.capture(buffer, value.result, value.receipt);

test('complete and incomplete dynamic naming require actual activity evidence independently', () => {
    let rejected = 0;
    const edits = [
        v => { delete v.receipt.beforeState.context.pendingQuestion; },
        v => { v.receipt.beforeState.context.pendingQuestion.target = 'invented'; },
        v => { v.receipt.beforeState.context.pendingQuestion.expires++; },
        v => { v.receipt.beforeState.context.lastOutput.source.eventId++; },
        v => { v.receipt.beforeState.context.lastOutput.source.at++; },
        v => { v.receipt.beforeState.context.lastOutput.response.message = 'invented'; },
        v => { v.receipt.beforeState.context.lastOutput.listener = 'visitor'; },
        v => { v.receipt.beforeWorld.history = []; },
        v => { v.receipt.beforeWorld.event++; },
        v => { v.receipt.beforeWorld.askedNames = {}; },
        v => { v.receipt.beforeWorld.destination = 'invented'; },
        v => { v.receipt.beforeWorld.activityStart++; }
    ];
    assert.ok(accepted.some(r => r.value.result.understandings.some(u => u.kind === 'naming' && !u.complete)));
    assert.ok(accepted.some(r => r.value.result.understandings.filter(u => u.kind === 'naming' && u.complete).length > 1));
    for (const row of accepted) for (const edit of edits) {
        const value = copy(row.value), stable = JSON.stringify(value); edit(value);
        assert.notEqual(JSON.stringify(value), stable);
        const journal = api.create(); assert.equal(capture(journal, value), false);
        assert.deepEqual(journal.read(), []); rejected++;
    }
    console.log(JSON.stringify({ activityEvidenceRejections: rejected }));
});
test('naming candidates, original adoption and updates cannot be rewritten as successful understanding', () => {
    let rejected = 0;
    for (const row of accepted) for (const index of row.value.result.interpretations.flatMap((frame, i) => frame.kind === 'naming' ? [i] : [])) {
        for (const field of ['candidates', 'adopted', 'updated']) {
            const value = copy(row.value); value.result.learning[index][field] = { invented: true };
            const journal = api.create(); assert.equal(capture(journal, value), false); assert.deepEqual(journal.read(), []); rejected++;
        }
    }
    assert.ok(rejected > 0); console.log(JSON.stringify({ namingLearningRejections: rejected }));
});

test('consistent receiver replays cannot replace the original arrival event or movement history', () => {
    for (const edit of [v => { v.receipt.beforeWorld.event++; }, v => { v.receipt.beforeWorld.history = []; }]) {
        const value = copy(accepted[0].value), q = value.receipt; edit(value);
        const state = copy(q.beforeState), world = copy(q.beforeWorld), input = value.result.input;
        assert.ok(f.worldApi.validContext(state, world));
        value.result = f.core.receive(state, input.raw, f.catalog, { locale: input.locale, speaker: input.speaker, at: input.at });
        q.reply = f.worldApi.respond(world, value.result, state, f.catalog);
        q.afterState = copy(state); q.afterWorld = copy(world);
        assert.ok(f.expected(value)); assert.ok(f.worldApi.validContext(state, world));
        const journal = api.create(); assert.equal(capture(journal, value), false); assert.deepEqual(journal.read(), []);
    }
});
test('retained argument and repeated identifiers preserve the first occurrence independently', () => {
    const value = copy(accepted[0].value); let retained;
    assert.equal(capture({ retain(record) { retained = record; return true; } }, value), true);
    const saved = JSON.stringify(retained); value.result.input.raw = 'changed'; value.receipt.beforeState.knowledge.meanings = [];
    assert.equal(JSON.stringify(retained), saved);
    const journal = api.create(); assert.equal(journal.retain(retained), true);
    const changed = copy(retained); changed.captured.originalResult.input.raw = 'different-content';
    assert.equal(journal.retain(changed), false); assert.equal(JSON.stringify(journal.read()[0]), saved);
    retained.captured.sources.input.raw = 'changed-again'; assert.equal(JSON.stringify(journal.read()[0]), saved);
});
for (const group of new Set(values.map(row => row.group))) test('dynamic naming report material: ' + group, () => {
    for (const row of values.filter(item => item.group === group)) {
        const value = copy(row.value), stable = JSON.stringify(value), journal = api.create();
        assert.equal(capture(journal, value), row.expected, JSON.stringify([group, value.result.input.raw]));
        assert.equal(JSON.stringify(value), stable); assert.equal(capture(journal, value), false);
        assert.equal(journal.read().length, Number(row.expected)); if (!row.expected) continue;
        const record = journal.read()[0], c = record.captured, r = value.result, q = value.receipt;
        assert.equal(record.kind, 'dynamic_naming_report_material'); assert.equal(record.sourceId, r.input.id);
        assert.deepEqual(c.sources.input, r.input); assert.deepEqual(c.sources.frames, r.interpretations);
        assert.deepEqual(c.sources.state, { before: q.beforeState, after: q.afterState });
        assert.deepEqual(c.sources.activity, { before: q.beforeWorld, after: q.afterWorld });
        assert.deepEqual(c.sources.antecedent, q.antecedent || null);
        assert.deepEqual(c.inputKnowledge, q.inputKnowledge); assert.deepEqual(c.inputContext, q.inputContext);
        assert.deepEqual(c.inputFeelingLearning, q.beforeState.feelingLearning || null);
        assert.deepEqual(c.understandings, r.understandings); assert.equal(c.understandingStatus, 'per_clause');
        assert.deepEqual(c.clauseIndices, r.interpretations.map((_, index) => index));
        assert.deepEqual(c.clauses, r.interpretations.map((frame, index) => ({ index, span: frame.span, frame, understanding: r.understandings[index] })));
        assert.deepEqual(c.reportIndices, r.interpretations.flatMap((frame, i) => ['feeling_report', 'external_event_report'].includes(frame.catalogRule) ? [i] : []));
        assert.deepEqual(c.originalResult, r); assert.deepEqual(c.originalLearning, r.learning); assert.deepEqual(c.originalTransfer, r.transfer);
        assert.deepEqual(c.expression, r.expression); assert.deepEqual(c.response, q.reply);
        assert.deepEqual(c.actualTurn, q.afterState.context.turns.at(-1));
        assert.equal(c.answerRecorded, Object.hasOwn(c.actualTurn, 'answer')); assert.deepEqual(c.turnAnswer, c.actualTurn.answer ?? null);
        assert.deepEqual(c.missingBefore, r.understandings.map(u => u.unresolved));
        assert.equal(c.actualSpeaker, r.input.speaker);
        assert.deepEqual(c.namingIndices, r.interpretations.flatMap((frame, i) => frame.kind === 'naming' ? [i] : []));
        assert.deepEqual(c.completeNamingIndices, c.namingIndices.filter(i => r.understandings[i].complete));
        assert.deepEqual(c.incompleteNamingIndices, c.namingIndices.filter(i => !r.understandings[i].complete));
        assert.deepEqual(c.dynamicNamingIndices, c.namingIndices.filter(i => !Object.hasOwn(r.interpretations[i], 'catalogRule')));
        assert.deepEqual(c.catalogNamingIndices, c.namingIndices.filter(i => Object.hasOwn(r.interpretations[i], 'catalogRule')));
        assert.deepEqual(c.activityNamingSource, { pendingQuestion: q.beforeState.context.pendingQuestion,
            output: q.beforeState.context.lastOutput, source: q.beforeState.context.lastOutput.source, activityBefore: q.beforeWorld });
        assert.deepEqual(c.namingSources, c.namingIndices.map(index => ({ index, frame: r.interpretations[index], understanding: r.understandings[index], learning: r.learning[index] })));
        for (const key of ['captureAddsTeaching', 'captureAddsLearning', 'captureAddsExperience', 'captureAddsFeeling']) assert.equal(c[key], false);
        const saved = JSON.stringify(journal.read()); journal.read()[0].captured.clauses[0].span = 'changed';
        value.result.input.raw = 'changed'; q.inputKnowledge.meanings = []; assert.equal(JSON.stringify(journal.read()), saved);
    }
});
const edits = [
    v => { v.result.input.raw += ':changed'; }, v => { v.result.input.id = 'input:0'; },
    v => { v.result.input.locale = 'en'; }, v => { v.result.input.speaker += ':changed'; },
    v => { v.result.input.at++; }, v => { v.result.input.scene += ':changed'; },
    v => { v.result.interpretations[0].span += ':changed'; }, v => { v.result.interpretations.reverse(); },
    v => { v.result.understandings[0].complete = !v.result.understandings[0].complete; },
    v => { v.result.understandings[0].subject = 'invented'; }, v => { v.result.understandings[0].eventTime = 'invented'; },
    v => { v.result.understandings[0].testimony = { verified: true }; },
    v => { v.result.understandings[0].reportSource = { kind: 'experience' }; },
    v => { v.result.understandings[0].unresolved = [{ type: 'invented' }]; },
    v => { v.result.learning = [{ invented: true }]; }, v => { v.result.transfer = [{ invented: true }]; },
    v => { v.receipt.input.raw += ':changed'; }, v => { v.receipt.inputKnowledge.meanings.push({ id: 'invented' }); },
    v => { v.receipt.inputContext.scene += ':changed'; }, v => { v.receipt.beforeState.serial++; },
    v => { v.receipt.reply.message = 'invented'; }, v => { v.receipt.afterState.serial++; },
    v => { v.receipt.afterWorld.experiences.push({ id: 999, kind: 'invented' }); },
    v => { v.receipt.afterWorld.elapsed++; }, v => { v.receipt.afterState.context.turns.at(-1).answer = { invented: true }; },
    v => { delete v.receipt.beforeWorld; }, v => { delete v.receipt.afterState; },
    v => { v.result.relationLearning = { invented: true }; }, v => { v.result.conditionJudgment = { status: 'met' }; }
];
test('dynamic naming report source, understanding, testimony and actual response alterations reject atomically', () => {
    let rejected = 0, identical = 0;
    for (const row of accepted) for (const edit of edits) {
        const value = copy(row.value), stable = JSON.stringify(value); edit(value);
        if (JSON.stringify(value) === stable) { identical++; continue; }
        const journal = api.create(); assert.equal(capture(journal, value), false, JSON.stringify([row.group, edits.indexOf(edit)]));
        assert.deepEqual(journal.read(), []); rejected++;
    }
    console.log(JSON.stringify({ rows: values.length, accepted: accepted.length, kinds: edits.length, rejected, identical }));
});
test('actual preceding input is required independently of the current report and recovery text', () => {
    let rejected = 0;
    for (const row of accepted.filter(r => r.value.receipt.antecedent)) for (const edit of [
        v => { delete v.receipt.antecedent; }, v => { v.receipt.antecedent.result.input.at++; },
        v => { v.receipt.antecedent.receipt.reply.message = 'invented'; },
        v => { v.receipt.antecedent.receipt.afterState.serial++; },
        v => { v.receipt.antecedent.receipt.antecedent = copy(v.receipt.antecedent); }
    ]) { const value = copy(row.value); edit(value); assert.equal(capture(api.create(), value), false); rejected++; }
    const value = f.hear(f.setup(), f.raw); value.receipt.antecedent = copy(accepted.find(r => r.value.receipt.antecedent).value.receipt.antecedent);
    assert.equal(capture(api.create(), value), false); console.log(JSON.stringify({ precedingInputRejections: rejected + 1 }));
});
test('reports do not invent testimony, detail knowledge, feelings or answers', () => {
    assert.ok(values.some(r => !r.expected && r.value.result.input.speaker === 'visitor'));
    assert.ok(accepted.some(r => r.value.result.understandings.some(u => u.subject === null)));
    assert.ok(accepted.some(r => r.value.result.understandings.some(u => u.unresolved.some(e => e.type === 'detail'))));
    for (const row of accepted) {
        const journal = api.create(); assert.equal(capture(journal, row.value), true);
        const c = journal.read()[0].captured;
        for (let i = 0; i < c.understandings.length; i++) for (const key of ['reportSource', 'testimony', 'subject', 'eventTime', 'known']) {
            assert.equal(Object.hasOwn(c.understandings[i], key), Object.hasOwn(row.value.result.understandings[i], key));
            assert.deepEqual(c.understandings[i][key], row.value.result.understandings[i][key]);
        }
    }
});
test('later knowledge and real activities never revise or create an earlier report', () => {
    const v = f.setup(); v.state.knowledge.relations = v.state.knowledge.relations.filter(r => r.id !== 'naming');
    const first = f.hear(v, f.raw), journal = api.create();
    assert.equal(capture(journal, first), true); const saved = JSON.stringify(journal.read());
    f.hear(v, 'ぽぽは休むことだよ'); f.life.start(v, 'rest'); f.life.finish(v);
    assert.equal(JSON.stringify(journal.read()), saved); assert.equal(capture(journal, first), false);
    const later = f.hear(v, f.raw); assert.equal(capture(journal, later), false); assert.equal(journal.read().length, 1);
    assert.equal(JSON.stringify(journal.read().slice(0, 1)), saved);
    const missing = copy(first); delete missing.receipt.beforeState; assert.equal(capture(api.create(), missing), false);
    assert.equal(capture(api.create(), first), true);
});
test('dynamic naming report journal rejects malformed, cyclic, non-JSON and unsafe identifiers', () => {
    for (const value of [null, {}, { kind: 'wrong' }, { kind: 'dynamic_naming_report_material', sourceId: 'input:0' }]) assert.throws(() => api.create().retain(value), TypeError);
    const cyclic = {}; cyclic.self = cyclic; assert.equal(api.capture(api.create(), cyclic, {}), false);
    assert.equal(api.capture(api.create(), null, null), false);
    const value = copy(accepted[0].value); value.result.input.at = Infinity; assert.equal(capture(api.create(), value), false);
});
test('83 prior supplemental and 47 older input contracts retain dynamic naming report report boundaries', () => {
    const audit = require('../scripts/experimental/diary_audit');
    const owners = audit.supplementalInventory().filter(o => o.id !== '4d12dw'); assert.equal(owners.length, 87);
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
