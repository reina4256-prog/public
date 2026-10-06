'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const api = require('../experimental_word_diary_candidates');

test('candidate capture keeps teaching, own experience and unanswered question separate, including ID zero', () => {
    const buffer = api.create();
    for (const [occurrenceId, kind] of ['teaching', 'experience', 'question'].entries()) {
        assert.equal(buffer.retain({ occurrenceId, kind, sourceId: 0, captured: { understood: false } }), true);
    }
    assert.deepEqual(buffer.read().map(item => item.kind), ['teaching', 'experience', 'question']);
    assert.ok(buffer.read().every(item => item.sourceId === 0 && !item.captured.understood));
});

test('later knowledge and mutable caller/view objects cannot rewrite the captured occurrence', () => {
    const buffer = api.create();
    const candidate = { occurrenceId: 'meal:1', kind: 'experience', sourceId: 1,
        captured: { target: 'berry:1', taste: 'sweet', known: [] } };
    const expected = JSON.parse(JSON.stringify(candidate));
    buffer.retain(candidate);
    candidate.captured.known.push('sweet');
    buffer.read()[0].captured.known.push('eat');
    assert.deepEqual(buffer.read(), [expected]);
});

test('repeat delivery and rereading add nothing; a new occurrence referencing the same source is retained', () => {
    const buffer = api.create();
    const candidate = { occurrenceId: 'lesson:1', kind: 'teaching', sourceId: 'input:1', captured: { known: [] } };
    assert.equal(buffer.retain(candidate), true);
    assert.equal(buffer.retain({ ...candidate, captured: { known: ['rest'] } }), false);
    assert.equal(buffer.read().length, 1);
    assert.equal(buffer.read().length, 1);
    assert.equal(buffer.retain({ ...candidate, occurrenceId: 'lesson:2' }), true);
    assert.equal(buffer.read().length, 2);
    assert.deepEqual(buffer.read()[0].captured.known, []);
});

test('all supplied candidates remain in occurrence order without merging taste, target or understanding differences', () => {
    const buffer = api.create();
    const candidates = [
        { occurrenceId: 1, kind: 'experience', sourceId: 1, captured: { target: 'berry:1', taste: 'sweet' } },
        { occurrenceId: 2, kind: 'experience', sourceId: 2, captured: { target: 'berry:2', taste: 'sour' } },
        { occurrenceId: 3, kind: 'teaching', sourceId: 'input:3', captured: { known: [] } },
        { occurrenceId: 4, kind: 'teaching', sourceId: 'input:4', captured: { known: ['sweet'] } }
    ];
    candidates.forEach(candidate => buffer.retain(candidate));
    assert.deepEqual(buffer.read(), candidates);
});

test('incomplete provenance is rejected without inventing a source or retaining an entry', () => {
    const buffer = api.create();
    const valid = { occurrenceId: 0, kind: 'question', sourceId: 0, captured: {} };
    for (const invalid of [{ ...valid, sourceId: null }, { ...valid, occurrenceId: '' },
        { ...valid, kind: 'report' }, { ...valid, captured: null }]) {
        assert.throws(() => buffer.retain(invalid), TypeError);
    }
    assert.deepEqual(buffer.read(), []);
});

test('non-JSON snapshots are rejected rather than silently losing captured content', () => {
    const buffer = api.create();
    const cycle = {}; cycle.self = cycle;
    for (const captured of [{ missing: undefined }, { value: NaN }, { value: () => true }, cycle, { value: new Date() }]) {
        assert.throws(() => buffer.retain({ occurrenceId: 0, kind: 'experience', sourceId: 0, captured }), TypeError);
    }
    assert.deepEqual(buffer.read(), []);
});
