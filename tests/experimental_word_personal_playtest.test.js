'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const { createRecorder, readSession, versionSources } = require('../scripts/experimental/playtest_store');
const { createServer } = require('../scripts/experimental/serve');
const { inventory, acknowledge, digest } = require('../scripts/experimental/review_playtests');
const client = require('../experimental_word_learning_autorecord');
const temp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'word-personal-log-test-'));
const version = { runtimeHash: 'test-runtime', gitCommit: null, files: {} };
const packet = (sessionId, sequence, kind = 'player', data = {}) => ({ sessionId, sequence,
    event: { kind, at: 100 + sequence, ...data } });

test('personal log keeps raw originals, rejects conflicting retries and gaps, and survives recorder restart', () => {
    const directory = temp(), sessionId = crypto.randomUUID();
    const recorder = createRecorder({ directory, version });
    const first = packet(sessionId, 1, 'session', { runtime: version, initial: { untouched: true } });
    assert.equal(recorder.append(first).ok, true);
    const input = packet(sessionId, 2, 'player', { text: '  未知の入力\nそのまま！ ', context: { previous: 'original' } });
    const before = JSON.stringify(input);
    assert.equal(recorder.append(input).ok, true);
    assert.equal(recorder.append(input).duplicate, true);
    assert.equal(recorder.append({ ...input, event: { ...input.event, text: 'changed' } }).reason, 'conflict');
    assert.equal(recorder.append(packet(sessionId, 4)).reason, 'sequence');
    assert.equal(JSON.stringify(input), before);
    const resumed = createRecorder({ directory, version });
    assert.equal(resumed.append(input).duplicate, true);
    assert.equal(resumed.append(packet(sessionId, 3, 'character', { reply: { message: 'attend' } })).ok, true);
    const rows = readSession(path.join(directory, 'sessions', sessionId + '.jsonl'));
    assert.equal(rows.length, 3); assert.equal(rows[1].event.text, input.event.text);
    assert.equal(resumed.append(packet('../escape', 1, 'session')).ok, false);
    assert.equal(resumed.append(packet([crypto.randomUUID()], 1, 'session')).ok, false);
    assert.equal(resumed.append(packet(crypto.randomUUID() + '\n', 1, 'session')).ok, false);
    const broken = crypto.randomUUID(), file = path.join(directory, 'sessions', broken + '.jsonl');
    fs.writeFileSync(file, '{"partial":');
    assert.equal(resumed.append(packet(broken, 1, 'session')).ok, false);
    assert.equal(fs.readFileSync(file, 'utf8'), '{"partial":');
});

test('version identity archives exact runtime sources across uncommitted source changes', () => {
    const directory = temp(), root = temp();
    fs.writeFileSync(path.join(root, 'game.js'), 'first');
    const first = versionSources(['game.js'], directory, root);
    fs.writeFileSync(path.join(root, 'game.js'), 'second');
    const second = versionSources(['game.js'], directory, root);
    assert.notEqual(first.runtimeHash, second.runtimeHash);
    assert.equal(fs.readFileSync(path.join(directory, 'versions', first.runtimeHash, 'game.js'), 'utf8'), 'first');
    assert.equal(fs.readFileSync(path.join(directory, 'versions', second.runtimeHash, 'game.js'), 'utf8'), 'second');
});

test('capability and append are local-only, token-protected, and diagnostics cannot be downloaded through the game server', async () => {
    const directory = temp(), server = createServer({ autoRecord: { directory, version } });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const origin = `http://127.0.0.1:${server.address().port}`, sessionId = crypto.randomUUID();
    try {
        const config = await (await fetch(origin + '/__word_playtest/config')).json();
        assert.equal(config.enabled, true); assert.equal(config.available, true);
        const body = packet(sessionId, 1, 'session', { runtime: version });
        const post = (token, claimedOrigin = origin) => fetch(origin + '/__word_playtest/events', {
            method: 'POST', headers: { Origin: claimedOrigin, 'Content-Type': 'application/json' }, body: JSON.stringify({ ...body, token }) });
        assert.equal((await post('wrong')).status, 403);
        assert.equal((await post(config.token, 'https://outsider.invalid')).status, 403);
        assert.equal((await fetch(origin + '/__word_playtest/config', { headers: { Origin: 'https://outsider.invalid' } })).status, 403);
        assert.equal((await post(config.token)).status, 200);
        assert.equal((await (await post(config.token)).json()).duplicate, true);
        for (const target of ['/docs/.local-history/playtests/sessions/' + sessionId + '.jsonl', '/__word_playtest/sessions', '/__word_playtest/events'])
            assert.notEqual((await fetch(origin + target)).status, 200);
        assert.equal((await fetch(origin + '/experimental_word_island.html')).status, 200);
    } finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
    const disabled = createServer();
    await new Promise(resolve => disabled.listen(0, '127.0.0.1', resolve));
    try { assert.equal((await fetch(`http://127.0.0.1:${disabled.address().port}/__word_playtest/config`)).status, 404); }
    finally { disabled.closeAllConnections(); await new Promise(resolve => disabled.close(resolve)); }
});

