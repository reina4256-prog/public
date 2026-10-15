'use strict';
// Disposable owner inputs. No game, sample or player-save connection.
const { setup, hear, core, catalog } = require('./diary_greeting_fixtures');
const forms = [];
for (const target of ['これ', 'それ', '木の実']) for (const particle of ['は', 'を'])
    for (const end of ['', 'ね']) forms.push(`${target}${particle}食べないで${end}`);
const hearRequest = (v, text = forms[0], options = {}) => hear(v, text, options);
function fixtures() {
    const all = [], add = (group, value, expected) => all.push({ group, value, expected });
    for (const foundation of [false, true]) for (const life of [false, true]) for (const speech of ['short', 'gesture'])
        add('eight-settings', hearRequest(setup({ foundation, life, speech })), foundation && life);
    for (const text of forms) for (const speech of ['short', 'gesture'])
        add('existing-twelve-forms-two-speech-settings', hearRequest(setup({ speech }), text), true);
    for (const locale of Object.keys(catalog.patterns))
        add('seven-input-locales-no-new-grammar', hearRequest(setup(), forms[0], { locale }), locale === 'ja');
    for (const [locale, text] of [['en', 'Do not eat that'], ['zh-CN', '不要吃那个'], ['de', 'Iss das nicht']])
        add('foreign-forms-not-added', hearRequest(setup(), text, { locale }), false);
    for (const text of forms) {
        for (const suffix of ['?', '？'])
            add('owner-question-punctuation-remains-request', hearRequest(setup(), text + suffix), true);
        for (const suffix of [`。${text}`, `\n${text}`])
            add('multiple-clauses', hearRequest(setup(), text + suffix), false);
        add('period-followed-by-unknown-space', hearRequest(setup(), ` ${text}。 `), false);
        for (const normalized of [` ${text} `, `${text}。`, `${text}!`])
            add('existing-trim-and-terminal-punctuation', hearRequest(setup(), normalized), true);
    }
    for (const text of ['食べないで', 'それを食べるな', '木の実は嫌いじゃない', '今はいらない',
        '食べ終わったら散歩しよう', 'おはよう', '休もう', '木の実がある', 'いま何してる？'])
        add('other-owners-and-outside-this-scope', hearRequest(setup(), text), false);
    for (const speech of ['short', 'gesture']) for (const attention of [[], [{ id: 'shade', meaning: 'rest' }],
        [{ id: 'berry:2', meaning: 'berry' }], [{ id: 'shade', meaning: 'rest' }, { id: 'berry:2', meaning: 'berry' }]]) {
        for (const explicit of [true, false]) {
            const v = setup({ speech }); core.perceive(v.state, { scene: 'shore', attention }); v.world.attention = null;
            add(explicit ? 'explicit-general-target-independent-of-attention' : 'deictic-target-owner-attention-uniqueness',
                hearRequest(v, forms[explicit ? 8 : 0], { at: 987654321 }), explicit || attention.length === 1);
        }
    }
    for (const mode of ['observe', 'eat', 'rest', 'work', 'walk']) for (const speech of ['short', 'gesture']) {
        const v = setup({ speech }); v.world.mode = mode;
        add('activity-understanding-not-cancellation-or-obedience', hearRequest(v), true);
    }
    for (const hunger of [0, .25, .5, .75, 1]) {
        const v = setup(); v.world.hunger = hunger;
        add('hunger-not-satiety-or-desire', hearRequest(v), true);
    }
    for (const missing of ['eat', 'berry', 'request', 'negation']) {
        const v = setup(), list = ['eat', 'berry'].includes(missing) ? 'meanings' : 'relations';
        v.state.knowledge[list] = v.state.knowledge[list].filter(item => item.id !== missing);
        add('each-required-meaning-target-or-relation', hearRequest(v, forms[8]), false);
    }
    for (const speech of ['short', 'gesture']) {
        add('initial-knowledge-other-speaker', hearRequest(setup({ speech }), forms[0], { speaker: 'visitor' }), true);
        const v = setup({ speech }); v.state.knowledge.meanings = v.state.knowledge.meanings.filter(item => item.id !== 'berry');
        add('deictic-target-does-not-require-berry-meaning', hearRequest(v), true);
    }
    const n = require('./diary_negation_fixtures');
    for (const speech of ['short', 'gesture']) {
        const v = n.setup({ foundation: true, life: true, speech });
        v.state.knowledge.relations = v.state.knowledge.relations.filter(item => item.id !== 'negation');
        for (const side of ['positive', 'negative']) {
            n.start(v, side === 'negative' ? 'eat' : 'rest'); n.hear(v, n.demo(side)); n.finish(v);
        }
        require('node:assert/strict').ok(v.state.knowledge.relations.some(item => item.id === 'negation' && item.source === 'experienced_relation'));
        add('real-experienced-negation-scope-not-transferred', hearRequest(v), false);
        const r = require('./diary_proposal_fixtures').acquire('ja', true, speech);
        // Initial negation is separate from the actual scoped proposal lessons.
        r.state.knowledge.relations.push({ id: 'negation', source: 'initial' });
        require('node:assert/strict').ok(r.state.knowledge.relations.some(item => item.id === 'request' && item.source === 'experienced_relation'));
        add('real-experienced-request-scope-not-transferred', hearRequest(r), false);
    }
    return all;
}
module.exports = { fixtures, setup, hearRequest, core, catalog, forms };
