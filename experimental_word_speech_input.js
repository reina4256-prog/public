(function (root, factory) {
    'use strict';
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.ExperimentalWordSpeechInput = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';
    function encodeWav(samples, rate) {
        const length = Math.min(320000, Math.floor(samples.length * 16000 / rate));
        const bytes = new Uint8Array(44 + length * 2), view = new DataView(bytes.buffer);
        const text = (offset, value) => { for (let i = 0; i < value.length; i++) bytes[offset + i] = value.charCodeAt(i); };
        text(0, 'RIFF'); view.setUint32(4, bytes.length - 8, true); text(8, 'WAVEfmt ');
        view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
        view.setUint32(24, 16000, true); view.setUint32(28, 32000, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
        text(36, 'data'); view.setUint32(40, length * 2, true);
        for (let i = 0; i < length; i++) {
            const position = i * rate / 16000, at = Math.floor(position), fraction = position - at;
            const value = Math.max(-1, Math.min(1, (samples[at] || 0) * (1 - fraction) + (samples[at + 1] || 0) * fraction));
            view.setInt16(44 + i * 2, value < 0 ? value * 32768 : value * 32767, true);
        }
        return bytes;
    }
    function create(host) {
        return class LocalRecognition {
            constructor() { this.lang = 'ja-JP'; this.id = host.crypto.randomUUID(); this.aborted = false; }
            async cleanup() {
                clearTimeout(this.timer);
                this.processor?.disconnect(); this.source?.disconnect(); this.mute?.disconnect();
                if (this.processor) this.processor.onaudioprocess = null;
                this.stream?.getTracks().forEach(track => track.stop());
                if (this.context && this.context.state !== 'closed') await this.context.close().catch(() => {});
            }
            abort() {
                this.aborted = true; void this.cleanup();
                void host.wordSpeech.cancel(this.id).catch(() => {});
            }
            start() { void this.capture().catch(error => this.fail(error?.name === 'NotAllowedError' ? 'not-allowed' : 'audio-capture')); }
            fail(error) { if (!this.aborted) { this.onerror?.({ error }); this.onend?.(); } void this.cleanup(); }
            async capture() {
                this.stream = await host.navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true }, video: false });
                if (this.aborted) { await this.cleanup(); return; }
                this.context = new host.AudioContext(); await this.context.resume();
                if (this.aborted) { await this.cleanup(); return; }
                this.source = this.context.createMediaStreamSource(this.stream);
                // The graph is muted; microphone samples are never played through the speakers.
                this.processor = this.context.createScriptProcessor(4096, 1, 1);
                this.mute = this.context.createGain(); this.mute.gain.value = 0;
                this.source.connect(this.processor); this.processor.connect(this.mute); this.mute.connect(this.context.destination);
                this.chunks = []; this.count = 0; this.heard = false; this.silence = 0; this.finished = false;
                this.processor.onaudioprocess = event => {
                    if (this.aborted || this.finished) return;
                    const data = event.inputBuffer.getChannelData(0);
                    this.chunks.push(new Float32Array(data)); this.count += data.length;
                    const rms = Math.sqrt(data.reduce((sum, sample) => sum + sample * sample, 0) / data.length);
                    if (rms > .008) { this.heard = true; this.silence = 0; } else this.silence += data.length / this.context.sampleRate;
                    if ((this.heard && this.silence >= 1.2) || this.count >= this.context.sampleRate * 20
                        || (!this.heard && this.count >= this.context.sampleRate * 5)) void this.finishCapture();
                };
                this.timer = setTimeout(() => { void this.finishCapture(); }, 20000);
            }
            async finishCapture() {
                if (this.finished || this.aborted) return;
                this.finished = true;
                const rate = this.context.sampleRate, samples = new Float32Array(this.count);
                let offset = 0; for (const chunk of this.chunks) { samples.set(chunk, offset); offset += chunk.length; }
                this.chunks = [];
                await this.cleanup();
                if (this.aborted) return;
                if (!this.heard) { this.fail('no-speech'); return; }
                this.onprocessing?.();
                try {
                    const result = await host.wordSpeech.transcribe({ id: this.id, locale: this.lang, wav: encodeWav(samples, rate) });
                    if (this.aborted) return;
                    if (!result.ok) { this.fail(result.error === 'missing' ? 'recognizer-missing' : result.error === 'noSpeech' ? 'no-speech' : 'recognizer-failed'); return; }
                    this.onresult?.({ results: [Object.assign([{ transcript: result.text }], { isFinal: true })] });
                    this.onend?.();
                } catch (_) { this.fail('recognizer-failed'); }
            }
        };
    }
    return { create, encodeWav };
});
