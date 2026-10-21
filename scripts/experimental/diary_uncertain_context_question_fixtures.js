'use strict';
// Reuse aq's prepared missing-taste compatibility boundary, never a player save.
// Current ordinary meal completion records sweet/pleasant; this is not such an observation.
const follow = require('./diary_followup_fixtures');
const base = require('./diary_incomplete_context_question_fixtures');
const copy = v => JSON.parse(JSON.stringify(v));
const { core, worldApi, catalog, hear } = base;
function prepared(options = {}) {
    const v = follow.setup(options); follow.start(v, 'eat'); follow.finish(v);
    delete v.world.experiences.at(-1).taste;
    follow.finishObservation(v);
    return v;
}
function fixtures() {
    const all = [], add = (group, value, expected) => all.push({ group, value, expected });
    for (const foundation of [false, true]) for (const life of [false, true]) for (const speech of ['short', 'gesture'])
        add('eight-settings', hear(prepared({ foundation, life, speech }), '甘いの？'), foundation && life && speech === 'short');
    for (const [locale, texts] of Object.entries(follow.forms)) for (const speech of ['short', 'gesture']) {
        for (let mask = 0; mask < 16; mask++) {
            const v = prepared({ speech });
            [['meanings', 'sweet'], ['meanings', 'eat'], ['relations', 'question'], ['relations', 'time']].forEach(([field, id], bit) => {
                if (mask & (1 << bit)) v.state.knowledge[field] = v.state.knowledge[field].filter(m => m.id !== id);
            });
            add('seven-language-knowledge-masks', hear(v, texts[2], { locale }), mask === 0 && speech === 'short');
        }
        add('recorded-taste-owned-by-aq-or-cl', hear(base.prepared(0, speech), texts[2], { locale }), false);
        add('other-speaker', hear(prepared({ speech }), texts[2], { locale, speaker: 'visitor' }), false);
        add('repeat-not-context', hear(prepared({ speech }), texts[0], { locale }), false);
    }
    for (const raw of ['甘いの？', '甘いって？', '甘いですか？', '  甘いの？  '])
        add('existing-japanese-forms', hear(prepared(), raw), true);
    for (const raw of ['私は甘いの？', '甘いなら休もう？', '甘いの？\n休もう', '新しい未対応文型です'])
        add('unsupported-or-multiple', hear(prepared(), raw), false);
    const moved = prepared(); worldApi.approach(moved.world, 'path');
    add('activity-changed-original-missing-taste', hear(moved, '甘いの？'), true);
    const intervening = prepared(); hear(intervening, 'おはよう');
    add('intervening-input', hear(intervening, '甘いの？'), false);
    const noOutput = prepared(); delete noOutput.state.context.lastOutput;
    add('no-original-output', hear(noOutput, '甘いの？'), false);
    for (const f of follow.fixtures().filter(f => f.expected)) {
        const r = f.value.receipt, v = { state: copy(r.beforeState), world: copy(r.beforeWorld) }, input = f.value.result.input;
        add('aq-complete-answers-and-repeats', hear(v, input.raw, { locale: input.locale, speaker: input.speaker, at: input.at }), false);
    }
    // Execute representative repeat controls directly rather than recursively
    // regenerating every older fixture tree; full regression retains those trees.
    for (const [locale, texts] of Object.entries(follow.forms)) for (const speech of ['short', 'gesture']) {
        const v = follow.setup(); hear(v, require('./diary_incomplete_repeat_question_fixtures').forms[locale][0], { locale });
        v.state.settings.speech = speech;
        add('complete-repeat-owned-by-aq-or-cn', hear(v, texts[0], { locale }), false);
        const partial = follow.setup(); hear(partial, require('./diary_incomplete_repeat_question_fixtures').forms[locale][0], { locale });
        partial.state.settings.speech = speech;
        partial.state.knowledge.relations = partial.state.knowledge.relations.filter(r => r.id !== 'question');
        add('incomplete-repeat-owned-by-cm', hear(partial, texts[0], { locale }), false);
    }
    return all;
}
module.exports = { fixtures, prepared, hear, core, worldApi, catalog };
