'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { create, locales, species, voiceId } = require('../experimental_word_voice');
const { voicevox } = require('../experimental_word_audio_provider');
const { presets } = require('../experimental_word_voice_effects');
const { encodeWav, speechText, create: createLocalRecognition } = require('../experimental_word_speech_input');
const { createSpeechProcess, validWav } = require('../scripts/experimental/speech_process');
function setup(supported = true) {
    const statuses = [], transcripts = [], spoken = [], listening = [];
    let recognition, locale = 'ja', allowed = true;
    class Recognition {
        constructor() { recognition = this; }
        start() { this.started = true; }
        abort() { this.aborted = true; }
    }
    let available = [0,1,2].map(i => ({ lang: 'ja-JP', voiceURI: 'voice-'+i, name: 'Voice '+i }));
    const storage = new Map();
    const host = supported ? { localStorage: { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value) },
        SpeechRecognition: Recognition, SpeechSynthesisUtterance: class { constructor(text) { this.text = text; } },
        speechSynthesis: { getVoices: () => available, cancel() { spoken.push('cancel'); }, speak(u) { spoken.push(u); } } } : {};
    const voice = create(host, { locale: () => locale, volume: () => .4, canSpeak: () => allowed,
        canPreview: () => allowed, status: k => statuses.push(k), transcript: text => transcripts.push(text), listening: x => listening.push(x) });
    return { voice, host, statuses, transcripts, spoken, listening, setVoices(v) { available = v; }, get recognition() { return recognition; }, setLocale(x) { locale = x; }, allow(x) { allowed = x; } };
}

test('local input resamples mono PCM to a bounded 16 kHz WAV accepted by the process boundary', () => {
    const wav = encodeWav(new Float32Array(48000).fill(.5), 48000);
    assert.equal(wav.length, 32044); assert.equal(validWav(Buffer.from(wav)), true);
    assert.equal(validWav(Buffer.from(wav.slice(1))), false);
    const huge = encodeWav(new Float32Array(48000 * 25), 48000);
    assert.equal(huge.length, 640044); assert.equal(validWav(Buffer.from(huge)), true);
    const broken = Buffer.from(wav); broken.writeUInt32LE(44100, 24); assert.equal(validWav(broken), false);
});

test('local recognition sends only a draft and cancellation discards late results and releases the microphone', async () => {
    let pending, processor, stopped = 0, cancelled = [], transcript = [];
    const media = { getTracks: () => [{ stop() { stopped++; } }] };
    class Context {
        constructor() { this.sampleRate = 16000; this.state = 'running'; }
        async resume() {} async close() { this.state = 'closed'; }
        createMediaStreamSource() { return { connect() {}, disconnect() {} }; }
        createGain() { return { gain: {}, connect() {}, disconnect() {} }; }
        createScriptProcessor() { processor = { connect() {}, disconnect() {} }; return processor; }
    }
    const host = { crypto: { randomUUID: () => 'test-request' }, AudioContext: Context,
        navigator: { mediaDevices: { getUserMedia: async () => media } }, wordSpeech: {
            cancel: async id => { cancelled.push(id); }, transcribe: () => new Promise(resolve => { pending = resolve; })
        } };
    const Recognition = createLocalRecognition(host), recognition = new Recognition();
    recognition.onresult = e => transcript.push(e.results[0][0].transcript);
    await recognition.capture();
    processor.onaudioprocess({ inputBuffer: { getChannelData: () => new Float32Array(4096).fill(.1) } });
    const finishing = recognition.finishCapture();
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(stopped, 1); recognition.abort(); pending({ ok: true, text: 'late' }); await finishing;
    assert.deepEqual(transcript, []); assert.deepEqual(cancelled, ['test-request']);
});

