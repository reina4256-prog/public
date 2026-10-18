'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const api = require('../experimental_word_diary_unresolved_name_targets');
const bd = require('../experimental_word_diary_name_questions');
const candidates = require('../experimental_word_diary_candidates');
const { fixtures, make, setup, focus, hear } = require('../scripts/experimental/diary_unresolved_name_target_fixtures');
const copy = value => JSON.parse(JSON.stringify(value));
const values = fixtures();
const capture = (buffer, v) => api.capture(buffer, v.result, v.receipt);
for (const group of new Set(values.map(f => f.group))) test(`unresolved name target: ${group}`, () => {
    for (const f of values.filter(item => item.group === group)) {
        const v = copy(f.value), source = JSON.stringify(v), buffer = api.create();
        assert.equal(capture(buffer, v), f.expected, JSON.stringify([group, v.result.input]));
        assert.equal(JSON.stringify(v), source); assert.equal(buffer.read().length, Number(f.expected));
        assert.equal(capture(buffer, v), false);
        if (!f.expected) continue;
        const record = buffer.read()[0], retained = JSON.stringify(buffer.read());
        assert.equal(record.kind, 'unresolved_name_target');
        assert.equal(record.sourceId, v.result.input.id);
        assert.deepEqual(record.captured.understanding, v.result.understandings[0]);
        assert.equal(record.captured.understanding.complete, false);
        assert.equal(record.captured.understanding.subject, 'self');
        assert.equal(record.captured.understanding.questionSlot, 'name');
        assert.deepEqual(record.captured.missingRelationsBefore, []);
        assert.equal(record.captured.targetResolvedBefore, !!v.result.understandings[0].target.adopted);
        assert.deepEqual(record.captured.inputKnowledge, v.receipt.inputKnowledge);
        assert.deepEqual(record.captured.inputContext, v.receipt.inputContext);
        assert.deepEqual(record.captured.response, v.receipt.reply);
        assert.deepEqual(record.captured.sources.state, { before: v.receipt.beforeState, after: v.receipt.afterState });
        assert.equal(record.captured.turnAnswer, null);
        assert.equal(Object.hasOwn(v.receipt.afterState.context.turns.at(-1), 'answer'), false);
        for (const key of ['newTeaching', 'newLearning', 'newExperience']) assert.equal(record.captured[key], false);
        for (const key of ['knowledge', 'experiences', 'selectionSources'])
            assert.deepEqual(v.receipt.beforeState[key], v.receipt.afterState[key]);
        for (const key of ['mode', 'destination', 'attention', 'history', 'reasons', 'activityStart', 'experiences'])
            assert.deepEqual(v.receipt.beforeWorld[key], v.receipt.afterWorld[key]);
        assert.equal(bd.capture(bd.create(), v.result, v.receipt), false);
        assert.throws(() => candidates.create().retain(record));
        record.captured.understanding.subject = 'invented'; v.receipt.beforeState.serial++;
        assert.equal(JSON.stringify(buffer.read()), retained);
    }
});
const edits = [
    v => { v.result.input.id = 'input:999'; }, v => { v.result.input.at++; },
    v => { v.result.input.raw += 'changed'; }, v => { v.result.input.speaker = 'other'; },
    v => { v.result.input.locale = 'invalid'; }, v => { v.result.input.scene += ':changed'; },
    v => { v.result.understandings[0].complete = true; },
    v => { v.result.interpretations.push(copy(v.result.interpretations[0])); },
    v => { v.result.understandings.push(copy(v.result.understandings[0])); },
    v => { v.receipt.input.at++; }, v => { v.receipt.inputKnowledge.relations.push({ id: 'invented' }); },
    v => { v.receipt.inputContext.scene += ':changed'; }, v => { v.receipt.beforeState.serial++; },
    v => { v.receipt.beforeState.context.attention.push({ id: 'other', meaning: 'berry' }); },
    v => { v.receipt.afterState.serial++; }, v => { v.receipt.reply.message = 'invented'; },
    v => { v.receipt.afterWorld.elapsed++; }, v => { v.receipt.afterState.context.turns.at(-1).speaker = 'other'; },
    v => { delete v.receipt.beforeWorld; }, v => { delete v.receipt.afterState; },
    v => { delete v.receipt.inputKnowledge; }, v => { delete v.receipt.inputContext; },
    v => { v.result.understandings[0].subject = null; },
    v => { v.result.understandings[0].aspect = 'activity_report'; },
    v => { v.result.understandings[0].polarity = 'negative'; },
    v => { v.result.understandings[0].eventTime = 'past'; },
    v => { v.result.understandings[0].known.meaning = 'berry'; },
    v => { v.receipt.beforeWorld.attention = 'berry:tampered'; },
    v => { v.receipt.afterWorld.experiences.push({ id: 'invented' }); },
    v => { v.result.understandings[0].kind = 'partial'; },
    v => { v.result.understandings[0].unresolved = []; },
    v => { v.result.understandings[0].relations = []; },
    v => { v.result.interpretations[0].catalogRule = 'sour_question'; },
    v => { v.result.interpretations[0].slot = 'attention'; },
    v => { v.result.understandings[0].conditionStatus = 'met'; },
    v => { v.result.understandings[0].questionSlot = null; },
    v => { v.result.understandings[0].reportSource = { kind: 'speaker_report' }; },
    v => { v.receipt.afterState.context.turns.at(-1).answer = { slot: 'name' }; },
    v => { v.result.understandings[0].target.candidates.push({ id: 'invented', source: 'attention' }); },
    v => { v.result.understandings[0].target.adopted = { id: 'invented', source: 'attention' }; }
];
test('unresolved name target rejects changed original, understanding and independent receipt material', () => {
    let rejected = 0;
    for (const f of values.filter(item => item.expected)) for (const edit of edits) {
        const v = copy(f.value); edit(v);
        assert.notEqual(JSON.stringify(v), JSON.stringify(f.value));
        assert.equal(capture(api.create(), v), false, `${f.group}: ${edit}`); rejected++;
    }
    console.log(JSON.stringify({ ca: { original: values.length, accepted: values.filter(f => f.expected).length,
        editKinds: edits.length, rejected, groups: Object.fromEntries([...new Set(values.map(f => f.group))]
            .map(group => [group, [values.filter(f => f.group === group).length, values.filter(f => f.group === group && f.expected).length]])) } }));
});
test('unresolved name target remains separate from all 37 previously adopted owners', () => {
    const owners = require('../scripts/experimental/diary_audit').supplementalInventory().slice(0, 37);
    assert.equal(owners.length, 37);
    for (const f of values.filter(item => item.expected)) for (const owner of owners) {
        const v = copy(f.value), source = JSON.stringify(v);
        assert.equal(require('../' + owner.file).capture(candidates.create(), v.result, v.receipt), false, owner.id);
        assert.equal(JSON.stringify(v), source);
    }
});
test('all complete bd originals retain their original owner', () => {
    for (const f of require('../scripts/experimental/diary_name_question_fixtures').fixtures().filter(f => f.expected)) {
        assert.equal(capture(api.create(), f.value), false);
        assert.equal(bd.capture(bd.create(), f.value.result, f.value.receipt), true);
    }
});

