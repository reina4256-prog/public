'use strict';
// Existing conditional grammar and actual learning in disposable Node memory.
const base = require('./diary_incomplete_context_question_fixtures');
const ordinary = require('./diary_proposal_fixtures');
const life = require('./diary_negation_fixtures');
const condition = require('./diary_condition_fixtures');
const { setup, hear, core, worldApi, catalog } = base;
const copy = v => JSON.parse(JSON.stringify(v));
const raw = (locale = 'ja') => catalog.conditionTeaching[locale].utterance;
function prepared(mask = 0, speech = 'short', options = {}) {
    const v = setup({ speech, ...options });
    [['meanings', 'rest'], ['meanings', 'tired'], ['relations', 'request'], ['relations', 'condition']]
        .forEach(([field, id], bit) => {
            if (mask & (1 << bit)) v.state.knowledge[field] = v.state.knowledge[field].filter(item => item.id !== id);
        });
    return v;
}
function learn(v, locale = 'ja') {
    condition.prepare(v, locale);
    for (const status of ['met', 'unmet']) {
        condition.start(v, status === 'met' ? .8 : .2);
        condition.hear(v, condition.demo(status, locale), locale); life.finish(v);
    }
}
function fixtures() {
    const all = [], add = (group, value, expected) => all.push({ group, value, expected });
    for (const locale of Object.keys(catalog.conditionTeaching)) for (const speech of ['short', 'gesture']) {
        for (const foundation of [false, true]) for (const life of [false, true])
            add('seven-locales-eight-settings', hear(setup({ foundation, life, speech }), raw(locale), { locale }), !foundation || !life);
        for (let mask = 0; mask < 16; mask++)
            add('four-prerequisite-masks', hear(prepared(mask, speech), raw(locale), { locale }), mask !== 0);
        for (const mask of [1, 8])
            add('existing-normalization', hear(prepared(mask, speech), '  ' + raw(locale).toLocaleUpperCase() + '  ', { locale }), true);
        for (const lifeKnown of [false, true]) {
            const v = ordinary.acquire(locale, lifeKnown, speech);
            add('actual-request-without-condition', hear(v, raw(locale), { locale }), true);
        }
        const learned = setup({ foundation: false, life: false, speech }); learn(learned, locale);
        add('actual-condition-complete-is-m', hear(learned, raw(locale), { locale }), false);
        const other = locale === 'ja' ? 'en' : 'ja';
        add('actual-condition-other-locale-scope', hear(learned, raw(other), { locale: other }), true);
        add('actual-condition-other-speaker-scope', hear(learned, raw(locale), { locale, speaker: 'visitor' }), true);
        for (const text of [catalog.sequenceTeaching[locale].utterance, catalog.proposalTeaching[locale].request.utterance,
            catalog.proposalTeaching[locale].invitation.utterance, condition.demo('met', locale)])
            add('other-owner-control', hear(prepared(15, speech), text, { locale }), false);
    }
    for (const speech of ['short', 'gesture']) {
        for (const fatigue of [.8, .55, .4, .25, .2]) {
            const v = prepared(1, speech); condition.start(v, fatigue);
            add('fatigue-does-not-make-a-judgment', hear(v, raw()), true);
        }
        for (const mode of ['idle', 'rest', 'move', 'eat', 'work', 'walk']) {
            const v = prepared(8, speech); v.world.mode = mode;
            add('activity-does-not-fill-understanding', hear(v, raw()), true);
        }
        for (const text of ['散歩しよう', '食べ終わったら散歩しよう', '木の実を食べないで',
            raw() + '\n未知', '何してる？', 'もう一度教えて', '疲れたら泳ごう', 'あなたが疲れていたら、休んでね！別の文'])
            add('other-or-multiple-or-unsupported', hear(prepared(15, speech), text), false);
        const observed = prepared(8, speech); life.start(observed, 'eat'); life.finish(observed);
        add('original-observation-evidence', hear(observed, raw()), true);
        const selected = setup({ speech }); hear(selected, catalog.proposalTeaching.ja.request.utterance);
        selected.state.knowledge.relations = selected.state.knowledge.relations.filter(r => r.id !== 'condition');
        add('original-selection-source', hear(selected, raw()), true);
    }
    return all;
}
module.exports = { fixtures, prepared, setup, hear, core, worldApi, catalog, ordinary, life, condition, learn, copy, raw };
