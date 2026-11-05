'use strict';
// Disposable current-code evidence, never historical source supply or player data.
const { fixtures, setup, hearValue, core, raw } = require('./diary_rest_value_report_fixtures');
function examples() {
    return ['short', 'gesture'].map(speech => hearValue(setup({ speech })));
}
function addedExamples() {
    return fixtures().filter(({ group, value }) => group === 'no-target-required'
        || group === 'existing-japanese-forms' && value.result.input.raw !== raw).map(({ value }) => value);
}
function excludedExamples() {
    const all = fixtures().filter(({ group }) => group !== 'eight-settings'
        && group !== 'seven-input-locales-no-new-grammar'
        && group !== 'existing-japanese-forms'
        && group !== 'no-target-required').map(({ value }) => value);
    for (const speech of ['short', 'gesture']) {
        for (const verb of ['\u4f11\u3080', '\u3084\u3059\u3080']) for (const noun of ['\u3053\u3068', '\u306e'])
            for (const suffix of ['', '\u3060\u3088', '\u3060\u306d', '\u3060', '\u3067\u3059']) {
                const text = `${verb}${noun}\u306f\u5927\u4e8b${suffix}`;
                if (text !== raw) {
                    const v = setup({ speech }); core.perceive(v.state, { scene: 'shore', attention: [] });
                    all.push(hearValue(v, text));
                    for (const wrapped of [` ${text} `, `${text}\u3002`, `${text}\n`])
                        all.push(hearValue(setup({ speech }), wrapped));
                }
            }
        for (const text of [` ${raw}`, `${raw} `, ` ${raw} `, `${raw}\u3002`, `${raw}\uff01`, `${raw}\n`, ` ${raw}\u3002 `])
            all.push(hearValue(setup({ speech }), text));
        for (const locale of ['en', 'zh-CN', 'ru', 'es-ES', 'pt-BR', 'de'])
            all.push(hearValue(setup({ speech }), raw, { locale }));
        for (const missing of ['rest', 'report', 'both']) {
            const v = setup({ speech });
            if (missing !== 'report') v.state.knowledge.meanings = v.state.knowledge.meanings.filter(e => e.id !== 'rest');
            if (missing !== 'rest') v.state.knowledge.relations = v.state.knowledge.relations.filter(e => e.id !== 'report');
            all.push(hearValue(v));
        }
        for (const mode of ['observe', 'eat', 'rest', 'work', 'walk']) {
            const v = setup({ speech }); v.world.mode = mode; all.push(hearValue(v));
        }
        for (const fatigue of [0, .2, .4, .8, 1]) {
            const v = setup({ speech }); v.world.fatigue = fatigue; all.push(hearValue(v));
        }
        const v = setup({ speech }); core.perceive(v.state, { scene: 'clearing', attention: [] });
        all.push(hearValue(v));
        const attention = setup({ speech }); attention.world.attention = 'berry:1'; all.push(hearValue(attention));
        const hunger = setup({ speech }); hunger.world.hunger = .4; all.push(hearValue(hunger));
    }
    const scoped = fixtures().find(({ group }) => group === 'real-experienced-report-scope-not-transferred').value;
    for (const value of addedExamples()) {
        const { raw: text } = value.result.input, speech = value.receipt.beforeState.settings.speech;
        const fresh = () => {
            const v = setup({ speech });
            core.perceive(v.state, value.receipt.inputContext);
            return v;
        };
        for (const mode of ['observe', 'eat', 'rest', 'work', 'walk']) {
            const v = fresh(); v.world.mode = mode; all.push(hearValue(v, text));
        }
        for (const fatigue of [0, .2, .4, .8, 1]) {
            const v = fresh(); v.world.fatigue = fatigue; all.push(hearValue(v, text));
        }
        for (const missing of ['rest', 'report', 'both']) {
            const v = fresh();
            if (missing !== 'report') v.state.knowledge.meanings = v.state.knowledge.meanings.filter(e => e.id !== 'rest');
            if (missing !== 'rest') v.state.knowledge.relations = v.state.knowledge.relations.filter(e => e.id !== 'report');
            all.push(hearValue(v, text));
        }
        const scope = fresh(); scope.state = JSON.parse(JSON.stringify(scoped.receipt.beforeState));
        scope.state.settings.speech = speech; core.perceive(scope.state, value.receipt.inputContext);
        all.push(hearValue(scope, text));
        all.push(hearValue(fresh(), text, { speaker: 'visitor' }));
        for (const locale of ['en', 'zh-CN', 'ru', 'es-ES', 'pt-BR', 'de'])
            all.push(hearValue(fresh(), text, { locale }));
        const attention = fresh(); attention.world.attention = 'berry:1'; all.push(hearValue(attention, text));
        const hunger = fresh(); hunger.world.hunger = .4; all.push(hearValue(hunger, text));
    }
    return all;
}
module.exports = { examples, addedExamples, excludedExamples };
