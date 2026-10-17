'use strict';
// Existing bc forms and owner-generated evidence, only in disposable memory.
const original = require('./diary_after_eat_walk_proposal_fixtures');
const { setup, hearProposal, core, catalog, forms } = original;
const copy = value => JSON.parse(JSON.stringify(value));
function make(mask, speech = 'short') {
    const v = setup({ speech });
    const missing = ['walk', 'eat', 'invitation', 'sequence'].filter((id, i) => mask & (1 << i));
    for (const list of ['meanings', 'relations'])
        v.state.knowledge[list] = v.state.knowledge[list].filter(e => !missing.includes(e.id));
    return v;
}
function fixtures() {
    const all = [], add = (group, value, expected) => all.push({ group, value, expected });
    for (let mask = 0; mask < 16; mask++) for (const speech of ['short', 'gesture']) {
        for (const raw of forms)
            add('existing-forms-sixteen-knowledge-combinations', hearProposal(make(mask, speech), raw), mask !== 0);
        for (const locale of Object.keys(catalog.patterns))
            add('seven-locales-no-new-grammar', hearProposal(make(mask, speech), forms[0], { locale }), locale === 'ja' && mask !== 0);
        for (const attention of [[], [{ id: 'shade', meaning: 'rest' }], [{ id: 'berry:2', meaning: 'berry' }],
            [{ id: 'shade', meaning: 'rest' }, { id: 'berry:2', meaning: 'berry' }]]) {
            const v = make(mask, speech); core.perceive(v.state, { scene: 'shore', attention });
            add('attention-not-meal-or-participant', hearProposal(v), mask !== 0);
        }
        for (const mode of ['observe', 'eat', 'rest', 'work', 'walk']) {
            const v = make(mask, speech); v.world.mode = mode;
            add('activity-not-completion-reservation-or-compliance', hearProposal(v), mask !== 0);
        }
        for (const hunger of [0, .25, .5, .75, 1]) {
            const v = make(mask, speech); v.world.hunger = hunger;
            add('hunger-not-meal-or-desire', hearProposal(v), mask !== 0);
        }
        add('actual-speaker-and-time', hearProposal(make(mask, speech), forms[0], { speaker: 'visitor', at: 987654321 }), mask !== 0);
    }
    for (const raw of forms) for (const speech of ['short', 'gesture']) {
        for (const text of [` ${raw} `, `${raw}\u3002`, `${raw}!`, `${raw}?`, `${raw}\uff1f`])
            add('existing-normalization', hearProposal(make(15, speech), text), true);
        for (const suffix of [`\u3002${raw}`, `\n${raw}`])
            add('multiple-clauses', hearProposal(make(15, speech), raw + suffix), false);
        add('period-followed-by-space', hearProposal(make(15, speech), ` ${raw}\u3002 `), false);
    }
    // Reuse bc's actual meal and experienced relation evidence. Do not fabricate scope.
    for (const f of original.fixtures()) {
        if (f.expected) {
            const v = { state: copy(f.value.receipt.beforeState), world: copy(f.value.receipt.beforeWorld) };
            v.state.knowledge.meanings = v.state.knowledge.meanings.filter(e => e.id !== 'walk');
            add(`bc-missing-walk:${f.group}`, hearProposal(v, f.value.result.input.raw, f.value.result.input), true);
        } else {
            const frame = f.value.result.interpretations[0], u = f.value.result.understandings[0];
            const deficient = f.value.result.interpretations.length === 1 && frame.catalogRule === 'after_eat_walk'
                && u.unresolved.some(e => e.type === 'meaning' || e.type === 'relation');
            add(`bc:${f.group}`, f.value, deficient);
        }
    }
    return all;
}
module.exports = { fixtures, make, setup, hearProposal, core, catalog, forms };