test('same input never grows or overwrites; delayed material and returned copies remain independent', () => {
    const v = make(), buffer = api.create(), early = hear(v), source = JSON.stringify(early);
    assert.equal(capture(buffer, early), true); const retained = JSON.stringify(buffer.read());
    for (let i = 0; i < 12; i++) assert.equal(capture(buffer, hear(v)), true);
    assert.equal(buffer.read().length, 13); assert.equal(new Set(buffer.read().map(e => e.sourceId)).size, 13);
    assert.equal(capture(buffer, early), false);
    const delayed = api.create(); assert.equal(capture(delayed, early), true);
    assert.equal(JSON.stringify(delayed.read()), retained); assert.equal(JSON.stringify(early), source);
    delayed.read()[0].captured.inputKnowledge.meanings = [];
    early.receipt.beforeState.serial++;
    assert.equal(JSON.stringify(delayed.read()), retained);
});
test('later attention, knowledge, actual naming and confirmation never repair the original target', () => {
    const v = make({ life: false }), buffer = api.create(), early = hear(v);
    assert.equal(capture(buffer, early), true); const retained = JSON.stringify(buffer.read());
    v.state.knowledge.meanings = copy(setup().state.knowledge.meanings);
    assert.equal(capture(api.create(), hear(v)), true);
    focus(v, 'clearing', ['berry:1']);
    const later = hear(v);
    assert.equal(capture(api.create(), later), false);
    assert.equal(bd.capture(bd.create(), later.result, later.receipt), true);
    hear(v, '\u3053\u308c\u3092\u3053\u308d\u3063\u3066\u547c\u307c\u3046');
    const confirm = hear(v, '\u3046\u3093');
    assert.ok(confirm.receipt.afterState.knowledge.associations[0].confirmedBy);
    const named = hear(v);
    assert.equal(bd.capture(bd.create(), named.result, named.receipt), true);
    assert.equal(capture(buffer, early), false); assert.equal(JSON.stringify(buffer.read()), retained);
    assert.equal(capture(api.create(), named), false);
    focus(v, 'clearing', []);
    assert.equal(capture(api.create(), hear(v)), true);
});
test('all bz originals keep their existing owner and never become target-only material', () => {
    const bz = require('../experimental_word_diary_incomplete_name_questions');
    for (const f of require('../scripts/experimental/diary_incomplete_name_question_fixtures').fixtures().filter(f => f.expected)) {
        assert.equal(capture(api.create(), f.value), false);
        assert.equal(bz.capture(bz.create(), f.value.result, f.value.receipt), true);
    }
});
test('journal rejects malformed material and capture rejects non-JSON input without partial retention', () => {
    for (const value of [null, {}, {kind: 'report'}, {kind: 'unresolved_name_target', sourceId: 'input:0'}])
        assert.throws(() => api.create().retain(value));
    for (const malformed of [Infinity, undefined, () => {}, new Date(), Symbol('invalid')]) {
        const v = copy(values.find(f => f.expected).value); v.receipt.invalid = malformed;
        assert.equal(capture(api.create(), v), false);
    }
    const v = copy(values.find(f => f.expected).value); v.result.invalid = v.result;
    assert.equal(capture(api.create(), v), false);
});