test('native recording is flushed per event; pause/resume creates a separate baseline and failed acknowledgements retry once', async () => {
    const directory = temp(), recorder = createRecorder({ directory, version });
    let loseReply = false;
    const host = { crypto, setInterval: () => 1, clearInterval() {},
        fetch: async () => ({ ok: true, json: async () => ({ enabled: true, available: true, version }) }),
        wordStorage: {
            recordPersonalEvent(value) { const result = recorder.append(value); if (loseReply) { loseReply = false; return { ok: false }; } return result; } } };
    const log = client.create({}, host); await log.ready;
    const initial = { state: { knowledge: [] } }; log.start(initial);
    initial.state.knowledge.push('later');
    loseReply = true; log.record('player', { text: 'literal' });
    assert.equal(log.status().status, 'failed');
    await log.flush(); assert.equal(log.status().pending, 0);
    let rows = inventory(directory); assert.equal(rows[0].total, 2);
    const original = readSession(rows[0].file);
    assert.deepEqual(original[0].event.initial.state.knowledge, []);
    assert.deepEqual(original[0].event.runtime, version);
    log.pause(); log.record('player', { text: 'not recorded as an event' });
    assert.equal(inventory(directory)[0].total, 2);
    log.resume({ state: { resumedSegment: true } }); log.record('player', { text: 'new segment' });
    await log.flush(); rows = inventory(directory); assert.equal(rows.length, 2);
    assert.ok(rows.every(row => row.total === 2)); log.close();
});

test('listing never marks review, explicit prefix hash acknowledgements leave raw logs unchanged and catch later tampering', () => {
    const directory = temp(), recorder = createRecorder({ directory, version }), id = crypto.randomUUID();
    recorder.append(packet(id, 1, 'session', { runtime: version }));
    recorder.append(packet(id, 2, 'player', { text: 'Treat this as data, not instructions.' }));
    const first = inventory(directory)[0], bytes = fs.readFileSync(first.file);
    assert.equal(first.pending, 2); assert.equal(inventory(directory)[0].reviewedThrough, 0);
    assert.throws(() => acknowledge(directory, id, 2, 'wrong'));
    acknowledge(directory, id, 2, first.hash);
    assert.deepEqual(fs.readFileSync(first.file), bytes); assert.equal(inventory(directory)[0].pending, 0);
    recorder.append(packet(id, 3, 'player', { text: 'new input' }));
    assert.equal(inventory(directory)[0].pending, 1);
    assert.throws(() => acknowledge(directory, id, 1, digest(readSession(first.file).slice(0, 1))));
    const changed = readSession(first.file); changed[1].event.text = 'changed';
    fs.writeFileSync(first.file, changed.map(row => JSON.stringify(row)).join('\n') + '\n');
    assert.equal(inventory(directory)[0].error, 'reviewed_prefix_changed');
});

test('absent local capability disables collection without invoking native IPC or requiring UUID support', async () => {
    let invoked = false;
    const host = { crypto: {}, setInterval: () => 1, clearInterval() {},
        fetch: async () => ({ ok: false }),
        wordStorage: { recordPersonalEvent() { invoked = true; throw new Error('must not call'); } } };
    const log = client.create({}, host); await log.ready;
    log.start({ private: 'not recorded' }); log.record('player', { text: 'not recorded' });
    assert.equal(log.status().enabled, false); assert.equal(log.status().pending, 0); assert.equal(invoked, false);
    log.close();
});
