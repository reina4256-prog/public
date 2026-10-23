'use strict';
// Actual owner executions in disposable memory, with no player storage or UI.
const base = require('./diary_gesture_reason_question_fixtures');
const ordinary = require('./diary_proposal_fixtures');
const life = require('./diary_negation_fixtures');
const work = require('./diary_work_observation_question_fixtures');
const { setup, hear, core, worldApi, catalog } = base;
const copy = v => JSON.parse(JSON.stringify(v));
const forms = Object.entries(catalog.proposalTeaching).flatMap(([locale, f]) =>
    ['request', 'invitation'].map(kind => ({ locale, kind, raw: f[kind].utterance, meaning: 'rest' })))
    .concat(require('./diary_incomplete_walk_proposal_fixtures').forms.map(raw => ({ locale: 'ja', kind: 'invitation', raw, meaning: 'walk' })));
function prepared(mode = 'rest', options = {}) {
    const v = setup(options), w = v.world;
    if (mode === 'eat') life.start(v, 'eat');
    if (mode === 'work') return work.working('farming', {}, v);
    if (mode === 'berry-low' || mode === 'berry-high') {
        Object.assign(w, { mode: 'observe', attention: 'berry:1', dwell: mode === 'berry-high' ? 5 : 4 });
        core.perceive(v.state, { scene: 'clearing', attention: [{ id: 'berry:1', meaning: 'berry' }] });
    }
    if (mode === 'no-target' || mode === 'no-route' || mode === 'moving-no-route') {
        Object.assign(w, { mode: 'idle', attention: null, island: { places: mode !== 'no-target'
            ? [{ id: 'shade', x: .7, y: .5 }, { id: 'path', x: .5, y: .8 }] : [] } });
        core.perceive(v.state, { scene: 'clearing', attention: [] });
        if (mode === 'moving-no-route') Object.assign(w, { mode: 'move', destination: 'shade', reasons: [{ kind: 'curiosity', target: 'shade' }] });
    }
    return v;
}
function fixtures() {
    const all = [], add = (group, v, raw, options, expected) => all.push({ group, value: hear(v, raw, options), expected });
    for (const f of forms) for (const foundation of [false, true]) for (const life of [false, true])
        for (const speech of ['short', 'gesture']) for (const speaker of ['player', 'visitor'])
            add('existing-forms-eight-settings', setup({ foundation, life, speech }), f.raw, { locale: f.locale, speaker }, foundation && life && speaker !== 'player');
    for (const f of forms) for (const speech of ['short', 'gesture']) for (let mask = 0; mask < 4; mask++) {
        const v = setup({ speech });
        if (mask & 1) v.state.knowledge.meanings = v.state.knowledge.meanings.filter(m => m.id !== f.meaning);
        if (mask & 2) v.state.knowledge.relations = v.state.knowledge.relations.filter(r => r.id !== f.kind);
        add('required-knowledge-masks', v, f.raw, { locale: f.locale, speaker: 'visitor' }, mask === 0);
    }
    for (const f of forms) for (const speech of ['short', 'gesture'])
        for (const mode of ['rest', 'eat', 'work', 'berry-low', 'berry-high', 'no-target', 'no-route', 'moving-no-route'])
            add('actual-decisions:' + mode, prepared(mode, { speech }), f.raw, { locale: f.locale, speaker: 'visitor' }, true);
    for (const locale of Object.keys(catalog.proposalTeaching)) for (const speech of ['short', 'gesture'])
        for (const lifeKnown of [false, true]) for (const kind of ['request', 'invitation']) for (const speaker of ['player', 'visitor'])
            add('real-scoped-player-learning-no-transfer', ordinary.acquire(locale, lifeKnown, speech), catalog.proposalTeaching[locale][kind].utterance,
                { locale, speaker }, false);
    for (const speech of ['short', 'gesture']) for (const speaker of ['visitor', 'neighbor:2']) {
        const v = setup({ speech, life: false }); life.start(v, 'rest');
        life.hear(v, '休む'); life.finish(v);
        add('actual-life-learning-with-initial-relations', v, '休んでね', { speaker }, true);
        for (const raw of ['休んでね', '今から木陰で少し休んでください', '少し休憩しよう', '一緒に散歩しようよ'])
            add('existing-japanese-aliases', setup({ speech }), raw, { speaker }, true);
    }
    for (const speech of ['short', 'gesture']) for (const raw of ['休む', '散歩してね', '一緒に泳ごう', '休んでね\n未知',
        '散歩しよう\n休もう', '疲れたら休んでね', catalog.conditionTeaching.ja.utterance,
        catalog.sequenceTeaching.ja.utterance, '食べ終わったら散歩しよう', '木の実を食べないで',
        '【お願い】「休んでね」', '何してる？', '私は休んでいる', 'おはよう'])
        add('other-owners-and-unadopted-generic-condition', setup({ speech }), raw, { speaker: 'visitor' }, false);
    for (const speech of ['short', 'gesture']) for (const mode of ['rest', 'eat']) {
        const v = setup({ speech }); life.start(v, mode); life.finish(v);
        add('original-experience-observation', v, '休んでね', { speaker: 'visitor' }, true);
        const selected = setup({ speech }); hear(selected, '休んでね');
        add('existing-selection-source', selected, '散歩しよう', { speaker: 'visitor' }, true);
    }
    return all;
}
module.exports = { fixtures, forms, setup, hear, prepared, core, worldApi, catalog, copy, life };