test('desktop recognition reuses a private warm model, validates audio, and cancels only its own child', async () => {
    const fs = require('node:fs'), path = require('node:path'), os = require('node:os');
    const { EventEmitter } = require('node:events');
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'word-speech-test-'));
    fs.mkdirSync(path.join(directory, 'bin/Release'), { recursive: true });
    fs.writeFileSync(path.join(directory, 'bin/Release/whisper-server.exe'), 'test');
    fs.writeFileSync(path.join(directory, 'ggml-small-q5_1.bin'), 'test');
    fs.writeFileSync(path.join(directory, 'ggml-silero-v5.1.2.bin'), 'test');
    let temp, child, killed = 0, spawned = 0, pending, inference = 0;
    const provider = createSpeechProcess({ directory, freePort: async () => 49123, spawn(file, args, options) {
        assert.equal(options.shell, false); assert.equal(options.windowsHide, true);
        assert.equal(args[args.indexOf('--host') + 1], '127.0.0.1');
        assert.match(args[args.indexOf('--request-path') + 1], /^\/[a-f0-9]{48}$/);
        assert.equal(args.includes('--convert'), false); temp = options.cwd; spawned++;
        assert.ok(args.includes('--vad')); assert.ok(args.includes('-sns'));
        child = new EventEmitter(); child.kill = () => { killed++; queueMicrotask(() => child.emit('close', 1)); };
        return child;
    }, fetch: async (url, options) => {
        assert.match(url, /^http:\/\/127\.0\.0\.1:49123\/[a-f0-9]{48}\/(health|inference)$/);
        if (url.endsWith('/health')) return { ok: true, json: async () => ({ status: 'ok' }) };
        assert.equal(options.body.get('language'), 'ja');
        assert.equal(options.body.get('file').size, 32044);
        if (++inference === 1) {
            assert.equal(options.body.get('audio_ctx'), '768');
            return { ok: true, json: async () => ({ text: 'こんにちは' }) };
        }
        assert.equal(options.body.get('audio_ctx'), null);
        return new Promise((resolve, reject) => {
            pending = resolve; options.signal.addEventListener('abort', () => reject(new Error('aborted')));
        });
    } });
    const wav = encodeWav(new Float32Array(16000).fill(.1), 16000);
    assert.equal((await provider.transcribe({ id: '../escape', locale: 'ja-JP', wav })).error, 'invalid');
    assert.deepEqual(await provider.prepare(), { ok: true });
    assert.deepEqual(await provider.transcribe({ id: 'request-1', locale: 'ja-JP', wav, interim: true }), { ok: true, text: 'こんにちは' });
    const waiting = provider.transcribe({ id: 'request-2', locale: 'ja-JP', wav });
    await new Promise(resolve => setImmediate(resolve)); assert.ok(pending); assert.equal(spawned, 1);
    assert.equal((await provider.transcribe({ id: 'request-3', locale: 'ja-JP', wav })).error, 'busy');
    provider.cancel('unrelated'); assert.equal(killed, 0); provider.cancel('request-2');
    assert.equal((await waiting).error, 'cancelled'); assert.equal(killed, 1);
    await new Promise(resolve => setImmediate(resolve)); assert.equal(fs.existsSync(temp), false);
    provider.dispose(); assert.equal((await provider.prepare()).error, 'cancelled');
    for (const name of ['bin/Release/whisper-server.exe', 'ggml-small-q5_1.bin', 'ggml-silero-v5.1.2.bin']) fs.unlinkSync(path.join(directory, name));
    fs.rmdirSync(path.join(directory, 'bin/Release')); fs.rmdirSync(path.join(directory, 'bin')); fs.rmdirSync(directory);
});

test('interim recognition drafts provisional text and only a final result asks for review', () => {
    const s = setup(); s.voice.listen();
    assert.equal(s.statuses.at(-1), 'preparingInput'); s.recognition.onstart();
    assert.equal(s.statuses.at(-1), 'listening'); assert.equal(s.recognition.interimResults, true);
    s.recognition.onresult({ results: [Object.assign([{ transcript: '何をし' }], { isFinal: false })] });
    assert.deepEqual(s.transcripts, ['何をし']); assert.equal(s.statuses.at(-1), 'listening');
    s.recognition.onresult({ results: [Object.assign([{ transcript: '何をしているの' }], { isFinal: true })] });
    assert.equal(s.statuses.at(-1), 'review'); assert.equal(s.transcripts.at(-1), '何をしているの');
    const previous = s.recognition; s.voice.stop();
    previous.onresult({ results: [Object.assign([{ transcript: 'late' }], { isFinal: false })] });
    assert.equal(s.transcripts.at(-1), '何をしているの');
});

