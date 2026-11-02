'use strict';
// Fresh disposable examples, never historical source supply or player data.
const { setup, hearComfort, raw, core } = require('./diary_rest_comfort_report_fixtures');
function examples() {
    const values = ['short', 'gesture'].map(speech => hearComfort(setup({ speech }), raw));
    for (const word of ['\u6c17\u6301\u3061\u3044\u3044', '\u304d\u3082\u3061\u3044\u3044', '\u5fc3\u5730\u3088\u3044'])
        for (const suffix of ['', '\u3088\u306d', '\u306d', '\u3088']) {
            const text = `\u6a2a\u306b\u306a\u308b\u3068${word}${suffix}`;
            if (text === raw) continue;
            for (const speech of ['short', 'gesture']) values.push(hearComfort(setup({ speech }), text));
        }
    for (const speech of ['short', 'gesture']) {
        const v = setup({ speech }); core.perceive(v.state, { scene: 'shore', attention: [] });
        v.world.attention = null;
        values.push(hearComfort(v, raw, { at: 987654321 }));
    }
    return values;
}
module.exports = { examples };
