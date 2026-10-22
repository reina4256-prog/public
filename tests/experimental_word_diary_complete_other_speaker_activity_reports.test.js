'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const api = require('../experimental_word_diary_complete_other_speaker_activity_reports');
const candidates = require('../experimental_word_diary_candidates');
const fixture = require('../scripts/experimental/diary_complete_other_speaker_activity_report_fixtures');
const { fixtures, prepared, setup, hear, forms, life, catalog, copy } = fixture;
const values = fixtures(), accepted = values.filter(f => f.expected);
const capture = (b, v) => api.capture(b, v.result, v.receipt);
function context(r) {
    const w = r.beforeWorld;
    return { scene: r.beforeState.context.scene, attention: r.beforeState.context.attention,
        mode: w.mode, target: w.attention, activityStart: w.activityStart, elapsed: w.elapsed,
        fatigue: w.fatigue, activityBefore: w.activityBefore ?? null };
}
for (const group of new Set(values.map(f => f.group))) test(`complete other-speaker activity report: ${group}`, () => {
    for (const f of values.filter(f => f.group === group)) {
        const v = copy(f.value), original = JSON.stringify(v), b = api.create();
        assert.equal(capture(b, v), f.expected, JSON.stringify([group, v.result.input, v.result.understandings]));
        assert.equal(JSON.stringify(v), original); assert.equal(capture(b, v), false);
        assert.equal(b.read().length, Number(f.expected)); if (!f.expected) continue;
        const record = b.read()[0], c = record.captured, r = v.receipt, u = v.result.understandings[0];
        assert.equal(record.kind, 'complete_other_speaker_activity_report'); assert.equal(record.sourceId, v.result.input.id);
        assert.deepEqual(c.understanding, u); assert.equal(u.complete, true);
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
        assert.deepEqual(c.understanding.unresolved, []);
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
    v => { v.result.understandings[0].complete = false; }, v => { v.result.understandings[0].unresolved = [{ type: 'relation', id: 'report' }]; },
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
test('existing owners do not duplicate complete other-speaker activity reports with their proper argument shapes', () => {
    const owners = require('../scripts/experimental/diary_audit').supplementalInventory().filter(r => r.id !== '4d12cv');
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
test('complete reports preserve the distinct parser and actual speaker roles', () => {
    for (const f of accepted) {
        const v=f.value, b=api.create(); assert.equal(capture(b,v),true);
        const c=b.read()[0].captured, u=c.understanding, input=v.result.input;
        assert.notEqual(input.speaker,'player'); assert.equal(c.sources.frame.roles.reporter,'player');
        assert.equal(u.roles.reporter,input.speaker); assert.equal(u.reportSource.reporter,input.speaker);
        assert.equal(u.subject,c.sources.frame.subject==='player'?input.speaker:'self');
        assert.equal(u.roles.contentSubject,u.subject); assert.equal(u.reportSource.contentSubject,u.subject);
        assert.deepEqual(u.unresolved,[]); assert.deepEqual(u.relationReferences||[],[]);
    }
});
test('actual scoped learning and unsupported other-speaker teaching do not transfer', () => {
    const groups=['actual-player-scope-not-transferred','actual-other-speaker-scope-not-transferred',
        'actual-other-locale-scope-not-transferred','other-speaker-teaching-does-not-establish-scope'];
    const old=require('../experimental_word_diary_incomplete_activity_reports');
    for (const f of values.filter(f=>groups.includes(f.group))) {
        assert.equal(f.value.result.understandings[0].complete,false);
        assert.equal(capture(api.create(),f.value),false);
        assert.equal(old.capture(old.create(),copy(f.value.result),copy(f.value.receipt)),true);
    }
});
test('same input is immutable while later learning, rests and meals remain separate', () => {
    const v=setup({speech:'short'}), raw=forms()[0], original=hear(v,raw,{speaker:'visitor'});
    const savedInput=JSON.stringify(original), b=api.create(); assert.equal(capture(b,original),true);
    const saved=JSON.stringify(b.read()); fixture.learnReport(v);
    life.start(v,'rest'); life.finish(v); life.start(v,'eat'); life.finish(v);
    assert.equal(capture(b,original),false); assert.equal(JSON.stringify(b.read()),saved);
    assert.equal(JSON.stringify(original),savedInput);
    const delayed=api.create(); assert.equal(capture(delayed,original),true);assert.equal(JSON.stringify(delayed.read()),saved);
    for(let i=0;i<13;i++)assert.equal(capture(b,hear(v,raw,{speaker:'visitor'})),true);
    assert.equal(new Set(b.read().map(r=>r.sourceId)).size,14);
    const unknown=setup({foundation:false,speech:'short'}), early=hear(unknown,raw,{speaker:'visitor'});
    assert.equal(capture(api.create(),early),false);life.learnReport(unknown,'ja');
    assert.equal(capture(api.create(),early),false);assert.equal(early.result.understandings[0].complete,false);
});
test('replay-consistent missing, duplicated or inconsistent original experience evidence rejects', () => {
    const source = values.find(f => f.group === 'original-observation-evidence').value.receipt;
    for (const edit of [v => { v.world.experiences = []; },
        v => { v.world.experiences.push(copy(v.world.experiences.at(-1))); },
        v => { v.world.experiences.at(-1).end++; }]) {
        const v = { state: copy(source.beforeState), world: copy(source.beforeWorld) }; edit(v);
        assert.equal(capture(api.create(), hear(v, forms()[0], { speaker: 'visitor' })), false);
    }
});
test('selection source integrity is retained and repeated sources reject even with matching replay', () => {
    for (const f of values.filter(f => f.group === 'original-selection-source')) {
        const b = api.create(); assert.equal(capture(b, f.value), true);
        const r = f.value.receipt; assert.ok(r.beforeState.selectionSources.length);
        const v = { state: copy(r.beforeState), world: copy(r.beforeWorld) };
        v.state.selectionSources.push(copy(v.state.selectionSources[0]));
        assert.equal(capture(api.create(), hear(v, forms()[0], { speaker: 'visitor' })), false);
    }
});
test('malformed and non-data values never partially retain', () => {
    for (const bad of [null, {}, undefined, NaN, () => {}, new Date()]) assert.equal(api.capture(api.create(), bad, bad), false);
    const v = copy(accepted[0].value); v.receipt.loop = v.receipt;
    assert.equal(capture(api.create(), v), false);
    for (const bad of [null, {}, { kind: 'report' }, { kind: 'complete_other_speaker_activity_report', sourceId: 'input:0' }])
        assert.throws(() => api.create().retain(bad), TypeError);
});
