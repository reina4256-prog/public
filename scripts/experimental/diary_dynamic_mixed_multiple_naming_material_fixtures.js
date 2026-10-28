'use strict';
// Actual receiver, responder and arrival output in disposable memory only.
const base = require('./diary_dynamic_multiple_complete_naming_fixtures');
const names = require('./diary_multiple_complete_naming_fixtures');
const unknown = require('./diary_all_unknown_material_fixtures');
const { setup, hear, arrive, core, worldApi, catalog, copy, life } = base;
const raw = 'ころ\nぽぽ\nおはよう';
const companions = require('./diary_greeting_material_fixtures').forms.concat('おはよう');
// The adopted catalog clauses are distinct from standalone generic parser frames.
const rules = new Set(['after_eat_walk', 'berry_observation', 'conditional_rest', 'do_not_eat',
    'name_question', 'not_dislike', 'not_now', 'preference', 'reason_question', 'rest_comfort',
    'rest_invitation', 'rest_request', 'rest_result', 'rest_value', 'situation_question',
    'sour_question', 'taste_now', 'walk_invitation', 'greeting_morning', 'name', 'name_description', 'name_answer']);
function expected(value) {
    const r = value.result, frames = r.interpretations, us = r.understandings;
    const complete = frames.flatMap((f, i) => f.kind === 'naming' && us[i].kind === 'naming' && us[i].complete ? [i] : []);
    return r.input.locale === 'ja' && complete.length >= 2 && complete.length < frames.length
        && complete.some(i => !Object.hasOwn(frames[i], 'catalogRule'))
        && frames.every(f => f.kind === 'unknown' || rules.has(f.catalogRule)
            || f.kind === 'naming' && !Object.hasOwn(f, 'catalogRule'))
        && !r.relationLearning && !r.conditionJudgment && !r.sequenceJudgment
        && !(us.at(-1).kind === 'question' && us.at(-1).complete && value.receipt.reply.message === 'answer_unknown');
}
function fixtures() {
    const rows = base.fixtures().map(row => ({ group: 'dm-control:' + row.group, value: row.value, expected: expected(row.value) }));
    const add = (group, v, text = raw, options = {}) => {
        const value = hear(v, text, options); rows.push({ group, value, expected: expected(value) });
    };
    for (const foundation of [false, true]) for (const knownLife of [false, true])
        for (const speech of ['short', 'gesture']) for (const speaker of ['player', 'visitor'])
            for (const text of companions) for (const reverse of [false, true]) {
                const pair = ['ころ', 'ぽぽ'];
                add('nineteen-companions-eight-settings', setup({ foundation, life: knownLife, speech }),
                    (reverse ? [text, ...pair] : [...pair, text]).join('\n'), { speaker });
            }
    const forms = [raw, 'おはよう\nころ\nぽぽ', 'ころ\nおはよう\nころ', 'ころ\nぽぽ\n未解析!',
        'ころ\nぽぽ\n木の実をももって呼ぼう', 'ころ\nこれはぽぽだよ\n未解析!',
        'ころ\n未知\nおはよう', 'ころ\nぽぽ\nうん', 'ころ\nぽぽ\nぽぽは休むことだよ',
        'ころ\nころ\nおはよう', 'これをころって呼ぼう\nぽぽ\nおはよう',
        'ころ\nぽぽ\nさっきの説明は間違えた', 'ころ\nぽぽ\n何を手伝った？'];
    for (const knownLife of [false, true]) for (const text of forms) {
        add('mixed-unknown-incomplete-and-existing-forms', setup({ life: knownLife }), text);
        add('no-arrival-mixed', names.setup({ life: knownLife }), text);
    }
    for (const previous of ['unrecognized unrelated input', 'これをももって呼ぼう'])
        for (const text of forms.slice(0, 11)) {
            const v = unknown.setup(); hear(v, previous); arrive(v); add('actual-input-before-arrival-mixed', v, text);
        }
    for (const text of forms.slice(0, 11)) {
        const v = setup(); hear(v, text); add('new-input-after-name-response-mixed', v, text);
    }
    for (const mode of ['rest', 'eat']) {
        const v = unknown.setup(); life.start(v, mode); life.finish(v); arrive(v);
        add('completed-experience-before-mixed:' + mode, v);
    }
    return rows;
}
module.exports = { fixtures, setup, hear, arrive, core, worldApi, catalog, copy, life, raw };
