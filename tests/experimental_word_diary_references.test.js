'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const api = require('../experimental_word_diary_references');
const { fixtures, setup, hear, forms } = require('../scripts/experimental/diary_reference_fixtures');
const copy = value => JSON.parse(JSON.stringify(value));
const values = fixtures();
const capture = (buffer, value) => api.capture(buffer, value.result, value.receipt);
for (const group of new Set(values.map(f => f.group))) test(`reference diary: ${group}`, () => {
    for (const f of values.filter(f => f.group === group)) {
        const value = copy(f.value), original = JSON.stringify(value), buffer = api.create();
        assert.equal(capture(buffer, value), f.expected, JSON.stringify([group, value.result.input]));
        assert.equal(JSON.stringify(value), original);
        assert.equal(buffer.read().length, Number(f.expected));
        if (!f.expected) continue;
        const record = buffer.read()[0];
        assert.equal(record.kind, value.result.interpretations[0].kind === 'invitation' ? 'proposal' : 'reference');
        assert.deepEqual(record.captured.understanding, value.result.understandings[0]);
        assert.deepEqual(record.captured.sources.origins, value.receipt.origins);
        assert.equal(record.captured.newTeaching, false);
        assert.equal(record.captured.newLearning, false); assert.equal(record.captured.newExperience, false);
        const retained = JSON.stringify(buffer.read());
        assert.equal(capture(buffer, value), false);
        record.captured.sources.origins.length = 0;
        value.receipt.origins.length = 0; value.result.understandings[0].complete = false;
        assert.equal(JSON.stringify(buffer.read()), retained);
    }
});
const edits = [
    v => { v.result.input.id = 'input:999'; }, v => { v.result.input.at++; },
    v => { v.result.input.raw = 'unrelated'; }, v => { v.result.input.speaker = 'other'; },
    v => { v.result.input.locale = 'other'; }, v => { v.result.input.scene += ':changed'; },
    v => { v.result.understandings[0].complete = false; },
    v => { v.result.understandings[0].known.meaning = 'invented'; }, v => { v.result.interpretations[0].kind = 'naming'; },
    v => { v.result.understandings.push(copy(v.result.understandings[0])); },
    v => { v.receipt.beforeState.serial++; }, v => { v.receipt.beforeState.context.attention = [{ id: 'invented' }]; },
    v => { v.receipt.beforeState.knowledge.meanings.push({ id: 'invented' }); },
    v => { v.receipt.inputKnowledge.associations.push({ word: 'invented' }); },
    v => { v.receipt.input.at++; }, v => { v.receipt.origins = []; },
    v => { v.receipt.origins.push(copy(v.receipt.origins[0])); },
    v => { v.receipt.reply.message = 'invented'; }, v => { v.receipt.afterState.serial++; },
    v => { v.receipt.afterState.selectionSources = [{ invented: true }]; },
    v => { v.receipt.afterWorld.elapsed++; }, v => { v.receipt.beforeWorld.activityStart = v.receipt.beforeWorld.elapsed + 1; },
    v => { v.receipt.afterWorld.experiences.push({ id: 999 }); },
    v => { v.receipt.beforeState.settings.speech = 'invented'; }
];
test('reference diary: occurrence, independent knowledge, real response and decision tampering is rejected', () => {
    for (const f of values.filter(f => f.expected)) for (const edit of edits) {
        const value = copy(f.value); edit(value);
        const buffer = api.create();
        assert.equal(capture(buffer, value), false, `${f.group}: ${edit}`);
        assert.deepEqual(buffer.read(), []);
    }
});
const originEdits = [
    o => { o.result.input.at++; }, o => { o.result.input.raw = 'invented'; },
    o => { o.result.input.speaker = 'other'; }, o => { o.result.input.locale = 'other'; },
    o => { o.result.understandings[0].complete = false; }, o => { o.result.learning[0].updated = []; },
    o => { o.beforeState.knowledge.meanings.push({ id: 'invented' }); }, o => { o.beforeState.knowledge.relations = []; },
    o => { o.beforeState.context.scene = 'other'; }, o => { o.beforeState.serial++; },
    o => { o.afterState.knowledge.associations.push({ invented: true }); }, o => { o.afterState.records = []; }
];
test('reference diary: every original source and correction-chain receipt is independently checked', () => {
    for (const f of values.filter(f => f.expected)) for (let i = 0; i < f.value.receipt.origins.length; i++) {
        for (const edit of originEdits) {
            const value = copy(f.value); edit(value.receipt.origins[i]);
            assert.equal(capture(api.create(), value), false, `${f.group}/${i}: ${edit}`);
        }
        const value = copy(f.value); value.receipt.origins.splice(i, 1);
        assert.equal(capture(api.create(), value), false, `${f.group}/${i}: missing origin`);
    }
});
test('reference diary: repeated new inputs keep separate usage occurrences without teaching or reinforcing roots', () => {
    const v = setup(), buffer = api.create(); hear(v, forms.ja[0]);
    const knowledge = copy(v.state.knowledge), experiences = JSON.stringify(v.state.experiences);
    for (let i = 0; i < 12; i++) {
        const value = hear(v, 'ぽぽ'); assert.equal(capture(buffer, value), true);
        assert.equal(capture(buffer, value), false);
    }
    assert.equal(buffer.read().length, 12);
    assert.deepEqual(v.state.knowledge, knowledge); assert.equal(JSON.stringify(v.state.experiences), experiences);
    assert.equal(new Set(buffer.read().map(r => r.sourceId)).size, 12);
    assert.ok(buffer.read().every(r => r.captured.sources.origins[0].result.input.id === 'input:1'));
});
test('reference diary: experienced source snapshots reject lost and duplicate experience identities', () => {
    for (const f of values.filter(f => f.group.startsWith('experienced-life'))) {
        for (const location of ['beforeState', 'origin']) for (const duplicate of [false, true]) {
            const value = copy(f.value), state = location === 'origin'
                ? value.receipt.origins[0].beforeState : value.receipt.beforeState;
            assert.ok(state.experiences.length);
            if (duplicate) state.experiences.push(copy(state.experiences[0])); else state.experiences = [];
            assert.equal(capture(api.create(), value), false);
        }
    }
});
test('reference diary: a later correction never rewrites retained use or retroactively completes an old input', () => {
    const v = setup(), buffer = api.create(), unknown = hear(v, 'ぽぽ');
    assert.equal(capture(buffer, unknown), false); hear(v, forms.ja[0]);
    const original = hear(v, 'ぽぽ'); assert.equal(capture(buffer, original), true);
    const retained = buffer.read(); hear(v, forms.ja[2]);
    assert.equal(capture(buffer, unknown), false); assert.equal(capture(buffer, original), false);
    assert.deepEqual(buffer.read(), retained);
    assert.equal(capture(buffer, hear(v, 'ぽぽ')), true);
    assert.deepEqual(buffer.read().map(r => r.captured.understanding.known.meaning), ['rest', 'sleep']);
});
test('reference diary: indirect proposals retain real outcomes without direct reason-learning provenance', () => {
    const proposals = values.filter(f => f.expected && f.value.result.interpretations[0].kind === 'invitation');
    const outcomes = new Set();
    for (const f of proposals) {
        const buffer = api.create(); assert.equal(capture(buffer, f.value), true);
        const record = buffer.read()[0]; outcomes.add(record.captured.decision.outcome);
        assert.deepEqual(f.value.receipt.beforeState.selectionSources, f.value.receipt.afterState.selectionSources);
        if (record.captured.decision.outcome === 'approaching')
            assert.equal(record.captured.decision.after.reasons[0].selectionSource, undefined);
    }
    assert.deepEqual([...outcomes].sort(), ['approaching', 'continuing', 'not_started']);
});
test('reference diary: journal rejects invalid or non-JSON reference material without changing prior records', () => {
    const buffer = api.create(), valid = { kind: 'reference', sourceId: 'input:1', occurrenceId: 'use:1', captured: {} };
    assert.equal(buffer.retain(valid), true);
    for (const invalid of [{ ...valid, kind: 'teaching' }, { ...valid, sourceId: 'input:0' },
        { ...valid, captured: null }, { ...valid, captured: { value: undefined } },
        { ...valid, captured: { value: Infinity } }, { ...valid, captured: { value: new Date() } }])
        assert.throws(() => buffer.retain(invalid), TypeError);
    assert.deepEqual(buffer.read(), [valid]);
});
