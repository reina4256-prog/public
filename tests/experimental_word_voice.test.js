'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { create, locales, species, voiceId } = require('../experimental_word_voice');
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
