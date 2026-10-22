'use strict';
// Existing catalog forms and actual learning in disposable memory only.
const base = require('./diary_incomplete_context_question_fixtures');
const life = require('./diary_negation_fixtures');
const time = require('./diary_time_report_fixtures');
const { setup, hear, core, worldApi, catalog } = base;
const copy = value => JSON.parse(JSON.stringify(value));
function forms(locale = 'ja') {
    const all = ['self', 'player'].map(subject => catalog.reportTeaching[locale][subject].utterance);
    all.push(catalog.negationTeaching[locale].negative.utterance);
    for (const at of ['now', 'past']) for (const field of ['utterance', 'negative', 'player', 'playerNegative'])
        all.push(catalog.timeTeaching[locale][at][field]);
    return all;
}
function prepared(raw = forms()[0], mask = 1, speech = 'short', locale = 'ja') {
    const v = setup({ speech }), frame = core.interpret(raw, locale, catalog)[0];
    [['meanings', 'rest'], ...frame.relations.map(id => ['relations', id])].forEach(([field, id], bit) => {
        if (mask & (1 << bit)) v.state.knowledge[field] = v.state.knowledge[field].filter(item => item.id !== id);
    });
    return v;
}
function fixtures() {
    const all = [], add = (group, value, expected) => all.push({ group, value, expected });
    for (const locale of Object.keys(catalog.reportTeaching)) {
        for (const raw of forms(locale)) {
            const frame = core.interpret(raw, locale, catalog)[0];
            for (const speech of ['short', 'gesture']) for (let mask = 0; mask < 2 ** (frame.relations.length + 1); mask++)
                add('eleven-forms-required-masks', hear(prepared(raw, mask, speech, locale), raw, { locale }), mask !== 0);
        }
        for (const speech of ['short', 'gesture']) {
            for (const foundation of [false, true]) for (const life of [false, true])
                for (const raw of [forms(locale)[0], forms(locale)[2], forms(locale)[4]])
                    add('seven-locales-eight-settings', hear(setup({ foundation, life, speech }), raw, { locale }), !foundation || !life);
            const scoped = life.setup({ foundation: false, speech }); life.learnReport(scoped, locale);
            for (const subject of ['self', 'player'])
                add('real-report-scope-same-locale', hear(scoped, catalog.reportTeaching[locale][subject].utterance, { locale }), false);
            add('real-report-scope-other-speaker', hear(scoped, forms(locale)[0], { locale, speaker: 'visitor' }), true);
            const other = locale === 'ja' ? 'en' : 'ja';
            add('real-report-scope-other-locale', hear(scoped, forms(other)[0], { locale: other }), true);
            const limited = time.acquire(locale, true, speech);
            for (const at of ['now', 'past']) for (const field of ['utterance', 'negative', 'player', 'playerNegative'])
                add('actual-time-scope-not-negation-or-other-subject', hear(limited, catalog.timeTeaching[locale][at][field], { locale }), field !== 'utterance');
            const normalized = '  ' + forms(locale)[0].toLocaleUpperCase() + '  ';
            add('existing-normalization', hear(prepared(forms(locale)[0], 2, speech, locale), normalized, { locale }), true);
        }
    }
    for (const speech of ['short', 'gesture']) {
        for (const mode of ['idle', 'rest', 'move', 'eat', 'work', 'walk']) {
            const v = prepared(forms()[0], 2, speech); v.world.mode = mode;
            add('activity-does-not-verify-report', hear(v, forms()[0]), true);
        }
        for (const raw of ['休んでね', '散歩しよう', '木の実を食べないで', '木の実は好き', '木の実が落ちている',
            '何してる？', 'おいしい？', forms()[0] + '\n未知', forms()[0] + '？',
            catalog.reportTeaching.ja.self.marker + '「' + forms()[0] + '」'])
            add('other-owner-or-multiple-or-teaching', hear(setup({ foundation: false, speech }), raw), false);
        const observed = prepared(forms()[0], 2, speech); life.start(observed, 'eat'); life.finish(observed);
        add('original-observation-evidence', hear(observed, forms()[0]), true);
        const selected = setup({ speech }); hear(selected, catalog.proposalTeaching.ja.request.utterance);
        selected.state.knowledge.relations = selected.state.knowledge.relations.filter(r => r.id !== 'report');
        add('original-selection-source', hear(selected, forms()[0]), true);
    }
    return all;
}
module.exports = { fixtures, forms, prepared, setup, hear, core, worldApi, catalog, life, time, copy };
