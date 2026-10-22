'use strict';
// Actual work starts and owner responses in disposable memory, never player data.
const base = require('./diary_gesture_reason_question_fixtures');
const answers = require('./diary_answer_fixtures');
const careers = require('../../experimental_word_careers');
const { core, worldApi, catalog, hear, copy } = { ...base, copy: v => JSON.parse(JSON.stringify(v)) };
const forms = { ja: '何してる？', en: 'What are you doing?', 'zh-CN': '你在做什么？',
    ru: 'Что ты делаешь?', 'es-ES': '¿Qué estás haciendo?', 'pt-BR': 'O que você está fazendo?', de: 'Was machst du?' };
function working(master = 'farming', options = {}, value = answers.setup(options)) {
    const w = value.world;
    Object.assign(w, { mode: 'observe', attention: `master:${master}`, elapsed: w.elapsed + 1,
        dwell: 0, hunger: .1, fatigue: .1 });
    careers.arrive(w, { id: ++w.event, target: w.attention }); w.dwell = 0;
    const event = careers.tick(w); worldApi.onArrival(w, value.state, event);
    if (event?.kind !== 'work_start' || w.mode !== 'work') throw new Error('Expected actual work start');
    return value;
}
function finishWork(value) {
    value.world.dwell = 0; value.world.elapsed += 20;
    const event = careers.tick(value.world); worldApi.onArrival(value.world, value.state, event);
    if (event?.kind !== 'experience') throw new Error('Expected actual work completion');
    return event;
}
function fixtures() {
    const all = [], add = (group, value, expected) => all.push({ group, value, expected });
    for (const [locale, raw] of Object.entries(forms)) for (const master of Object.keys(careers.JOBS))
        for (const speech of ['short', 'gesture']) for (const speaker of ['player', 'visitor'])
            add('seven-locales-six-work-starts', hear(working(master, { speech }), raw, { locale, speaker }), speech === 'short');
    for (const foundation of [false, true]) for (const life of [false, true]) for (const speech of ['short', 'gesture'])
        for (const master of Object.keys(careers.JOBS))
            add('eight-settings', hear(working(master, { foundation, life, speech }), forms.ja), foundation && speech === 'short');
    for (const [locale, raw] of Object.entries(forms)) for (const speech of ['short', 'gesture']) {
        const v = working('farming', { speech });
        v.state.knowledge.relations = v.state.knowledge.relations.filter(r => r.id !== 'question');
        add('missing-question-relation', hear(v, raw, { locale }), false);
        add('trailing-space-extra-partial-not-repaired', hear(working('farming', { speech }), '  ' + raw.toLocaleUpperCase() + '  ', { locale }), false);
        add('existing-normalization', hear(working('farming', { speech }), raw.toLocaleUpperCase(), { locale }), speech === 'short');
        const revisit = working('farming', { speech }); finishWork(revisit); working('farming', {}, revisit);
        add('completed-work-and-revisit', hear(revisit, raw, { locale }), speech === 'short');
        const observed = answers.setup({ speech });
        require('./diary_negation_fixtures').start(observed, 'eat'); require('./diary_negation_fixtures').finish(observed);
        const originalOutput = copy(observed.state.context.lastOutput);
        working('farming', {}, observed);
        add('original-experience-observation', hear(observed, raw, { locale }), speech === 'short');
        // Compatibility snapshot: a retained earlier display, not a new UI observation.
        observed.state.context.lastOutput = originalOutput;
        add('retained-original-experience-display', hear(observed, raw, { locale }), speech === 'short');
    }
    for (const raw of ['なにしているの？', '今、何をしていますか？', '何してる', '何してる？。',
        '何してる？\n休もう', 'どうして休んだの？', 'どんな仕事をしたの？', 'また手伝いたい？',
        'どこに行くの？', '何をしたの？', '何を見ている？', 'おいしい？', 'おいしかった？', '休めた？',
        'もう一度教えて', 'どういうこと？', '休んでね', '一緒に休もう', '散歩しよう', '木の実を食べないで',
        '私は休んでいる', 'おはよう', '新しい問い']) {
        add('existing-aliases-and-other-inputs', hear(working(), raw), ['なにしているの？', '今、何をしていますか？', '何してる', '何してる？。'].includes(raw));
    }
    for (const mode of ['idle', 'rest', 'eat', 'move', 'observe']) {
        const v = answers.setup(); v.world.mode = mode;
        add('other-activity-is-not-work-observation', hear(v, forms.ja), false);
    }
    for (const f of answers.fixtures().filter(f => f.group === 'acquired-question-and-no-retroactive-input' && f.expected)) {
        const r = f.value.receipt, locale = f.value.result.input.locale;
        for (const boundary of ['same-scope', 'other-speaker', 'other-language']) {
            const v = working('farming', {}, { state: copy(r.beforeState), world: copy(r.beforeWorld) });
            const other = locale === 'ja' ? 'en' : 'ja';
            add('actual-question-scope:' + boundary, hear(v, forms[boundary === 'other-language' ? other : locale],
                { locale: boundary === 'other-language' ? other : locale, speaker: boundary === 'other-speaker' ? 'visitor' : 'player' }), boundary === 'same-scope');
        }
    }
    return all;
}
module.exports = { fixtures, working, finishWork, forms, setup: answers.setup, hear, core, worldApi, catalog, copy };
