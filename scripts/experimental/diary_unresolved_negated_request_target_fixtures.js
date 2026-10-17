'use strict';
// Existing owner forms and receipts in disposable memory. No game/save connection.
const original = require('./diary_negated_request_fixtures');
const { setup, hearRequest, core, catalog, forms } = original;
const copy = value => JSON.parse(JSON.stringify(value));
function make(options = {}) {
    const v = setup(options);
    core.perceive(v.state, { scene: 'shore', attention: [] });
    return v;
}
function fixtures() {
    const all = [], add = (group, value, expected) => all.push({ group, value, expected });
    for (const raw of forms) for (const speech of ['short', 'gesture']) {
        const explicit = forms.indexOf(raw) >= 8;
        for (const attention of [[], [{ id: 'shade', meaning: 'rest' }],
            [{ id: 'berry:1', meaning: 'berry' }, { id: 'shade', meaning: 'rest' }]]) {
            const v = make({ speech }); core.perceive(v.state, { scene: 'shore', attention });
            add('twelve-forms-attention-empty-single-ambiguous', hearRequest(v, raw), !explicit && attention.length !== 1);
        }
        for (const text of [` ${raw} `, `${raw}\u3002`, `${raw}!`, `${raw}?`, `${raw}\uff1f`])
            add('existing-normalization-no-new-grammar', hearRequest(make({ speech }), text), !explicit);
        for (const text of [`${raw}\u3002${raw}`, `${raw}\n${raw}`, ` ${raw}\u3002 `])
            add('multiple-or-empty-clauses-rejected', hearRequest(make({ speech }), text), false);
        for (const attention of [[], [{ id: 'berry:1', meaning: 'berry' }]]) {
            const v = make({ speech });
            core.perceive(v.state, { scene: 'shore', attention });
            v.state.knowledge.meanings = v.state.knowledge.meanings.filter(e => e.id !== 'berry');
            add('explicit-berry-unknown-versus-deictic-attention', hearRequest(v, raw), explicit || !attention.length);
        }
        add('actual-speaker-time', hearRequest(make({ speech }), raw, { speaker: 'visitor', at: 987654321 }), !explicit);
    }
    for (const speech of ['short', 'gesture']) {
        for (const locale of Object.keys(catalog.patterns))
            add('seven-input-locales', hearRequest(make({ speech }), forms[0], { locale }), locale === 'ja');
        for (const mode of ['observe', 'eat', 'rest', 'work', 'walk']) {
            const v = make({ speech }); v.world.mode = mode;
            add('activity-not-cancellation-or-compliance', hearRequest(v), true);
        }
        for (const hunger of [0, .25, .5, .75, 1]) {
            const v = make({ speech }); v.world.hunger = hunger;
            add('hunger-not-target-or-desire', hearRequest(v), true);
        }
        for (let mask = 1; mask < 8; mask++) {
            const v = make({ speech });
            if (mask & 1) v.state.knowledge.meanings = v.state.knowledge.meanings.filter(e => e.id !== 'eat');
            if (mask & 2) v.state.knowledge.relations = v.state.knowledge.relations.filter(e => e.id !== 'request');
            if (mask & 4) v.state.knowledge.relations = v.state.knowledge.relations.filter(e => e.id !== 'negation');
            add('meaning-and-relation-deficiency-stays-bu', hearRequest(v), false);
        }
    }
    for (const speech of ['short', 'gesture']) for (const speaker of ['player', 'visitor']) {
        for (const attention of [[], [{ id: 'berry:1', meaning: 'berry' }],
            [{ id: 'berry:1', meaning: 'berry' }, { id: 'berry:2', meaning: 'berry' }]]) {
            const v = make({ speech });
            v.state.knowledge.meanings = v.state.knowledge.meanings.filter(e => e.id !== 'berry');
            for (const id of ['berry:1', 'berry:2']) {
                core.perceive(v.state, { scene: 'clearing', attention: [{ id, meaning: 'berry' }] });
                hearRequest(v, '\u3053\u308c\u3092\u6728\u306e\u5b9f\u3063\u3066\u547c\u307c\u3046');
            }
            core.perceive(v.state, { scene: 'shore', attention });
            add('actual-naming-competing-targets-and-speaker-scope', hearRequest(v, forms[8], { speaker }),
                speaker === 'visitor' || attention.length !== 1);
        }
    }
    for (const f of original.fixtures()) {
        const u = f.value.result.understandings[0];
        const expected = f.value.result.input.locale === 'ja' && f.value.result.interpretations.length === 1
            && f.value.result.interpretations[0].catalogRule === 'do_not_eat'
            && u.unresolved.length === 1 && u.unresolved[0].type === 'target';
        add(`bb:${f.group}`, f.value, expected);
        if (f.group.startsWith('real-experienced-')) {
            const v = { state: copy(f.value.receipt.beforeState), world: copy(f.value.receipt.beforeWorld) };
            core.perceive(v.state, { scene: 'shore', attention: [] });
            add('real-experienced-scope-with-unresolved-target-stays-bu', hearRequest(v), false);
        }
    }
    return all;
}
module.exports = { fixtures, make, setup, hearRequest, core, catalog, forms };
