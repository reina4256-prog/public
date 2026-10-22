'use strict';
// Compatibility comparisons in disposable memory, not normal-play frequency or user saves.
const base = require('./diary_gesture_reason_question_fixtures');
const follow = require('./diary_followup_fixtures');
const copy = v => JSON.parse(JSON.stringify(v));
const { core, worldApi, catalog, hear, setup } = base;
function prepared(mode = 'current-unpleasant', options = {}) {
    const v = setup({ speech: 'short', ...options }); follow.start(v, 'eat');
    if (mode === 'current-unpleasant') v.world.mealTaste.pleasant = false;
    if (mode === 'current-null') v.world.mealTaste = null;
    if (mode === 'current-absent') delete v.world.mealTaste;
    if (mode.startsWith('past')) {
        follow.finish(v);
        if (mode === 'past-missing') delete v.world.experiences.at(-1).taste;
        if (mode === 'past-unpleasant') v.world.experiences.at(-1).taste.pleasant = false;
        follow.finishObservation(v);
    }
    return v;
}
function fixtures() {
    const all = [], add = (group, value, expected) => all.push({ group, value, expected });
    for (const mode of ['current-unpleasant', 'current-null', 'current-absent', 'past-missing', 'past-unpleasant', 'current-normal', 'past-normal'])
        for (const raw of ['おいしい？', 'おいしかった？']) for (const speech of ['short', 'gesture']) for (let mask = 0; mask < 4; mask++) {
            const v = prepared(mode, { speech });
            if (mask & 1) v.state.knowledge.meanings = v.state.knowledge.meanings.filter(e => e.id !== 'eat');
            if (mask & 2) v.state.knowledge.relations = v.state.knowledge.relations.filter(e => e.id !== 'question');
            const uncertain = mode.startsWith('past') ? !mode.endsWith('normal')
                : raw === 'おいしい？' && mode !== 'current-normal';
            add('knowledge-masks:' + mode, hear(v, raw), uncertain && speech === 'short' && mask === 0);
        }
    for (const foundation of [false, true]) for (const life of [false, true]) for (const speech of ['short', 'gesture'])
        add('eight-settings', hear(prepared('current-unpleasant', { foundation, life, speech }), 'おいしい？'), foundation && life && speech === 'short');
    for (const locale of Object.keys(catalog.patterns)) for (const speech of ['short', 'gesture'])
        for (const raw of ['おいしい？', 'おいしかった？'])
            add('locale-boundary-no-new-grammar', hear(prepared('past-missing', { speech }), raw, { locale }), locale === 'ja' && speech === 'short');
    for (const raw of ['美味しい？', 'この木の実はおいしいの？', '美味しかった？', 'その木の実って美味しかったかな？'])
        add('existing-japanese-forms', hear(prepared('past-missing'), raw), true);
    for (const raw of ['私はおいしい？', 'おいしい？\n休もう', 'すっぱくない？', '甘いの？', 'もう一度教えて', '新しい味質問', '  おいしい？  '])
        add('outside-or-multiple', hear(prepared(), raw), false);
    for (const speech of ['short', 'gesture']) {
        add('different-speaker', hear(prepared('past-missing', { speech }), 'おいしかった？', { speaker: 'visitor' }), speech === 'short');
        const sweetUnknown = prepared('current-unpleasant', { speech });
        sweetUnknown.state.knowledge.meanings = sweetUnknown.state.knowledge.meanings.filter(e => e.id !== 'sweet');
        add('sweet-not-required-by-direct-question', hear(sweetUnknown, 'おいしい？'), speech === 'short');
        for (const raw of ['おいしい？', 'おいしかった？', '何をしたの？', '休めた？', 'どうして休んだの？'])
            add('no-meal-and-other-unknown', hear(setup({ speech }), raw), false);
    }
    for (const locale of Object.keys(follow.forms)) for (const speech of ['short', 'gesture']) {
        const v = require('./diary_uncertain_context_question_fixtures').prepared({ speech });
        add('context-owned-by-co-cl', hear(v, follow.forms[locale][2], { locale }), false);
    }
    // Match original scoped knowledge, not an invented generic question relation.
    for (const f of require('./diary_answer_fixtures').fixtures().filter(f => f.group === 'acquired-question-and-no-retroactive-input' && f.expected)) {
        const r = f.value.receipt, v = { state: copy(r.beforeState), world: copy(r.beforeWorld) };
        follow.start(v, 'eat'); v.world.mealTaste.pleasant = false;
        add('experienced-question-scope-not-transferred', hear(v, 'おいしい？'), false);
    }
    return all;
}
module.exports = { fixtures, prepared, setup, hear, core, worldApi, catalog };
