'use strict';
// Existing owner forms in disposable memory. No UI text or game/save connection.
const core = require('../../experimental_word_learning_core');
const worldApi = require('../../experimental_word_learning_world');
const catalog = require('../../experimental_word_learning_catalog.json');
const copy = value => JSON.parse(JSON.stringify(value));
function setup(options = {}) {
    const v = { state: core.create(options, catalog), world: worldApi.create() };
    core.perceive(v.state, { scene: 'clearing', attention: [{ id: 'berry:1', meaning: 'berry' }] });
    return v;
}
function hear(v, raw = 'おはよう', options = {}) {
    const beforeState = copy(v.state), beforeWorld = copy(v.world);
    const result = core.receive(v.state, raw, catalog,
        { locale: 'ja', speaker: 'player', at: 100 + v.state.serial, ...options });
    const reply = worldApi.respond(v.world, result, v.state, catalog);
    return copy({ result, receipt: { input: result.input, inputKnowledge: beforeState.knowledge,
        inputContext: beforeState.context, beforeState, beforeWorld, afterState: v.state, afterWorld: v.world, reply } });
}
function fixtures() {
    const all = [], add = (group, value, expected) => all.push({ group, value, expected });
    for (const foundation of [false, true]) for (const life of [false, true]) for (const speech of ['short', 'gesture'])
        add('eight-settings', hear(setup({ foundation, life, speech })), foundation);
    for (const raw of ['おはよ', 'おはよう', 'おはよー', 'おはよ～', 'おはよ〜', 'おはようございます', ' おはよう ', 'おはよう。', 'おはよう！'])
        for (const speech of ['short', 'gesture']) add('existing-japanese-aliases', hear(setup({ speech }), raw), true);
    for (const locale of Object.keys(catalog.patterns))
        add('seven-input-locales-no-new-grammar', hear(setup(), 'おはよう', { locale }), locale === 'ja');
    for (const raw of ['Good morning', '早上好', 'Доброе утро', 'Buenos días', 'Bom dia', 'Guten Morgen'])
        add('no-new-foreign-greetings', hear(setup(), raw), false);
    for (const raw of ['こんにちは', 'こんばんは', 'おはよう？', 'おはよう。おはよう', 'おはよう\n休んで', ' おはよう。 ',
        'うん', 'さっきの説明は間違えた', 'いま何してる？', 'もう一度言って', 'いっしょに休もう'])
        add('other-owner-or-outside-single-greeting', hear(setup(), raw), false);
    for (const speech of ['short', 'gesture']) {
        const v = setup({ speech });
        add('different-speaker-existing-initial-understanding', hear(v, 'おはよう', { speaker: 'visitor' }), true);
        core.perceive(v.state, { scene: 'shore', attention: [] });
        add('no-target-or-clock-inference', hear(v, 'おはよう', { at: 987654321 }), true);
        v.world.mode = 'rest';
        add('activity-does-not-supply-understanding', hear(v), true);
    }
    const report = require('./diary_negation_fixtures');
    for (const life of [false, true]) for (const speech of ['short', 'gesture']) {
        const v = report.setup({ life, speech }); report.learnReport(v, 'ja');
        add('real-experienced-report-scope-not-transferred', hear(v), false);
    }
    return all;
}
module.exports = { fixtures, setup, hear, core, catalog };
