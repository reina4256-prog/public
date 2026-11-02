'use strict';
// Personal development diagnostics. No game save, cloud or historical fixture input.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const cp = require('node:child_process');
const ROOT = path.resolve(__dirname, '../..');
const DEFAULT_DIRECTORY = path.join(ROOT, 'docs/.local-history/playtests');
const LIMIT = 64 * 1024 * 1024;
const sessionPattern = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$(?![\s\S])/;
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
function versionSources(files, directory, root = ROOT) {
    const sources = [...new Set(files)].sort().map(file => ({ file, bytes: fs.readFileSync(path.join(root, file)) }));
    const hashes = Object.fromEntries(sources.map(({ file, bytes }) => [file, hash(bytes)]));
    const id = hash(JSON.stringify(hashes));
    const git = cp.spawnSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8', windowsHide: true });
    const commit = git.status === 0 && /^[a-f0-9]{40}$/.test(git.stdout.trim()) ? git.stdout.trim() : null;
    const version = { runtimeHash: id, gitCommit: commit, files: hashes };
    const target = path.join(directory, 'versions', id);
    fs.mkdirSync(target, { recursive: true });
    for (const { file, bytes } of sources) {
        const destination = path.join(target, file);
        fs.mkdirSync(path.dirname(destination), { recursive: true });
        if (!fs.existsSync(destination)) fs.writeFileSync(destination, bytes, { flag: 'wx' });
        else if (hash(fs.readFileSync(destination)) !== hashes[file]) throw new Error('version_archive_mismatch');
    }
    const manifest = path.join(target, 'manifest.json');
    if (!fs.existsSync(manifest)) fs.writeFileSync(manifest, JSON.stringify(version, null, 2), { flag: 'wx' });
    return version;
}
function readSession(file) {
    const text = fs.readFileSync(file, 'utf8');
    if (text && !text.endsWith('\n')) throw new Error('incomplete_session_tail');
    return text.split('\n').filter(Boolean).map(line => JSON.parse(line));
}
function createRecorder(options = {}) {
    const directory = options.directory || DEFAULT_DIRECTORY;
    const sessions = new Map();
    const blocked = new Set();
    fs.mkdirSync(path.join(directory, 'sessions'), { recursive: true });
    const version = options.version || (options.files ? versionSources(options.files, directory) : null);
    function append(packet) {
        let activeId;
        try {
            const { sessionId, sequence, event } = packet || {};
            if (typeof sessionId !== 'string' || !sessionPattern.test(sessionId) || !Number.isSafeInteger(sequence) || sequence < 1
                || !event || typeof event !== 'object' || Array.isArray(event)
                || typeof event.kind !== 'string' || !Number.isFinite(event.at)) return { ok: false, reason: 'invalid' };
            activeId = sessionId;
            if (blocked.has(sessionId)) return { ok: false, reason: 'write' };
            const text = JSON.stringify({ sessionId, sequence, event });
            if (Buffer.byteLength(text) > LIMIT) return { ok: false, reason: 'capacity' };
            const file = path.join(directory, 'sessions', sessionId + '.jsonl');
            if (!sessions.has(sessionId)) {
                if (fs.existsSync(file) && (!fs.lstatSync(file).isFile() || fs.lstatSync(file).isSymbolicLink())) throw new Error('invalid_file');
                const previous = fs.existsSync(file) ? readSession(file) : [];
                if (previous.some((row, index) => row.sessionId !== sessionId || row.sequence !== index + 1)) throw new Error('invalid_session');
                sessions.set(sessionId, previous.map(row => hash(JSON.stringify({ sessionId: row.sessionId, sequence: row.sequence, event: row.event }))));
            }
            const seen = sessions.get(sessionId);
            if (sequence <= seen.length) return seen[sequence - 1] === hash(text)
                ? { ok: true, duplicate: true, sequence } : { ok: false, reason: 'conflict' };
            if (sequence !== seen.length + 1 || sequence === 1 && event.kind !== 'session') return { ok: false, reason: 'sequence' };
            // Each acknowledged row is flushed. A partial disk write is never silently repaired.
            fs.appendFileSync(file, JSON.stringify({ sessionId, sequence, event, receivedAt: new Date().toISOString() }) + '\n',
                { encoding: 'utf8', flush: true });
            seen.push(hash(text));
            return { ok: true, sequence };
        } catch (_) { if (activeId) blocked.add(activeId); return { ok: false, reason: 'write' }; }
    }
    return { append, version, directory };
}
module.exports = { createRecorder, versionSources, readSession, sessionPattern, DEFAULT_DIRECTORY, LIMIT };
