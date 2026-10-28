'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const api = require('../experimental_word_diary_same_kind_clause_proposals');
const fixture = require('../scripts/experimental/diary_same_kind_clause_proposal_fixtures');
const candidates = require('../experimental_word_diary_candidates');
const { fixtures, setup, hear, copy, life, raw, base } = fixture;
const values = fixtures(), accepted = values.filter(f => f.expected);
const capture = (b, v) => api.capture(b, v.result, v.receipt);
for (const group of new Set(values.map(f => f.group))) test(`same-kind clause proposal: ${group}`, () => {
    for (const f of values.filter(f => f.group === group)) {
        const v = copy(f.value), source = JSON.stringify(v), b = api.create();
        assert.equal(capture(b, v), f.expected, JSON.stringify([group, v.result.input, v.result.understandings]));
        assert.equal(JSON.stringify(v), source); assert.equal(capture(b, v), false);
        assert.equal(b.read().length, Number(f.expected)); if (!f.expected) continue;
        const c = b.read()[0].captured, r = v.receipt;
        assert.equal(b.read()[0].kind, 'same_kind_clause_proposal');
        assert.deepEqual(c.sources.input, v.result.input); assert.deepEqual(c.sources.frames, v.result.interpretations);
        assert.deepEqual(c.understandings, v.result.understandings); assert.equal(c.understandingStatus, 'incomplete');
        assert.deepEqual(c.clauseIndices, [0, 1]);
        assert.ok(c.sources.frames.every(frame => frame.kind === c.proposalKind && frame.meaning === c.meaning));
        assert.ok(c.meaning === 'rest' && c.proposalKind === 'request' || c.meaning === 'walk' && c.proposalKind === 'invitation');
        assert.equal(c.understandings[0].complete, false);
        assert.ok(c.understandings[0].unresolved.some(item => item.type === 'clause_scope'));
        assert.deepEqual(c.originalResult, v.result); assert.deepEqual(c.originalLearning, v.result.learning);
        assert.deepEqual(c.originalTransfer, v.result.transfer);
        assert.equal(c.knowledgeChanged, JSON.stringify(r.beforeState.knowledge) !== JSON.stringify(r.afterState.knowledge));
        assert.deepEqual(c.expression, v.result.expression); assert.deepEqual(c.response, r.reply);
        assert.equal(c.actualSpeaker, v.result.input.speaker);
        assert.equal(c.actualSpeech, v.result.expression.channel === 'speech' && !r.reply.observation);
        assert.equal(c.conditionJudgmentRecorded, false); assert.equal(c.conditionJudgment, null);
        assert.equal(c.sequenceJudgmentRecorded, false); assert.equal(c.sequenceJudgment, null); assert.equal(c.actionOrder, null);
        assert.equal(c.knowledgeChanged, false); assert.deepEqual(r.beforeState.knowledge, r.afterState.knowledge);
        assert.ok(c.understandings.every(u => !u.complete && u.unresolved.some(x => x.type === 'clause_scope')));
        assert.equal(c.actionDecisionRecorded, false); assert.equal(c.compliance, null);
        assert.equal(c.answerRecorded, false); assert.equal(c.turnAnswer, null); assert.equal(c.actualParticipation, false);
        for (const name of ['desire', 'refusal', 'completedExperience']) assert.equal(c[name], null);
        for (const name of ['newTeaching', 'newLearning', 'newExperience']) assert.equal(c[name], false);
        assert.deepEqual(c.sources.state, { before: r.beforeState, after: r.afterState });
        assert.deepEqual(c.sources.activity, { before: r.beforeWorld, after: r.afterWorld });
        assert.deepEqual(c.inputKnowledge, r.inputKnowledge); assert.deepEqual(c.inputContext, r.inputContext);
        assert.deepEqual(c.missingBefore, v.result.understandings.map(item => item.unresolved));
        const saved = JSON.stringify(b.read()); b.read()[0].captured.sources.input.raw = 'edited';
        v.result.input.raw = 'edited'; r.inputKnowledge.meanings = []; assert.equal(JSON.stringify(b.read()), saved);
    }
});
const edits = [
    v => { v.result.input.raw = 'unrelated'; }, v => { v.result.input.id = 'input:0'; },
    v => { v.result.input.locale = 'en'; }, v => { v.result.input.speaker = 'tampered'; },
    v => { v.result.input.at++; }, v => { v.result.input.scene += ':other'; },
    v => { v.result.interpretations.reverse(); }, v => { v.result.understandings.reverse(); },
    v => { v.result.interpretations[0].meaning = 'eat'; },
    v => { v.result.interpretations[1].span = 'invented'; },
    v => { v.result.interpretations[0].roles = { proposer: 'player' }; },
    v => { v.result.understandings[0].complete = true; },
    v => { v.result.understandings.find(u => u.unresolved.some(x => x.type === 'clause_scope')).unresolved = []; },
    v => { v.result.understandings[0].subject = 'self'; }, v => { v.result.understandings[0].eventTime = 'past'; },
    v => { v.result.understandings[0].polarity = 'negative'; }, v => { v.result.understandings[0].conditionStatus = 'met'; },
    v => { v.result.understandings[0].roles = { actualParticipation: true }; },
    v => { v.result.understandings[0].known.meaning = 'eat'; },
    v => { v.result.learning = []; }, v => { v.result.transfer = [{ relationAcquired: true }]; },
    v => { v.result.reaction = { intent: 'join', action: 'rest' }; },
    v => { v.result.expression.message = 'invented'; }, v => { v.result.expression.channel = 'invented'; },
    v => { v.receipt.input.raw += ':changed'; }, v => { v.receipt.inputKnowledge.meanings.push({ id: 'invented', source: 'initial' }); },
    v => { v.receipt.inputContext.scene += ':changed'; }, v => { v.receipt.beforeState.serial++; },
    v => { v.receipt.beforeWorld.elapsed++; }, v => { v.receipt.reply.message = 'condition_met'; },
    v => { v.receipt.afterState.knowledge.associations.push({ word: 'invented' }); },
    v => { v.receipt.afterState.knowledge.meanings.push({ id: 'invented', source: 'initial' }); },
    v => { v.receipt.afterWorld.elapsed++; }, v => { v.receipt.afterWorld.experiences.push({ id: 999, kind: 'rest' }); },
    v => { v.receipt.afterState.context.turns.at(-1).answer = { response: { message: 'join' } }; },
    v => { v.result.interpretations.push(copy(v.result.interpretations[0])); }, v => { v.result.relationLearning = { relationAcquired: true }; },
    v => { v.result.conditionJudgment = { status: 'met' }; },
    v => { v.result.sequenceJudgment = { status: 'after_completion' }; },
    v => { v.result.interpretations[0].catalogRule = 'conditional_rest'; },
    v => { v.receipt.afterState.selectionSources = [...(v.receipt.afterState.selectionSources || []), { invented: true }]; },
    v => { v.receipt.afterState.context.turns.at(-1).conditionJudgment = { status: 'unknown' }; },
    v => { delete v.receipt.beforeState; }, v => { delete v.receipt.afterWorld; }
];
test('rewritten scope, learning, ordering, judgment and receipts reject atomically', () => {
    let rejectedMutations = 0, unchangedEdits = 0;
    for (const f of accepted) for (const edit of edits) {
        const v = copy(f.value), b = api.create(), original = JSON.stringify(v); edit(v);
        // Equal repeated clauses have no distinguishable order to reverse.
        if (JSON.stringify(v) === original) { unchangedEdits++; continue; }
        rejectedMutations++;
        assert.equal(capture(b, v), false, JSON.stringify([f.group, edits.indexOf(edit)])); assert.deepEqual(b.read(), []);
    }
    console.log(JSON.stringify({ groups: new Set(values.map(f => f.group)).size, originals: values.length,
        accepted: accepted.length, mutations: edits.length, rejectedMutations, unchangedEdits }));
});
test('existing owners do not acquire the same-kind two-clause input', () => {
    const owners = require('../scripts/experimental/diary_audit').supplementalInventory().filter(r => r.id !== '4d12dc');
    assert.equal(owners.length, 82);
    for (const f of accepted) {
        const v = f.value, source = JSON.stringify(v), r = v.receipt, w = r.beforeWorld;
        for (const owner of owners) {
            const old = require('../' + owner.file), b = old.create ? old.create() : candidates.create();
            assert.equal(old.capture(b, copy(v.result), copy(r)), false, owner.id);
        }
        const context = { scene: r.beforeState.context.scene, attention: r.beforeState.context.attention,
            mode: w.mode, target: w.attention, activityStart: w.activityStart, elapsed: w.elapsed, fatigue: w.fatigue, activityBefore: w.activityBefore ?? null };
        for (const name of ['reports', 'negation_reports', 'time_reports', 'remaining_time_reports', 'condition_proposals', 'sequence_proposals'])
            assert.equal(require('../experimental_word_diary_' + name).capture(candidates.create(), copy(v.result), copy(context), copy(r.inputKnowledge)), false);
        const decision = { speech: r.beforeState.settings.speech, before: w, after: r.afterWorld,
            beforeSelections: r.beforeState.selectionSources || [], afterSelections: r.afterState.selectionSources || [], response: r.reply };
        assert.equal(require('../experimental_word_diary_proposals').capture(candidates.create(), copy(v.result), copy(context), copy(r.inputKnowledge), copy(decision)), false);
        assert.equal(require('../experimental_word_diary_questions').capture(candidates.create(), copy(v.result), copy(r.reply)), false);
        assert.equal(JSON.stringify(v), source);
    }
    console.log(JSON.stringify({ priorOwners: owners.length, calls: owners.length * accepted.length }));
});
test('later actual learning and new hearings cannot repair an earlier multi-clause hearing', () => {
    for (const speech of ['short', 'gesture']) for (const speaker of ['player', 'visitor'])
        for (const raw of ['休んでね\n休んでね', '散歩しよう\n散歩しよう']) {
        const v = setup({ foundation: false, life: false, speech }), early = hear(v, raw, { speaker }), b = api.create();
        assert.equal(capture(b, early), true); const saved = JSON.stringify(b.read()), source = JSON.stringify(early);
        base.learn(v, 'ja'); const fresh = hear(v, raw, { speaker });
        assert.equal(capture(b, fresh), true); assert.ok(fresh.result.understandings.every(u => !u.complete));
        assert.equal(capture(b, early), false); assert.equal(JSON.stringify(b.read()[0]), JSON.stringify(JSON.parse(saved)[0]));
        const delayed = api.create(); assert.equal(capture(delayed, early), true); assert.equal(JSON.stringify(delayed.read()), saved);
        assert.equal(JSON.stringify(early), source); assert.ok(early.result.understandings.every(u => !u.complete));
    }
});
test('later activity and repeated hearings preserve source learning and activity boundaries', () => {
    for (const speech of ['short', 'gesture']) for (const speaker of ['player', 'visitor'])
        for (const raw of ['休んでね\n休んでね', '散歩しよう\n散歩しよう']) {
        const v = setup({ speech }); hear(v, '休んでね');
        const old = hear(v, raw, { speaker }), b = api.create(); assert.equal(capture(b, old), true);
        const source = JSON.stringify(old), saved = JSON.stringify(b.read());
        const shade = fixture.worldApi.PLACES.find(p => p.id === 'shade');
        v.world.x = shade.x; v.world.y = shade.y; v.world.pause = 0;
        fixture.worldApi.onArrival(v.world, v.state, fixture.worldApi.tick(v.world, .1)); life.finish(v);
        for (let i = 0; i < 200 && !v.world.experiences.some(e => e.kind === 'rest'); i++)
            fixture.worldApi.onArrival(v.world, v.state, fixture.worldApi.tick(v.world, .1));
        assert.ok(v.world.experiences.some(e => e.kind === 'rest' && e.end > e.start));
        assert.ok(v.state.experiences.some(e => e.activity === 'rest'));
        assert.equal(capture(b, old), false); assert.equal(JSON.stringify(b.read()), saved); assert.equal(JSON.stringify(old), source);
        const delayed = api.create(); assert.equal(capture(delayed, old), true); assert.deepEqual(delayed.read(), b.read());
        for (let i = 0; i < 3; i++) assert.equal(capture(b, hear(v, raw, { speaker })), true);
        assert.equal(new Set(b.read().map(item => item.sourceId)).size, 4);
    }
});
test('original evidence cannot be missing, duplicated or substituted', () => {
    const r = values.find(f => f.group === 'original-experience-observation').value.receipt;
    for (const edit of [v => { v.world.experiences = []; },
        v => { v.world.experiences.push(copy(v.world.experiences.at(-1))); }, v => { v.world.experiences.at(-1).end++; }]) {
        const v = { state: copy(r.beforeState), world: copy(r.beforeWorld) }; edit(v);
        assert.equal(capture(api.create(), hear(v, raw)), false);
    }
    const v = setup(); hear(v, '休んでね'); v.state.selectionSources.push(copy(v.state.selectionSources[0]));
    assert.equal(capture(api.create(), hear(v, raw)), false);
    for (const field of ['meanings', 'relations']) {
        const v = setup(), id = field === 'meanings' ? 'rest' : 'request';
        v.state.knowledge[field].push(copy(v.state.knowledge[field].find(item => item.id === id)));
        assert.equal(capture(api.create(), hear(v, raw)), false);
    }
});
test('last safe input ID is retained and an overflowing ID rejects without throwing', () => {
    for (const serial of [Number.MAX_SAFE_INTEGER - 1, Number.MAX_SAFE_INTEGER]) {
        const v = setup(); v.state.serial = serial;
        const material = hear(v, raw), source = JSON.stringify(material), b = api.create();
        assert.equal(capture(b, material), serial < Number.MAX_SAFE_INTEGER);
        assert.equal(b.read().length, Number(serial < Number.MAX_SAFE_INTEGER));
        assert.equal(JSON.stringify(material), source);
    }
});
test('malformed and non-JSON material cannot partially retain', () => {
    for (const bad of [null, {}, undefined, NaN, () => {}, new Date()]) assert.equal(api.capture(api.create(), bad, bad), false);
    const v = copy(accepted[0].value); v.receipt.loop = v.receipt; assert.equal(capture(api.create(), v), false);
    for (const bad of [null, {}, { kind: 'proposal' }, { kind: 'same_kind_clause_proposal', sourceId: 'input:0' }])
        assert.throws(() => api.create().retain(bad), TypeError);
});

