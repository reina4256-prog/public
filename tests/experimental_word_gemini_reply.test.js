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

test('timing observes fragmented NDJSON without returning raw content or changing the prompt', async t => {
    const s = setup(t, { measure: true }), input = packet(), pending = s.responder.reply(input), call = s.calls[0];
    call.child.emit('spawn');
    const events = [ { event: 'init', secret: 'private-auth' },
        { event: 'step_update', step_update: { step_type: 'thinking', text_delta: 'private-thought' } },
        { event: 'step_update', step_update: { step_type: 'agent_response', text_delta: 'hello' } },
        { event: 'step_update', step_update: { step_type: 'agent_response', state: 'DONE' } } ];
    const stream = events.map(x => JSON.stringify(x)).join('\n') + '\n';
    for (let i = 0; i < stream.length; i += 7) call.child.stdout.write(stream.slice(i, i + 7));
    assert.equal(JSON.parse(call.input).message.content, prompt(input));
    s.finish({ response: 'hello' }); const result = await pending, m = result.timing.marks;
    assert.equal(result.text, 'hello');
    for (const key of ['spawnRequested','inputQueued','spawned','initialized','firstText','replyDone','result','closed','returned']) assert.ok(Number.isFinite(m[key]), key);
    for (const [a,b] of [['initialized','firstText'],['firstText','replyDone'],['replyDone','result'],['result','closed'],['closed','returned']]) assert.ok(m[a] <= m[b]);
    assert.ok(!JSON.stringify(result.timing).includes('private'));
});

test('missing stream milestones stay absent and cancellation timing belongs to its own request', async t => {
    const s = setup(t, { measure: true });
    const first = s.responder.reply(packet()), old = s.calls[0].child;
    const second = s.responder.reply({ ...packet(), id: 'fixture-2' });
    const cancelled = await first;
    assert.equal(cancelled.error, 'cancelled'); assert.ok(Number.isFinite(cancelled.timing.marks.returned));
    old.stdout.write(JSON.stringify({event:'init'})+'\n');
    s.finish({ response: 'second' }); const result = await second;
    assert.equal(result.text, 'second');
    assert.equal(result.timing.marks.initialized, undefined); assert.equal(result.timing.marks.firstText, undefined);
    assert.equal(cancelled.timing.marks.initialized, undefined);
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

test('player memory survives save and restart as original notes without teaching the action engine', t => {
    const memory = require('../experimental_word_reply_memory');
    const catalog = require('../experimental_word_learning_catalog.json');
    const core = require('../experimental_word_learning_core'), worldApi = require('../experimental_word_learning_world');
    const state = core.create({ foundation: false, life: false, speech: 'gesture' }, catalog), world = worldApi.create();
    const result = core.receive(state, 'ここはテラリウムです。', catalog, { locale: 'ja', speaker: 'player', body: world });
    const before = structuredClone(state), body = structuredClone(world);
    assert.equal(memory.remember(state, result.input), true);
    assert.equal(memory.remember(state, result.input), false);
    assert.equal(memory.remember(state, { ...result.input, id: 'input:999', speaker: 'master:farming' }), false);
    const { replyMemory, ...unchanged } = state;
    assert.deepEqual(unchanged, before); assert.deepEqual(world, body);
    assert.equal(memory.notes(state)[0].literal, result.input.raw);
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'word-memory-save-'));
    t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
    const { createStore, valid: validSave } = require('../scripts/experimental/storage');
    const save = { version: 1, appearance: 'robot', state, world };
    assert.equal(createStore(directory).save(save).ok, true);
    const loaded = createStore(directory).load(); assert.equal(loaded.ok, true);
    assert.deepEqual(loaded.value.state.replyMemory, replyMemory);
    assert.equal(memory.context(loaded.value.state, 'ここはどこ？')[0].text, result.input.raw);
    assert.equal(memory.context(state, 'ここ', result.input.id).length, 0);
    const corrupt = structuredClone(save); corrupt.state.replyMemory.entries.push(corrupt.state.replyMemory.entries[0]);
    assert.equal(validSave(corrupt), false);
    assert.ok(validSave({ ...save, state: before }));
});

test('memory retrieval finds old teaching among recent talk, is bounded, and never rewrites stored originals', () => {
    const memory = require('../experimental_word_reply_memory'), state = {};
    for (let i = 1; i <= 40; i++) memory.remember(state, { id: 'input:' + i, raw: i === 1 ? 'テラリウムという場所にいるんだよ' : '別の話' + i + 'a'.repeat(2000),
        locale: 'ja', at: i, speaker: 'player' });
    const before = JSON.stringify(state), selected = memory.context(state, 'テラリウムについて覚えている？');
    assert.ok(selected.some(e => e.inputId === 'input:1'));
    assert.ok(selected.some(e => e.inputId === 'input:40'));
    assert.ok(selected.length <= 12); assert.ok(selected.every(e => e.text.length <= 1200));
    assert.ok(selected.reduce((n,e) => n+e.text.length,0) <= 8000);
    assert.equal(JSON.stringify(state), before); assert.equal(memory.notes(state).length, 40);
    assert.equal(memory.valid({ version: 99, entries: [] }), false);
});

