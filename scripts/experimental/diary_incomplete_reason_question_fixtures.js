'use strict';
// Real owner executions in disposable memory. No player saves or new grammar.
const base = require('./diary_gesture_reason_question_fixtures');
const reason = require('./diary_reason_question_fixtures');
const { prepareKnown } = require('./diary_known_reason_question_fixtures');
const { prepareReason } = require('./diary_known_reason_explanation_fixtures');
const copy = value => JSON.parse(JSON.stringify(value));
const { setup, hear, core, worldApi, catalog } = base;
function missing(mask, speech = 'short') {
    const v = setup({ speech });
    [['meanings', 'rest'], ['relations', 'question'], ['relations', 'reason']].forEach(([field, id], bit) => {
        if (mask & (1 << bit)) v.state.knowledge[field] = v.state.knowledge[field].filter(r => r.id !== id);
    });
    return v;
}
function fixtures() {
    const all = [], add = (group, value, expected) => all.push({ group, value, expected });
    for (const foundation of [false, true]) for (const life of [false, true]) for (const speech of ['short', 'gesture'])
        add('eight-settings', hear(setup({ foundation, life, speech })), !foundation || !life);
    for (const speech of ['short', 'gesture']) for (let mask = 0; mask < 8; mask++)
        add('required-knowledge-masks', hear(missing(mask, speech)), mask !== 0);
    for (const raw of ['どうして休んだの？', 'なぜ休んだ？', 'なぜ休んだの?', 'どうして休んだ',
        'どうして休んだの？。', '  どうして休んだの？  '])
        for (const speech of ['short', 'gesture']) for (let mask = 1; mask < 8; mask++)
            add('existing-japanese-forms', hear(missing(mask, speech), raw), true);
    for (const raw of ['どうして食べたの？', 'どうして休んだの？\n休もう', '理由の新文型です'])
        add('unknown-or-multiple-frames', hear(missing(7), raw), false);
    for (const locale of Object.keys(catalog.reasonTeaching)) for (const speech of ['short', 'gesture'])
        add('existing-language-boundary', hear(setup({ foundation: false, life: false, speech }),
            catalog.reasonTeaching[locale].utterance, { locale }), locale === 'ja');
    for (const speech of ['short', 'gesture']) for (const stage of ['meaning', 'question', 'reason']) {
        const v = setup({ foundation: false, life: false, speech });
        if (stage === 'meaning') reason.prepare(v, 'ja');
        else if (stage === 'question') prepareKnown(v);
        else prepareReason(v);
        add('actual-learning-stages', hear(v), stage !== 'reason');
        add('experienced-scope-other-speaker', hear(v, undefined, { speaker: 'visitor' }), true);
    }
    // Actual current_activity relation learning must not supply reason-question scope.
    for (const f of require('./diary_followup_fixtures').fixtures().filter(f =>
        ['experienced-question-no-retroactivity', 'experienced-question-repeat'].includes(f.group))) {
        const v = { state: copy(f.value.receipt.beforeState), world: copy(f.value.receipt.beforeWorld) };
        add('other-question-scope', hear(v), true);
    }
    for (const mode of ['idle', 'observe', 'move', 'eat', 'work']) for (const speech of ['short', 'gesture']) {
        const v = missing(4, speech);
        if (mode === 'move') worldApi.approach(v.world, 'path');
        else if (mode === 'eat') require('./diary_negation_fixtures').start(v, 'eat');
        else { v.world.mode = mode; v.world.attention = null; core.perceive(v.state, { scene: 'clearing', attention: [] }); }
        add('heard-activity-is-not-reason-answer', hear(v, undefined, { at: 76543 }), true);
    }
    for (const name of ['gesture_reason_question', 'incomplete_direct_question', 'incomplete_confirmation_question',
        'incomplete_name_question', 'unresolved_name_target', 'incomplete_sour_question', 'followup'])
        for (const f of require('./diary_' + name + '_fixtures').fixtures().filter(f => f.expected))
            add('other-owner:' + name, copy(f.value), false);
    return all;
}
module.exports = { fixtures, missing, setup, hear, core, worldApi, catalog };
