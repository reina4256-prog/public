'use strict';
// Fresh disposable evidence, never supplied historical originals.
const { setup, hear } = require('./diary_greeting_material_fixtures');
const report = require('./diary_negation_fixtures');
const greeting = require('./diary_greeting_fixtures');
function scopedExamples() {
    return ['short', 'gesture'].flatMap(speech => [false, true].map(life => {
        const v = report.setup({ speech, life }); report.learnReport(v, 'ja');
        return greeting.hear(v);
    }));
}
function examples() {
    return ['short', 'gesture'].flatMap(speech => [false, true].map(life =>
        hear(setup({ speech, life, foundation: false }), 'おはよう'))).concat(scopedExamples(), aliasExamples());
}
function aliasExamples() {
    return ['short', 'gesture'].flatMap(speech => [false, true].map(life =>
        hear(setup({ speech, life, foundation: false }), 'おはようございます！')));
}
module.exports = { examples, scopedExamples, aliasExamples };
