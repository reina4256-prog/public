'use strict';
// Actual prerequisite learning and owner executions in disposable memory only.
const base = require('./diary_negation_fixtures');
const reason = require('./diary_reason_question_fixtures');
const { prepareReason } = require('./diary_known_reason_explanation_fixtures');
const core = require('../../experimental_word_learning_core');
const worldApi = require('../../experimental_word_learning_world');
const catalog = require('../../experimental_word_learning_catalog.json');
const copy = v => JSON.parse(JSON.stringify(v));
const setup = (options = {}) => base.setup({ foundation: true, life: true, speech: 'gesture', ...options });
function hear(v, raw = catalog.reasonTeaching.ja.utterance, options = {}) {
    const beforeState = copy(v.state), beforeWorld = copy(v.world);
    const result = core.receive(v.state, raw, catalog,
        { locale: options.locale || 'ja', speaker: options.speaker || 'player', at: options.at ?? 100 + v.state.serial });
    const reply = worldApi.respond(v.world, result, v.state, catalog);
    return copy({ result, receipt: { input: result.input, inputKnowledge: beforeState.knowledge,
        inputContext: beforeState.context, beforeState, beforeWorld,
        afterState: v.state, afterWorld: v.world, reply } });
}
function prepared(options = {}, reviewed = false, locale = 'ja', choice = 'request') {
    const v = setup(options); prepareReason(v, locale);
    reason.select(v, choice, locale);
    if (reviewed) reason.hear(v, reason.demo(choice, locale, 'reason'), locale);
    return v;
}
function fixtures() {
    const all = [], add = (group, value, expected) => all.push({ group, value, expected });
    for (const foundation of [false, true]) for (const life of [false, true]) for (const speech of ['short', 'gesture']) {
        add('eight-settings-without-prerequisites', hear(setup({ foundation, life, speech })), foundation && life && speech === 'gesture');
        for (const reviewed of [false, true]) for (const choice of ['request', 'invitation'])
            add('real-initial-or-scoped-prerequisites', hear(prepared({ foundation, life, speech }, reviewed, 'ja', choice)), speech === 'gesture');
    }
    for (let mask = 0; mask < 8; mask++) {
        const v = setup();
        [['meanings', 'rest'], ['relations', 'question'], ['relations', 'reason']].forEach(([field, id], bit) => {
            if (mask & (1 << bit)) v.state.knowledge[field] = v.state.knowledge[field].filter(r => r.id !== id);
        });
        add('required-knowledge-masks', hear(v), mask === 0);
    }
    for (const raw of ['どうして休んだの？', 'なぜ休んだ？', 'なぜ休んだの?', 'どうして休んだ',
        'どうして休んだの？。', '  どうして休んだの？  ', 'どうして休んだの？\n休もう', 'どうして食べたの？']) {
        const value = hear(prepared({}, true), raw);
        // Accepted forms follow the existing parser; expectations are independently explicit.
        add('existing-japanese-forms', value, !['どうして休んだの？\n休もう', 'どうして食べたの？'].includes(raw));
    }
    for (const locale of Object.keys(catalog.reasonTeaching)) {
        add('existing-language-boundary', hear(prepared({}, true, locale), catalog.reasonTeaching[locale].utterance, { locale }), locale === 'ja');
        const v = prepared({ foundation: false }, true);
        add('experienced-scope-not-other-language', hear(v, catalog.reasonTeaching[locale].utterance, { locale }), locale === 'ja');
    }
    for (const foundation of [false, true]) for (const scenario of ['no-review', 'reviewed', 'new-unreviewed', 'moving', 'resting', 'other-speaker']) {
        const v = prepared({ foundation }, scenario !== 'no-review');
        if (['new-unreviewed', 'moving', 'resting'].includes(scenario)) reason.select(v, 'request', 'ja', scenario === 'new-unreviewed');
        if (scenario === 'resting') {
            const shade = worldApi.PLACES.find(p => p.id === 'shade');
            v.world.x = shade.x; v.world.y = shade.y; v.world.pause = 0;
            worldApi.onArrival(v.world, v.state, worldApi.tick(v.world, .1));
        }
        add('original-reply-reference-boundaries', hear(v, undefined, { speaker: scenario === 'other-speaker' ? 'visitor' : 'player' }), foundation || scenario !== 'other-speaker');
    }
    for (const mode of ['idle', 'observe', 'move', 'eat', 'work']) {
        const v = prepared({}, true);
        if (mode === 'move') worldApi.approach(v.world, 'path');
        else if (mode === 'eat') base.start(v, mode);
        else { v.world.mode = mode; v.world.attention = null; core.perceive(v.state, { scene: 'clearing', attention: [] }); }
        add('heard-activity-distinct-from-referenced-rest', hear(v, undefined, { at: 76543 }), true);
    }
    for (const name of ['gesture_confirmation_question', 'gesture_direct_question', 'gesture_name_question', 'gesture_sour_question', 'followup'])
        for (const f of require('./diary_' + name + '_fixtures').fixtures().filter(f => f.expected))
            add('other-owner:' + name, copy(f.value), false);
    return all;
}
module.exports = { fixtures, setup, hear, prepared, core, worldApi, catalog };
