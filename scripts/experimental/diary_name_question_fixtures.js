'use strict';
// Actual owner calls in disposable Node memory; no user storage or game wiring.
const base = require('./diary_name_response_fixtures');
const core = require('../../experimental_word_learning_core');
const catalog = require('../../experimental_word_learning_catalog.json');
const copy = value => JSON.parse(JSON.stringify(value));
const setup = base.setup, focus = base.focus;
function hear(v, raw = 'これは何', options = {}) {
    const value = base.hear(v, raw, options);
    delete value.receipt.origin; delete value.receipt.antecedent;
    const u = value.result.understandings[0], before = value.receipt.beforeState;
    const links = before.knowledge.associations.filter(link => link.target === u.target?.adopted?.id
        && link.speaker === value.result.input.speaker && link.evidence.some(e => !e.retractedBy));
    const link = links.length === 1 ? links[0] : null;
    value.receipt.origins = link ? link.evidence.filter(e => !e.retractedBy)
        .map(e => v.steps.find(step => step.result.input.id === e.inputId)).filter(Boolean).map(copy) : [];
    value.receipt.confirmation = link?.confirmedBy ? copy(v.steps.find(step => step.result.input.id === link.confirmedBy)) : null;
    return value;
}
function named(options = {}, confirmed = false) {
    const v = setup(options); hear(v, base.forms.name);
    if (confirmed) hear(v, base.forms.yes);
    return v;
}
function fixtures() {
    const all = [], add = (group, value, expected) => all.push({ group, value, expected });
    for (const foundation of [false, true]) for (const life of [false, true]) for (const speech of ['short', 'gesture']) {
        add('generic-eight-settings', hear(setup({ foundation, life, speech })), foundation && life && speech === 'short');
        add('named-eight-settings', hear(named({ foundation, life, speech })), foundation && speech === 'short');
    }
    for (const target of ['これ', 'それ']) for (const particle of ['', 'は'])
        for (const ending of ['何', 'なに', 'なんて呼ぶの', '何て呼ぶの'])
            for (const suffix of ['', '？', '?', '。', '！'])
                add('existing-japanese-forms', hear(setup(), target + particle + ending + suffix), true);
    for (const locale of Object.keys(catalog.patterns))
        add('seven-input-locales-no-new-grammar', hear(setup(), 'これは何', { locale }), locale === 'ja');
    for (const raw of ['What is this?', '这是什么？', 'Was ist das?'])
        add('no-new-foreign-forms', hear(setup(), raw), false);
    for (const raw of ['これは何。休もう', 'これは何\n休もう', ' これは何。 ', 'うん', 'ころ', 'おはよう',
        'いま何してる？', 'すっぱくない？', 'さっきの説明は間違えた', '「ころ」しよう', 'もう一度言って'])
        add('other-owner-or-multiple-clauses', hear(named(), raw), false);
    for (const confirmed of [false, true]) for (const speech of ['short', 'gesture']) {
        const v = named({}, confirmed); v.state.settings.speech = speech;
        add(confirmed ? 'confirmed-name-vs-gesture' : 'unconfirmed-name-vs-gesture', hear(v), speech === 'short');
    }
    for (const ids of [[], ['berry:1'], ['berry:1', 'berry:2'], ['shade']]) {
        const v = setup(); focus(v, 'elsewhere', ids);
        add('current-attention-unique', hear(v), ids.length === 1 && ids[0] === 'berry:1');
    }
    for (const speaker of ['player', 'visitor']) {
        const v = named(); add('speaker-specific-names-generic-fallback', hear(v, 'これは何', { speaker }), true);
        const n = named({ life: false }); add('named-needs-no-berry-meaning', hear(n), true);
        const a = setup(); hear(a, base.forms.name); hear(a, base.forms.no);
        add('retracted-name-generic-fallback', hear(a), true);
    }
    {
        const v = named(); focus(v, 'shore'); hear(v, base.forms.name);
        add('multiple-active-origins-same-link', hear(v), true);
        const n = named(); hear(n, 'これをぽぽって呼ぼう');
        add('competing-active-names', hear(n), false);
        const p = named({}, true); focus(p, 'shore'); hear(p, base.forms.name);
        add('confirmed-name-new-active-origin', hear(p), true);
        const q = named({}, true); focus(q, 'shore'); hear(q, base.forms.name); hear(q, base.forms.correction);
        add('confirmed-name-other-evidence-retracted', hear(q), true);
    }
    for (const mode of ['observe', 'eat', 'rest', 'work', 'walk']) {
        const v = named(); v.world.mode = mode;
        add('activities-do-not-create-naming-experience', hear(v), true);
    }
    {
        const v = setup(); v.state.knowledge.relations = v.state.knowledge.relations.filter(e => e.id !== 'question');
        add('missing-question-relation', hear(v), false);
    }
    // Actual two-demonstration learning is scoped to current_activity, never name.
    {
        const { start, finish } = require('./diary_negation_fixtures');
        const v = setup({ foundation: false });
        for (const [activity, word] of [['rest', '休む'], ['eat', '食べる']]) {
            start(v, activity); hear(v, `「何してる？」→「${word}」`); finish(v);
        }
        if (!v.state.knowledge.relations.some(e => e.id === 'question' && e.source === 'experienced_relation'))
            throw new Error('Question demonstration fixture did not acquire its original scope');
        add('real-question-experience-scope-not-transferred', hear(v), false);
    }
    return all;
}
module.exports = { fixtures, setup, named, focus, hear, core, catalog };
