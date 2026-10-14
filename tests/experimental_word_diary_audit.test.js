'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const { createHash } = require('node:crypto');
const { inventory, audit, localFile } = require('../scripts/experimental/diary_audit');
const { createServer } = require('../scripts/experimental/serve');

test('structural reconciliation preserves confirmed scopes and cannot certify semantic reading or completion', () => {
    const report = audit();
    assert.deepEqual(report.errors, []);
    assert.equal(report.structuralOk, true);
    assert.equal(report.counts.confirmedScopes, 51);
    assert.equal(report.counts.visibleSlots, 52);
    assert.equal(report.counts.aoConfirmed, false);
    assert.ok(report.rows.every(row => row.scopeUserConfirmed && row.auditSemanticReview === 'pending' && !row.runtimeDiaryConnected));
    for (const key of ['eligibleForAoCompletion', 'whole4d12Complete', 'whole4dComplete', 'wholeID4Complete']) {
        assert.equal(report[key], false);
    }
    for (const id of ['historical_reading', 'entry_semantics', 'gesture_questions', 'later_rest_answer', 'ao_feedback_acceptance']) {
        assert.ok(report.unresolved.some(issue => issue.id === id));
    }
});

test('an adapter omitted from the ledger is reported rather than permanently excluded', () => {
    const report = audit(inventory().filter(row => row.id !== '4d12am'));
    assert.ok(report.errors.some(error => error.code === 'unassigned_adapter'
        && error.reference === 'experimental_word_diary_proposals.js'));
    assert.ok(report.errors.some(error => error.code === 'inventory_count'));
    assert.equal(report.structuralOk, false);
    assert.equal(report.eligibleForAoCompletion, false);
    assert.equal(report.counts.confirmedScopes, 51);
    assert.equal(report.counts.mappedOwners, 50);
});

test('duplicate ownership and a changed API contract are rejected without rewriting the source', () => {
    const rows = inventory();
    rows[0].arity = 99;
    rows[1].id = rows[0].id;
    const report = audit(rows);
    assert.ok(report.errors.some(error => error.code === 'duplicate_owner'));
    assert.ok(report.errors.some(error => error.code === 'api_contract' && error.id === '4d1'));
    assert.equal(report.structuralOk, false);
});

test('a missing fixture or invalid reference remains an error, never a repaired or guessed reference', () => {
    const rows = inventory();
    rows[0].test = 'tests/nonexistent_diary_audit_fixture.test.js';
    const report = audit(rows);
    assert.ok(report.errors.some(error => error.code === 'unreadable_reference'));
    assert.ok(report.errors.some(error => error.code === 'missing_test_registration'));
    for (const reference of ['../outside', '%SystemDrive%/secret', 'C:/outside', 'docs/../../outside', 'docs\\file', '/absolute']) {
        assert.throws(() => localFile(reference), TypeError);
    }
});

test('caller edits and repeated audits do not change the inventory or consulted files', () => {
    const references = [...inventory().flatMap(row => [row.file, row.test]),
        'docs/specs/core/experimental_word_learning.md', 'docs/WORD_DEMO_ROADMAP.md',
        'docs/specs/core/experimental_word_diary_audit.md', 'package.json'];
    const hashes = () => references.map(file => createHash('sha256').update(fs.readFileSync(localFile(file))).digest('hex'));
    const before = hashes();
    const report = audit();
    report.rows[0].id = 'edited';
    report.unresolved.length = 0;
    const rows = inventory(); rows[0].file = 'edited';
    assert.equal(inventory()[0].id, '4d1');
    assert.equal(audit().rows[0].id, '4d1');
    assert.ok(audit().unresolved.some(issue => issue.id === 'historical_reading'));
    assert.deepEqual(hashes(), before);
});

test('existing diary adapters and the new audit remain outside the game server allowlist', async () => {
    const server = createServer({ encounterVideos: false });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    try {
        const status = name => new Promise((resolve, reject) => {
            http.get({ host: '127.0.0.1', port: server.address().port, path: '/' + name }, response => {
                response.resume(); response.on('end', () => resolve(response.statusCode));
            }).on('error', reject);
        });
        for (const name of [...inventory().map(row => row.file), 'scripts/experimental/diary_audit.js',
            'docs/specs/core/experimental_word_diary_audit.md']) {
            assert.equal(await status(name), 404, name);
        }
        assert.equal(await status('experimental_word_diary.html'), 200);
        assert.equal(await status('experimental_word_island.html'), 200);
    } finally {
        await new Promise(resolve => server.close(resolve));
    }
});
