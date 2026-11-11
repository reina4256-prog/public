'use strict';
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const cp = require('node:child_process');
const languages = { 'ja-JP': 'ja', 'en-US': 'en', 'zh-CN': 'zh', 'ru-RU': 'ru', 'es-ES': 'es', 'pt-BR': 'pt', 'de-DE': 'de' };
function validWav(bytes) {
    return bytes.length >= 46 && bytes.length <= 640044 && bytes.toString('ascii', 0, 4) === 'RIFF'
        && bytes.readUInt32LE(4) === bytes.length - 8 && bytes.toString('ascii', 8, 16) === 'WAVEfmt '
        && bytes.readUInt32LE(16) === 16 && bytes.readUInt16LE(20) === 1 && bytes.readUInt16LE(22) === 1
        && bytes.readUInt32LE(24) === 16000 && bytes.readUInt32LE(28) === 32000
        && bytes.readUInt16LE(32) === 2 && bytes.readUInt16LE(34) === 16
        && bytes.toString('ascii', 36, 40) === 'data' && bytes.readUInt32LE(40) === bytes.length - 44 && bytes.length % 2 === 0;
}
function createSpeechProcess(options = {}) {
    const directory = options.directory || path.resolve(__dirname, '../../docs/.local-history/voice-input-engine');
    const executable = path.join(directory, 'bin', 'Release', 'whisper-cli.exe');
    const model = path.join(directory, 'ggml-base.bin');
    const spawn = options.spawn || cp.spawn;
    let current = null;
    function cancel(id) { if (current && (!id || current.id === id)) { current.cancelled = true; current.child?.kill(); } }
    async function transcribe(packet) {
        if (!packet || typeof packet.id !== 'string' || !/^[a-z0-9-]{1,80}$/.test(packet.id)
            || !Object.hasOwn(languages, packet.locale) || !(packet.wav instanceof Uint8Array)
            || packet.wav.byteLength < 46 || packet.wav.byteLength > 640044) return { ok: false, error: 'invalid' };
        const bytes = Buffer.from(packet.wav);
        if (!validWav(bytes)) return { ok: false, error: 'invalid' };
        if (current) return { ok: false, error: 'busy' };
        if (!fs.existsSync(executable) || !fs.existsSync(model)) return { ok: false, error: 'missing' };
        const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'word-speech-'));
        const input = path.join(temp, 'input.wav'), output = path.join(temp, 'result');
        fs.writeFileSync(input, bytes);
        return new Promise(resolve => {
            const job = { id: packet.id, cancelled: false, child: null }; current = job;
            let settled = false, timeout = null, error = null;
            function finish(code) {
                if (settled) return; settled = true; clearTimeout(timeout);
                let result = { ok: false, error: job.cancelled ? 'cancelled' : error || 'failed' };
                try {
                    if (!job.cancelled && !error && code === 0) {
                        const text = fs.readFileSync(output + '.txt', 'utf8').trim();
                        result = text && text.length <= 4096 && !/^\[(BLANK_AUDIO|SILENCE)\]$/i.test(text)
                            ? { ok: true, text } : { ok: false, error: 'noSpeech' };
                    }
                } catch (_) { /* Missing output is an explicit failure. */ }
                // Delete only our three known, generated paths; never recurse or enumerate.
                for (const file of [input, output + '.txt']) { try { fs.unlinkSync(file); } catch (_) {} }
                try { fs.rmdirSync(temp); } catch (_) {}
                if (current === job) current = null;
                resolve(result);
            }
            try {
                job.child = spawn(executable, ['-m', model, '-f', input, '-l', languages[packet.locale], '-otxt', '-of', output,
                    '-nt', '-ng', '-t', '4'], { cwd: path.dirname(executable), shell: false, windowsHide: true, stdio: 'ignore' });
                job.child.once('error', () => { error = 'failed'; finish(1); });
                job.child.once('close', finish);
                timeout = setTimeout(() => { error = 'timeout'; job.child.kill(); }, 90000);
            } catch (_) { error = 'failed'; finish(1); }
        });
    }
    return { transcribe, cancel, dispose: () => cancel(), directory };
}
module.exports = { createSpeechProcess, validWav, languages };
