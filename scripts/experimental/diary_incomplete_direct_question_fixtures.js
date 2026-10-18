'use strict';
// Existing nine entry forms and actual owner calls, in disposable memory only.
const base = require('./diary_sour_question_fixtures');
const { setup, hear, core, catalog } = base;
const copy = value => JSON.parse(JSON.stringify(value));
const forms = [
    ['current_activity', '何してる？', [], ['question']],
    ['past_activity', '何をしたの？', [], ['question', 'time']],
    ['attention', '何を見ている？', [], ['question']],
    ['destination', 'どこに行くの？', [], ['question']],
    ['work_past', 'どんな仕事をしたの？', ['work'], ['question', 'time']],
    ['work_again', 'また手伝いたい？', ['work'], ['question']],
    ['taste_evaluation', 'おいしかった？', ['eat'], ['question']],
    ['taste_now', 'おいしい？', ['eat'], ['question']],
    ['rest_result', '休めた？', ['rest'], ['question']]
];
function prepare(v, slot) {
    if (!['work_past', 'work_again'].includes(slot)) return v;
    const careers = require('../../experimental_word_careers'), worldApi = require('../../experimental_word_learning_world');
    const w = v.world;
    Object.assign(w, { mode: 'observe', attention: 'master:farming', elapsed: w.elapsed + 1,
        dwell: 0, hunger: .1, fatigue: .1 });
    careers.arrive(w, { id: ++w.event, target: w.attention }); w.dwell = 0;
    worldApi.onArrival(w, v.state, careers.tick(w));
    w.dwell = 0; w.elapsed += 20;
    worldApi.onArrival(w, v.state, careers.tick(w));
    return v;
}
function fixtures() {
    const all = [], add = (group, value, expected) => all.push({ group, value, expected });
    for (const [slot, raw, meanings, relations] of forms) {
        const fields = [...meanings.map(id => ['meanings', id]), ...relations.map(id => ['relations', id])];
        for (let mask = 0; mask < 2 ** fields.length; mask++) for (const speech of ['short', 'gesture']) {
            const v = prepare(setup({ speech }), slot);
            fields.forEach(([field, id], bit) => {
                if (mask & (1 << bit)) v.state.knowledge[field] = v.state.knowledge[field].filter(e => e.id !== id);
            });
            add(slot + ':knowledge-masks', hear(v, raw), mask !== 0);
        }
        for (const foundation of [false, true]) for (const life of [false, true]) for (const speech of ['short', 'gesture']) {
            const missing = !foundation || meanings.some(id => id !== 'work' && !life);
            add(slot + ':eight-settings', hear(prepare(setup({ foundation, life, speech }), slot), raw), missing);
        }
        for (const mode of ['observe', 'eat', 'rest', 'work', 'walk']) {
            const v = setup({ foundation: false }); v.world.mode = mode;
            add(slot + ':speaker-time-activity', hear(v, raw, { speaker: 'visitor', at: 76543 }), true);
        }
        for (const locale of Object.keys(catalog.patterns))
            add(slot + ':locale-boundary', hear(setup({ foundation: false }), raw, { locale }), locale === 'ja');
        for (const ids of [[], ['berry:1'], ['berry:1', 'berry:2']]) {
            const v = setup({ foundation: false }); v.state.context.attention = ids.map(id => ({ id, meaning: 'berry' }));
            add(slot + ':attention-not-completion', hear(v, raw), true);
        }
        add(slot + ':multiple-clauses', hear(setup({ foundation: false }), raw + raw), false);
    }
    for (const raw of ['木の実がある？', '休むことは大事？', 'これは何', 'すっぱくない？',
        'もう一度言って', 'うん', 'おはよう', '木の実を食べないで', '食べ終わったら散歩しよう'])
        add('outside-nine-entries', hear(setup({ foundation: false, life: false }), raw), false);
    add('existing-unpunctuated-question', hear(setup({ foundation: false }), '何してる'), true);
    // Reuse actual scoped learning traces without granting their relation to other slots.
    for (const f of base.fixtures()
        .filter(f => f.group === 'real-question-scope-not-transferred')) {
        for (const [slot, raw] of forms) {
            const v = { state: copy(f.value.receipt.beforeState), world: copy(f.value.receipt.beforeWorld), steps: [] };
            // The learned scope applies only to its existing form/slot, never all nine.
            const applies = slot === 'current_activity';
            add('experienced-scope:' + slot, hear(v, raw), !applies);
        }
    }
    return all;
}
module.exports = { fixtures, setup, hear, core, catalog, forms };
