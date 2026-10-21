'use strict';
// Existing inputs and actual owner learning in disposable memory; no player data.
const base = require('./diary_incomplete_context_question_fixtures');
const ordinary = require('./diary_proposal_fixtures');
const life = require('./diary_negation_fixtures');
const { setup, hear, core, worldApi, catalog } = base;
const copy = v => JSON.parse(JSON.stringify(v));
function prepared(mask = 0, speech = 'short', kind = 'request', options = {}) {
    const v = setup({ speech, ...options });
    if (mask & 1) v.state.knowledge.meanings = v.state.knowledge.meanings.filter(m => m.id !== 'rest');
    if (mask & 2) v.state.knowledge.relations = v.state.knowledge.relations.filter(r => r.id !== kind);
    return v;
}
function fixtures() {
    const all = [], add = (group, value, expected) => all.push({ group, value, expected });
    for (const [locale, forms] of Object.entries(catalog.proposalTeaching)) for (const kind of ['request', 'invitation']) {
        for (const foundation of [false, true]) for (const life of [false, true]) for (const speech of ['short', 'gesture'])
            add('seven-language-eight-settings', hear(setup({ foundation, life, speech }), forms[kind].utterance, { locale }), !foundation || !life);
        for (const speech of ['short', 'gesture']) for (let mask = 0; mask < 4; mask++)
            add('meaning-and-relation-masks', hear(prepared(mask, speech, kind), forms[kind].utterance, { locale }), mask !== 0);
        // Actual scoped learning remains tied to its original locale, speaker and form.
        for (const speech of ['short', 'gesture']) for (const lifeKnown of [false, true]) {
            const v = ordinary.acquire(locale, lifeKnown, speech);
            add('real-scoped-same-form-complete', hear(v, forms[kind].utterance, { locale }), false);
            add('real-scoped-other-speaker', hear(v, forms[kind].utterance, { locale, speaker: 'visitor' }), true);
            const other = locale === 'ja' ? 'en' : 'ja';
            add('real-scoped-other-language', hear(v, catalog.proposalTeaching[other][kind].utterance, { locale: other }), true);
        }
    }
    const variants = {
        ja: ['休んでね', '今から木陰で少し休んでください', 'ちょっとやすんで', '休もう', '少し休憩しよう', '一緒に休もうよ'],
        en: ['rest a little', 'let us rest', "let's rest"], 'zh-CN': ['休息一下吧', '一起休息吧'],
        ru: ['давай отдохнём'], 'es-ES': ['descansemos un poco'], 'pt-BR': ['vamos descansar um pouco'], de: ['ruhen wir uns etwas aus']
    };
    for (const [locale, forms] of Object.entries(variants)) for (const raw of forms) for (const speech of ['short', 'gesture']) {
        const v = setup({ speech, foundation: false });
        add('existing-forms-and-normalization', hear(v, raw, { locale }), true);
        add('existing-forms-and-normalization', hear(v, '  ' + raw.toLocaleUpperCase() + '  ', { locale }), true);
    }
    for (const speech of ['short', 'gesture']) for (const mode of ['idle', 'rest', 'move', 'eat', 'work', 'walk']) {
        const v = prepared(2, speech); v.world.mode = mode;
        add('activity-does-not-complete-understanding', hear(v, '休んでね'), true);
    }
    for (const speech of ['short', 'gesture']) {
        for (const raw of ['散歩しよう', '一緒に散歩に行こう', '疲れたら休んでね', '食べ終わったら休んでね',
            '食べ終わったら散歩しよう', '木の実を食べないで', '【お願い】「休んでね」', '休んでね\n未知',
            '一緒に泳ごう', '何してる？', 'もう一度教えて', '休むって？', 'ほっとしたの？'])
            add('other-owners-or-unsupported', hear(setup({ speech, foundation: false }), raw), false);
        const v = setup({ speech }); life.start(v, 'eat'); life.finish(v);
        v.state.knowledge.relations = v.state.knowledge.relations.filter(r => r.id !== 'request');
        add('original-observation-evidence', hear(v, '休んでね'), true);
        const scoped = ordinary.acquire('ja', true, speech);
        add('learned-scope-other-form', hear(scoped, '今から木陰で少し休んでください'), true);
    }
    return all;
}
module.exports = { fixtures, prepared, setup, hear, core, worldApi, catalog, ordinary, life, copy };
