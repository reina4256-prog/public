'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const core = require('../experimental_word_learning_core');
const worldApi = require('../experimental_word_learning_world');
const careers = require('../experimental_word_careers');
const catalog = require('../experimental_word_learning_catalog.json');
const candidates = require('../experimental_word_diary_candidates');
const work = require('../experimental_word_diary_work');
const copy = value => JSON.parse(JSON.stringify(value));
function completion(master, demonstrated = true, previous = null, options = {}) {
    const state = previous || core.create(options, catalog), world = worldApi.create();
    Object.assign(world, { mode: 'observe', attention: `master:${master}`, elapsed: 1, dwell: 0,
        hunger: .1, fatigue: .1 });
    careers.arrive(world, { id: 0, target: world.attention });
    world.careers.people[master].completed = (state.experiences || []).filter(e => e.master === master).length;
    world.dwell = 0;
    const start = careers.tick(world);
    assert.equal(start.kind, 'work_start');
    if (demonstrated) worldApi.onArrival(world, state, start);
    world.dwell = 0; world.elapsed = 20;
    // Use a fresh original ID when continuing the same disposable learner.
    world.event = Math.max(world.event, ...(state.experiences || []).map(e => e.id));
    const event = careers.tick(world), before = copy(state.knowledge);
    worldApi.onArrival(world, state, event);
    return { event, before, after: copy(state.knowledge), state, world };
}
function retain(value, buffer = candidates.create()) {
    assert.equal(work.capture(buffer, value.event, value.before, value.after), true);
    return buffer;
}
test('six actual career completions keep source facts separate from bounded acquired meanings', () => {
    for (const master of Object.keys(careers.JOBS)) {
        const value = completion(master), original = JSON.stringify(value);
        const entry = retain(value).read()[0];
        assert.equal(entry.sourceId, value.event.id);
        assert.deepEqual(entry.captured.sources, { before: value.event.before, after: value.event.after,
            result: careers.JOBS[master].result, demonstration: `work_label_${master}`, reasons: value.event.reasons });
        assert.deepEqual(entry.captured.understanding.task.known.map(m => m.id), [`work:${master}`]);
        for (const aspect of ['activity', 'task']) {
            const u = entry.captured.understanding[aspect];
            assert.equal(u.status, 'recognized');
            assert.equal(u.known[0].acquired, 'at_completion');
            assert.equal(u.known[0].basis.source, 'demonstrated_work');
        }
        assert.equal(JSON.stringify(value), original);
        assert.deepEqual(Object.keys(entry.captured.understanding), ['point', 'activity', 'task']);
    }
});
test('work understanding is independent of spoken output and initial life/foundation settings', () => {
    for (const foundation of [false, true]) for (const life of [false, true]) for (const speech of ['short', 'gesture']) {
        const value = completion('fishing', true, null, { foundation, life, speech });
        const u = retain(value).read()[0].captured.understanding;
        assert.equal(u.activity.known[0].acquired, 'at_completion');
        assert.equal(u.task.known[0].acquired, 'at_completion');
    }
});
test('previous experience remains distinct from this completion, including mixed known and newly acquired meanings', () => {
    const first = completion('farming');
    const again = completion('farming', true, first.state);
    assert.equal(retain(again).read()[0].captured.sources.reasons[0].kind, 'work_recall');
    for (const aspect of ['activity', 'task']) assert.equal(retain(again).read()[0].captured.understanding[aspect].known[0].acquired, 'before_completion');
    const other = completion('fishing', true, first.state);
    const u = retain(other).read()[0].captured.understanding;
    assert.equal(u.activity.known[0].acquired, 'before_completion');
    assert.equal(u.task.known[0].acquired, 'at_completion');
});
test('a completion without demonstration keeps its result and selection sources with missing understanding', () => {
    const value = completion('fishing', false), entry = retain(value).read()[0];
    assert.equal(entry.captured.sources.result, 'net_repaired');
    assert.equal(entry.captured.sources.demonstration, null);
    assert.deepEqual(entry.captured.understanding.activity.missing, ['work']);
    assert.deepEqual(entry.captured.understanding.task.missing, ['work:fishing']);
    assert.deepEqual(entry.captured.sources.reasons, [{ kind: 'observed_work', target: 'master:fishing' }]);
});
test('later learning, repeated delivery and modified copies never rewrite a completion', () => {
    const value = completion('fishing', false), buffer = retain(value), original = buffer.read();
    const later = completion('fishing', true, value.state);
    assert.equal(work.capture(buffer, value.event, value.before, later.after), false);
    assert.equal(retain({ ...value, after: later.after }).read()[0].captured.understanding.task.status, 'unrecognized');
    buffer.read()[0].captured.sources.reasons[0].kind = 'changed';
    value.event.result = 'changed'; value.after.meanings.push({ id: 'work', source: 'initial' });
    assert.deepEqual(buffer.read(), original);
    retain(later, buffer);
    assert.equal(buffer.read().length, 2);
    assert.deepEqual(buffer.read()[0], original[0]);
});
test('new understanding requires matching work evidence rather than a foreign event or source', () => {
    const value = completion('fishing');
    for (const change of [m => { m.source = 'experienced_life'; },
        m => { m.evidence[0].experienceId++; }, m => { m.evidence[0].master = 'farming'; },
        m => { m.evidence[0].demonstration = 'work_label_farming'; },
        m => { m.evidence[0].scope.result = 'stones_cleared'; }]) {
        const invalid = copy(value);
        invalid.after.meanings.filter(m => m.source === 'demonstrated_work').forEach(change);
        assert.equal(retain(invalid).read()[0].captured.understanding.task.status, 'unrecognized');
    }
});
test('non-work and unsupported entrances are excluded; valid zero ID and malformed boundaries are explicit', () => {
    const value = completion('fishing');
    for (const event of [null, { kind: 'work_start' }, { kind: 'experience', activity: 'eat' },
        { ...value.event, master: 'dealer' }]) assert.equal(work.capture(candidates.create(), event, value.before, value.after), false);
    const zero = copy(value); zero.event.id = 0;
    zero.after.meanings.filter(m => m.source === 'demonstrated_work').forEach(m => m.evidence[0].experienceId = 0);
    assert.equal(retain(zero).read()[0].sourceId, 0);
    assert.equal(retain(zero).read()[0].captured.understanding.task.status, 'recognized');
    for (const patch of [{ id: undefined }, { start: NaN }, { end: 0 }, { target: 'master:farming' },
        { before: {} }, { demonstration: undefined }, { reasons: [undefined] }]) {
        assert.throws(() => work.capture(candidates.create(), { ...value.event, ...patch }, value.before, value.after), TypeError);
    }
});
