'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const { createHash } = require('node:crypto');
const { inventory, audit, localFile, supplementalInventory } = require('../scripts/experimental/diary_audit');

test('bj ownership requires separate incomplete report/time material and three-argument API', () => {
    const report = audit(); assert.deepEqual(report.errors, []);
    const owner = report.supplementalOwners.find(row => row.id === '4d12bj');
    assert.equal(owner.scopeAdopted, true); assert.equal(owner.implementationAcceptance, 'not_received');
    assert.equal(owner.runtimeDiaryConnected, false); assert.equal(owner.arity, 3);
    const missing = audit(inventory(), null, supplementalInventory().filter(row => row.id !== '4d12bj'));
    assert.ok(missing.errors.some(e => e.code === 'unassigned_adapter'));
    const changed = supplementalInventory(); changed.find(row => row.id === '4d12bj').arity++;
    assert.ok(audit(inventory(), null, changed).errors.some(e => e.code === 'api_contract' && e.id === '4d12bj'));
});
const { createServer } = require('../scripts/experimental/serve');

test('incomplete sequential rest proposals keep meal completion and rest decisions unrecorded', () => {
    const report = audit(); assert.deepEqual(report.errors, []);
    const owner = report.supplementalOwners.find(row => row.id === '4d12cs');
    assert.equal(owner.scopeAdopted, true); assert.equal(owner.arity, 3);
    assert.equal(owner.runtimeDiaryConnected, false); assert.equal(owner.implementationAcceptance, 'not_received');
    const missing = audit(inventory(), null, supplementalInventory().filter(row => row.id !== '4d12cs'));
    assert.ok(missing.errors.some(e => e.code === 'unassigned_adapter'
        && e.reference === 'experimental_word_diary_incomplete_sequential_rest_proposals.js'));
    const changed = supplementalInventory(); changed.find(row => row.id === '4d12cs').arity++;
    assert.ok(audit(inventory(), null, changed).errors.some(e => e.code === 'api_contract' && e.id === '4d12cs'));
});

test('incomplete conditional rest proposals keep missing judgment separate from complete conditions', () => {
    const report = audit(); assert.deepEqual(report.errors, []);
    const owner = report.supplementalOwners.find(row => row.id === '4d12cr');
    assert.equal(owner.scopeAdopted, true); assert.equal(owner.arity, 3);
    assert.equal(owner.runtimeDiaryConnected, false); assert.equal(owner.implementationAcceptance, 'not_received');
    const missing = audit(inventory(), null, supplementalInventory().filter(row => row.id !== '4d12cr'));
    assert.ok(missing.errors.some(e => e.code === 'unassigned_adapter'
        && e.reference === 'experimental_word_diary_incomplete_conditional_rest_proposals.js'));
    const changed = supplementalInventory(); changed.find(row => row.id === '4d12cr').arity++;
    assert.ok(audit(inventory(), null, changed).errors.some(e => e.code === 'api_contract' && e.id === '4d12cr'));
});

test('incomplete walk proposals retain their own scope and three-argument journal API', () => {
    const report = audit(); assert.deepEqual(report.errors, []);
    const owner = report.supplementalOwners.find(row => row.id === '4d12cq');
    assert.equal(owner.scopeAdopted, true); assert.equal(owner.arity, 3);
    assert.equal(owner.runtimeDiaryConnected, false); assert.equal(owner.implementationAcceptance, 'not_received');
    const missing = audit(inventory(), null, supplementalInventory().filter(row => row.id !== '4d12cq'));
    assert.ok(missing.errors.some(e => e.code === 'unassigned_adapter'
        && e.reference === 'experimental_word_diary_incomplete_walk_proposals.js'));
    const changed = supplementalInventory(); changed.find(row => row.id === '4d12cq').arity++;
    assert.ok(audit(inventory(), null, changed).errors.some(e => e.code === 'api_contract' && e.id === '4d12cq'));
});

test('incomplete rest proposals retain their own scope and three-argument journal API', () => {
    const report = audit(); assert.deepEqual(report.errors, []);
    const owner = report.supplementalOwners.find(row => row.id === '4d12cp');
    assert.equal(owner.scopeAdopted, true); assert.equal(owner.arity, 3);
    assert.equal(owner.runtimeDiaryConnected, false); assert.equal(owner.implementationAcceptance, 'not_received');
    const missing = audit(inventory(), null, supplementalInventory().filter(row => row.id !== '4d12cp'));
    assert.ok(missing.errors.some(e => e.code === 'unassigned_adapter'
        && e.reference === 'experimental_word_diary_incomplete_rest_proposals.js'));
    const changed = supplementalInventory(); changed.find(row => row.id === '4d12cp').arity++;
    assert.ok(audit(inventory(), null, changed).errors.some(e => e.code === 'api_contract' && e.id === '4d12cp'));
});

test('uncertain context questions keep complete understanding separate from a recorded taste answer', () => {
    const report = audit(); assert.deepEqual(report.errors, []);
    const owner = report.supplementalOwners.find(row => row.id === '4d12co');
    assert.equal(owner.scopeAdopted, true); assert.equal(owner.arity, 3);
    assert.equal(owner.runtimeDiaryConnected, false); assert.equal(owner.implementationAcceptance, 'not_received');
    const missing = audit(inventory(), null, supplementalInventory().filter(row => row.id !== '4d12co'));
    assert.ok(missing.errors.some(e => e.code === 'unassigned_adapter'
        && e.reference === 'experimental_word_diary_uncertain_context_questions.js'));
    const changed = supplementalInventory(); changed.find(row => row.id === '4d12co').arity++;
    assert.ok(audit(inventory(), null, changed).errors.some(e => e.code === 'api_contract' && e.id === '4d12co'));
});

test('gesture repeat questions separate expression, returned answer and API without certifying acceptance', () => {
    const report = audit(); assert.deepEqual(report.errors, []);
    const owner = report.supplementalOwners.find(row => row.id === '4d12cn');
    assert.equal(owner.scopeAdopted, true); assert.equal(owner.arity, 3);
    assert.equal(owner.runtimeDiaryConnected, false); assert.equal(owner.implementationAcceptance, 'not_received');
    const missing = audit(inventory(), null, supplementalInventory().filter(row => row.id !== '4d12cn'));
    assert.ok(missing.errors.some(e => e.code === 'unassigned_adapter'
        && e.reference === 'experimental_word_diary_gesture_repeat_questions.js'));
    const changed = supplementalInventory(); changed.find(row => row.id === '4d12cn').arity++;
    assert.ok(audit(inventory(), null, changed).errors.some(e => e.code === 'api_contract' && e.id === '4d12cn'));
});

test('incomplete repeat questions require their own scope and three-argument API', () => {
    const report = audit(); assert.deepEqual(report.errors, []);
    const owner = report.supplementalOwners.find(row => row.id === '4d12cm');
    assert.equal(owner.scopeAdopted, true); assert.equal(owner.arity, 3);
    assert.equal(owner.runtimeDiaryConnected, false); assert.equal(owner.implementationAcceptance, 'not_received');
    const missing = audit(inventory(), null, supplementalInventory().filter(row => row.id !== '4d12cm'));
    assert.ok(missing.errors.some(e => e.code === 'unassigned_adapter'
        && e.reference === 'experimental_word_diary_incomplete_repeat_questions.js'));
    const changed = supplementalInventory(); changed.find(row => row.id === '4d12cm').arity++;
    assert.ok(audit(inventory(), null, changed).errors.some(e => e.code === 'api_contract' && e.id === '4d12cm'));
});

