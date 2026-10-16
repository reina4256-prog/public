'use strict';
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '../..');
function anchors(source) {
    const ids = new Set([...source.matchAll(/<a\s+id="([^"]+)"/g)].map(match => match[1]));
    const used = new Map();
    for (const match of source.matchAll(/^#{1,6}\s+(.+)$/gm)) {
        const base = match[1].trim().toLowerCase().replace(/[^\p{L}\p{N}\p{M}_ -]/gu, '').replace(/ /g, '-');
        const count = used.get(base) || 0; ids.add(base + (count ? '-' + count : '')); used.set(base, count + 1);
    }
    return ids;
}
function check(files, root = ROOT) {
    const errors = [], cache = new Map();
    const read = file => { if (!cache.has(file)) cache.set(file, fs.readFileSync(file, 'utf8')); return cache.get(file); };
    for (const file of files) {
        const absolute = path.resolve(root, file);
        if (!absolute.startsWith(path.resolve(root) + path.sep)) { errors.push({ file, code: 'outside_root' }); continue; }
        if (!fs.existsSync(absolute)) { errors.push({ file, code: 'missing_source' }); continue; }
        for (const match of read(absolute).matchAll(/\[[^\]\n]+\]\(([^)\n]+)\)/g)) {
            let link = match[1];
            if (/^[a-z]+:/i.test(link)) continue;
            try { link = decodeURIComponent(link); } catch (_) { errors.push({ file, link, code: 'bad_encoding' }); continue; }
            const [target, fragment] = link.split('#');
            const resolved = target ? path.resolve(path.dirname(absolute), target) : absolute;
            if (!resolved.startsWith(path.resolve(root) + path.sep)) { errors.push({ file, link, code: 'outside_root' }); continue; }
            if (!fs.existsSync(resolved)) { errors.push({ file, link, code: 'missing_target' }); continue; }
            if (fragment && !anchors(read(resolved)).has(fragment)) errors.push({ file, link, code: 'missing_anchor' });
        }
    }
    return { files: files.length, errors };
}
if (require.main === module) {
    const files = fs.readdirSync(path.join(ROOT, 'docs/word')).filter(file => file.endsWith('.md')).map(file => 'docs/word/' + file);
    const report = check(files); console.log(JSON.stringify(report, null, 2)); process.exitCode = report.errors.length ? 1 : 0;
}
module.exports = { check, anchors };
