'use strict';
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const cp = require('node:child_process');
const net = require('node:net');
const crypto = require('node:crypto');
const languages = { 'ja-JP': 'ja', 'en-US': 'en', 'zh-CN': 'zh', 'ru-RU': 'ru', 'es-ES': 'es', 'pt-BR': 'pt', 'de-DE': 'de' };
function validWav(bytes) {
    return bytes.length >= 46 && bytes.length <= 640044 && bytes.toString('ascii', 0, 4) === 'RIFF'
        && bytes.readUInt32LE(4) === bytes.length - 8 && bytes.toString('ascii', 8, 16) === 'WAVEfmt '
        && bytes.readUInt32LE(16) === 16 && bytes.readUInt16LE(20) === 1 && bytes.readUInt16LE(22) === 1
        && bytes.readUInt32LE(24) === 16000 && bytes.readUInt32LE(28) === 32000
        && bytes.readUInt16LE(32) === 2 && bytes.readUInt16LE(34) === 16
        && bytes.toString('ascii', 36, 40) === 'data' && bytes.readUInt32LE(40) === bytes.length - 44 && bytes.length % 2 === 0;
}
function freePort() {
    return new Promise((resolve, reject) => {
        const socket = net.createServer(); socket.once('error', reject);
        socket.listen(0, '127.0.0.1', () => { const port = socket.address().port; socket.close(error => error ? reject(error) : resolve(port)); });
    });
}
function createSpeechProcess(options = {}) {
    const directory = options.directory || path.resolve(__dirname, '../../docs/.local-history/voice-input-engine');
    const executable = path.join(directory, 'bin', 'Release', 'whisper-server.exe');
    const model = path.join(directory, 'ggml-small-q5_1.bin');
    const spawn = options.spawn || cp.spawn, request = options.fetch || fetch;
    let service = null, starting = null, current = null, disposed = false;
    function stopService() {
        const previous = service; service = null;
        if (previous) { previous.stopped = true; previous.child?.kill(); }
    }
    async function prepare() {
        if (disposed) return { ok: false, error: 'cancelled' };
        if (service?.ready) return { ok: true };
        if (starting) return starting;
        if (!fs.existsSync(executable) || !fs.existsSync(model)) return { ok: false, error: 'missing' };
        starting = (async () => {
            const job = { ready: false, stopped: false, child: null }; service = job;
            try {
                const port = await (options.freePort || freePort)();
                if (disposed || job.stopped) throw new Error('cancelled');
                job.url = 'http://127.0.0.1:' + port + '/' + crypto.randomBytes(24).toString('hex');
                job.temp = fs.mkdtempSync(path.join(os.tmpdir(), 'word-speech-'));
                job.child = spawn(executable, ['-m', model, '--host', '127.0.0.1', '--port', String(port),
                    '--request-path', new URL(job.url).pathname, '--public', job.temp,
                    '-ng', '-t', '4', '-bs', '5', '-nt'],
                { cwd: job.temp, shell: false, windowsHide: true, stdio: 'ignore' });
                const closed = () => {
                    job.stopped = true; if (service === job) service = null;
                    // Conversion is disabled: audio stays in memory. Remove only our empty directory.
                    try { fs.rmdirSync(job.temp); } catch (_) {}
                };
                job.child.once('error', closed); job.child.once('close', closed);
                const until = Date.now() + 60000;
                while (!job.stopped && !disposed && Date.now() < until) {
                    try {
                        const response = await request(job.url + '/health', { signal: AbortSignal.timeout(1000), redirect: 'error' });
                        if (response.ok && (await response.json()).status === 'ok' && !job.stopped && !disposed) {
                            job.ready = true; return { ok: true };
                        }
                    } catch (_) { /* The model is still loading. */ }
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
                throw new Error('not ready');
            } catch (_) {
                if (service === job) stopService();
                return { ok: false, error: disposed ? 'cancelled' : 'failed' };
            }
        })();
        try { return await starting; } finally { starting = null; }
    }
    function cancel(id) {
        if (current && (!id || current.id === id)) {
            current.cancelled = true; current.abort.abort();
            // Aborting HTTP alone does not stop inference. Kill only the child we created.
            stopService();
        }
    }
    async function transcribe(packet) {
        if (!packet || typeof packet.id !== 'string' || !/^[a-z0-9-]{1,80}$/.test(packet.id)
            || !Object.hasOwn(languages, packet.locale) || !(packet.wav instanceof Uint8Array)
            || packet.wav.byteLength < 46 || packet.wav.byteLength > 640044) return { ok: false, error: 'invalid' };
        const bytes = Buffer.from(packet.wav);
        if (!validWav(bytes)) return { ok: false, error: 'invalid' };
        if (current) return { ok: false, error: 'busy' };
        const job = { id: packet.id, cancelled: false, abort: new AbortController() }; current = job;
        let timeout;
        try {
            const ready = await prepare();
            if (job.cancelled || disposed) return { ok: false, error: 'cancelled' };
            if (!ready.ok) return ready;
            const form = new FormData();
            form.set('file', new Blob([bytes], { type: 'audio/wav' }), 'input.wav');
            form.set('language', languages[packet.locale]); form.set('response_format', 'json');
            form.set('temperature', '0'); form.set('temperature_inc', '0');
            if (packet.interim === true) {
                // A shorter encoder window speeds provisional prefixes. Final decoding keeps the full context.
                form.set('audio_ctx', String(Math.min(1500, Math.max(256, Math.ceil(((bytes.length - 44) / 32000 * 50 + 100) / 128) * 128))));
                form.set('beam_size', '1'); form.set('best_of', '1');
            }
            timeout = setTimeout(() => { job.abort.abort(); stopService(); }, 90000);
            const response = await request(service.url + '/inference', { method: 'POST', body: form,
                signal: job.abort.signal, redirect: 'error', credentials: 'omit' });
            if (!response.ok) throw new Error('inference');
            const text = (await response.json()).text?.trim();
            if (job.cancelled || disposed) return { ok: false, error: 'cancelled' };
            return typeof text === 'string' && text.length <= 4096 && text && !/^\[(BLANK_AUDIO|SILENCE)\]$/i.test(text)
                ? { ok: true, text } : { ok: false, error: 'noSpeech' };
        } catch (_) { return { ok: false, error: job.cancelled || disposed ? 'cancelled' : 'failed' }; }
        finally { clearTimeout(timeout); if (current === job) current = null; }
    }
    return { prepare, transcribe, cancel, dispose() { disposed = true; cancel(); stopService(); }, directory };
}
module.exports = { createSpeechProcess, validWav, languages };
