'use strict';
// Existing Japanese grammar in disposable memory; no UI or save connection.
const base = require('./diary_remaining_clause_material_fixtures');
const activities = require('./diary_complete_other_speaker_proposal_fixtures');
const greeting = require('./diary_greeting_fixtures');
const oldQuestions = require('../../experimental_word_diary_questions');
const candidates = require('../../experimental_word_diary_candidates');
const { setup, hear, core, worldApi, catalog, copy, life, condition } = base;
const raw = 'おはよう\n休んでね';
const forms = ['食べ終わったら散歩しよう', '木の実がある', '疲れたら休んでね', '木の実を食べないで',
    'これ何？', '木の実は嫌いじゃない', '今は食べたくない', '木の実が好き', 'どうして休んだの？',
    '横になると気持ちいい', '一緒に休もう', '休んでね', '休めた？', '休むことは大事',
    '何してる？', 'すっぱくない？', 'おいしい？', '散歩しよう'];
function fixtures() {
    const all = [], add = (group, v, text = raw, options = {}, expected = true) => {
        const value = hear(v, text, options);
        if (expected && oldQuestions.capture(candidates.create(), copy(value.result), copy(value.receipt.reply))) {
            expected = false; group += ':legacy-4d2';
        }
        all.push({ group, value, expected });
    };
    for (const speech of ['short', 'gesture']) for (const speaker of ['player', 'visitor']) {
        for (const foundation of [false, true]) for (const knownLife of [false, true])
            add('single-eight-settings', setup({ speech, foundation, life: knownLife }), 'おはよう', { speaker }, !foundation);
        for (const text of forms) for (const reverse of [false, true]) for (const known of [false, true])
            add('all-eighteen-companion-rules', setup({ speech, foundation: known, life: known }),
                (reverse ? [text, 'おはよう'] : ['おはよう', text]).join('\n'), { speaker });
        for (const text of ['おはよう\n休んでね', '休んでね\nおはよう', 'おはよう\n何してる？',
            '何してる？\nおはよう', 'おはよう\n木の実がある', '木の実がある\nおはよう'])
            for (const foundation of [false, true]) for (const knownLife of [false, true])
                add('mixed-life-and-foundation', setup({ speech, foundation, life: knownLife }), text, { speaker });
        for (let mask = 0; mask < 16; mask++) {
            const v = setup({ speech });
            [['relations', 'report'], ['relations', 'request'], ['meanings', 'rest'], ['relations', 'question']]
                .forEach(([field, id], bit) => { if (mask & (1 << bit)) v.state.knowledge[field] = v.state.knowledge[field].filter(r => r.id !== id); });
            add('four-prerequisite-masks', v, 'おはよう\n休んでね\n何してる？', { speaker });
        }
        for (const text of ['おはよう\n未知', '未知\nおはよう', 'おはよう\n未知\n休んでね',
            '未知\n何してる？\nおはよう', 'おはよう\nおはよう', Array(12).fill('おはよう').join('\n'),
            'おはよー。木の実がある', 'おはようございます！', ' おはよう。 '])
            add('unknown-repetition-existing-aliases', setup({ speech, foundation: false }), text, { speaker });
        for (const mode of ['eat', 'work', 'berry-low', 'berry-high', 'no-target', 'no-route', 'moving-no-route'])
            add('actual-activity:' + mode, activities.prepared(mode, { speech }), raw, { speaker });
        for (const mode of ['rest', 'eat']) {
            const v = setup({ speech }); life.start(v, mode); life.finish(v);
            add('original-experience-observation', v, raw, { speaker });
        }
        const selected = setup({ speech }); hear(selected, '休んでね');
        add('original-selection-source', selected, raw, { speaker });
        const learned = setup({ foundation: false, life: false, speech }); base.base.learn(learned, 'ja');
        add('actual-condition-learning-no-greeting-scope-transfer', learned, raw, { speaker });
        for (const text of ['休んでね', '未知', '未知\n未知', '休んでね\n散歩しよう',
            'おはよう\n木の実をモコと呼ぼう', 'おはよう\nさっきの説明は間違えた',
            'おはよう\n何を手伝った？', 'おはよう\n荷物運びをまたやりたい？',
            'おはよう\nおいしかった？']) add('reserved-and-outside-domain', setup({ speech }), text, { speaker }, false);
        const previous = setup({ speech }); hear(previous, '休むことは大事', { speaker });
        add('df-recovery-not-rescued', previous, 'おはよう\n体力や眠気が回復するからね', { speaker }, false);
        const named = setup({ speech }); hear(named, 'これをモコと呼ぼう', { speaker });
        // Spoken name_echo creates a pending confirmation; gesture does not.
        // The same text is a real reply frame only in the former case.
        add(speech === 'short' ? 'actual-reply-frame-outside-domain' : 'unresolved-reply-text-stays-unknown',
            named, 'おはよう\nうん', { speaker }, speech === 'gesture');
        for (const locale of Object.keys(catalog.patterns)) if (locale !== 'ja')
            add('no-new-input-locale', setup({ speech, foundation: false }), raw, { locale, speaker }, false);
    }
    for (const f of greeting.fixtures()) all.push({ group: 'at-existing-control:' + f.group, value: f.value,
        expected: f.value.result.input.locale === 'ja'
            && f.value.result.interpretations.some(frame => frame.catalogRule === 'greeting_morning')
            && (f.value.result.interpretations.length > 1 || !f.value.result.understandings[0].complete) });
    return all;
}
module.exports = { fixtures, setup, hear, core, worldApi, catalog, copy, life, condition, base: base.base, raw, forms };
