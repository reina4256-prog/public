'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const core = require('../experimental_word_learning_core');
const worldApi = require('../experimental_word_learning_world');
const catalog = require('../experimental_word_learning_catalog.json');
const candidates = require('../experimental_word_diary_candidates');
const experiences = require('../experimental_word_diary_experiences');
const copy = value => JSON.parse(JSON.stringify(value));
function completion(activity, labelled = false, options = {}) {
    const state = core.create({ life: false, ...options }, catalog), world = worldApi.create();
    Object.assign(world, { mode: activity, attention: activity === 'eat' ? 'berry:1' : 'shade',
        harvest: 1, elapsed: 1, activityStart: 1, dwell: .1, hunger: .8, fatigue: .7,
        activityBefore: { hunger: .8, fatigue: .7 } });
    if (activity === 'eat') world.mealTaste = { quality: 'sweet', pleasant: true };
    if (labelled) for (const raw of activity === 'eat' ? ['食べる', '甘い', '「おなかがすいた」'] : ['休む', '「疲れた」']) {
        const result = core.receive(state, raw, catalog);
        worldApi.respond(world, result, state);
        assert.ok(result.lifeLearning);
    }
    world.pause = 0;
    const event = worldApi.tick(world, .1), before = copy(state.knowledge);
    assert.equal(event.kind, 'experience');
    worldApi.onArrival(world, state, event);
    return { event, before, after: copy(state.knowledge), state, world };
}
function retain(value, buffer = candidates.create()) {
    assert.equal(experiences.capture(buffer, value.event, value.before, value.after), true);
    return buffer;
}
test('actual meal completion separates sensory sources and meanings acquired at this completion', () => {
    const value = completion('eat', true), original = JSON.stringify(value);
    const entry = retain(value).read()[0];
    assert.equal(entry.sourceId, value.event.id);
    assert.deepEqual(entry.captured.sensation.taste, { quality: 'sweet', pleasant: true });
    for (const aspect of ['activity', 'recovery', 'taste']) {
        assert.equal(entry.captured.understanding[aspect].status, 'recognized');
        assert.ok(entry.captured.understanding[aspect].known.every(item => item.acquired === 'at_completion'
            && item.basis.evidence.some(e => e.experienceId === value.event.id)));
    }
    assert.equal(JSON.stringify(value), original);
});
test('rest completion keeps bodily change and its bounded understanding without manufacturing feelings', () => {
    const value = completion('rest', true), entry = retain(value).read()[0];
    assert.ok(entry.captured.sensation.after.fatigue < entry.captured.sensation.before.fatigue);
    assert.equal(entry.captured.understanding.recovery.status, 'recognized');
    assert.deepEqual(entry.captured.understanding.recovery.known.map(item => item.id), ['rest', 'tired']);
    assert.equal('taste' in entry.captured.sensation, false);
    assert.equal('feeling' in entry.captured, false);
    assert.equal('reason' in entry.captured, false);
});
test('unlabelled bodily experiences are retained with explicit missing understanding', () => {
    for (const activity of ['eat', 'rest']) {
        const value = completion(activity), entry = retain(value).read()[0];
        assert.deepEqual(value.before.meanings, []);
        assert.deepEqual(value.after.meanings, []);
        assert.equal(entry.captured.understanding.activity.status, 'unrecognized');
        assert.equal(entry.captured.understanding.recovery.status, 'unrecognized');
        if (activity === 'eat') assert.deepEqual(entry.captured.understanding.taste.missing, ['sweet']);
    }
});
test('initial knowledge remains distinct from learning at completion in all eight settings', () => {
    for (const foundation of [false, true]) for (const life of [false, true]) for (const speech of ['short', 'gesture']) {
        for (const activity of ['eat', 'rest']) {
            const value = completion(activity, true, { foundation, life, speech });
            const understanding = retain(value).read()[0].captured.understanding;
            for (const aspect of ['activity', 'recovery', ...(activity === 'eat' ? ['taste'] : [])]) {
                assert.equal(understanding[aspect].status, 'recognized');
                assert.ok(understanding[aspect].known.every(item => item.acquired === (life ? 'before_completion' : 'at_completion')));
            }
        }
    }
});
test('later lessons, repeated delivery and copied views cannot rewrite an earlier completion', () => {
    const value = completion('eat'), buffer = retain(value), original = buffer.read();
    const later = completion('eat', true);
    later.after.meanings.forEach(item => item.evidence.forEach(e => { e.experienceId = 99; }));
    assert.equal(experiences.capture(buffer, value.event, value.before, later.after), false);
    buffer.read()[0].captured.sensation.taste.quality = 'changed';
    value.event.taste.quality = 'changed';
    assert.deepEqual(buffer.read(), original);
    retain({ ...value, event: { ...value.event, id: 2 } }, buffer);
    assert.deepEqual(buffer.read().map(item => item.sourceId), [value.event.id, 2]);
    const lateProjection = retain({ ...value, after: later.after }).read()[0];
    assert.equal(lateProjection.captured.understanding.activity.status, 'unrecognized');
});
test('unimproved and unsupported tastes stay factual, without a success or taste interpretation', () => {
    const value = completion('eat', true, { life: true });
    value.event.after.hunger = value.event.before.hunger;
    value.event.taste = { quality: 'bitter', pleasant: false };
    const entry = retain(value).read()[0];
    assert.equal(entry.captured.understanding.recovery.status, 'not_applicable');
    assert.equal(entry.captured.understanding.taste.status, 'uninterpreted');
    assert.deepEqual(entry.captured.sensation.taste, value.event.taste);
});
test('only completed food and rest events pass, with valid sources including ID zero', () => {
    const value = completion('rest');
    for (const event of [null, { kind: 'eat_start' }, { kind: 'experience', activity: 'work' }]) {
        assert.equal(experiences.capture(candidates.create(), event, value.before, value.after), false);
    }
    assert.equal(experiences.capture(candidates.create(), { ...value.event, target: 'path' }, value.before, value.after), false);
    value.event.id = 0;
    assert.equal(retain(value).read()[0].sourceId, 0);
    for (const patch of [{ id: undefined }, { start: NaN }, { end: 0 }, { before: {} }]) {
        assert.throws(() => experiences.capture(candidates.create(), { ...value.event, ...patch }, value.before, value.after), TypeError);
    }
});
