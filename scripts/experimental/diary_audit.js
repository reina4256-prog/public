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
// were read. Hashes identify those read sources; they do not perform reading.
const boundaryReviews = new Map([
    ['4d1', '92a7e35d8afcebe6f7ce21ca4f5a5d1f3603273828c74ef795f5e12f7fcbb5f6'],
    ['4d2', '7f865dc539fb53127d9fb7e2599864c5aada3bb14c361ab9c0fe63e3f966e4e8'],
    ['4d3', '6fcbdfa6a0360f0d5ccad17af21119deb42367a25afb949fc74be3d26a6a571c'],
    ['4d4', 'c474a626ff02d891d29faaae3db40a651810052e533151063e35c837dd89d0ad'],
    ['4d5', 'd01022327641d3856596d878ee388c769d12bcfe13e533c215236006993fe0ec'],
    ['4d6', '26b74eae0267c8a208d28a203701466d6fdaabe0a82bc5d75e60fb3277a0a6ad'],
    ['4d7', 'e3aa92625d30bfd260b3b38f72085e7538c1e407fb390bec79571556b164a052'],
    ['4d8', '3f05c591d5b9b955ae41e79bcc59650295f66b5fccb0344e75c6093e12ce52c8'],
    ['4d9', '7bc726acccff59862425c08dc6a51e921f3cd5622086896c48bed1a637945a07'],
    ['4d10', 'f623a09aaddab4105a0c8d5ed320fb9780cbc42bb4a8f5bc7112c690e0d12df4'],
    ['4d12h', '38f733fc878bd9338f4777a0f56311b36c48590cc2039b9a3c6a3859e506c55a'],
    ['4d12i', '1895fd03fee39cacaec0405c9a071dd00491ebc532afaee1a606df1f9570d442'],
    ['4d12j', '6bb35dda40bd7382c39c951b1ff3c7edbcaca78ae5005b9a49d360102ea00aaa'],
    ['4d12k', '54b6f1bf96ed23a646763cef0fd436d88a84513609808726f1cbb4fad99c9f18'],
    ['4d12l', '4e617f9339a12e153ecb9d0430394ba5a9220fe5fc353661c2d5f733cbdaf939'],
    ['4d12m', '5451750a1166ab9bee8b516dcde74a6380b82e94c85f08b360806ae3bc5ffc58'],
    ['4d12n', '9cb1234000a78d0c397bbfe7319e32a8f63c6586514cd8ff45680706ad4fb395'],
    ['4d12o', 'f011ca5aa1bc56b090cb2517c9979c819250ea7479834fdbfd6fe119c2fb1758'],
    ['4d12p', 'cdbd27c49137fd51292420b73515e86264d77857aa0f7fb181ff30f5419040f8'],
    ['4d12q', 'd3697ab8b8ea174d5604be95abd25e316918521f7892f8d6ca08b7bbdba4fc69'],
    ['4d12r', '5bbfdd90f824448a3f3e707fd6f18ec5a68a8fef97ad2746f7b076f6366a956c'],
    ['4d12s', '8f3b33b5a4b6cc5f3181137890dafc7c022ebae507d65cc4bf1ce2d3b0552acb'],
    ['4d12t', 'd7e8d9e0d313fd481df2b6091f083f94b2c7eed288299a001c9edd8477393711'],
    ['4d12u', 'd663fd7eb6008fab2d50b66770abb78c3d587019dd93eed56bb837b52448b89b'],
    ['4d12v', 'd5c0033a09d3caaa2a398f25436f50d37a343b9a81ab168c618a552407c4d348'],
    ['4d12w', '7b9dc4cfb620ae1e1d28feafac1c603527245c5df5d1dbe4ca93ba7985ad8946'],
    ['4d12x', 'ad24c4ac4a27e0158a767d11187fd98c949042c57432b8550440c70c1419be0c'],
    ['4d12y', '554c105e5b6efc6d545faf72bf337a712705edea7f6b818b5d8793bdfb5e3983'],
    ['4d12z', 'f08abc8913b232a14cea78ba18dd928e071b1b5c58ff4a88eddd2d75ac7b6409'],
    ['4d12aa', 'bad0e0f5b8fd1c0e4e04e92038a9ca8c32e4d67260a4eed867302e76e2850769'],
    ['4d12ab', '7ab8a537abae26aac221ce9cb7b4920cb261c3a8ddbde7816ab9579682907357'],
    ['4d12ac', '06ad5646e334a39e3102d0f4d8505c4ff8bd360a281469b214a34b8f305fd36c'],
    ['4d12ad', 'bff4ef412ff390146409267415792e0658e111fbf9866b4d6eea9336c43c4e32'],
    ['4d12ae', 'e5f1580d9a0d42b570e80adec8d66e1d204eb46a5bf7f1f75fbe7371261dae2c'],
    ['4d12af', '649219f70544a967688aa0beceef651e4e4b659711f3dfdf2dc2fd3b215b9ce1'],
    ['4d12ag', '796a99540ed90f3607b034a79af3645023b36ee181b010ff0b06b7c5d55104e1'],
    ['4d12ah', '47e30fa9dc3a4fa3b6301aecefe906b0338a7bb08f29eedfaea34323f397503a'],
    ['4d12ai', '8a14ea4cb9803e21a5eb1e08af29863519566a4ff0a06b1d6374e765b28465f8'],
    ['4d12aj', '680ba2734cc3e88de1ac3f43aa2a60e01c6f3ec4beeebdb4da331d64ab9ed0d7'],
    ['4d12ak', '09c0fb8c1321fa54c9409b542ade8247340df06a373d671e92a545e0865bac47'],
    ['4d12al', '5848cc611e13c17256f6c82d03b06f7d1c4d8060c63acef3b6937f8232a12874'],
    ['4d12am', '37aa4b4f37b347b083bee557dae31068019f4a4230ec9f4d380ae39d6835a96d'],
    ['4d11', 'd60bcf7e4d72bbb2994aec60d7850b15f9e040999fbcd91b302fab8a7f73260c'],
    ['4d12a', '1c6fb5664389217923c0212bb79d84acaee4b83b1c47870e1ba6a4d2a167b671'],
    ['4d12b', '5d7ec203d035aa094227dcaaf700a59480ddb79c6704179a7acd8d3b0aaaed74'],
    ['4d12c', '4e6ad6bcc39ff55744752bef45726b607f5e2868f825ce3f70c1489a26c36287'],
    ['4d12d', '0a5aadc81ea2e976562f202706f00e1fd2ad76b2cf137e4a39d5bff45e111a6a'],
    ['4d12e', 'f8a9b069e3cc233ce58f9d2cb4fdec49460d589097002432d996f0c670582bf4'],
    ['4d12f', '30d8493a13e6e8227d6ab1826f76c2ce6c2f3cbfabc832587e394009e33db558'],
    ['4d12g', '15234f8e9df8ada82f09b7634b7a1da211c7ba7b7bd259baa35d6f4a993b99d4']
]);
// The reviewed owner implementations are a conservative shared dependency:
// any owner change requires reconciliation before reusing the manual reviews.
const ownerReviews = new Map([
    ['experimental_word_learning_core.js', '11fbbadbbe852d409287ca1035f7371e1309169d0ad65a3e033f376c8ee90bf8'],
    ['experimental_word_learning_world.js', '3239a443ed64f8df04a1a8bc09e68d8d9e7ffa2bacdb08c14b46d88282cdc8f7'],
    ['experimental_word_relation_learning.js', '54eee2149d554c42129c2802a831e71950bbd3788fef9a3696501aa7363257c1'],
    ['experimental_word_life_learning.js', '59f1c70a38a6666128fa3fd74e4cd19cfac2f35d9703cb9ffee0c1f8684811e8'],
    ['experimental_word_feeling_learning.js', '03d78ab3c2d9b59bb83f3a08f9f6a3abf7ffd23e621fe75c8b9fec384f2edaa6'],
    ['experimental_word_careers.js', 'f980ea45b147b57d27a6a9fdbdfea1ca9a23cb59e61b267d3cc3a8347f2426bc'],
    ['scripts/experimental/storage.js', '6fb5526cea767bac466edd41a4c84908e61e8955abf7fb0863d17b6215777f08'],
]);
const earlierReviews = new Set(['4d11', '4d12a', '4d12b', '4d12c', '4d12d', '4d12e', '4d12f', '4d12g']);
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
    ['historical_reading', '4d12ao', 'reviewed_related_sources'],
    ['entry_semantics', '4d12ao', 'reviewed_existing_boundaries'],
    ['gesture_questions', '4d2', 'undecided'],
    ['later_rest_answer', '4h', 'unanswered'],
    ['experienced_correction_scope', '4d12', 'separate_consultation'],
    ['other_existing_inputs', '4d12', 'separate_consultation'],
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
// Keep the ao snapshot (50 capture boundaries, 14 ledger IDs, 51/52 counts)
// intact. Later adopted work has a separate inventory and acceptance status.
function supplementalInventory() {
    return [{ id: '4d12ap', slug: 'answers', api: 'capture', arity: 3,
        file: 'experimental_word_diary_answers.js', test: 'tests/experimental_word_diary_answers.test.js' },
    { id: '4d12aq', slug: 'followups', api: 'capture', arity: 3,
        file: 'experimental_word_diary_followups.js', test: 'tests/experimental_word_diary_followups.test.js' },
    { id: '4d12ar', slug: 'references', api: 'capture', arity: 3,
        file: 'experimental_word_diary_references.js', test: 'tests/experimental_word_diary_references.test.js' },
    { id: '4d12as', slug: 'name_responses', api: 'capture', arity: 3,
        file: 'experimental_word_diary_name_responses.js', test: 'tests/experimental_word_diary_name_responses.test.js' },
    { id: '4d12at', slug: 'greetings', api: 'capture', arity: 3,
        file: 'experimental_word_diary_greetings.js', test: 'tests/experimental_word_diary_greetings.test.js' },
    { id: '4d12au', slug: 'berry_reports', api: 'capture', arity: 3,
        file: 'experimental_word_diary_berry_reports.js', test: 'tests/experimental_word_diary_berry_reports.test.js' },
    { id: '4d12av', slug: 'rest_comfort_reports', api: 'capture', arity: 3,
        file: 'experimental_word_diary_rest_comfort_reports.js', test: 'tests/experimental_word_diary_rest_comfort_reports.test.js' },
    { id: '4d12aw', slug: 'rest_value_reports', api: 'capture', arity: 3,
        file: 'experimental_word_diary_rest_value_reports.js', test: 'tests/experimental_word_diary_rest_value_reports.test.js' },
    { id: '4d12ax', slug: 'rest_explanation_reports', api: 'capture', arity: 3,
        file: 'experimental_word_diary_rest_explanation_reports.js', test: 'tests/experimental_word_diary_rest_explanation_reports.test.js' },
    { id: '4d12ay', slug: 'desire_reports', api: 'capture', arity: 3,
        file: 'experimental_word_diary_desire_reports.js', test: 'tests/experimental_word_diary_desire_reports.test.js' },
    { id: '4d12az', slug: 'preference_reports', api: 'capture', arity: 3,
        file: 'experimental_word_diary_preference_reports.js', test: 'tests/experimental_word_diary_preference_reports.test.js' },
    { id: '4d12ba', slug: 'negated_preference_reports', api: 'capture', arity: 3,
        file: 'experimental_word_diary_negated_preference_reports.js', test: 'tests/experimental_word_diary_negated_preference_reports.test.js' },
    { id: '4d12bb', slug: 'negated_requests', api: 'capture', arity: 3,
        file: 'experimental_word_diary_negated_requests.js', test: 'tests/experimental_word_diary_negated_requests.test.js' },
    { id: '4d12bc', slug: 'after_eat_walk_proposals', api: 'capture', arity: 3,
        file: 'experimental_word_diary_after_eat_walk_proposals.js', test: 'tests/experimental_word_diary_after_eat_walk_proposals.test.js' },
    { id: '4d12bd', slug: 'name_questions', api: 'capture', arity: 3,
        file: 'experimental_word_diary_name_questions.js', test: 'tests/experimental_word_diary_name_questions.test.js' },
    { id: '4d12be', slug: 'sour_questions', api: 'capture', arity: 3,
        file: 'experimental_word_diary_sour_questions.js', test: 'tests/experimental_word_diary_sour_questions.test.js' },
    { id: '4d12bf', slug: 'general_feeling_contrasts', api: 'capture', arity: 3,
        file: 'experimental_word_diary_general_feeling_contrasts.js', test: 'tests/experimental_word_diary_general_feeling_contrasts.test.js' },
    { id: '4d12bg', slug: 'partial_feeling_contrasts', api: 'capture', arity: 3,
        file: 'experimental_word_diary_partial_feeling_contrasts.js', test: 'tests/experimental_word_diary_partial_feeling_contrasts.test.js' },
    { id: '4d12bh', slug: 'unresolved_feeling_contrasts', api: 'capture', arity: 3,
        file: 'experimental_word_diary_unresolved_feeling_contrasts.js', test: 'tests/experimental_word_diary_unresolved_feeling_contrasts.test.js' },
    { id: '4d12bi', slug: 'mixed_feeling_contrasts', api: 'capture', arity: 3,
        file: 'experimental_word_diary_mixed_feeling_contrasts.js', test: 'tests/experimental_word_diary_mixed_feeling_contrasts.test.js' },
    { id: '4d12bj', slug: 'incomplete_feeling_contrasts', api: 'capture', arity: 3,
        file: 'experimental_word_diary_incomplete_feeling_contrasts.js', test: 'tests/experimental_word_diary_incomplete_feeling_contrasts.test.js' },
    { id: '4d12bk', slug: 'event_feeling_contrasts', api: 'capture', arity: 3,
        file: 'experimental_word_diary_event_feeling_contrasts.js', test: 'tests/experimental_word_diary_event_feeling_contrasts.test.js' },
    { id: '4d12bl', slug: 'incomplete_event_feeling_contrasts', api: 'capture', arity: 3,
        file: 'experimental_word_diary_incomplete_event_feeling_contrasts.js', test: 'tests/experimental_word_diary_incomplete_event_feeling_contrasts.test.js' },
    { id: '4d12bm', slug: 'external_event_contrasts', api: 'capture', arity: 3,
        file: 'experimental_word_diary_external_event_contrasts.js', test: 'tests/experimental_word_diary_external_event_contrasts.test.js' },
    { id: '4d12bn', slug: 'incomplete_berry_reports', api: 'capture', arity: 3,
        file: 'experimental_word_diary_incomplete_berry_reports.js', test: 'tests/experimental_word_diary_incomplete_berry_reports.test.js' },
    { id: '4d12bo', slug: 'incomplete_rest_comfort_reports', api: 'capture', arity: 3,
        file: 'experimental_word_diary_incomplete_rest_comfort_reports.js', test: 'tests/experimental_word_diary_incomplete_rest_comfort_reports.test.js' }];
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
function audit(rows = inventory(), readAdapterSource = null, supplemental = supplementalInventory()) {
    const errors = [];
    const read = relative => {
        try { return fs.readFileSync(localFile(relative), 'utf8'); }
        catch (error) { errors.push({ code: 'unreadable_reference', reference: relative, reason: error.code || error.name }); return ''; }
    };
    const spec = read(SPEC), auditSpec = read(AUDIT_SPEC);
    const packageScripts = JSON.parse(read('package.json')).scripts;
    const roadmap = read('docs/WORD_DEMO_ROADMAP.md');
    const fingerprint = source => createHash('sha256').update(source.replace(/\r\n/g, '\n')).digest('hex');
    const ownerBoundaries = [...ownerReviews].map(([file, hash]) => ({ file,
        review: fingerprint(readAdapterSource ? readAdapterSource(file) : read(file)) === hash
            ? 'owner_boundary_reviewed' : 'pending' }));
    const ownersUnchanged = ownerBoundaries.every(owner => owner.review === 'owner_boundary_reviewed');
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
        const boundaryReviewed = confirmed && ownersUnchanged && arity === row.arity
            && boundaryReviews.get(row.id) === fingerprint(source);
        return { ...row, structuralContractChecked: arity === row.arity, boundarySpec: SPEC,
            scopeUserConfirmed: confirmed,
            auditSemanticReview: boundaryReviewed ? 'capture_boundary_reviewed' : 'pending',
            reviewRecord: boundaryReviewed ? AUDIT_SPEC + '#ao-source-review-record' : null,
            reviewedSourceCommit: boundaryReviewed ? earlierReviews.has(row.id) ? 'b260bac' : 'ca35c7e' : null,
            runtimeDiaryConnected: false };
    });
    const supplementalOwners = supplemental.map(row => {
        if (ids.has(row.id) || files.has(row.file)) errors.push({ code: 'duplicate_owner', id: row.id });
        ids.add(row.id); files.add(row.file);
        const source = readAdapterSource ? readAdapterSource(row.file) : read(row.file), test = read(row.test);
        const match = source.match(new RegExp(`function ${row.api}\\(([^)]*)\\)`));
        const arity = match ? match[1].split(',').filter(item => item.trim()).length : null;
        if (arity !== row.arity || !new RegExp(`return Object\\.freeze\\(\\{[^}]*\\b${row.api}\\b[^}]*\\}\\)`).test(source)) errors.push({ code: 'api_contract', id: row.id });
        if (!test.includes(path.basename(row.file, '.js'))
            || !packageScripts['test:words'].split(/\s+/).includes(row.test)) errors.push({ code: 'missing_test_registration', id: row.id });
        if (!spec.includes(`diary_${row.slug}`)) errors.push({ code: 'missing_scope_reference', id: row.id });
        if (!roadmap.includes(`| ${row.id} |`)) errors.push({ code: 'missing_step_reference', id: row.id });
        return { ...row, structuralContractChecked: arity === row.arity, runtimeDiaryConnected: false,
            scopeAdopted: supplementalInventory().some(original => Object.keys(original).every(key => original[key] === row[key])),
            implementationAcceptance: 'not_received', auditSemanticReview: 'pending' };
    });
    if (supplemental.length !== 26) errors.push({ code: 'supplemental_inventory_count', expected: 26, actual: supplemental.length });
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
    if (checked.length !== 50 || !checked.every(row => row.auditSemanticReview === 'capture_boundary_reviewed')) {
        issues.find(issue => issue.id === 'entry_semantics').status = 'incomplete';
    }
    for (const issue of issues) if (!auditSpec.includes(`| ${issue.id} |`)) errors.push({ code: 'missing_pending_reference', id: issue.id });
    return { structuralOk: errors.length === 0, errors, rows: checked, supplementalOwners,
        crossFileCorrection: { id: '4d12an', references: crossFiles, test: restTest, scopeConfirmed: true },
        counts: { confirmedScopes: 51, visibleSlots: 52, mappedOwners: rows.length + 1,
            reviewedCaptureBoundaries: checked.filter(row => row.auditSemanticReview === 'capture_boundary_reviewed').length,
            aoConfirmed: false },
        ownerBoundaries, ledger: issues,
        unresolved: issues.filter(issue => !issue.status.startsWith('reviewed_')), eligibleForAoCompletion: false,
        whole4d12Complete: false, whole4dComplete: false, wholeID4Complete: false };
}
if (require.main === module) {
    const report = audit();
    process.stdout.write(JSON.stringify(report, null, 2) + '\n');
    process.exitCode = report.structuralOk ? 0 : 1;
}
module.exports = { inventory, audit, localFile, supplementalInventory };
