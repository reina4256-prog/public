'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const api = require('../scripts/verification/word_checks');
function cleanup(directory) {
    const resolved = path.resolve(directory);
    assert.equal(path.dirname(resolved), path.resolve(os.tmpdir()));
    assert.ok(path.basename(resolved).startsWith('word-verifier-test-'));
    fs.rmSync(resolved, { recursive: true, force: true });
}
const tests = ['tests/first.test.js', 'tests/second.test.js', 'tests/word_verification.test.js'];
const sources = {
    'tests/first.test.js': "require('../scripts/fixture');",
    'scripts/fixture.js': "require('../feature');",
    'feature.js': '', 'tests/second.test.js': '', 'tests/word_verification.test.js': ''
};
const options = { tests, read: file => sources[file] || '', exists: file => Object.hasOwn(sources, file) };
test('selection follows transitive dependencies without selecting an unrelated test', () => {
    const p = api.plan(['feature.js'], options);
    assert.deepEqual(p.selectedTests, ['tests/first.test.js', 'tests/word_verification.test.js']);
    assert.deepEqual(p.unexecutedTests, ['tests/second.test.js']);
    assert.deepEqual(p.reviewRequired, []);
});
test('shared code and explicit milestones require every registered test', () => {
    for (const p of [api.plan(['experimental_word_learning_core.js'], options), api.plan([], { ...options, full: true })]) {
        assert.equal(p.profile, 'full'); assert.deepEqual(p.selectedTests, tests);
        assert.ok(p.checks.some(check => check.kind === 'localization'));
    }
});
test('unknown dependencies never silently qualify as a narrow passing selection', () => {
    const p = api.plan(['unmapped.js'], options);
    assert.equal(p.profile, 'full'); assert.deepEqual(p.reviewRequired, ['unmapped.js']);
    assert.deepEqual(p.selectedTests, tests);
});
test('documentation changes record omitted tests and do not certify reading', () => {
    const p = api.plan(['docs/word/README.md'], options);
    assert.deepEqual(p.selectedTests, ['tests/word_verification.test.js']);
    assert.equal(p.reading.status, 'not_recorded'); assert.equal(p.unexecutedTests.length, 2);
});
test('paths cannot escape the repository or inject executable arguments', () => {
    for (const file of ['../private.js', '/private.js', 'file.js;echo', 'C:/private.js'])
        assert.throws(() => api.plan([file], options));
});
test('the registered full inventory remains the existing package inventory plus audit and tooling tests', () => {
    const p = api.plan([], { full: true });
    assert.ok(p.selectedTests.includes('tests/experimental_word_diary_incomplete_desire_reports.test.js'));
    assert.ok(p.selectedTests.includes('tests/experimental_word_diary_audit.test.js'));
    assert.ok(p.selectedTests.includes('tests/word_verification.test.js'));
    assert.equal(new Set(p.selectedTests).size, p.selectedTests.length);
});
test('diary changes include dynamic cross-owner tests and their real renderer', () => {
    const p = api.plan(['experimental_word_diary_incomplete_desire_reports.js']);
    assert.ok(p.selectedTests.includes('tests/experimental_word_diary_incomplete_rest_explanation_reports.test.js'));
    assert.ok(p.checks.some(check => check.args[0] === 'scripts/experimental/diary_incomplete_desire_report_smoke.js'));
});
test('counts use the final TAP summary and leave missing summaries unknown', () => {
    assert.deepEqual(api.parseCounts('# tests 3\n# pass 2\n# fail 1\n'), { tests: 3, pass: 2, fail: 1 });
    assert.deepEqual(api.parseCounts('process interrupted'), {});
});
test('document anchors distinguish duplicate headings and explicit stable IDs', () => {
    const ids = require('../scripts/verification/docs_check').anchors('# Hello\n# Hello\n<a id="fixed"></a>\n# 未決定・境界\n');
    assert.ok(ids.has('hello')); assert.ok(ids.has('hello-1')); assert.ok(ids.has('fixed')); assert.ok(ids.has('未決定境界'));
});
test('document checks reject missing targets, missing anchors and paths outside the project', t => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'word-verifier-test-'));
    t.after(() => cleanup(dir));
    fs.writeFileSync(path.join(dir, 'index.md'), '[good](target.md#exists)\n[bad](target.md#absent)\n[missing](missing.md)\n[escape](../outside.md)');
    fs.writeFileSync(path.join(dir, 'target.md'), '# Exists\n');
    const result = require('../scripts/verification/docs_check').check(['index.md'], dir);
    assert.deepEqual(result.errors.map(error => error.code), ['missing_anchor', 'missing_target', 'outside_root']);
});
test('a failing subprocess retains full logs, excerpts and exit status', async t => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'word-verifier-test-'));
    t.after(() => cleanup(dir));
    const check = { id: 'intentional-failure', kind: 'syntax', args: ['-e', "console.log('original stdout');console.error('original stderr');process.exitCode=7"] };
    const result = await api.execute(check, dir);
    assert.equal(result.status, 'failed'); assert.equal(result.exitCode, 7);
    assert.match(fs.readFileSync(result.stdout, 'utf8'), /original stdout/);
    assert.match(fs.readFileSync(result.stderr, 'utf8'), /original stderr/);
    assert.equal(result.sha256.stdout.length, 64);
});
test('zero exit without a complete test summary is not a pass', async t => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'word-verifier-test-'));
    t.after(() => cleanup(dir));
    const result = await api.execute({ id: 'incomplete', kind: 'tests', args: ['-e', "console.log('no summary')"] }, dir);
    assert.equal(result.status, 'failed'); assert.equal(result.exitCode, 0);
});
test('fail-fast receipts list checks that did not run and preserve reading as unrecorded', async t => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'word-verifier-test-'));
    t.after(() => cleanup(dir));
    const p = { changedFiles: [], reviewRequired: [], unexecutedTests: ['unselected.test.js'],
        reading: { status: 'not_recorded' }, unverified: ['renderer'], checks: [
            { id: 'fail', kind: 'syntax', args: ['-e', 'process.exitCode=4'] },
            { id: 'not-run', kind: 'syntax', args: ['-e', 'process.exitCode=0'] }] };
    const result = await api.run(p, { directory: dir, quiet: true });
    assert.equal(result.status, 'incomplete'); assert.deepEqual(result.unexecutedChecks, ['not-run']);
    assert.equal(result.results.length, 1); assert.equal(result.reading.status, 'not_recorded');
    assert.ok(fs.existsSync(path.join(dir, 'plan.json')));
});
test('normal runs retain evidence in ignored local history rather than a temporary directory', async t => {
    const p = { changedFiles: [], reviewRequired: [], unexecutedTests: [], reading: { status: 'not_recorded' }, unverified: [],
        checks: [{ id: 'small-check', kind: 'syntax', args: ['-e', 'process.exitCode=0'] }] };
    const result = await api.run(p, { quiet: true });
    assert.equal(path.dirname(result.directory), api.LOG_ROOT);
    assert.ok(result.directory.includes(path.join('docs', '.local-history', 'verification-runs')));
    assert.equal(result.status, 'passed'); assert.ok(fs.existsSync(path.join(result.directory, 'summary.json')));
    t.after(() => {
        const resolved = path.resolve(result.directory);
        assert.equal(path.dirname(resolved), path.resolve(api.LOG_ROOT));
        assert.ok(path.basename(resolved).startsWith('word-verification-'));
        fs.rmSync(resolved, { recursive: true, force: true });
    });
});