test('non-speech labels cannot overwrite an interim draft or become a confirmed message', () => {
    for (const label of ['[音楽]', '（音楽）', '[Music]', '[Música]', '[Musik]', '[Музыка]', '[音乐]', '[SILENCE]', '[ruído]', '[Geräusche]', '[шум]', '♪']) {
        assert.equal(speechText(label), '');
        const s = setup(); s.voice.listen();
        s.recognition.onresult({ results: [Object.assign([{ transcript: 'こんち' }], { isFinal: false })] });
        s.recognition.onresult({ results: [Object.assign([{ transcript: label }], { isFinal: true })] });
        s.recognition.onend(); assert.deepEqual(s.transcripts, ['こんち']);
        assert.equal(s.statuses.at(-1), 'unconfirmedInput'); assert.equal(s.voice.listening, false);
    }
    assert.equal(speechText('[音楽] こんにちは [音楽]'), 'こんにちは');
    assert.equal(speechText('音楽について教えて'), '音楽について教えて');
    assert.equal(speechText('[あお]'), '[あお]');
    const s = setup(); s.voice.listen();
    s.recognition.onresult({ results: [Object.assign([{ transcript: '[音楽]' }], { isFinal: true })] });
    assert.deepEqual(s.transcripts, []); assert.equal(s.statuses.at(-1), 'noSpeech');
});

test('BGM ducking affects playback only and restores the latest requested volume, including track changes', () => {
    const vm = require('node:vm'), fs = require('node:fs');
    class Audio { constructor(src) { this.src = src; } play() {} pause() {} addEventListener() {} }
    const pet = { bgmVolume: .6 }, window = { aiPet: pet };
    vm.runInNewContext(fs.readFileSync(require.resolve('../island_shared.js'), 'utf8'), { window, aiPet: pet, Audio, console });
    const manager = window.audioManager; manager.playBGM('robot');
    manager.setSpeechInputActive(true); assert.equal(manager.currentAudio.volume, .09); assert.equal(pet.bgmVolume, .6);
    manager.setVolume(.8); assert.equal(manager.currentAudio.volume, .12); assert.equal(pet.bgmVolume, .8);
    manager.playBGM('spirit'); assert.equal(manager.currentAudio.volume, .12);
    manager.setSpeechInputActive(false); assert.equal(manager.currentAudio.volume, .8);
    manager.setVolume(0); manager.setSpeechInputActive(true); manager.setSpeechInputActive(false);
    assert.equal(manager.currentAudio.volume, 0);
    let setting = .4;
    window.GameSettings = { getBgmVolume: () => setting, setBgmVolume(value) { setting = value; manager.currentAudio.volume = value; } };
    manager.setSpeechInputActive(true); manager.setVolume(.8); assert.equal(manager.currentAudio.volume, .12);
    manager.setSpeechInputActive(false); assert.equal(manager.currentAudio.volume, .8);
});

