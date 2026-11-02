'use strict';
// Fresh disposable evidence, never supplied historical originals.
const { setup, hear } = require('./diary_greeting_material_fixtures');
function examples() {
    return ['short', 'gesture'].flatMap(speech => [false, true].map(life =>
        hear(setup({ speech, life, foundation: false }), 'おはよう')));
}
module.exports = { examples };
