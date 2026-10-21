'use strict';
// Existing owner executions in disposable memory, never a player save.
const base = require('./diary_gesture_reason_question_fixtures');
const followups = require('./diary_followup_fixtures');
const answers = require('./diary_answer_fixtures');
const copy = value => JSON.parse(JSON.stringify(value));
const { core, worldApi, catalog, hear } = base;
const setup = options => answers.setup(options);
const forms = {
    ja: ['何してる？', '休む', '食べる'], en: ['What are you doing?', 'rest', 'eat'],
    'zh-CN': ['你在做什么？', '休息', '吃'], ru: ['Что ты делаешь?', 'отдых', 'есть'],
    'es-ES': ['¿Qué estás haciendo?', 'descansar', 'comer'],
    'pt-BR': ['O que você está fazendo?', 'descansar', 'comer'],
    de: ['Was machst du?', 'ausruhen', 'speisen']
};
function learn(v, locale = 'ja') {
    const texts = forms[locale];
    for (const [activity, index] of [['rest', 1], ['eat', 2]]) {
        followups.start(v, activity);
        hear(v, `「${texts[0]}」→「${texts[index]}」`, { locale });
        followups.finish(v);
    }
}
function prepared(locale = 'ja', speech = 'short', initial = false) {
    const v = setup({ foundation: initial, speech: 'short' });
    if (!initial) learn(v, locale);
    followups.start(v, 'rest'); hear(v, forms[locale][0], { locale });
    v.state.settings.speech = speech;
    if (initial) v.state.knowledge.relations = v.state.knowledge.relations.filter(r => r.id !== 'question');
    return v;
}
function fixtures() {
    const all = [], add = (group, value, expected) => all.push({ group, value, expected });
    for (const locale of Object.keys(forms)) for (const speech of ['short', 'gesture']) {
        add('actual-scoped-learning', hear(prepared(locale, speech), followups.forms[locale][0], { locale }), true);
        add('initial-question-mask', hear(prepared(locale, speech, true), followups.forms[locale][0], { locale }), true);
    }
    for (const foundation of [false, true]) for (const life of [false, true]) for (const speech of ['short', 'gesture']) {
        const v = setup({ foundation, life, speech }); hear(v, '何してる？');
        add('eight-settings-without-original-answer', hear(v, followups.forms.ja[0]), false);
    }
    for (const raw of ['もう一度教えて', 'もういちど言って', 'もう一回聞かせてください',
        'さっきの答えをもう一度教えてくれる？', '  もう一度教えて  '])
        for (const speech of ['short', 'gesture']) add('existing-japanese-repeat-forms', hear(prepared('ja', speech), raw), true);
    for (const f of followups.fixtures().filter(f => f.expected && f.type === 'repeat')) {
        for (const speech of ['short', 'gesture']) {
            const v = { state: copy(f.value.receipt.beforeState), world: copy(f.value.receipt.beforeWorld) };
            v.state.settings.speech = speech;
            v.state.knowledge.relations = v.state.knowledge.relations.filter(r => r.id !== 'question');
            add('original-answer:' + f.group, hear(v, f.value.result.input.raw,
                { locale: f.value.result.input.locale, speaker: f.value.result.input.speaker }), true);
        }
    }
    for (const speech of ['short', 'gesture']) {
        const absent = prepared('ja', speech); delete absent.state.context.lastOutput;
        add('legacy-null-output', hear(absent, followups.forms.ja[0]), true);
        const earlier = prepared('ja', speech);
        const previous = copy(earlier.state.context.turns.at(-1).answer);
        worldApi.approach(earlier.world, 'path');
        add('changed-activity-keeps-original-answer', hear(earlier, followups.forms.ja[0]), true);
        if (JSON.stringify(earlier.state.context.turns.at(-2).answer) !== JSON.stringify(previous)) throw new Error('Original answer changed');
        const full = setup(); hear(full, '何してる？'); full.state.settings.speech = speech;
        add('complete-repeat-is-not-cm', hear(full, followups.forms.ja[0]), false);
        const other = prepared('ja', speech);
        add('other-speaker', hear(other, followups.forms.ja[0], { speaker: 'visitor' }), false);
        const intervening = prepared('ja', speech); hear(intervening, 'おはよう');
        add('intervening-input', hear(intervening, followups.forms.ja[0]), false);
        const observation = setup({ speech }); followups.start(observation, 'eat'); followups.finish(observation);
        add('observation-without-original-answer', hear(observation, followups.forms.ja[0]), false);
        for (const raw of ['私はもう一度教えて', 'もう一度教えて\n休もう', '休むって？', '何してる？', 'おはよう'])
            add('other-inputs', hear(prepared('ja', speech), raw), false);
    }
    for (const name of ['incomplete_context_question', 'gesture_context_question', 'incomplete_reason_question',
        'gesture_reason_question', 'incomplete_direct_question', 'gesture_direct_question',
        'incomplete_confirmation_question', 'gesture_confirmation_question', 'incomplete_name_question',
        'gesture_name_question', 'incomplete_sour_question', 'gesture_sour_question']) {
        for (const f of require('./diary_' + name + '_fixtures').fixtures().filter(f => f.expected))
            add('other-owner:' + name, copy(f.value), false);
    }
    return all;
}
module.exports = { fixtures, prepared, setup, hear, learn, forms, core, worldApi, catalog };