test('gesture context questions require independent scope and API without certifying acceptance', () => {
    const report = audit(); assert.deepEqual(report.errors, []);
    const owner = report.supplementalOwners.find(row => row.id === '4d12cl');
    assert.equal(owner.scopeAdopted, true); assert.equal(owner.arity, 3);
    assert.equal(owner.runtimeDiaryConnected, false); assert.equal(owner.implementationAcceptance, 'not_received');
    const missing = audit(inventory(), null, supplementalInventory().filter(row => row.id !== '4d12cl'));
    assert.ok(missing.errors.some(e => e.code === 'unassigned_adapter'
        && e.reference === 'experimental_word_diary_gesture_context_questions.js'));
    const changed = supplementalInventory(); changed.find(row => row.id === '4d12cl').arity++;
    assert.ok(audit(inventory(), null, changed).errors.some(e => e.code === 'api_contract' && e.id === '4d12cl'));
});

test('incomplete context questions require their own scope, API and registration', () => {
    const report = audit(); assert.deepEqual(report.errors, []);
    const owner = report.supplementalOwners.find(row => row.id === '4d12ck');
    assert.equal(owner.scopeAdopted, true); assert.equal(owner.arity, 3);
    assert.equal(owner.runtimeDiaryConnected, false); assert.equal(owner.implementationAcceptance, 'not_received');
    const missing = audit(inventory(), null, supplementalInventory().filter(row => row.id !== '4d12ck'));
    assert.ok(missing.errors.some(e => e.code === 'unassigned_adapter'
        && e.reference === 'experimental_word_diary_incomplete_context_questions.js'));
    const changed = supplementalInventory(); changed.find(row => row.id === '4d12ck').arity++;
    assert.ok(audit(inventory(), null, changed).errors.some(e => e.code === 'api_contract' && e.id === '4d12ck'));
});

test('incomplete reason questions retain their own scope and API without certifying acceptance', () => {
    const report = audit(); assert.deepEqual(report.errors, []);
    const owner = report.supplementalOwners.find(row => row.id === '4d12cj');
    assert.equal(owner.scopeAdopted, true); assert.equal(owner.implementationAcceptance, 'not_received');
    assert.equal(owner.runtimeDiaryConnected, false); assert.equal(owner.arity, 3);
    const missing = audit(inventory(), null, supplementalInventory().filter(row => row.id !== '4d12cj'));
    assert.ok(missing.errors.some(e => e.code === 'unassigned_adapter'
        && e.reference === 'experimental_word_diary_incomplete_reason_questions.js'));
    const changed = supplementalInventory(); changed.find(row => row.id === '4d12cj').arity++;
    assert.ok(audit(inventory(), null, changed).errors.some(e => e.code === 'api_contract' && e.id === '4d12cj'));
});

test('gesture reason questions retain a separate owner without certifying runtime or acceptance', () => {
    const report = audit(); assert.deepEqual(report.errors, []);
    const owner = report.supplementalOwners.find(row => row.id === '4d12ci');
    assert.equal(owner.scopeAdopted, true); assert.equal(owner.implementationAcceptance, 'not_received');
    assert.equal(owner.runtimeDiaryConnected, false); assert.equal(owner.arity, 3);
    const missing = audit(inventory(), null, supplementalInventory().filter(row => row.id !== '4d12ci'));
    assert.ok(missing.errors.some(e => e.code === 'unassigned_adapter'
        && e.reference === 'experimental_word_diary_gesture_reason_questions.js'));
    const changed = supplementalInventory(); changed.find(row => row.id === '4d12ci').arity++;
    assert.ok(audit(inventory(), null, changed).errors.some(e => e.code === 'api_contract' && e.id === '4d12ci'));
});

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

test('cv supplemental ownership preserves player reports, incomplete reports and the fixed ao snapshot', () => {
    const report = audit(); assert.deepEqual(report.errors, []);
    const owner = report.supplementalOwners.find(row => row.id === '4d12cv');
    assert.equal(owner.file, 'experimental_word_diary_complete_other_speaker_activity_reports.js');
    assert.equal(owner.arity, 3); assert.equal(owner.scopeAdopted, true);
    assert.equal(owner.implementationAcceptance, 'not_received'); assert.equal(owner.runtimeDiaryConnected, false);
    assert.equal(report.rows.length, 50); assert.equal(report.ledger.length, 14);
    const missing = audit(inventory(), null, supplementalInventory().filter(row => row.id !== '4d12cv'));
    assert.ok(missing.errors.some(e => e.code === 'unassigned_adapter' && e.reference === owner.file));
});

test('cw observation ownership preserves self-answer and completion boundaries', () => {
    const report = audit(); assert.deepEqual(report.errors, []);
    const owner = report.supplementalOwners.find(row => row.id === '4d12cw');
    assert.equal(owner.file, 'experimental_word_diary_work_observation_questions.js');
    assert.equal(owner.arity, 3); assert.equal(owner.scopeAdopted, true);
    assert.equal(owner.implementationAcceptance, 'not_received'); assert.equal(owner.runtimeDiaryConnected, false);
    assert.equal(report.rows.length, 50); assert.equal(report.ledger.length, 14);
    const missing = audit(inventory(), null, supplementalInventory().filter(row => row.id !== '4d12cw'));
    assert.ok(missing.errors.some(e => e.code === 'unassigned_adapter' && e.reference === owner.file));
});

test('cx ownership keeps complete other-speaker proposals separate without scope transfer', () => {
    const report = audit(); assert.deepEqual(report.errors, []);
    const owner = report.supplementalOwners.find(row => row.id === '4d12cx');
    assert.equal(owner.file, 'experimental_word_diary_complete_other_speaker_proposals.js');
    assert.equal(owner.arity, 3); assert.equal(owner.scopeAdopted, true);
    assert.equal(owner.implementationAcceptance, 'not_received'); assert.equal(owner.runtimeDiaryConnected, false);
    assert.equal(report.rows.length, 50); assert.equal(report.ledger.length, 14);
    const missing = audit(inventory(), null, supplementalInventory().filter(row => row.id !== '4d12cx'));
    assert.ok(missing.errors.some(e => e.code === 'unassigned_adapter' && e.reference === owner.file));
});

test('cy ownership preserves generic conditional requests without inventing condition judgments', () => {
    const report = audit(); assert.deepEqual(report.errors, []);
    const owner = report.supplementalOwners.find(row => row.id === '4d12cy');
    assert.equal(owner.file, 'experimental_word_diary_generic_conditional_rest_requests.js');
    assert.equal(owner.arity, 3); assert.equal(owner.scopeAdopted, true);
    assert.equal(owner.implementationAcceptance, 'not_received'); assert.equal(owner.runtimeDiaryConnected, false);
    const missing = audit(inventory(), null, supplementalInventory().filter(row => row.id !== '4d12cy'));
    assert.ok(missing.errors.some(e => e.code === 'unassigned_adapter' && e.reference === owner.file));
    const changed = supplementalInventory(); changed.find(row => row.id === '4d12cy').arity++;
    assert.ok(audit(inventory(), null, changed).errors.some(e => e.code === 'api_contract' && e.id === '4d12cy'));
});

test('cz ownership preserves other-speaker conditional judgments without scope transfer', () => {
    const report = audit(); assert.deepEqual(report.errors, []);
    const owner = report.supplementalOwners.find(row => row.id === '4d12cz');
    assert.equal(owner.file, 'experimental_word_diary_complete_other_speaker_conditional_rest_proposals.js');
    assert.equal(owner.arity, 3); assert.equal(owner.scopeAdopted, true);
    assert.equal(owner.implementationAcceptance, 'not_received'); assert.equal(owner.runtimeDiaryConnected, false);
    const missing = audit(inventory(), null, supplementalInventory().filter(row => row.id !== '4d12cz'));
    assert.ok(missing.errors.some(e => e.code === 'unassigned_adapter' && e.reference === owner.file));
    const changed = supplementalInventory(); changed.find(row => row.id === '4d12cz').arity++;
    assert.ok(audit(inventory(), null, changed).errors.some(e => e.code === 'api_contract' && e.id === '4d12cz'));
});

