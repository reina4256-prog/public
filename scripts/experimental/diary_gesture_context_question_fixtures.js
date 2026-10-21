'use strict';
// Existing owner executions in disposable memory; never a player save.
const base = require('./diary_incomplete_context_question_fixtures');
const followups = require('./diary_followup_fixtures');
const copy = v => JSON.parse(JSON.stringify(v));
const { prepared, setup, hear, core, worldApi, catalog } = base;
function fixtures() {
    const all = [], add = (group, value, expected) => all.push({ group, value, expected });
    for (const foundation of [false, true]) for (const life of [false, true]) for (const speech of ['short', 'gesture']) {
        const v = setup({ foundation, life, speech }); followups.start(v, 'eat'); followups.finish(v);
        add('eight-settings', hear(v, '甘いの？'), foundation && life && speech === 'gesture');
    }
    for (const [locale, forms] of Object.entries(followups.forms)) for (const speech of ['short', 'gesture']) {
        for (let mask = 0; mask < 16; mask++)
            add('seven-language-past-masks', hear(prepared(mask, speech), forms[2], { locale }), mask === 0 && speech === 'gesture');
        for (let mask = 0; mask < 4; mask++) for (const index of [1, 3])
            add('seven-language-present-and-ellipsis', hear(prepared(mask, speech, false), forms[index], { locale }), mask === 0 && speech === 'gesture');
    }
    for (const raw of ['一息って？', 'ひと息ってどういうこと？', 'つまり休んでいるということ？', '休憩？'])
        add('existing-japanese-aliases', hear(prepared(0, 'gesture', false), raw), true);
    // Reuse actual earlier deliveries, including observation, work and changed activity.
    // Re-run the next input with gesture enabled; never edit a past response into one.
    for (const f of followups.fixtures().filter(f => f.expected && f.type === 'detail')) {
        const v = { state: copy(f.value.receipt.beforeState), world: copy(f.value.receipt.beforeWorld) };
        v.state.settings.speech = 'gesture';
        const input = f.value.result.input;
        add('original-source:' + f.group, hear(v, input.raw, { locale: input.locale, speaker: input.speaker, at: input.at }), true);
    }
    for (const speech of ['short', 'gesture']) {
        for (const locale of Object.keys(followups.forms))
            add('other-speaker', hear(prepared(0, speech), followups.forms[locale][2], { locale, speaker: 'visitor' }), false);
        for (const raw of ['私は甘いの？', '甘いなら休もう？', '甘いの？\n休もう', '新しい未対応文型です'])
            add('unsupported-or-multiple', hear(prepared(0, speech), raw), false);
        const intervening = prepared(0, speech); hear(intervening, 'おはよう');
        add('intervening-topic', hear(intervening, '甘いの？'), false);
        add('no-original-output', hear(setup({ speech }), '甘いの？'), false);
        const repeat = setup(); hear(repeat, '何してる？'); repeat.state.settings.speech = speech;
        add('repeat-is-separate', hear(repeat, 'もう一度教えて'), false);
        repeat.state.knowledge.relations = repeat.state.knowledge.relations.filter(r => r.id !== 'question');
        add('incomplete-repeat-is-separate', hear(repeat, 'もう一度教えて'), false);
    }
    for (const f of followups.fixtures().filter(f => f.group.startsWith('experienced-question'))) {
        const v = { state: copy(f.value.receipt.beforeState), world: copy(f.value.receipt.beforeWorld) };
        v.state.settings.speech = 'gesture';
        add('experienced-scope-not-transferred', hear(v, f.value.result.input.raw), false);
    }
    for (const name of ['gesture_confirmation_question', 'gesture_direct_question', 'gesture_name_question',
        'gesture_sour_question', 'gesture_reason_question', 'incomplete_context_question']) {
        for (const f of require('./diary_' + name + '_fixtures').fixtures().filter(f => f.expected))
            add('other-owner:' + name, copy(f.value), false);
    }
    return all;
}
module.exports = { fixtures, prepared, setup, hear, core, worldApi, catalog };
