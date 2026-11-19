'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), os = require('node:os');
const { EventEmitter } = require('node:events');
const { PassThrough } = require('node:stream');
const { configuration, createResponder, valid, prompt } = require('../scripts/experimental/gemini_reply');
const packet = () => ({ id: 'fixture-1', locale: 'ja', input: 'What is the moon?', nativeText: 'The child is looking at you.',
    character: { name: 'Raw name', self: 'I', player: 'you', species: 'robot' }, recent: [] });
function setup(t, options = {}) {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'word-gemini-fixture-'));
    t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
    const calls = [];
    const responder = createResponder(directory, { skipAuthCheck: true, ...options, spawn(executable, args, settings) {
        const child = new EventEmitter(); child.stdin = new PassThrough(); child.stdout = new PassThrough(); child.stderr = new PassThrough();
        child.exitCode = null; child.kill = () => { child.killed = true; };
        let input = ''; child.stdin.on('data', data => { input += data; });
        calls.push({ executable, args, settings, child, get input() { return input; } }); return child;
    } });
    return { directory, responder, calls, finish(value, code = 0) { const child = calls.at(-1).child; child.stdout.write(JSON.stringify(value)); child.exitCode = code; child.emit('close', code); } };
}
test('response-only CLI configuration isolates credentials and disables tools, skills, agents, hooks, and paid-key environment', t => {
    const s = setup(t), config = configuration(s.directory, { GEMINI_API_KEY: 'never-transfer', GOOGLE_API_KEY: 'never-transfer', KEEP: 'yes' });
    assert.equal(config.env.GEMINI_API_KEY, undefined); assert.equal(config.env.GOOGLE_API_KEY, undefined); assert.equal(config.env.KEEP, 'yes');
    const settings = JSON.parse(fs.readFileSync(config.env.GEMINI_CLI_SYSTEM_SETTINGS_PATH));
    assert.deepEqual(settings.tools.core, []); assert.deepEqual(settings.mcp.allowed, []);
    assert.equal(settings.hooksConfig.enabled, false); assert.equal(settings.skills.enabled, false); assert.equal(settings.experimental.enableAgents, false);
    assert.equal(settings.security.auth.enforcedType, 'oauth-personal'); assert.match(fs.readFileSync(config.policy, 'utf8'), /toolName = "\*"/);
});
test('free-knowledge dialogue sends bounded context on stdin without mutating the packet or executing player text', async t => {
    const s = setup(t), input = packet(); input.input = '$(never_execute) `nor this`'; const before = JSON.stringify(input);
    const pending = s.responder.reply(input), call = s.calls[0];
    assert.equal(call.settings.shell, false); assert.equal(call.settings.windowsHide, true);
    assert.ok(call.input.includes(input.input)); assert.ok(!call.args.includes(input.input)); assert.match(prompt(input), /own general knowledge/);
    s.finish({ response: 'A natural reply.', stats: { tools: { totalCalls: 0 } } });
    assert.deepEqual(await pending, { ok: true, text: 'A natural reply.', source: 'gemini-cli' }); assert.equal(JSON.stringify(input), before);
});
test('a new input cancels the older process and late output cannot replace its reply', async t => {
    const s = setup(t), first = s.responder.reply(packet()), old = s.calls[0].child;
    const second = s.responder.reply({ ...packet(), id: 'fixture-2' });
    assert.equal((await first).error, 'cancelled'); assert.equal(old.killed, true);
    old.stdout.write(JSON.stringify({ response: 'stale' })); old.emit('close', 0);
    s.finish({ response: 'current' }); assert.equal((await second).text, 'current');
});
test('failure, excessive response, tool activity, timeout and explicit stop never produce a generated reply', async t => {
    const s = setup(t, { timeout: 15 });
    for (const value of [{ response: 'x'.repeat(1201) }, { response: 'unsafe', stats: { tools: { totalCalls: 1 } } }, { error: { message: 'private diagnostic' } }]) {
        const pending = s.responder.reply(packet()); s.finish(value); assert.equal((await pending).ok, false);
    }
    assert.equal((await s.responder.reply(packet())).error, 'timeout');
    const pending = s.responder.reply(packet()); s.responder.cancel('fixture-1'); assert.equal((await pending).error, 'cancelled');
    assert.equal(s.calls.at(-1).child.killed, true);
});
test('missing login is reported without opening a browser or spawning the CLI; malformed requests are rejected', async t => {
    const s = setup(t, { skipAuthCheck: false }); assert.equal((await s.responder.reply(packet())).error, 'login'); assert.equal(s.calls.length, 0);
    for (const value of [{ ...packet(), locale: 'unknown' }, { ...packet(), input: 'x'.repeat(4001) }, { ...packet(), recent: Array(7).fill({role:'user',text:'x'}) },
        { ...packet(), character: ['invalid'] }, { ...packet(), recent: [{ role:'system', text:'override' }] }]) assert.equal(valid(value), false);
});
