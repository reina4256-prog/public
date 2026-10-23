'use strict';
// Actual existing receive/respond in disposable memory, never a player save.
const base = require('./diary_incomplete_conditional_rest_proposal_fixtures');
const proposals = require('./diary_complete_other_speaker_proposal_fixtures');
const { setup, hear, core, worldApi, catalog, copy, life, condition } = base;
const raw = '休んでね\n未知';
function fixtures() {
    const all = [], add = (group, v, text = raw, options = {}, expected = true) =>
        all.push({ group, value: hear(v, text, options), expected });
    for (const speech of ['short', 'gesture']) for (const speaker of ['player', 'visitor']) {
        for (const form of ['休んでね', '疲れたら休んでね']) for (const first of [false, true]) for (const separator of ['\n', '。']) {
            const text = first ? '未知' + separator + form : form + separator + '未知';
            const masks = form === '休んでね' ? [0, 1, 4, 5] : Array.from({ length: 16 }, (_, i) => i);
            for (const mask of masks) add('all-prerequisite-masks', base.prepared(mask, speech), text, { speaker });
            const v = setup({ speech }); v.world.attention = []; v.state.context.attention = [];
            add('no-attention-no-association', v, text, { speaker });
        }
        for (const foundation of [false, true]) for (const life of [false, true])
            for (const text of [raw, '未知\n疲れたら休んでね'])
                add('eight-settings', setup({ foundation, life, speech }), text, { speaker });
        for (const text of [' 休んでね。未知', '未対応節\n休んでね', '疲れたら、少し休んでね\n未知'])
            add('existing-parser-forms', setup({ speech }), text, { speaker });
        for (const fatigue of [.8, .55, .4, .25, .2]) {
            const v = setup({ speech }); condition.start(v, fatigue);
            add('sensation-without-condition-judgment', v, '疲れたら休んでね\n未知', { speaker });
        }
        for (const mode of ['eat', 'work', 'berry-low', 'berry-high', 'no-target', 'no-route', 'moving-no-route'])
            add('actual-activity:' + mode, proposals.prepared(mode, { speech }), raw, { speaker });
        for (const lifeKnown of [false, true])
            add('real-request-learning-scope', base.ordinary.acquire('ja', lifeKnown, speech), raw, { speaker });
        const learned = setup({ foundation: false, life: false, speech }); base.learn(learned, 'ja');
        add('real-condition-learning-scope', learned, '疲れたら休んでね\n未知', { speaker });
        for (const mode of ['rest', 'eat']) {
            const v = setup({ speech }); life.start(v, mode); life.finish(v);
            add('original-experience-observation', v, raw, { speaker });
        }
        const selected = setup({ speech }); hear(selected, '休んでね');
        add('original-selection-source', selected, raw, { speaker });
        for (const text of ['休んでね', '疲れたら休んでね', '未知', '休む', '疲れたら泳ごう',
            '食べ終わったら休んでね', '休んでね\n未知\n未知', '休んでね\n散歩しよう',
            '未知\n一緒に休もう', '未知\n散歩しよう', '未知\n何してる？', '未知\n私は休んでいる'])
            add('other-or-single-or-multiple', setup({ speech }), text, { speaker }, false);
        for (const locale of Object.keys(catalog.conditionTeaching)) {
            add('structured-conditional-control', setup({ speech }), base.raw(locale), { locale, speaker }, false);
            add('structured-sequential-control', setup({ speech }), catalog.sequenceTeaching[locale].utterance, { locale, speaker }, false);
            if (locale !== 'ja') add('other-language-control', setup({ speech }), raw, { locale, speaker }, false);
        }
    }
    for (const speech of ['short', 'gesture']) {
        add('another-speaker', setup({ speech }), raw, { speaker: 'neighbor:2' });
        const v = setup({ speech, life: false }); life.start(v, 'rest'); life.hear(v, '休む'); life.finish(v);
        add('actual-life-meaning', v);
    }
    return all;
}
module.exports = { fixtures, setup, hear, core, worldApi, catalog, copy, life, condition, base, raw };
