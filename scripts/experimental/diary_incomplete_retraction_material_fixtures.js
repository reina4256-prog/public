'use strict';
// Actual existing input grammar in disposable memory; no user save or new display text.
const base = require('./diary_remaining_clause_material_fixtures');
const activities = require('./diary_complete_other_speaker_proposal_fixtures');
const responses = require('./diary_name_response_fixtures');
const oldQuestions = require('../../experimental_word_diary_questions');
const candidates = require('../../experimental_word_diary_candidates');
const { setup, core, worldApi, catalog, copy, life, condition } = base;
const raw = 'さっきの説明は間違えた';
const forms = require('./diary_greeting_material_fixtures').forms.concat('おはよう');
function hear(v, text, options = {}) {
    const value = base.hear(v, text, options), previous = value.receipt.beforeState.context.turns.at(-1);
    if (previous && v.steps?.at(-1)?.result.input.id === previous.id)
        value.receipt.antecedent = copy(v.steps.at(-1));
    // Store a flat receipt: the previous occurrence does not recursively embed its ancestry.
    const step = copy(value); delete step.receipt.antecedent;
    (v.steps ||= []).push(step);
    return value;
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
        for (const text of [raw, 'さっきの説明は間違いだった'])
            for (const foundation of [false, true]) for (const knownLife of [false, true])
                add('single-existing-aliases-eight-settings', setup({ speech, foundation, life: knownLife }), text, { speaker });
        for (const text of forms) for (const reverse of [false, true]) for (const known of [false, true])
            add('all-nineteen-companion-rules', setup({ speech, foundation: known, life: known }),
                (reverse ? [text, raw] : [raw, text]).join('\n'), { speaker });
        for (const text of [raw + '\n未知', '未知\n' + raw, raw + '\n未知\n休んでね',
            raw + '\n' + raw, raw + '\n' + raw + '\n' + raw, Array(12).fill(raw).join('\n'),
            ' さっきの説明は間違いだった。 '])
            add('unknown-repeated-and-many-correction-clauses', setup({ speech }), text, { speaker });
        for (const antecedent of ['name', 'unknown', 'ambiguous', 'intervening', 'retracted'])
            for (const foundation of [false, true]) for (const mixed of [false, true]) {
                const v = setup({ speech, foundation });
                if (antecedent === 'ambiguous') core.perceive(v.state, { scene: v.state.context.scene,
                    attention: ['berry:1', 'berry:2'].map(id => ({ id, meaning: 'berry' })) });
                if (['name', 'intervening', 'retracted'].includes(antecedent))
                    core.perceive(v.state, { scene: v.state.context.scene, attention: [{ id: 'berry:1', meaning: 'berry' }] });
                if (antecedent !== 'unknown') hear(v, responses.forms.name, { speaker });
                if (['unknown', 'intervening'].includes(antecedent)) hear(v, 'unrecognized unrelated input', { speaker });
                if (antecedent === 'retracted') hear(v, raw, { speaker });
                add('actual-antecedent:' + antecedent, v, mixed ? raw + '\n' + raw : raw, { speaker },
                    !(antecedent === 'name' && foundation && !mixed));
            }
        for (const mode of ['eat', 'work', 'berry-low', 'berry-high', 'no-target', 'no-route', 'moving-no-route'])
            add('actual-activity:' + mode, activities.prepared(mode, { speech }), raw + '\n休んでね', { speaker });
        for (const mode of ['rest', 'eat']) {
            const v = setup({ speech }); life.start(v, mode); life.finish(v);
            add('original-experience-observation', v, raw, { speaker });
        }
        const selected = setup({ speech }); hear(selected, '休んでね', { speaker });
        add('original-selection-source', selected, raw + '\n休んでね', { speaker });
        for (const text of ['未知', '未知\n未知', '休んでね', 'おはよう', '木の実がある\n休んでね',
            raw + '\n木の実をモコと呼ぼう', raw + '\n何を手伝った？',
            raw + '\n荷物運びをまたやりたい？', raw + '\nおいしかった？',
            'さっき間違えた。ころは木の実のことだよ'])
            add('reserved-and-outside-domain', setup({ speech }), text, { speaker }, false);
        const recovery = setup({ speech }); hear(recovery, '休むことは大事', { speaker });
        add('df-recovery-not-rescued', recovery, raw + '\n体力や眠気が回復するからね', { speaker }, false);
        const replied = setup({ speech });
        core.perceive(replied.state, { scene: replied.state.context.scene, attention: [{ id: 'berry:1', meaning: 'berry' }] });
        hear(replied, responses.forms.name, { speaker });
        add('reply-or-unknown-preserves-actual-frame', replied, raw + '\nうん', { speaker }, speech === 'gesture');
        for (const locale of Object.keys(catalog.patterns)) if (locale !== 'ja')
            add('no-new-input-locale', setup({ speech }), raw, { locale, speaker }, false);
    }
    for (const f of responses.fixtures()) {
        const frames = f.value.result.interpretations, us = f.value.result.understandings;
        // These controls include both established as successes and unresolved corrections.
        const expected = frames.length === 1 && frames[0].catalogRule === 'retract_explanation' && !us[0].complete;
        all.push({ group: 'as-existing-control:' + f.group, value: f.value, expected });
    }
    return all;
}
module.exports = { fixtures, setup, hear, core, worldApi, catalog, copy, life, condition, base, raw, forms };
