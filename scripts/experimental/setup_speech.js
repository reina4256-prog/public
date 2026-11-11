'use strict';
// Explicit one-time installation. Game startup never downloads code or models.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const cp = require('node:child_process');
const directory = path.resolve(__dirname, '../../docs/.local-history/voice-input-engine');
const assets = [
    ['whisper.zip', 'https://github.com/ggml-org/whisper.cpp/releases/download/b5454/whisper-bin-x64.zip', '6ba69e3482d7826214f90a6a9c84ca07782aec1e1d0c6a7c30c994fd5d816ccb'],
    ['ggml-small-q5_1.bin', 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-small-q5_1.bin', 'ae85e4a935d7a567bd102fe55afc16bb595bdb618e11b2fc7591bc08120411bb'],
    ['ggml-silero-v5.1.2.bin', 'https://huggingface.co/ggml-org/whisper-vad/resolve/main/ggml-silero-v5.1.2.bin', '29940d98d42b91fbd05ce489f3ecf7c72f0a42f027e4875919a28fb4c04ea2cf']
];
async function install() {
    if (process.platform !== 'win32' || process.arch !== 'x64') throw new Error('This setup is for Windows x64.');
    fs.mkdirSync(directory, { recursive: true });
    for (const [name, url, expected] of assets) {
        const destination = path.join(directory, name);
        const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
        if (fs.existsSync(destination) && hash(destination) === expected) continue;
        console.log('Downloading ' + name + ' from the official distribution...');
        const response = await fetch(url, { signal: AbortSignal.timeout(600000) });
        if (!response.ok) throw new Error('Download HTTP ' + response.status);
        const bytes = Buffer.from(await response.arrayBuffer());
        if (crypto.createHash('sha256').update(bytes).digest('hex') !== expected) throw new Error('SHA256 mismatch: ' + name);
        fs.writeFileSync(destination, bytes, { flag: 'w' });
    }
    cp.execFileSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command',
        'Expand-Archive -LiteralPath $env:WORD_SPEECH_ZIP -DestinationPath $env:WORD_SPEECH_BIN -Force'], {
        windowsHide: true, env: { ...process.env, WORD_SPEECH_ZIP: path.join(directory, 'whisper.zip'), WORD_SPEECH_BIN: path.join(directory, 'bin') }
    });
    // Development-only app-local runtime from the already installed VOICEVOX.
    // A distributed Steam build must declare the official VC++ prerequisite instead.
    const runtime = path.resolve(__dirname, '../../../voicevox_engine/engine_internal');
    for (const name of ['VCRUNTIME140_1.dll', 'VCRUNTIME140.dll', 'MSVCP140.dll']) {
        if (fs.existsSync(path.join(runtime, name))) fs.copyFileSync(path.join(runtime, name), path.join(directory, 'bin/Release', name));
    }
    // Keep upstream license notices alongside the locally installed binaries.
    for (const [name, url] of [
        ['LICENSE-whisper.cpp.txt', 'https://raw.githubusercontent.com/ggml-org/whisper.cpp/b5454/LICENSE'],
        ['LICENSE-model.txt', 'https://raw.githubusercontent.com/openai/whisper/main/LICENSE'],
        ['LICENSE-vad.txt', 'https://raw.githubusercontent.com/snakers4/silero-vad/master/LICENSE']
    ]) {
        const response = await fetch(url); if (!response.ok) throw new Error('License HTTP ' + response.status);
        fs.writeFileSync(path.join(directory, name), await response.text());
    }
    console.log('Local speech input installed: ' + directory);
}
if (require.main === module) install().catch(error => { console.error(error.message); process.exitCode = 1; });
module.exports = { install, directory };
