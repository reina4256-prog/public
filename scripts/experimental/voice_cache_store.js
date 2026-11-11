'use strict';
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const keyValid = key => typeof key === 'string' && /^[a-f0-9]{64}$/.test(key);
const wavValid = data => Buffer.isBuffer(data) && data.length >= 44 && data.length <= 4 * 1024 * 1024
    && data.toString('ascii', 0, 4) === 'RIFF' && data.toString('ascii', 8, 12) === 'WAVE';
function createStore(directory, limits = {}) {
    const maxBytes = limits.maxBytes || 64 * 1024 * 1024, maxEntries = limits.maxEntries || 256;
    let tail = Promise.resolve();
    const run = operation => {
        const result = tail.then(operation).catch(() => ({ ok: false })); tail = result.then(() => {}); return result;
    };
    async function entries() {
        const names = await fs.readdir(directory), rows = [];
        for (const name of names) {
            if (/^[a-f0-9]{64}\.[a-f0-9-]{36}\.tmp$/.test(name)) {
                const temporary = path.join(directory, name), stat = await fs.lstat(temporary);
                if (stat.isFile() && !stat.isSymbolicLink()) await fs.unlink(temporary);
            }
            if (!/^[a-f0-9]{64}\.wav$/.test(name)) continue;
            const file = path.join(directory, name), stat = await fs.lstat(file);
            if (stat.isFile() && !stat.isSymbolicLink()) rows.push({ file, size: stat.size, time: stat.mtimeMs });
        }
        return rows.sort((a, b) => a.time - b.time);
    }
    return {
        get(key) {
            if (!keyValid(key)) return Promise.resolve({ ok: false });
            return run(async () => {
                const file = path.join(directory, key + '.wav'), stat = await fs.lstat(file);
                if (!stat.isFile() || stat.isSymbolicLink() || stat.size > 4 * 1024 * 1024) return { ok: false };
                const data = await fs.readFile(file); if (!wavValid(data)) return { ok: false };
                const now = new Date(); await fs.utimes(file, now, now);
                return { ok: true, data: new Uint8Array(data) };
            });
        },
        put(key, value) {
            if (!keyValid(key) || !(value instanceof Uint8Array) || value.byteLength > 4 * 1024 * 1024) return Promise.resolve({ ok: false });
            const data = Buffer.from(value); if (!wavValid(data)) return Promise.resolve({ ok: false });
            return run(async () => {
                await fs.mkdir(directory, { recursive: true });
                const target = path.join(directory, key + '.wav');
                try { const stat = await fs.lstat(target); if (stat.isSymbolicLink() || !stat.isFile()) return { ok: false }; } catch (error) { if (error.code !== 'ENOENT') throw error; }
                const temp = path.join(directory, key + '.' + crypto.randomUUID() + '.tmp');
                try { await fs.writeFile(temp, data, { flag: 'wx' }); await fs.rename(temp, target); }
                finally { await fs.unlink(temp).catch(() => {}); }
                const rows = await entries(); let total = rows.reduce((sum, row) => sum + row.size, 0), count = rows.length;
                for (const row of rows) {
                    if (total <= maxBytes && count <= maxEntries) break;
                    await fs.unlink(row.file); total -= row.size; count--;
                }
                return { ok: true };
            });
        }
    };
}
module.exports = { createStore, keyValid, wavValid };