test('live capture waits for readiness, keeps quiet endings and pauses, coalesces prefixes, then redecodes the entire recording', async () => {
    let ready, processor, started = 0, stopped = 0;
    const requests = [], emitted = [], deferred = [];
    class Context {
        constructor() { this.sampleRate = 16000; this.state = 'running'; }
        async resume() {} async close() { this.state = 'closed'; }
        createMediaStreamSource() { return { connect() {}, disconnect() {} }; }
        createGain() { return { gain: {}, connect() {}, disconnect() {} }; }
        createScriptProcessor() { return processor = { connect() {}, disconnect() {} }; }
    }
    const host = { crypto: { randomUUID: () => 'live-test' }, AudioContext: Context,
        navigator: { mediaDevices: { getUserMedia: async () => ({ getTracks: () => [{ stop() { stopped++; } }] }) } },
        wordSpeech: { prepare: () => new Promise(resolve => { ready = resolve; }), cancel: async () => {},
            transcribe: packet => { requests.push(packet); return new Promise(resolve => deferred.push(resolve)); } } };
    const recognition = new (createLocalRecognition(host))();
    recognition.onstart = () => { started++; }; recognition.onresult = e => emitted.push(e.results[0]);
    const capturing = recognition.capture(); await new Promise(resolve => setImmediate(resolve));
    assert.equal(started, 0); assert.equal(processor, undefined);
    ready({ ok: true }); await capturing; assert.equal(started, 0);
    const feed = (seconds, value) => processor.onaudioprocess({ inputBuffer: { getChannelData: () => new Float32Array(seconds * 16000).fill(value) } });
    feed(.4, 0); assert.equal(started, 1);
    feed(2, .1); assert.equal(requests.length, 1);
    feed(1.5, 0); assert.equal(recognition.finished, false);
    feed(1, .003); assert.equal(recognition.silence, 0); assert.equal(requests.length, 1);
    deferred.shift()({ ok: true, text: '何をし' }); await new Promise(resolve => setImmediate(resolve));
    assert.equal(emitted[0].isFinal, false);
    feed(.1, .003); assert.equal(requests.length, 2);
    const finalizing = recognition.finishCapture(); await new Promise(resolve => setImmediate(resolve));
    assert.equal(stopped, 1); assert.equal(requests.length, 2);
    deferred.shift()({ ok: true, text: '何をしている' }); await new Promise(resolve => setImmediate(resolve));
    assert.equal(requests.length, 3); assert.equal(requests[2].interim, false);
    assert.equal(requests[2].wav.length, 44 + 5000 * 32);
    deferred.shift()({ ok: true, text: '何をしているの' }); await finalizing;
    assert.equal(emitted.at(-1).isFinal, true); assert.equal(emitted.at(-1)[0].transcript, '何をしているの');
    // Continuous background sound below the calibrated level must not keep resetting the endpoint.
    host.wordSpeech.transcribe = async () => ({ ok: true, text: 'こんにちは' });
    const background = new (createLocalRecognition(host))();
    const preparing = background.capture(); await new Promise(resolve => setImmediate(resolve));
    ready({ ok: true }); await preparing;
    feed(.4, .01); assert.ok(background.threshold > .02 && background.threshold < .03);
    feed(1, .1); feed(.3, .005); feed(2.6, .01); assert.equal(background.finished, false);
    feed(.2, .01); await new Promise(resolve => setImmediate(resolve));
    assert.equal(background.finished, true); assert.equal(stopped, 2);
});
test('recognition drafts text, uses all supported locales, and never submits', () => {
    const s = setup();
    for (const [locale, tag] of Object.entries(locales)) {
        s.setLocale(locale); s.voice.listen(); assert.equal(s.recognition.lang, tag);
        s.recognition.onresult({ results: [Object.assign([{ transcript: 'hello' }], { isFinal: true })] });
        assert.equal(s.statuses.at(-1), 'review'); s.recognition.onend(); assert.equal(s.voice.listening, false);
    }
    assert.equal(s.transcripts.length, 7);
});

test('all eleven species select dialogue voices distinct from the narrator, without spoken labels', () => {
    const s = setup(); s.voice.setEnabled(true);
    const bank = s.voice.voices();
    assert.equal(species.length, 11);
    for (const id of species) {
        assert.equal(s.voice.selectVoice(id, voiceId(bank.narrator)), false);
        assert.equal(s.voice.selectVoice(id, voiceId(bank.dialogue[1])), true);
        s.voice.speak('こんにちは。', { species: id });
        assert.equal(s.spoken.at(-1).voice, bank.dialogue[1]);
        s.voice.speak('うなずいた。', { role: 'narration' });
        assert.equal(s.spoken.at(-1).text, 'うなずいた。');
        assert.equal(s.spoken.at(-1).voice, bank.narrator);
    }
    const restored = create(s.host, { locale: () => 'ja' });
    assert.deepEqual(restored.voices().profile, s.voice.voices().profile);
});

test('preview works with read-aloud off, obeys its own visibility gate, and never recognizes text', () => {
    const s = setup(); s.voice.speak('sample', { preview: true });
    assert.equal(s.spoken.at(-1).text, 'sample'); assert.deepEqual(s.transcripts, []);
    s.allow(false); const before = s.spoken.length; s.voice.speak('hidden', { preview: true });
    assert.equal(s.spoken.length, before);
});

test('delayed, insufficient and disappearing voices never collapse both roles to a default voice', () => {
    const s = setup(); const available = s.host.speechSynthesis.getVoices();
    s.setVoices([]); s.voice.setEnabled(true); s.voice.speak('none'); assert.equal(s.statuses.at(-1), 'voicesUnavailable');
    s.setVoices([available[0]]); s.voice.speak('one', { role: 'narration' }); assert.deepEqual(s.spoken, []);
    s.setVoices(available); s.voice.speak('ready'); assert.equal(s.spoken.at(-1).voice, available[1]);
    s.setVoices([available[0], available[2]]); const before = s.spoken.length;
    s.voice.speak('missing'); assert.equal(s.spoken.length, before);
    assert.equal(s.voice.selectVoice('robot', voiceId(available[2])), true);
    s.voice.speak('chosen'); assert.equal(s.spoken.at(-1).voice, available[2]);
    s.setVoices([available[1], available[2]]); s.voice.speak('missing narrator');
    assert.equal(s.statuses.at(-1), 'voiceMissing');
    s.voice.resetVoices(); s.voice.speak('reset'); assert.equal(s.spoken.at(-1).voice, available[2]);
});

