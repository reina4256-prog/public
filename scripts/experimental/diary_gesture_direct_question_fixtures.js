'use strict';
// Actual existing receive/respond on disposable copies, including the original learned scopes.
const base = require('./diary_incomplete_direct_question_fixtures');
const worldApi = require('../../experimental_word_learning_world');
const copy = value => JSON.parse(JSON.stringify(value));
function replay(original, speech) {
    const v = { state: copy(original.receipt.beforeState), world: copy(original.receipt.beforeWorld), steps: [] };
    v.state.settings.speech = speech;
    const input = original.result.input;
    return base.hear(v, input.raw, { locale: input.locale, speaker: input.speaker, at: input.at });
}
function fixtures() {
    const all = [], add = (group, value, expected) => all.push({ group, value, expected });
    const answerSeeds = require('./diary_answer_fixtures').fixtures();
    for (const f of answerSeeds) {
        const u = f.value.result.understandings[0];
        const direct = f.value.result.understandings.length === 1 && u.kind === 'question' && u.complete
            && base.forms.some(([slot]) => slot === u.questionSlot) && !u.contextReference && !u.answerReference;
        for (const speech of ['gesture', 'short'])
            add('answer-seeds:' + f.group + ':' + speech, replay(f.value, speech), Boolean(direct && speech === 'gesture'));
    }
    for (const f of base.fixtures()) {
        // Original cd fixtures establish the incomplete/complete boundary independently.
        const frame = f.value.result.interpretations[0], u = f.value.result.understandings[0];
        const direct = !f.expected && f.value.result.understandings.length === 1 && u.kind === 'question'
            && u.complete && base.forms.some(([slot]) => slot === frame.slot) && u.subject === 'self';
        add('cd-boundaries:' + f.group, replay(f.value, 'gesture'), Boolean(direct));
    }
    for (const name of ['name_response', 'name_question', 'incomplete_name_question', 'unresolved_name_target',
        'sour_question', 'incomplete_sour_question', 'incomplete_confirmation_question']) {
        for (const f of require('./diary_' + name + '_fixtures').fixtures().filter(f => f.expected))
            add('other-owner:' + name, replay(f.value, 'gesture'), false);
    }
    return all;
}
module.exports = { fixtures, replay, setup: base.setup, hear: base.hear, forms: base.forms, core: base.core,
    catalog: base.catalog, worldApi };
