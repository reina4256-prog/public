'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const { createHash } = require('node:crypto');
const { inventory, audit, localFile, supplementalInventory } = require('../scripts/experimental/diary_audit');
const { createServer } = require('../scripts/experimental/serve');

test('structural reconciliation preserves confirmed scopes and cannot certify semantic reading or completion', () => {
    const report = audit();
    assert.deepEqual(report.errors, []);
    assert.equal(report.structuralOk, true);
    assert.equal(report.counts.confirmedScopes, 51);
    assert.equal(report.counts.visibleSlots, 52);
    assert.equal(report.counts.aoConfirmed, false);
    assert.ok(report.rows.every(row => row.scopeUserConfirmed && !row.runtimeDiaryConnected));
    assert.equal(report.counts.reviewedCaptureBoundaries, 50);
    assert.ok(report.rows.every(row => row.auditSemanticReview === 'capture_boundary_reviewed' && row.reviewRecord));
    assert.ok(report.ownerBoundaries.every(owner => owner.review === 'owner_boundary_reviewed'));
    for (const key of ['eligibleForAoCompletion', 'whole4d12Complete', 'whole4dComplete', 'wholeID4Complete']) {
        assert.equal(report[key], false);
    }
    for (const id of ['historical_reading', 'entry_semantics', 'gesture_questions', 'later_rest_answer', 'ao_feedback_acceptance']) {
        assert.ok(report.ledger.some(issue => issue.id === id));
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

test('ap supplemental ownership is checked without rewriting the fixed ao snapshot or certifying user acceptance', () => {
    const report = audit();
    assert.deepEqual(report.errors, []);
    assert.equal(report.rows.length, 50);
    assert.equal(report.ledger.length, 14);
    assert.equal(report.supplementalOwners.length, 12);
    assert.equal(report.supplementalOwners[0].id, '4d12ap');
    assert.equal(report.supplementalOwners[0].scopeAdopted, true);
    assert.equal(report.supplementalOwners[0].implementationAcceptance, 'not_received');
    assert.equal(report.supplementalOwners[0].runtimeDiaryConnected, false);
    const missing = audit(inventory(), null, []);
    assert.ok(missing.errors.some(e => e.code === 'unassigned_adapter' && e.reference === 'experimental_word_diary_answers.js'));
    assert.ok(missing.errors.some(e => e.code === 'supplemental_inventory_count'));
    const changed = supplementalInventory(); changed[0].arity++;
    assert.ok(audit(inventory(), null, changed).errors.some(e => e.code === 'api_contract' && e.id === '4d12ap'));
});

test('aq supplemental ownership preserves ap and ao while checking follow-up API and registration', () => {
    const report = audit();
    assert.deepEqual(report.errors, []);
    assert.equal(report.supplementalOwners[1].id, '4d12aq');
    assert.equal(report.supplementalOwners[1].scopeAdopted, true);
    assert.equal(report.supplementalOwners[1].implementationAcceptance, 'not_received');
    assert.equal(report.supplementalOwners[1].runtimeDiaryConnected, false);
    const missing = audit(inventory(), null, supplementalInventory().filter(row => row.id !== '4d12aq'));
    assert.ok(missing.errors.some(e => e.code === 'unassigned_adapter' && e.reference === 'experimental_word_diary_followups.js'));
    const changed = supplementalInventory(); changed[1].arity++;
    assert.ok(audit(inventory(), null, changed).errors.some(e => e.code === 'api_contract' && e.id === '4d12aq'));
    assert.equal(report.counts.reviewedCaptureBoundaries, 50); assert.equal(report.ledger.length, 14);
});

test('ar supplemental ownership checks reference journal APIs without replacing ao, ap or aq evidence', () => {
    const report = audit(); assert.deepEqual(report.errors, []);
    assert.equal(report.supplementalOwners[2].id, '4d12ar');
    assert.equal(report.supplementalOwners[2].scopeAdopted, true);
    assert.equal(report.supplementalOwners[2].implementationAcceptance, 'not_received');
    assert.equal(report.counts.reviewedCaptureBoundaries, 50); assert.equal(report.ledger.length, 14);
    const missing = audit(inventory(), null, supplementalInventory().filter(row => row.id !== '4d12ar'));
    assert.ok(missing.errors.some(e => e.code === 'unassigned_adapter' && e.reference === 'experimental_word_diary_references.js'));
    const changed = supplementalInventory(); changed[2].arity++;
    assert.ok(audit(inventory(), null, changed).errors.some(e => e.code === 'api_contract' && e.id === '4d12ar'));
});

test('as supplemental ownership checks separate name-response material without recertifying prior acceptance', () => {
    const report = audit(); assert.deepEqual(report.errors, []);
    assert.equal(report.supplementalOwners[3].id, '4d12as');
    assert.equal(report.supplementalOwners[3].scopeAdopted, true);
    assert.equal(report.supplementalOwners[3].implementationAcceptance, 'not_received');
    assert.equal(report.supplementalOwners[3].runtimeDiaryConnected, false);
    assert.equal(report.counts.reviewedCaptureBoundaries, 50); assert.equal(report.ledger.length, 14);
    const missing = audit(inventory(), null, supplementalInventory().filter(row => row.id !== '4d12as'));
    assert.ok(missing.errors.some(e => e.code === 'unassigned_adapter' && e.reference === 'experimental_word_diary_name_responses.js'));
    const changed = supplementalInventory(); changed[3].arity++;
    assert.ok(audit(inventory(), null, changed).errors.some(e => e.code === 'api_contract' && e.id === '4d12as'));
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

test('a manually reviewed boundary is not transferred to altered adapter ownership or API metadata', () => {
    for (const change of [row => { row.arity += 1; }, row => { row.slug = 'unreviewed'; },
        row => { row.file = 'experimental_word_diary_reports.js'; },
        row => { row.test = 'tests/experimental_word_diary_reports.test.js'; }]) {
        const rows = inventory(), row = rows.find(item => item.id === '4d12g');
        change(row);
        const checked = audit(rows).rows.find(item => item.id === '4d12g');
        assert.equal(checked.scopeUserConfirmed, false);
        assert.equal(checked.auditSemanticReview, 'pending');
        assert.equal(checked.reviewRecord, null);
    }
    assert.equal(audit().rows.find(item => item.id === '4d12g').auditSemanticReview, 'capture_boundary_reviewed');
    assert.equal(audit().whole4d12Complete, false);
});

test('a same-API source change cannot keep an old manual boundary review', () => {
    const report = audit(inventory(), file => {
        const source = fs.readFileSync(localFile(file), 'utf8');
        return file === 'experimental_word_diary_negation_reports.js'
            ? source.replace('return buffer.retain(', 'return false && buffer.retain(') : source;
    });
    assert.equal(report.structuralOk, true);
    const row = report.rows.find(item => item.id === '4d12g');
    assert.equal(row.structuralContractChecked, true);
    assert.equal(row.scopeUserConfirmed, true);
    assert.equal(row.auditSemanticReview, 'pending');
    assert.equal(row.reviewRecord, null);
    assert.equal(row.reviewedSourceCommit, null);
    assert.equal(report.eligibleForAoCompletion, false);
    assert.equal(audit().rows.find(item => item.id === '4d12g').reviewedSourceCommit, 'b260bac');
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

test('an owner change invalidates source reconciliation without revoking confirmed scopes', () => {
    const report = audit(inventory(), file => {
        const source = fs.readFileSync(localFile(file), 'utf8');
        return file === 'experimental_word_learning_core.js'
            ? source.replace("return { intent: 'answer_unknown', action: null }", "return { intent: 'acknowledge', action: null }") : source;
    });
    assert.equal(report.structuralOk, true);
    assert.equal(report.counts.confirmedScopes, 51);
    assert.equal(report.counts.reviewedCaptureBoundaries, 0);
    assert.ok(report.rows.every(row => row.scopeUserConfirmed && row.auditSemanticReview === 'pending'));
    assert.equal(report.ownerBoundaries.find(owner => owner.file === 'experimental_word_learning_core.js').review, 'pending');
    assert.ok(report.unresolved.some(issue => issue.id === 'entry_semantics' && issue.status === 'incomplete'));
    assert.equal(report.eligibleForAoCompletion, false);
});

test('at supplemental ownership checks separate greeting material while preserving previous acceptance snapshots', () => {
    const report = audit();
    assert.equal(report.supplementalOwners[4].id, '4d12at');
    assert.equal(report.supplementalOwners[4].scopeAdopted, true);
    assert.equal(report.supplementalOwners[4].implementationAcceptance, 'not_received');
    assert.equal(report.supplementalOwners[4].runtimeDiaryConnected, false);
    assert.equal(report.counts.confirmedScopes, 51);
    const missing = audit(inventory(), null, supplementalInventory().filter(row => row.id !== '4d12at'));
    assert.ok(missing.errors.some(e => e.code === 'unassigned_adapter' && e.reference === 'experimental_word_diary_greetings.js'));
    const changed = supplementalInventory(); changed[4].arity++;
    assert.ok(audit(inventory(), null, changed).errors.some(e => e.code === 'api_contract' && e.id === '4d12at'));
});

test('au supplemental ownership checks berry testimony without changing prior scope or acceptance snapshots', () => {
    const report = audit();
    assert.equal(report.supplementalOwners[5].id, '4d12au');
    assert.equal(report.supplementalOwners[5].scopeAdopted, true);
    assert.equal(report.supplementalOwners[5].implementationAcceptance, 'not_received');
    assert.equal(report.supplementalOwners[5].runtimeDiaryConnected, false);
    assert.equal(report.counts.confirmedScopes, 51);
    const missing = audit(inventory(), null, supplementalInventory().filter(row => row.id !== '4d12au'));
    assert.ok(missing.errors.some(e => e.code === 'unassigned_adapter' && e.reference === 'experimental_word_diary_berry_reports.js'));
    const changed = supplementalInventory(); changed[5].arity++;
    assert.ok(audit(inventory(), null, changed).errors.some(e => e.code === 'api_contract' && e.id === '4d12au'));
});

test('av supplemental ownership checks rest comfort without promoting condition or acceptance status', () => {
    const report = audit(); assert.deepEqual(report.errors, []);
    assert.equal(report.supplementalOwners[6].id, '4d12av');
    assert.equal(report.supplementalOwners[6].scopeAdopted, true);
    assert.equal(report.supplementalOwners[6].implementationAcceptance, 'not_received');
    assert.equal(report.supplementalOwners[6].runtimeDiaryConnected, false);
    const missing = audit(inventory(), null, supplementalInventory().filter(row => row.id !== '4d12av'));
    assert.ok(missing.errors.some(e => e.code === 'unassigned_adapter' && e.reference === 'experimental_word_diary_rest_comfort_reports.js'));
    const changed = supplementalInventory(); changed[6].arity++;
    assert.ok(audit(inventory(), null, changed).errors.some(e => e.code === 'api_contract' && e.id === '4d12av'));
});

test('aw supplemental ownership checks partial rest value without promoting unresolved importance or acceptance', () => {
    const report = audit(); assert.deepEqual(report.errors, []);
    assert.equal(report.supplementalOwners[7].id, '4d12aw');
    assert.equal(report.supplementalOwners[7].scopeAdopted, true);
    assert.equal(report.supplementalOwners[7].implementationAcceptance, 'not_received');
    assert.equal(report.supplementalOwners[7].runtimeDiaryConnected, false);
    const missing = audit(inventory(), null, supplementalInventory().filter(row => row.id !== '4d12aw'));
    assert.ok(missing.errors.some(e => e.code === 'unassigned_adapter' && e.reference === 'experimental_word_diary_rest_value_reports.js'));
    const changed = supplementalInventory(); changed[7].arity++;
    assert.ok(audit(inventory(), null, changed).errors.some(e => e.code === 'api_contract' && e.id === '4d12aw'));
});

test('ax supplemental ownership checks separate recovery explanation and antecedent materials', () => {
    const report = audit(); assert.deepEqual(report.errors, []);
    assert.equal(report.supplementalOwners[8].id, '4d12ax');
    assert.equal(report.supplementalOwners[8].scopeAdopted, true);
    assert.equal(report.supplementalOwners[8].implementationAcceptance, 'not_received');
    assert.equal(report.supplementalOwners[8].runtimeDiaryConnected, false);
    const missing = audit(inventory(), null, supplementalInventory().filter(row => row.id !== '4d12ax'));
    assert.ok(missing.errors.some(e => e.code === 'unassigned_adapter' && e.reference === 'experimental_word_diary_rest_explanation_reports.js'));
    const changed = supplementalInventory(); changed[8].arity++;
    assert.ok(audit(inventory(), null, changed).errors.some(e => e.code === 'api_contract' && e.id === '4d12ax'));
});

test('ay supplemental ownership checks current desire independently of preferences and refusal actions', () => {
    const report = audit(); assert.deepEqual(report.errors, []);
    assert.equal(report.supplementalOwners[9].id, '4d12ay');
    assert.equal(report.supplementalOwners[9].scopeAdopted, true);
    assert.equal(report.supplementalOwners[9].implementationAcceptance, 'not_received');
    assert.equal(report.supplementalOwners[9].runtimeDiaryConnected, false);
    const missing = audit(inventory(), null, supplementalInventory().filter(row => row.id !== '4d12ay'));
    assert.ok(missing.errors.some(e => e.code === 'unassigned_adapter' && e.reference === 'experimental_word_diary_desire_reports.js'));
    const changed = supplementalInventory(); changed[9].arity++;
    assert.ok(audit(inventory(), null, changed).errors.some(e => e.code === 'api_contract' && e.id === '4d12ay'));
});

test('az supplemental ownership checks preference testimony without merging desire or negated dislike', () => {
    const report = audit(); assert.deepEqual(report.errors, []);
    assert.equal(report.supplementalOwners[10].id, '4d12az');
    assert.equal(report.supplementalOwners[10].scopeAdopted, true);
    assert.equal(report.supplementalOwners[10].implementationAcceptance, 'not_received');
    assert.equal(report.supplementalOwners[10].runtimeDiaryConnected, false);
    const missing = audit(inventory(), null, supplementalInventory().filter(row => row.id !== '4d12az'));
    assert.ok(missing.errors.some(e => e.code === 'unassigned_adapter' && e.reference === 'experimental_word_diary_preference_reports.js'));
    const changed = supplementalInventory(); changed[10].arity++;
    assert.ok(audit(inventory(), null, changed).errors.some(e => e.code === 'api_contract' && e.id === '4d12az'));
});

test('ba supplemental ownership checks negated dislike without merging az or changing the fixed ao snapshot', () => {
    const report = audit(); assert.deepEqual(report.errors, []);
    assert.equal(report.supplementalOwners[11].id, '4d12ba');
    assert.equal(report.supplementalOwners[11].scopeAdopted, true);
    assert.equal(report.supplementalOwners[11].implementationAcceptance, 'not_received');
    assert.equal(report.supplementalOwners[11].runtimeDiaryConnected, false);
    const missing = audit(inventory(), null, supplementalInventory().filter(row => row.id !== '4d12ba'));
    assert.ok(missing.errors.some(e => e.code === 'unassigned_adapter' && e.reference === 'experimental_word_diary_negated_preference_reports.js'));
    const changed = supplementalInventory(); changed[11].arity++;
    assert.ok(audit(inventory(), null, changed).errors.some(e => e.code === 'api_contract' && e.id === '4d12ba'));
});

test('caller edits and repeated audits do not change the inventory or consulted files', () => {
    const references = [...inventory().flatMap(row => [row.file, row.test]),
        ...supplementalInventory().flatMap(row => [row.file, row.test]),
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
    assert.ok(audit().ledger.some(issue => issue.id === 'historical_reading'));
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
        for (const name of [...inventory().map(row => row.file), ...supplementalInventory().map(row => row.file),
            'scripts/experimental/diary_answer_fixtures.js', 'scripts/experimental/diary_answer_smoke.js',
            'scripts/experimental/diary_followup_fixtures.js', 'scripts/experimental/diary_followup_smoke.js', 'scripts/experimental/diary_audit.js',
            'scripts/experimental/diary_reference_fixtures.js', 'scripts/experimental/diary_reference_smoke.js',
            'scripts/experimental/diary_name_response_fixtures.js', 'scripts/experimental/diary_name_response_smoke.js',
            'scripts/experimental/diary_greeting_fixtures.js', 'scripts/experimental/diary_greeting_smoke.js',
            'scripts/experimental/diary_berry_report_fixtures.js', 'scripts/experimental/diary_berry_report_smoke.js',
            'scripts/experimental/diary_rest_comfort_report_fixtures.js', 'scripts/experimental/diary_rest_comfort_report_smoke.js',
            'scripts/experimental/diary_rest_value_report_fixtures.js', 'scripts/experimental/diary_rest_value_report_smoke.js',
            'scripts/experimental/diary_rest_explanation_report_fixtures.js', 'scripts/experimental/diary_rest_explanation_report_smoke.js',
            'scripts/experimental/diary_desire_report_fixtures.js', 'scripts/experimental/diary_desire_report_smoke.js',
            'scripts/experimental/diary_preference_report_fixtures.js', 'scripts/experimental/diary_preference_report_smoke.js',
            'scripts/experimental/diary_negated_preference_report_fixtures.js', 'scripts/experimental/diary_negated_preference_report_smoke.js',
            'docs/specs/core/experimental_word_diary_audit.md']) {
            assert.equal(await status(name), 404, name);
        }
        assert.equal(await status('experimental_word_diary.html'), 200);
        assert.equal(await status('experimental_word_island.html'), 200);
    } finally {
        await new Promise(resolve => server.close(resolve));
    }
});
