'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const clock = require('../experimental_word_diary_clock');

test('diary day crosses at 25 active minutes and retains the remainder', () => {
    const state = Object.freeze(clock.create());
    assert.equal(clock.DAY_MS, 1500000);
    const before = clock.advance(state, clock.DAY_MS - 1);
    assert.deepEqual(before, { state: { dayIndex: 0, elapsedMs: 1499999 }, crossedDays: 0 });
    assert.deepEqual(clock.advance(before.state, 1), { state: { dayIndex: 1, elapsedMs: 0 }, crossedDays: 1 });
    assert.deepEqual(clock.advance(before.state, clock.DAY_MS * 2 + 8),
        { state: { dayIndex: 3, elapsedMs: 7 }, crossedDays: 3 });
    assert.deepEqual(state, clock.create());
});

test('each agreed stop reason and overlapping stops prevent advancement', () => {
    const state = Object.freeze({ dayIndex: 2, elapsedMs: clock.DAY_MS - 1 });
    for (const reason of clock.STOP_REASONS) {
        assert.deepEqual(clock.advance(state, clock.DAY_MS * 3, { [reason]: true }), { state, crossedDays: 0 });
    }
    const stops = { manualPaused: true, encounterOpen: true };
    assert.deepEqual(clock.advance(state, 100, stops).state, state);
    stops.encounterOpen = false;
    assert.deepEqual(clock.advance(state, 100, stops).state, state);
    stops.manualPaused = false;
    assert.deepEqual(clock.advance(state, 1, stops), { state: { dayIndex: 3, elapsedMs: 0 }, crossedDays: 1 });
});

test('active elapsed ticks advance across a day without requiring a sleep stop flag', () => {
    let state = clock.create();
    for (let i = 0; i < 15001; i++) state = clock.advance(state, 100).state;
    assert.deepEqual(state, { dayIndex: 1, elapsedMs: 100 });
});

test('an in-memory copy resumes the same partial day, without adding closed time', () => {
    const partial = clock.advance(clock.create(), 712345).state;
    const stopped = clock.advance(partial, 86400000, { closed: true }).state;
    const copy = JSON.parse(JSON.stringify(stopped)); // Not a game save format or bridge.
    assert.deepEqual(clock.advance(copy, 100).state, { dayIndex: 0, elapsedMs: 712445 });
    assert.deepEqual(partial, { dayIndex: 0, elapsedMs: 712345 });
});

test('fractional active ticks and zero delta are preserved', () => {
    const partial = { dayIndex: 7, elapsedMs: 123.5 };
    assert.deepEqual(clock.advance(partial, 0).state, partial);
    assert.deepEqual(clock.advance(partial, .25).state, { dayIndex: 7, elapsedMs: 123.75 });
});

test('invalid states, deltas, stop flags and overflow are rejected', () => {
    for (const state of [null, {}, { dayIndex: -1, elapsedMs: 0 }, { dayIndex: .5, elapsedMs: 0 },
        { dayIndex: 0, elapsedMs: clock.DAY_MS }, { dayIndex: 0, elapsedMs: NaN }]) {
        assert.throws(() => clock.advance(state, 1), RangeError);
    }
    for (const delta of [-1, NaN, Infinity, '100', Number.MAX_SAFE_INTEGER + 1]) {
        assert.throws(() => clock.advance(clock.create(), delta), RangeError);
    }
    for (const stops of [null, [], { hidden: 1 }, { sleeping: true }]) {
        assert.throws(() => clock.advance(clock.create(), 1, stops), TypeError);
    }
    assert.throws(() => clock.advance({ dayIndex: Number.MAX_SAFE_INTEGER, elapsedMs: 0 }, clock.DAY_MS), RangeError);
    assert.throws(() => clock.advance({ dayIndex: 0, elapsedMs: 1 }, Number.MAX_SAFE_INTEGER), RangeError);
});
