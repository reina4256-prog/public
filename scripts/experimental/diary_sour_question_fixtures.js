'use strict';
// Real owner calls in disposable Node memory. No user data or game wiring.
const base = require('./diary_name_response_fixtures');
const life = require('./diary_negation_fixtures');
const core = require('../../experimental_word_learning_core');
const catalog = require('../../experimental_word_learning_catalog.json');
const setup = base.setup;
function hear(v, raw = 'すっぱくない？', options = {}) {
    if (!v.steps) v.steps = [];
    const value = base.hear(v, raw, options);
    delete value.receipt.origin; delete value.receipt.antecedent;
    return value;
}
function eat(v, quality = 'sweet', pleasant = true) {
    life.start(v, 'eat'); v.world.mealTaste = { quality, pleasant };
    life.finish(v);
    if (!v.world.experiences.some(e => e.kind === 'eat')) throw new Error('Meal fixture did not finish');
    return v;
}
function fixtures() {
    const all = [], add = (group, value, expected) => all.push({ group, value, expected });
    for (const foundation of [false, true]) for (const known of [false, true]) for (const speech of ['short', 'gesture'])
        add('eight-settings', hear(setup({ foundation, life: known, speech })), foundation && known && speech === 'short');
    for (const word of ['すっぱくない', '酸っぱくない']) for (const ending of ['', 'の', 'かな'])
        for (const mark of ['？', '?']) for (const meal of [false, true])
            add('existing-japanese-forms-two-responses', hear(meal ? eat(setup()) : setup(), word + ending + mark), true);
    for (const locale of Object.keys(catalog.patterns))
        add('seven-input-locales-no-new-grammar', hear(setup(), 'すっぱくない？', { locale }), locale === 'ja');
    for (const raw of ['Is it sour?', '酸不酸？', 'Ist das sauer?']) add('foreign-forms-not-added', hear(setup(), raw), false);
    for (const raw of ['すっぱくない', 'すっぱくない。', 'すっぱくない！', 'すっぱくない？すっぱくない？',
        'すっぱくない？\n休もう', 'すっぱくない？。 ', '酸っぱくないか？'])
        add('missing-question-and-outside-forms', hear(setup(), raw), false);
    for (const raw of [' すっぱくない？', '酸っぱくないかな?']) add('existing-trim', hear(setup(), raw), true);
    add('existing-trim', hear(setup(), ' すっぱくない？ '), false);
    for (const raw of ['これは何', 'おいしかった？', 'いま何してる？', 'うん', 'おはよう',
        '休むことは大事', '今は食べたくない', '木の実は嫌いじゃない', '木の実を食べないで',
        '食べ終わったら散歩しよう', 'もう一度言って']) add('other-owners', hear(setup(), raw), false);
    for (const missing of ['eat', 'question', 'negation']) {
        const v = setup(), list = missing === 'eat' ? 'meanings' : 'relations';
        v.state.knowledge[list] = v.state.knowledge[list].filter(e => e.id !== missing);
        add('missing-required-knowledge', hear(v), false);
    }
    for (const quality of ['sweet', 'bitter', 'sour']) for (const pleasant of [false, true])
        add('real-completed-meal-quality-and-pleasant', hear(eat(setup(), quality, pleasant)), true);
    {
        const v = eat(setup()); v.state.knowledge.meanings = v.state.knowledge.meanings.filter(e => e.id !== 'sweet');
        add('sweet-knowledge-not-a-capture-requirement', hear(v), true);
        const n = eat(setup()); eat(n, 'bitter'); add('last-eat-not-first-sweet', hear(n), true);
        const m = eat(setup()); life.start(m, 'rest'); life.finish(m);
        add('last-eat-before-other-experience', hear(m), true);
        const c = setup(); life.start(c, 'eat'); add('current-meal-not-completed-meal', hear(c), true);
    }
    for (const mode of ['observe', 'eat', 'rest', 'work', 'walk']) for (const meal of [false, true]) {
        const v = meal ? eat(setup()) : setup(); v.world.mode = mode;
        add('activity-separated-from-understanding', hear(v), true);
    }
    for (const speaker of ['player', 'visitor']) for (const meal of [false, true]) {
        const v = meal ? eat(setup()) : setup(); base.focus(v, 'shore', []);
        add('speaker-scene-attention-not-meal-subject-proof', hear(v, 'すっぱくない？', { speaker }), true);
    }
    {
        const v = setup({ foundation: false });
        for (const [activity, word] of [['rest', '休む'], ['eat', '食べる']]) {
            life.start(v, activity); hear(v, `「何してる？」→「${word}」`); life.finish(v);
        }
        if (!v.state.knowledge.relations.some(e => e.id === 'question' && e.source === 'experienced_relation'))
            throw new Error('Question fixture did not acquire original scope');
        add('real-question-scope-not-transferred', hear(v), false);
    }
    {
        const v = life.setup(); life.learnReport(v, 'ja');
        for (const polarity of ['positive', 'negative']) {
            life.start(v, polarity === 'positive' ? 'rest' : 'eat');
            life.hear(v, life.demo(polarity)); life.finish(v);
        }
        if (!v.state.knowledge.relations.some(e => e.id === 'negation' && e.source === 'experienced_relation'))
            throw new Error('Negation fixture did not acquire original scope');
        v.state.knowledge.relations.push({ id: 'question', source: 'initial' });
        add('real-negation-scope-not-transferred', hear(v), false);
    }
    return all;
}
module.exports = { fixtures, setup, hear, eat, core, catalog };
