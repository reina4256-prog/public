'use strict';
// Existing forms, actual receive/respond and learning in disposable memory only.
const base = require('./diary_incomplete_activity_report_fixtures');
const { setup, hear, forms, prepared, core, worldApi, catalog, life, copy } = base;
function learnReport(value, locale = 'ja', speaker = 'visitor') {
    for (const subject of ['self', 'player']) {
        life.start(value, 'rest'); const item = catalog.reportTeaching[locale][subject];
        hear(value, `${item.marker}「${item.utterance}」`, { locale, speaker }); life.finish(value);
    }
}
function fixtures() {
    const all = [], add = (group, value, expected) => all.push({ group, value, expected });
    for (const locale of Object.keys(catalog.reportTeaching)) {
        for (const raw of forms(locale)) {
            const frame = core.interpret(raw, locale, catalog)[0];
            for (const speech of ['short', 'gesture']) {
                for (const speaker of ['visitor', 'neighbor'])
                    add('complete-other-speakers-eleven-forms', hear(setup({ speech }), raw, { locale, speaker }), true);
                for (let mask = 1; mask < 2 ** (frame.relations.length + 1); mask++)
                    add('required-knowledge-missing-cu', hear(prepared(raw, mask, speech, locale), raw, { locale, speaker: 'visitor' }), false);
                add('complete-player-old-owners', hear(setup({ speech }), raw, { locale }), false);
            }
        }
        for (const foundation of [false, true]) for (const life of [false, true]) for (const speech of ['short', 'gesture'])
            for (const raw of [forms(locale)[0], forms(locale)[2], forms(locale)[4]])
                add('seven-locales-eight-settings', hear(setup({ foundation, life, speech }), raw, { locale, speaker: 'visitor' }), foundation && life);
        for (const speech of ['short', 'gesture']) {
        const scoped = setup({ foundation: false, speech }); life.learnReport(scoped, locale);
            for (const subject of ['self', 'player']) {
                const raw = catalog.reportTeaching[locale][subject].utterance;
                add('actual-player-scope-not-transferred', hear(scoped, raw, { locale, speaker: 'visitor' }), false);
                add('actual-other-speaker-scope-not-transferred', hear(scoped, raw, { locale, speaker: 'neighbor' }), false);
            }
            const attempted = setup({ foundation: false, speech }); learnReport(attempted, locale);
            add('other-speaker-teaching-does-not-establish-scope', hear(attempted, forms(locale)[0], { locale, speaker: 'visitor' }), false);
            const other = locale === 'ja' ? 'en' : 'ja';
            add('actual-other-locale-scope-not-transferred', hear(scoped, forms(other)[0], { locale: other, speaker: 'visitor' }), false);
            const normalized = '  ' + forms(locale)[0].toLocaleUpperCase() + '  ';
            add('existing-normalization', hear(setup({ speech }), normalized, { locale, speaker: 'visitor' }), true);
        }
    }
    for (const speech of ['short', 'gesture']) {
        for (const mode of ['idle', 'rest', 'move', 'eat', 'work', 'walk']) {
            const v = setup({ speech }); v.world.mode = mode;
            add('heard-activity-does-not-verify-report', hear(v, forms()[0], { speaker: 'visitor' }), true);
        }
        for (const raw of ['休んでね', '散歩しよう', '木の実を食べないで', '木の実は好き', '木の実が落ちている',
            '何してる？', 'おいしい？', forms()[0] + '\n未知', forms()[0] + '？',
            catalog.reportTeaching.ja.self.marker + '「' + forms()[0] + '」'])
            add('other-input-or-teaching', hear(setup({ speech }), raw, { speaker: 'visitor' }), false);
        const observed = setup({ speech }); life.start(observed, 'eat'); life.finish(observed);
        add('original-observation-evidence', hear(observed, forms()[0], { speaker: 'visitor' }), true);
        const selected = setup({ speech }); hear(selected, catalog.proposalTeaching.ja.request.utterance);
        add('original-selection-source', hear(selected, forms()[0], { speaker: 'visitor' }), true);
    }
    return all;
}
module.exports = { fixtures, setup, hear, forms, prepared, core, worldApi, catalog, life, copy, learnReport };
