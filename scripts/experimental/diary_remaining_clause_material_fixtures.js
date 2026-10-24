'use strict';
// Actual existing receiver/responder, disposable memory, never a player save.
const base = require('./diary_incomplete_conditional_rest_proposal_fixtures');
const activities = require('./diary_complete_other_speaker_proposal_fixtures');
const oldQuestions = require('../../experimental_word_diary_questions');
const candidates = require('../../experimental_word_diary_candidates');
const { setup, hear, core, worldApi, catalog, copy, life, condition } = base;
const raw = '疲れたら休んでね\n一緒に休もう';
const pairs = [raw, '疲れたら休んでね\n疲れたら休んでね', '一緒に休もう\n一緒に休もう',
    '一緒に休もう\n休んでね', '一緒に休もう\n散歩しよう', '散歩しよう\n未知',
    '食べ終わったら散歩しよう\n休んでね', '食べ終わったら散歩しよう\n未知',
    '木の実を食べないで\n休んでね', '木の実を食べないで\n未知',
    '休んでね\n何してる？', '何してる？\n休んでね', 'おいしい？\n休んでね',
    '休めた？\n休んでね', 'どうして休んだの？\n休んでね', 'これ何？\n休んでね',
    'すっぱくない？\n休んでね', '何してる？\n何してる？',
    '木の実がある\n休むことは大事', '横になると気持ちいい\n木の実がある',
    '木の実が好き\n木の実は嫌いじゃない', '今は食べたくない\n木の実がある',
    '未知\n何してる？', '木の実がある\n未知'];
function mask(value, fields, number) {
    fields.forEach(([field, id], bit) => {
        if (number & (1 << bit)) value.state.knowledge[field] = value.state.knowledge[field].filter(item => item.id !== id);
    });
    return value;
}
function fixtures() {
    const all = [], add = (group, v, text = raw, options = {}, expected = true) => {
        const value = hear(v, text, options);
        // The older owner is the oracle for its actual answer_unknown gate.
        // In particular a current-activity question can lack life vocabulary.
        if (expected && oldQuestions.capture(candidates.create(), copy(value.result), copy(value.receipt.reply))) {
            expected = false; group += ':legacy-4d2';
        }
        all.push({ group, value, expected });
    };
    for (const speech of ['short', 'gesture']) for (const speaker of ['player', 'visitor']) {
        for (const text of pairs) for (const foundation of [false, true]) for (const knownLife of [false, true])
            add('eight-settings-all-clause-families', setup({ speech, foundation, life: knownLife }), text, { speaker });
        for (const text of [raw, '疲れたら休んでね\n疲れたら休んでね', '散歩しよう\n未知']) {
            const fields = [['meanings', 'rest'], ['meanings', 'tired'], ['meanings', 'walk'],
                ['relations', 'request'], ['relations', 'condition'], ['relations', 'invitation']];
            for (let n = 0; n < 64; n++) add('six-prerequisite-masks', mask(setup({ speech }), fields, n), text, { speaker });
        }
        for (const [text, fields] of [
            ['木の実を食べないで\n休んでね', [['meanings', 'eat'], ['relations', 'request'], ['relations', 'negation']]],
            ['何してる？\n木の実がある', [['meanings', 'berry'], ['relations', 'question'], ['relations', 'report']]],
            ['食べ終わったら散歩しよう\n未知', [['meanings', 'eat'], ['meanings', 'walk'], ['relations', 'invitation'], ['relations', 'sequence']]]
        ]) for (let n = 0; n < 2 ** fields.length; n++) add('other-clause-prerequisite-masks', mask(setup({ speech }), fields, n), text, { speaker });
        for (const text of ['休んでね\n散歩しよう\n一緒に休もう', '休んでね\n未知\n未知',
            '未知\n何してる？\n休んでね', '木の実がある\n何してる？\n木の実を食べないで',
            Array(12).fill('一緒に休もう').join('\n')]) add('three-and-more-clauses', setup({ speech }), text, { speaker });
        for (const text of ['疲れたら、少し休んで。一緒に休憩しよう',
            '一緒に休もう。今から木陰で少し休んでください', '散歩しようよ。散歩に行こう。未知',
            'それは何？。やすんでください', '横になると心地よい。休むのは大事です'])
            add('existing-forms-and-period', setup({ speech }), text, { speaker });
        for (const mode of ['eat', 'work', 'berry-low', 'berry-high', 'no-target', 'no-route', 'moving-no-route'])
            add('actual-activity:' + mode, activities.prepared(mode, { speech }), raw, { speaker });
        for (const fatigue of [.2, .25, .4, .55, .8]) {
            const v = setup({ speech }); condition.start(v, fatigue);
            add('fatigue-does-not-resolve-scope', v, '疲れたら休んでね\n疲れたら休んでね', { speaker });
        }
        const noAttention = setup({ speech }); noAttention.world.attention = []; noAttention.state.context.attention = [];
        add('no-attention', noAttention, '散歩しよう\n未知', { speaker });
        const learned = setup({ foundation: false, life: false, speech }); base.learn(learned, 'ja');
        add('actual-condition-learning-no-clause-scope-transfer', learned, raw, { speaker });
        for (const mode of ['rest', 'eat']) {
            const v = setup({ speech }); life.start(v, mode); life.finish(v);
            add('original-experience-observation', v, raw, { speaker });
        }
        const selected = setup({ speech }); hear(selected, '休んでね');
        add('original-selection-source', selected, raw, { speaker });
        add('reply-without-antecedent-stays-unknown', setup({ speech }), 'うん\n木の実がある', { speaker });
        for (const text of ['休んでね', '散歩しよう', '未知', '未知\n未知',
            '休んでね\n未知', '疲れたら休んでね\n未知', '未知\n疲れたら休んでね',
            '休んでね\n散歩しよう', '散歩しよう\n休んでね', '休んでね\n休んでね',
            '散歩しよう\n散歩しよう', '疲れたら休んでね\n休んでね', '散歩しよう\n疲れたら休んでね',
            'おはよう\n休んでね', '木の実をモコと呼ぼう\n何してる？',
            '昨日は悲しかったけど今はうれしい'])
            add('reserved-and-outside-domain', setup({ speech }), text, { speaker }, false);
        // The legacy 4d2 gate owns these whole occurrences, even with other clauses.
        add('legacy-answer-unknown', setup({ speech: 'short' }), '休んでね\n休めた？', { speaker }, false);
        add('legacy-answer-unknown', setup({ speech: 'short' }), '未知\n休めた？', { speaker }, false);
        for (const locale of Object.keys(catalog.conditionTeaching)) {
            add('structured-conditional-control', setup({ speech }), base.raw(locale), { locale, speaker }, false);
            if (locale !== 'ja') add('other-locale-control', setup({ speech }), raw, { locale, speaker }, false);
        }
    }
    for (const speech of ['short', 'gesture']) add('another-speaker', setup({ speech }), raw, { speaker: 'neighbor:2' });
    return all;
}
module.exports = { fixtures, setup, hear, core, worldApi, catalog, copy, life, condition, base, raw, pairs };
