'use strict';
// Development-only inventory. Structural checks never certify comprehension,
// historical reading, runtime diary integration, or user acceptance.
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const ROOT = path.resolve(__dirname, '../..');
const SPEC = 'docs/specs/core/experimental_word_learning.md';
const AUDIT_SPEC = 'docs/specs/core/experimental_word_diary_audit.md';
// Manually recorded source-boundary reviews, not a result of structural checks.
// The owning specification records exactly which source and owner passages
// were read. Other adapters and historical references remain pending.
const boundaryReviews = new Map([
    ['4d11', 'd60bcf7e4d72bbb2994aec60d7850b15f9e040999fbcd91b302fab8a7f73260c'],
    ['4d12a', '1c6fb5664389217923c0212bb79d84acaee4b83b1c47870e1ba6a4d2a167b671'],
    ['4d12b', '5d7ec203d035aa094227dcaaf700a59480ddb79c6704179a7acd8d3b0aaaed74'],
    ['4d12c', '4e6ad6bcc39ff55744752bef45726b607f5e2868f825ce3f70c1489a26c36287'],
    ['4d12d', '0a5aadc81ea2e976562f202706f00e1fd2ad76b2cf137e4a39d5bff45e111a6a'],
    ['4d12e', 'f8a9b069e3cc233ce58f9d2cb4fdec49460d589097002432d996f0c670582bf4'],
    ['4d12f', '30d8493a13e6e8227d6ab1826f76c2ce6c2f3cbfabc832587e394009e33db558'],
    ['4d12g', '15234f8e9df8ada82f09b7634b7a1da211c7ba7b7bd259baa35d6f4a993b99d4']
]);
const definitions = [
    ['4d1', 'candidates', 'create', 0],
    ['4d2', 'questions', 'capture', 3],
    ['4d3', 'experiences', 'capture', 4],
    ['4d4', 'work', 'capture', 4],
    ['4d5', 'names', 'capture', 3],
    ['4d6', 'definitions', 'capture', 4],
    ['4d7', 'life_labels', 'capture', 4],
    ['4d8', 'relation_labels', 'capture', 4],
    ['4d9', 'question_examples', 'capture', 4],
    ['4d10', 'known_question_examples', 'capture', 4],
    ['4d11', 'proposal_examples', 'capture', 4],
    ['4d12a', 'known_proposal_examples', 'capture', 4],
    ['4d12b', 'report_examples', 'capture', 4],
    ['4d12c', 'known_report_examples', 'capture', 4],
    ['4d12d', 'reports', 'capture', 4],
    ['4d12e', 'negation_examples', 'capture', 4],
    ['4d12f', 'known_negation_examples', 'capture', 4],
    ['4d12g', 'negation_reports', 'capture', 4],
    ['4d12h', 'time_examples', 'capture', 5],
    ['4d12i', 'known_time_examples', 'capture', 5],
    ['4d12j', 'time_reports', 'capture', 4],
    ['4d12k', 'condition_examples', 'capture', 4],
    ['4d12l', 'known_condition_examples', 'capture', 4],
    ['4d12m', 'condition_proposals', 'capture', 4],
    ['4d12n', 'sequence_examples', 'capture', 5],
    ['4d12o', 'known_sequence_examples', 'capture', 5],
    ['4d12p', 'sequence_proposals', 'capture', 4],
    ['4d12q', 'reason_question_examples', 'capture', 6],
    ['4d12r', 'known_reason_question_examples', 'capture', 6],
    ['4d12s', 'reason_explanation_examples', 'capture', 6],
    ['4d12t', 'known_reason_explanation_examples', 'capture', 6],
    ['4d12u', 'reason_answers', 'capture', 7],
    ['4d12v', 'correction_examples', 'capture', 7],
    ['4d12w', 'known_correction_examples', 'capture', 7],
    ['4d12x', 'corrections', 'capture', 7],
    ['4d12y', 'feeling_words', 'capture', 7],
    ['4d12z', 'known_feeling_words', 'capture', 7],
    ['4d12aa', 'feeling_report_examples', 'capture', 7],
    ['4d12ab', 'known_feeling_report_examples', 'capture', 7],
    ['4d12ac', 'feeling_time_examples', 'capture', 7],
    ['4d12ad', 'known_feeling_time_examples', 'capture', 7],
    ['4d12ae', 'feeling_contrast_examples', 'capture', 7],
    ['4d12af', 'known_feeling_contrast_examples', 'capture', 7],
    ['4d12ag', 'feeling_reports', 'capture', 7],
    ['4d12ah', 'feeling_contrast_reports', 'capture', 7],
    ['4d12ai', 'external_reports', 'capture', 8],
    ['4d12aj', 'general_corrections', 'capture', 6],
    ['4d12ak', 'remaining_corrections', 'capture', 7],
    ['4d12al', 'remaining_time_reports', 'capture', 4],
    ['4d12am', 'proposals', 'capture', 5]
];
const pending = [
    ['historical_reading', '4d12ao', 'incomplete'],
    ['entry_semantics', '4d12ao', 'incomplete'],
    ['gesture_questions', '4d2', 'undecided'],
    ['later_rest_answer', '4h', 'unanswered'],
    ['experienced_correction_scope', '4d12', 'separate_consultation'],
    ['other_existing_inputs', '4d12', 'unreconciled'],
    ['unmarked_teaching', 'ID3', 'undecided'],
    ['prose_aggregation_progress', '4e', 'undecided'],
    ['impression_drawing', '4f', 'undecided'],
    ['runtime_calendar_persistence', '4g', 'unimplemented'],
    ['memory_expression_growth', '4h', 'undecided'],
    ['integrated_release_validation', '4i', 'unverified'],
    ['constellation_integration', 'ID4', 'separate_consultation'],
    ['ao_feedback_acceptance', '4d12ao', 'not_received']
];
function inventory() {
    return definitions.map(([id, slug, api, arity]) => ({ id, slug, api, arity,
        file: `experimental_word_diary_${slug}.js`,
        test: `tests/experimental_word_diary_${slug}.test.js` }));
}
function localFile(relative) {
    if (typeof relative !== 'string' || !relative || relative.includes('\\')
        || relative.split('/').some(part => !part || part === '..' || part === '.')
        || !/^[a-zA-Z0-9_./-]+$/.test(relative) || path.isAbsolute(relative)) {
        throw new TypeError('Invalid audit reference');
    }
    const resolved = path.resolve(ROOT, relative);
    if (!resolved.startsWith(ROOT + path.sep)) throw new TypeError('Invalid audit reference');
    return resolved;
}
function audit(rows = inventory(), readAdapterSource = null) {
    const errors = [];
    const read = relative => {
        try { return fs.readFileSync(localFile(relative), 'utf8'); }
        catch (error) { errors.push({ code: 'unreadable_reference', reference: relative, reason: error.code || error.name }); return ''; }
    };
    const spec = read(SPEC), auditSpec = read(AUDIT_SPEC);
    const packageScripts = JSON.parse(read('package.json')).scripts;
    const roadmap = read('docs/WORD_DEMO_ROADMAP.md');
    const ids = new Set(), files = new Set();
    const checked = rows.map(row => {
        if (ids.has(row.id) || files.has(row.file)) errors.push({ code: 'duplicate_owner', id: row.id });
        ids.add(row.id); files.add(row.file);
        const source = readAdapterSource ? readAdapterSource(row.file) : read(row.file), test = read(row.test);
        const match = source.match(new RegExp(`function ${row.api}\\(([^)]*)\\)`));
        const arity = match ? match[1].split(',').filter(item => item.trim()).length : null;
        if (arity !== row.arity || !source.includes(`{ ${row.api} }`)) errors.push({ code: 'api_contract', id: row.id });
        if (!test.includes(path.basename(row.file, '.js'))
            || !packageScripts['test:words'].split(/\s+/).includes(row.test)) errors.push({ code: 'missing_test_registration', id: row.id });
        if (!spec.includes(`diary_${row.slug}`)) errors.push({ code: 'missing_scope_reference', id: row.id });
        if (!roadmap.includes(`| ${row.id} |`) && !roadmap.includes(`| **${row.id}** |`)) errors.push({ code: 'missing_step_reference', id: row.id });
        const confirmed = definitions.some(([id, slug, api, expectedArity]) => id === row.id
            && slug === row.slug && api === row.api && expectedArity === row.arity
            && row.file === `experimental_word_diary_${slug}.js`
            && row.test === `tests/experimental_word_diary_${slug}.test.js`);
        const fingerprint = createHash('sha256').update(source.replace(/\r\n/g, '\n')).digest('hex');
        const boundaryReviewed = confirmed && arity === row.arity && boundaryReviews.get(row.id) === fingerprint;
        return { ...row, structuralContractChecked: arity === row.arity, boundarySpec: SPEC,
            scopeUserConfirmed: confirmed,
            auditSemanticReview: boundaryReviewed ? 'capture_boundary_reviewed' : 'pending',
            reviewRecord: boundaryReviewed ? AUDIT_SPEC + '#ao-source-review-record' : null,
            reviewedSourceCommit: boundaryReviewed ? 'b260bac' : null,
            runtimeDiaryConnected: false };
    });
    // One directory, file names only. Never recurse into unrelated directories.
    for (const name of fs.readdirSync(ROOT)) {
        if (/^experimental_word_diary_[a-z_]+\.js$/.test(name) && !files.has(name)
            && /function capture\(/.test(read(name))) errors.push({ code: 'unassigned_adapter', reference: name });
    }
    if (rows.length !== 50) errors.push({ code: 'inventory_count', expected: 50, actual: rows.length });
    const crossFiles = [
        ['experimental_word_learning_world.js', ['approach', 'onArrival', 'validContext', 'validSelections']],
        ['experimental_word_relation_learning.js', ['offerReason', 'restStartedBefore']],
        ['scripts/experimental/storage.js', ['valid']]
    ];
    for (const [file, functions] of crossFiles) {
        const source = read(file);
        for (const name of functions) if (!source.includes(`function ${name}(`)) errors.push({ code: 'missing_rest_boundary', reference: file, function: name });
    }
    const restTest = 'tests/experimental_word_rest_start.test.js';
    if (!read(restTest) || !packageScripts['test:words'].split(/\s+/).includes(restTest)) errors.push({ code: 'missing_rest_test' });
    const issues = pending.map(([id, owner, status]) => ({ id, owner, status }));
    for (const issue of issues) if (!auditSpec.includes(`| ${issue.id} |`)) errors.push({ code: 'missing_pending_reference', id: issue.id });
    return { structuralOk: errors.length === 0, errors, rows: checked,
        crossFileCorrection: { id: '4d12an', references: crossFiles, test: restTest, scopeConfirmed: true },
        counts: { confirmedScopes: 51, visibleSlots: 52, mappedOwners: rows.length + 1,
            reviewedCaptureBoundaries: checked.filter(row => row.auditSemanticReview === 'capture_boundary_reviewed').length,
            aoConfirmed: false },
        unresolved: issues, eligibleForAoCompletion: false,
        whole4d12Complete: false, whole4dComplete: false, wholeID4Complete: false };
}
if (require.main === module) {
    const report = audit();
    process.stdout.write(JSON.stringify(report, null, 2) + '\n');
    process.exitCode = report.structuralOk ? 0 : 1;
}
module.exports = { inventory, audit, localFile };
