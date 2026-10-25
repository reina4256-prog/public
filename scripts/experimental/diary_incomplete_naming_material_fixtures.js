'use strict';
// Existing naming grammar and actual receiver/responder in disposable memory.
const base = require('./diary_remaining_clause_material_fixtures');
const activities = require('./diary_complete_other_speaker_proposal_fixtures');
const nameResponses = require('./diary_name_response_fixtures');
const oldQuestions = require('../../experimental_word_diary_questions');
const candidates = require('../../experimental_word_diary_candidates');
const { setup, hear, core, worldApi, catalog, copy, life, condition } = base;
const raw = '木の実をモコと呼ぼう\n休んでね';
const forms = require('./diary_greeting_material_fixtures').forms.concat('おはよう');
const names = ['木の実をモコと呼ぼう', 'これはモコだよ', 'モコだよ'];
function focus(v, ids = ['berry:1']) {
    core.perceive(v.state, { scene: v.state.context.scene, attention: ids.map(id => ({ id, meaning: 'berry' })) });
    return v;
}
function fixtures() {
    const all = [], add = (group, v, text = raw, options = {}, expected = true) => {
        const value = hear(v, text, options);
        if (expected && oldQuestions.capture(candidates.create(), copy(value.result), copy(value.receipt.reply))) {
            expected = false; group += ':legacy-4d2';
        }
        all.push({ group, value, expected });
    };
    for (const speech of ['short', 'gesture']) for (const speaker of ['player', 'visitor']) {
        for (const text of names) for (const foundation of [false, true]) for (const knownLife of [false, true])
            add('single-three-forms-eight-settings', setup({ speech, foundation, life: knownLife }), text, { speaker }, text === names[0] || !foundation);
        for (const text of forms) for (const reverse of [false, true]) for (const known of [false, true])
            add('all-nineteen-companion-rules', setup({ speech, foundation: known, life: known }),
                (reverse ? [text, names[0]] : [names[0], text]).join('\n'), { speaker });
        for (const text of ['これはモコだよ\n木の実がある', '木の実がある\nモコだよ', 'モコだよ\n何してる？'])
            for (const foundation of [false, true]) for (const knownLife of [false, true])
                add('other-naming-forms-mixed-settings', setup({ speech, foundation, life: knownLife }), text, { speaker }, !foundation);
        for (const ids of [[], ['berry:1'], ['berry:1', 'berry:2']]) for (const known of [false, true]) {
            const v = focus(setup({ speech, foundation: known, life: known }), ids);
            add(ids.length === 1 ? 'individual-target-unknown-relation-or-complete' : 'missing-or-ambiguous-target',
                v, 'これをころって呼ぼう', { speaker }, !known || ids.length !== 1);
        }
        for (let mask = 0; mask < 8; mask++) {
            const v = focus(setup({ speech }));
            [['relations', 'naming'], ['relations', 'report'], ['meanings', 'berry']].forEach(([field, id], bit) => {
                if (mask & (1 << bit)) v.state.knowledge[field] = v.state.knowledge[field].filter(r => r.id !== id);
            });
            add('naming-report-meaning-prerequisite-masks', v, '木の実をモコと呼ぼう\n木の実がある', { speaker }, !!(mask & 5));
        }
        for (const text of ['木の実をモコと呼ぼう\n未知', '未知\nこれはモコだよ',
            '木の実をモコと呼ぼう\n未知\n休んでね', 'これはモコだよ\nモコだよ',
            Array(12).fill('これはモコだよ').join('\n'), ' これはモコだよ。 ', 'これを「ころ」と呼ぶよ'])
            add('incomplete-unknown-repetition-and-existing-aliases', setup({ speech, foundation: false }), text, { speaker });
        for (const mode of ['eat', 'work', 'berry-low', 'berry-high', 'no-target', 'no-route', 'moving-no-route'])
            add('actual-activity:' + mode, activities.prepared(mode, { speech, foundation: false }), raw, { speaker });
        for (const mode of ['rest', 'eat']) {
            const v = setup({ speech }); life.start(v, mode); life.finish(v);
            v.state.knowledge.relations = v.state.knowledge.relations.filter(r => r.id !== 'naming');
            add('original-experience-observation', v, raw, { speaker });
        }
        const selected = setup({ speech }); hear(selected, '休んでね');
        add('original-selection-source', selected, raw, { speaker });
        const learned = setup({ foundation: false, life: false, speech }); base.base.learn(learned, 'ja');
        add('actual-condition-learning-does-not-fill-naming', learned, raw, { speaker });
        for (const text of ['これをころって呼ぼう', 'これをころって呼ぼう\n休んでね',
            'これをころって呼ぼう\n木の実をモコと呼ぼう', 'これをころって呼ぼう\nこれをモコと呼ぼう'])
            add('complete-naming-remains-outside-even-mixed', focus(setup({ speech })), text, { speaker }, false);
        for (const text of ['未知', '未知\n未知', '休んでね', 'おはよう', '木の実がある\n休んでね',
            '木の実をモコと呼ぼう\nさっきの説明は間違えた', '木の実をモコと呼ぼう\n何を手伝った？',
            '木の実をモコと呼ぼう\n荷物運びをまたやりたい？', '木の実をモコと呼ぼう\nおいしかった？',
            'さっき間違えた。ころは木の実のことだよ'])
            add('reserved-and-outside-domain', setup({ speech }), text, { speaker }, false);
        const previous = setup({ speech }); hear(previous, '休むことは大事', { speaker });
        add('df-recovery-not-rescued', previous, '木の実をモコと呼ぼう\n体力や眠気が回復するからね', { speaker }, false);
        const dynamic = nameResponses.setup({ speech, foundation: false });
        dynamic.state.context.pendingQuestion = { kind: 'ask_name', target: 'berry:1', speaker, expires: 10 };
        add('dynamic-naming-without-catalog-rule', dynamic, 'ころ', { speaker }, false);
        for (const locale of Object.keys(catalog.patterns)) if (locale !== 'ja')
            add('no-new-input-locale', setup({ speech }), raw, { locale, speaker }, false);
    }
    for (const f of nameResponses.fixtures()) all.push({ group: 'as-existing-control:' + f.group, value: f.value, expected: false });
    return all;
}
module.exports = { fixtures, setup, hear, core, worldApi, catalog, copy, life, condition, base: base.base, raw, forms, focus };
