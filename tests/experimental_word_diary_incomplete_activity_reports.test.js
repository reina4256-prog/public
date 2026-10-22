'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const api = require('../experimental_word_diary_incomplete_activity_reports');
const candidates = require('../experimental_word_diary_candidates');
const fixture = require('../scripts/experimental/diary_incomplete_activity_report_fixtures');
const { fixtures, prepared, setup, hear, forms, life, catalog, copy } = fixture;
const values = fixtures(), accepted = values.filter(f => f.expected);
const capture = (b, v) => api.capture(b, v.result, v.receipt);
function context(r) {
    const w = r.beforeWorld;
    return { scene: r.beforeState.context.scene, attention: r.beforeState.context.attention,
        mode: w.mode, target: w.attention, activityStart: w.activityStart, elapsed: w.elapsed,
        fatigue: w.fatigue, activityBefore: w.activityBefore ?? null };
}
for (const group of new Set(values.map(f => f.group))) test(`incomplete activity report: ${group}`, () => {
    for (const f of values.filter(f => f.group === group)) {
        const v = copy(f.value), original = JSON.stringify(v), b = api.create();
        assert.equal(capture(b, v), f.expected, JSON.stringify([group, v.result.input, v.result.understandings]));
        assert.equal(JSON.stringify(v), original); assert.equal(capture(b, v), false);
        assert.equal(b.read().length, Number(f.expected)); if (!f.expected) continue;
        const record = b.read()[0], c = record.captured, r = v.receipt, u = v.result.understandings[0];
        assert.equal(record.kind, 'incomplete_activity_report'); assert.equal(record.sourceId, v.result.input.id);
        assert.deepEqual(c.understanding, u); assert.equal(u.complete, false);
        assert.deepEqual(c.sources.frame, v.result.interpretations[0]);
        assert.deepEqual(c.expression, v.result.expression); assert.deepEqual(c.response, r.reply);
        assert.equal(c.actualSpeech, v.result.expression.channel === 'speech');
        assert.equal(c.answerRecorded, false); assert.equal(c.turnAnswer, null);
        assert.equal(c.reportVerified, false); assert.equal(c.reportedExperience, null);
        for (const field of ['newTeaching', 'newLearning', 'newExperience']) assert.equal(c[field], false);
        for (const field of ['roles', 'reportSource']) assert.equal(Object.hasOwn(c.understanding, field), Object.hasOwn(u, field));
        assert.deepEqual(c.sources.state, { before: r.beforeState, after: r.afterState });
        assert.deepEqual(c.sources.activity, { before: r.beforeWorld, after: r.afterWorld });
        assert.deepEqual(c.inputKnowledge, r.inputKnowledge); assert.deepEqual(c.inputContext, r.inputContext);
        assert.deepEqual(r.beforeWorld.experiences, r.afterWorld.experiences);
        assert.deepEqual(r.beforeState.knowledge, r.afterState.knowledge);
        assert.deepEqual(c.missingMeaningsBefore, u.unresolved.filter(x => x.type === 'meaning'));
        assert.deepEqual(c.missingRelationsBefore, u.unresolved.filter(x => x.type === 'relation').map(x => x.id));
        const saved = JSON.stringify(b.read()); b.read()[0].captured.sources.input.raw = 'edited';
        v.result.input.raw = 'edited'; r.inputKnowledge.meanings = [];
        assert.equal(JSON.stringify(b.read()), saved);
    }
});
const edits = [
    v => { v.result.input.raw = 'unrelated'; }, v => { v.result.input.id = 'input:0'; },
    v => { v.result.input.locale = 'other'; }, v => { v.result.input.speaker += ':tampered'; },
    v => { v.result.input.at++; }, v => { v.result.input.scene += ':other'; },
    v => { v.result.interpretations[0].meaning = 'walk'; }, v => { v.result.interpretations[0].kind = 'report_other'; },
    v => { v.result.interpretations[0].subject = 'invented'; }, v => { v.result.interpretations[0].polarity = 'invented'; },
    v => { v.result.interpretations[0].time = 'invented'; }, v => { v.result.interpretations[0].roles.verified = true; },
    v => { v.result.understandings[0].complete = true; }, v => { v.result.understandings[0].unresolved = []; },
    v => { v.result.understandings[0].subject = 'invented'; }, v => { v.result.understandings[0].polarity = 'invented'; },
    v => { v.result.understandings[0].eventTime = 'invented'; }, v => { v.result.understandings[0].roles = { verified: true }; },
    v => { v.result.understandings[0].reportSource = { kind: 'self_observation' }; },
    v => { v.result.understandings[0].known.meaning = 'invented'; },
    v => { v.result.expression.message = 'invented'; }, v => { v.result.expression.channel = 'invented'; },
    v => { v.receipt.input.raw += ':changed'; }, v => { v.receipt.inputKnowledge.meanings.push({ id: 'invented', source: 'initial' }); },
    v => { v.receipt.inputContext.scene += ':changed'; }, v => { v.receipt.beforeState.serial++; },
    v => { v.receipt.beforeWorld.elapsed++; }, v => { v.receipt.reply.message = 'invented'; },
    v => { v.receipt.afterState.knowledge.meanings.push({ id: 'invented', source: 'initial' }); },
    v => { v.receipt.afterWorld.elapsed++; }, v => { v.receipt.afterWorld.destination = 'invented'; },
    v => { v.receipt.afterWorld.experiences.push({ id: 999, kind: 'rest' }); },
    v => { v.receipt.afterState.context.turns.at(-1).answer = { response: { message: 'invented' } }; },
    v => { v.result.interpretations.push(copy(v.result.interpretations[0])); },
    v => { v.result.relationLearning = { relationAcquired: true }; },
    v => { v.result.understandings[0].eventReference = { experienceId: 1 }; },
    v => { delete v.receipt.beforeState; }, v => { delete v.receipt.afterWorld; }
];
test('tampered input, missing understanding, testimony source and response never retain', () => {
    for (const f of accepted) for (const edit of edits) {
        const v = copy(f.value), b = api.create(); edit(v);
        assert.equal(capture(b, v), false, JSON.stringify([f.group, f.value.result.input, edits.indexOf(edit)]));
        assert.deepEqual(b.read(), []);
    }
    console.log(JSON.stringify({ groups: new Set(values.map(f => f.group)).size, originals: values.length,
        accepted: accepted.length, mutations: edits.length, rejectedMutations: accepted.length * edits.length }));
});
test('existing owners do not duplicate incomplete activity reports with their proper argument shapes', () => {
    const owners = require('../scripts/experimental/diary_audit').supplementalInventory().filter(r => r.id !== '4d12cu');
    let calls = 0;
    for (const f of accepted) {
        const v = copy(f.value), original = JSON.stringify(v), r = v.receipt;
        for (const owner of owners) {
            const old = require('../' + owner.file), b = old.create ? old.create() : candidates.create();
            assert.equal(old.capture(b, copy(v.result), copy(r)), false, owner.id); calls++;
        }
        for (const name of ['reports', 'negation_reports', 'time_reports', 'remaining_time_reports', 'condition_proposals', 'sequence_proposals'])
            assert.equal(require('../experimental_word_diary_' + name).capture(candidates.create(), copy(v.result), context(r), copy(r.inputKnowledge)), false);
        const decision = { speech: r.beforeState.settings.speech, before: r.beforeWorld, after: r.afterWorld,
            beforeSelections: r.beforeState.selectionSources || [], afterSelections: r.afterState.selectionSources || [], response: r.reply };
        assert.equal(require('../experimental_word_diary_proposals').capture(candidates.create(), copy(v.result), context(r), copy(r.inputKnowledge), copy(decision)), false);
        assert.equal(require('../experimental_word_diary_questions').capture(candidates.create(), copy(v.result), copy(r.reply)), false);
        assert.equal(JSON.stringify(v), original);
    }
    console.log(JSON.stringify({ priorOwners: owners.length, calls, oldReportOwners: ['d', 'g', 'j', 'al'] }));
});
test('complete reports retain old ownership while incomplete records preserve their exact source gaps', () => {
    const counts = [0, 0, 0, 0];
    for (const f of values.filter(f => !f.expected && f.value.result.understandings[0].complete
        && f.value.result.interpretations[0].aspect === 'activity_report')) {
        const v = f.value, hits = ['reports', 'negation_reports', 'time_reports', 'remaining_time_reports'].map(name =>
            require('../experimental_word_diary_' + name).capture(candidates.create(), copy(v.result), context(v.receipt), copy(v.receipt.inputKnowledge)));
        assert.equal(hits.filter(Boolean).length, 1); hits.forEach((hit, i) => { if (hit) counts[i]++; });
    }
    assert.ok(counts.every(n => n > 0));
    for (const mask of [1, 2]) {
        const v = hear(prepared(forms()[0], mask), forms()[0]), b = api.create(); assert.equal(capture(b, v), true);
        const u = b.read()[0].captured.understanding;
        assert.equal(Object.hasOwn(u, 'roles'), mask === 1); assert.equal(Object.hasOwn(u, 'reportSource'), mask === 1);
        assert.equal(u.subject, mask === 1 ? 'self' : null);
    }
});
test('actual later learning and later meals or rests never repair the original report', () => {
    const v = life.setup({ foundation: false, life: false }), raw = forms()[0], early = hear(v, raw);
    const original = JSON.stringify(early), b = api.create(); assert.equal(capture(b, early), true);
    const saved = JSON.stringify(b.read()); life.learnReport(v, 'ja');
    const later = hear(v, raw); assert.equal(later.result.understandings[0].complete, true);
    assert.equal(capture(b, later), false); assert.equal(capture(b, early), false);
    const delayed = api.create(); assert.equal(capture(delayed, early), true); assert.equal(JSON.stringify(delayed.read()), saved);
    life.start(v, 'rest'); life.finish(v); life.start(v, 'eat'); life.finish(v);
    assert.equal(JSON.stringify(early), original); assert.equal(JSON.stringify(b.read()), saved);
    const next = prepared(), many = api.create();
    for (let i = 0; i < 13; i++) assert.equal(capture(many, hear(next, raw)), true);
    assert.equal(new Set(many.read().map(r => r.sourceId)).size, 13);
});
test('replay-consistent missing, duplicated or inconsistent original experience evidence rejects', () => {
    const source = values.find(f => f.group === 'original-observation-evidence').value.receipt;
    for (const edit of [v => { v.world.experiences = []; },
        v => { v.world.experiences.push(copy(v.world.experiences.at(-1))); },
        v => { v.world.experiences.at(-1).end++; }]) {
        const v = { state: copy(source.beforeState), world: copy(source.beforeWorld) }; edit(v);
        assert.equal(capture(api.create(), hear(v, forms()[0])), false);
    }
});
test('selection source integrity is retained and repeated sources reject even with matching replay', () => {
    for (const f of values.filter(f => f.group === 'original-selection-source')) {
        const b = api.create(); assert.equal(capture(b, f.value), true);
        const r = f.value.receipt; assert.ok(r.beforeState.selectionSources.length);
        const v = { state: copy(r.beforeState), world: copy(r.beforeWorld) };
        v.state.selectionSources.push(copy(v.state.selectionSources[0]));
        assert.equal(capture(api.create(), hear(v, forms()[0])), false);
    }
});
test('malformed and non-data values never partially retain', () => {
    for (const bad of [null, {}, undefined, NaN, () => {}, new Date()]) assert.equal(api.capture(api.create(), bad, bad), false);
    const v = copy(accepted[0].value); v.receipt.loop = v.receipt;
    assert.equal(capture(api.create(), v), false);
    for (const bad of [null, {}, { kind: 'report' }, { kind: 'incomplete_activity_report', sourceId: 'input:0' }])
        assert.throws(() => api.create().retain(bad), TypeError);
});
