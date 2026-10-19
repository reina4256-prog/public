'use strict';
// Actual existing owner calls in disposable memory. No player data or wiring.
const base = require('./diary_name_question_fixtures');
const copy = value => JSON.parse(JSON.stringify(value));
const setup = (options = {}) => base.setup({ ...options, speech: 'gesture' });
function named(options = {}, confirmed = false) {
    const v = base.named(options, confirmed); v.state.settings.speech = 'gesture'; return v;
}
const { focus, hear, core, catalog } = base;
function fixtures() {
    const all = [], add = (group, value, expected) => all.push({ group, value, expected });
    for (const foundation of [false, true]) for (const life of [false, true]) {
        add('generic-settings', hear(setup({ foundation, life })), foundation);
        add('named-settings', hear(named({ foundation, life })), foundation);
    }
    for (const confirmed of [false, true]) {
        for (const target of ['これ', 'それ']) for (const particle of ['', 'は'])
            for (const ending of ['何', 'なに', 'なんて呼ぶの', '何て呼ぶの'])
                for (const suffix of ['', '?', '？', '。', '！'])
                    add('existing-forms-named-' + confirmed, hear(named({}, confirmed), target + particle + ending + suffix), true);
        add('confirmed-versus-unconfirmed', hear(named({}, confirmed)), true);
    }
    for (const locale of Object.keys(catalog.patterns))
        add('seven-locales-no-new-grammar', hear(setup(), undefined, { locale }), locale === 'ja');
    for (const ids of [[], ['berry:1'], ['berry:1', 'berry:2'], ['shade']]) {
        const v = setup(); focus(v, 'clearing', ids);
        add('unique-target-required', hear(v), ids.length === 1);
    }
    for (const speaker of ['player', 'visitor']) {
        add('speaker-specific-name-or-looking', hear(named(), undefined, { speaker }), true);
        add('named-without-berry-meaning', hear(named({ life: false }), undefined, { speaker }), true);
    }
    for (const mode of ['observe', 'eat', 'rest', 'work', 'walk']) {
        const v = named(); v.world.mode = mode; add('activities', hear(v), true);
    }
    for (const raw of ['What is this?', '这是什么？', 'Was ist das?', 'これは何。休もう',
        'これは何\n休もう', 'これは何。 ', 'うん', 'ころ', 'おはよう', 'いま何してる？', 'すっぱくない？', 'もう一度言って'])
        add('other-inputs-not-repaired', hear(named(), raw), false);
    {
        const v = base.named({}, true); focus(v, 'shore'); hear(v, 'これをころって呼ぼう');
        v.state.settings.speech = 'gesture'; add('confirmed-new-active-origin', hear(v), true);
        const n = base.named(); focus(n, 'shore'); hear(n, 'これをころって呼ぼう');
        n.state.settings.speech = 'gesture'; add('multiple-active-origins', hear(n), true);
        const c = base.named(); hear(c, 'これをぽぽって呼ぼう'); c.state.settings.speech = 'gesture';
        add('competing-names-attend', hear(c), true);
        const r = base.named(); hear(r, '違う'); r.state.settings.speech = 'gesture';
        add('retracted-name-looking', hear(r), true);
        const g = setup({ life: false }); add('unknown-berry-attend', hear(g), true);
    }
    // Preserve all previous source material as rejection controls; never reclassify bd.
    for (const item of base.fixtures()) if (item.value.receipt.beforeState.settings.speech === 'short')
        add('bd-short-remains-separate', copy(item.value), false);
    {
        const { start, finish } = require('./diary_negation_fixtures');
        const v = setup({ foundation: false });
        for (const [activity, word] of [['rest', '休む'], ['eat', '食べる']]) {
            start(v, activity); hear(v, `「何してる？」→「${word}」`); finish(v);
        }
        if (!v.state.knowledge.relations.some(e => e.id === 'question' && e.source === 'experienced_relation'))
            throw new Error('Original question experience missing');
        add('experienced-question-scope-not-transferred', hear(v), false);
    }
    return all;
}
module.exports = { fixtures, setup, named, focus, hear, core, catalog };
