'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const api = require('../experimental_word_diary_incomplete_desire_reports');
const ay = require('../experimental_word_diary_desire_reports');
const candidates = require('../experimental_word_diary_candidates');
const { fixtures, setup, hearDesire: hear } = require('../scripts/experimental/diary_incomplete_desire_report_fixtures');
const copy = value => JSON.parse(JSON.stringify(value));
const values = fixtures();
const capture = (buffer, value) => api.capture(buffer, value.result, value.receipt);
for (const group of new Set(values.map(f => f.group))) test(`incomplete desire report: ${group}`, () => {
    for (const f of values.filter(item => item.group === group)) {
        const v = copy(f.value), source = JSON.stringify(v), buffer = candidates.create();
        assert.equal(capture(buffer, v), f.expected, JSON.stringify([group, v.result.input]));
        assert.equal(JSON.stringify(v), source); assert.equal(buffer.read().length, Number(f.expected));
        assert.equal(capture(buffer, v), false);
        if (!f.expected) continue;
        assert.equal(ay.capture(candidates.create(), v.result, v.receipt), false);
        const record = buffer.read()[0], retained = JSON.stringify(buffer.read()), u = v.result.understandings[0];
        assert.equal(record.kind, 'report'); assert.equal(u.complete, false);
        assert.deepEqual(record.captured.understanding, u);
        assert.equal(Object.hasOwn(record.captured, 'reportSource'), Object.hasOwn(u, 'reportSource'));
        if (Object.hasOwn(u, 'reportSource')) assert.deepEqual(record.captured.reportSource, u.reportSource);
        assert.equal(record.captured.meaningKnownBefore, u.known.meaning === 'eat');
        assert.equal(u.conditionStatus, null);
        const missing = id => u.unresolved.some(e => e.type === 'relation' && e.id === id);
        assert.equal(u.polarity, missing('negation') ? 'unknown' : 'negative');
        assert.equal(u.eventTime, missing('time') ? 'unspecified' : 'now');
        assert.equal(u.aspect, u.kind === 'partial' ? null : 'desire');
        assert.equal(u.target, null);
        if (u.kind === 'partial') { assert.equal(u.subject, null); assert.equal(Object.hasOwn(u, 'reportSource'), false); }
        assert.equal(record.captured.relationsKnownBefore, !u.unresolved.some(e => e.type === 'relation'));
        assert.deepEqual(record.captured.missingMeaningsBefore, u.unresolved.filter(e => e.type === 'meaning'));
        assert.deepEqual(record.captured.missingRelationsBefore, u.unresolved.filter(e => e.type === 'relation').map(e => e.id));
        assert.deepEqual(record.captured.response, v.receipt.reply);
        assert.deepEqual(record.captured.inputContext, v.receipt.inputContext);
        assert.deepEqual(record.captured.sources.state, { before: v.receipt.beforeState, after: v.receipt.afterState });
        assert.equal(record.captured.actualSpeech, v.receipt.beforeState.settings.speech === 'short');
        for (const flag of ['newTeaching', 'newLearning', 'newExperience']) assert.equal(record.captured[flag], false);
        for (const field of ['knowledge', 'experiences', 'selectionSources'])
            assert.deepEqual(v.receipt.beforeState[field], v.receipt.afterState[field]);
        assert.deepEqual(v.receipt.beforeWorld.experiences, v.receipt.afterWorld.experiences);
        record.captured.sources.input.raw = 'changed'; v.result.input.raw = 'changed';
        assert.equal(JSON.stringify(buffer.read()), retained);
        assert.equal(candidates.create().retain(record), true);
    }
});
test('incomplete desire material remains separate from all 28 previously adopted owners', () => {
    const owners = require('../scripts/experimental/diary_audit').supplementalInventory()
        .slice(0, 28).map(owner => ({ ...owner, api: require('../' + owner.file) }));
    assert.equal(owners.length, 28);
    let rejected = 0;
    for (const f of values.filter(item => item.expected)) for (const owner of owners) {
        const value = copy(f.value), original = JSON.stringify(value);
        assert.equal(owner.api.capture(candidates.create(), value.result, value.receipt), false, owner.id);
        assert.equal(JSON.stringify(value), original); rejected++;
    }
    assert.equal(rejected, values.filter(f => f.expected).length * 28);
});
const edits = [
    v => { v.result.input.id = 'input:999'; }, v => { v.result.input.at++; },
    v => { v.result.input.raw += 'changed'; }, v => { v.result.input.speaker = 'other'; },
    v => { v.result.input.locale = 'en'; }, v => { v.result.input.scene += ':changed'; },
    v => { v.result.understandings[0].complete = true; },
    v => { v.result.interpretations.push(copy(v.result.interpretations[0])); },
    v => { v.receipt.input.at++; }, v => { v.receipt.inputKnowledge.relations.push({ id: 'invented' }); },
    v => { v.receipt.inputContext.scene += ':changed'; }, v => { v.receipt.beforeState.serial++; },
    v => { v.receipt.beforeState.context.attention.push({ id: 'other', meaning: 'berry' }); },
    v => { v.receipt.afterState.serial++; }, v => { v.receipt.reply.message = 'invented'; },
    v => { v.receipt.afterWorld.elapsed++; }, v => { v.receipt.afterState.context.turns.at(-1).speaker = 'other'; },
    v => { delete v.receipt.beforeWorld; }, v => { delete v.receipt.afterState; },
    v => { v.result.understandings[0].reportSource = { kind: 'speaker_report', inputId: 'invented', heardAt: -1 }; },
    v => { v.result.understandings[0].subject = 'self'; },
    v => { v.result.understandings[0].aspect = 'activity_report'; },
    v => { v.result.understandings[0].polarity = v.result.understandings[0].polarity === 'negative' ? 'positive' : 'negative'; },
    v => { v.result.understandings[0].eventTime = 'past'; },
    v => { v.result.understandings[0].known.meaning = 'invented'; },
    v => { v.receipt.beforeWorld.attention = 'berry:tampered'; },
    v => { v.receipt.afterWorld.experiences.push({ id: 'invented' }); },
    v => { v.result.understandings[0].kind = 'invented'; },
    v => { v.result.understandings[0].unresolved = []; },
    v => { v.result.understandings[0].relations = ['invented']; },
    v => { v.result.interpretations[0].catalogRule = 'rest_comfort'; },
    v => { v.result.interpretations[0].meaning = 'comfortable'; },
    v => { v.result.interpretations[0].aspect = 'activity_report'; },
    v => { v.result.understandings[0].conditionStatus = 'met'; },
    v => { v.result.understandings[0].known.detail = 'importance'; },
    v => { v.result.interpretations[0].detail = 'invented'; },
    v => { v.result.understandings[0].testimony = { verified: true }; },
    v => { v.receipt.afterState.context.turns.at(-1).answer = { slot: 'invented' }; }
];
test('incomplete desire report rejects invented understanding, source and independent receipt material', () => {
    let rejected = 0, accepted = 0;
    for (const f of values.filter(item => item.expected)) {
        accepted++;
        for (const edit of edits) {
            const v = copy(f.value); edit(v);
            assert.notEqual(JSON.stringify(v), JSON.stringify(f.value));
            assert.equal(capture(candidates.create(), v), false, `${f.group}: ${edit}`); rejected++;
        }
    }
    console.log(JSON.stringify({ br: { groups: new Set(values.map(f => f.group)).size,
        original: values.length, accepted, editKinds: edits.length, rejected,
        breakdown: Object.fromEntries([...new Set(values.map(f => f.group))].map(group =>
            [group, [values.filter(f => f.group === group).length, values.filter(f => f.group === group && f.expected).length]])) } }));
});
test('incomplete desire report keeps new inputs separate, delayed original material and independent copies', () => {
    const v = setup({ foundation: false }), buffer = candidates.create(), first = hear(v), original = JSON.stringify(first);
    assert.equal(capture(buffer, first), true); const retained = JSON.stringify(buffer.read());
    for (let i = 0; i < 12; i++) assert.equal(capture(buffer, hear(v)), true);
    assert.equal(buffer.read().length, 13); assert.equal(new Set(buffer.read().map(e => e.sourceId)).size, 13);
    assert.equal(capture(buffer, first), false); assert.equal(JSON.stringify(first), original);
    const delayed = candidates.create(); assert.equal(capture(delayed, first), true);
    assert.equal(JSON.stringify(delayed.read()), retained);
    const changed = delayed.read(); changed[0].captured.sources.state.before.serial = 999;
    changed[0].captured.inputKnowledge.meanings = [];
    first.receipt.beforeState.serial = 999; assert.equal(JSON.stringify(delayed.read()), retained);
    const missing = copy(values.find(f => f.expected).value); delete missing.receipt.inputContext;
    assert.equal(capture(candidates.create(), missing), false);
});
test('later prerequisites preserve old incomplete material and send a new complete desire report to ay only', () => {
    const v = setup({ foundation: false }), buffer = candidates.create(), early = hear(v);
    assert.equal(capture(buffer, early), true); const retained = JSON.stringify(buffer.read());
    v.state.knowledge = copy(setup().state.knowledge); const later = hear(v);
    assert.equal(capture(buffer, later), false);
    assert.equal(ay.capture(candidates.create(), later.result, later.receipt), true);
    assert.equal(capture(buffer, early), false); assert.equal(JSON.stringify(buffer.read()), retained);
    assert.equal(capture(candidates.create(), early), true);
});
test('incomplete desire report rejects non-JSON receipt and cyclic result without partial retention', () => {
    for (const malformed of [Infinity, undefined, () => {}, new Date(), Symbol('invalid')]) {
        const v = copy(values.find(f => f.expected).value); v.receipt.invalid = malformed;
        assert.equal(capture(candidates.create(), v), false);
    }
    const v = copy(values.find(f => f.expected).value); v.result.invalid = v.result;
    assert.equal(capture(candidates.create(), v), false);
});