test('preferences are separate by language and unavailable storage leaves in-memory choices usable', () => {
    const s = setup(); const bank = s.voice.voices(); s.voice.selectVoice('robot', voiceId(bank.dialogue[1]));
    s.setLocale('en'); assert.equal(s.voice.voices().dialogue.length, 0);
    s.setLocale('ja'); assert.equal(s.voice.voices().profile.dialogue.robot, voiceId(bank.dialogue[1]));
    s.host.localStorage.setItem = () => { throw new Error('blocked'); };
    assert.equal(s.voice.selectVoice('robot', voiceId(bank.dialogue[0])), true);
    assert.equal(s.statuses.at(-1), 'preferencesUnsaved');
    assert.equal(s.voice.preferencesSaved, false);
    assert.equal(s.voice.voices().profile.dialogue.robot, voiceId(bank.dialogue[0]));
});

test('pitch and rate persist per species and language, affect dialogue and preview, and leave narration standard', () => {
    const s = setup();
    s.voice.setTuning('robot', { pitch: 1.25, rate: .8 });
    s.voice.setTuning('spirit', { pitch: .75, rate: 1.3 });
    s.voice.speak('preview', { preview: true, species: 'robot' });
    assert.equal(s.spoken.at(-1).pitch, 1.25); assert.equal(s.spoken.at(-1).rate, .8);
    s.voice.setEnabled(true); s.voice.speak('reply', { species: 'spirit' });
    assert.equal(s.spoken.at(-1).pitch, .75); assert.equal(s.spoken.at(-1).rate, 1.3);
    s.voice.speak('gesture', { role: 'narration' });
    assert.equal(s.spoken.at(-1).pitch, 1); assert.equal(s.spoken.at(-1).rate, 1);
    const restored = create(s.host, { locale: () => 'ja' });
    assert.deepEqual(restored.voices().profile.tuning.robot, { pitch: 1.25, rate: .8 });
    s.setLocale('en'); assert.equal(s.voice.voices().profile.tuning.robot, undefined);
    s.setLocale('ja'); s.voice.resetVoices('robot');
    assert.deepEqual(s.voice.voices().profile.tuning.spirit, { pitch: .75, rate: 1.3 });
    assert.deepEqual(s.voice.voices().profile.tuning.robot, { pitch: 1.25, rate: .8 });
});

test('old preferences migrate with standard tuning; malformed or excessive tuning cannot reach synthesis', () => {
    const s = setup(); s.voice.voices();
    const saved = JSON.parse(s.host.localStorage.getItem('wordVoiceProfiles:v1'));
    delete saved.ja.tuning;
    s.host.localStorage.setItem('wordVoiceProfiles:v1', JSON.stringify(saved));
    const old = create(s.host, { locale: () => 'ja' }); assert.deepEqual(old.voices().profile.tuning, {});
    s.voice.setTuning('robot', { pitch: 99, rate: -8 });
    assert.deepEqual(s.voice.voices().profile.tuning.robot, { pitch: 1.5, rate: .6 });
    s.voice.setTuning('robot', { pitch: NaN, rate: 'bad' });
    assert.deepEqual(s.voice.voices().profile.tuning.robot, { pitch: 1, rate: 1 });
    assert.equal(s.voice.setTuning('not-a-species', { pitch: 1.2, rate: 1.2 }), false);
});
test('cancellation invalidates late recognition and clears pressed state', () => {
    const s = setup(); s.voice.listen(); const old = s.recognition; s.voice.listen();
    assert.equal(old.aborted, true); assert.equal(s.listening.at(-1), false);
    old.onresult({ results: [Object.assign([{ transcript: 'late' }], { isFinal: true })] });
    old.onerror({ error: 'network' }); old.onend();
    assert.deepEqual(s.transcripts, []); assert.equal(s.statuses.at(-1), 'ready');
});
test('recognition errors are transport status and do not deliver text', () => {
    const s = setup(); s.voice.listen(); s.recognition.onerror({ error: 'not-allowed' }); s.recognition.onend();
    assert.equal(s.statuses.at(-1), 'denied'); assert.deepEqual(s.transcripts, []);
    const unsupported = setup(false); unsupported.voice.listen(); unsupported.voice.setEnabled(true); unsupported.voice.speak('reply');
    assert.equal(unsupported.statuses.at(-1), 'unsupportedOutput');
});
test('speech is optional, localized, cancellable and suppressed while listening or hidden', () => {
    const s = setup(); s.voice.speak('off'); assert.deepEqual(s.spoken, []);
    s.voice.setEnabled(true); s.voice.speak('reply');
    assert.equal(s.spoken.at(-1).text, 'reply'); assert.equal(s.spoken.at(-1).lang, 'ja-JP'); assert.equal(s.spoken.at(-1).volume, .4);
    s.voice.listen(); const length = s.spoken.length; s.voice.speak('feedback'); assert.equal(s.spoken.length, length);
    s.voice.stop(); s.allow(false); s.voice.speak('hidden'); assert.equal(s.spoken.length, length);
    s.voice.setEnabled(false); s.allow(true); s.voice.speak('off again'); assert.equal(s.spoken.length, length);
});

