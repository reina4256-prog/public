'use strict';
// Replay existing be/cb evidence with actual owner calls, without changing their fixtures.
const base = require('./diary_sour_question_fixtures');
const worldApi = require('../../experimental_word_learning_world');
const copy = value => JSON.parse(JSON.stringify(value));
function replay(original, speech) {
    const v = { state: copy(original.receipt.beforeState), world: copy(original.receipt.beforeWorld), steps: [] };
    v.state.settings.speech = speech;
    const input = original.result.input;
    return base.hear(v, input.raw, { locale: input.locale, speaker: input.speaker, at: input.at });
}
function fixtures() {
    const all = [];
    for (const f of base.fixtures().filter(f => f.value.receipt.beforeState.settings.speech === 'short')) {
        for (const speech of ['short', 'gesture']) all.push({ group: 'be:' + f.group + ':' + speech,
            value: replay(f.value, speech), expected: f.expected && speech === 'gesture' });
    }
    for (const f of require('./diary_incomplete_sour_question_fixtures').fixtures().filter(f => f.expected)) {
        all.push({ group: 'cb:missing-foundation', value: f.value, expected: false });
    }
    return all;
}
module.exports = { fixtures, replay, setup: base.setup, hear: base.hear, eat: base.eat,
    core: base.core, catalog: base.catalog, worldApi };
