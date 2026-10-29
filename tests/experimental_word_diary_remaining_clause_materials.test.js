'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const api = require('../experimental_word_diary_remaining_clause_materials');
const fixture = require('../scripts/experimental/diary_remaining_clause_material_fixtures');
const candidates = require('../experimental_word_diary_candidates');
const { fixtures, setup, hear, copy, life, raw, base } = fixture;
const values = fixtures(), accepted = values.filter(f => f.expected);
const capture = (b, v) => api.capture(b, v.result, v.receipt);
for (const group of new Set(values.map(f => f.group))) test(`remaining clause material: ${group}`, () => {
    for (const f of values.filter(f => f.group === group)) {
        const v = copy(f.value), source = JSON.stringify(v), b = api.create();
        assert.equal(capture(b, v), f.expected, JSON.stringify([group, v.result.input, v.result.interpretations, v.result.understandings]));
        assert.equal(JSON.stringify(v), source); assert.equal(capture(b, v), false);
        assert.equal(b.read().length, Number(f.expected)); if (!f.expected) continue;
        const c = b.read()[0].captured, r = v.receipt;
        assert.equal(b.read()[0].kind, 'remaining_clause_material');
        assert.deepEqual(c.sources.input, v.result.input); assert.deepEqual(c.sources.frames, v.result.interpretations);
        assert.deepEqual(c.understandings, v.result.understandings); assert.equal(c.understandingStatus, 'per_clause');
        assert.deepEqual(c.clauseIndices, v.result.interpretations.map((_, index) => index));
        assert.deepEqual(c.clauses, v.result.interpretations.map((frame, index) =>
            ({ index, span: frame.span, frame, understanding: v.result.understandings[index] })));
        for (const [field, predicate] of [
            ['conditionalIndices', f => f.catalogRule === 'conditional_rest'],
            ['sequentialIndices', f => f.catalogRule === 'after_eat_walk'],
            ['negativeRequestIndices', f => f.catalogRule === 'do_not_eat'],
            ['questionIndices', f => f.kind === 'question'], ['reportIndices', f => f.kind === 'report'],
            ['unknownIndices', f => f.kind === 'unknown']])
            assert.deepEqual(c[field], v.result.interpretations.flatMap((f, index) => predicate(f) ? [index] : []));
        assert.deepEqual(c.originalResult, v.result); assert.deepEqual(c.originalLearning, v.result.learning);
        assert.deepEqual(c.originalTransfer, v.result.transfer);
        assert.equal(c.knowledgeChanged, JSON.stringify(r.beforeState.knowledge) !== JSON.stringify(r.afterState.knowledge));
        assert.deepEqual(c.expression, v.result.expression); assert.deepEqual(c.response, r.reply);
        assert.equal(c.actualSpeaker, v.result.input.speaker);
        assert.equal(c.actualSpeech, v.result.expression.channel === 'speech' && !r.reply.observation);
        for (const field of ['conditionJudgmentRecorded', 'sequenceJudgmentRecorded', 'actionDecisionRecorded',
            'answerRecorded', 'actualParticipation', 'captureAddsTeaching', 'captureAddsLearning', 'captureAddsExperience'])
            assert.equal(c[field], false);
        for (const field of ['conditionJudgment', 'sequenceJudgment', 'actionOrder', 'compliance', 'turnAnswer',
            'desire', 'refusal', 'completedExperience']) assert.equal(c[field], null);
        assert.deepEqual(c.sources.state, { before: r.beforeState, after: r.afterState });
        assert.deepEqual(c.sources.activity, { before: r.beforeWorld, after: r.afterWorld });
        assert.deepEqual(c.inputKnowledge, r.inputKnowledge); assert.deepEqual(c.inputContext, r.inputContext);
        assert.deepEqual(c.missingBefore, v.result.understandings.map(item => item.unresolved));
        const saved = JSON.stringify(b.read()); b.read()[0].captured.clauses[0].span = 'edited';
        v.result.input.raw = 'edited'; r.inputKnowledge.meanings = []; assert.equal(JSON.stringify(b.read()), saved);
    }
});
const edits = [
    v => { v.result.input.raw = 'unrelated'; }, v => { v.result.input.id = 'input:0'; },
    v => { v.result.input.locale = 'en'; }, v => { v.result.input.speaker = 'tampered'; },
    v => { v.result.input.at++; }, v => { v.result.input.scene += ':other'; },
    v => { v.result.interpretations.reverse(); }, v => { v.result.understandings.reverse(); },
    v => { v.result.interpretations[0].kind = 'naming'; }, v => { v.result.interpretations[0].span = 'invented'; },
    v => { v.result.interpretations[0].roles = { actualParticipation: true }; },
    v => { v.result.understandings[0].complete = !v.result.understandings[0].complete; },
    v => { v.result.understandings[0].unresolved = [{ type: 'invented' }]; },
    v => { v.result.understandings[0].subject = 'invented'; },
    v => { v.result.understandings[0].conditionStatus = 'met'; },
    v => { v.result.understandings[0].known.invented = 'eat'; },
    v => { v.result.learning = [{ invented: true }]; }, v => { v.result.transfer = [{ relationAcquired: true }]; },
    v => { v.result.expression.message = 'invented'; }, v => { v.result.expression.channel = 'invented'; },
    v => { v.receipt.input.raw += ':changed'; }, v => { v.receipt.inputKnowledge.meanings.push({ id: 'invented', source: 'initial' }); },
    v => { v.receipt.inputContext.scene += ':changed'; }, v => { v.receipt.beforeState.serial++; },
    v => { v.receipt.beforeWorld.elapsed++; }, v => { v.receipt.reply.message = 'invented'; },
    v => { v.receipt.afterState.knowledge.associations.push({ word: 'invented' }); },
    v => { v.receipt.afterState.knowledge.meanings.push({ id: 'invented', source: 'initial' }); },
    v => { v.receipt.afterWorld.elapsed++; }, v => { v.receipt.afterWorld.experiences.push({ id: 999, kind: 'rest' }); },
    v => { v.receipt.afterState.context.turns.at(-1).answer = { response: { message: 'join' } }; },
    v => { v.result.interpretations.push(copy(v.result.interpretations[0])); },
    v => { v.result.relationLearning = { relationAcquired: true }; },
    v => { v.result.conditionJudgment = { status: 'met' }; }, v => { v.result.sequenceJudgment = { status: 'after_completion' }; },
    v => { v.result.interpretations[0].catalogRule = 'feeling_contrast'; },
    v => { v.receipt.afterState.selectionSources = [...(v.receipt.afterState.selectionSources || []), { invented: true }]; },
    v => { v.receipt.afterState.context.turns.at(-1).conditionJudgment = { status: 'unknown' }; },
    v => { delete v.receipt.beforeState; }, v => { delete v.receipt.afterWorld; }
];
test('changed clause understanding, real learning, response, evidence and judgment reject atomically', () => {
    let rejectedMutations = 0, unchangedEdits = 0;
    for (const f of accepted) for (const edit of edits) {
        const v = copy(f.value), b = api.create(), original = JSON.stringify(v); edit(v);
        if (JSON.stringify(v) === original) { unchangedEdits++; continue; }
        rejectedMutations++;
        assert.equal(capture(b, v), false, JSON.stringify([f.group, edits.indexOf(edit)])); assert.deepEqual(b.read(), []);
    }
    console.log(JSON.stringify({ groups: new Set(values.map(f => f.group)).size, originals: values.length,
        accepted: accepted.length, mutations: edits.length, rejectedMutations, unchangedEdits }));
});
test('all prior supplemental owners retain their ownership', () => {
    const owners = require('../scripts/experimental/diary_audit').supplementalInventory().filter(r => r.id !== '4d12de');
    assert.equal(owners.length, 86);
    for (const f of accepted) for (const owner of owners) {
        const old = require('../' + owner.file), b = old.create ? old.create() : candidates.create();
        assert.equal(old.capture(b, copy(f.value.result), copy(f.value.receipt)), false, owner.id);
    }
    console.log(JSON.stringify({ priorSupplementalOwners: owners.length, calls: owners.length * accepted.length }));
});
test('the 47 older input capture contracts reject these multi-clause occurrences with their own argument order', () => {
    const inventory = require('../scripts/experimental/diary_audit').inventory();
    const owners = inventory.filter(row => !['4d1', '4d3', '4d4'].includes(row.id));
    assert.equal(owners.length, 47);
    const contracts = owners.map(owner => {
        const old = require('../' + owner.file), parameters = /function capture\(([^)]*)\)/.exec(old.capture.toString())[1].split(',').map(p => p.trim());
        assert.equal(parameters.length, owner.arity); return { ...owner, old, parameters };
    });
    for (const f of accepted) {
        const v = f.value, r = v.receipt, s = r.beforeState, w = r.beforeWorld, stable = JSON.stringify(v);
        const context = { scene: s.context.scene, attention: s.context.attention, mode: w.mode, target: w.attention,
            activityStart: w.activityStart, elapsed: w.elapsed, fatigue: w.fatigue,
            destination: w.destination, history: w.history, experiences: w.experiences, activityBefore: w.activityBefore ?? null };
        // These fixtures have no original correction/external-report receipt archive.
        const named = { result: v.result, reply: r.reply, context, beforeKnowledge: s.knowledge,
            beforeExperiences: s.experiences || [], beforeSelections: s.selectionSources || [],
            beforeLessons: s.correctionLessons || [], beforeRecords: s.records, beforeTurns: s.context.turns,
            beforeFeelingLearning: s.feelingLearning || { events: [], knowledge: [] }, beforeReports: [], beforeReceipts: [],
            decision: { speech: s.settings.speech, before: w, after: r.afterWorld,
                beforeSelections: s.selectionSources || [], afterSelections: r.afterState.selectionSources || [], response: r.reply } };
        for (const owner of contracts) {
            const args = owner.parameters.slice(1).map(name => { assert.ok(Object.hasOwn(named, name), name); return copy(named[name]); });
            assert.equal(owner.old.capture(candidates.create(), ...args), false, owner.id);
        }
        assert.equal(JSON.stringify(v), stable);
    }
    console.log(JSON.stringify({ priorInputOwners: owners.length, calls: owners.length * accepted.length,
        notInputCaptures: ['4d1 create', '4d3 completion event', '4d4 work completion event'] }));
});
test('existing receive association changes and mixed complete clauses are retained without semantic promotion', () => {
    const changed = accepted.filter(f => JSON.stringify(f.value.receipt.beforeState.knowledge) !== JSON.stringify(f.value.receipt.afterState.knowledge));
    assert.ok(changed.length > 0);
    for (const f of changed) {
        const b = api.create(); assert.equal(capture(b, f.value), true); const c = b.read()[0].captured;
        assert.equal(c.knowledgeChanged, true); assert.equal(c.captureAddsLearning, false);
        assert.deepEqual(c.originalLearning, f.value.result.learning);
    }
    const mixed = accepted.find(f => f.value.result.understandings.some(u => u.complete)
        && f.value.result.understandings.some(u => !u.complete)); assert.ok(mixed);
    const b = api.create(); assert.equal(capture(b, mixed.value), true);
    assert.deepEqual(b.read()[0].captured.understandings, mixed.value.result.understandings);
});
test('later real learning, activity completion, delayed copies and new input IDs do not rewrite the occurrence', () => {
    for (const speech of ['short', 'gesture']) for (const speaker of ['player', 'visitor'])
        for (const text of [raw, '散歩しよう\n未知', '木の実がある\n休むことは大事']) {
        const v = setup({ foundation: false, life: false, speech }), early = hear(v, text, { speaker }), b = api.create();
        assert.equal(capture(b, early), true); const saved = JSON.stringify(b.read()), source = JSON.stringify(early);
        base.learn(v, 'ja'); const fresh = hear(v, text, { speaker }); assert.equal(capture(b, fresh), true);
        assert.equal(capture(b, early), false); assert.deepEqual(b.read()[0], JSON.parse(saved)[0]);
        const delayed = api.create(); assert.equal(capture(delayed, early), true); assert.equal(JSON.stringify(delayed.read()), saved);
        assert.equal(JSON.stringify(early), source);
    }
    for (const speech of ['short', 'gesture']) {
        const v = setup({ speech }); hear(v, '休んでね'); const early = hear(v, raw), b = api.create();
        assert.equal(capture(b, early), true); const saved = JSON.stringify(b.read()), source = JSON.stringify(early);
        const shade = fixture.worldApi.PLACES.find(p => p.id === 'shade');
        v.world.x = shade.x; v.world.y = shade.y; v.world.pause = 0;
        fixture.worldApi.onArrival(v.world, v.state, fixture.worldApi.tick(v.world, .1)); life.finish(v);
        for (let i = 0; i < 200 && !v.world.experiences.some(e => e.kind === 'rest'); i++)
            fixture.worldApi.onArrival(v.world, v.state, fixture.worldApi.tick(v.world, .1));
        assert.ok(v.world.experiences.some(e => e.kind === 'rest' && e.end > e.start));
        assert.ok(v.state.experiences.some(e => e.activity === 'rest'));
        assert.equal(capture(b, early), false); assert.equal(JSON.stringify(b.read()), saved); assert.equal(JSON.stringify(early), source);
        assert.equal(capture(b, hear(v, raw)), true);
    }
});
test('missing, duplicate and substituted source evidence rejects and cannot bypass an older reserved shape', () => {
    const r = values.find(f => f.group === 'original-experience-observation').value.receipt;
    for (const edit of [v => { v.world.experiences = []; },
        v => { v.world.experiences.push(copy(v.world.experiences.at(-1))); }, v => { v.world.experiences.at(-1).end++; }]) {
        const v = { state: copy(r.beforeState), world: copy(r.beforeWorld) }; edit(v);
        assert.equal(capture(api.create(), hear(v, raw)), false);
    }
    for (const field of ['meanings', 'relations']) {
        const v = setup(), id = field === 'meanings' ? 'rest' : 'request';
        v.state.knowledge[field].push(copy(v.state.knowledge[field].find(item => item.id === id)));
        assert.equal(capture(api.create(), hear(v, raw)), false);
    }
    const v = setup(); hear(v, '休んでね'); v.state.selectionSources.push(copy(v.state.selectionSources[0]));
    assert.equal(capture(api.create(), hear(v, raw)), false);
    for (const text of ['休んでね\n未知', '休んでね\n散歩しよう', '休んでね\n休んでね', '疲れたら休んでね\n休んでね']) {
        const old = hear(setup(), text); delete old.receipt.inputContext;
        assert.equal(capture(api.create(), old), false);
    }
});
test('safe IDs, malformed materials and source-ID collisions retain atomically', () => {
    for (const serial of [Number.MAX_SAFE_INTEGER - 1, Number.MAX_SAFE_INTEGER]) {
        const v = setup(); v.state.serial = serial; const m = hear(v, raw), b = api.create();
        assert.equal(capture(b, m), serial < Number.MAX_SAFE_INTEGER);
    }
    for (const bad of [null, {}, undefined, NaN, () => {}, new Date()]) assert.equal(api.capture(api.create(), bad, bad), false);
    const loop = copy(accepted[0].value); loop.receipt.loop = loop.receipt; assert.equal(capture(api.create(), loop), false);
    for (const bad of [null, {}, { kind: 'proposal' }, { kind: 'remaining_clause_material', sourceId: 'input:0' }])
        assert.throws(() => api.create().retain(bad), TypeError);
    const a = hear(setup(), raw), second = hear(setup(), '何してる？\n休んでね'), b = api.create();
    assert.equal(capture(b, a), true); const saved = JSON.stringify(b.read());
    assert.equal(capture(api.create(), second), true); assert.equal(capture(b, second), false); assert.equal(JSON.stringify(b.read()), saved);
});