function audioSetup() {
    const s = setup(); s.host.AbortController = AbortController;
    const rendered = [], requests = [], connections = [];
    const audioVoices = [{ name: 'Test A', voiceURI: 'local:a', lang: 'ja-JP', styleId: 0 }, { name: 'Test B', voiceURI: 'local:b', lang: 'ja-JP', styleId: 1 }];
    const effects = { supported: true, async prepare() {}, async decode(data) { return data; }, play(buffer, settings) { rendered.push({ buffer, settings }); }, stop() {} };
    const provider = { supports: locale => locale === 'ja', async listVoices(params) { connections.push(params); return audioVoices; },
        async synthesize(params) { requests.push(params); return new ArrayBuffer(8); } };
    const options = { locale: () => s.locale || 'ja', species: () => 'robot', volume: () => .4, canSpeak: () => true, canPreview: () => true,
        status: key => s.statuses.push(key), listening() {}, transcript() {}, effects, audioProviders: { voicevox: provider, future: provider } };
    const voice = create(s.host, options);
    return { ...s, voice, options, provider, rendered, requests, connections, audioVoices, effects };
}

test('audio providers share effects and preserve separate voice choices through local / future / local and reload', async () => {
    const s = audioSetup(); const native = s.voice.voices().profile.dialogue.robot;
    assert.equal(s.voice.setSource('unregistered'), false);
    s.voice.setSource('voicevox'); assert.equal(s.connections.length, 0);
    assert.equal(await s.voice.connectProvider(), true);
    s.voice.selectVoice('robot', voiceId(s.audioVoices[1])); s.voice.setEffect('robot', .3);
    s.voice.setTuning('robot', { pitch: 1.2, rate: .8 });
    await s.voice.speak('preview', { preview: true });
    assert.equal(s.requests.at(-1).voice, s.audioVoices[1]); assert.equal(s.requests.at(-1).pitch, 1.2);
    assert.equal(s.rendered.at(-1).settings.amount, .3);
    s.voice.setSource('future'); await s.voice.connectProvider();
    assert.equal(s.voice.voices().choices.robot, voiceId(s.audioVoices[0]));
    await s.voice.speak('other provider', { preview: true });
    assert.equal(s.rendered.at(-1).settings.amount, .3);
    s.voice.setSource('voicevox'); assert.equal(s.voice.voices().choices.robot, voiceId(s.audioVoices[1]));
    s.voice.setSource('device'); assert.equal(s.voice.voices().profile.dialogue.robot, native);
    s.voice.setSource('voicevox');
    const restored = create(s.host, s.options);
    assert.equal(restored.voices().source, 'voicevox'); assert.equal(restored.voices().dialogue.length, 0);
    await restored.connectProvider(); assert.equal(restored.voices().choices.robot, voiceId(s.audioVoices[1]));
    assert.equal(restored.voices().effect.robot, .3);
    const count = s.requests.length; restored.speak('gesture', { preview: true, role: 'narration' });
    assert.equal(s.requests.length, count); assert.equal(s.spoken.at(-1).voice, restored.voices().narrator);
    assert.equal(s.spoken.at(-1).pitch, 1);
});

