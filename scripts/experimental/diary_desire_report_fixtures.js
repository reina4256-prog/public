'use strict';
// Existing owner inputs in disposable Node memory, never player data.
const { setup, hear, core, catalog } = require('./diary_greeting_fixtures');
const forms = ['\u4eca\u306f\u98df\u3079\u305f\u304f\u306a\u3044', '\u4eca\u306f\u3044\u3089\u306a\u3044'];
const hearDesire = (v, text = forms[0], options = {}) => hear(v, text, options);
function fixtures() {
    const all = [], add = (group, v, expected) => all.push({ group, value: v, expected });
    for (const foundation of [false, true]) for (const life of [false, true]) for (const speech of ['short', 'gesture'])
        add('eight-settings', hearDesire(setup({ foundation, life, speech })), foundation && life);
    for (const text of forms) for (const speech of ['short', 'gesture'])
        add('existing-two-forms-and-expression', hearDesire(setup({ speech }), text), true);
    for (const locale of Object.keys(catalog.patterns))
        add('seven-input-locales-no-new-grammar', hearDesire(setup(), forms[0], { locale }), locale === 'ja');
    for (const text of ["I do not want to eat now", '\u73b0\u5728\u4e0d\u60f3\u5403', 'Jetzt will ich nicht essen'])
        add('foreign-forms-not-added', hearDesire(setup(), text), false);
    for (const text of forms) for (const suffix of ['\uff1f', `\u3002${forms[1]}`, `\n${forms[1]}`])
        add('questions-and-multiple-clauses', hearDesire(setup(), text + suffix), false);
    for (const text of forms) {
        add('trailing-space-after-period-unknown-clause', hearDesire(setup(), ` ${text}\u3002 `), false);
        for (const normalized of [` ${text} `, `${text}\u3002`, `${text}\uff01`])
            add('single-trim-and-terminal-punctuation', hearDesire(setup(), normalized), true);
    }
    for (const text of ['\u6728\u306e\u5b9f\u304c\u597d\u304d', '\u6728\u306e\u5b9f\u306f\u5acc\u3044',
        '\u5acc\u3044\u3058\u3083\u306a\u3044', '\u305d\u308c\u3092\u98df\u3079\u306a\u3044\u3067',
        '\u304a\u306f\u3088\u3046', '\u4f11\u3082\u3046', '\u6728\u306e\u5b9f\u304c\u3042\u308b',
        '\u4f11\u3080\u306e\u306f\u5927\u4e8b', '\u3046\u3093', '\u3044\u307e\u4f55\u3057\u3066\u308b\uff1f'])
        add('other-owners-and-unadopted-inputs', hearDesire(setup(), text), false);
    for (const speech of ['short', 'gesture']) {
        add('different-speaker-initial-understanding', hearDesire(setup({ speech }), forms[0], { speaker: 'visitor' }), true);
        const v = setup({ speech }); core.perceive(v.state, { scene: 'shore', attention: [] });
        v.world.attention = null;
        add('no-attention-or-clock-inference', hearDesire(v, forms[1], { at: 987654321 }), true);
    }
    for (const mode of ['observe', 'eat', 'rest', 'work', 'walk']) for (const speech of ['short', 'gesture']) {
        const v = setup({ speech }); v.world.mode = mode;
        add('activity-not-refusal-or-food-cancellation', hearDesire(v), true);
    }
    for (const hunger of [0, .25, .5, .75, 1]) {
        const v = setup(); v.world.hunger = hunger;
        add('hunger-not-satiety-or-speaker-verification', hearDesire(v), true);
    }
    for (const missing of ['eat', 'report', 'negation', 'time']) {
        const v = setup(), list = missing === 'eat' ? 'meanings' : 'relations';
        v.state.knowledge[list] = v.state.knowledge[list].filter(item => item.id !== missing);
        add('each-required-meaning-or-relation', hearDesire(v), false);
    }
    const report = require('./diary_negation_fixtures');
    for (const speech of ['short', 'gesture']) {
        const v = report.setup({ life: true, speech }); report.learnReport(v, 'ja');
        add('real-experienced-report-scope-not-transferred', hearDesire(v), false);
    }
    for (const relation of ['negation', 'time']) for (const speech of ['short', 'gesture']) {
        const v = report.setup({ foundation: true, life: true, speech });
        v.state.knowledge.relations = v.state.knowledge.relations.filter(item => item.id !== relation);
        for (const side of relation === 'negation' ? ['positive', 'negative'] : ['now', 'past']) {
            report.start(v, relation === 'negation' && side === 'negative' ? 'eat' : 'rest');
            const text = relation === 'negation' ? report.demo(side) : require('./diary_time_fixtures').demo(side);
            report.hear(v, text); report.finish(v);
        }
        require('node:assert/strict').ok(v.state.knowledge.relations.some(item => item.id === relation
            && item.source === 'experienced_relation'));
        add(`real-experienced-${relation}-scope-not-transferred`, hearDesire(v), false);
    }
    return all;
}
module.exports = { fixtures, setup, hearDesire, core, catalog, forms };
