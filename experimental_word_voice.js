(function (root, factory) {
    'use strict';
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.ExperimentalWordVoice = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';
    const locales = { ja: 'ja-JP', en: 'en-US', 'zh-CN': 'zh-CN', ru: 'ru-RU', 'es-ES': 'es-ES', 'pt-BR': 'pt-BR', de: 'de-DE' };
    const species = ['robot', 'spirit', 'seed', 'ghost', 'stone', 'magician', 'beetle', 'balloon', 'bird', 'machine', 'dragon'];
    const profileKey = 'wordVoiceProfiles:v1';
    const voiceId = voice => JSON.stringify([voice.voiceURI || voice.name || '', voice.lang]);
    const tuningValue = (value, min, max) => typeof value === 'number' && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : 1;
    // Transport only: recognition never submits a turn or changes the child's knowledge.
    function create(host, options) {
        const Recognition = host.wordSpeech
            ? host.ExperimentalWordSpeechInput?.create(host) : host.SpeechRecognition || host.webkitSpeechRecognition;
        let active = null, generation = 0, enabled = false, utterance = null;
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
            if (!profile.narrator && available.length) { profile.narrator = voiceId(available[0]); changed = true; }
            const narrator = available.find(v => voiceId(v) === profile.narrator);
            // A missing saved narrator is not silently replaced by a dialogue voice.
            const dialogue = narrator ? available.filter(v => voiceId(v) !== profile.narrator) : [];
            species.forEach((id, index) => {
                if (!profile.dialogue[id] && dialogue.length) { profile.dialogue[id] = voiceId(dialogue[index % dialogue.length]); changed = true; }
            });
            if (changed) persist();
            const audio = audioProfile(), source = audio.source;
            const chosenDialogue = source === 'device' ? dialogue : providerVoices.get(source + ':' + locale) || [];
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
                for (const id of species) if (!choices[id] && available.length) choices[id] = voiceId(available[0]);
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
            pending?.abort(); pending = null; effects?.stop();
            const previous = active; active = null;
            if (previous) { try { previous.abort(); } catch (_) { /* already ended */ } }
            if (utterance) { host.speechSynthesis?.cancel(); utterance = null; }
            options.listening(false);
            status('ready');
        }
        function listen() {
            if (active) { stop(); return; }
            stop();
            if (!Recognition) { status('unsupportedInput'); return; }
            const token = generation;
            try {
                const recognition = new Recognition(); active = recognition;
                recognition.lang = locales[options.locale()] || options.locale();
                recognition.continuous = false; recognition.interimResults = false; recognition.maxAlternatives = 1;
                let received = false, failed = false;
                recognition.onprocessing = () => { if (token === generation) status('processingInput'); };
                recognition.onresult = event => {
                    if (token !== generation || active !== recognition) return;
                    const text = Array.from(event.results).filter(result => result.isFinal).map(result => result[0]?.transcript || '').join(' ').trim();
                    if (text) { received = true; if (options.transcript(text) !== false) status('review'); }
                };
                recognition.onerror = event => {
                    if (token !== generation) return;
                    failed = true;
                    status(['not-allowed', 'service-not-allowed'].includes(event.error) ? 'denied'
                        : event.error === 'no-speech' ? 'noSpeech'
                        : event.error === 'recognizer-missing' ? 'missingRecognizer'
                        : event.error === 'network' ? 'networkInput' : 'failedInput');
                };
                recognition.onend = () => {
                    if (token !== generation) return;
                    active = null;
                    if (!received && !failed) status('noSpeech');
                    options.listening(false);
                };
                recognition.start(); options.listening(true); status('listening');
            } catch (_) { active = null; options.listening(false); status('failedInput'); }
        }
        function speak(text, settings = {}) {
            const preview = settings.preview === true;
            if ((!preview && (!enabled || !options.canSpeak())) || (preview && !options.canPreview?.()) || active || !text) return;
            const bank = voices();
            if (settings.role !== 'narration' && bank.source !== 'device') return speakAudio(text, settings, bank);
            if (!host.speechSynthesis || !host.SpeechSynthesisUtterance) { status('unsupportedOutput'); return; }
            const voice = settings.role === 'narration' ? bank.narrator
                : bank.dialogue.find(v => voiceId(v) === bank.profile.dialogue[settings.species || options.species?.() || 'robot']);
            // Both roles require a separate real voice. Never fall back to the browser default.
            if (!bank.narrator || (bank.source === 'device' && !bank.dialogue.length) || !voice) { status(bank.available.length < 2 ? 'voicesUnavailable' : 'voiceMissing'); return; }
            // A new narration also cancels pending generated speech and all effect tails.
            pending?.abort(); pending = null; effects?.stop(); generation++;
            if (utterance) host.speechSynthesis.cancel();
            const current = new host.SpeechSynthesisUtterance(text);
            current.lang = locales[options.locale()] || options.locale();
            current.volume = options.volume();
            current.voice = voice;
            const tuning = settings.role === 'narration' ? null : bank.profile.tuning[settings.species || options.species?.() || 'robot'];
            current.pitch = tuning?.pitch ?? 1; current.rate = tuning?.rate ?? 1;
            current.onerror = event => {
                if (utterance === current && !['canceled', 'interrupted'].includes(event.error)) status('failedOutput');
            };
            current.onend = () => { if (utterance === current) utterance = null; };
            utterance = current;
            try { host.speechSynthesis.speak(current); } catch (_) { utterance = null; status('failedOutput'); }
        }
        async function speakAudio(text, settings, bank) {
            if (!bank.providerSupported) { status('providerLanguage'); return; }
            const id = settings.species || options.species?.() || 'robot';
            const chosen = bank.dialogue.find(v => voiceId(v) === bank.choices[id]);
            if (!bank.narrator || !chosen) { status(bank.dialogue.length ? 'voiceMissing' : 'providerConnectFirst'); return; }
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
        return { listen, speak, stop, voices, selectVoice, setTuning, resetVoices, setSource, setEffect, connectProvider,
            setEnabled(value) { enabled = !!value; if (!enabled) this.stop(); },
            supportedInput: !!Recognition, supportedOutput: !!(host.speechSynthesis && host.SpeechSynthesisUtterance),
            get preferencesSaved() { return preferencesSaved; },
            get listening() { return !!active; } };
    }
    return { create, locales, species, voiceId };
});
