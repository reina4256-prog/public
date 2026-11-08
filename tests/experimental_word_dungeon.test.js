'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const api = require('../experimental_word_dungeon_core');
const learning = require('../experimental_word_dungeon_learning');
const core = require('../experimental_word_learning_core');
const catalog = require('../experimental_word_learning_catalog.json');

test('the same child keeps island knowledge and original records, and learns a distinct dungeon individual name', () => {
    const state = core.create({ foundation: true, life: true, speech: 'short' }, catalog);
    core.perceive(state, { scene: 'clearing', attention: [{ id: 'berry:1', meaning: 'berry' }] });
    core.receive(state, 'これはポポだよ', catalog, { locale: 'ja', at: 10 });
    const original = JSON.stringify(state.records), knowledge = JSON.stringify(state.knowledge);
    const session = learning.create(state); learning.perceive(session, learning.objects[0].id);
    assert.equal(session.state, state); assert.equal(JSON.stringify(state.knowledge), knowledge);
    const prior = learning.receive(session, 'ポポ', catalog, 'ja', 20).result;
    assert.notEqual(prior.understandings[0].target?.adopted?.id, learning.objects[0].id);
    learning.receive(session, 'これはアカだよ', catalog, 'ja', 30);
    assert(state.knowledge.associations.some(a => a.word === 'アカ' && a.target === learning.objects[0].id));
    assert.equal(JSON.stringify(state.records.slice(0, JSON.parse(original).length)), original);
});

test('warning is individual testimony with original understanding, and changes an understood approach into an explained retreat', () => {
    const state = core.create({ foundation: true, life: true, speech: 'short' }, catalog);
    let session = learning.create(state); learning.perceive(session, learning.objects[0].id);
    learning.receive(session, 'そこへ行って', catalog, 'ja', 1);
    assert.equal(session.last.reason, 'obey');
    const original = JSON.stringify(state.dungeonLearning.inputs[0]);
    const warning = learning.receive(session, 'これは危ない', catalog, 'ja', 2);
    assert.equal(warning.learned, true); assert.equal(learning.warned(session), true);
    learning.receive(session, 'そこへ行って', catalog, 'ja', 3);
    assert.equal(session.last.reason, 'diverged'); assert(session.last.warningSources.includes(warning.result.input.id));
    assert.equal(JSON.stringify(state.dungeonLearning.inputs[0]), original);
    assert.equal(state.knowledge.associations.some(a => a.word === '危ない'), false);
    assert.equal(learning.notes(state).length, 1);
    session = learning.create(state); learning.advance(session);
    assert.equal(session.last.reason, 'retreat');
    assert.equal(new Set(state.dungeonLearning.inputs.map(e => e.result.input.id)).size, 3);
});

test('missing report knowledge or pointing never becomes a warning, and stair warnings do not spread to opponents', () => {
    for (const [foundation, target] of [[false, learning.objects[0].id], [true, null], [true, learning.objects[1].id]]) {
        const state = core.create({ foundation, life: true, speech: 'gesture' }, catalog), session = learning.create(state);
        learning.perceive(session, target); learning.receive(session, 'これは危ない', catalog, 'ja', 1);
        assert.equal(learning.warned(session), false);
        assert.equal(state.dungeonLearning.warnings.length, 0); assert.equal(learning.notes(state)[0].detail, 'dungeonUnknown');
    }
});

test('seven language warning and approach forms keep originals and language-neutral targets', () => {
    for (const [locale, forms] of Object.entries(learning.forms)) {
        const state = core.create({ foundation: true, life: true, speech: 'short' }, catalog), session = learning.create(state);
        learning.perceive(session, learning.objects[0].id);
        learning.receive(session, forms.warning[0], catalog, locale, 1);
        learning.receive(session, forms.go[0], catalog, locale, 2);
        assert.equal(session.last.reason, 'diverged', locale);
        assert.equal(state.dungeonLearning.inputs[0].result.input.raw, forms.warning[0]);
        assert.equal(state.dungeonLearning.warnings[0].target, 'dungeon:enemy:1');
        const before = JSON.stringify(state); learning.notes(state); assert.equal(JSON.stringify(state), before);
    }
});

test('localized naming preserves the actual original and does not acquire a warning or transfer a species name', () => {
    for (const [locale, raw] of Object.entries({ en: 'This is Popo', 'zh-CN': '这是波波', ru: 'Это Попо',
        'es-ES': 'Esto se llama Popo', 'pt-BR': 'Isto se chama Popo', de: 'Das heißt Popo' })) {
        const state = core.create({ foundation: true, life: true, speech: 'short' }, catalog), session = learning.create(state);
        learning.perceive(session, learning.objects[0].id);
        const value = learning.receive(session, raw, catalog, locale, 1);
        assert.equal(value.result.understandings[0].complete, true, locale);
        assert.equal(state.knowledge.associations.length, 1);
        assert.equal(state.knowledge.associations[0].target, learning.objects[0].id);
        assert.equal(state.dungeonLearning.inputs[0].result.input.raw, raw);
        assert.equal(state.dungeonLearning.inputs[0].knowledgeBefore.associations.length, 0);
        assert.equal(learning.warned(session), false);
    }
});

test('request and walking knowledge are necessary for a target instruction; understanding does not force compliance', () => {
    for (const [foundation, life] of [[false, true], [true, false]]) {
        const state = core.create({ foundation, life, speech: 'short' }, catalog), session = learning.create(state);
        learning.perceive(session, learning.objects[0].id);
        const value = learning.receive(session, 'そこへ行って', catalog, 'ja', 1);
        assert.equal(value.result.understandings[0].complete, false);
        assert.equal(session.turn, 0); assert.equal(session.last, null);
    }
});
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
