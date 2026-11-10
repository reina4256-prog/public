(function (root, factory) {
    'use strict';
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.ExperimentalWordAudioProvider = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';
    // Provider contract: listVoices({signal, locale}) -> voice[],
    // synthesize({text, voice, locale, pitch, rate, signal}) -> encoded audio ArrayBuffer.
    // The renderer/effects layer never needs a provider-specific query or API key.
    function voicevox(host) {
        const base = 'http://127.0.0.1:50021';
        const validLocale = locale => locale === 'ja';
        async function request(path, signal, init = {}) {
            const response = await host.fetch(base + path, { ...init, signal, credentials: 'omit', redirect: 'error', cache: 'no-store' });
            if (!response.ok) throw new Error('providerFailed');
            return response;
        }
        return {
            id: 'voicevox', supports: validLocale,
            async listVoices({ signal, locale }) {
                if (!validLocale(locale)) throw new Error('providerLanguage');
                const speakers = await (await request('/speakers', signal)).json();
                if (!Array.isArray(speakers) || speakers.length > 1000) throw new Error('providerFailed');
                const result = [];
                for (const speaker of speakers) {
                    if (typeof speaker.name !== 'string' || typeof speaker.speaker_uuid !== 'string' || !Array.isArray(speaker.styles)) continue;
                    for (const style of speaker.styles) {
                        if (!Number.isSafeInteger(style.id) || style.id < 0 || typeof style.name !== 'string' || (style.type && style.type !== 'talk')) continue;
                        result.push({ name: `${speaker.name} / ${style.name}`, lang: 'ja-JP',
                            voiceURI: `voicevox:${speaker.speaker_uuid}:${style.id}`, styleId: style.id, credit: `VOICEVOX:${speaker.name}` });
                    }
                }
                if (!result.length) throw new Error('providerFailed');
                return result;
            },
            async synthesize({ text, voice, locale, pitch, rate, signal }) {
                if (!validLocale(locale)) throw new Error('providerLanguage');
                if (typeof text !== 'string' || !text.length || text.length > 5000 || !Number.isSafeInteger(voice?.styleId)) throw new Error('providerFailed');
                const query = await (await request('/audio_query?' + new URLSearchParams({ text, speaker: String(voice.styleId) }), signal, { method: 'POST' })).json();
                query.speedScale = typeof rate === 'number' && Number.isFinite(rate) ? Math.max(.6, Math.min(1.4, rate)) : 1;
                query.pitchScale = typeof pitch === 'number' && Number.isFinite(pitch) ? Math.max(-.15, Math.min(.15, Math.log2(Math.max(.5, Math.min(1.5, pitch))) * .15)) : 0;
                query.volumeScale = 1; query.outputStereo = false;
                const response = await request('/synthesis?' + new URLSearchParams({ speaker: String(voice.styleId) }), signal,
                    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(query) });
                const data = await response.arrayBuffer();
                if (!data.byteLength || data.byteLength > 32 * 1024 * 1024) throw new Error('providerFailed');
                return data;
            }
        };
    }
    return { voicevox };
});
