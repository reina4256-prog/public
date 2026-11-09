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
        const Recognition = host.SpeechRecognition || host.webkitSpeechRecognition;
        let active = null, generation = 0, enabled = false, utterance = null;
        const status = key => options.status(key);
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
            return { available, narrator, dialogue, profile };
        }
        function selectVoice(id, identity) {
            const bank = voices();
            if (!species.includes(id) || !bank.dialogue.some(v => voiceId(v) === identity)) return false;
            stop(); bank.profile.dialogue[id] = identity; persist(); return true;
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
                recognition.onresult = event => {
                    if (token !== generation || active !== recognition) return;
                    const text = Array.from(event.results).filter(result => result.isFinal).map(result => result[0]?.transcript || '').join(' ').trim();
                    if (text) { received = true; if (options.transcript(text) !== false) status('review'); }
                };
                recognition.onerror = event => {
                    if (token !== generation) return;
                    failed = true;
                    status(['not-allowed', 'service-not-allowed'].includes(event.error) ? 'denied'
                        : event.error === 'no-speech' ? 'noSpeech' : 'failedInput');
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
            if (!host.speechSynthesis || !host.SpeechSynthesisUtterance) { status('unsupportedOutput'); return; }
            const bank = voices();
            const voice = settings.role === 'narration' ? bank.narrator
                : bank.dialogue.find(v => voiceId(v) === bank.profile.dialogue[settings.species || options.species?.() || 'robot']);
            // Both roles require a separate real voice. Never fall back to the browser default.
            if (!bank.narrator || !bank.dialogue.length || !voice) { status(bank.available.length < 2 ? 'voicesUnavailable' : 'voiceMissing'); return; }
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
        return { listen, speak, stop, voices, selectVoice, setTuning, resetVoices,
            setEnabled(value) { enabled = !!value; if (!enabled) this.stop(); },
            supportedInput: !!Recognition, supportedOutput: !!(host.speechSynthesis && host.SpeechSynthesisUtterance),
            get preferencesSaved() { return preferencesSaved; },
            get listening() { return !!active; } };
    }
    return { create, locales, species, voiceId };
});
