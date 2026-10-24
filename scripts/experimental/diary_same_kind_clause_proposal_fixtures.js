'use strict';
// Actual existing receive/respond in disposable memory, never a player save.
const base = require('./diary_incomplete_conditional_rest_proposal_fixtures');
const proposals = require('./diary_complete_other_speaker_proposal_fixtures');
const { setup, hear, core, worldApi, catalog, copy, life, condition } = base;
const raw = '休んでね\n休んでね';
const forms = [
    ['休んでね', '今から木陰で少し休んでください', 'ちょっとやすんで', 'やすんでください', '少し休んでね'],
    ['散歩しよう', '散歩しようよ', '散歩に行こう', '一緒に散歩しよう', '一緒に散歩しようよ', '一緒に散歩に行こう']
];
function prepared(mask = 0, speech = 'short') {
    const v = setup({ speech });
    [['meanings', 'rest'], ['meanings', 'walk'], ['relations', 'request'], ['relations', 'invitation']]
        .forEach(([field, id], bit) => {
            if (mask & (1 << bit)) v.state.knowledge[field] = v.state.knowledge[field].filter(item => item.id !== id);
        });
    return v;
}
function fixtures() {
    const all = [], add = (group, v, text = raw, options = {}, expected = true) =>
        all.push({ group, value: hear(v, text, options), expected });
    for (const speech of ['short', 'gesture']) for (const speaker of ['player', 'visitor']) {
        for (const text of ['休んでね', '散歩しよう']) {
            const pair = text + '\n' + text;
            for (const separator of ['\n', '。']) for (let mask = 0; mask < 16; mask++)
                add('all-prerequisite-masks', prepared(mask, speech), text + separator + text, { speaker });
            for (const foundation of [false, true]) for (const life of [false, true])
                add('eight-settings', setup({ foundation, life, speech }), pair, { speaker });
            const noAttention = setup({ speech }); noAttention.world.attention = []; noAttention.state.context.attention = [];
            add('no-attention', noAttention, pair, { speaker });
            for (const mode of ['eat', 'work', 'berry-low', 'berry-high', 'no-target', 'no-route', 'moving-no-route'])
                add('actual-activity:' + mode, proposals.prepared(mode, { speech }), pair, { speaker });
            for (const lifeKnown of [false, true])
                add('real-request-learning-scope', base.ordinary.acquire('ja', lifeKnown, speech), pair, { speaker });
            for (const mode of ['rest', 'eat']) {
                const v = setup({ speech }); life.start(v, mode); life.finish(v);
                add('original-experience-observation', v, pair, { speaker });
            }
            const selected = setup({ speech }); hear(selected, '休んでね');
            add('original-selection-source', selected, pair, { speaker });
        }
        for (const family of forms) for (const first of family) for (const second of family)
            add('existing-parser-forms', setup({ speech }), first + '\n' + second, { speaker });
        for (const text of ['休んでね', '散歩しよう', '一緒に休もう', '疲れたら休んでね', '未知',
            '休んでね\n未知', '未知\n休んでね', '休んでね\n未知\n未知', raw + '\n未知',
            '休んでね\n散歩しよう', '散歩しよう\n休んでね', '疲れたら休んでね\n休んでね',
            '疲れたら休んでね\n散歩しよう', '一緒に休もう\n一緒に休もう', '散歩しよう\n散歩しよう\n散歩しよう',
            '休んでね\n何してる？', '休んでね\n私は休んでいる', '木の実を食べないで\n散歩しよう'])
            add('other-or-single-or-multiple', setup({ speech }), text, { speaker }, false);
        for (const locale of Object.keys(catalog.conditionTeaching)) {
            add('structured-conditional-control', setup({ speech }), base.raw(locale), { locale, speaker }, false);
            add('structured-sequential-control', setup({ speech }), catalog.sequenceTeaching[locale].utterance, { locale, speaker }, false);
            if (locale !== 'ja') for (const text of ['休んでね\n休んでね', '散歩しよう\n散歩しよう'])
                add('other-language-control', setup({ speech }), text, { locale, speaker }, false);
        }
    }
    for (const speech of ['short', 'gesture']) for (const text of ['休んでね', '散歩しよう'])
        add('another-speaker', setup({ speech }), text + '\n' + text, { speaker: 'neighbor:2' });
    return all;
}
module.exports = { fixtures, setup, hear, core, worldApi, catalog, copy, life, condition, base, prepared, raw, forms };
