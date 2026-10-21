'use strict';
// Existing ordinary walk grammar; actual executions only in disposable memory.
const base = require('./diary_incomplete_context_question_fixtures');
const ordinary = require('./diary_proposal_fixtures');
const life = require('./diary_negation_fixtures');
const { setup, hear, core, worldApi, catalog } = base;
const copy = v => JSON.parse(JSON.stringify(v));
const forms = ['散歩しよう', '散歩しようよ', '散歩に行こう', '一緒に散歩しよう', '一緒に散歩しようよ', '一緒に散歩に行こう'];
function prepared(mask = 0, speech = 'short', options = {}) {
    const v = setup({ speech, ...options });
    if (mask & 1) v.state.knowledge.meanings = v.state.knowledge.meanings.filter(m => m.id !== 'walk');
    if (mask & 2) v.state.knowledge.relations = v.state.knowledge.relations.filter(r => r.id !== 'invitation');
    return v;
}
function fixtures() {
    const all = [], add = (group, value, expected) => all.push({ group, value, expected });
    for (const raw of forms) for (const foundation of [false, true]) for (const life of [false, true]) for (const speech of ['short', 'gesture'])
        add('six-forms-eight-settings', hear(setup({ foundation, life, speech }), raw), !foundation || !life);
    for (const raw of forms) for (const speech of ['short', 'gesture']) for (let mask = 0; mask < 4; mask++) {
        add('meaning-and-relation-masks', hear(prepared(mask, speech), raw), mask !== 0);
        add('existing-normalization', hear(prepared(mask, speech), '  ' + raw + '  '), mask !== 0);
        add('existing-terminal-punctuation', hear(prepared(mask, speech), raw + '？。'), mask !== 0);
        add('punctuation-and-trailing-space-extra-clause', hear(prepared(mask, speech), '  ' + raw + '？。  '), false);
    }
    for (const locale of Object.keys(catalog.patterns)) for (const speech of ['short', 'gesture']) {
        add('locale-boundaries', hear(prepared(3, speech), '散歩しよう', { locale }), locale === 'ja');
        for (const kind of ['request', 'invitation'])
            add('ordinary-rest-is-cp', hear(setup({ foundation: false, life: false, speech }), catalog.proposalTeaching[locale][kind].utterance, { locale }), false);
        for (const lifeKnown of [false, true]) {
            const v = ordinary.acquire(locale, lifeKnown, speech);
            add('real-rest-scoped-invitation-not-walk', hear(v, '散歩しよう'), true);
            add('real-rest-scoped-other-speaker', hear(v, '散歩しよう', { speaker: 'visitor' }), true);
        }
    }
    for (const speech of ['short', 'gesture']) for (const mode of ['idle', 'rest', 'move', 'eat', 'work', 'walk']) {
        const v = prepared(2, speech); v.world.mode = mode;
        add('activity-does-not-complete-understanding', hear(v, '散歩しよう'), true);
    }
    for (const speech of ['short', 'gesture']) {
        for (const raw of ['休んでね', '一緒に休もう', '疲れたら休んでね', '食べ終わったら休んでね',
            '食べ終わったら散歩しよう', '木の実を食べないで', '【誘い】「散歩しよう」', '散歩しよう\n未知',
            '散歩してね', '一緒に泳ごう', '何してる？', 'もう一度教えて', 'ほっとしたの？'])
            add('other-owners-or-unsupported', hear(prepared(3, speech), raw), false);
        const v = prepared(2, speech); life.start(v, 'eat'); life.finish(v);
        add('original-observation-evidence', hear(v, '散歩しよう'), true);
        const selected = setup({ speech }); hear(selected, catalog.proposalTeaching.ja.request.utterance);
        selected.state.knowledge.relations = selected.state.knowledge.relations.filter(r => r.id !== 'invitation');
        add('original-selection-source', hear(selected, '散歩しよう'), true);
    }
    return all;
}
module.exports = { fixtures, prepared, setup, hear, core, worldApi, catalog, ordinary, life, copy, forms };
