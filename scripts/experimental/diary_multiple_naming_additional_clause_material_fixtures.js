'use strict';
// Real receiver/responder in disposable memory. No game or save caller.
const names = require('./diary_multiple_complete_naming_fixtures');
const dynamic = require('./diary_dynamic_multiple_complete_naming_fixtures');
const additional = require('./diary_additional_clause_material_fixtures');
const { setup, hear, core, worldApi, catalog, copy, life } = names;
const { arrive } = dynamic;
const raw = 'これをころって呼ぼう\nこれをぽぽって呼ぼう\n何を手伝った？';
const dynamicRaw = 'ころ\nぽぽ\n何を手伝った？';
const rules = new Set(['after_eat_walk', 'berry_observation', 'conditional_rest', 'do_not_eat',
    'name_question', 'not_dislike', 'not_now', 'preference', 'reason_question', 'rest_comfort',
    'rest_invitation', 'rest_request', 'rest_result', 'rest_value', 'situation_question',
    'sour_question', 'taste_now', 'walk_invitation', 'greeting_morning', 'name', 'name_description', 'name_answer',
    'work_past', 'work_again', 'taste_question', 'rest_explanation']);
function expected(value) {
    const r = value.result, fs = r.interpretations, us = r.understandings;
    return r.input.locale === 'ja' && fs.filter((f, i) => f.kind === 'naming' && us[i].kind === 'naming' && us[i].complete).length >= 2
        && fs.some(f => Object.hasOwn(additional.forms, f.catalogRule))
        && fs.every(f => f.kind === 'unknown' || rules.has(f.catalogRule) || f.kind === 'naming' && !Object.hasOwn(f, 'catalogRule'))
        && !r.relationLearning && !r.conditionJudgment && !r.sequenceJudgment
        && !(us.at(-1).kind === 'question' && us.at(-1).complete && value.receipt.reply.message === 'answer_unknown');
}
function fixtures() {
    const rows = [], add = (group, v, text = raw, options = {}) => {
        const value = hear(v, text, options); rows.push({ group, value, expected: expected(value) });
    };
    for (const foundation of [false, true]) for (const knownLife of [false, true])
        for (const speech of ['short', 'gesture']) for (const speaker of ['player', 'visitor'])
            for (const activity of [false, true]) for (const [rule, text] of Object.entries(additional.forms))
                for (const reverse of [false, true]) {
                    const v = setup({ foundation, life: knownLife, speech });
                    if (rule === 'rest_explanation') hear(v, '休むことは大事', { speaker });
                    if (activity) arrive(v);
                    const pair = activity ? ['ころ', 'ぽぽ'] : ['これをころって呼ぼう', 'これをぽぽって呼ぼう'];
                    add('eight-settings-static-and-dynamic', v, (reverse ? [text, ...pair] : [...pair, text]).join('\n'), { speaker });
                }
    for (const activity of [false, true]) for (const text of Object.values(additional.forms))
        for (const companion of additional.anchors) for (const reverse of [false, true]) {
            const v = setup(); hear(v, '休むことは大事'); if (activity) arrive(v);
            const pair = activity ? ['ころ', 'これをぽぽって呼ぼう'] : ['これはころだよ', 'ぽぽっていうんだ'];
            add('eighteen-companions-both-orders', v, (reverse ? [companion, text, ...pair] : [...pair, text, companion]).join('\n'));
        }
    for (const activity of [false, true]) for (const previous of ['休むことは大事', '未解析!', 'これをももって呼ぼう'])
        for (const recovery of [false, true]) {
            const v = setup(); hear(v, previous); if (activity) arrive(v);
            const pair = activity ? ['ころ', 'ぽぽ'] : ['これをころって呼ぼう', 'これをぽぽって呼ぼう'];
            add('four-rules-with-actual-antecedent', v, [...pair, additional.forms.work_past, additional.forms.work_again,
                additional.forms.taste_question, ...(recovery ? [additional.forms.rest_explanation] : [])].join('\n'));
        }
    for (const activity of [false, true]) for (const knownLife of [false, true])
        for (const tail of ['未解析!', '木の実をももって呼ぼう', 'おはよう', '休んでね', 'うん', 'ぽぽは休むことだよ']) {
            const v = setup({ life: knownLife }); hear(v, '休むことは大事'); if (activity) arrive(v);
            const pair = activity ? ['ころ', 'ころ'] : ['これをころって呼ぼう', 'これをころって呼ぼう'];
            add('repetition-unknown-and-incomplete-clauses', v, [...pair, additional.forms.work_past, tail].join('\n'));
        }
    for (const activity of [false, true]) for (const ids of [[], ['berry:1', 'berry:2'], ['berry:2']]) {
        const v = setup(); if (activity) arrive(v); names.focus(v, ids);
        add('attention-cardinality', v, activity ? dynamicRaw : raw);
    }
    for (const speech of ['short', 'gesture']) {
        const missing = setup({ speech }); missing.state.knowledge.relations = missing.state.knowledge.relations.filter(r => r.id !== 'naming');
        add('missing-naming-relation', missing);
        for (const text of Object.values(additional.forms)) for (const count of [0, 1, 2]) {
            const v = setup({ speech }); hear(v, '休むことは大事');
            add('single-name-and-existing-owner-controls', v, ['これをころって呼ぼう', 'これをぽぽって呼ぼう'].slice(0, count).concat(text).join('\n'));
        }
        for (const text of ['これをころって呼ぼう\nこれをぽぽって呼ぼう',
            'これをころって呼ぼう\nこれをぽぽって呼ぼう\nおはよう',
            raw + '\nさっきの説明は間違えた', raw + '\nぽぽは休むことだよ'])
            add('reserved-other-rules', setup({ speech }), text);
        const noPrior = setup({ speech });
        add('recovery-without-real-prior-is-unknown', noPrior, 'これをころって呼ぼう\nこれをぽぽって呼ぼう\n体力や眠気が回復するからね');
        const repeated = setup({ speech }); hear(repeated, raw); add('new-input-after-same-naming', repeated);
        for (const mode of ['rest', 'eat']) {
            const v = setup({ speech }); life.start(v, mode); life.finish(v); names.focus(v);
            add('completed-experience:' + mode, v);
        }
        const selected = setup({ speech }); hear(selected, '休んでね'); add('existing-selection-source', selected);
    }
    for (const locale of Object.keys(catalog.patterns)) if (locale !== 'ja') add('other-locale', setup(), raw, { locale });
    for (const row of dynamic.fixtures()) rows.push({ group: 'dm-control:' + row.group, value: row.value, expected: expected(row.value) });
    return rows;
}
module.exports = { fixtures, expected, setup, hear, arrive, core, worldApi, catalog, copy, life, raw, dynamicRaw,
    arrived: dynamic.setup, forms: additional.forms };
