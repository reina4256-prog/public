'use strict';
// Existing sequential grammar and actual learning in disposable Node memory.
const assert = require('node:assert/strict');
const base = require('./diary_incomplete_context_question_fixtures');
const ordinary = require('./diary_proposal_fixtures');
const life = require('./diary_negation_fixtures');
const { setup, hear, core, worldApi, catalog } = base;
const copy = v => JSON.parse(JSON.stringify(v));
const raw = (locale = 'ja') => catalog.sequenceTeaching[locale].utterance;
const demo = (phase, locale) => catalog.sequenceTeaching[locale][phase] + '「' + raw(locale) + '」';
const words = { ja: ['食べる', '休む'], en: ['eat', 'rest'], 'zh-CN': ['吃', '休息'], ru: ['есть', 'отдых'],
    'es-ES': ['comer', 'descansar'], 'pt-BR': ['comer', 'descansar'], de: ['speisen', 'ausruhen'] };
function prepared(mask = 0, speech = 'short', options = {}) {
    const v = setup({ speech, ...options });
    [['meanings', 'rest'], ['meanings', 'eat'], ['relations', 'request'], ['relations', 'sequence']]
        .forEach(([field, id], bit) => {
            if (mask & (1 << bit)) v.state.knowledge[field] = v.state.knowledge[field].filter(item => item.id !== id);
        });
    return v;
}
function learn(v, locale = 'ja') {
    for (const mode of ['eat', 'rest']) if (!v.state.knowledge.meanings.some(m => m.id === mode)) {
        life.start(v, mode); life.hear(v, words[locale][mode === 'eat' ? 0 : 1], locale); life.finish(v);
        assert.ok(v.state.knowledge.meanings.some(m => m.id === mode));
    }
    for (const kind of ['request', 'invitation']) if (!v.state.knowledge.relations.some(r => r.id === kind)) {
        life.start(v, 'rest'); const item = catalog.proposalTeaching[locale][kind];
        life.hear(v, item.marker + '「' + item.utterance + '」', locale); life.finish(v);
    }
    life.start(v, 'eat'); life.hear(v, demo('before', locale), locale); life.finish(v);
    life.hear(v, demo('after', locale), locale);
    assert.ok(v.state.knowledge.relations.some(r => r.id === 'sequence' && r.source === 'experienced_relation'));
}
function fixtures() {
    const all = [], add = (group, value, expected) => all.push({ group, value, expected });
    for (const locale of Object.keys(catalog.sequenceTeaching)) for (const speech of ['short', 'gesture']) {
        for (const foundation of [false, true]) for (const life of [false, true])
            add('seven-locales-eight-settings', hear(setup({ foundation, life, speech }), raw(locale), { locale }), !foundation || !life);
        for (let mask = 0; mask < 16; mask++)
            add('four-prerequisite-masks', hear(prepared(mask, speech), raw(locale), { locale }), mask !== 0);
        for (const mask of [1, 8])
            add('existing-normalization', hear(prepared(mask, speech), '  ' + raw(locale).toLocaleUpperCase() + '  ', { locale }), true);
        for (const lifeKnown of [false, true]) {
            const v = ordinary.acquire(locale, lifeKnown, speech);
            add('actual-request-without-sequence', hear(v, raw(locale), { locale }), true);
        }
        const learned = setup({ foundation: false, life: false, speech }); learn(learned, locale);
        add('actual-sequence-complete-is-p', hear(learned, raw(locale), { locale }), false);
        const other = locale === 'ja' ? 'en' : 'ja';
        add('actual-sequence-other-locale-scope', hear(learned, raw(other), { locale: other }), true);
        add('actual-sequence-other-speaker-scope', hear(learned, raw(locale), { locale, speaker: 'visitor' }), true);
        for (const text of [catalog.conditionTeaching[locale].utterance, catalog.proposalTeaching[locale].request.utterance,
            catalog.proposalTeaching[locale].invitation.utterance, demo('before', locale), demo('after', locale)])
            add('other-owner-control', hear(prepared(15, speech), text, { locale }), false);
    }
    for (const speech of ['short', 'gesture']) {
        for (const phase of ['before', 'after', 'another-meal']) {
            const v = prepared(8, speech); life.start(v, 'eat');
            if (phase !== 'before') life.finish(v);
            if (phase === 'another-meal') life.start(v, 'eat');
            add('meal-does-not-make-a-judgment', hear(v, raw()), true);
        }
        for (const mode of ['idle', 'rest', 'move', 'eat', 'work', 'walk']) {
            const v = prepared(8, speech); v.world.mode = mode;
            add('activity-does-not-fill-understanding', hear(v, raw()), true);
        }
        for (const text of ['散歩しよう', '食べ終わったら散歩しよう', '木の実を食べないで',
            raw() + '\n未知', '何してる？', 'もう一度教えて', '食べ終わったら泳ごう', raw() + '！別の文'])
            add('other-or-multiple-or-unsupported', hear(prepared(15, speech), text), false);
        const observed = prepared(8, speech); life.start(observed, 'eat'); life.finish(observed);
        add('original-observation-evidence', hear(observed, raw()), true);
        const selected = setup({ speech }); hear(selected, catalog.proposalTeaching.ja.request.utterance);
        selected.state.knowledge.relations = selected.state.knowledge.relations.filter(r => r.id !== 'sequence');
        add('original-selection-source', hear(selected, raw()), true);
    }
    return all;
}
module.exports = { fixtures, prepared, setup, hear, core, worldApi, catalog, ordinary, life, learn, copy, raw };
