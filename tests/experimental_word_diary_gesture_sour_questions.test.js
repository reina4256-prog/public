'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const api = require('../experimental_word_diary_gesture_sour_questions');
const candidates = require('../experimental_word_diary_candidates');
const oldQuestions = require('../experimental_word_diary_questions');
const fixture = require('../scripts/experimental/diary_gesture_sour_question_fixtures');
const copy = value => JSON.parse(JSON.stringify(value));
const values = fixture.fixtures();
const capture = (buffer, v) => api.capture(buffer, v.result, v.receipt);
for (const group of new Set(values.map(f => f.group))) test(`gesture sour: ${group}`, () => {
    for (const f of values.filter(item => item.group === group)) {
        const v = copy(f.value), source = JSON.stringify(v), buffer = api.create();
        assert.equal(capture(buffer, v), f.expected, JSON.stringify([group, v.result.input, v.result.understandings]));
        assert.equal(JSON.stringify(v), source); assert.equal(buffer.read().length, Number(f.expected));
        assert.equal(capture(buffer, v), false);
        if (!f.expected) continue;
        const record = buffer.read()[0], u = v.result.understandings[0], retained = JSON.stringify(buffer.read());
        assert.equal(record.kind, 'gesture_sour_question');
        assert.deepEqual(record.captured.understanding, u); assert.equal(u.complete, false);
        assert.deepEqual(u.unresolved, [{ type: 'detail', token: 'sour' }]);
        assert.deepEqual(record.captured.sources.meal,
            v.receipt.beforeWorld.experiences.filter(e => e.kind === 'eat').at(-1) || null);
        assert.deepEqual(record.captured.inputKnowledge, v.receipt.inputKnowledge);
        assert.deepEqual(record.captured.inputContext, v.receipt.inputContext);
        assert.deepEqual(record.captured.response, v.receipt.reply);
        assert.equal(record.captured.actualSpeech, false);
        assert.deepEqual(record.captured.sources.state, { before: v.receipt.beforeState, after: v.receipt.afterState });
        assert.deepEqual(record.captured.sources.activity, { before: v.receipt.beforeWorld, after: v.receipt.afterWorld });
        assert.equal(record.captured.turnAnswer, null);
        assert.equal(Object.hasOwn(record.captured, 'actualAnswer'), false);
        assert.equal(Object.hasOwn(record.captured, 'answer'), false);
        assert.equal(Object.hasOwn(v.receipt.afterState.context.turns.at(-1), 'answer'), false);
        for (const key of ['newTeaching', 'newLearning', 'newExperience']) assert.equal(record.captured[key], false);
        for (const key of ['knowledge', 'experiences', 'selectionSources'])
            assert.deepEqual(v.receipt.beforeState[key], v.receipt.afterState[key]);
        for (const key of ['mode', 'destination', 'attention', 'history', 'reasons', 'activityStart', 'experiences'])
            assert.deepEqual(v.receipt.beforeWorld[key], v.receipt.afterWorld[key]);
        assert.equal(oldQuestions.capture(candidates.create(), v.result, v.receipt.reply), false);
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
    v => { v.receipt.afterState.serial++; }, v => { v.receipt.reply.message = 'answer_unknown'; },
    v => { v.receipt.afterWorld.elapsed++; }, v => { v.receipt.afterState.context.turns.at(-1).speaker = 'other'; },
    v => { delete v.receipt.beforeWorld; }, v => { delete v.receipt.afterState; },
    v => { delete v.receipt.inputKnowledge; }, v => { delete v.receipt.inputContext; },
    v => { v.result.understandings[0].subject = 'invented'; },
    v => { v.result.understandings[0].aspect = 'invented'; },
    v => { v.result.understandings[0].polarity = 'invented'; },
    v => { v.result.understandings[0].eventTime = 'invented'; },
    v => { v.result.understandings[0].known.meaning = 'invented'; },
    v => { v.receipt.beforeWorld.attention = 'berry:tampered'; },
    v => { v.receipt.afterWorld.experiences.push({ id: 'invented' }); },
    v => { v.result.understandings[0].unresolved = [{ type: 'detail', token: 'invented' }]; },
    v => { v.result.interpretations[0].catalogRule = 'name_question'; },
    v => { v.result.interpretations[0].slot = 'outside_slot'; },
    v => { v.result.understandings[0].conditionStatus = 'met'; },
    v => { v.result.understandings[0].questionSlot = 'name'; },
    v => { v.result.understandings[0].reportSource = { kind: 'speaker_report' }; },
    v => { v.receipt.afterState.context.turns.at(-1).answer = { slot: 'outside_slot' }; },
    v => { v.result.understandings[0].target = { candidates: [{ id: 'invented' }], adopted: null }; },
    v => { v.receipt.beforeState.settings.speech = 'short'; },
    v => { v.receipt.reply.observation = true; }
];
test('independent input-time evidence and actual response reject tampering without supplementing answers', () => {
    let rejected = 0;
    for (const f of values.filter(item => item.expected)) for (const edit of edits) {
        const v = copy(f.value); edit(v); assert.notEqual(JSON.stringify(v), JSON.stringify(f.value));
        assert.equal(capture(api.create(), v), false, `${f.group}: ${edit}`); rejected++;
    }
    console.log(JSON.stringify({ cg: { original: values.length, accepted: values.filter(f => f.expected).length,
        editKinds: edits.length, rejected, groups: Object.fromEntries([...new Set(values.map(f => f.group))]
            .map(group => [group, [values.filter(f => f.group === group).length, values.filter(f => f.group === group && f.expected).length]])) } }));
});
test('cg stays separate from all 43 prior supplemental owners', () => {
    const owners = require('../scripts/experimental/diary_audit').supplementalInventory().slice(0, 43);
    assert.equal(owners.length, 43);
    for (const f of values.filter(item => item.expected)) for (const owner of owners) {
        const v = copy(f.value), source = JSON.stringify(v);
        assert.equal(require('../' + owner.file).capture(candidates.create(), v.result, v.receipt), false, owner.id);
        assert.equal(JSON.stringify(v), source);
    }
});
test('attend preserves detail ignorance without inferring a taste or referenced experience', () => {
    for (const meal of [null, 'sweet', 'bitter', 'sour']) for (const sweetKnown of [false, true]) {
        const v = fixture.setup({ speech: 'gesture' });
        if (meal) fixture.eat(v, meal);
        if (!sweetKnown) v.state.knowledge.meanings = v.state.knowledge.meanings.filter(e => e.id !== 'sweet');
        const value = fixture.hear(v), buffer = api.create();
        assert.equal(value.receipt.reply.message, 'attend'); assert.equal(capture(buffer, value), true);
        const record = buffer.read()[0];
        assert.deepEqual(record.captured.response, { message: 'attend' });
        assert.equal(Object.hasOwn(record.captured.response, 'experienceId'), false);
        assert.equal(record.captured.sources.meal?.taste.quality || null, meal);
        assert.equal(record.captured.turnAnswer, null);
    }
});
test('delayed supply, new inputs and later knowledge or meals never rewrite original evidence', () => {
    const v = fixture.setup({ speech: 'gesture' }), old = fixture.hear(v), source = JSON.stringify(old);
    const buffer = api.create(); assert.equal(capture(buffer, old), true);
    const retained = JSON.stringify(buffer.read());
    fixture.eat(v); v.state.knowledge.meanings.push({ id: 'sour', source: 'initial' });
    for (let i = 0; i < 13; i++) assert.equal(capture(buffer, fixture.hear(v)), true);
    assert.equal(buffer.read().length, 14);
    assert.equal(JSON.stringify(buffer.read()[0]), JSON.stringify(JSON.parse(retained)[0]));
    const delayed = api.create(); assert.equal(capture(delayed, old), true);
    assert.equal(JSON.stringify(delayed.read()), retained); assert.equal(capture(buffer, old), false);
    assert.equal(JSON.stringify(old), source);
    const missing = fixture.setup({ speech: 'gesture', foundation: false }), incomplete = fixture.hear(missing);
    missing.state.knowledge = copy(v.state.knowledge); fixture.eat(missing); fixture.hear(missing);
    assert.equal(capture(api.create(), incomplete), false);
});
test('malformed, non-JSON and cyclic data never partially retain', () => {
    for (const value of [null, {}, { kind: 'report' }, { kind: 'gesture_sour_question', sourceId: 'input:0' }])
        assert.throws(() => api.create().retain(value));
    for (const malformed of [Infinity, undefined, () => {}, new Date(), Symbol('invalid')]) {
        const v = copy(values.find(f => f.expected).value); v.receipt.invalid = malformed;
        assert.equal(capture(api.create(), v), false);
    }
    const v = copy(values.find(f => f.expected).value); v.result.invalid = v.result;
    assert.equal(capture(api.create(), v), false);
});

test('existing answer, name, confirmation and nine-slot fixtures stay outside cg', () => {
    for (const name of ['answer', 'name_question', 'incomplete_name_question', 'unresolved_name_target',
        'incomplete_confirmation_question', 'gesture_direct_question', 'gesture_name_question']) {
        for (const item of require('../scripts/experimental/diary_' + name + '_fixtures').fixtures().filter(f => f.expected)) {
            const v = copy(item.value), source = JSON.stringify(v);
            assert.equal(capture(api.create(), v), false, name);
            assert.equal(JSON.stringify(v), source);
        }
    }
});
