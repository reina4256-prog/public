'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const api = require('../experimental_word_diary_name_responses');
const candidates = require('../experimental_word_diary_candidates');
const names = require('../experimental_word_diary_names');
const { fixtures, setup, focus, hear, forms } = require('../scripts/experimental/diary_name_response_fixtures');
const copy = value => JSON.parse(JSON.stringify(value));
const values = fixtures();
const capture = (buffer, value) => api.capture(buffer, value.result, value.receipt);
for (const group of new Set(values.map(f => f.group))) test(`name response material: ${group}`, () => {
    for (const f of values.filter(item => item.group === group)) {
        const value = copy(f.value), original = JSON.stringify(value), buffer = api.create();
        assert.equal(capture(buffer, value), f.expected, JSON.stringify([group, value.result.input]));
        assert.equal(JSON.stringify(value), original); assert.equal(buffer.read().length, Number(f.expected));
        assert.equal(capture(buffer, value), false);
        if (!f.expected) continue;
        const record = buffer.read()[0], retained = JSON.stringify(buffer.read());
        assert.equal(record.kind, value.result.understandings[0].answer === 'yes' ? 'confirmation' : 'retraction');
        assert.equal(record.captured.sources.originalInputId, value.receipt.origin.result.input.id);
        assert.deepEqual(record.captured.understanding, value.result.understandings[0]);
        assert.equal(record.captured.newTeaching, false); assert.equal(record.captured.newExperience, false);
        assert.equal(record.captured.independentEvidenceAdded, false);
        assert.deepEqual(value.receipt.afterState.knowledge.meanings, value.receipt.beforeState.knowledge.meanings);
        assert.deepEqual(value.receipt.afterState.knowledge.relations, value.receipt.beforeState.knowledge.relations);
        assert.deepEqual(value.receipt.afterState.experiences, value.receipt.beforeState.experiences);
        assert.deepEqual(value.receipt.afterState.selectionSources, value.receipt.beforeState.selectionSources);
        assert.deepEqual(value.receipt.afterWorld.experiences, value.receipt.beforeWorld.experiences);
        assert.equal(record.captured.change.before.evidence.length, record.captured.change.after.evidence.length);
        record.captured.sources.origin.result.input.raw = 'changed';
        value.receipt.origin.result.input.raw = 'changed'; value.receipt.afterState.records = [];
        assert.equal(JSON.stringify(buffer.read()), retained);
    }
});
const edits = [
    v => { v.result.input.id = 'input:999'; }, v => { v.result.input.at++; },
    v => { v.result.input.raw += 'changed'; }, v => { v.result.input.speaker = 'other'; },
    v => { v.result.input.locale = 'other'; }, v => { v.result.input.scene += ':changed'; },
    v => { v.result.understandings[0].complete = false; }, v => { v.result.interpretations.push(copy(v.result.interpretations[0])); },
    v => { v.receipt.input.at++; }, v => { v.receipt.inputKnowledge.meanings.push({ id: 'invented' }); },
    v => { v.receipt.inputContext.scene += ':changed'; }, v => { v.receipt.beforeState.serial++; },
    v => { v.receipt.beforeState.context.attention = [{ id: 'other', meaning: 'berry' }]; },
    v => { v.receipt.afterState.serial++; }, v => { v.receipt.reply.message = 'invented'; },
    v => { v.receipt.afterWorld.elapsed++; }, v => { delete v.receipt.origin; }, v => { delete v.receipt.antecedent; }
];
test('name response material rejects occurrence, current knowledge, response and missing-source tampering', () => {
    for (const f of values.filter(item => item.expected)) for (const edit of edits) {
        const v = copy(f.value); edit(v);
        assert.equal(capture(api.create(), v), false, `${f.group}: ${edit}`);
    }
});
const originalEdits = [
    o => { o.result.input.at++; }, o => { o.result.input.speaker = 'other'; },
    o => { o.result.input.raw += 'changed'; }, o => { o.result.understandings[0].complete = false; },
    o => { o.receipt.beforeState.serial++; }, o => { o.receipt.beforeState.knowledge.relations = []; },
    o => { o.receipt.afterState.knowledge.associations.push({ word: 'invented' }); },
    o => { o.receipt.afterState.records = []; }, o => { o.receipt.reply.message = 'invented'; }
];
test('name response material separately checks original naming and the actual preceding prompt', () => {
    for (const f of values.filter(item => item.expected)) for (const field of ['origin', 'antecedent']) {
        for (const edit of originalEdits) {
            const v = copy(f.value); edit(v.receipt[field]);
            assert.equal(capture(api.create(), v), false, `${f.group}/${field}: ${edit}`);
        }
    }
});
test('name response material preserves original teaching candidates, other evidence and distinct new occurrences', () => {
    const v = setup(), buffer = api.create(), teaching = candidates.create();
    const first = hear(v, forms.name);
    const context = { scene: first.result.input.scene, attention: first.receipt.beforeState.context.attention };
    assert.equal(names.capture(teaching, first.result, context), true);
    const retained = teaching.read();
    assert.equal(capture(buffer, hear(v, forms.yes)), true);
    focus(v, 'shore'); hear(v, forms.name);
    const denied = hear(v, forms.correction); assert.equal(capture(buffer, denied), true);
    assert.ok(v.state.knowledge.associations[0].evidence.some(e => !e.retractedBy));
    assert.equal(v.state.knowledge.associations[0].evidence.length, 2);
    assert.deepEqual(teaching.read(), retained); assert.equal(buffer.read().length, 2);
    assert.notEqual(buffer.read()[0].sourceId, buffer.read()[1].sourceId);
    assert.equal(capture(buffer, first), false);
});
test('name response material rejects duplicate or missing root evidence and records without fabricating an antecedent', () => {
    for (const f of values.filter(item => item.expected)) for (const field of ['evidence', 'records']) {
        for (const duplicate of [false, true]) {
            const v = copy(f.value), list = field === 'records' ? v.receipt.beforeState.records
                : v.receipt.beforeState.knowledge.associations[0].evidence;
            if (duplicate) list.push(copy(list[0])); else list.length = 0;
            assert.equal(capture(api.create(), v), false);
        }
    }
});
test('name response journal validates JSON, returns independent copies and does not become a teaching buffer', () => {
    for (const value of [null, {}, { kind: 'teaching' }, { kind: 'confirmation', sourceId: 'input:0' }])
        assert.throws(() => api.create().retain(value), TypeError);
    const value = copy(values.find(f => f.expected).value), buffer = api.create();
    value.receipt.invalid = Infinity; assert.equal(capture(buffer, value), false);
    value.receipt.invalid = value.receipt; assert.equal(capture(buffer, value), false);
});

test('name response material never revisits an earlier reply after a later naming supplies a new antecedent', () => {
    const v = setup(), buffer = api.create(), early = hear(v, forms.yes);
    assert.equal(capture(buffer, early), false);
    hear(v, forms.name); assert.equal(capture(buffer, hear(v, forms.yes)), true);
    assert.equal(capture(buffer, early), false); assert.equal(buffer.read().length, 1);
});
