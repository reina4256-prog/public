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
    const responder = createResponder(directory, { skipAuthCheck: true, entry: __filename, ...options, spawn(executable, args, settings) {
        const child = new EventEmitter(); child.stdin = new PassThrough(); child.stdout = new PassThrough(); child.stderr = new PassThrough();
        child.exitCode = null; child.kill = () => { child.killed = true; };
        let input = ''; child.stdin.on('data', data => { input += data; });
        calls.push({ executable, args, settings, child, get input() { return input; } }); return child;
    } });
    return { directory, responder, calls, finish(value, code = 0) { const child = calls.at(-1).child; child.stdout.write(JSON.stringify({ event: 'result', result: { status: 'SUCCESS', ...value } })+'\n'); child.exitCode = code; child.emit('close', code); } };
}
test('response-only CLI uses a dedicated home and session overrides that prohibit extra credits, paid providers, and tool actions', t => {
    const s = setup(t), config = configuration(s.directory, { GEMINI_API_KEY: 'never-transfer', GOOGLE_API_KEY: 'never-transfer', AGY_ADC_AUTH: 'true', GOOGLE_CLOUD_PROJECT: 'never-transfer', KEEP: 'yes' });
    assert.equal(config.env.GEMINI_API_KEY, undefined); assert.equal(config.env.GOOGLE_API_KEY, undefined); assert.equal(config.env.KEEP, 'yes');
    assert.equal(config.env.AGY_ADC_AUTH, undefined); assert.equal(config.env.GOOGLE_CLOUD_PROJECT, undefined);
    assert.equal(config.env.USERPROFILE, config.home); assert.equal(config.env.HOME, config.home); assert.equal(config.env.AGY_CLI_DISABLE_AUTO_UPDATE,'true');
    const settings = JSON.parse(fs.readFileSync(config.session));
    assert.equal(settings.useG1Credits, false); assert.equal(settings.modelProvider, ''); assert.deepEqual(settings.gcp,{});
    assert.equal(settings.toolPermission, 'strict'); assert.equal(settings.disableSlashCommands, true);
    for(const action of ['command','read_file','write_file','read_url','execute_url','mcp'])assert.ok(settings.permissions.deny.includes(action+'(*)'));
    assert.deepEqual(settings.permissions.allow,[]);
});
test('free-knowledge dialogue sends bounded context on stdin without mutating the packet or executing player text', async t => {
    const s = setup(t), input = packet(); input.input = '$(never_execute) `nor this`'; const before = JSON.stringify(input);
    const pending = s.responder.reply(input), call = s.calls[0];
    assert.equal(call.settings.shell, false); assert.equal(call.settings.windowsHide, true);
    assert.ok(call.input.includes(input.input)); assert.ok(!call.args.includes(input.input)); assert.match(prompt(input), /own general knowledge/);
    assert.equal(call.args[call.args.indexOf('--settings')+1],s.responder.config.session);
    assert.equal(call.args[call.args.indexOf('--input-format')+1],'stream-json');
    const sent=JSON.parse(call.input);assert.equal(sent.event,'user');assert.ok(sent.message.content.includes(input.input));
    s.finish({ response: 'A natural reply.', stats: { tools: { totalCalls: 0 } } });
    assert.deepEqual(await pending, { ok: true, text: 'A natural reply.', source: 'antigravity-cli' }); assert.equal(JSON.stringify(input), before);
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
test('a modified credit setting is reset before every request; quota, authentication and unsupported clients remain distinct', async t => {
    const s=setup(t);
    for(const [message,error] of [['RESOURCE_EXHAUSTED: quota reached','quota'],['authentication required','login'],['This client is no longer supported','unsupported']]){
        fs.writeFileSync(s.responder.config.session,JSON.stringify({useG1Credits:true,modelProvider:'gemini'}));
        const pending=s.responder.reply(packet());const settings=JSON.parse(fs.readFileSync(s.responder.config.session));
        assert.equal(settings.useG1Credits,false);assert.equal(settings.modelProvider,'');
        s.finish({status:'ERROR',error:message},1);assert.deepEqual(await pending,{ok:false,error});
    }
    const pending=s.responder.reply(packet());s.calls.at(-1).child.stderr.write('RESOURCE_EXHAUSTED quota');s.finish({status:'ERROR',error:'Request failed'},1);
    assert.equal((await pending).error,'quota');
});
test('a settings write failure, tool step, duplicate result or incomplete result cannot produce a generated reply', async t=>{
    const s=setup(t);
    fs.unlinkSync(s.responder.config.session);fs.mkdirSync(s.responder.config.session);
    assert.equal((await s.responder.reply(packet())).error,'settings');assert.equal(s.calls.length,0);fs.rmdirSync(s.responder.config.session);
    for(const extra of [{event:'step_update',step_update:{step_type:'tool'}},{event:'result',result:{status:'SUCCESS',response:'duplicate'}}]){
        const pending=s.responder.reply(packet());s.calls.at(-1).child.stdout.write(JSON.stringify(extra)+'\n');s.finish({response:'unsafe'});assert.equal((await pending).ok,false);
    }
    const pending=s.responder.reply(packet());s.finish({status:'RUNNING',response:'unfinished'});assert.equal((await pending).ok,false);
});
test('authentication prompts stop the process immediately without exposing a URL or waiting for interactive sign-in',async t=>{
    const s=setup(t),pending=s.responder.reply(packet()),child=s.calls.at(-1).child;
    child.stderr.write('Authentication required. Please visit the URL to log in: private-auth-url');
    assert.deepEqual(await pending,{ok:false,error:'login'});assert.equal(child.killed,true);
});
