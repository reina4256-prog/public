'use strict';
// Fresh, disposable verification examples, never retrieved historical originals.
const { setup, hear, core } = require('./diary_greeting_fixtures');
function examples() {
    const result = [];
    for (const speech of ['short', 'gesture']) {
        for (const raw of ['おはよう', 'おはよ', 'おはよー', 'おはよ～', 'おはよ〜',
            'おはようございます', 'おはよう。', 'おはよう！', ' おはよう '])
            result.push(hear(setup({ speech }), raw));
        for (const mode of ['idle', 'rest']) {
            const v = setup({ speech });
            core.perceive(v.state, { scene: 'shore', attention: [] });
            v.world.mode = mode;
            result.push(hear(v));
        }
    }
    return result;
}
module.exports = { examples };