test('reply context distinguishes heard memories from knowledge, forbids invented surroundings, and rejects extra memory data', () => {
    const input = packet(); input.memories = [{ inputId: 'input:1', speaker: 'player', locale: 'ja', at: 1, text: 'ここは庭です。', truncated: false }];
    assert.equal(valid(input), true);
    const text = prompt(input), sent = JSON.parse(text.slice(text.indexOf('\n') + 1));
    assert.equal(sent.playerMemories[0].text, input.memories[0].text);
    assert.match(text, /never invent a location/); assert.match(text, /not verified facts/);
    assert.match(text, /Output no inner voice/); assert.match(text, /Never mention a backend/);
    assert.match(text, /Ask for clarification only when the missing detail is essential for the present reply/);
    assert.match(text, /A reply may end naturally without a question/);
    assert.match(text, /avoid repeating the form of address every turn/);
    assert.match(text, /unless the native outcome explicitly confirms that action has started/);
    for (const memories of [[{ ...input.memories[0], speaker: 'assistant' }], [{ ...input.memories[0], secret: 'not allowed' }],
        [{ ...input.memories[0], text: 'x'.repeat(1201) }], Array(13).fill(input.memories[0]), Array(12).fill({ ...input.memories[0], text: 'x'.repeat(1200) })]) {
        assert.equal(valid({ ...input, memories }), false);
    }
});

test('self awareness projects only current body and session experiences, without world identities or restored history', () => {
    const api = require('../experimental_word_reply_awareness'), session = api.create(10);
    const world = { mode: 'rest', fatigue: .3, hunger: .7, elapsed: 15, destination: 'secret-place',
        experiences: [{ kind: 'rest', end: 5 }], history: [{ target: 'secret-person' }] };
    const before = JSON.stringify(world);
    assert.deepEqual(session.context(world), { activity: 'rest', fatigue: .3, hunger: .7, recent: [] });
    session.observe({ kind: 'experience', activity: 'rest', target: 'secret-place', before: { fatigue: .8, hunger: .6 }, after: { fatigue: .3, hunger: .7 } }, 12);
    const value = session.context(world); assert.ok(api.valid(value));
    assert.equal(value.recent[0].fatigueChange, -.5); assert.equal(value.recent[0].secondsAgo, 3);
    assert.equal(JSON.stringify(world), before); assert.ok(!JSON.stringify(value).includes('secret'));
    world.elapsed = 200; assert.deepEqual(session.context(world).recent, []);
    assert.deepEqual(api.create(200).context(world).recent, []);
    assert.equal(api.valid({ ...value, destination: 'hidden' }), false);
    assert.equal(api.valid({ ...value, fatigue: Infinity }), false);
    assert.equal(api.valid({ ...value, recent: [{ ...value.recent[0], target: 'hidden' }] }), false);
    const input = { ...packet(), selfState: value, inviteQuestion: true };
    assert.ok(valid(input)); assert.equal(valid({ ...input, selfState: { ...value, location: 'hidden' } }), false);
    const text = prompt(input), sent = JSON.parse(text.slice(text.indexOf('\n') + 1));
    assert.deepEqual(sent.selfState, value); assert.match(text, /negative fatigueChange means fatigue eased/);
    assert.match(text, /one warm, relevant question about the player/);
});

test('initiative requires a recent experience, quiet cooldown and player re-engagement before another attempt', () => {
    const session = require('../experimental_word_reply_awareness').create(0);
    const event = { kind: 'experience', activity: 'eat', before: { fatigue: .4, hunger: .8 }, after: { fatigue: .42, hunger: .25 }, taste: { quality: 'sweet' } };
    assert.equal(session.take(100, false), false);
    session.observe(event, 85); assert.equal(session.take(89, false), false);
    assert.equal(session.take(95, true), false); assert.equal(session.take(95, false), true);
    session.observe(event, 185); assert.equal(session.take(200, false), false);
    session.playerSpoke(200); assert.equal(session.take(300, false), false);
    session.observe(event, 300); assert.equal(session.take(308, false), true);
    session.playerSpoke(400); session.observe(event, 401); assert.equal(session.take(600, false), false);
    const input = { ...packet(), kind: 'initiative', input: '', inviteQuestion: true,
        selfState: { activity: 'other', fatigue: .2, hunger: .4, recent: [{ activity: 'eat', secondsAgo: 8, fatigueChange: .02, hungerChange: -.55, taste: 'sweet' }] } };
    assert.equal(valid({ ...input, selfState: undefined }), false);
    assert.ok(valid(input)); const text = prompt(input);
    assert.equal(JSON.parse(text.slice(text.indexOf('\n') + 1)).playerInput, null);
    assert.match(text, /no new player utterance/); assert.equal(valid({ ...input, kind: 'unknown' }), false);
});
