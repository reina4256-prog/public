'use strict';
// Development-only test selection. It never imports game modules or player data.
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const crypto = require('node:crypto');
const ROOT = path.resolve(__dirname, '../..');
const LOG_ROOT = path.join(ROOT, 'docs/.local-history/verification-runs');
const SELF_TEST = 'tests/word_verification.test.js';
const AUDIT_TEST = 'tests/experimental_word_diary_audit.test.js';
const normalize = file => file.replace(/\\/g, '/');
function local(file) {
    if (typeof file !== 'string' || !file || path.isAbsolute(file)
        || file.split('/').some(p => !p || p === '..' || p === '.') || file.includes('\\')
        || !/^[a-zA-Z0-9_./-]+$/.test(file)) throw new Error('Invalid repository-relative path: ' + file);
    return path.join(ROOT, file);
}
function registeredTests(root = ROOT) {
    const script = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).scripts['test:words'];
    const parts = script.split(/\s+/);
    if (parts[0] !== 'node' || parts[1] !== '--test'
        || parts.slice(2).some(p => !/^tests\/[a-zA-Z0-9_]+\.test\.js$/.test(p))) {
        throw new Error('test:words must remain an explicit Node test inventory');
    }
    return [...new Set([...parts.slice(2), AUDIT_TEST, SELF_TEST])];
}
function dependencies(file, read = name => fs.readFileSync(local(name), 'utf8'), exists = name => fs.existsSync(local(name))) {
    if (!file.endsWith('.js')) return [];
    const source = read(file), result = [];
    for (const match of source.matchAll(/require\(\s*['"](\.[^'"]+)['"]\s*\)/g)) {
        const base = normalize(path.posix.normalize(path.posix.join(path.posix.dirname(file), match[1])));
        if (base.startsWith('../')) continue;
        const found = [base, base + '.js', base + '.json', base + '/index.js'].find(exists);
        if (found) result.push(found);
    }
    return [...new Set(result)];
}
function reaches(test, changed, read, exists, visited = new Set()) {
    if (changed.has(test)) return true;
    if (visited.has(test)) return false;
    visited.add(test);
    return dependencies(test, read, exists).some(file => reaches(file, changed, read, exists, visited));
}
const shared = file => /^experimental_word_(learning_(core|world|catalog)|relation_learning|life_learning|feeling_learning|careers)/.test(file)
    || /^scripts\/experimental\/(storage|serve|launch)\./.test(file)
    || /^(localization|scripts\/i18n\/|locales\/|scripts\/release\/)/.test(file) || file === 'package.json';
