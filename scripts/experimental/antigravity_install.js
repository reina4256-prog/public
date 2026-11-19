'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
// Official Windows release, from the manifest linked by Google's PowerShell installer.
// Keep the binary out of Git and never execute a downloaded installer or modify PATH.
const release = Object.freeze({ version: '1.5.12',
    url: 'https://storage.googleapis.com/antigravity-public/antigravity-cli/1.5.12-5281398513336320/windows-x64/cli_windows_x64.exe',
    sha512: '64603ba45b2783587edc62fd9effa9228091593b440ed54368e098bb5fb3ee034bada58c4125e3c0e509ed460b327e454dc99971d04d47c7aee417f00f56d801' });
const cliEntry = path.resolve(__dirname, '../../node_modules/.cache/word-antigravity/agy.exe');
function verify(file, expected = release.sha512) {
    try { return crypto.createHash('sha512').update(fs.readFileSync(file)).digest('hex') === expected; }
    catch (_) { return false; }
}
let verifiedStat;
function installed() {
    try {
        const stat = fs.statSync(cliEntry), stamp = `${stat.size}:${stat.mtimeMs}`;
        if (stamp === verifiedStat) return true;
        if (!verify(cliEntry)) return false;
        verifiedStat = stamp; return true;
    } catch (_) { return false; }
}
async function install(options = {}) {
    const file = options.file || cliEntry, artifact = options.release || release;
    if ((options.platform || process.platform) !== 'win32' || (options.arch || process.arch) !== 'x64') throw Error('This comparison currently supports Windows x64 only.');
    if (verify(file, artifact.sha512)) return file;
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const temporary = file + '.download-' + crypto.randomUUID();
    try {
        const response = await (options.fetch || fetch)(artifact.url, { signal: AbortSignal.timeout(300000), redirect: 'error' });
        if (!response.ok || !response.body) throw Error('CLI download failed.');
        const hash = crypto.createHash('sha512'), handle = fs.openSync(temporary, 'wx'); let bytes = 0;
        try {
            for await (const chunk of response.body) {
                bytes += chunk.length; if (bytes > 400 * 1024 * 1024) throw Error('CLI download exceeds its size limit.');
                hash.update(chunk); fs.writeFileSync(handle, chunk);
            }
        } finally { fs.closeSync(handle); }
        if (hash.digest('hex') !== artifact.sha512) throw Error('CLI checksum mismatch.');
        fs.renameSync(temporary, file); verifiedStat = undefined;
        return file;
    } finally { if (fs.existsSync(temporary)) fs.unlinkSync(temporary); }
}
module.exports = { release, cliEntry, verify, installed, install };
