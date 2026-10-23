'use strict';
// Existing receive/respond and learning in disposable memory; never a player save.
const base = require('./diary_gesture_reason_question_fixtures');
const condition = require('./diary_incomplete_conditional_rest_proposal_fixtures');
const proposals = require('./diary_complete_other_speaker_proposal_fixtures');
const { setup, hear, core, worldApi, catalog } = base;
const { life } = condition;
const copy = value => JSON.parse(JSON.stringify(value));
const raw = '疲れたら休んでね';
const forms = [raw, '疲れたら休んで', '疲れたら、少し休んでね', '疲れたら 少し休んでね',
    '  疲れたら休んでね  ', '疲れたら休んでね！'];
function fixtures() {
    const all = [], add = (group, v, text = raw, options = {}, expected = true) =>
        all.push({ group, value: hear(v, text, options), expected });
    for (const speech of ['short', 'gesture']) for (const speaker of ['player', 'visitor']) {
        for (const foundation of [false, true]) for (const life of [false, true])
            add('eight-settings', setup({ foundation, life, speech }), raw, { speaker });
        for (let mask = 0; mask < 16; mask++)
            add('four-prerequisite-masks', condition.prepared(mask, speech), raw, { speaker });
        for (const text of forms) add('existing-generic-forms', setup({ speech }), text, { speaker });
        for (const fatigue of [.8, .55, .4, .25, .2]) {
            const v = setup({ speech }); condition.condition.start(v, fatigue);
            add('fatigue-is-not-a-condition-judgment', v, raw, { speaker });
        }
        for (const mode of ['eat', 'work', 'berry-low', 'berry-high', 'no-target', 'no-route', 'moving-no-route'])
            add('actual-activity:' + mode, proposals.prepared(mode, { speech }), raw, { speaker });
        for (const lifeKnown of [false, true])
            add('real-request-scope-is-not-generic', condition.ordinary.acquire('ja', lifeKnown, speech), raw, { speaker });
        const learned = setup({ foundation: false, life: false, speech }); condition.learn(learned, 'ja');
        add('real-condition-scope-is-not-generic', learned, raw, { speaker });
        const other = setup({ foundation: false, life: false, speech }); condition.learn(other, 'en');
        add('other-language-scoped-learning', other, raw, { speaker });
        for (const mode of ['rest', 'eat']) {
            const v = setup({ speech }); life.start(v, mode); life.finish(v);
            add('original-experience-observation', v, raw, { speaker });
        }
        const selected = setup({ speech }); hear(selected, '休んでね');
        add('original-selection-source', selected, raw, { speaker });
        for (const text of ['疲れたら休んでね\n未知', '疲れたら泳ごう', '疲れたら休んでね！  ',
            '休んでね', '一緒に休もう', '散歩しよう', '食べ終わったら休んでね',
            '食べ終わったら散歩しよう', '木の実を食べないで', '何してる？', '私は休んでいる'])
            add('other-or-multiple-or-unsupported', setup({ speech }), text, { speaker }, false);
        for (const locale of Object.keys(catalog.conditionTeaching)) {
            add('structured-conditional-control', setup({ speech }), condition.raw(locale), { locale, speaker }, false);
            add('structured-sequential-control', setup({ speech }), catalog.sequenceTeaching[locale].utterance, { locale, speaker }, false);
            if (locale !== 'ja') add('generic-is-not-seven-language-syntax', setup({ speech }), raw, { locale, speaker }, false);
        }
    }
    for (const speech of ['short', 'gesture']) {
        add('another-speaker', setup({ speech }), raw, { speaker: 'neighbor:2' });
        const v = setup({ speech, life: false }); life.start(v, 'rest'); life.hear(v, '休む'); life.finish(v);
        add('actual-life-meaning-with-initial-relations', v);
    }
    return all;
}
module.exports = { fixtures, setup, hear, core, worldApi, catalog, copy, life, condition, raw };
