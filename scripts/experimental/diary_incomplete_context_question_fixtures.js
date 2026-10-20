'use strict';
// Existing owner executions in disposable memory, never a player save.
const followups = require('./diary_followup_fixtures');
const base = require('./diary_gesture_reason_question_fixtures');
const copy = value => JSON.parse(JSON.stringify(value));
const { core, worldApi, catalog, hear } = base;
const setup = (options = {}) => base.setup({ speech: 'short', ...options });
function prepared(mask = 0, speech = 'short', past = true) {
    const v = setup();
    if (past) { followups.start(v, 'eat'); followups.finish(v); }
    else hear(v, '何してる？');
    v.state.settings.speech = speech;
    const items = past ? [['meanings', 'sweet'], ['meanings', 'eat'], ['relations', 'question'], ['relations', 'time']]
        : [['meanings', 'rest'], ['relations', 'question']];
    items.forEach(([field, id], bit) => {
        if (mask & (1 << bit)) v.state.knowledge[field] = v.state.knowledge[field].filter(item => item.id !== id);
    });
    return v;
}
function fixtures() {
    const all = [], add = (group, value, expected) => all.push({ group, value, expected });
    for (const foundation of [false, true]) for (const life of [false, true]) for (const speech of ['short', 'gesture']) {
        const v = setup({ foundation, life, speech }); followups.start(v, 'eat'); followups.finish(v);
        add('eight-settings', hear(v, '甘いの？'), !foundation || !life);
    }
    for (const [locale, forms] of Object.entries(followups.forms)) for (const speech of ['short', 'gesture']) {
        for (let mask = 0; mask < 16; mask++)
            add('seven-language-past-knowledge-masks', hear(prepared(mask, speech), forms[2], { locale }), mask !== 0);
        for (let mask = 0; mask < 4; mask++) for (const index of [1, 3])
            add('seven-language-present-and-ellipsis', hear(prepared(mask, speech, false), forms[index], { locale }), mask !== 0);
    }
    for (const raw of ['一息って？', 'ひと息ってどういうこと？', 'つまり休んでいるということ？', '休憩？'])
        for (const speech of ['short', 'gesture']) for (let mask = 1; mask < 4; mask++)
            add('existing-aliases', hear(prepared(mask, speech, false), raw), true);
    for (const speech of ['short', 'gesture']) {
        const v = prepared(1, speech);
        add('observation-is-not-felt-relief', hear(v, 'ほっとしたの？'), true);
        for (const locale of Object.keys(followups.forms)) {
            add('other-speaker-is-not-context', hear(prepared(1, speech), followups.forms[locale][2], { locale, speaker: 'visitor' }), false);
        }
        for (const raw of ['私は甘いの？', '甘いなら休もう？', '甘いの？\n休もう', '新しい未対応文型です'])
            add('unsupported-or-multiple', hear(prepared(1, speech), raw), false);
        const intervening = prepared(1, speech); hear(intervening, 'おはよう');
        add('intervening-topic', hear(intervening, '甘いの？'), false);
        add('no-original-output', hear(setup({ foundation: false, life: false, speech }), '甘いの？'), false);
        const repeat = setup(); hear(repeat, '何してる？'); repeat.state.settings.speech = speech;
        repeat.state.knowledge.relations = repeat.state.knowledge.relations.filter(r => r.id !== 'question');
        add('repeat-is-separate', hear(repeat, 'もう一度教えて'), false);
    }
    // Previously learned current_activity scope cannot complete context_detail.
    for (const f of followups.fixtures().filter(f => f.group === 'experienced-question-no-retroactivity')) {
        const frame = f.value.result.interpretations[0];
        if (frame.catalogRule !== 'context_detail') continue;
        const v = { state: copy(f.value.receipt.beforeState), world: copy(f.value.receipt.beforeWorld) };
        add('actual-experienced-scope', hear(v, f.value.result.input.raw), true);
    }
    for (const name of ['answer', 'followup', 'incomplete_confirmation_question', 'incomplete_direct_question',
        'gesture_reason_question', 'incomplete_reason_question']) {
        for (const f of require('./diary_' + name + '_fixtures').fixtures().filter(item => item.expected))
            add('other-owner:' + name, copy(f.value), false);
    }
    return all;
}
module.exports = { fixtures, prepared, setup, hear, core, worldApi, catalog };
