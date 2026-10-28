'use strict';
// Actual existing grammar in disposable memory; never reads a player save.
const names = require('./diary_multiple_complete_naming_fixtures');
const dynamic = require('./diary_dynamic_multiple_complete_naming_fixtures');
const additional = require('./diary_additional_clause_material_fixtures');
const responses = require('./diary_name_response_fixtures');
const { setup, core, worldApi, catalog, copy, life } = names;
const { arrive } = dynamic;
const raw = 'これをころって呼ぼう\nこれをぽぽって呼ぼう\nさっきの説明は間違えた';
const dynamicRaw = 'ころ\nぽぽ\nさっきの説明は間違えた';
const rules = new Set(['after_eat_walk', 'berry_observation', 'conditional_rest', 'do_not_eat',
    'name_question', 'not_dislike', 'not_now', 'preference', 'reason_question', 'rest_comfort',
    'rest_invitation', 'rest_request', 'rest_result', 'rest_value', 'situation_question',
    'sour_question', 'taste_now', 'walk_invitation', 'greeting_morning', 'name', 'name_description', 'name_answer',
    'work_past', 'work_again', 'taste_question', 'rest_explanation', 'retract_explanation',
    'yes_reply_priority', 'no_reply_priority', 'yes_reply', 'no_reply']);
