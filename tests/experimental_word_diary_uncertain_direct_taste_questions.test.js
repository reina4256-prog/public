'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const api = require('../experimental_word_diary_uncertain_direct_taste_questions');
const candidates = require('../experimental_word_diary_candidates');
const fixture = require('../scripts/experimental/diary_uncertain_direct_taste_question_fixtures');
const { prepared, hear, worldApi } = fixture;
const copy = v => JSON.parse(JSON.stringify(v));
const values = fixture.fixtures(), capture = (buffer, v) => api.capture(buffer, v.result, v.receipt);
for (const group of new Set(values.map(f => f.group))) test(`uncertain direct taste: ${group}`, () => {
    const rows = values.filter(f => f.group === group); assert.ok(rows.length);
    for (const f of rows) {
        const v = copy(f.value), original = JSON.stringify(v), buffer = api.create();
        assert.equal(capture(buffer, v), f.expected, JSON.stringify([group, v.result.input, v.result.understandings]));
        assert.equal(JSON.stringify(v), original); assert.equal(buffer.read().length, Number(f.expected));
        assert.equal(capture(buffer, v), false);
        if (!f.expected) continue;
        const r = buffer.read()[0], c = r.captured, receipt = v.receipt;
        assert.equal(r.kind, 'uncertain_direct_taste_question'); assert.equal(r.sourceId, v.result.input.id);
        assert.deepEqual(c.understanding, v.result.understandings[0]); assert.equal(c.understanding.complete, true);
        assert.deepEqual(c.understanding.unresolved, []); assert.deepEqual(c.expression, { channel: 'speech', message: 'answer_unknown' });
        assert.equal(c.response.message, 'taste_unsure'); assert.equal(c.actualSpeech, true);
        assert.equal(c.answerRecorded, false); assert.equal(c.turnAnswer, null);
        assert.equal(Object.hasOwn(receipt.afterState.context.turns.at(-1), 'answer'), false);
        assert.deepEqual(c.sources.state, { before: receipt.beforeState, after: receipt.afterState });
        assert.deepEqual(c.sources.activity, { before: receipt.beforeWorld, after: receipt.afterWorld });
        const current = c.understanding.questionSlot === 'taste_now' && receipt.beforeWorld.mode === 'eat';
        assert.equal(c.sources.currentMeal, current);
        assert.equal(c.sources.mealTasteRecorded, Object.hasOwn(receipt.beforeWorld, 'mealTaste'));
        assert.deepEqual(c.sources.mealTaste, receipt.beforeWorld.mealTaste);
        assert.deepEqual(c.sources.referencedExperiences, current ? [] : [receipt.beforeWorld.experiences.filter(e => e.kind === 'eat').at(-1)]);
        assert.deepEqual(c.inputKnowledge, receipt.inputKnowledge); assert.deepEqual(c.inputContext, receipt.inputContext);
        for (const key of ['newTeaching', 'newLearning', 'newExperience']) assert.equal(c[key], false);
        for (const key of ['knowledge', 'experiences', 'selectionSources']) assert.deepEqual(receipt.beforeState[key], receipt.afterState[key]);
        for (const key of ['mode', 'destination', 'attention', 'history', 'experiences', 'mealTaste']) assert.deepEqual(receipt.beforeWorld[key], receipt.afterWorld[key]);
        assert.equal(require('../experimental_word_diary_questions').capture(candidates.create(), v.result, receipt.reply), false);
        assert.throws(() => candidates.create().retain(r));
        const retained = JSON.stringify(buffer.read()); c.sources.input.raw = 'changed'; v.receipt.inputKnowledge.meanings = [];
        assert.equal(JSON.stringify(buffer.read()), retained);
    }
});
const edits = [
    v => { v.result.input.id = 'input:999'; }, v => { v.result.input.at++; },
    v => { v.result.input.raw += 'changed'; }, v => { v.result.input.speaker = 'other'; },
    v => { v.result.input.locale = 'en'; }, v => { v.result.input.scene += ':changed'; },
    v => { v.result.understandings[0].complete = false; }, v => { v.result.understandings[0].unresolved.push({ type: 'meaning', token: 'eat' }); },
    v => { v.result.interpretations.push(copy(v.result.interpretations[0])); },
    v => { v.result.understandings.push(copy(v.result.understandings[0])); },
    v => { v.receipt.input.at++; }, v => { v.receipt.inputKnowledge.relations.push({ id: 'invented' }); },
    v => { v.receipt.inputContext.scene += ':changed'; }, v => { v.receipt.beforeState.serial++; },
    v => { v.receipt.afterState.serial++; }, v => { v.receipt.reply.message = 'tasted_good'; },
    v => { v.receipt.afterWorld.elapsed++; }, v => { v.receipt.afterState.context.turns.at(-1).speaker = 'other'; },
    v => { delete v.receipt.beforeWorld; }, v => { delete v.receipt.afterState; },
    v => { delete v.receipt.inputKnowledge; }, v => { delete v.receipt.inputContext; },
    v => { v.result.understandings[0].subject = 'invented'; }, v => { v.result.understandings[0].eventTime = 'future'; },
    v => { v.result.understandings[0].known.meaning = 'invented'; }, v => { v.receipt.beforeState.settings.speech = 'gesture'; },
    v => { v.receipt.afterWorld.experiences.push({ id: 99999, kind: 'eat' }); },
    v => { v.result.interpretations[0].catalogRule = 'context_detail'; },
    v => { v.result.interpretations[0].slot = 'outside'; }, v => { v.result.expression.channel = 'gesture'; },
    v => { v.result.understandings[0].questionSlot = 'context_detail'; },
    v => { v.result.understandings[0].reportSource = { kind: 'speaker_report' }; },
    v => { v.receipt.afterState.context.turns.at(-1).answer = { response: { message: 'tasted_good' } }; },
    v => { v.result.expression.message = 'taste_unsure'; }, v => { v.receipt.reply.observation = true; },
    v => { delete v.receipt.input; }
];
test('independent original material and response boundaries reject tampering', () => {
    let count = 0;
    for (const f of values.filter(f => f.expected)) for (const edit of edits) {
        const v = copy(f.value); edit(v); assert.notEqual(JSON.stringify(v), JSON.stringify(f.value), String(edit));
        assert.equal(capture(api.create(), v), false, String(edit)); count++;
    }
    console.log(JSON.stringify({ edits: edits.length, rejected: count }));
});
test('current taste and referenced past meal remain separate and missing references are not filled', () => {
    const v = hear(prepared('past-missing'), 'おいしかった？');
    for (const edit of [w => { w.experiences = []; }, w => { w.experiences.push(copy(w.experiences.at(-1))); },
        w => { w.experiences.at(-1).id = 0; }, w => { w.experiences.at(-1).taste = { quality: 'sweet', pleasant: true }; }]) {
        const changed = copy(v); edit(changed.receipt.beforeWorld); assert.equal(capture(api.create(), changed), false);
    }
    const current = prepared('past-missing'); require('../scripts/experimental/diary_followup_fixtures').start(current, 'eat');
    const previous = copy(current.world.experiences.at(-1)); current.world.mealTaste.pleasant = false;
    const b = api.create(); assert.equal(capture(b, hear(current, 'おいしい？')), true);
    assert.equal(b.read()[0].captured.sources.currentMeal, true); assert.deepEqual(b.read()[0].captured.sources.referencedExperiences, []);
    assert.deepEqual(current.world.experiences.at(-1), previous);
});
test('all prior supplemental owners remain separate', () => {
    const owners = require('../scripts/experimental/diary_audit').supplementalInventory().filter(o => o.id !== '4d12ct');
    assert.equal(owners.length, 69); let calls = 0;
    for (const f of values.filter(f => f.expected)) for (const owner of owners) {
        const other = require('../' + owner.file), v = copy(f.value), r = v.receipt;
        r.originalOutput = copy(r.beforeState.context.lastOutput || null); r.previousTurn = copy(r.beforeState.context.turns.at(-1) || null);
        r.turn = copy(r.afterState.context.turns.at(-1)); r.answer = r.turn.answer || null;
        const before = JSON.stringify(v), buffer = other.create ? other.create() : candidates.create();
        assert.equal(other.capture(buffer, v.result, r), false, owner.id); assert.equal(JSON.stringify(v), before); calls++;
    }
    console.log(JSON.stringify({ priorOwners: owners.length, calls }));
});
test('same input and delayed copies stay independent through later learning and normal meals', () => {
    const active = prepared('past-missing'), early = hear(active, 'おいしかった？'), original = JSON.stringify(early), buffer = api.create();
    assert.equal(capture(buffer, early), true); const retained = JSON.stringify(buffer.read());
    require('../scripts/experimental/diary_known_reason_explanation_fixtures').prepareReason(active);
    const follow = require('../scripts/experimental/diary_followup_fixtures'); follow.start(active, 'eat'); follow.finish(active); follow.finishObservation(active);
    assert.equal(capture(buffer, early), false); const delayed = api.create(); assert.equal(capture(delayed, early), true);
    assert.equal(JSON.stringify(delayed.read()), retained); assert.equal(JSON.stringify(early), original);
    assert.equal(capture(api.create(), hear(active, 'おいしかった？')), false);
    const next = prepared('current-unpleasant'), many = api.create();
    for (let i = 0; i < 13; i++) assert.equal(capture(many, hear(next, 'おいしい？')), true);
    assert.equal(many.read().length, 13); assert.equal(new Set(many.read().map(r => r.sourceId)).size, 13);
});
test('malformed or cyclic source data cannot partially retain', () => {
    for (const record of [null, {}, { kind: 'report' }, { kind: 'uncertain_direct_taste_question', sourceId: 'input:0' }])
        assert.throws(() => api.create().retain(record));
    for (const invalid of [Infinity, undefined, () => {}, new Date(), Symbol('invalid')]) {
        const v = copy(values.find(f => f.expected).value); v.receipt.invalid = invalid;
        assert.equal(capture(api.create(), v), false);
    }
    const v = copy(values.find(f => f.expected).value); v.result.invalid = v.result; assert.equal(capture(api.create(), v), false);
});
