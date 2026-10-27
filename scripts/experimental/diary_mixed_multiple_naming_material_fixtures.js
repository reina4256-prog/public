'use strict';
// Actual existing grammar and receiver/responder in disposable memory only.
const base = require('./diary_multiple_complete_naming_fixtures');
const unknown = require('./diary_all_unknown_material_fixtures');
const activities = require('./diary_complete_other_speaker_proposal_fixtures');
const companions = require('./diary_greeting_material_fixtures').forms.concat('おはよう');
const questions = require('../../experimental_word_diary_questions');
const candidates = require('../../experimental_word_diary_candidates');
const { setup, focus, hear, core, worldApi, catalog, copy, life } = base;
const names = 'これをころって呼ぼう\nこれをぽぽって呼ぼう';
const raw = names + '\nおはよう';
function fixtures() {
    const all = [], add = (group, v, text = raw, options = {}, expected = true) => {
        const value = hear(v, text, options);
        if (expected && questions.capture(candidates.create(), copy(value.result), copy(value.receipt.reply))) {
            expected = false; group += ':legacy-4d2';
        }
        all.push({ group, value, expected });
    };
    for (const speech of ['short', 'gesture']) for (const speaker of ['player', 'visitor']) {
        for (const foundation of [false, true]) for (const knownLife of [false, true]) {
            for (const companion of companions) for (const reverse of [false, true])
                add('nineteen-companion-rules-and-orders', setup({ foundation, life: knownLife, speech }),
                    reverse ? companion + '\n' + names : names + '\n' + companion, { speaker }, foundation);
            for (const text of [names + '\n未知', '未知\n' + names,
                'これをころって呼ぼう\n未知\nこれをころって呼ぼう',
                names + '\n木の実をももって呼ぼう', '木の実をももって呼ぼう\n' + names])
                add('unknown-and-incomplete-naming-eight-settings', setup({ foundation, life: knownLife, speech }),
                    text, { speaker }, foundation && (text.includes('未知') || !knownLife));
        }
        for (const text of ['これはころだよ\nそれはぽぽという名前だよ\n未知',
            'ころだよ\nぽぽっていうんだ\nおはよう',
            'これを「ころ」と呼ぶよ。これを「ぽぽ」と呼ぶよ。未知',
            Array(12).fill('これをころって呼ぼう').join('\n') + '\n未知'])
            add('existing-forms-and-many-repeated-clauses', setup({ speech }), text, { speaker });
        for (const previous of ['未知', 'これをころって呼ぼう', names, raw, '木の実がある']) {
            const v = setup({ speech }); hear(v, previous, { speaker });
            add('actual-antecedent:' + previous, v, raw, { speaker });
        }
        for (const mode of ['eat', 'berry-low', 'berry-high', 'no-target', 'no-route', 'moving-no-route'])
            add('actual-activity:' + mode, focus(activities.prepared(mode, { speech })), raw, { speaker });
        for (const mode of ['rest', 'eat']) {
            const v = setup({ speech }); life.start(v, mode); life.finish(v); focus(v);
            add('actual-completed-experience:' + mode, v, raw, { speaker });
        }
        const selected = setup({ speech }); hear(selected, '休んでね', { speaker }); focus(selected);
        add('original-selection-source', selected, raw, { speaker });
        for (const ids of [[], ['berry:1', 'berry:2']])
            add('missing-or-ambiguous-target', focus(setup({ speech }), ids), raw, { speaker }, false);
        const unlearned = setup({ speech });
        unlearned.state.knowledge.relations = unlearned.state.knowledge.relations.filter(r => r.id !== 'naming');
        add('missing-naming-relation', unlearned, raw, { speaker }, false);
        for (const text of ['これをころって呼ぼう', names, names + '\nこれをももって呼ぼう',
            'これをころって呼ぼう\n未知', 'これをころって呼ぼう\n木の実をぽぽって呼ぼう',
            '未知\n未解析', 'おはよう\n未知', names + '\nさっきの説明は間違えた',
            names + '\n何を手伝った？', names + '\n荷物運びをまたやりたい？',
            names + '\nおいしかった？', names + '\nぽぽは休むことだよ'])
            add('old-owners-and-outside-rules', setup({ speech }), text, { speaker },
                text === names + '\nぽぽは休むことだよ'); // Actual parser keeps this companion unknown.
        add('one-complete-one-incomplete-stays-old-names', setup({ speech, life: false }),
            'これをころって呼ぼう\n木の実をぽぽって呼ぼう', { speaker }, false);
        for (const text of ['ころ', 'ころ\nぽぽ', 'ころ\n未知', 'ころ\nこれをぽぽって呼ぼう'])
            add('actual-dynamic-namings-stay-undecided', unknown.arrival({ speech }), text, { speaker }, false);
        const repeated = setup({ speech, life: false });
        const mixed = names + '\n木の実をももって呼ぼう'; hear(repeated, mixed, { speaker });
        add('new-input-repeated-mixed-teaching', repeated, mixed, { speaker });
        for (const locale of Object.keys(catalog.patterns)) if (locale !== 'ja')
            add('other-input-locale', setup({ speech }), raw, { speaker, locale }, false);
    }
    return all;
}
module.exports = { fixtures, setup, focus, hear, core, worldApi, catalog, copy, life, raw };
