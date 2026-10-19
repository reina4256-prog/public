'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const api = require('../experimental_word_diary_gesture_reason_questions');
const candidates = require('../experimental_word_diary_candidates');
const oldQuestions = require('../experimental_word_diary_questions');
const fixture = require('../scripts/experimental/diary_gesture_reason_question_fixtures');
const copy = value => JSON.parse(JSON.stringify(value));
const values = fixture.fixtures();
const capture = (buffer, v) => api.capture(buffer, v.result, v.receipt);
for (const group of new Set(values.map(f => f.group))) test(`gesture reason: ${group}`, () => {
    for (const f of values.filter(item => item.group === group)) {
        const v = copy(f.value), source = JSON.stringify(v), buffer = api.create();
        assert.equal(capture(buffer, v), f.expected, JSON.stringify([group, v.result.input, v.result.understandings]));
        assert.equal(JSON.stringify(v), source); assert.equal(buffer.read().length, Number(f.expected));
        assert.equal(capture(buffer, v), false);
        if (!f.expected) continue;
        const record = buffer.read()[0], u = v.result.understandings[0], retained = JSON.stringify(buffer.read());
        assert.equal(record.kind, 'gesture_reason_question');
        assert.deepEqual(record.captured.understanding, u); assert.equal(u.complete, true);
        assert.deepEqual(u.unresolved, []);
        assert.equal(u.questionSlot, 'reason');
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
    v => { v.result.understandings[0].complete = false; },
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
    console.log(JSON.stringify({ ci: { original: values.length, accepted: values.filter(f => f.expected).length,
        editKinds: edits.length, rejected, groups: Object.fromEntries([...new Set(values.map(f => f.group))]
            .map(group => [group, [values.filter(f => f.group === group).length, values.filter(f => f.group === group && f.expected).length]])) } }));
});
test('ci stays separate from all 45 prior supplemental owners', () => {
    const owners = require('../scripts/experimental/diary_audit').supplementalInventory().slice(0, 45);
    assert.equal(owners.length, 45);
    for (const f of values.filter(item => item.expected)) for (const owner of owners) {
        const v = copy(f.value), source = JSON.stringify(v);
        assert.equal(require('../' + owner.file).capture(candidates.create(), v.result, v.receipt), false, owner.id);
        assert.equal(JSON.stringify(v), source);
    }
});

test('reference-bearing attend and bare attend preserve only the actual response', () => {
    for (const foundation of [false, true]) for (const reviewed of [false, true]) {
        const v = fixture.hear(fixture.prepared({ foundation }, reviewed)), buffer = api.create();
        assert.equal(capture(buffer, v), true);
        const c = buffer.read()[0].captured;
        assert.deepEqual(c.response, v.receipt.reply);
        for (const key of ['experienceId', 'eventTime', 'choiceSource', 'reviewedBy'])
            assert.equal(Object.hasOwn(c.response, key), reviewed);
        assert.equal(c.actualSpeech, false); assert.equal(c.turnAnswer, null);
        assert.equal(Object.hasOwn(c.response, 'literal'), false);
        if (reviewed) {
            for (const key of ['experienceId', 'eventTime', 'choiceSource', 'reviewedBy']) {
                const bad = copy(v); delete bad.receipt.reply[key];
                assert.equal(capture(api.create(), bad), false, key);
            }
            const bad = copy(v); bad.receipt.reply.choiceSource.inputId = 'input:999';
            assert.equal(capture(api.create(), bad), false);
        } else {
            const bad = copy(v); bad.receipt.reply.experienceId = 999;
            assert.equal(capture(api.create(), bad), false);
        }
    }
});

test('actual reason speech and unknown answers remain with u and 4d2', () => {
    const u = require('../experimental_word_diary_reason_answers');
    for (const reviewed of [false, true]) {
        const v = fixture.hear(fixture.prepared({ speech: 'short' }, reviewed)), r = v.receipt;
        assert.equal(capture(api.create(), v), false);
        assert.equal(r.reply.message, reviewed ? 'selected_reason' : 'answer_unknown');
        assert.equal(oldQuestions.capture(candidates.create(), v.result, r.reply), !reviewed);
        const context = { scene: r.beforeState.context.scene, attention: r.beforeState.context.attention,
            mode: r.beforeWorld.mode, target: r.beforeWorld.attention, activityStart: r.beforeWorld.activityStart,
            elapsed: r.beforeWorld.elapsed, destination: r.beforeWorld.destination,
            history: r.beforeWorld.history, experiences: r.beforeWorld.experiences };
        assert.equal(u.capture(candidates.create(), v.result, r.reply, context, r.beforeState.knowledge,
            r.beforeState.experiences, r.beforeState.selectionSources), reviewed);
    }
});

test('later learning, changed activity, delayed capture and new inputs never rewrite the original', () => {
    const v = fixture.prepared({ foundation: false }, true), original = fixture.hear(v), buffer = api.create();
    assert.equal(capture(buffer, original), true);
    const retained = JSON.stringify(buffer.read()), source = JSON.stringify(original);
    fixture.worldApi.approach(v.world, 'path');
    for (let i = 0; i < 8; i++) assert.equal(capture(buffer, fixture.hear(v)), true);
    assert.equal(buffer.read().length, 9);
    assert.deepEqual(buffer.read()[0], JSON.parse(retained)[0]);
    const delayed = api.create(); assert.equal(capture(delayed, original), true);
    assert.equal(JSON.stringify(delayed.read()), retained); assert.equal(capture(buffer, original), false);
    assert.equal(JSON.stringify(original), source);
    const missing = fixture.setup({ foundation: false }), old = fixture.hear(missing);
    missing.state.knowledge = copy(v.state.knowledge); fixture.hear(missing);
    assert.equal(capture(api.create(), old), false);
    v.state.knowledge.relations = v.state.knowledge.relations.map(r => r.scope ? { ...r, scope: { ...r.scope, slot: 'current_activity' } } : r);
    const wrongScope = fixture.hear(v);
    assert.equal(wrongScope.result.understandings[0].complete, false);
    assert.equal(capture(api.create(), wrongScope), false);
    assert.deepEqual(buffer.read()[0], JSON.parse(retained)[0]);
});

test('malformed and non-JSON data never partially retain', () => {
    for (const record of [null, {}, { kind: 'question' }, { kind: 'gesture_reason_question', sourceId: 'input:0' }])
        assert.throws(() => api.create().retain(record));
    for (const bad of [Infinity, undefined, () => {}, new Date(), Symbol('bad')]) {
        const v = copy(values.find(f => f.expected).value); v.receipt.invalid = bad;
        assert.equal(capture(api.create(), v), false);
    }
    const v = copy(values.find(f => f.expected).value); v.result.invalid = v.result;
    assert.equal(capture(api.create(), v), false);
});
