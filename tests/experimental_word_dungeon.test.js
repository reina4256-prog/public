'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const api = require('../experimental_word_dungeon_core');
test('unknown instructions do not move, consume a turn or teach; autonomous ability stays separate', () => {
    const original = api.setKnown(api.create(), 'move', false), snapshot = JSON.stringify(original);
    const result = api.step(original, 'right');
    assert.equal(JSON.stringify(original), snapshot);
    assert.deepEqual(result.position, original.position); assert.equal(result.turn, 0);
    assert.equal(result.events[0].understood, false); assert.equal(result.events[0].action, null);
    assert.equal(result.events[0].reason, 'unknown'); assert.deepEqual(result.known, original.known);
    assert.notDeepEqual(api.step(result).position, result.position);
});
test('a dangerous understood instruction produces an explicit different choice and reason', () => {
    const before = api.create('danger'), result = api.step(before, 'right'), event = result.events[0];
    assert.equal(event.requested, 'right'); assert.equal(event.understood, true);
    assert.equal(event.reason, 'diverged'); assert.equal(event.source, 'autonomous');
    assert.notEqual(event.action, event.requested);
    assert.ok(Math.abs(result.position.x - result.hazard.x) + Math.abs(result.position.y - result.hazard.y) > 1);
    assert.deepEqual(event.before, before.position); assert.deepEqual(event.after, result.position);
});
test('safe instructions, walls, intentional waiting and retreat retain separate outcomes', () => {
    assert.equal(api.step(api.create(), 'up').events[0].reason, 'obey');
    assert.equal(api.step(api.step(api.create(), 'up'), 'right').events.at(-1).reason, 'obey');
    const wall = api.step(api.step(api.create(), 'right'), 'right');
    assert.equal(wall.events.at(-1).reason, 'blocked');
    assert.equal(api.step(api.create(), 'wait').events[0].reason, 'wait');
    const retreat = api.step(api.create('danger'), 'retreat');
    assert.equal(retreat.events[0].source, 'instruction'); assert.equal(retreat.events[0].reason, 'obey');
    assert.equal(api.step(api.create(), 'not-a-command').events[0].reason, 'unknown');
});
test('both scenes reach the exit without loops or hazard contact, even when instruction words are unknown', () => {
    for (const scene of ['explore', 'danger']) {
        let state = api.create(scene); for (const key of Object.keys(state.known)) state = api.setKnown(state, key, false);
        for (let i = 0; i < 40 && !state.complete; i++) {
            const next = api.step(state);
            assert.notDeepEqual(next.position, next.hazard); assert.equal(api.grid[next.position.y][next.position.x], '.');
            assert.deepEqual(next.known, state.known); state = next;
        }
        assert.equal(state.complete, true); assert.deepEqual(state.position, state.exit);
        assert.deepEqual(api.step(state, 'left'), state);
    }
});
test('changing sample knowledge never rewrites a previous event, and history is bounded with unique IDs', () => {
    let state = api.step(api.create(), 'up'); const original = JSON.stringify(state.events);
    state = api.setKnown(state, 'move', false); assert.equal(JSON.stringify(state.events), original);
    for (let i = 0; i < 100; i++) state = api.step(state, 'up');
    assert.equal(state.events.length, 60); assert.equal(new Set(state.events.map(e => e.id)).size, 60);
    assert.equal(state.sequence, 101); assert.deepEqual(api.create().events, []);
});
test('the independent preview and existing assets are served without enabling personal recording', async () => {
    const server = require('../scripts/experimental/serve').createServer();
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    try {
        const base = 'http://127.0.0.1:' + server.address().port;
        for (const file of ['experimental_word_dungeon.html', 'experimental_word_dungeon.css', 'experimental_word_dungeon.js',
            'experimental_word_dungeon_core.js', 'robot.png', 'dungeon_scull_mapchip.png'])
            assert.equal((await fetch(base + '/' + file)).status, 200, file);
        assert.equal((await fetch(base + '/__word_playtest/config')).status, 404);
        assert.equal(server.personalRecording.config().enabled, false);
    } finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
});
