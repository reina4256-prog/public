'use strict';
// Actual receiver/responder in disposable memory. No game UI or player save.
const base = require('./diary_word_reference_clause_material_fixtures');
const individual = require('./diary_individual_reference_material_fixtures');
const extras = require('./diary_additional_clause_material_fixtures');
const { core, worldApi, catalog, copy, life, focus } = base;
const raw = 'ぴぴ\nぽぽ';
const rules = new Set(['after_eat_walk', 'berry_observation', 'conditional_rest', 'do_not_eat',
    'name_question', 'not_dislike', 'not_now', 'preference', 'reason_question', 'rest_comfort',
    'rest_invitation', 'rest_request', 'rest_result', 'rest_value', 'situation_question',
    'sour_question', 'taste_now', 'walk_invitation', 'greeting_morning', 'work_past', 'work_again',
    'taste_question', 'rest_explanation', 'name', 'name_description', 'name_answer',
    'retract_explanation', 'yes_reply_priority', 'no_reply_priority', 'yes_reply', 'no_reply']);
function setup(options = {}) { return base.setup(options); }
function hear(v, text, options = {}) {
    const value = base.hear(v, text, options), before = value.receipt.beforeState;
    const ids = new Set([...base.requiredIds(value.result, before), ...individual.requiredIds(value.result, before)]);
    value.receipt.origins = copy(v.origins.filter(o => ids.has(o.result.input.id)));
    return value;
}
function prepare(options = {}, variant = 'normal', speaker = 'player') {
    const v = setup(options);
    hear(v, variant === 'shared-origin' ? 'これをぴぴって呼ぼう\nこれをぽぽって呼ぼう' : 'これをぴぴって呼ぼう', { speaker });
    if (variant === 'individual-corrected') {
        hear(v, 'これをぽぽって呼ぼう', { speaker }); hear(v, 'さっき間違えた。ぽぽは休むことだよ', { speaker });
    } else hear(v, 'ぽぽは休むことだよ', { speaker });
    if (variant === 'meaning-conflict') hear(v, 'ぽぽは木の実のことだよ', { speaker });
    if (['corrected', 'chain'].includes(variant)) hear(v, 'さっき間違えた。ぽぽは眠ることだよ', { speaker });
    if (variant === 'chain') hear(v, 'さっき間違えた。ぽぽは休むことだよ', { speaker });
    if (variant === 'individual-conflict') hear(v, 'これをぽぽって呼ぼう', { speaker });
    if (variant === 'multiple-evidence') { focus(v, ['berry:1'], 'elsewhere'); hear(v, 'これをぴぴって呼ぼう', { speaker }); focus(v); }
    if (variant === 'same-meaning') { focus(v, ['berry:1'], 'elsewhere'); hear(v, 'ぽぽは休むことだよ', { speaker }); focus(v); }
    if (variant === 'two-targets') { focus(v, ['berry:2'], 'elsewhere'); hear(v, 'これをぴぴって呼ぼう', { speaker }); focus(v, ['berry:1', 'berry:2'], 'third'); }
    return v;
}
function expected(value) {
    const r = value.result, frames = r.interpretations, us = r.understandings;
    return r.input.locale === 'ja' && frames.some(f => f.kind === 'reference')
        && frames.some(f => f.kind === 'word_reference')
        && frames.every(f => ['unknown', 'reference', 'word_reference'].includes(f.kind) || rules.has(f.catalogRule))
        && frames.filter((f, i) => f.kind === 'naming' && us[i].complete).length !== 1
        && !r.relationLearning && !r.conditionJudgment && !r.sequenceJudgment
        && !(us.at(-1).kind === 'question' && us.at(-1).complete && value.receipt.reply.message === 'answer_unknown');
}
function fixtures() {
    const rows = [], add = (group, v, text = raw, options = {}) => {
        const value = hear(v, text, options); rows.push({ group, value, expected: expected(value) });
    };
    for (const foundation of [false, true]) for (const knownLife of [false, true])
        for (const speech of ['short', 'gesture']) for (const speaker of ['player', 'visitor'])
            for (const text of [raw, 'ぽぽ\nぴぴ', raw + '\nおはよう', raw + '\n未知!'])
                add('eight-settings-and-speakers', prepare({ foundation, life: knownLife, speech }, 'normal', speaker), text, { speaker });
    for (const speech of ['short', 'gesture']) for (const speaker of ['player', 'visitor'])
        for (const text of [...extras.anchors, 'おはよう', ...Object.values(extras.forms), 'さっきの説明は間違えた',
            'うん', '違う', 'これをももって呼ぼう', 'これをももって呼ぼう\nこれをののって呼ぼう',
            'これはももだよ\nののっていうんだ', 'これを「もも」と呼ぶよ\nこれを「のの」と呼ぶよ', '未解析!'])
            for (const reverse of [false, true]) {
                const v = prepare({ speech }, 'normal', speaker);
                hear(v, ['うん', '違う'].includes(text) ? 'これをころって呼ぼう' : '休むことは大事', { speaker });
                add('companions-both-orders', v, reverse ? text + '\n' + raw : raw + '\n' + text, { speaker });
            }
    for (const speech of ['short', 'gesture']) for (const variant of ['meaning-conflict', 'corrected', 'chain',
        'individual-conflict', 'individual-corrected', 'same-meaning', 'multiple-evidence', 'shared-origin'])
        add('source:' + variant, prepare({ speech }, variant));
    for (const speech of ['short', 'gesture']) for (const ids of [[], ['berry:1'], ['berry:2'], ['berry:1', 'berry:2']]) {
        const v = prepare({ speech }, 'two-targets'); focus(v, ids, 'clearing'); add('two-target-attention', v);
    }
    for (const speech of ['short', 'gesture']) for (const answer of ['うん', '違う']) {
        const v = prepare({ speech }); hear(v, 'これをころって呼ぼう'); hear(v, 'ころ');
        add('reasked-confirmation', v, raw + '\n' + answer);
    }
    for (const speech of ['short', 'gesture']) {
        add('long-repetition', prepare({ speech }), Array(6).fill(raw).join('\n'));
        for (const mode of ['rest', 'eat']) { const v = prepare({ speech }); life.start(v, mode); life.finish(v); focus(v); add('completed-experience:' + mode, v); }
        for (const kind of ['missing', 'ambiguous']) {
            const v = prepare({ speech }); focus(v, kind === 'missing' ? [] : ['berry:1', 'berry:2']);
            add('incomplete-namings', v, raw + '\nこれをももって呼ぼう\nこれをののって呼ぼう');
        }
        const arrived = setup({ speech }); focus(arrived, ['berry:2']); hear(arrived, 'これをぴぴって呼ぼう');
        hear(arrived, 'ぽぽは休むことだよ'); focus(arrived); base.arrive(arrived);
        add('actual-arrival-boundary', arrived, 'ころ\n' + raw);
    }
    for (const locale of Object.keys(catalog.patterns)) add('locale-control', prepare(), raw, { locale });
    for (const text of ['ぴぴ', 'ぽぽ', 'ぴぴ\nおはよう', 'ぽぽ\nおはよう', 'ぽぽは休むことだよ',
        'さっき間違えた。ぽぽは眠ることだよ', '未知\n未解析!', raw + '\n私は悲しい']) add('prior-owner-boundaries', prepare(), text);
    return rows;
}
module.exports = { fixtures, expected, setup, prepare, focus, hear, core, worldApi, catalog, copy, life, raw };
