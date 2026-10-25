'use strict';
// Actual receiver/responder in disposable memory. No player-save dependency.
const base = require('./diary_incomplete_conditional_rest_proposal_fixtures');
const activities = require('./diary_complete_other_speaker_proposal_fixtures');
const work = require('./diary_work_observation_question_fixtures');
const oldQuestions = require('../../experimental_word_diary_questions');
const candidates = require('../../experimental_word_diary_candidates');
const { setup, hear, core, worldApi, catalog, copy, life, condition } = base;
const forms = { work_past: '何を手伝った？', work_again: '荷物運びをまたやりたい？',
    taste_question: 'おいしかった？', rest_explanation: '体力や眠気が回復するからね' };
const anchors = ['食べ終わったら散歩しよう', '木の実がある', '疲れたら休んでね', '木の実を食べないで',
    'これ何？', '木の実は嫌いじゃない', '今は食べたくない', '木の実が好き', 'どうして休んだの？',
    '横になると気持ちいい', '一緒に休もう', '休んでね', '休めた？', '休むことは大事',
    '何してる？', 'すっぱくない？', 'おいしい？', '散歩しよう'];
const raw = forms.work_past + '\n休んでね';
function prior(v, text = '休むことは大事', options = {}) { return hear(v, text, options); }
function material(v, text, options = {}, antecedent = null) {
    const value = hear(v, text, options);
    if (antecedent) value.receipt.antecedent = copy(antecedent);
    return value;
}
function fixtures() {
    const all = [], add = (group, v, text = raw, options = {}, expected = true, antecedent = null) => {
        const value = material(v, text, options, antecedent);
        if (expected && oldQuestions.capture(candidates.create(), copy(value.result), copy(value.receipt.reply))) {
            expected = false; group += ':legacy-4d2';
        }
        all.push({ group, value, expected });
    };
    for (const speech of ['short', 'gesture']) for (const speaker of ['player', 'visitor']) {
        for (const [rule, text] of Object.entries(forms)) {
            for (const foundation of [false, true]) for (const knownLife of [false, true])
                for (const anchor of ['休んでね', '何してる？', '木の実がある']) for (const reverse of [false, true]) {
                    const v = setup({ speech, foundation, life: knownLife });
                    const a = rule === 'rest_explanation' ? prior(v, undefined, { speaker }) : null;
                    add('eight-settings-four-entries', v, (reverse ? [anchor, text] : [text, anchor]).join('\n'),
                        { speaker }, rule !== 'rest_explanation' || knownLife, a);
                }
            const v = setup({ speech }), a = rule === 'rest_explanation' ? prior(v, undefined, { speaker }) : null;
            add('three-clauses-with-unknown', v, text + '\n未知\n休んでね', { speaker }, true, a);
        }
        for (const first of Object.values(forms)) for (const second of Object.values(forms)) {
            const v = setup({ speech });
            const a = [first, second].includes(forms.rest_explanation) ? prior(v, undefined, { speaker }) : null;
            add('four-entry-pairs-including-repetition', v, first + '\n' + second, { speaker }, true, a);
        }
        for (const mask of Array.from({ length: 16 }, (_, i) => i)) {
            const v = setup({ speech }), a = prior(v, undefined, { speaker });
            [['meanings', 'rest'], ['relations', 'report'], ['relations', 'reason'], ['relations', 'request']]
                .forEach(([field, id], bit) => { if (mask & (1 << bit)) v.state.knowledge[field] = v.state.knowledge[field].filter(item => item.id !== id); });
            add('recovery-current-prerequisite-masks', v, forms.rest_explanation + '\n休んでね', { speaker }, true, a);
        }
        for (const text of ['休むことは大事', '休んでね', '一緒に休もう', catalog.reportTeaching.ja.self.utterance]) {
            const v = setup({ speech }), a = prior(v, text, { speaker: speaker === 'player' ? 'visitor' : 'player' });
            add('different-actual-prior-rest-and-speaker', v, forms.rest_explanation + '\n木の実がある', { speaker }, true, a);
        }
        for (const mode of ['eat', 'work', 'berry-low', 'berry-high', 'no-target', 'no-route', 'moving-no-route']) {
            const v = activities.prepared(mode, { speech }), a = prior(v);
            add('actual-activity:' + mode, v, forms.rest_explanation + '\n' + forms.work_past, { speaker }, true, a);
        }
        for (const fatigue of [.2, .25, .4, .55, .8]) {
            const v = setup({ speech }), a = prior(v); v.world.fatigue = fatigue;
            add('fatigue-not-causal-understanding', v, forms.rest_explanation + '\n疲れたら休んでね', { speaker }, true, a);
        }
        for (const mode of ['rest', 'eat']) {
            const v = setup({ speech }); life.start(v, mode); life.finish(v);
            add('original-experience-observation', v, raw, { speaker });
        }
        const selected = setup({ speech }); hear(selected, '休んでね');
        add('original-selection-source', selected, raw, { speaker });
        const working = work.working('farming', { speech });
        add('actual-work-observation', working, raw, { speaker }); work.finishWork(working);
        add('actual-completed-work-no-answer-promotion', working, raw, { speaker });
        const learned = setup({ speech, foundation: false, life: false }); base.learn(learned);
        add('actual-scoped-learning-no-transfer', learned, raw, { speaker });
        for (const text of ['何を手伝った？', '荷物運びをまたやりたい？', 'おいしかった？', forms.rest_explanation,
            '休んでね\n散歩しよう', '休んでね\n未知', '休んでね\n休んでね', '疲れたら休んでね\n休んでね',
            '未知\n未知', '何してる？\n休んでね', 'おはよう\n' + forms.work_past,
            '木の実をモコと呼ぼう\n' + forms.work_past, 'さっきの説明は間違えた\n' + forms.work_past]) {
            const v = setup({ speech }), a = prior(v);
            add('old-owners-and-outside-domain', v, text, { speaker }, false, a);
        }
        for (const locale of Object.keys(catalog.conditionTeaching)) if (locale !== 'ja')
            add('other-locale', setup({ speech }), raw, { locale, speaker }, false);
        add('no-prior-rest-becomes-unknown', setup({ speech }), forms.rest_explanation + '\n休んでね', { speaker }, false);
        const missing = setup({ speech }); prior(missing);
        add('real-prior-but-receipt-missing', missing, forms.rest_explanation + '\n休んでね', { speaker }, false);
        const intervened = setup({ speech }), earlier = prior(intervened); hear(intervened, 'おはよう');
        add('intervening-input-does-not-rescue-prior', intervened, forms.rest_explanation + '\n休んでね', { speaker }, false, earlier);
    }
    // Each de rule and each new entry, in both orders, with actual prior material.
    for (const speech of ['short', 'gesture']) for (const [rule, text] of Object.entries(forms))
        for (const anchor of anchors) for (const reverse of [false, true]) {
            const v = setup({ speech }), a = rule === 'rest_explanation' ? prior(v) : null;
            add('all-eighteen-existing-companion-rules', v, (reverse ? [anchor, text] : [text, anchor]).join('\n'), {}, true, a);
        }
    for (const text of ['どんな仕事をしたの？。休憩してください', 'また手伝いたい？。木の実がある',
        '美味しかった？。休んでね', 'うん、体力や眠気が回復するからね。休んでね',
        forms.rest_explanation + '\n' + forms.work_past + '\n未知\n散歩しよう',
        Array(10).fill(forms.taste_question).join('\n')]) {
        // These two work-slot aliases are parsed first as situation_question,
        // so their existing de ownership is retained rather than relabelled.
        const expected = !['どんな仕事をしたの？。休憩してください', 'また手伝いたい？。木の実がある'].includes(text);
        const v = setup(), a = prior(v); add('existing-aliases-and-more-clauses', v, text, {}, expected, a);
    }
    return all;
}
module.exports = { fixtures, setup, hear, material, prior, core, worldApi, catalog, copy, life, condition, base, raw, forms, anchors };
