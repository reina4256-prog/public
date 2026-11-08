(function (root, factory) {
    'use strict';
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.ExperimentalWordVoice = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';
    const locales = { ja: 'ja-JP', en: 'en-US', 'zh-CN': 'zh-CN', ru: 'ru-RU', 'es-ES': 'es-ES', 'pt-BR': 'pt-BR', de: 'de-DE' };
    // Transport only: recognition never submits a turn or changes the child's knowledge.
    function create(host, options) {
        const Recognition = host.SpeechRecognition || host.webkitSpeechRecognition;
        let active = null, generation = 0, enabled = false, utterance = null;
        const status = key => options.status(key);
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
        function speak(text) {
            if (!enabled || active || !text || !options.canSpeak()) return;
            if (!host.speechSynthesis || !host.SpeechSynthesisUtterance) { status('unsupportedOutput'); return; }
            if (utterance) host.speechSynthesis.cancel();
            const current = new host.SpeechSynthesisUtterance(text);
            current.lang = locales[options.locale()] || options.locale();
            current.volume = options.volume();
            const voice = host.speechSynthesis.getVoices().find(v => v.lang.toLowerCase() === current.lang.toLowerCase());
            if (voice) current.voice = voice;
            current.onerror = event => {
                if (utterance === current && !['canceled', 'interrupted'].includes(event.error)) status('failedOutput');
            };
            current.onend = () => { if (utterance === current) utterance = null; };
            utterance = current;
            try { host.speechSynthesis.speak(current); } catch (_) { utterance = null; status('failedOutput'); }
        }
        return { listen, speak, stop,
            setEnabled(value) { enabled = !!value; if (!enabled) this.stop(); },
            supportedInput: !!Recognition, supportedOutput: !!(host.speechSynthesis && host.SpeechSynthesisUtterance),
            get listening() { return !!active; } };
    }
    return { create, locales };
});