test('same source ID cannot overwrite an earlier accepted hearing', () => {
    const a = hear(setup(), raw), b = hear(setup(), '散歩しよう。散歩しよう'), journal = api.create();
    assert.equal(a.result.input.id, b.result.input.id);
    assert.equal(capture(journal, a), true); const saved = JSON.stringify(journal.read());
    assert.equal(capture(api.create(), b), true); assert.equal(capture(journal, b), false);
    assert.equal(JSON.stringify(journal.read()), saved);
});
test('later actual walking completion cannot turn original input order into an action plan', () => {
    for (const speech of ['short', 'gesture']) {
        const v = setup({ speech }), early = hear(v, raw), journal = api.create();
        assert.equal(capture(journal, early), true); const saved = JSON.stringify(journal.read()), source = JSON.stringify(early);
        const path = fixture.worldApi.PLACES.find(p => p.id === 'path');
        assert.equal(fixture.worldApi.approach(v.world, 'path'), true);
        v.world.x = path.x; v.world.y = path.y; v.world.pause = 0;
        const arrived = fixture.worldApi.tick(v.world, .1);
        assert.equal(arrived.kind, 'arrive'); assert.equal(arrived.target, 'path');
        fixture.worldApi.onArrival(v.world, v.state, arrived);
        assert.ok(v.world.history.some(h => h.mode === 'move' && h.target === 'path' && h.end > h.start));
        assert.equal(capture(journal, early), false); assert.equal(JSON.stringify(journal.read()), saved);
        assert.equal(JSON.stringify(early), source);
        const delayed = api.create(); assert.equal(capture(delayed, early), true); assert.equal(JSON.stringify(delayed.read()), saved);
        assert.equal(journal.read()[0].captured.actionOrder, null);
    }
});
