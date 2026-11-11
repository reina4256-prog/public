(function (root, factory) {
    'use strict';
    const api = factory(typeof module === 'object' && module.exports ? require('./experimental_word_speech_input') : root.ExperimentalWordSpeechInput);
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.ExperimentalWordVoice = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (speechInput) {
    'use strict';
    const locales = { ja: 'ja-JP', en: 'en-US', 'zh-CN': 'zh-CN', ru: 'ru-RU', 'es-ES': 'es-ES', 'pt-BR': 'pt-BR', de: 'de-DE' };
    const species = ['robot', 'spirit', 'seed', 'ghost', 'stone', 'magician', 'beetle', 'balloon', 'bird', 'machine', 'dragon'];
    const cast = Object.freeze(Object.fromEntries(Object.entries({
        narration: { speaker: '7ffcb7ce-00ec-4bdc-82cd-45a8889e43ff', styleId: 2, pitch: .98, rate: .94, credit: 'VOICEVOX:四国めたん' },
        explore: { speaker: '8eaad775-3119-417e-8cf4-2a10bfd592c8', styleId: 14, pitch: 1.04, rate: 1.05, credit: 'VOICEVOX:冥鳴ひまり' },
        farming: { speaker: 'c30dc15a-0992-4f8d-8bb8-ad3b314e6a6f', styleId: 11, pitch: .98, rate: .98, credit: 'VOICEVOX:玄野武宏' },
        fishing: { speaker: '7d1e7ba7-f957-40e5-a3fc-da49f769ab65', styleId: 53, pitch: .92, rate: 1.08, credit: 'VOICEVOX:麒ヶ島宗麟' },
        cooking: { speaker: '4f51116a-d9ee-4516-925d-21f183e2afad', styleId: 13, pitch: 1.08, rate: 1.12, credit: 'VOICEVOX:青山龍星' },
        smithing: { speaker: '1a17ca16-7ee5-4ea5-b191-2f02ace24d21', styleId: 21, pitch: .90, rate: .88, credit: 'VOICEVOX:剣崎雌雄' },
        building: { speaker: '0acebdee-a4a5-4e12-a695-e19609728e30', styleId: 52, pitch: 1, rate: .96, credit: 'VOICEVOX:雀松朱司' }
    }).map(([key, value]) => [key, Object.freeze(value)])));
    const reserved = voice => Object.values(cast).some(item => voice.voiceURI?.startsWith('voicevox:' + item.speaker + ':'));
    const castVoice = item => ({ name: item.credit, lang: 'ja-JP', voiceURI: `voicevox:${item.speaker}:${item.styleId}`, styleId: item.styleId, credit: item.credit });
    const profileKey = 'wordVoiceProfiles:v1';
    const voiceId = voice => JSON.stringify([voice.voiceURI || voice.name || '', voice.lang]);
    const tuningValue = (value, min, max) => typeof value === 'number' && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : 1;
    // Transport only: recognition never submits a turn or changes the child's knowledge.
    function create(host, options) {
        const Recognition = host.wordSpeech
            ? host.ExperimentalWordSpeechInput?.create(host) : host.SpeechRecognition || host.webkitSpeechRecognition;
        let active = null, generation = 0, enabled = false, utterance = null;
        let lastRecording = null, comparison = null;
        let playbackWait = null;
        let castTimer = null;
        const status = key => options.status(key);
        const providers = options.audioProviders || (host.ExperimentalWordAudioProvider ? { voicevox: host.ExperimentalWordAudioProvider.voicevox(host) } : {});
        const effects = options.effects || host.ExperimentalWordVoiceEffects?.create(host);
        const providerVoices = new Map();
        const audioKey = 'wordAudioSources:v1';
        let audioProfiles = {}, pending = null;
        try {
            const saved = JSON.parse(host.localStorage?.getItem(audioKey) || '{}');
            for (const locale of Object.keys(locales)) {
                const item = saved?.[locale];
                if (!item || typeof item !== 'object') continue;
                const clean = { source: Object.hasOwn(providers, item.source) ? item.source : 'device', voices: {}, effects: {} };
                for (const provider of Object.keys(providers)) {
                    clean.voices[provider] = {};
                    for (const id of species) if (typeof item.voices?.[provider]?.[id] === 'string' && item.voices[provider][id].length < 1000)
                        clean.voices[provider][id] = item.voices[provider][id];
                }
                for (const id of species) if (typeof item.effects?.[id] === 'number' && Number.isFinite(item.effects[id]))
                    clean.effects[id] = Math.max(0, Math.min(1, item.effects[id]));
                audioProfiles[locale] = clean;
            }
        } catch (_) { /* Old and unavailable preferences must not block text play. */ }
        function audioProfile() {
            return audioProfiles[options.locale()] || (audioProfiles[options.locale()] = { source: 'device', voices: {}, effects: {} });
        }
        function persistAudio() {
            try { host.localStorage?.setItem(audioKey, JSON.stringify(audioProfiles)); preferencesSaved = true; }
            catch (_) { preferencesSaved = false; status('preferencesUnsaved'); }
        }
        let profiles = {}, preferencesSaved = true;
        try {
            const saved = JSON.parse(host.localStorage?.getItem(profileKey) || '{}');
            for (const locale of Object.keys(locales)) {
                const item = saved?.[locale];
                if (!item || typeof item !== 'object') continue;
                const profile = { dialogue: {}, tuning: {} };
                if (typeof item.narrator === 'string' && item.narrator.length < 1000) profile.narrator = item.narrator;
                for (const id of species) if (typeof item.dialogue?.[id] === 'string' && item.dialogue[id].length < 1000) profile.dialogue[id] = item.dialogue[id];
                for (const id of species) if (item.tuning?.[id]) profile.tuning[id] = {
                    pitch: tuningValue(item.tuning[id].pitch, .5, 1.5), rate: tuningValue(item.tuning[id].rate, .6, 1.4)
                };
                profiles[locale] = profile;
            }
        } catch (_) { /* Preferences must never block the game. */ }
        function persist() {
            try { host.localStorage?.setItem(profileKey, JSON.stringify(profiles)); preferencesSaved = true; }
            catch (_) { preferencesSaved = false; status('preferencesUnsaved'); }
        }
        function voices() {
            const locale = options.locale(), language = (locales[locale] || locale).split('-')[0].toLowerCase();
            const available = Array.from(new Map((host.speechSynthesis?.getVoices() || [])
                .filter(v => v.lang?.split('-')[0].toLowerCase() === language).map(v => [voiceId(v), v])).values());
            const profile = profiles[locale] || (profiles[locale] = { dialogue: {}, tuning: {} });
            let changed = false;
            // Narration has a dedicated VOICEVOX speaker, independent of the child's source.
            const narrator = locale === 'ja' ? castVoice(cast.narration) : null;
            const dialogue = available;
            species.forEach((id, index) => {
                if (!profile.dialogue[id] && dialogue.length) { profile.dialogue[id] = voiceId(dialogue[index % dialogue.length]); changed = true; }
            });
            if (changed) persist();
            const audio = audioProfile(), source = audio.source;
            const chosenDialogue = source === 'device' ? dialogue : (providerVoices.get(source + ':' + locale) || [])
                .filter(voice => source !== 'voicevox' || !reserved(voice));
            const choices = source === 'device' ? profile.dialogue : audio.voices[source] || (audio.voices[source] = {});
            return { available, narrator, dialogue: chosenDialogue, profile, source, choices, effect: audio.effects,
                providerSupported: source === 'device' || !!(effects?.supported && providers[source]?.supports(locale)) };
        }
        function selectVoice(id, identity) {
            const bank = voices();
            if (!species.includes(id) || !bank.dialogue.some(v => voiceId(v) === identity)) return false;
            stop(); bank.choices[id] = identity;
            if (bank.source === 'device') persist(); else persistAudio();
            return true;
        }
        function setSource(source) {
            if (source !== 'device' && !Object.hasOwn(providers, source)) return false;
            stop(); audioProfile().source = source; persistAudio(); return true;
        }
        function setEffect(id, amount) {
            if (!species.includes(id) || typeof amount !== 'number' || !Number.isFinite(amount)) return false;
            stop(); audioProfile().effects[id] = Math.max(0, Math.min(1, amount)); persistAudio(); return true;
        }
        async function connectProvider() {
            stop();
            const { source, providerSupported } = voices();
            if (source === 'device') return true;
            if (!providerSupported) { status('providerLanguage'); return false; }
            const token = generation, locale = options.locale(), controller = new host.AbortController();
            pending = controller; status('providerConnecting');
            const timer = setTimeout(() => controller.abort(), 15000);
            try {
                const available = await providers[source].listVoices({ signal: controller.signal, locale });
                if (token !== generation || locale !== options.locale()) return false;
                providerVoices.set(source + ':' + locale, available);
                const profile = audioProfile(), choices = profile.voices[source] || (profile.voices[source] = {});
                const dialogue = available.filter(voice => source !== 'voicevox' || !reserved(voice));
                for (const id of species) if (!choices[id] && dialogue.length) choices[id] = voiceId(dialogue[0]);
                persistAudio(); status('providerReady'); return true;
            } catch (_) {
                if (token === generation) { providerVoices.delete(source + ':' + locale); status('providerFailed'); }
                return false;
            } finally { clearTimeout(timer); if (pending === controller) pending = null; }
        }
        function setTuning(id, values) {
            if (!species.includes(id)) return false;
            const bank = voices(); stop();
            bank.profile.tuning[id] = { pitch: tuningValue(values?.pitch, .5, 1.5), rate: tuningValue(values?.rate, .6, 1.4) };
            persist(); return true;
        }
        function resetVoices(id) {
            stop();
            if (species.includes(id)) {
                const bank = voices(); delete bank.profile.dialogue[id];
                if (!bank.narrator) delete bank.profile.narrator;
            } else delete profiles[options.locale()];
            persist(); return voices();
        }
        function stop() {
            generation++;
            clearTimeout(castTimer); castTimer = null;
            if (playbackWait) { clearTimeout(playbackWait.timer); playbackWait.resolve(); playbackWait = null; }
            if (comparison) { void host.wordSpeech.cancel(comparison.id).catch(() => {}); comparison = null; }
            options.comparing?.(false); options.stopPlayback?.();
            pending?.abort(); pending = null; effects?.stop();
            const previous = active; active = null;
            if (previous) { try { previous.abort(); } catch (_) { /* already ended */ } }
            if (utterance) { host.speechSynthesis?.cancel(); utterance = null; }
            options.listening(false);
            status('ready');
        }
        function listen() {
            if (active) {
                if (typeof active.finishCapture === 'function') { void active.finishCapture(); return; }
                if (typeof active.stop === 'function') { active.stop(); return; }
                stop(); return;
            }
            if (comparison) return;
            stop();
            lastRecording = null; options.recording?.(null); options.comparison?.(null);
            if (!Recognition) { status('unsupportedInput'); return; }
            const token = generation;
            try {
                const recognition = new Recognition(); active = recognition;
                recognition.lang = locales[options.locale()] || options.locale();
                recognition.captureProcessing = options.captureProcessing?.() !== false;
                recognition.continuous = false; recognition.interimResults = true; recognition.maxAlternatives = 1;
                let received = false, failed = false;
                recognition.onstart = () => { if (token === generation) status('listening'); };
                recognition.onrecording = recording => {
                    if (token !== generation || recording.wav.length < 46) return;
                    lastRecording = { wav: recording.wav.slice(), locale: recording.locale };
                    options.recording?.(lastRecording.wav.slice(), { locale: recording.locale, limited: recording.limited,
                        captureProcessing: recording.captureProcessing, captureSettings: recording.captureSettings });
                };
                recognition.onprocessing = () => { if (token === generation) status('processingInput'); };
                recognition.onresult = event => {
                    if (token !== generation || active !== recognition) return;
                    const results = Array.from(event.results);
                    const raw = results.map(result => result[0]?.transcript || '').join(' ').trim();
                    const text = speechInput.speechText(raw);
                    const final = results.every(result => result.isFinal);
                    if (!text && raw && final) { failed = true; status(received ? 'unconfirmedInput' : 'noSpeech'); return; }
                    if (text) { received = true; if (options.transcript(text, { final }) !== false && final) status('review'); }
                };
                recognition.onerror = event => {
                    if (token !== generation) return;
                    failed = true;
                    status(['not-allowed', 'service-not-allowed'].includes(event.error) ? 'denied'
                        : event.error === 'no-speech' ? received ? 'unconfirmedInput' : 'noSpeech'
                        : event.error === 'recognizer-missing' ? 'missingRecognizer'
                        : event.error === 'network' ? 'networkInput' : 'failedInput');
                };
                recognition.onend = () => {
                    if (token !== generation) return;
                    active = null;
                    if (!received && !failed) status('noSpeech');
                    options.listening(false);
                };
                options.listening(true); status('preparingInput'); recognition.start();
            } catch (_) { active = null; options.listening(false); status('failedInput'); }
        }
        function clearRecording() {
            stop(); lastRecording = null; options.recording?.(null); options.comparison?.(null);
        }
        async function compareRecording(profile) {
            if (active || comparison || !lastRecording || !host.wordSpeech
                || !['standard', 'whole', 'medium'].includes(profile)) return;
            stop(); options.comparison?.(null);
            const token = generation, recording = lastRecording;
            const job = { id: host.crypto.randomUUID() }; comparison = job;
            options.comparing?.(true); options.listening(true); status('comparingInput');
            try {
                const result = await host.wordSpeech.transcribe({ id: job.id, locale: recording.locale,
                    wav: recording.wav.slice(), profile });
                if (token !== generation || comparison !== job) return;
                if (result.ok && speechInput.speechText(result.text)) {
                    options.comparison?.({ text: speechInput.speechText(result.text), profile, locale: recording.locale });
                    status('comparisonReady');
                } else status(result.error === 'missing' ? 'missingComparison'
                    : result.error === 'noSpeech' ? 'comparisonNoSpeech' : 'failedInput');
            } catch (_) { if (token === generation) status('failedInput'); }
            finally {
                if (comparison === job) { comparison = null; options.comparing?.(false); options.listening(false); }
            }
        }
        function speak(text, settings = {}) {
            const preview = settings.preview === true;
            if ((!preview && (!enabled || !options.canSpeak())) || (preview && !options.canPreview?.()) || active || comparison || !text) return;
            if (settings.role === 'narration' || settings.role === 'master') return speakScene([{ text, ...settings }], settings);
            const bank = voices();
            if (bank.source !== 'device') return speakAudio(text, settings, bank);
            if (!host.speechSynthesis || !host.SpeechSynthesisUtterance) { status('unsupportedOutput'); return; }
            const voice = bank.dialogue.find(v => voiceId(v) === bank.profile.dialogue[settings.species || options.species?.() || 'robot']);
            if (!voice) { status(bank.available.length ? 'voiceMissing' : 'voicesUnavailable'); return; }
            // A new narration also cancels pending generated speech and all effect tails.
            stop();
            const current = new host.SpeechSynthesisUtterance(text);
            current.lang = locales[options.locale()] || options.locale();
            current.volume = options.volume();
            current.voice = voice;
            const tuning = bank.profile.tuning[settings.species || options.species?.() || 'robot'];
            current.pitch = tuning?.pitch ?? 1; current.rate = tuning?.rate ?? 1;
            current.onerror = event => {
                if (utterance === current && !['canceled', 'interrupted'].includes(event.error)) status('failedOutput');
            };
            current.onend = () => { if (utterance === current) utterance = null; };
            utterance = current;
            try { host.speechSynthesis.speak(current); } catch (_) { utterance = null; status('failedOutput'); }
        }
        async function speakScene(lines, settings = {}) {
            const preview = settings.preview === true;
            if ((preview ? !options.canPreview?.() : !enabled || !options.canSpeak()) || active || comparison) return;
            const locale = options.locale(), provider = providers.voicevox;
            if (!effects?.supported || !provider?.supports(locale)) { status('castLanguage'); return; }
            stop(); const token = generation, controller = new host.AbortController(); pending = controller;
            const current = () => token === generation && !controller.signal.aborted && locale === options.locale()
                && !active && !comparison && (preview ? options.canPreview?.() : enabled && options.canSpeak());
            const timer = setTimeout(() => {
                if (token !== generation) return;
                controller.abort(); effects.stop();
                if (playbackWait) { clearTimeout(playbackWait.timer); playbackWait.resolve(); playbackWait = null; }
                status('providerFailed');
            }, 120000);
            castTimer = timer;
            try {
                await effects.prepare(); if (!current()) return;
                let available = providerVoices.get('voicevox:' + locale);
                if (!available) {
                    available = await provider.listVoices({ locale, signal: controller.signal });
                    if (!current()) return;
                    providerVoices.set('voicevox:' + locale, available);
                }
                for (const line of lines.slice(0, 2)) {
                    if (!current() || !line.text) return;
                    const preset = line.role === 'narration' ? cast.narration : line.role === 'master' ? cast[line.master] : null;
                    const chosen = preset && available.find(voice => voice.voiceURI === castVoice(preset).voiceURI);
                    if (!chosen) { status('voiceMissing'); return; }
                    status('providerGenerating');
                    const data = await provider.synthesize({ text: line.text, voice: chosen, locale, pitch: preset.pitch, rate: preset.rate, signal: controller.signal });
                    if (!current()) return;
                    const buffer = await effects.decode(data); if (!current()) return;
                    const playing = effects.play(buffer, { species: 'robot', amount: 0, volume: options.volume() });
                    await new Promise(resolve => {
                        playbackWait = { resolve, timer: setTimeout(() => { playbackWait = null; resolve(); }, (playing?.duration ?? buffer.duration ?? 0) * 1000) };
                    });
                }
                if (current()) status('ready');
            } catch (_) { if (token === generation) status('providerFailed'); }
            finally { clearTimeout(timer); if (castTimer === timer) castTimer = null; if (pending === controller) pending = null; }
        }
        async function speakAudio(text, settings, bank) {
            if (!bank.providerSupported) { status('providerLanguage'); return; }
            const id = settings.species || options.species?.() || 'robot';
            const chosen = bank.dialogue.find(v => voiceId(v) === bank.choices[id]);
            if (!chosen) { status(bank.dialogue.length ? 'voiceMissing' : 'providerConnectFirst'); return; }
            stop(); const token = generation, locale = options.locale(), controller = new host.AbortController(); pending = controller;
            const tuning = bank.profile.tuning[id] || { pitch: 1, rate: 1 };
            const timer = setTimeout(() => controller.abort(), 120000);
            status('providerGenerating');
            try {
                // Resume inside the user gesture before awaiting synthesis.
                await effects.prepare();
                if (token !== generation) return;
                const data = await providers[bank.source].synthesize({ text, voice: chosen, locale, ...tuning, signal: controller.signal });
                if (token !== generation || locale !== options.locale() || controller.signal.aborted) return;
                const buffer = await effects.decode(data);
                if (token !== generation || locale !== options.locale() || controller.signal.aborted) return;
                if ((settings.preview ? !options.canPreview?.() : !enabled || !options.canSpeak()) || active) return;
                effects.play(buffer, { species: id, amount: bank.effect[id] ?? .65, volume: options.volume() });
                status('ready');
            } catch (_) { if (token === generation) status('providerFailed'); }
            finally { clearTimeout(timer); if (pending === controller) pending = null; }
        }
        return { listen, speak, speakScene, stop, clearRecording, compareRecording, voices, selectVoice, setTuning, resetVoices, setSource, setEffect, connectProvider,
            setEnabled(value) { enabled = !!value; if (!enabled) this.stop(); else void effects?.prepare().catch(() => status('failedOutput')); },
            supportedInput: !!Recognition, supportedOutput: !!((host.speechSynthesis && host.SpeechSynthesisUtterance) || effects?.supported),
            get preferencesSaved() { return preferencesSaved; },
            get listening() { return !!active || !!comparison; } };
    }
    return { create, locales, species, voiceId, cast, reserved };
});
