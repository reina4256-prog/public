'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { create, locales, species, voiceId } = require('../experimental_word_voice');
const { voicevox } = require('../experimental_word_audio_provider');
const { presets } = require('../experimental_word_voice_effects');
const { encodeWav, create: createLocalRecognition } = require('../experimental_word_speech_input');
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

test('desktop recognition validates audio, isolates temporary files, and cancels only its own request', async () => {
    const fs = require('node:fs'), path = require('node:path'), os = require('node:os');
    const { EventEmitter } = require('node:events');
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'word-speech-test-'));
    fs.mkdirSync(path.join(directory, 'bin/Release'), { recursive: true });
    fs.writeFileSync(path.join(directory, 'bin/Release/whisper-cli.exe'), 'test');
    fs.writeFileSync(path.join(directory, 'ggml-base.bin'), 'test');
    let wavFile, output, child, killed = 0;
    const provider = createSpeechProcess({ directory, spawn(file, args, options) {
        assert.equal(options.shell, false); assert.equal(options.windowsHide, true);
        assert.equal(args[args.indexOf('-l') + 1], 'ja');
        wavFile = args[args.indexOf('-f') + 1]; output = args[args.indexOf('-of') + 1];
        child = new EventEmitter(); child.kill = () => { killed++; queueMicrotask(() => child.emit('close', 1)); };
        return child;
    } });
    const wav = encodeWav(new Float32Array(16000).fill(.1), 16000);
    assert.equal((await provider.transcribe({ id: '../escape', locale: 'ja-JP', wav })).error, 'invalid');
    const ready = provider.transcribe({ id: 'request-1', locale: 'ja-JP', wav });
    fs.writeFileSync(output + '.txt', 'こんにちは'); child.emit('close', 0);
    assert.deepEqual(await ready, { ok: true, text: 'こんにちは' }); assert.equal(fs.existsSync(path.dirname(wavFile)), false);
    const pending = provider.transcribe({ id: 'request-2', locale: 'ja-JP', wav });
    provider.cancel('unrelated'); assert.equal(killed, 0); provider.cancel('request-2');
    assert.equal((await pending).error, 'cancelled'); assert.equal(killed, 1);
    assert.equal(fs.existsSync(path.dirname(wavFile)), false);
    for (const name of ['bin/Release/whisper-cli.exe', 'ggml-base.bin']) fs.unlinkSync(path.join(directory, name));
    fs.rmdirSync(path.join(directory, 'bin/Release')); fs.rmdirSync(path.join(directory, 'bin')); fs.rmdirSync(directory);
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