test('da ownership retains whole incomplete hearings without promoting associations to comprehension', () => {
    const report = audit(); assert.deepEqual(report.errors, []);
    const owner = report.supplementalOwners.find(row => row.id === '4d12da');
    assert.equal(owner.file, 'experimental_word_diary_clause_scope_rest_requests.js');
    assert.equal(owner.arity, 3); assert.equal(owner.scopeAdopted, true);
    assert.equal(owner.implementationAcceptance, 'not_received'); assert.equal(owner.runtimeDiaryConnected, false);
    const missing = audit(inventory(), null, supplementalInventory().filter(row => row.id !== '4d12da'));
    assert.ok(missing.errors.some(e => e.code === 'unassigned_adapter' && e.reference === owner.file));
    const changed = supplementalInventory(); changed.find(row => row.id === '4d12da').arity++;
    assert.ok(audit(inventory(), null, changed).errors.some(e => e.code === 'api_contract' && e.id === '4d12da'));
});

test('db ownership preserves two incomplete proposals without inventing an action sequence', () => {
    const report = audit(); assert.deepEqual(report.errors, []);
    const owner = report.supplementalOwners.find(row => row.id === '4d12db');
    assert.equal(owner.file, 'experimental_word_diary_rest_and_walk_clause_proposals.js');
    assert.equal(owner.arity, 3); assert.equal(owner.scopeAdopted, true);
    assert.equal(owner.implementationAcceptance, 'not_received'); assert.equal(owner.runtimeDiaryConnected, false);
    const missing = audit(inventory(), null, supplementalInventory().filter(row => row.id !== '4d12db'));
    assert.ok(missing.errors.some(e => e.code === 'unassigned_adapter' && e.reference === owner.file));
    const changed = supplementalInventory(); changed.find(row => row.id === '4d12db').arity++;
    assert.ok(audit(inventory(), null, changed).errors.some(e => e.code === 'api_contract' && e.id === '4d12db'));
});

test('dc ownership preserves same-kind clauses without merging hearings or inventing repetition effects', () => {
    const report = audit(); assert.deepEqual(report.errors, []);
    const owner = report.supplementalOwners.find(row => row.id === '4d12dc');
    assert.equal(owner.file, 'experimental_word_diary_same_kind_clause_proposals.js');
    assert.equal(owner.arity, 3); assert.equal(owner.scopeAdopted, true);
    assert.equal(owner.implementationAcceptance, 'not_received'); assert.equal(owner.runtimeDiaryConnected, false);
    const missing = audit(inventory(), null, supplementalInventory().filter(row => row.id !== '4d12dc'));
    assert.ok(missing.errors.some(e => e.code === 'unassigned_adapter' && e.reference === owner.file));
    const changed = supplementalInventory(); changed.find(row => row.id === '4d12dc').arity++;
    assert.ok(audit(inventory(), null, changed).errors.some(e => e.code === 'api_contract' && e.id === '4d12dc'));
});

test('dd ownership retains unresolved condition scope separately from normal proposal clauses', () => {
    const report = audit(); assert.deepEqual(report.errors, []);
    const owner = report.supplementalOwners.find(row => row.id === '4d12dd');
    assert.equal(owner.file, 'experimental_word_diary_conditional_and_normal_clause_proposals.js');
    assert.equal(owner.arity, 3); assert.equal(owner.scopeAdopted, true);
    assert.equal(owner.implementationAcceptance, 'not_received'); assert.equal(owner.runtimeDiaryConnected, false);
    const missing = audit(inventory(), null, supplementalInventory().filter(row => row.id !== '4d12dd'));
    assert.ok(missing.errors.some(e => e.code === 'unassigned_adapter' && e.reference === owner.file));
    const changed = supplementalInventory(); changed.find(row => row.id === '4d12dd').arity++;
    assert.ok(audit(inventory(), null, changed).errors.some(e => e.code === 'api_contract' && e.id === '4d12dd'));
});

test('de ownership retains per-clause source material without learning or response promotion', () => {
    const report = audit(); assert.deepEqual(report.errors, []);
    const owner = report.supplementalOwners.find(row => row.id === '4d12de');
    assert.equal(owner.file, 'experimental_word_diary_remaining_clause_materials.js');
    assert.equal(owner.arity, 3); assert.equal(owner.scopeAdopted, true);
    assert.equal(owner.implementationAcceptance, 'not_received'); assert.equal(owner.runtimeDiaryConnected, false);
    const missing = audit(inventory(), null, supplementalInventory().filter(row => row.id !== '4d12de'));
    assert.ok(missing.errors.some(e => e.code === 'unassigned_adapter' && e.reference === owner.file));
    const changed = supplementalInventory(); changed.find(row => row.id === '4d12de').arity++;
    assert.ok(audit(inventory(), null, changed).errors.some(e => e.code === 'api_contract' && e.id === '4d12de'));
});

test('df ownership requires original preceding rest material without promoting multi-clause answers', () => {
    const report = audit(); assert.deepEqual(report.errors, []);
    const owner = report.supplementalOwners.find(row => row.id === '4d12df');
    assert.equal(owner.file, 'experimental_word_diary_additional_clause_materials.js');
    assert.equal(owner.arity, 3); assert.equal(owner.scopeAdopted, true);
    assert.equal(owner.implementationAcceptance, 'not_received'); assert.equal(owner.runtimeDiaryConnected, false);
    const missing = audit(inventory(), null, supplementalInventory().filter(row => row.id !== '4d12df'));
    assert.ok(missing.errors.some(e => e.code === 'unassigned_adapter' && e.reference === owner.file));
    const changed = supplementalInventory(); changed.find(row => row.id === '4d12df').arity++;
    assert.ok(audit(inventory(), null, changed).errors.some(e => e.code === 'api_contract' && e.id === '4d12df'));
});

test('dg ownership keeps incomplete and multiple-clause greetings separate from complete single greetings', () => {
    const report = audit(); assert.deepEqual(report.errors, []);
    const owner = report.supplementalOwners.find(row => row.id === '4d12dg');
    assert.equal(owner.file, 'experimental_word_diary_greeting_materials.js');
    assert.equal(owner.arity, 3); assert.equal(owner.scopeAdopted, true);
    assert.equal(owner.implementationAcceptance, 'not_received'); assert.equal(owner.runtimeDiaryConnected, false);
    const missing = audit(inventory(), null, supplementalInventory().filter(row => row.id !== '4d12dg'));
    assert.ok(missing.errors.some(e => e.code === 'unassigned_adapter' && e.reference === owner.file));
    const changed = supplementalInventory(); changed.find(row => row.id === '4d12dg').arity++;
    assert.ok(audit(inventory(), null, changed).errors.some(e => e.code === 'api_contract' && e.id === '4d12dg'));
});

