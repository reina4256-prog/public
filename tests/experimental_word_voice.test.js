'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { create, locales } = require('../experimental_word_voice');
function setup(supported = true) {
    const statuses = [], transcripts = [], spoken = [], listening = [];
    let recognition, locale = 'ja', allowed = true;
    class Recognition {
        constructor() { recognition = this; }
        start() { this.started = true; }
        abort() { this.aborted = true; }
    }
    const host = supported ? { SpeechRecognition: Recognition, SpeechSynthesisUtterance: class { constructor(text) { this.text = text; } },
        speechSynthesis: { getVoices: () => [{ lang: 'ja-JP' }], cancel() { spoken.push('cancel'); }, speak(u) { spoken.push(u); } } } : {};
    const voice = create(host, { locale: () => locale, volume: () => .4, canSpeak: () => allowed,
        status: k => statuses.push(k), transcript: text => transcripts.push(text), listening: x => listening.push(x) });
    return { voice, statuses, transcripts, spoken, listening, get recognition() { return recognition; }, setLocale(x) { locale = x; }, allow(x) { allowed = x; } };
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
