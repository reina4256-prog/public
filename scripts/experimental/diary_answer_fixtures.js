'use strict';
// Disposable actual owner executions. No player storage, notebook projection,
// parser extension, or fabricated successful answer is used as a fixture.
const core = require('../../experimental_word_learning_core');
const worldApi = require('../../experimental_word_learning_world');
const careers = require('../../experimental_word_careers');
const catalog = require('../../experimental_word_learning_catalog.json');
const { start, finish } = require('./diary_negation_fixtures');
const copy = value => JSON.parse(JSON.stringify(value));
const forms = {
    ja: ['何してる？', 'どんな仕事をしたの？', 'また手伝いたい？', '食べる', '休む'],
    en: ['What are you doing?', 'What work did you do?', 'Do you want to help again?', 'eat', 'rest'],
    'zh-CN': ['你在做什么？', '你做了什么工作？', '还想帮忙吗？', '吃', '休息'],
    ru: ['Что ты делаешь?', 'Какую работу ты сделал?', 'Ты хочешь помочь снова?', 'есть', 'отдых'],
    'es-ES': ['¿Qué estás haciendo?', '¿Qué trabajo hiciste?', '¿Quieres ayudar otra vez?', 'comer', 'descansar'],
    'pt-BR': ['O que você está fazendo?', 'Que trabalho você fez?', 'Você quer ajudar de novo?', 'comer', 'descansar'],
    de: ['Was machst du?', 'Welche Arbeit hast du gemacht?', 'Möchtest du noch einmal helfen?', 'speisen', 'ausruhen']
};
function setup(options = {}) { return { state: core.create(options, catalog), world: worldApi.create() }; }
function hear(value, raw, locale = 'ja', speaker = 'player') {
    const { state, world } = value, beforeState = copy(state), beforeWorld = copy(world);
    const result = core.receive(state, raw, catalog, { locale, speaker, at: 100 + state.serial });
    const reply = worldApi.respond(world, result, state, catalog);
    return copy({ result, receipt: { beforeState, beforeWorld, reply,
        turn: state.context.turns.find(turn => turn.id === result.input.id),
        answer: state.context.turns.find(turn => turn.id === result.input.id)?.answer || null, afterWorld: world } });
}
function completeWork(value, master = 'farming') {
    const world = value.world;
    Object.assign(world, { mode: 'observe', attention: `master:${master}`, elapsed: world.elapsed + 1,
        dwell: 0, hunger: .1, fatigue: .1 });
    careers.arrive(world, { id: ++world.event, target: world.attention }); world.dwell = 0;
    worldApi.onArrival(world, value.state, careers.tick(world));
    world.dwell = 0; world.elapsed += 20;
    worldApi.onArrival(world, value.state, careers.tick(world));
}
function fixtures() {
    const all = [], add = (group, value, expected, slot = null, message = null) =>
        all.push({ group, value, expected, slot, message });
    for (const foundation of [false, true]) for (const life of [false, true]) for (const speech of ['short', 'gesture']) {
        const options = { foundation, life, speech }, ok = foundation && life && speech === 'short';
        for (const [slot, raw, prepare, message] of [
            ['current_activity', '何してる？', v => start(v, 'rest'), 'resting'],
            ['past_activity', '何をしたの？', v => { start(v, 'eat'); finish(v); }, 'ate'],
            ['attention', '何を見ている？', v => { v.world.attention = 'berry:1'; }, 'looking_berry'],
            ['destination', 'どこに行くの？', v => { v.world.mode = 'move'; v.world.destination = 'shade'; }, 'going_rest'],
            ['taste_evaluation', 'おいしかった？', v => { start(v, 'eat'); finish(v); }, 'tasted_good'],
            ['taste_now', 'おいしい？', v => start(v, 'eat'), 'tastes_good'],
            ['rest_result', '休めた？', v => { start(v, 'rest'); finish(v); }, 'rest_helped']
        ]) {
            const v = setup(options); prepare(v);
            add('nine-entries-eight-settings', hear(v, raw), ok, slot, ok ? message : null);
        }
        const v = setup(options); completeWork(v);
        for (const [raw, slot, message] of [[forms.ja[1], 'work_past', 'work_did_farming'],
            [forms.ja[2], 'work_again', 'work_again']])
            add('nine-entries-eight-settings', hear(v, raw), foundation && speech === 'short', slot,
                foundation && speech === 'short' ? message : null);
    }
    for (const [locale, texts] of Object.entries(forms)) {
        for (const speech of ['short', 'gesture']) {
            const v = setup({ speech }); start(v, 'rest');
            add('existing-seven-language-forms', hear(v, texts[0], locale), speech === 'short', 'current_activity',
                speech === 'short' ? 'resting' : null);
            completeWork(v);
            for (const [index, slot, message] of [[1, 'work_past', 'work_did_farming'], [2, 'work_again', 'work_again']])
                add('existing-seven-language-forms', hear(v, texts[index], locale), speech === 'short', slot,
                    speech === 'short' ? message : null);
        }
        // Actual scoped question learning from two completed demonstrations.
        const v = setup({ foundation: false });
        const old = hear(v, texts[0], locale);
        for (const [activity, index] of [['rest', 4], ['eat', 3]]) {
            start(v, activity); hear(v, `「${texts[0]}」→「${texts[index]}」`, locale); finish(v);
        }
        start(v, 'rest');
        add('acquired-question-and-no-retroactive-input', old, false);
        add('acquired-question-and-no-retroactive-input', hear(v, texts[0], locale), true, 'current_activity', 'resting');
        add('scoped-other-speaker', hear(v, texts[0], locale, 'visitor'), false);
        const other = locale === 'ja' ? 'en' : 'ja';
        add('scoped-other-language', hear(v, forms[other][0], other), false);
    }
    // Bodily completion really teaches the required life meaning.
    for (const locale of Object.keys(forms)) {
        const v = setup({ life: false }); start(v, 'rest'); hear(v, forms[locale][4], locale); finish(v); start(v, 'rest');
        add('acquired-life-meaning', hear(v, forms[locale][0], locale), true, 'current_activity', 'resting');
    }
    for (const master of Object.keys(careers.JOBS)) for (const condition of ['ready', 'hungry', 'tired', 'other']) {
        const v = setup(); completeWork(v, master);
        if (condition === 'hungry') v.world.hunger = .8;
        if (condition === 'tired') v.world.fatigue = .8;
        if (condition === 'other') v.world.careers.people[master].interest = 0;
        add('six-work-results-and-real-willingness', hear(v, forms.ja[1]), true, 'work_past', `work_did_${master}`);
        add('six-work-results-and-real-willingness', hear(v, forms.ja[2]), true, 'work_again',
            { ready: 'work_again', hungry: 'work_hungry', tired: 'work_tired', other: 'work_other' }[condition]);
    }
    for (const raw of ['どこに行くの？', 'おいしかった？'])
        add('actual-negative-status-without-completion', hear(setup(), raw), true, null,
            raw.startsWith('どこ') ? 'not_going' : 'not_eaten_yet');
    const untried = setup(); completeWork(untried); untried.world = worldApi.create();
    add('actual-negative-status-without-completion', hear(untried, forms.ja[1]), true, 'work_past', 'work_untried');
    add('actual-negative-status-without-completion', hear(untried, forms.ja[2]), true, 'work_again', 'work_untried');
    for (const raw of ['何をしたの？', '何を見ている？', '休めた？', 'どうして休んだの？',
        'おはよう', '休んでね', '木の実はおいしい', '「何してる？」→「休む」', '何してる？\nおいしい？'])
        add('other-owners-unknown-and-nonquestion', hear(setup(), raw), false);
    const uncertainTaste = setup(); start(uncertainTaste, 'eat'); uncertainTaste.world.mealTaste.pleasant = false;
    add('uncertain-taste-is-not-an-answer', hear(uncertainTaste, 'おいしい？'), false);
    const repeat = setup(); start(repeat, 'rest'); hear(repeat, '何してる？');
    add('repeat-and-context-detail-remain-separate', hear(repeat, 'もう一度教えて'), false);
    add('repeat-and-context-detail-remain-separate', hear(repeat, 'どういうこと？'), false);
    const observation = setup(); completeWork(observation); observation.world.mode = 'work';
    add('work-observation-is-not-self-answer', hear(observation, '何してる？'), false);
    return all;
}
module.exports = { fixtures, hear, setup, completeWork };
