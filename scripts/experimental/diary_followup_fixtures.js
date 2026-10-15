'use strict';
// Real owner executions in disposable memory. Existing forms are input data,
// not new translations or changes to the game's accepted language.
const { setup, hear: ownerHear } = require('./diary_answer_fixtures');
const { start, finish } = require('./diary_negation_fixtures');
const worldApi = require('../../experimental_word_learning_world');
const core = require('../../experimental_word_learning_core');
const catalog = require('../../experimental_word_learning_catalog.json');
const copy = value => JSON.parse(JSON.stringify(value));
function hear(value, raw, locale = 'ja', speaker = 'player') {
    const result = ownerHear(value, raw, locale, speaker), receipt = result.receipt;
    // Independent occurrence copies anchor fields which repeat_answer does not
    // retain in the copied original answer (notably the new input timestamp).
    receipt.input = copy(result.result.input);
    receipt.originalOutput = copy(receipt.beforeState.context.lastOutput || null);
    receipt.previousTurn = copy(receipt.beforeState.context.turns.at(-1) || null);
    receipt.inputKnowledge = copy(receipt.beforeState.knowledge);
    return result;
}
const forms = {
    ja: ['もう一度教えて', '一息って？', '甘いの？', 'それってどういうこと？'],
    en: ['say that again', 'What do you mean by a break?', 'Is it sweet?', 'What does that mean?'],
    'zh-CN': ['再说一遍', '休息是什么意思？', '甜吗？', '那是什么意思？'],
    ru: ['повтори', 'Что значит отдых?', 'Это сладкий?', 'Что это значит?'],
    'es-ES': ['repítelo', '¿Qué significa descanso?', '¿Es dulce?', '¿Qué significa eso?'],
    'pt-BR': ['repita', 'O que significa pausa?', 'É doce?', 'O que isso significa?'],
    de: ['sag das noch einmal', 'Was bedeutet Pause?', 'Ist es süß?', 'Was bedeutet das?']
};
function completeWork(value, master) {
    const careers = require('../../experimental_word_careers'), w = value.world;
    Object.assign(w, { mode: 'observe', attention: `master:${master}`, elapsed: w.elapsed + 1,
        dwell: 0, hunger: .1, fatigue: .1 });
    careers.arrive(w, { id: ++w.event, target: w.attention }); w.dwell = 0;
    worldApi.onArrival(w, value.state, careers.tick(w));
    w.dwell = 0; w.elapsed += 20;
    worldApi.onArrival(w, value.state, careers.tick(w));
}
function fixtures() {
    const all = [], add = (group, value, expected, type = null, message = null) =>
        all.push({ group, value, expected, type, message });
    for (const foundation of [false, true]) for (const life of [false, true]) for (const speech of ['short', 'gesture']) {
        for (const index of [0, 1, 3]) {
            const v = setup({ foundation, life, speech }); hear(v, '何してる？');
            add('eight-settings', hear(v, forms.ja[index]), foundation && life && speech === 'short',
                index === 0 ? 'repeat' : 'detail', index === 0 ? 'taking_break' : 'break_explained');
        }
    }
    for (const [locale, texts] of Object.entries(forms)) {
        const v = setup(); hear(v, '何してる？');
        add('seven-language-explicit-repeat', hear(v, texts[0], locale), true, 'repeat', 'taking_break');
        for (const index of [1, 3]) add('seven-language-detail', hear(v, texts[index], locale), true, 'detail', 'break_explained');
        start(v, 'eat'); hear(v, 'おいしい？');
        add('seven-language-taste', hear(v, texts[2], locale), true, 'detail', 'tastes_good');
        // An observation is not speech; a factual response may still cite it.
        finish(v);
        add('observation-not-repeat', hear(v, texts[0], locale), false);
        finishObservation(v);
        add('observed-meal-factual-response', hear(v, texts[2], locale), true, 'detail', 'tasted_good');
        add('observation-source-survives-speech', hear(v, texts[3], locale), true, 'detail', 'tasted_good');
        add('repeat-observation-derived-answer', hear(v, texts[0], locale), true, 'repeat', 'tasted_good');
    }
    for (const raw of ['一息って？', 'ひと息ってどういうこと？', 'つまり休んでいるということ？', '休憩？']) {
        const v = setup(); hear(v, '何してる？');
        add('existing-aliases', hear(v, raw), true, 'detail', 'break_explained');
    }
    for (const master of ['farming', 'fishing', 'cooking', 'smithing', 'building', 'explore']) {
        const v = setup(); completeWork(v, master);
        add('six-work-observation', hear(v, forms.ja[3]), true, 'detail', `work_did_${master}`);
        add('six-work-repeat', hear(v, forms.ja[0]), true, 'repeat', `work_did_${master}`);
    }
    for (const mode of ['rest', 'eat']) {
        const v = setup(); start(v, mode); hear(v, '何してる？');
        const original = copy(v.state.context.lastOutput);
        finish(v); // Restore only the original displayed context in test memory:
        // model a non-displayed change; never generate the old snapshot from now.
        v.state.context.lastOutput = original;
        add('changed-activity-original-time', hear(v, forms.ja[3]), true, 'detail', mode === 'rest' ? 'rested' : 'ate');
    }
    for (const raw of ['私は休んでいるの？', '休んでいないの？', '疲れたら休むってこと？',
        '一息って？私は悲しい', '休むし魔法を使うってこと？', '今も甘いの？', '昨日も一息って？']) {
        const v = setup(); hear(v, '何してる？'); add('unsupported-clauses', hear(v, raw), false);
    }
    for (const intervening of ['私は悲しい', '未知のこと', 'おはよう']) {
        for (const raw of [forms.ja[0], forms.ja[1]]) {
            const v = setup(); hear(v, '何してる？'); hear(v, intervening);
            add('intervening-input', hear(v, raw), false);
        }
    }
    for (const raw of [forms.ja[0], forms.ja[1]]) {
        const v = setup(); hear(v, '何してる？');
        add('other-speaker', hear(v, raw, 'ja', 'visitor'), false);
    }
    for (const raw of ['何してる？', 'どこに行くの？', 'どうして休んだの？', 'おはよう', '休んでね'])
        add('separate-owners', hear(setup(), raw), false);
    const feeling = setup(); start(feeling, 'eat'); finish(feeling);
    add('observation-feeling-is-not-answer', hear(feeling, 'ほっとしたの？'), false);
    const noTaste = setup(); start(noTaste, 'eat'); finish(noTaste);
    delete noTaste.world.experiences.at(-1).taste;
    finishObservation(noTaste);
    add('no-original-taste', hear(noTaste, forms.ja[2]), false);
    const unknown = setup(); start(unknown, 'eat'); finish(unknown);
    unknown.state.knowledge.meanings = unknown.state.knowledge.meanings.filter(m => m.id !== 'sweet');
    add('missing-required-meaning', hear(unknown, forms.ja[2]), false);
    const absent = setup(); hear(absent, '何してる？'); delete absent.state.context.lastOutput;
    add('legacy-repeat-no-invented-output', hear(absent, forms.ja[0]), true, 'repeat', 'taking_break');
    add('legacy-no-topic-for-detail', hear(absent, forms.ja[1]), false);
    // Actual scoped learning, not initial knowledge injected after the input.
    const learned = setup({ foundation: false });
    const old = hear(learned, forms.ja[1]);
    for (const [mode, term] of [['rest', '休む'], ['eat', '食べる']]) {
        start(learned, mode); hear(learned, `「何してる？」→「${term}」`); finish(learned);
    }
    start(learned, 'rest'); hear(learned, '何してる？');
    add('experienced-question-no-retroactivity', old, false);
    add('experienced-question-no-retroactivity', hear(learned, '休むって？'), false);
    add('experienced-question-repeat', hear(learned, forms.ja[0]), false);
    const life = setup({ life: false }); start(life, 'rest'); hear(life, '休む'); finish(life);
    hear(life, '何してる？');
    add('experienced-life-meaning', hear(life, forms.ja[1]), true, 'detail', 'break_explained');
    for (const original of require('./diary_answer_fixtures').fixtures().filter(f =>
        f.group === 'nine-entries-eight-settings' && f.expected)) {
        const v = { state: copy(original.value.receipt.beforeState), world: copy(original.value.receipt.beforeWorld) };
        const input = original.value.result.input;
        const result = core.receive(v.state, input.raw, catalog, { locale: input.locale, speaker: input.speaker, at: input.at });
        worldApi.respond(v.world, result, v.state, catalog);
        add('ap-nine-entries-repeat-only', hear(v, forms.ja[0]), true, 'repeat', original.value.receipt.reply.message);
    }
    const reason = require('./diary_reason_question_fixtures');
    const { prepareReason } = require('./diary_known_reason_explanation_fixtures');
    for (const choice of ['request', 'invitation']) {
        const v = setup(); prepareReason(v); reason.select(v, choice, 'ja', true);
        hear(v, reason.demo(choice, 'ja', 'reason')); hear(v, catalog.reasonTeaching.ja.utterance);
        add('u-selected-reason-repeat-only', hear(v, forms.ja[0]), true, 'repeat', 'selected_reason');
    }
    return all;
}
function finishObservation(value) {
    const event = value.state.experiences.at(-1);
    worldApi.onArrival(value.world, value.state, event);
}
module.exports = { fixtures, forms, setup, hear, start, finish, completeWork, finishObservation, core, catalog };
