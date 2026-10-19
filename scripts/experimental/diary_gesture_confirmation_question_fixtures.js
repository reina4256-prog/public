'use strict';
// Reuse cc's actual owner inputs, knowledge masks, named targets and scoped learning.
const base = require('./diary_incomplete_confirmation_question_fixtures');
const worldApi = require('../../experimental_word_learning_world');
function hear(v, raw = base.forms.find(([id]) => id === 'preference')[1], options = {}) {
    return base.hear(v, raw, options);
}
function fixtures() {
    return base.fixtures().map(f => ({ group: f.group, value: f.value,
        expected: !f.expected && f.group !== 'outside-confirmation'
            && f.value.result.input.locale === 'ja'
            && f.value.receipt.beforeState.settings.speech === 'gesture' }));
}
module.exports = { fixtures, forms: base.forms, setup: base.setup, hear,
    core: base.core, catalog: base.catalog, worldApi };
