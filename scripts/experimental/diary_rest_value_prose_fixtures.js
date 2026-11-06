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
function punctuationExamples() {
    return fixtures().filter(({ group }) => group === 'single-trim-and-terminal-punctuation').map(({ value }) => value);
}
function activityFatigueExamples() {
    return fixtures().filter(({ group }) => group === 'activity-does-not-prove-importance'
        || group === 'fatigue-does-not-resolve-importance-or-cause').map(({ value }) => value);
}
function incompleteExamples() {
    return require('./diary_incomplete_rest_value_report_fixtures').fixtures()
        .filter(({ group, value }) => ['existing-forms-knowledge-matrix', 'aw:eight-settings'].includes(group)
            && value.result.input.raw === raw
            && value.result.understandings[0].unresolved.filter(item => item.type !== 'detail').length === 1)
        .map(({ value }) => value);
}
function bothMissingAndScopedExamples() {
    return require('./diary_incomplete_rest_value_report_fixtures').fixtures()
        .filter(({ group, value }) => group === 'aw:real-experienced-report-scope-not-transferred'
            || ['existing-forms-knowledge-matrix', 'aw:eight-settings'].includes(group)
                && value.result.input.raw === raw
                && value.result.understandings[0].unresolved.filter(item => item.type !== 'detail').length === 2)
        .map(({ value }) => value);
}
function alternateIncompleteExamples() {
    return require('./diary_incomplete_rest_value_report_fixtures').fixtures()
        .filter(({ group, value }) => group === 'existing-forms-knowledge-matrix'
            && value.result.input.raw !== raw
            && value.result.understandings[0].unresolved.some(item => ['meaning', 'relation'].includes(item.type)))
        .map(({ value }) => value);
}
function decoratedIncompleteExamples() {
    return require('./diary_incomplete_rest_value_report_fixtures').fixtures()
        .filter(({ group }) => group === 'missing-knowledge-single-punctuation')
        .map(({ value }) => value);
}
function activityIncompleteExamples() {
    return require('./diary_incomplete_rest_value_report_fixtures').fixtures()
        .filter(({ group }) => ['missing-knowledge-activity-empty-attention',
            'missing-knowledge-fatigue-no-importance-inference'].includes(group))
        .map(({ value }) => value);
}
function activityIncompleteExcludedExamples() {
    const all = [];
    const scoped = bothMissingAndScopedExamples().find(v =>
        v.receipt.inputKnowledge.relations.some(entry => entry.id === 'report'));
    const forms = [...new Set(addedExamples().map(v => v.result.input.raw))].filter(text => text !== raw);
    for (const value of activityIncompleteExamples()) {
        const shore = value.receipt.inputContext.scene === 'shore';
        const fresh = () => ({ state: JSON.parse(JSON.stringify(value.receipt.beforeState)),
            world: JSON.parse(JSON.stringify(value.receipt.beforeWorld)) });
        for (const text of [...forms, ` ${raw} `, `${raw}\u3002`, `${raw}\uff01`, `${raw}\n`])
            all.push(hearValue(fresh(), text));
        for (const context of [
            { scene: 'clearing', attention: [] },
            shore ? { scene: 'clearing', attention: [{ id: 'berry:1', meaning: 'berry' }] }
                : { scene: 'shore', attention: [] },
            { scene: 'shore', attention: [{ id: 'berry:1', meaning: 'berry' }] }
        ]) { const v = fresh(); core.perceive(v.state, context); all.push(hearValue(v)); }
        for (const edit of [
            v => { v.world.attention = 'berry:1'; }, v => { v.world.hunger = .4; },
            ...(shore ? [0, .2, .4, .8, 1] : [.1, .3, .6]).map(fatigue => v => { v.world.fatigue = fatigue; }),
            ...(shore ? ['idle', 'move', 'unknown'] : ['observe', 'eat', 'rest', 'work', 'walk'])
                .map(mode => v => { v.world.mode = mode; })
        ]) { const v = fresh(); edit(v); all.push(hearValue(v)); }
        all.push(hearValue(fresh(), raw, { speaker: 'visitor' }));
        for (const locale of ['en', 'zh-CN', 'ru', 'es-ES', 'pt-BR', 'de'])
            all.push(hearValue(fresh(), raw, { locale }));
        const v = fresh(); v.state = JSON.parse(JSON.stringify(scoped.receipt.beforeState));
        v.state.settings.speech = value.receipt.beforeState.settings.speech;
        core.perceive(v.state, value.receipt.inputContext); all.push(hearValue(v));
    }
    return all;
}
function decoratedIncompleteExcludedExamples() {
    const all = [];
    const scoped = bothMissingAndScopedExamples().find(v =>
        v.receipt.inputKnowledge.relations.some(entry => entry.id === 'report'));
    for (const value of decoratedIncompleteExamples()) {
        const text = value.result.input.raw;
        const fresh = () => ({ state: JSON.parse(JSON.stringify(value.receipt.beforeState)),
            world: JSON.parse(JSON.stringify(value.receipt.beforeWorld)) });
        for (const outside of [` ${raw}`, `${raw} `, `  ${raw}  `, `\u3000${raw}\u3000`,
            `\t${raw}\t`, `${raw}!`, `${raw}\u3002\u3002`, `${raw}\uff01\uff01`,
            ` ${raw}\u3002 `, ` ${raw}\uff01 `, `${text}\n`])
            all.push(hearValue(fresh(), outside));
        for (const edit of [
            v => { core.perceive(v.state, { scene: 'shore', attention: [] }); },
            v => { core.perceive(v.state, { scene: 'clearing', attention: [] }); },
            v => { v.world.attention = 'berry:1'; }, v => { v.world.hunger = .4; },
            ...['observe', 'eat', 'rest', 'work', 'walk'].map(mode => v => { v.world.mode = mode; }),
            ...[0, .2, .4, .8, 1].map(fatigue => v => { v.world.fatigue = fatigue; })
        ]) { const v = fresh(); edit(v); all.push(hearValue(v, text)); }
        all.push(hearValue(fresh(), text, { speaker: 'visitor' }));
        for (const locale of ['en', 'zh-CN', 'ru', 'es-ES', 'pt-BR', 'de'])
            all.push(hearValue(fresh(), text, { locale }));
        const v = { state: JSON.parse(JSON.stringify(scoped.receipt.beforeState)),
            world: JSON.parse(JSON.stringify(scoped.receipt.beforeWorld)) };
        v.state.settings.speech = value.receipt.beforeState.settings.speech;
        all.push(hearValue(v, text));
    }
    return all;
}
function alternateIncompleteExcludedExamples() {
    const all = [];
    const scoped = bothMissingAndScopedExamples().find(v =>
        v.receipt.inputKnowledge.relations.some(entry => entry.id === 'report'));
    for (const value of alternateIncompleteExamples()) {
        const text = value.result.input.raw;
        const fresh = () => ({ state: JSON.parse(JSON.stringify(value.receipt.beforeState)),
            world: JSON.parse(JSON.stringify(value.receipt.beforeWorld)) });
        for (const wrapped of [` ${text} `, `${text}\u3002`, `${text}\uff01`, `${text}\n`])
            all.push(hearValue(fresh(), wrapped));
        for (const edit of [
            v => { core.perceive(v.state, { scene: 'shore', attention: [] }); },
            v => { core.perceive(v.state, { scene: 'clearing', attention: [] }); },
            v => { v.world.attention = 'berry:1'; }, v => { v.world.hunger = .4; },
            ...['observe', 'eat', 'rest', 'work', 'walk'].map(mode => v => { v.world.mode = mode; }),
            ...[0, .2, .4, .8, 1].map(fatigue => v => { v.world.fatigue = fatigue; })
        ]) { const v = fresh(); edit(v); all.push(hearValue(v, text)); }
        all.push(hearValue(fresh(), text, { speaker: 'visitor' }));
        for (const locale of ['en', 'zh-CN', 'ru', 'es-ES', 'pt-BR', 'de'])
            all.push(hearValue(fresh(), text, { locale }));
        const v = { state: JSON.parse(JSON.stringify(scoped.receipt.beforeState)),
            world: JSON.parse(JSON.stringify(scoped.receipt.beforeWorld)) };
        v.state.settings.speech = value.receipt.beforeState.settings.speech;
        all.push(hearValue(v, text));
    }
    return all;
}
function scopedExcludedExamples() {
    const all = [];
    for (const value of bothMissingAndScopedExamples().filter(v =>
        v.receipt.inputKnowledge.relations.some(entry => entry.id === 'report'))) {
        const fresh = () => ({ state: JSON.parse(JSON.stringify(value.receipt.beforeState)),
            world: JSON.parse(JSON.stringify(value.receipt.beforeWorld)) });
        for (const text of [` ${raw} `, `${raw}\u3002`, `${raw}\uff01`, raw.replace('\u4f11\u3080', '\u3084\u3059\u3080')])
            all.push(hearValue(fresh(), text));
        for (const edit of [
            v => { v.state.knowledge.meanings = v.state.knowledge.meanings.filter(e => e.id !== 'rest'); },
            v => { v.state.knowledge.relations = []; },
            v => { core.perceive(v.state, { scene: 'shore', attention: [] }); },
            v => { core.perceive(v.state, { scene: 'clearing', attention: [{ id: 'berry:1', meaning: 'berry' }] }); },
            v => { v.world.fatigue = .15; }, v => { v.world.hunger = .35; },
            v => { v.world.mode = 'rest'; }, v => { v.world.attention = 'shade'; },
            v => { v.state.knowledge.relations[0].evidence = []; },
            v => { delete v.state.knowledge.relations[1].scope.form; },
            v => { v.state.knowledge.relations[0].scope.roles.contentSubject = 'invented'; }
        ]) { const v = fresh(); edit(v); all.push(hearValue(v)); }
        all.push(hearValue(fresh(), raw, { speaker: 'visitor' }));
        for (const locale of ['en', 'zh-CN', 'ru', 'es-ES', 'pt-BR', 'de'])
            all.push(hearValue(fresh(), raw, { locale }));
    }
    return all;
}
function excludedExamples() {
    const all = fixtures().filter(({ group }) => group !== 'eight-settings'
        && group !== 'seven-input-locales-no-new-grammar'
        && group !== 'existing-japanese-forms'
        && group !== 'no-target-required'
        && group !== 'single-trim-and-terminal-punctuation'
        && group !== 'activity-does-not-prove-importance'
        && group !== 'fatigue-does-not-resolve-importance-or-cause').map(({ value }) => value);
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
        for (const text of [` ${raw}`, `${raw} `, `${raw}\n`, ` ${raw}\u3002 `,
            `  ${raw}  `, `\u3000${raw}\u3000`, `\t${raw}\t`, `${raw}!`, `${raw}\u3002\u3002`, `${raw}\uff01\uff01`, `${raw}\u3002\n`])
            all.push(hearValue(setup({ speech }), text));
        for (const text of [` ${raw} `, `${raw}\u3002`, `${raw}\uff01`]) {
            if (speech === 'gesture') all.push(hearValue(setup({ speech }), text));
            const shore = setup({ speech }); core.perceive(shore.state, { scene: 'shore', attention: [] });
            all.push(hearValue(shore, text));
            const noAttention = setup({ speech }); core.perceive(noAttention.state, { scene: 'clearing', attention: [] });
            all.push(hearValue(noAttention, text));
        }
        for (const locale of ['en', 'zh-CN', 'ru', 'es-ES', 'pt-BR', 'de'])
            all.push(hearValue(setup({ speech }), raw, { locale }));
        for (const missing of ['rest', 'report', 'both']) {
            const v = setup({ speech });
            if (missing !== 'report') v.state.knowledge.meanings = v.state.knowledge.meanings.filter(e => e.id !== 'rest');
            if (missing !== 'rest') v.state.knowledge.relations = v.state.knowledge.relations.filter(e => e.id !== 'report');
            all.push(hearValue(v));
        }
        for (const fatigue of [0, .2, .4, .8, 1]) {
            if (speech === 'gesture') {
                const v = setup({ speech }); v.world.fatigue = fatigue; all.push(hearValue(v));
            }
            for (const mode of ['observe', 'eat', 'rest', 'work', 'walk']) {
                const v = setup({ speech }); Object.assign(v.world, { mode, fatigue }); all.push(hearValue(v));
            }
        }
        const v = setup({ speech }); core.perceive(v.state, { scene: 'clearing', attention: [] });
        all.push(hearValue(v));
        const attention = setup({ speech }); attention.world.attention = 'berry:1'; all.push(hearValue(attention));
        const hunger = setup({ speech }); hunger.world.hunger = .4; all.push(hearValue(hunger));
    }
    const scoped = fixtures().find(({ group }) => group === 'real-experienced-report-scope-not-transferred').value;
    for (const value of activityFatigueExamples()) {
        const speech = value.receipt.beforeState.settings.speech;
        const fresh = () => {
            const v = setup({ speech }); v.world = JSON.parse(JSON.stringify(value.receipt.beforeWorld)); return v;
        };
        for (const context of [{ scene: 'shore', attention: [] }, { scene: 'clearing', attention: [] }]) {
            const v = fresh(); core.perceive(v.state, context); all.push(hearValue(v));
        }
        for (const missing of ['rest', 'report', 'both']) {
            const v = fresh();
            if (missing !== 'report') v.state.knowledge.meanings = v.state.knowledge.meanings.filter(e => e.id !== 'rest');
            if (missing !== 'rest') v.state.knowledge.relations = v.state.knowledge.relations.filter(e => e.id !== 'report');
            all.push(hearValue(v));
        }
        const scope = fresh(); scope.state = JSON.parse(JSON.stringify(scoped.receipt.beforeState));
        scope.state.settings.speech = speech; core.perceive(scope.state, value.receipt.inputContext);
        all.push(hearValue(scope));
        all.push(hearValue(fresh(), raw, { speaker: 'visitor' }));
        for (const locale of ['en', 'zh-CN', 'ru', 'es-ES', 'pt-BR', 'de']) all.push(hearValue(fresh(), raw, { locale }));
        const attention = fresh(); attention.world.attention = 'berry:1'; all.push(hearValue(attention));
        const hunger = fresh(); hunger.world.hunger = .4; all.push(hearValue(hunger));
        for (const fatigue of [.1, .3, .6]) {
            const v = fresh(); v.world.fatigue = fatigue; all.push(hearValue(v));
        }
    }
    for (const value of [...addedExamples(), ...punctuationExamples()]) {
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
    const adopted = new Set([...incompleteExamples(), ...bothMissingAndScopedExamples(),
        ...alternateIncompleteExamples(), ...decoratedIncompleteExamples(),
        ...activityIncompleteExamples()].map(value => JSON.stringify(value)));
    all.push(...scopedExcludedExamples());
    all.push(...alternateIncompleteExcludedExamples());
    all.push(...decoratedIncompleteExcludedExamples());
    all.push(...activityIncompleteExcludedExamples());
    all.push(...require('./diary_incomplete_rest_value_report_fixtures').fixtures()
        .filter(({ value }) => value.result.understandings[0]?.unresolved.some(item => ['meaning', 'relation'].includes(item.type)))
        .map(({ value }) => value));
    return all.filter(value => !adopted.has(JSON.stringify(value)));
}
module.exports = { examples, addedExamples, punctuationExamples, activityFatigueExamples, incompleteExamples,
    bothMissingAndScopedExamples, alternateIncompleteExamples, alternateIncompleteExcludedExamples,
    decoratedIncompleteExamples, decoratedIncompleteExcludedExamples,
    activityIncompleteExamples, activityIncompleteExcludedExamples,
    scopedExcludedExamples, excludedExamples };
