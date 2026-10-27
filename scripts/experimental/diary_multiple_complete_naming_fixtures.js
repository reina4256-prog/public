'use strict';
// Existing grammar and actual receiver/responder, in disposable memory only.
const base = require('./diary_incomplete_retraction_material_fixtures');
const unknown = require('./diary_all_unknown_material_fixtures');
const activities = require('./diary_complete_other_speaker_proposal_fixtures');
const { hear, core, worldApi, catalog, copy, life } = base;
const raw = 'これをころって呼ぼう\nこれをぽぽって呼ぼう';
function focus(v, ids = ['berry:1']) {
    core.perceive(v.state, { scene: 'clearing', attention: ids.map(id => ({ id, meaning: 'berry' })) });
    return v;
}
function setup(options = {}) { return focus(base.setup(options)); }
function fixtures() {
    const all = [], add = (group, v, text = raw, options = {}, expected = true) =>
        all.push({ group, value: hear(v, text, options), expected });
    for (const speech of ['short', 'gesture']) for (const speaker of ['player', 'visitor']) {
        for (const foundation of [false, true]) for (const knownLife of [false, true])
            for (const text of [raw, 'これをころって呼ぼう\nこれをころって呼ぼう',
                raw + '\nこれをももって呼ぼう', 'これを「ころ」と呼ぶよ。これを「ぽぽ」と呼ぶよ',
                'これはころだよ\nそれはぽぽという名前だよ', 'ころだよ\nぽぽっていうんだ'])
                add('eight-settings-and-existing-forms', setup({ foundation, life: knownLife, speech }), text, { speaker }, foundation);
        add('known-target-name-description', setup({ speech }), 'これをころって呼ぼう\n木の実をぽぽって呼ぼう', { speaker });
        add('many-repeated-clauses', setup({ speech }), Array(12).fill('これをころって呼ぼう').join('\n'), { speaker });
        for (const ids of [[], ['berry:1', 'berry:2']])
            add('missing-or-ambiguous-target', focus(setup({ speech }), ids), raw, { speaker }, false);
        const unlearned = setup({ speech });
        unlearned.state.knowledge.relations = unlearned.state.knowledge.relations.filter(r => r.id !== 'naming');
        add('missing-naming-relation', unlearned, raw, { speaker }, false);
        for (const previous of ['未知', 'これをころって呼ぼう', raw, '木の実がある']) {
            const v = setup({ speech }); hear(v, previous, { speaker });
            add('actual-antecedent:' + previous, v, raw, { speaker });
        }
        for (const mode of ['eat', 'berry-low', 'berry-high', 'no-target', 'no-route', 'moving-no-route'])
            add('actual-activity:' + mode, focus(activities.prepared(mode, { speech })), raw, { speaker });
        for (const mode of ['rest', 'eat']) {
            const v = setup({ speech }); life.start(v, mode); life.finish(v); focus(v);
            add('actual-completed-experience:' + mode, v, raw, { speaker });
        }
        const selected = setup({ speech }); hear(selected, '休んでね'); focus(selected);
        add('original-selection-source', selected, raw, { speaker });
        for (const text of ['これをころって呼ぼう', 'これをころって呼ぼう\nおはよう',
            'これをころって呼ぼう\n未知', raw + '\n未知', raw + '\n休んでね',
            'さっきの説明は間違えた', '未知\n未解析', 'ぽぽは休むことだよ'])
            add('other-owner-boundaries', setup({ speech }), text, { speaker }, false);
        const mixed = setup({ speech, life: false });
        add('complete-and-incomplete-naming-mixed', mixed, 'これをころって呼ぼう\n木の実をぽぽって呼ぼう', { speaker }, false);
        const arrived = unknown.arrival({ speech });
        add('dynamic-name-answer', arrived, 'ころ', { speaker }, false);
        for (const locale of Object.keys(catalog.patterns)) if (locale !== 'ja')
            add('other-input-locale', setup({ speech }), raw, { speaker, locale }, false);
    }
    return all;
}
module.exports = { fixtures, setup, focus, hear, core, worldApi, catalog, copy, life, raw };