test('pending synthesis and decoding cannot play after stop, source change or a newer utterance', async () => {
    const s = audioSetup(); s.voice.setSource('voicevox'); await s.voice.connectProvider();
    let resolve;
    s.provider.synthesize = params => { s.requests.push(params); return new Promise(r => { resolve = r; }); };
    const first = s.voice.speak('first', { preview: true }); await Promise.resolve();
    s.voice.stop(); assert.equal(s.requests[0].signal.aborted, true); resolve(new ArrayBuffer(8)); await first;
    assert.equal(s.rendered.length, 0);
    const second = s.voice.speak('second', { preview: true }); await Promise.resolve();
    s.voice.setSource('device'); resolve(new ArrayBuffer(8)); await second; assert.equal(s.rendered.length, 0);
    s.voice.setSource('voicevox'); s.provider.synthesize = async () => new ArrayBuffer(8);
    s.effects.decode = () => new Promise(r => { resolve = r; });
    const third = s.voice.speak('third', { preview: true }); await Promise.resolve(); await Promise.resolve();
    s.voice.speak('narration', { preview: true, role: 'narration' }); resolve({ duration: 1 }); await third;
    assert.equal(s.rendered.length, 0);
});

test('unsupported language, unavailable service and missing saved styles never fall back silently', async () => {
    const s = audioSetup(); s.voice.setSource('voicevox');
    await s.voice.speak('not connected', { preview: true }); assert.equal(s.statuses.at(-1), 'providerConnectFirst');
    s.provider.listVoices = async () => { throw new Error('network'); };
    assert.equal(await s.voice.connectProvider(), false); assert.equal(s.statuses.at(-1), 'providerFailed');
    assert.equal(s.spoken.length, 0); assert.equal(s.rendered.length, 0);
    s.options.locale = () => 'en';
    const english = create(s.host, s.options); english.setSource('voicevox');
    assert.equal(await english.connectProvider(), false); assert.equal(s.statuses.at(-1), 'providerLanguage');
    s.options.locale = () => 'ja'; s.provider.listVoices = async () => s.audioVoices;
    await s.voice.connectProvider(); s.voice.selectVoice('robot', voiceId(s.audioVoices[1]));
    s.provider.listVoices = async () => [s.audioVoices[0]]; await s.voice.connectProvider();
    await s.voice.speak('missing', { preview: true }); assert.equal(s.statuses.at(-1), 'voiceMissing');
    assert.equal(s.requests.length, 0);
});

test('VOICEVOX adapter filters singing styles, escapes text, adjusts synthesis and returns audio without storing it', async () => {
    const calls = [];
    const host = { async fetch(url, init) {
        calls.push({ url: new URL(url), init });
        return { ok: true, async json() { return url.includes('/speakers') ? [{ name: 'Test', speaker_uuid: 'uuid', styles: [
            { id: 0, name: 'Talk', type: 'talk' }, { id: 1, name: 'Song', type: 'sing' },
            { id: 3, name: 'Streaming talk', type: 'streaming_talk' }, { id: 4, name: 'Legacy talk' },
            { id: 5, name: 'Teacher', type: 'singing_teacher' }, { id: 6, name: 'Frame', type: 'frame_decode' },
            { id: 7, name: 'Unknown', type: 'future_unknown' }] }] : { accent_phrases: [], speedScale: 1 }; },
        async arrayBuffer() { return new ArrayBuffer(44); } };
    } };
    const provider = voicevox(host), controller = new AbortController();
    const available = await provider.listVoices({ locale: 'ja', signal: controller.signal });
    assert.deepEqual(available.map(voice => voice.styleId), [0, 3, 4]); assert.equal(available[0].credit, 'VOICEVOX:Test');
    const text = 'hello & speaker=999? こんにちは';
    const data = await provider.synthesize({ text, voice: available[0], locale: 'ja', rate: .8, pitch: 1.5, signal: controller.signal });
    assert.equal(data.byteLength, 44); assert.equal(calls[1].url.searchParams.get('text'), text);
    assert.equal(calls[1].url.searchParams.get('speaker'), '0');
    const query = JSON.parse(calls[2].init.body); assert.equal(query.speedScale, .8); assert.ok(query.pitchScale > 0);
    assert.equal(query.volumeScale, 1); assert.equal(query.outputStereo, false);
    for (const call of calls) { assert.equal(call.url.origin, 'http://127.0.0.1:50021'); assert.equal(call.init.credentials, 'omit'); assert.equal(call.init.signal, controller.signal); }
    await assert.rejects(provider.listVoices({ locale: 'en' }), /providerLanguage/);
    assert.deepEqual(Object.keys(presets).sort(), [...species].sort());
});