const documentation = file => /^(docs\/|AGENTS\.md$|\.gitignore$)/.test(file);
const tooling = file => /^scripts\/verification\//.test(file) || file === SELF_TEST;
function plan(files, options = {}) {
    files = [...new Set(files.map(normalize))].sort(); files.forEach(local);
    const tests = options.tests || registeredTests();
    const read = options.read || (file => fs.readFileSync(local(file), 'utf8'));
    const exists = options.exists || (file => fs.existsSync(local(file)));
    const sharedFiles = files.filter(shared);
    const selected = new Set([SELF_TEST]);
    const unclassified = [];
    let full = options.full || sharedFiles.length > 0;
    const reasons = full ? [options.full ? 'explicit_full_regression' : 'shared_dependency_changed'] : [];
    for (const file of files.filter(file => !documentation(file) && !tooling(file))) {
        const affected = tests.filter(test => reaches(test, new Set([file]), read, exists));
        affected.forEach(test => selected.add(test));
        if (!affected.length && !shared(file)) { unclassified.push(file); full = true; }
    }
    if (unclassified.length) reasons.push('unclassified_change_requires_review_and_full_word_regression');
    const wordChange = files.some(file => /experimental_word|scripts\/experimental\//.test(file));
    if (wordChange || files.some(tooling) || options.full) selected.add(AUDIT_TEST);
    if (full) tests.forEach(test => selected.add(test));
    const renderers = [];
    for (const file of files.filter(file => /^scripts\/experimental\/.*_smoke\.js$/.test(file))) renderers.push(file);
    // Dynamic require() in the diary audit/owner comparisons is not represented by
    // a static graph. Every word change runs the audit; owner edits also run all
    // registered diary tests, including the historical cross-owner comparisons.
    if (files.some(file => /^experimental_word_diary_.*\.js$/.test(file))) {
        tests.filter(test => test.startsWith('tests/experimental_word_diary_')).forEach(test => selected.add(test));
        reasons.push('diary_dynamic_cross_owner_dependencies');
    }
    for (const file of files) {
        const owner = /^experimental_word_diary_(.+)\.js$/.exec(file);
        if (!owner) continue;
        const dir = path.join(ROOT, 'scripts/experimental');
        const names = fs.readdirSync(dir).filter(name => name.endsWith('_smoke.js'));
        for (const name of names) {
            const smoke = 'scripts/experimental/' + name;
            if (read(smoke).includes(path.basename(file))) renderers.push(smoke);
        }
    }
    const selectedTests = tests.filter(test => selected.has(test));
    const checks = [{ id: 'document-links', kind: 'documentation', args: ['scripts/verification/docs_check.js'] }];
    for (const file of files.filter(file => file.endsWith('.js') && exists(file)))
        checks.push({ id: 'syntax:' + file, kind: 'syntax', args: ['--check', file] });
    checks.push({ id: 'node-tests', kind: 'tests', args: ['--test', '--test-concurrency=2', '--test-reporter=tap', ...selectedTests] });
    if (full || files.some(file => /^(localization|scripts\/i18n\/|locales\/)/.test(file)))
        checks.push({ id: 'localization', kind: 'localization', args: ['scripts/i18n/check_localization.js'] });
    for (const smoke of [...new Set(renderers)]) checks.push({ id: 'renderer:' + smoke, kind: 'renderer', args: [smoke] });
    return { schemaVersion: 1, profile: full ? 'full' : 'change', changedFiles: files, reasons,
        sharedFiles, reviewRequired: unclassified, checks,
        selectedTests, unexecutedTests: tests.filter(test => !selected.has(test)),
        reading: { status: 'not_recorded', note: 'Selection and passing tests do not certify source reading or user acceptance.' },
        unverified: ['Unselected renderer/UI/audio flows', 'Real player saves and release builds',
            'Historical source semantic reading', 'Gameplay outside the word test inventory'] };
}
function changes() {
    const result = cp.spawnSync('git', ['status', '--porcelain=v1', '-z', '--untracked-files=normal'], { cwd: ROOT, encoding: 'utf8', windowsHide: true });
    if (result.status !== 0) throw new Error('Cannot determine changed paths');
    const records = result.stdout.split('\0').filter(Boolean), files = [];
    for (let index = 0; index < records.length; index++) {
        const record = records[index], file = record.slice(3);
        if (record.slice(0, 2).includes('R') || record.slice(0, 2).includes('C')) index++;
        if (file.startsWith('%SystemDrive%/')) continue;
        if (file.endsWith('/')) throw new Error('Untracked directory needs explicit --files paths: ' + file);
        files.push(file);
    }
    return files;
}
function parseCounts(text) {
    const counts = {};
    for (const key of ['tests', 'pass', 'fail', 'cancelled', 'skipped', 'todo']) {
        const found = [...text.matchAll(new RegExp('^# ' + key + ' (\\d+)\\s*$', 'gm'))].at(-1);
        if (found) counts[key] = Number(found[1]);
    }
    return counts;
}
async function execute(check, directory, options = {}) {
    fs.mkdirSync(directory, { recursive: true });
    const stdoutPath = path.join(directory, 'stdout.log'), stderrPath = path.join(directory, 'stderr.log');
    const stdout = fs.createWriteStream(stdoutPath), stderr = fs.createWriteStream(stderrPath);
    const hashes = { stdout: crypto.createHash('sha256'), stderr: crypto.createHash('sha256') };
    const started = Date.now(); let tail = '', timedOut = false, error = null;
    const result = await new Promise(resolve => {
        const child = cp.spawn(process.execPath, check.args, { cwd: options.cwd || ROOT,
            env: { ...process.env, FORCE_COLOR: '0' }, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
        child.stdout.on('data', chunk => { stdout.write(chunk); hashes.stdout.update(chunk); tail = (tail + chunk.toString()).slice(-131072); });
        child.stderr.on('data', chunk => { stderr.write(chunk); hashes.stderr.update(chunk); });
        child.on('error', value => { error = value.message; });
        const timer = setTimeout(() => {
            timedOut = true;
            if (process.platform === 'win32' && child.pid) cp.spawn('taskkill.exe', ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true });
            else child.kill('SIGTERM');
        }, options.timeoutMs || 15 * 60 * 1000);
        child.on('close', (code, signal) => { clearTimeout(timer); resolve({ exitCode: code, signal }); });
    });
    await Promise.all([new Promise(resolve => stdout.end(resolve)), new Promise(resolve => stderr.end(resolve))]);
    const counts = parseCounts(tail);
    const complete = check.kind !== 'tests' || Number.isInteger(counts.tests) && counts.tests > 0
        && counts.fail === 0 && counts.cancelled === 0 && counts.skipped === 0 && counts.todo === 0
        && counts.pass === counts.tests;
    const status = timedOut ? 'timed_out' : error || result.exitCode !== 0 || !complete ? 'failed' : 'passed';
    const lines = fs.readFileSync(stdoutPath, 'utf8').split(/\r?\n/), excerpts = [];
    for (let index = 0; index < lines.length; index++) if (/^not ok\b/.test(lines[index])) excerpts.push(lines.slice(Math.max(0, index - 1), index + 45).join('\n'));
    const failurePath = path.join(directory, 'failures.log');
    fs.writeFileSync(failurePath, excerpts.length ? excerpts.join('\n\n') : status !== 'passed' ? tail : '');
    return { id: check.id, status, ...result, error, durationMs: Date.now() - started, counts,
        stdout: stdoutPath, stderr: stderrPath, failures: failurePath,
        sha256: { stdout: hashes.stdout.digest('hex'), stderr: hashes.stderr.digest('hex') } };
}
async function run(selection, options = {}) {
    if (!options.directory) fs.mkdirSync(LOG_ROOT, { recursive: true });
    const directory = options.directory || fs.mkdtempSync(path.join(LOG_ROOT, 'word-verification-'));
    fs.mkdirSync(directory, { recursive: true });
    const git = cp.spawnSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8', windowsHide: true });
    const manifest = { ...selection, head: git.status === 0 ? git.stdout.trim() : null,
        startedAt: new Date().toISOString(), changedFileHashes: Object.fromEntries(selection.changedFiles.map(file =>
            [file, fs.existsSync(local(file)) && fs.statSync(local(file)).isFile() ? crypto.createHash('sha256').update(fs.readFileSync(local(file))).digest('hex') : null])) };
    fs.writeFileSync(path.join(directory, 'plan.json'), JSON.stringify(manifest, null, 2));
    const summary = { schemaVersion: 1, status: 'running', directory, head: manifest.head, results: [],
        reviewRequired: selection.reviewRequired, unexecutedChecks: selection.checks.map(check => check.id), unexecutedTests: selection.unexecutedTests,
        reading: selection.reading, unverified: selection.unverified };
    const save = () => fs.writeFileSync(path.join(directory, 'summary.json'), JSON.stringify(summary, null, 2));
    save();
    try {
        for (const [index, check] of selection.checks.entries()) {
            if (summary.results.some(result => result.status !== 'passed')) continue;
            const result = await execute(check, path.join(directory, String(index).padStart(3, '0')), options);
            summary.results.push(result); summary.unexecutedChecks = summary.unexecutedChecks.filter(id => id !== check.id); save();
            if (!options.quiet) console.log(`${check.id}: ${result.status} (${result.durationMs}ms)`);
        }
        summary.status = summary.results.every(result => result.status === 'passed') && !summary.reviewRequired.length ? 'passed' : 'incomplete';
    } catch (error) { summary.status = 'incomplete'; summary.error = error.message; }
    summary.finishedAt = new Date().toISOString(); save();
    fs.writeFileSync(path.join(directory, 'summary.md'), `# Word verification\n\nStatus: ${summary.status}\n\n`
        + summary.results.map(result => `- ${result.id}: ${result.status}; ${JSON.stringify(result.counts)}; ${result.durationMs}ms`).join('\n')
        + `\n\nUnexecuted checks: ${JSON.stringify(summary.unexecutedChecks)}\nUnexecuted tests: ${JSON.stringify(summary.unexecutedTests)}\n`
        + `Reading: ${JSON.stringify(summary.reading)}\nUnverified: ${JSON.stringify(summary.unverified)}\nReview required: ${JSON.stringify(summary.reviewRequired)}\n`);
    return summary;
}
async function main(args) {
    const full = args.includes('--full'), dry = args.includes('--plan');
    const at = args.indexOf('--files');
    if (args.filter(arg => arg.startsWith('--')).some(arg => !['--full', '--plan', '--files'].includes(arg))) throw new Error('Unknown option');
    const files = at >= 0 ? args.slice(at + 1).filter(arg => !arg.startsWith('--')) : changes();
    const selection = plan(files, { full });
    if (dry) { console.log(JSON.stringify(selection, null, 2)); return; }
    const summary = await run(selection);
    console.log(JSON.stringify({ status: summary.status, directory: summary.directory, results: summary.results.length,
        unexecutedTests: summary.unexecutedTests.length, reviewRequired: summary.reviewRequired }));
    process.exitCode = summary.status === 'passed' ? 0 : 1;
}
if (require.main === module) main(process.argv.slice(2)).catch(error => { console.error(error.message); process.exitCode = 1; });
module.exports = { LOG_ROOT, registeredTests, dependencies, reaches, plan, changes, parseCounts, execute, run, main };
