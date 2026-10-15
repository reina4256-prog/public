'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const api = require('../experimental_word_diary_after_eat_walk_proposals');
const candidates = require('../experimental_word_diary_candidates');
const { fixtures, setup, hearProposal: hear } = require('../scripts/experimental/diary_after_eat_walk_proposal_fixtures');
const copy = value => JSON.parse(JSON.stringify(value));
const values = fixtures();
const capture = (buffer, value) => api.capture(buffer, value.result, value.receipt);
for (const group of new Set(values.map(f => f.group))) test(`after eating walk proposal: ${group}`, () => {
    for (const f of values.filter(item => item.group === group)) {
        const v = copy(f.value), source = JSON.stringify(v), buffer = candidates.create();
        assert.equal(capture(buffer, v), f.expected, JSON.stringify([group, v.result.input]));
        assert.equal(JSON.stringify(v), source); assert.equal(buffer.read().length, Number(f.expected));
        assert.equal(capture(buffer, v), false);
        if (!f.expected) continue;
        const record = buffer.read()[0], retained = JSON.stringify(buffer.read());
        assert.equal(record.kind, 'proposal');
        assert.equal(record.occurrenceId, `after_eat_walk:${v.result.input.id}`);
        assert.equal(record.captured.status, 'understood');
        assert.equal(record.captured.compliance, null);
        assert.equal(record.captured.actionDecisionRecorded, false);
        assert.deepEqual(record.captured.response, v.receipt.reply);
        assert.deepEqual(record.captured.understanding, v.result.understandings[0]);
        assert.equal(record.captured.actualSpeech, v.receipt.beforeState.settings.speech === 'short');
        for (const flag of ['newTeaching', 'newLearning', 'newExperience']) assert.equal(record.captured[flag], false);
        for (const field of ['knowledge', 'experiences', 'selectionSources'])
            assert.deepEqual(v.receipt.beforeState[field], v.receipt.afterState[field]);
        assert.deepEqual(v.receipt.beforeWorld.experiences, v.receipt.afterWorld.experiences);
        for (const key of ['mode', 'destination', 'attention', 'history', 'reasons', 'activityStart'])
            assert.deepEqual(v.receipt.beforeWorld[key], v.receipt.afterWorld[key]);
        record.captured.sources.input.raw = 'changed'; v.result.input.raw = 'changed';
        assert.equal(JSON.stringify(buffer.read()), retained);
        assert.equal(candidates.create().retain(record), true);
    }
});
const edits = [
    v => { v.result.input.id = 'input:999'; }, v => { v.result.input.at++; },
    v => { v.result.input.raw += 'changed'; }, v => { v.result.input.speaker = 'other'; },
    v => { v.result.input.locale = 'invalid'; }, v => { v.result.input.scene += ':changed'; },
    v => { v.result.understandings[0].complete = false; },
    v => { v.result.interpretations.push(copy(v.result.interpretations[0])); },
    v => { v.receipt.input.at++; }, v => { v.receipt.inputKnowledge.relations = []; },
    v => { v.receipt.inputContext.scene += ':changed'; }, v => { v.receipt.beforeState.serial++; },
    v => { v.receipt.beforeState.context.attention.push({ id: 'other', meaning: 'berry' }); },
    v => { v.receipt.afterState.serial++; }, v => { v.receipt.reply.message = 'join'; },
    v => { v.receipt.afterWorld.elapsed++; },
    v => { v.receipt.afterState.context.turns.at(-1).speaker = 'other'; },
    v => { delete v.receipt.beforeWorld; }, v => { delete v.receipt.afterState; },
    v => { v.result.understandings[0].subject = 'self'; },
    v => { v.result.understandings[0].aspect = 'activity_report'; },
    v => { v.result.understandings[0].polarity = 'negative'; },
    v => { v.result.understandings[0].eventTime = 'past'; },
    v => { v.result.understandings[0].known.meaning = 'rest'; },
    v => { v.receipt.beforeWorld.attention = 'berry:tampered'; },
    v => { v.receipt.afterWorld.experiences.push({ id: 'invented' }); },
    v => { v.result.understandings[0].conditionStatus = 'met'; },
    v => { v.result.understandings[0].conditionStatus = null; },
    v => { v.result.understandings[0].known.conditionMeaning = 'rest'; },
    v => { v.result.understandings[0].roles = { actors: ['self', 'player'] }; },
    v => { v.result.understandings[0].target = { adopted: { id: 'berry:1' } }; }
];
test('after eating walk rejects altered sources, actors, condition judgments and actual replies', () => {
    for (const f of values.filter(item => item.expected)) for (const edit of edits) {
        const v = copy(f.value); edit(v);
        assert.equal(capture(candidates.create(), v), false, `${f.group}: ${edit}`);
    }
});
test('new after eating walk inputs remain separate and duplicates cannot overwrite material', () => {
    const v = setup(), buffer = candidates.create(), first = hear(v);
    assert.equal(capture(buffer, first), true); const retained = buffer.read()[0];
    for (let i = 0; i < 12; i++) assert.equal(capture(buffer, hear(v)), true);
    assert.equal(buffer.read().length, 13); assert.equal(capture(buffer, first), false);
    assert.deepEqual(buffer.read()[0], retained);
    assert.equal(new Set(buffer.read().map(item => item.sourceId)).size, 13);
});
test('later knowledge cannot retroactively complete an earlier partial after eating invitation', () => {
    const v = setup({ foundation: false }), buffer = candidates.create(), early = hear(v);
    assert.equal(capture(buffer, early), false);
    v.state.knowledge = copy(setup().state.knowledge);
    assert.equal(capture(buffer, hear(v)), true);
    assert.equal(capture(buffer, early), false); assert.equal(buffer.read().length, 1);
});
test('understood after eating invitation retains unknown condition and owner subject without invented roles', () => {
    for (const f of values.filter(item => item.expected)) {
        const buffer = candidates.create(); assert.equal(capture(buffer, f.value), true);
        const saved = buffer.read()[0].captured.understanding;
        assert.equal(saved.subject, f.value.result.input.speaker);
        assert.deepEqual(saved.known, { meaning: 'walk', conditionMeaning: 'eat' });
        assert.equal(saved.polarity, 'positive'); assert.equal(saved.eventTime, 'unspecified');
        assert.equal(saved.aspect, null); assert.equal(saved.target, null); assert.equal(saved.roles, undefined);
        assert.equal(saved.conditionStatus, 'unknown');
    }
});
test('real later meal completion never rewrites retained or previously partial invitation material', () => {
    const n = require('../scripts/experimental/diary_negation_fixtures');
    for (const foundation of [true, false]) {
        const v = setup({ foundation }), buffer = candidates.create(); n.start(v, 'eat');
        const early = hear(v); assert.equal(capture(buffer, early), foundation);
        const retained = buffer.read(); n.finish(v);
        assert.ok(v.world.experiences.some(item => item.kind === 'eat'));
        assert.equal(capture(buffer, early), false); assert.deepEqual(buffer.read(), retained);
        assert.equal(capture(buffer, hear(v)), foundation);
        if (foundation) assert.ok(buffer.read().every(item => item.captured.understanding.conditionStatus === 'unknown'));
    }
});
test('after eating walk rejects non-JSON receipts without partial retention', () => {
    for (const malformed of [Infinity, undefined, () => {}, new Date(), Symbol('invalid')]) {
        const v = copy(values.find(f => f.expected).value); v.receipt.invalid = malformed;
        assert.equal(capture(candidates.create(), v), false);
    }
    const v = copy(values.find(f => f.expected).value); v.receipt.invalid = v.receipt;
    assert.equal(capture(candidates.create(), v), false);
});
