'use strict';
// Disposable owner inputs, separate from game pages, samples and player saves.
const assert = require('node:assert/strict');
const { setup, hear, core, catalog } = require('./diary_greeting_fixtures');
const forms = [];
for (const separator of ['', '、', ',', ' ']) for (const together of ['', '一緒に'])
    for (const ending of ['しよう', 'しようよ', 'に行こう']) forms.push(`食べ終わったら${separator}${together}散歩${ending}`);
const hearProposal = (v, text = forms[0], options = {}) => hear(v, text, options);
function fixtures() {
    const all = [], add = (group, value, expected) => all.push({ group, value, expected });
    for (const foundation of [false, true]) for (const life of [false, true]) for (const speech of ['short', 'gesture'])
        add('eight-settings', hearProposal(setup({ foundation, life, speech })), foundation && life);
    for (const text of forms) for (const speech of ['short', 'gesture'])
        add('existing-separators-together-and-endings-two-speech-settings', hearProposal(setup({ speech }), text), true);
    for (const locale of Object.keys(catalog.patterns))
        add('seven-input-locales-no-new-grammar', hearProposal(setup(), forms[0], { locale }), locale === 'ja');
    for (const [locale, text] of [['en', 'After eating, let us walk'], ['zh-CN', '吃完后一起散步吧'], ['de', 'Nach dem Essen spazieren gehen']])
        add('foreign-forms-not-added', hearProposal(setup(), text, { locale }), false);
    for (const text of forms) {
        for (const suffix of ['?', '？'])
            add('owner-question-punctuation-remains-invitation', hearProposal(setup(), text + suffix), true);
        for (const suffix of [`。${text}`, `\n${text}`])
            add('multiple-clauses', hearProposal(setup(), text + suffix), false);
        add('period-followed-by-unknown-space', hearProposal(setup(), ` ${text}。 `), false);
        for (const normalized of [` ${text} `, `${text}。`, `${text}!`])
            add('existing-trim-and-terminal-punctuation', hearProposal(setup(), normalized), true);
    }
    for (const text of ['食後に散歩しよう', '食べ終わったら休んでね', catalog.sequenceTeaching.ja.utterance,
        '一緒に散歩しよう', '疲れたら休んでね', 'それを食べないで', '今はいらない',
        'おはよう', '木の実がある', 'いま何してる？'])
        add('other-owners-and-outside-this-scope', hearProposal(setup(), text), false);
    for (const attention of [[], [{ id: 'shade', meaning: 'rest' }], [{ id: 'berry:2', meaning: 'berry' }],
        [{ id: 'shade', meaning: 'rest' }, { id: 'berry:2', meaning: 'berry' }]]) for (const speech of ['short', 'gesture']) {
        const v = setup({ speech }); core.perceive(v.state, { scene: 'shore', attention }); v.world.attention = null;
        add('attention-not-a-meal-or-actor-reference', hearProposal(v, forms[0], { at: 987654321 }), true);
    }
    for (const mode of ['observe', 'eat', 'rest', 'work', 'walk']) for (const speech of ['short', 'gesture']) {
        const v = setup({ speech }); v.world.mode = mode;
        add('activity-not-condition-compliance-or-start', hearProposal(v), true);
    }
    for (const hunger of [0, .25, .5, .75, 1]) {
        const v = setup(); v.world.hunger = hunger;
        add('hunger-not-completion-or-desire', hearProposal(v), true);
    }
    for (const missing of ['walk', 'eat', 'invitation', 'sequence']) {
        const v = setup(), list = ['walk', 'eat'].includes(missing) ? 'meanings' : 'relations';
        v.state.knowledge[list] = v.state.knowledge[list].filter(item => item.id !== missing);
        add('each-required-meaning-or-relation', hearProposal(v), false);
    }
    for (const speech of ['short', 'gesture']) {
        add('initial-knowledge-other-speaker', hearProposal(setup({ speech }), forms[0], { speaker: 'visitor' }), true);
        const n = require('./diary_negation_fixtures');
        for (const completed of [false, true]) {
            const v = setup({ speech }); n.start(v, 'eat'); if (completed) n.finish(v);
            add('real-meal-before-after-does-not-resolve-condition', hearProposal(v), true);
        }
        const v = setup({ speech }); v.state.knowledge.relations = v.state.knowledge.relations.filter(item => item.id !== 'sequence');
        const demo = phase => `${catalog.sequenceTeaching.ja[phase]}「${catalog.sequenceTeaching.ja.utterance}」`;
        n.start(v, 'eat'); n.hear(v, demo('before')); n.finish(v); v.world.elapsed += .2; n.hear(v, demo('after'));
        assert.ok(v.state.knowledge.relations.some(item => item.id === 'sequence' && item.source === 'experienced_relation'));
        add('real-experienced-rest-sequence-scope-not-transferred', hearProposal(v), false);
        const r = require('./diary_proposal_fixtures').acquire('ja', true, speech);
        r.state.knowledge.relations.push({ id: 'sequence', source: 'initial' });
        assert.ok(r.state.knowledge.relations.some(item => item.id === 'invitation' && item.source === 'experienced_relation'));
        add('real-experienced-rest-invitation-scope-not-transferred', hearProposal(r), false);
    }
    return all;
}
module.exports = { fixtures, setup, hearProposal, core, catalog, forms };
