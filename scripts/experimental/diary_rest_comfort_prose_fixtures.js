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
    for (const text of [` ${raw} `, `${raw}\u3002`, `${raw}\uff01`])
        values.push(hearComfort(setup(), text));
    for (const mode of ['observe', 'eat', 'rest', 'work', 'walk']) for (const speech of ['short', 'gesture']) {
        const v = setup({ speech }); v.world.mode = mode;
        values.push(hearComfort(v));
    }
    for (const fatigue of [0, .2, .4, .8, 1]) {
        const v = setup(); v.world.fatigue = fatigue; values.push(hearComfort(v));
    }
    return values;
}
function incompleteExamples() {
    return ['short', 'gesture'].map(speech => {
        const v = setup({ speech });
        v.state.knowledge.meanings = v.state.knowledge.meanings.filter(e => !['comfortable', 'rest'].includes(e.id));
        v.state.knowledge.relations = v.state.knowledge.relations.filter(e => !['report', 'condition'].includes(e.id));
        return hearComfort(v);
    });
}
function partialExamples() {
    const values = [];
    for (const missing of ['comfortable', 'rest']) for (const speech of ['short', 'gesture']) {
        const v = setup({ speech });
        v.state.knowledge.meanings = v.state.knowledge.meanings.filter(e => e.id !== missing);
        values.push(hearComfort(v));
    }
    return values;
}
function partialExcludedExamples() {
    const values = [];
    for (const prior of partialExamples()) {
        for (const variation of examples().slice(2)) {
            const v = setup({ speech: prior.receipt.beforeState.settings.speech });
            v.state.knowledge = prior.receipt.inputKnowledge;
            v.world.mode = variation.receipt.beforeWorld.mode; v.world.fatigue = variation.receipt.beforeWorld.fatigue;
            core.perceive(v.state, variation.receipt.inputContext);
            values.push(hearComfort(v, variation.result.input.raw));
        }
    }
    return values;
}
function relationExamples() {
    const values = [];
    for (const missing of ['report', 'condition']) for (const speech of ['short', 'gesture']) {
        const v = setup({ speech });
        v.state.knowledge.relations = v.state.knowledge.relations.filter(e => e.id !== missing);
        values.push(hearComfort(v));
    }
    return values;
}
function relationExcludedExamples() {
    const values = [];
    for (const prior of relationExamples()) {
        for (const variation of examples().slice(2)) {
            const v = setup({ speech: prior.receipt.beforeState.settings.speech });
            v.state.knowledge = prior.receipt.inputKnowledge;
            v.world.mode = variation.receipt.beforeWorld.mode; v.world.fatigue = variation.receipt.beforeWorld.fatigue;
            core.perceive(v.state, variation.receipt.inputContext);
            values.push(hearComfort(v, variation.result.input.raw));
        }
    }
    return values;
}
function excludedExamples() {
    const values = [], forms = examples().slice(2, 24).filter(v => v.receipt.beforeState.settings.speech === 'short')
        .map(v => v.result.input.raw);
    const punctuation = [` ${raw} `, `${raw}\u3002`, `${raw}\uff01`];
    for (const text of punctuation) {
        values.push(hearComfort(setup({ speech: 'gesture' }), text));
        const shore = setup(); core.perceive(shore.state, { scene: 'shore', attention: [] });
        values.push(hearComfort(shore, text));
    }
    for (const mode of ['observe', 'eat', 'rest', 'work', 'walk']) for (const speech of ['short', 'gesture']) {
        for (const text of [...forms, ...punctuation]) {
            const v = setup({ speech }); v.world.mode = mode;
            values.push(hearComfort(v, text));
        }
        const shore = setup({ speech }); core.perceive(shore.state, { scene: 'shore', attention: [] });
        shore.world.mode = mode; values.push(hearComfort(shore));
    }
    return values;
}
function doubleMissingExamples() {
    const values = [];
    for (const key of ['meanings', 'relations']) for (const speech of ['short', 'gesture']) {
        const v = setup({ speech }), missing = key === 'meanings' ? ['comfortable', 'rest'] : ['report', 'condition'];
        v.state.knowledge[key] = v.state.knowledge[key].filter(e => !missing.includes(e.id));
        values.push(hearComfort(v));
    }
    return values;
}
function doubleMissingExcludedExamples() {
    const values = [];
    for (const prior of doubleMissingExamples()) {
        for (const variation of examples().slice(2)) {
            const v = setup({ speech: prior.receipt.beforeState.settings.speech });
            v.state.knowledge = prior.receipt.inputKnowledge;
            v.world.mode = variation.receipt.beforeWorld.mode; v.world.fatigue = variation.receipt.beforeWorld.fatigue;
            core.perceive(v.state, variation.receipt.inputContext);
            values.push(hearComfort(v, variation.result.input.raw));
        }
    }
    return values;
}
function fatigueExcludedExamples() {
    const values = [];
    for (const fatigue of [0, .2, .4, .8, 1]) {
        const gesture = setup({ speech: 'gesture' }); gesture.world.fatigue = fatigue;
        values.push(hearComfort(gesture));
        // Every previously adopted variation is outside BR's basic/short/idle scope.
        for (const prior of examples().slice(2, 39)) {
            const v = setup({ speech: prior.receipt.beforeState.settings.speech });
            v.world.fatigue = fatigue; v.world.mode = prior.receipt.beforeWorld.mode;
            core.perceive(v.state, prior.receipt.inputContext);
            values.push(hearComfort(v, prior.result.input.raw));
        }
        for (const prior of incompleteExamples()) {
            const v = setup({ speech: prior.receipt.beforeState.settings.speech });
            v.state.knowledge = prior.receipt.inputKnowledge; v.world.fatigue = fatigue;
            values.push(hearComfort(v));
        }
    }
    return values;
}
function mixedReportExamples() {
    const values = [];
    for (const missing of ['comfortable', 'rest']) for (const speech of ['short', 'gesture']) {
        const v = setup({ speech });
        v.state.knowledge.meanings = v.state.knowledge.meanings.filter(e => e.id !== missing);
        v.state.knowledge.relations = v.state.knowledge.relations.filter(e => e.id !== 'report');
        values.push(hearComfort(v));
    }
    return values;
}
function mixedReportExcludedExamples() {
    const values = [];
    for (const prior of mixedReportExamples()) {
        for (const variation of examples().slice(2)) {
            const v = setup({ speech: prior.receipt.beforeState.settings.speech });
            v.state.knowledge = prior.receipt.inputKnowledge;
            v.world.mode = variation.receipt.beforeWorld.mode; v.world.fatigue = variation.receipt.beforeWorld.fatigue;
            core.perceive(v.state, variation.receipt.inputContext);
            values.push(hearComfort(v, variation.result.input.raw));
        }
    }
    // Recorded experienced scopes are distinct from an absent relation record.
    for (const prior of require('./diary_rest_comfort_report_fixtures').fixtures()
        .filter(f => f.group.includes('scope-not-transferred'))) {
        for (const missing of ['comfortable', 'rest']) {
            const v = setup({ speech: prior.value.receipt.beforeState.settings.speech });
            v.state.knowledge = JSON.parse(JSON.stringify(prior.value.receipt.inputKnowledge));
            v.state.knowledge.meanings = v.state.knowledge.meanings.filter(e => e.id !== missing);
            if (prior.group.includes('condition'))
                v.state.knowledge.relations = v.state.knowledge.relations.filter(e => e.id !== 'report');
            values.push(hearComfort(v));
        }
    }
    return values;
}
function mixedConditionExamples() {
    const values = [];
    for (const missing of ['comfortable', 'rest']) for (const speech of ['short', 'gesture']) {
        const v = setup({ speech });
        v.state.knowledge.meanings = v.state.knowledge.meanings.filter(e => e.id !== missing);
        v.state.knowledge.relations = v.state.knowledge.relations.filter(e => e.id !== 'condition');
        values.push(hearComfort(v));
    }
    return values;
}
function mixedConditionExcludedExamples() {
    const values = [];
    for (const prior of mixedConditionExamples()) {
        for (const variation of examples().slice(2)) {
            const v = setup({ speech: prior.receipt.beforeState.settings.speech });
            v.state.knowledge = prior.receipt.inputKnowledge;
            v.world.mode = variation.receipt.beforeWorld.mode; v.world.fatigue = variation.receipt.beforeWorld.fatigue;
            core.perceive(v.state, variation.receipt.inputContext);
            values.push(hearComfort(v, variation.result.input.raw));
        }
    }
    for (const prior of require('./diary_rest_comfort_report_fixtures').fixtures()
        .filter(f => f.group.includes('scope-not-transferred'))) {
        for (const missing of ['comfortable', 'rest']) {
            const v = setup({ speech: prior.value.receipt.beforeState.settings.speech });
            v.state.knowledge = JSON.parse(JSON.stringify(prior.value.receipt.inputKnowledge));
            v.state.knowledge.meanings = v.state.knowledge.meanings.filter(e => e.id !== missing);
            if (prior.group.includes('report'))
                v.state.knowledge.relations = v.state.knowledge.relations.filter(e => e.id !== 'condition');
            values.push(hearComfort(v));
        }
    }
    return values;
}
function threeMissingExamples() {
    const values = [];
    for (const mask of [7, 11, 13, 14]) for (const speech of ['short', 'gesture']) {
        const v = setup({ speech });
        for (const [bit, id] of ['comfortable', 'rest', 'report', 'condition'].entries()) if (mask & (1 << bit)) {
            const key = bit < 2 ? 'meanings' : 'relations';
            v.state.knowledge[key] = v.state.knowledge[key].filter(e => e.id !== id);
        }
        values.push(hearComfort(v));
    }
    return values;
}
function threeMissingExcludedExamples() {
    const values = [], scopes = require('./diary_rest_comfort_report_fixtures').fixtures()
        .filter(f => f.group.includes('scope-not-transferred'));
    for (const prior of threeMissingExamples()) {
        for (const variation of examples().slice(2)) {
            const v = setup({ speech: prior.receipt.beforeState.settings.speech });
            v.state.knowledge = prior.receipt.inputKnowledge;
            v.world.mode = variation.receipt.beforeWorld.mode; v.world.fatigue = variation.receipt.beforeWorld.fatigue;
            core.perceive(v.state, variation.receipt.inputContext);
            values.push(hearComfort(v, variation.result.input.raw));
        }
        for (const missing of prior.result.understandings[0].unresolved.filter(e => e.type === 'relation')) {
            const scope = scopes.find(f => f.group.includes(missing.id)
                && f.value.receipt.beforeState.settings.speech === prior.receipt.beforeState.settings.speech);
            const v = setup({ speech: prior.receipt.beforeState.settings.speech });
            v.state.knowledge = JSON.parse(JSON.stringify(prior.receipt.inputKnowledge));
            const learned = scope.value.receipt.inputKnowledge.relations.find(e => e.id === missing.id);
            v.state.knowledge.relations.push(JSON.parse(JSON.stringify(learned)));
            values.push(hearComfort(v));
        }
    }
    return values;
}
module.exports = { examples, incompleteExamples, partialExamples, partialExcludedExamples, relationExamples,
    relationExcludedExamples, doubleMissingExamples, doubleMissingExcludedExamples, mixedReportExamples,
    mixedReportExcludedExamples, mixedConditionExamples, mixedConditionExcludedExamples, threeMissingExamples,
    threeMissingExcludedExamples, excludedExamples, fatigueExcludedExamples };
