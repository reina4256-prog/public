'use strict';
// Fresh disposable examples, never historical source supply or player data.
const { setup, hearComfort, raw } = require('./diary_rest_comfort_report_fixtures');
function examples() {
    return ['short', 'gesture'].map(speech => hearComfort(setup({ speech }), raw));
}
module.exports = { examples };