function hear(v, text, options = {}) {
    const value = names.hear(v, text, options);
    const pending = value.receipt.beforeState.context.pendingQuestion;
    if (value.result.interpretations.some(frame => frame.kind === 'reply')) {
        const origin = v.steps.find(step => step.result.input.id === pending.inputId);
        if (origin) value.receipt.origin = copy(origin);
    }
    return value;
}
function expected(value) {
    const r = value.result, fs = r.interpretations, us = r.understandings;
    return r.input.locale === 'ja'
        && fs.filter((f, i) => f.kind === 'naming' && us[i].kind === 'naming' && us[i].complete).length >= 2
        && fs.some(f => ['correction', 'reply'].includes(f.kind))
        && fs.every((f, i) => !['correction', 'reply'].includes(f.kind)
            || !us[i].complete && us[i].unresolved.some(item => item.type === 'clause_scope'))
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
            for (const activity of [false, true]) for (const previous of [null, 'これをももって呼ぼう', '休むことは大事'])
                for (const tail of ['さっきの説明は間違えた', 'うん', '違う']) for (const reverse of [false, true]) {
                    const v = setup({ foundation, life: knownLife, speech });
                    if (previous) hear(v, previous, { speaker }); if (activity) arrive(v);
                    const pair = activity ? ['ころ', 'ぽぽ'] : ['これをころって呼ぼう', 'これをぽぽって呼ぼう'];
                    add('eight-settings-prior-and-activity', v, (reverse ? [tail, ...pair] : [...pair, tail]).join('\n'), { speaker });
                }
    for (const activity of [false, true]) for (const companion of [...additional.anchors, 'おはよう',
        ...Object.values(additional.forms), '未解析!', '木の実をももって呼ぼう', 'さっきの説明は間違いだった', 'うん', '違う'])
        for (const reverse of [false, true]) {
            const v = setup(); hear(v, '休むことは大事'); if (activity) arrive(v);
            const pair = activity ? ['ころ', 'ぽぽ'] : ['これはころだよ', 'ぽぽっていうんだ'];
            add('all-companions-both-orders', v, (reverse ? [companion, 'さっきの説明は間違えた', ...pair]
                : [...pair, 'さっきの説明は間違えた', companion]).join('\n'));
        }
    for (const speech of ['short', 'gesture']) for (const count of [0, 1, 2])
        for (const tail of ['さっきの説明は間違えた', 'うん', '違う', 'ぽぽは休むことだよ', 'さっき間違えた。ぽぽは休むことだよ']) {
            const v = setup({ speech }); hear(v, 'これをももって呼ぼう');
            add('count-and-original-frame-controls', v, [...['これをころって呼ぼう', 'これをぽぽって呼ぼう'].slice(0, count), tail].join('\n'));
        }
    for (const ids of [[], ['berry:1', 'berry:2'], ['berry:2']]) add('attention-controls', names.focus(setup(), ids));
    for (const locale of Object.keys(catalog.patterns)) if (locale !== 'ja') add('other-locale', setup(), raw, { locale });
    for (const speech of ['short', 'gesture']) for (const speaker of ['player', 'visitor'])
        for (const answer of ['うん', '違う']) for (const priorSpeaker of [speaker, speaker === 'player' ? 'visitor' : 'player'])
            for (const reverse of [false, true]) {
                const v = setup({ speech }); hear(v, 'これをももって呼ぼう', { speaker: priorSpeaker });
                const parts = ['これをころって呼ぼう', 'これをぽぽって呼ぼう', 'さっきの説明は間違えた', answer];
                add('correction-and-confirmation-source', v, (reverse ? parts.reverse() : parts).join('\n'), { speaker });
            }
    for (const activity of [false, true]) for (const speech of ['short', 'gesture']) for (const repeat of [false, true])
        for (const tail of ['木の実をももって呼ぼう', '未解析!']) {
            const v = setup({ life: false, speech }); if (activity) arrive(v);
            const pair = activity ? ['ころ', 'ぽぽ'] : ['これをころって呼ぼう', 'これをぽぽって呼ぼう'];
            add('incomplete-naming-unknown-repetition', v, [...pair, 'さっきの説明は間違えた', tail, ...(repeat ? pair : [])].join('\n'));
        }
    for (const mask of [[], ['correction'], ['report'], ['correction', 'report']]) for (const answer of ['うん', '違う']) {
        const v = setup(); hear(v, 'これをももって呼ぼう');
        v.state.knowledge.relations = v.state.knowledge.relations.filter(r => !mask.includes(r.id));
        add('incomplete-relations-stay-incomplete', v, raw + '\n' + answer);
    }
    const pair = 'これをころって呼ぼう\nこれをぽぽって呼ぼう';
    for (const text of [pair, pair + '\nおはよう', pair + '\n何を手伝った？', 'さっきの説明は間違えた',
        '未解析!\n未解析!', 'これをころって呼ぼう', pair + '\nこれ何？']) add('existing-owner-controls', setup(), text);
    add('existing-owner-controls', setup({ foundation: false }), 'これをころって呼ぼう');
    add('existing-owner-controls', dynamic.setup(), 'ころ\nぽぽ');
    add('existing-owner-controls', dynamic.setup(), 'ころ\nぽぽ\nおはよう');
    for (const row of responses.fixtures().filter(r => r.expected).slice(0, 3))
        rows.push({ group: 'as-positive-controls', value: row.value, expected: false });
    for (const speech of ['short', 'gesture']) for (const speaker of ['player', 'visitor']) for (const answer of ['うん', '違う']) {
        const v = setup({ speech }); hear(v, 'これをももって呼ぼう', { speaker }); hear(v, 'もも', { speaker });
        add('reasked-original-name', v, raw + '\n' + answer, { speaker });
    }
    for (const speech of ['short', 'gesture']) {
        const repeated = setup({ speech }); hear(repeated, raw); add('new-input-after-same-naming', repeated);
        for (const mode of ['rest', 'eat']) {
            const v = setup({ speech }); life.start(v, mode); life.finish(v); names.focus(v);
            add('completed-experience:' + mode, v);
        }
        const selected = setup({ speech }); hear(selected, '休んでね'); add('original-selection-source', selected);
        const missing = setup({ speech }); missing.state.knowledge.relations = missing.state.knowledge.relations.filter(r => r.id !== 'naming');
        add('missing-naming-relation', missing);
        add('many-repeated-clauses', setup({ speech }), Array(12).fill('これをころって呼ぼう').concat('さっきの説明は間違えた').join('\n'));
    }
    return rows;
}
module.exports = { fixtures, expected, setup, hear, arrive, core, worldApi, catalog, copy, life, raw, dynamicRaw,
    arrived: dynamic.setup, forms: additional.forms };
