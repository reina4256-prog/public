'use strict';
// Existing grammar in disposable memory. Verification inputs are not game display text.
const base = require('./diary_word_reference_clause_material_fixtures');
const { core, worldApi, catalog, copy, life } = base;
const extras = require('./diary_additional_clause_material_fixtures');
const normalize = text => text.normalize('NFKC').trim().toLocaleLowerCase();
const rules = new Set(['after_eat_walk', 'berry_observation', 'conditional_rest', 'do_not_eat',
    'name_question', 'not_dislike', 'not_now', 'preference', 'reason_question', 'rest_comfort',
    'rest_invitation', 'rest_request', 'rest_result', 'rest_value', 'situation_question',
    'sour_question', 'taste_now', 'walk_invitation', 'greeting_morning', 'work_past', 'work_again',
    'taste_question', 'rest_explanation', 'name', 'name_description', 'name_answer',
    'retract_explanation', 'yes_reply_priority', 'no_reply_priority', 'yes_reply', 'no_reply']);
const raw = 'ぴぴ\nおはよう';
function setup(options = {}) { return base.setup(options); }
function focus(v, ids = ['berry:1'], scene = 'clearing') { return base.focus(v, ids, scene); }
function requiredIds(result, before) {
    const required = new Set();
    for (const frame of result.interpretations.filter(f => f.kind === 'reference'))
        for (const link of before.knowledge.associations.filter(link => normalize(link.word) === normalize(frame.target)
            && link.speaker === result.input.speaker))
            for (const evidence of link.evidence) if (!evidence.retractedBy) required.add(evidence.inputId);
    return required;
}
function hear(v, text, options = {}) {
    const value = base.hear(v, text, options), needed = requiredIds(value.result, value.receipt.beforeState);
    if (value.result.interpretations.some(f => f.kind === 'reference'))
        value.receipt.origins = copy(v.origins.filter(o => needed.has(o.result.input.id)));
    return value;
}
function prepare(options = {}, speaker = 'player') {
    const v = setup(options); hear(v, 'これをぴぴって呼ぼう', { speaker }); return v;
}
function ambiguous(options = {}, ids = []) {
    const v = prepare(options); focus(v, ['berry:2'], 'elsewhere'); hear(v, 'これをぴぴって呼ぼう');
    focus(v, ids, 'third'); return v;
}
function expected(value) {
    const r = value.result, frames = r.interpretations, us = r.understandings;
    const indices = frames.flatMap((f, i) => f.kind === 'reference' ? [i] : []);
    return r.input.locale === 'ja' && indices.length > 0 && (frames.length >= 2 || !us[indices[0]].complete)
        && frames.every(f => ['unknown', 'reference'].includes(f.kind) || rules.has(f.catalogRule))
        && frames.filter((f, i) => f.kind === 'naming' && us[i].kind === 'naming' && us[i].complete).length !== 1
        && !r.relationLearning && !r.conditionJudgment && !r.sequenceJudgment
        && !(us.at(-1).kind === 'question' && us.at(-1).complete && value.receipt.reply.message === 'answer_unknown');
}
function fixtures() {
    const rows = [], add = (group, v, text = raw, options = {}) => {
        const value = hear(v, text, options); rows.push({ group, value, expected: expected(value) });
    };
    for (const foundation of [false, true]) for (const knownLife of [false, true])
        for (const speech of ['short', 'gesture']) for (const speaker of ['player', 'visitor'])
            for (const text of ['ぴぴ', raw, 'ぴぴ\nぴぴ', 'ぴぴ\n未知!'])
                add('eight-settings', prepare({ foundation, life: knownLife, speech }, speaker), text, { speaker });
    for (const speech of ['short', 'gesture']) for (const speaker of ['player', 'visitor'])
        for (const text of [...extras.anchors, 'おはよう', ...Object.values(extras.forms), '未解析!',
            'これをころって呼ぼう', 'これをころって呼ぼう\nこれをももって呼ぼう', 'さっきの説明は間違えた', 'うん', '違う'])
            for (const reverse of [false, true]) {
                const v = prepare({ speech }, speaker); hear(v, '休むことは大事', { speaker });
                add('companions-both-orders', v, (reverse ? [text, 'ぴぴ'] : ['ぴぴ', text]).join('\n'), { speaker });
            }
    for (const speech of ['short', 'gesture']) for (const ids of [[], ['berry:1'], ['berry:2'], ['berry:1', 'berry:2']])
        for (const text of ['ぴぴ', raw, 'ぴぴ\nぴぴ', 'これをころって呼ぼう\nこれをももって呼ぼう\nぴぴ'])
            add('two-target-attention', ambiguous({ speech }, ids), text);
    for (const speech of ['short', 'gesture']) for (const variant of ['other-speaker', 'other-scene', 'same-target-repeat',
        'multiple-evidence', 'missing-name', 'same-word-definition', 'retracted-name', 'multiple-naming-origin',
        'no-attention', 'incomplete-namings', 'completed-rest']) {
        const v = ['missing-name', 'multiple-naming-origin'].includes(variant) ? setup({ speech }) : prepare({ speech });
        if (variant === 'other-scene') focus(v, [], 'elsewhere');
        if (variant === 'same-target-repeat') hear(v, 'これをぴぴって呼ぼう');
        if (variant === 'multiple-evidence') { focus(v, ['berry:1'], 'elsewhere'); hear(v, 'これをぴぴって呼ぼう'); }
        if (variant === 'same-word-definition') hear(v, 'ぴぴは休むことだよ');
        if (variant === 'retracted-name') hear(v, '違う');
        if (variant === 'multiple-naming-origin') hear(v, 'これをぴぴって呼ぼう\nこれをころって呼ぼう');
        if (variant === 'no-attention') focus(v, []);
        if (variant === 'completed-rest') { life.start(v, 'rest'); life.finish(v); focus(v); }
        if (variant === 'incomplete-namings') v.state.knowledge.relations = v.state.knowledge.relations.filter(r => r.id !== 'naming');
        add('source:' + variant, v, variant === 'incomplete-namings' ? 'これをころって呼ぼう\nこれをももって呼ぼう\nぴぴ' : raw,
            { speaker: variant === 'other-speaker' ? 'visitor' : 'player' });
    }
    for (const speech of ['short', 'gesture']) for (const answer of ['うん', '違う', 'さっきの説明は間違えた'])
        for (const reverse of [false, true]) {
            const v = prepare({ speech }); hear(v, 'ぴぴ');
            add('reasked-confirmation', v, (reverse ? [answer, 'ぴぴ'] : ['ぴぴ', answer]).join('\n'));
        }
    for (const speech of ['short', 'gesture']) {
        add('long-repetition', prepare({ speech }), Array(12).fill('ぴぴ').join('\n'));
        const v = prepare({ speech }); hear(v, 'ぴぴ');
        add('two-complete-namings-and-reply', v, 'これをももって呼ぼう\nこれをののって呼ぼう\nぴぴ\nうん');
        const arrived = setup({ speech }); focus(arrived, ['berry:2']); hear(arrived, 'これをぴぴって呼ぼう');
        focus(arrived); base.arrive(arrived);
        add('actual-ask-name-boundary', arrived, 'ころ\nぴぴ');
    }
    for (const locale of Object.keys(catalog.patterns)) add('input-locale-control', prepare(), raw, { locale });
    for (const text of ['ぴぴ', '未知\n未解析!', 'おはよう', 'ぴぴ\n私は悲しい', 'ぽぽ\nぴぴ']) {
        const v = prepare(); hear(v, 'ぽぽは休むことだよ'); add('existing-owner-boundaries', v, text);
    }
    return rows;
}
module.exports = { fixtures, expected, setup, prepare, ambiguous, focus, hear, requiredIds, core, worldApi, catalog, copy, raw };