test('ap supplemental ownership is checked without rewriting the fixed ao snapshot or certifying user acceptance', () => {
    const report = audit();
    assert.deepEqual(report.errors, []);
    assert.equal(report.rows.length, 50);
    assert.equal(report.ledger.length, 14);
assert.equal(report.supplementalOwners.length, 70);
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

test('bb supplemental ownership keeps negative requests separate from compliance and fixed ao', () => {
    const report = audit(); assert.deepEqual(report.errors, []);
    assert.equal(report.supplementalOwners[12].id, '4d12bb');
    assert.equal(report.supplementalOwners[12].scopeAdopted, true);
    assert.equal(report.supplementalOwners[12].implementationAcceptance, 'not_received');
    assert.equal(report.supplementalOwners[12].runtimeDiaryConnected, false);
    const missing = audit(inventory(), null, supplementalInventory().filter(row => row.id !== '4d12bb'));
    assert.ok(missing.errors.some(e => e.code === 'unassigned_adapter' && e.reference === 'experimental_word_diary_negated_requests.js'));
    const changed = supplementalInventory(); changed[12].arity++;
    assert.ok(audit(inventory(), null, changed).errors.some(e => e.code === 'api_contract' && e.id === '4d12bb'));
});

test('bc supplemental ownership keeps after eating invitations separate from condition and action decisions', () => {
    const report = audit(); assert.deepEqual(report.errors, []);
    assert.equal(report.supplementalOwners[13].id, '4d12bc');
    assert.equal(report.supplementalOwners[13].scopeAdopted, true);
    assert.equal(report.supplementalOwners[13].implementationAcceptance, 'not_received');
    assert.equal(report.supplementalOwners[13].runtimeDiaryConnected, false);
    const missing = audit(inventory(), null, supplementalInventory().filter(row => row.id !== '4d12bc'));
    assert.ok(missing.errors.some(e => e.code === 'unassigned_adapter' && e.reference === 'experimental_word_diary_after_eat_walk_proposals.js'));
    const changed = supplementalInventory(); changed[13].arity++;
    assert.ok(audit(inventory(), null, changed).errors.some(e => e.code === 'api_contract' && e.id === '4d12bc'));
});

test('bd supplemental ownership checks name question response journal without inventing turn answers', () => {
    const report = audit(); assert.deepEqual(report.errors, []);
    assert.equal(report.supplementalOwners[14].id, '4d12bd');
    assert.equal(report.supplementalOwners[14].scopeAdopted, true);
    assert.equal(report.supplementalOwners[14].implementationAcceptance, 'not_received');
    assert.equal(report.supplementalOwners[14].runtimeDiaryConnected, false);
    const missing = audit(inventory(), null, supplementalInventory().filter(row => row.id !== '4d12bd'));
    assert.ok(missing.errors.some(e => e.code === 'unassigned_adapter' && e.reference === 'experimental_word_diary_name_questions.js'));
    const changed = supplementalInventory(); changed[14].arity++;
    assert.ok(audit(inventory(), null, changed).errors.some(e => e.code === 'api_contract' && e.id === '4d12bd'));
});

test('bf supplemental ownership preserves general feeling contrast boundaries and prior acceptance snapshots', () => {
    const report = audit();
    assert.equal(report.supplementalOwners[16].id, '4d12bf');
    assert.equal(report.supplementalOwners[16].scopeAdopted, true);
    assert.equal(report.supplementalOwners[16].implementationAcceptance, 'not_received');
    assert.equal(report.supplementalOwners[16].runtimeDiaryConnected, false);
    const missing = audit(inventory(), null, supplementalInventory().filter(row => row.id !== '4d12bf'));
    assert.ok(missing.errors.some(e => e.code === 'unassigned_adapter' && e.reference === 'experimental_word_diary_general_feeling_contrasts.js'));
    const changed = supplementalInventory(); changed[16].arity++;
    assert.ok(audit(inventory(), null, changed).errors.some(e => e.code === 'api_contract' && e.id === '4d12bf'));
});
test('bg supplemental ownership separates meaning-only partial pairs from complete bf reports', () => {
    const report = audit(); assert.deepEqual(report.errors, []);
    assert.equal(report.supplementalOwners[17].id, '4d12bg');
    assert.equal(report.supplementalOwners[17].scopeAdopted, true);
    assert.equal(report.supplementalOwners[17].implementationAcceptance, 'not_received');
    assert.equal(report.supplementalOwners[17].runtimeDiaryConnected, false);
    const missing = audit(inventory(), null, supplementalInventory().filter(row => row.id !== '4d12bg'));
    assert.ok(missing.errors.some(e => e.code === 'unassigned_adapter' && e.reference === 'experimental_word_diary_partial_feeling_contrasts.js'));
    const changed = supplementalInventory(); changed[17].arity++;
    assert.ok(audit(inventory(), null, changed).errors.some(e => e.code === 'api_contract' && e.id === '4d12bg'));
});
test('be supplemental ownership preserves partial sour questions and fixed prior acceptance snapshots', () => {
    const report = audit(); assert.deepEqual(report.errors, []);
    assert.equal(report.supplementalOwners[15].id, '4d12be');
    assert.equal(report.supplementalOwners[15].scopeAdopted, true);
    assert.equal(report.supplementalOwners[15].implementationAcceptance, 'not_received');
    assert.equal(report.supplementalOwners[15].runtimeDiaryConnected, false);
    const missing = audit(inventory(), null, supplementalInventory().filter(row => row.id !== '4d12be'));
    assert.ok(missing.errors.some(e => e.code === 'unassigned_adapter' && e.reference === 'experimental_word_diary_sour_questions.js'));
    const changed = supplementalInventory(); changed[15].arity++;
    assert.ok(audit(inventory(), null, changed).errors.some(e => e.code === 'api_contract' && e.id === '4d12be'));
});

test('bh supplemental ownership preserves contrast-only partial material without synthesizing report sources', () => {
    const report = audit(); assert.deepEqual(report.errors, []);
    assert.equal(report.supplementalOwners[18].id, '4d12bh');
    assert.equal(report.supplementalOwners[18].scopeAdopted, true);
    assert.equal(report.supplementalOwners[18].implementationAcceptance, 'not_received');
    assert.equal(report.supplementalOwners[18].runtimeDiaryConnected, false);
    const missing = audit(inventory(), null, supplementalInventory().filter(row => row.id !== '4d12bh'));
    assert.ok(missing.errors.some(e => e.code === 'unassigned_adapter' && e.reference === 'experimental_word_diary_unresolved_feeling_contrasts.js'));
    const changed = supplementalInventory(); changed[18].arity++;
    assert.ok(audit(inventory(), null, changed).errors.some(e => e.code === 'api_contract' && e.id === '4d12bh'));
});

test('bi supplemental ownership separates mixed unknown meanings and contrast', () => {
    const report = audit(); assert.deepEqual(report.errors, []);
    assert.equal(report.supplementalOwners[19].id, '4d12bi');
    assert.equal(report.supplementalOwners[19].scopeAdopted, true);
    assert.equal(report.supplementalOwners[19].implementationAcceptance, 'not_received');
    assert.equal(report.supplementalOwners[19].runtimeDiaryConnected, false);
    const missing = audit(inventory(), null, supplementalInventory().filter(row => row.id !== '4d12bi'));
    assert.ok(missing.errors.some(e => e.code === 'unassigned_adapter' && e.reference === 'experimental_word_diary_mixed_feeling_contrasts.js'));
    const changed = supplementalInventory(); changed[19].arity++;
    assert.ok(audit(inventory(), null, changed).errors.some(e => e.code === 'api_contract' && e.id === '4d12bi'));
});

test('bk supplemental ownership preserves unresolved event details and separates existing owners', () => {
    const report = audit(); assert.deepEqual(report.errors, []);
    assert.equal(report.supplementalOwners[21].id, '4d12bk');
    assert.equal(report.supplementalOwners[21].scopeAdopted, true);
    assert.equal(report.supplementalOwners[21].implementationAcceptance, 'not_received');
    assert.equal(report.supplementalOwners[21].runtimeDiaryConnected, false);
    const missing = audit(inventory(), null, supplementalInventory().filter(row => row.id !== '4d12bk'));
    assert.ok(missing.errors.some(e => e.code === 'unassigned_adapter' && e.reference === 'experimental_word_diary_event_feeling_contrasts.js'));
    const changed = supplementalInventory(); changed[21].arity++;
    assert.ok(audit(inventory(), null, changed).errors.some(e => e.code === 'api_contract' && e.id === '4d12bk'));
});

test('bl ownership separates incomplete event pairs and preserves the original audit boundary', () => {
    const report = audit(); assert.deepEqual(report.errors, []);
    const owner = report.supplementalOwners.find(row => row.id === '4d12bl');
    assert.equal(owner.scopeAdopted, true); assert.equal(owner.implementationAcceptance, 'not_received');
    assert.equal(owner.runtimeDiaryConnected, false); assert.equal(owner.arity, 3);
    const missing = audit(inventory(), null, supplementalInventory().filter(row => row.id !== '4d12bl'));
    assert.ok(missing.errors.some(e => e.code === 'unassigned_adapter'
        && e.reference === 'experimental_word_diary_incomplete_event_feeling_contrasts.js'));
    const changed = supplementalInventory(); changed.find(row => row.id === '4d12bl').arity++;
    assert.ok(audit(inventory(), null, changed).errors.some(e => e.code === 'api_contract' && e.id === '4d12bl'));
});

test('bm ownership preserves external-event pairs and rejects a missing or changed API', () => {
    const report = audit(); assert.deepEqual(report.errors, []);
    const owner = report.supplementalOwners.find(row => row.id === '4d12bm');
    assert.equal(owner.scopeAdopted, true); assert.equal(owner.implementationAcceptance, 'not_received');
    assert.equal(owner.runtimeDiaryConnected, false); assert.equal(owner.arity, 3);
    const missing = audit(inventory(), null, supplementalInventory().filter(row => row.id !== '4d12bm'));
    assert.ok(missing.errors.some(e => e.code === 'unassigned_adapter'
        && e.reference === 'experimental_word_diary_external_event_contrasts.js'));
    const changed = supplementalInventory(); changed.find(row => row.id === '4d12bm').arity++;
    assert.ok(audit(inventory(), null, changed).errors.some(e => e.code === 'api_contract' && e.id === '4d12bm'));
});

test('bn ownership preserves incomplete berry material and rejects a missing or changed API', () => {
    const report = audit(); assert.deepEqual(report.errors, []);
    const owner = report.supplementalOwners.find(row => row.id === '4d12bn');
    assert.equal(owner.scopeAdopted, true); assert.equal(owner.implementationAcceptance, 'not_received');
    assert.equal(owner.runtimeDiaryConnected, false); assert.equal(owner.arity, 3);
    const missing = audit(inventory(), null, supplementalInventory().filter(row => row.id !== '4d12bn'));
    assert.ok(missing.errors.some(e => e.code === 'unassigned_adapter'
        && e.reference === 'experimental_word_diary_incomplete_berry_reports.js'));
    const changed = supplementalInventory(); changed.find(row => row.id === '4d12bn').arity++;
    assert.ok(audit(inventory(), null, changed).errors.some(e => e.code === 'api_contract' && e.id === '4d12bn'));
});

test('bo ownership preserves incomplete rest comfort material and rejects a missing or changed API', () => {
    const report = audit(); assert.deepEqual(report.errors, []);
    const owner = report.supplementalOwners.find(row => row.id === '4d12bo');
    assert.equal(owner.scopeAdopted, true); assert.equal(owner.implementationAcceptance, 'not_received');
    assert.equal(owner.runtimeDiaryConnected, false); assert.equal(owner.arity, 3);
    const missing = audit(inventory(), null, supplementalInventory().filter(row => row.id !== '4d12bo'));
    assert.ok(missing.errors.some(e => e.code === 'unassigned_adapter'
        && e.reference === 'experimental_word_diary_incomplete_rest_comfort_reports.js'));
    const changed = supplementalInventory(); changed.find(row => row.id === '4d12bo').arity++;
    assert.ok(audit(inventory(), null, changed).errors.some(e => e.code === 'api_contract' && e.id === '4d12bo'));
});

test('bp ownership preserves incomplete rest value material and rejects a missing or changed API', () => {
    const report = audit(); assert.deepEqual(report.errors, []);
    const owner = report.supplementalOwners.find(row => row.id === '4d12bp');
    assert.equal(owner.scopeAdopted, true); assert.equal(owner.implementationAcceptance, 'not_received');
    assert.equal(owner.runtimeDiaryConnected, false); assert.equal(owner.arity, 3);
    const missing = audit(inventory(), null, supplementalInventory().filter(row => row.id !== '4d12bp'));
    assert.ok(missing.errors.some(e => e.code === 'unassigned_adapter'
        && e.reference === 'experimental_word_diary_incomplete_rest_value_reports.js'));
    const changed = supplementalInventory(); changed.find(row => row.id === '4d12bp').arity++;
    assert.ok(audit(inventory(), null, changed).errors.some(e => e.code === 'api_contract' && e.id === '4d12bp'));
});

test('bq ownership preserves incomplete recovery explanation material and requires its own three-argument API', () => {
    const report = audit(); assert.deepEqual(report.errors, []);
    const owner = report.supplementalOwners.find(row => row.id === '4d12bq');
    assert.equal(owner.scopeAdopted, true); assert.equal(owner.implementationAcceptance, 'not_received');
    assert.equal(owner.runtimeDiaryConnected, false); assert.equal(owner.arity, 3);
    const missing = audit(inventory(), null, supplementalInventory().filter(row => row.id !== '4d12bq'));
    assert.ok(missing.errors.some(e => e.code === 'unassigned_adapter'
        && e.reference === 'experimental_word_diary_incomplete_rest_explanation_reports.js'));
    const changed = supplementalInventory(); changed.find(row => row.id === '4d12bq').arity++;
    assert.ok(audit(inventory(), null, changed).errors.some(e => e.code === 'api_contract' && e.id === '4d12bq'));
});

test('incomplete desire material has a separate adopted three-argument boundary', () => {
    const report = audit(); assert.deepEqual(report.errors, []);
    const owner = report.supplementalOwners.find(row => row.id === '4d12br');
    assert.equal(owner.scopeAdopted, true); assert.equal(owner.implementationAcceptance, 'not_received');
    assert.equal(owner.runtimeDiaryConnected, false); assert.equal(owner.arity, 3);
    const missing = audit(inventory(), null, supplementalInventory().filter(row => row.id !== '4d12br'));
    assert.ok(missing.errors.some(e => e.code === 'unassigned_adapter'
        && e.reference === 'experimental_word_diary_incomplete_desire_reports.js'));
    const changed = supplementalInventory(); changed.find(row => row.id === '4d12br').arity++;
    assert.ok(audit(inventory(), null, changed).errors.some(e => e.code === 'api_contract' && e.id === '4d12br'));
});

test('incomplete preference material has a separate adopted three-argument boundary', () => {
    const report = audit(); assert.deepEqual(report.errors, []);
    const owner = report.supplementalOwners.find(row => row.id === '4d12bs');
    assert.equal(owner.scopeAdopted, true); assert.equal(owner.implementationAcceptance, 'not_received');
    assert.equal(owner.runtimeDiaryConnected, false); assert.equal(owner.arity, 3);
    const missing = audit(inventory(), null, supplementalInventory().filter(row => row.id !== '4d12bs'));
    assert.ok(missing.errors.some(e => e.code === 'unassigned_adapter'
        && e.reference === 'experimental_word_diary_incomplete_preference_reports.js'));
    const changed = supplementalInventory(); changed.find(row => row.id === '4d12bs').arity++;
    assert.ok(audit(inventory(), null, changed).errors.some(e => e.code === 'api_contract' && e.id === '4d12bs'));
});

test('incomplete negated preference material has a separate adopted three-argument boundary', () => {
    const report = audit(); assert.deepEqual(report.errors, []);
    const owner = report.supplementalOwners.find(row => row.id === '4d12bt');
    assert.equal(owner.scopeAdopted, true); assert.equal(owner.implementationAcceptance, 'not_received');
    assert.equal(owner.runtimeDiaryConnected, false); assert.equal(owner.arity, 3);
    const missing = audit(inventory(), null, supplementalInventory().filter(row => row.id !== '4d12bt'));
    assert.ok(missing.errors.some(e => e.code === 'unassigned_adapter'
        && e.reference === 'experimental_word_diary_incomplete_negated_preference_reports.js'));
    const changed = supplementalInventory(); changed.find(row => row.id === '4d12bt').arity++;
    assert.ok(audit(inventory(), null, changed).errors.some(e => e.code === 'api_contract' && e.id === '4d12bt'));
});

test('incomplete negated request material has a separate adopted three-argument boundary', () => {
    const report = audit(); assert.deepEqual(report.errors, []);
    const owner = report.supplementalOwners.find(row => row.id === '4d12bu');
    assert.equal(owner.scopeAdopted, true); assert.equal(owner.implementationAcceptance, 'not_received');
    assert.equal(owner.runtimeDiaryConnected, false); assert.equal(owner.arity, 3);
    const missing = audit(inventory(), null, supplementalInventory().filter(row => row.id !== '4d12bu'));
    assert.ok(missing.errors.some(e => e.code === 'unassigned_adapter'
        && e.reference === 'experimental_word_diary_incomplete_negated_requests.js'));
    const changed = supplementalInventory(); changed.find(row => row.id === '4d12bu').arity++;
    assert.ok(audit(inventory(), null, changed).errors.some(e => e.code === 'api_contract' && e.id === '4d12bu'));
});

test('incomplete after eating walk invitation has a separate adopted boundary', () => {
    const report = audit(); assert.deepEqual(report.errors, []);
    const owner = report.supplementalOwners.find(row => row.id === '4d12bv');
    assert.equal(owner.scopeAdopted, true); assert.equal(owner.implementationAcceptance, 'not_received');
    assert.equal(owner.runtimeDiaryConnected, false); assert.equal(owner.arity, 3);
    const missing = audit(inventory(), null, supplementalInventory().filter(row => row.id !== '4d12bv'));
    assert.ok(missing.errors.some(e => e.code === 'unassigned_adapter'
        && e.reference === 'experimental_word_diary_incomplete_after_eat_walk_proposals.js'));
    const changed = supplementalInventory(); changed.find(row => row.id === '4d12bv').arity++;
    assert.ok(audit(inventory(), null, changed).errors.some(e => e.code === 'api_contract' && e.id === '4d12bv'));
});

test('target-only negated requests have separate ownership without recertifying prior acceptance', () => {
    const report = audit(); assert.deepEqual(report.errors, []);
    const owner = report.supplementalOwners.find(row => row.id === '4d12bw');
    assert.equal(owner.scopeAdopted, true); assert.equal(owner.implementationAcceptance, 'not_received');
    assert.equal(owner.runtimeDiaryConnected, false); assert.equal(owner.arity, 3);
    const missing = audit(inventory(), null, supplementalInventory().filter(row => row.id !== '4d12bw'));
    assert.ok(missing.errors.some(e => e.code === 'unassigned_adapter'
        && e.reference === 'experimental_word_diary_unresolved_negated_request_targets.js'));
    const changed = supplementalInventory(); changed.find(row => row.id === '4d12bw').arity++;
    assert.ok(audit(inventory(), null, changed).errors.some(e => e.code === 'api_contract' && e.id === '4d12bw'));
});

test('target-only preference reports have separate ownership without recertifying prior acceptance', () => {
    const report = audit(); assert.deepEqual(report.errors, []);
    const owner = report.supplementalOwners.find(row => row.id === '4d12bx');
    assert.equal(owner.scopeAdopted, true); assert.equal(owner.implementationAcceptance, 'not_received');
    assert.equal(owner.runtimeDiaryConnected, false); assert.equal(owner.arity, 3);
    const missing = audit(inventory(), null, supplementalInventory().filter(row => row.id !== '4d12bx'));
    assert.ok(missing.errors.some(e => e.code === 'unassigned_adapter'
        && e.reference === 'experimental_word_diary_unresolved_preference_targets.js'));
    const changed = supplementalInventory(); changed.find(row => row.id === '4d12bx').arity++;
    assert.ok(audit(inventory(), null, changed).errors.some(e => e.code === 'api_contract' && e.id === '4d12bx'));
});

test('unresolved negated preference targets retain an independent three-argument owner', () => {
    const report = audit(); assert.deepEqual(report.errors, []);
    const owner = report.supplementalOwners.find(row => row.id === '4d12by');
    assert.equal(owner.scopeAdopted, true); assert.equal(owner.implementationAcceptance, 'not_received');
    assert.equal(owner.runtimeDiaryConnected, false); assert.equal(owner.arity, 3);
    const missing = audit(inventory(), null, supplementalInventory().filter(row => row.id !== '4d12by'));
    assert.ok(missing.errors.some(e => e.code === 'unassigned_adapter'
        && e.reference === 'experimental_word_diary_unresolved_negated_preference_targets.js'));
    const changed = supplementalInventory(); changed.find(row => row.id === '4d12by').arity++;
    assert.ok(audit(inventory(), null, changed).errors.some(e => e.code === 'api_contract' && e.id === '4d12by'));
});

test('incomplete name questions retain an independent three-argument owner', () => {
    const report = audit(); assert.deepEqual(report.errors, []);
    const owner = report.supplementalOwners.find(row => row.id === '4d12bz');
    assert.equal(owner.scopeAdopted, true); assert.equal(owner.implementationAcceptance, 'not_received');
    assert.equal(owner.runtimeDiaryConnected, false); assert.equal(owner.arity, 3);
    const missing = audit(inventory(), null, supplementalInventory().filter(row => row.id !== '4d12bz'));
    assert.ok(missing.errors.some(e => e.code === 'unassigned_adapter'
        && e.reference === 'experimental_word_diary_incomplete_name_questions.js'));
    const changed = supplementalInventory(); changed.find(row => row.id === '4d12bz').arity++;
    assert.ok(audit(inventory(), null, changed).errors.some(e => e.code === 'api_contract' && e.id === '4d12bz'));
});

test('unresolved name targets retain an independent three-argument owner', () => {
    const report = audit(); assert.deepEqual(report.errors, []);
    const owner = report.supplementalOwners.find(row => row.id === '4d12ca');
    assert.equal(owner.scopeAdopted, true); assert.equal(owner.implementationAcceptance, 'not_received');
    assert.equal(owner.runtimeDiaryConnected, false); assert.equal(owner.arity, 3);
    const missing = audit(inventory(), null, supplementalInventory().filter(row => row.id !== '4d12ca'));
    assert.ok(missing.errors.some(e => e.code === 'unassigned_adapter'
        && e.reference === 'experimental_word_diary_unresolved_name_targets.js'));
    const changed = supplementalInventory(); changed.find(row => row.id === '4d12ca').arity++;
    assert.ok(audit(inventory(), null, changed).errors.some(e => e.code === 'api_contract' && e.id === '4d12ca'));
});

test('incomplete sour questions retain an independent three-argument owner', () => {
    const report = audit(); assert.deepEqual(report.errors, []);
    const owner = report.supplementalOwners.find(row => row.id === '4d12cb');
    assert.equal(owner.scopeAdopted, true); assert.equal(owner.implementationAcceptance, 'not_received');
    assert.equal(owner.runtimeDiaryConnected, false); assert.equal(owner.arity, 3);
    const missing = audit(inventory(), null, supplementalInventory().filter(row => row.id !== '4d12cb'));
    assert.ok(missing.errors.some(e => e.code === 'unassigned_adapter'
        && e.reference === 'experimental_word_diary_incomplete_sour_questions.js'));
    const changed = supplementalInventory(); changed.find(row => row.id === '4d12cb').arity++;
    assert.ok(audit(inventory(), null, changed).errors.some(e => e.code === 'api_contract' && e.id === '4d12cb'));
});

test('incomplete confirmation questions retain their separate three-argument owner', () => {
    const report = audit(); assert.deepEqual(report.errors, []);
    const owner = report.supplementalOwners.find(row => row.id === '4d12cc');
    assert.equal(owner.scopeAdopted, true); assert.equal(owner.implementationAcceptance, 'not_received');
    assert.equal(owner.runtimeDiaryConnected, false); assert.equal(owner.arity, 3);
    const missing = audit(inventory(), null, supplementalInventory().filter(row => row.id !== '4d12cc'));
    assert.ok(missing.errors.some(e => e.code === 'unassigned_adapter'
        && e.reference === 'experimental_word_diary_incomplete_confirmation_questions.js'));
    const changed = supplementalInventory(); changed.find(row => row.id === '4d12cc').arity++;
    assert.ok(audit(inventory(), null, changed).errors.some(e => e.code === 'api_contract' && e.id === '4d12cc'));
});

test('incomplete direct questions retain their separate three-argument owner', () => {
    const report = audit(); assert.deepEqual(report.errors, []);
    const owner = report.supplementalOwners.find(row => row.id === '4d12cd');
    assert.equal(owner.scopeAdopted, true); assert.equal(owner.implementationAcceptance, 'not_received');
    assert.equal(owner.runtimeDiaryConnected, false); assert.equal(owner.arity, 3);
    const missing = audit(inventory(), null, supplementalInventory().filter(row => row.id !== '4d12cd'));
    assert.ok(missing.errors.some(e => e.code === 'unassigned_adapter'
        && e.reference === 'experimental_word_diary_incomplete_direct_questions.js'));
    const changed = supplementalInventory(); changed.find(row => row.id === '4d12cd').arity++;
    assert.ok(audit(inventory(), null, changed).errors.some(e => e.code === 'api_contract' && e.id === '4d12cd'));
});
test('gesture direct questions retain their separate three-argument owner', () => {
    const report = audit(); assert.deepEqual(report.errors, []);
    const owner = report.supplementalOwners.find(row => row.id === '4d12ce');
    assert.equal(owner.scopeAdopted, true); assert.equal(owner.implementationAcceptance, 'not_received');
    assert.equal(owner.runtimeDiaryConnected, false); assert.equal(owner.arity, 3);
    const missing = audit(inventory(), null, supplementalInventory().filter(row => row.id !== '4d12ce'));
    assert.ok(missing.errors.some(e => e.code === 'unassigned_adapter'
        && e.reference === 'experimental_word_diary_gesture_direct_questions.js'));
    const changed = supplementalInventory(); changed.find(row => row.id === '4d12ce').arity++;
    assert.ok(audit(inventory(), null, changed).errors.some(e => e.code === 'api_contract' && e.id === '4d12ce'));
});

test('gesture name questions retain their separate three-argument owner', () => {
    const report = audit(); assert.deepEqual(report.errors, []);
    const owner = report.supplementalOwners.find(row => row.id === '4d12cf');
    assert.equal(owner.scopeAdopted, true); assert.equal(owner.implementationAcceptance, 'not_received');
    assert.equal(owner.runtimeDiaryConnected, false); assert.equal(owner.arity, 3);
    const missing = audit(inventory(), null, supplementalInventory().filter(row => row.id !== '4d12cf'));
    assert.ok(missing.errors.some(e => e.code === 'unassigned_adapter'
        && e.reference === 'experimental_word_diary_gesture_name_questions.js'));
    const changed = supplementalInventory(); changed.find(row => row.id === '4d12cf').arity++;
    assert.ok(audit(inventory(), null, changed).errors.some(e => e.code === 'api_contract' && e.id === '4d12cf'));
});

test('gesture sour questions retain their separate three-argument owner', () => {
    const report = audit(); assert.deepEqual(report.errors, []);
    const owner = report.supplementalOwners.find(row => row.id === '4d12cg');
    assert.equal(owner.scopeAdopted, true); assert.equal(owner.implementationAcceptance, 'not_received');
    assert.equal(owner.runtimeDiaryConnected, false); assert.equal(owner.arity, 3);
    const missing = audit(inventory(), null, supplementalInventory().filter(row => row.id !== '4d12cg'));
    assert.ok(missing.errors.some(e => e.code === 'unassigned_adapter'
        && e.reference === 'experimental_word_diary_gesture_sour_questions.js'));
    const changed = supplementalInventory(); changed.find(row => row.id === '4d12cg').arity++;
    assert.ok(audit(inventory(), null, changed).errors.some(e => e.code === 'api_contract' && e.id === '4d12cg'));
});

test('gesture confirmation questions retain their separate three-argument owner', () => {
    const report = audit(); assert.deepEqual(report.errors, []);
    const owner = report.supplementalOwners.find(row => row.id === '4d12ch');
    assert.equal(owner.scopeAdopted, true); assert.equal(owner.implementationAcceptance, 'not_received');
    assert.equal(owner.runtimeDiaryConnected, false); assert.equal(owner.arity, 3);
    const missing = audit(inventory(), null, supplementalInventory().filter(row => row.id !== '4d12ch'));
    assert.ok(missing.errors.some(e => e.code === 'unassigned_adapter'
        && e.reference === 'experimental_word_diary_gesture_confirmation_questions.js'));
    const changed = supplementalInventory(); changed.find(row => row.id === '4d12ch').arity++;
    assert.ok(audit(inventory(), null, changed).errors.some(e => e.code === 'api_contract' && e.id === '4d12ch'));
});

test('direct taste uncertainty retains an adopted independent three-argument owner', () => {
    const report = audit(); assert.deepEqual(report.errors, []);
    const owner = report.supplementalOwners.find(row => row.id === '4d12ct');
    assert.equal(owner.scopeAdopted, true); assert.equal(owner.implementationAcceptance, 'not_received');
    assert.equal(owner.runtimeDiaryConnected, false); assert.equal(owner.arity, 3);
    const missing = audit(inventory(), null, supplementalInventory().filter(row => row.id !== '4d12ct'));
    assert.ok(missing.errors.some(e => e.code === 'unassigned_adapter'
        && e.reference === 'experimental_word_diary_uncertain_direct_taste_questions.js'));
    const changed = supplementalInventory(); changed.find(row => row.id === '4d12ct').arity++;
    assert.ok(audit(inventory(), null, changed).errors.some(e => e.code === 'api_contract' && e.id === '4d12ct'));
});

test('incomplete activity reports retain an adopted independent three-argument owner', () => {
    const report = audit(); assert.deepEqual(report.errors, []);
    const owner = report.supplementalOwners.find(row => row.id === '4d12cu');
    assert.equal(owner.scopeAdopted, true); assert.equal(owner.arity, 3);
    assert.equal(owner.runtimeDiaryConnected, false); assert.equal(owner.implementationAcceptance, 'not_received');
    const missing = audit(inventory(), null, supplementalInventory().filter(row => row.id !== '4d12cu'));
    assert.ok(missing.errors.some(e => e.code === 'unassigned_adapter'
        && e.reference === 'experimental_word_diary_incomplete_activity_reports.js'));
    const changed = supplementalInventory(); changed.find(row => row.id === '4d12cu').arity++;
    assert.ok(audit(inventory(), null, changed).errors.some(e => e.code === 'api_contract' && e.id === '4d12cu'));
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
            'scripts/experimental/diary_negated_request_fixtures.js', 'scripts/experimental/diary_negated_request_smoke.js',
            'scripts/experimental/diary_after_eat_walk_proposal_fixtures.js', 'scripts/experimental/diary_after_eat_walk_proposal_smoke.js',
            'scripts/experimental/diary_name_question_fixtures.js', 'scripts/experimental/diary_name_question_smoke.js',
            'scripts/experimental/diary_sour_question_fixtures.js', 'scripts/experimental/diary_sour_question_smoke.js',
            'scripts/experimental/diary_general_feeling_contrast_fixtures.js', 'scripts/experimental/diary_general_feeling_contrast_smoke.js',
            'scripts/experimental/diary_partial_feeling_contrast_fixtures.js', 'scripts/experimental/diary_partial_feeling_contrast_smoke.js',
            'scripts/experimental/diary_unresolved_feeling_contrast_fixtures.js', 'scripts/experimental/diary_unresolved_feeling_contrast_smoke.js',
            'scripts/experimental/diary_mixed_feeling_contrast_fixtures.js', 'scripts/experimental/diary_mixed_feeling_contrast_smoke.js',
            'scripts/experimental/diary_incomplete_feeling_contrast_fixtures.js', 'scripts/experimental/diary_incomplete_feeling_contrast_smoke.js',
            'scripts/experimental/diary_event_feeling_contrast_fixtures.js', 'scripts/experimental/diary_event_feeling_contrast_smoke.js',
            'scripts/experimental/diary_incomplete_event_feeling_contrast_fixtures.js', 'scripts/experimental/diary_incomplete_event_feeling_contrast_smoke.js',
            'scripts/experimental/diary_external_event_contrast_fixtures.js', 'scripts/experimental/diary_external_event_contrast_smoke.js',
            'scripts/experimental/diary_incomplete_berry_report_fixtures.js', 'scripts/experimental/diary_incomplete_berry_report_smoke.js',
            'scripts/experimental/diary_incomplete_rest_comfort_report_fixtures.js', 'scripts/experimental/diary_incomplete_rest_comfort_report_smoke.js',
            'scripts/experimental/diary_incomplete_rest_value_report_fixtures.js', 'scripts/experimental/diary_incomplete_rest_value_report_smoke.js',
            'scripts/experimental/diary_incomplete_rest_explanation_report_fixtures.js', 'scripts/experimental/diary_incomplete_rest_explanation_report_smoke.js',
            'scripts/experimental/diary_incomplete_desire_report_fixtures.js', 'scripts/experimental/diary_incomplete_desire_report_smoke.js',
            'scripts/experimental/diary_incomplete_preference_report_fixtures.js', 'scripts/experimental/diary_incomplete_preference_report_smoke.js',
            'scripts/experimental/diary_incomplete_negated_preference_report_fixtures.js', 'scripts/experimental/diary_incomplete_negated_preference_report_smoke.js',
            'scripts/experimental/diary_incomplete_negated_request_fixtures.js', 'scripts/experimental/diary_incomplete_negated_request_smoke.js',
            'scripts/experimental/diary_incomplete_after_eat_walk_proposal_fixtures.js', 'scripts/experimental/diary_incomplete_after_eat_walk_proposal_smoke.js',
            'scripts/experimental/diary_unresolved_negated_request_target_fixtures.js', 'scripts/experimental/diary_unresolved_negated_request_target_smoke.js',
            'scripts/experimental/diary_unresolved_preference_target_fixtures.js', 'scripts/experimental/diary_unresolved_preference_target_smoke.js',
            'scripts/experimental/diary_unresolved_negated_preference_target_fixtures.js', 'scripts/experimental/diary_unresolved_negated_preference_target_smoke.js',
            'scripts/experimental/diary_incomplete_name_question_fixtures.js', 'scripts/experimental/diary_incomplete_name_question_smoke.js',
            'scripts/experimental/diary_unresolved_name_target_fixtures.js', 'scripts/experimental/diary_unresolved_name_target_smoke.js',
            'scripts/experimental/diary_incomplete_sour_question_fixtures.js', 'scripts/experimental/diary_incomplete_sour_question_smoke.js',
            'scripts/experimental/diary_incomplete_confirmation_question_fixtures.js', 'scripts/experimental/diary_incomplete_confirmation_question_smoke.js',
            'scripts/experimental/diary_gesture_name_question_fixtures.js', 'scripts/experimental/diary_gesture_name_question_smoke.js',
            'scripts/experimental/diary_gesture_sour_question_fixtures.js', 'scripts/experimental/diary_gesture_sour_question_smoke.js',
            'scripts/experimental/diary_gesture_reason_question_fixtures.js', 'scripts/experimental/diary_gesture_reason_question_smoke.js',
            'scripts/experimental/diary_incomplete_reason_question_fixtures.js', 'scripts/experimental/diary_incomplete_reason_question_smoke.js',
            'scripts/experimental/diary_incomplete_context_question_fixtures.js', 'scripts/experimental/diary_incomplete_context_question_smoke.js',
            'scripts/experimental/diary_gesture_context_question_fixtures.js', 'scripts/experimental/diary_gesture_context_question_smoke.js',
            'scripts/experimental/diary_incomplete_repeat_question_fixtures.js', 'scripts/experimental/diary_incomplete_repeat_question_smoke.js',
            'scripts/experimental/diary_gesture_repeat_question_fixtures.js', 'scripts/experimental/diary_gesture_repeat_question_smoke.js',
            'scripts/experimental/diary_uncertain_context_question_fixtures.js', 'scripts/experimental/diary_uncertain_context_question_smoke.js',
            'scripts/experimental/diary_uncertain_direct_taste_question_fixtures.js', 'scripts/experimental/diary_uncertain_direct_taste_question_smoke.js',
            'scripts/experimental/diary_incomplete_activity_report_fixtures.js', 'scripts/experimental/diary_incomplete_activity_report_smoke.js',
            'scripts/experimental/diary_complete_other_speaker_activity_report_fixtures.js', 'scripts/experimental/diary_complete_other_speaker_activity_report_smoke.js',
            'scripts/experimental/diary_work_observation_question_fixtures.js', 'scripts/experimental/diary_work_observation_question_smoke.js',
            'scripts/experimental/diary_complete_other_speaker_proposal_fixtures.js', 'scripts/experimental/diary_complete_other_speaker_proposal_smoke.js',
            'scripts/experimental/diary_generic_conditional_rest_request_fixtures.js', 'scripts/experimental/diary_generic_conditional_rest_request_smoke.js',
            'scripts/experimental/diary_complete_other_speaker_conditional_rest_proposal_fixtures.js', 'scripts/experimental/diary_complete_other_speaker_conditional_rest_proposal_smoke.js',
            'scripts/experimental/diary_clause_scope_rest_request_fixtures.js', 'scripts/experimental/diary_clause_scope_rest_request_smoke.js',
            'scripts/experimental/diary_rest_and_walk_clause_proposal_fixtures.js', 'scripts/experimental/diary_rest_and_walk_clause_proposal_smoke.js',
            'scripts/experimental/diary_same_kind_clause_proposal_fixtures.js', 'scripts/experimental/diary_same_kind_clause_proposal_smoke.js',
            'scripts/experimental/diary_conditional_and_normal_clause_proposal_fixtures.js', 'scripts/experimental/diary_conditional_and_normal_clause_proposal_smoke.js',
            'scripts/experimental/diary_remaining_clause_material_fixtures.js', 'scripts/experimental/diary_remaining_clause_material_smoke.js',
            'scripts/experimental/diary_additional_clause_material_fixtures.js', 'scripts/experimental/diary_additional_clause_material_smoke.js',
            'scripts/experimental/diary_greeting_material_fixtures.js', 'scripts/experimental/diary_greeting_material_smoke.js',
            'scripts/experimental/diary_incomplete_rest_proposal_fixtures.js', 'scripts/experimental/diary_incomplete_rest_proposal_smoke.js',
            'scripts/experimental/diary_incomplete_walk_proposal_fixtures.js', 'scripts/experimental/diary_incomplete_walk_proposal_smoke.js',
            'scripts/experimental/diary_incomplete_conditional_rest_proposal_fixtures.js', 'scripts/experimental/diary_incomplete_conditional_rest_proposal_smoke.js',
            'scripts/experimental/diary_incomplete_sequential_rest_proposal_fixtures.js', 'scripts/experimental/diary_incomplete_sequential_rest_proposal_smoke.js',
            'scripts/experimental/diary_gesture_confirmation_question_fixtures.js', 'scripts/experimental/diary_gesture_confirmation_question_smoke.js',
            'docs/specs/core/experimental_word_diary_audit.md']) {
            assert.equal(await status(name), 404, name);
        }
        assert.equal(await status('experimental_word_diary.html'), 200);
        assert.equal(await status('experimental_word_island.html'), 200);
    } finally {
        await new Promise(resolve => server.close(resolve));
    }
});
