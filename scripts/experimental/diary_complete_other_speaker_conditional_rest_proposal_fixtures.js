'use strict';
// Existing grammar, sensations and learning in disposable memory only.
const base = require('./diary_incomplete_conditional_rest_proposal_fixtures');
const { setup, hear, core, worldApi, catalog, copy, raw, life } = base;
function fixtures() {
    const all = [], add = (group, v, locale = 'ja', speaker = 'visitor', expected = true, text = raw(locale)) =>
        all.push({ group, value: hear(v, text, { locale, speaker }), expected });
    for (const locale of Object.keys(catalog.conditionTeaching)) for (const speech of ['short', 'gesture']) {
        for (const foundation of [false, true]) for (const life of [false, true])
            add('seven-locales-eight-settings', setup({ foundation, life, speech }), locale, 'visitor', foundation && life);
        for (let mask = 0; mask < 16; mask++)
            add('four-prerequisite-masks', base.prepared(mask, speech), locale, 'visitor', mask === 0);
        for (const fatigue of [.8, .55, .550001, .4, .549999, .250001, .25, .2, .249999]) {
            const v = setup({ speech }); base.condition.start(v, fatigue);
            add('sensory-thresholds', v, locale);
        }
        for (const activity of ['move', 'eat', 'ambiguous']) {
            const v = setup({ speech });
            if (activity === 'move') worldApi.approach(v.world, 'path');
            if (activity === 'eat') life.start(v, 'eat');
            if (activity === 'ambiguous') core.perceive(v.state, { scene: 'clearing',
                attention: [{ id: 'shade', meaning: 'rest' }, { id: 'path', meaning: 'walk' }] });
            add('unobserved:' + activity, v, locale);
        }
        add('existing-normalization', setup({ speech }), locale, 'visitor', true, '  ' + raw(locale).toLocaleUpperCase() + '  ');
        add('player-complete-is-m', setup({ speech }), locale, 'player', false);
        add('another-actual-speaker', setup({ speech }), locale, 'neighbor:2');
        const learned = setup({ foundation: false, life: false, speech }); base.learn(learned, locale);
        add('real-player-condition-scope-not-transferred', learned, locale, 'visitor', false);
        add('real-player-condition-complete-is-m', learned, locale, 'player', false);
        const known = setup({ life: false, speech }); base.condition.prepare(known, locale);
        add('actual-life-meaning-with-initial-relations', known, locale);
        const selected = setup({ speech }); hear(selected, catalog.proposalTeaching[locale].request.utterance, { locale });
        add('original-selection-source', selected, locale);
        for (const mode of ['rest', 'eat']) {
            const v = setup({ speech }); life.start(v, mode); life.finish(v);
            add('original-experience-observation', v, locale);
        }
        for (const text of [catalog.sequenceTeaching[locale].utterance, catalog.proposalTeaching[locale].request.utterance,
            catalog.proposalTeaching[locale].invitation.utterance, base.condition.demo('met', locale)])
            add('other-owner-controls', setup({ speech }), locale, 'visitor', false, text);
    }
    for (const speech of ['short', 'gesture']) for (const text of ['疲れたら休んでね', '散歩しよう',
        '食べ終わったら散歩しよう', '木の実を食べないで', '何してる？', '私は休んでいる',
        raw() + '\n未知', '疲れたら泳ごう', raw() + '！別の文'])
        add('generic-other-or-multiple', setup({ speech }), 'ja', 'visitor', false, text);
    return all;
}
module.exports = { fixtures, setup, hear, core, worldApi, catalog, copy, raw, life, condition: base };
