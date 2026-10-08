'use strict';
// All receive/respond/tick/onArrival calls use disposable Node memory.
const assert = require('node:assert/strict');
const core = require('../../experimental_word_learning_core');
const worldApi = require('../../experimental_word_learning_world');
const catalog = require('../../experimental_word_learning_catalog.json');
const existing = require('./diary_negation_fixtures');
const copy = value => JSON.parse(JSON.stringify(value));
const locales = Object.keys(catalog.conditionTeaching);
const wordIndex = { ja: 0, en: 2, 'zh-CN': 3, ru: 4, 'es-ES': 5, 'pt-BR': 5, de: 6 };
const demo = (status, locale = 'ja') => {
    const item = catalog.conditionTeaching[locale]; return `${item[status]}「${item.utterance}」`;
};
function start(value, fatigue = .8) {
    existing.start(value, 'rest');
    value.world.fatigue = fatigue; value.world.activityBefore.fatigue = fatigue;
}
function hear(value, raw, locale = 'ja', speaker = 'player') {
    const materials = existing.hear(value, raw, locale, speaker);
    Object.assign(materials.context, { fatigue: value.world.fatigue, activityBefore: copy(value.world.activityBefore) });
    return materials;
}
function prepare(value, locale) {
    for (const meaning of ['rest', 'tired']) if (!value.state.knowledge.meanings.some(m => m.id === meaning)) {
        start(value);
        const word = catalog.meanings[meaning][wordIndex[locale]];
        hear(value, meaning === 'tired' ? `「${word}」` : word, locale); existing.finish(value);
        assert.ok(value.state.knowledge.meanings.some(m => m.id === meaning));
    }
    if (!value.state.settings.foundation) for (const kind of ['request', 'invitation']) {
        start(value); const item = catalog.proposalTeaching[locale][kind];
        hear(value, `${item.marker}「${item.utterance}」`, locale); existing.finish(value);
    }
    assert.ok(value.state.knowledge.relations.some(r => r.id === 'request'));
}
function fixtures() {
    const result = [], add = (group, values, expected) => result.push({ group, values, expected });
    for (const locale of locales) for (const foundation of [false, true]) for (const life of [false, true])
        for (const speech of ['short', 'gesture']) for (const status of ['met', 'unmet']) {
            const value = existing.setup({ foundation, life, speech }); start(value, status === 'met' ? .8 : .2);
            add('initial', [hear(value, demo(status, locale), locale)], [false]);
            value.state.knowledge.relations = value.state.knowledge.relations.filter(r => r.id !== 'condition');
            add('initial-request', [hear(value, demo(status, locale), locale)], [foundation && life]);
        }
    let scoped;
    for (const locale of locales) for (const foundation of [false, true]) for (const life of [false, true])
        for (const speech of ['short', 'gesture']) for (const order of [['met', 'unmet'], ['unmet', 'met']]) {
            const value = existing.setup({ foundation, life, speech }); prepare(value, locale);
            const values = [], unknown = !foundation;
            for (const status of order) {
                start(value, status === 'met' ? .8 : .2);
                const first = hear(value, demo(status, locale), locale), repeated = hear(value, demo(status, locale), locale);
                if (unknown) {
                    assert.equal(value.world.relationLabels.filter(l => l.relation === 'condition').length, 1);
                    assert.equal(repeated.result.relationLearning.adopted.inputId, first.result.input.id);
                    if (locale === 'ja' && speech === 'short' && status === 'met') scoped = copy(first);
                }
                values.push(first, repeated); existing.finish(value);
            }
            assert.ok(value.state.knowledge.relations.some(r => r.id === 'condition'));
            add('prerequisites-and-contrasts', values, Array(4).fill(unknown));
            for (const status of order) {
                start(value, status === 'met' ? .8 : .2);
                add('known-excluded', [hear(value, demo(status, locale), locale)], [false]);
            }
            add('ordinary-excluded', [hear(value, catalog.conditionTeaching[locale].utterance, locale)], [false]);
            if (unknown) {
                const other = locale === 'ja' ? 'en' : 'ja';
                add('other-locale', [hear(value, demo('unmet', other), other)], [false]);
                add('other-speaker', [hear(value, demo('unmet', locale), locale, 'visitor')], [false]);
            }
        }
    for (const fatigue of [.55, .25, .550001, .249999, .549999, .250001, .4]) for (const status of ['met', 'unmet']) {
        const value = existing.setup(); prepare(value, 'ja'); start(value, fatigue);
        add('sensory-boundaries', [hear(value, demo(status))], [status === (fatigue >= .55 ? 'met' : fatigue <= .25 ? 'unmet' : 'unknown')]);
    }
    for (const status of ['met', 'unmet']) {
        const value = existing.setup(); prepare(value, 'ja'); start(value, status === 'met' ? .8 : .2);
        const first = hear(value, demo(status));
        if (status === 'met') worldApi.approach(value.world, 'path'); else existing.finish(value);
        value.state.knowledge.meanings = []; value.state.knowledge.relations = [];
        add('interrupted-or-completed', [first], [true]);
    }
    // One rest retains its first teaching even if sensation changes. The new
    // accepted input is a separate diary candidate, not a second learned side.
    const changing = existing.setup(); prepare(changing, 'ja'); start(changing);
    const first = hear(changing, demo('met')); changing.world.fatigue = .2; changing.world.elapsed += .1;
    const second = hear(changing, demo('unmet'));
    assert.equal(second.result.relationLearning.adopted.inputId, first.result.input.id);
    add('same-rest-first-teaching', [first, second], [true, true]);
    existing.finish(changing);
    assert.equal(changing.state.knowledge.relations.some(r => r.id === 'condition'), false);
    for (const mode of ['eat', 'walk', 'idle']) {
        const value = existing.setup(); prepare(value, 'ja'); start(value); value.world.mode = mode;
        add('outside-rest', [hear(value, demo('met'))], [false]);
    }
    for (const attention of [[], [{ id: 'shade', meaning: 'rest' }, { id: 'path', meaning: 'walk' }]]) {
        const value = existing.setup(); prepare(value, 'ja'); start(value);
        core.perceive(value.state, { scene: 'clearing', attention });
        add('absent-or-ambiguous-attention', [hear(value, demo('met'))], [false]);
    }
    const mutators = [
        v => { v.result.interpretations = []; }, v => { v.result.understandings = undefined; },
        v => { v.result.relationLearning = undefined; }, v => { v.context = undefined; },
        v => { v.beforeKnowledge.meanings = []; }, v => { v.beforeKnowledge.relations = []; },
        v => { v.beforeKnowledge.meanings = v.beforeKnowledge.meanings.filter(m => m.id !== 'tired'); },
        ...['scene', 'mode', 'target'].map(key => v => { v.context[key] = 'other'; }),
        ...['activityStart', 'elapsed', 'fatigue'].map(key => v => { v.context[key] += .01; }),
        v => { v.context.activityBefore.fatigue = .9; }, v => { v.context.attention = []; },
        ...['id', 'raw', 'speaker', 'locale', 'scene'].map(key => v => { v.result.input[key] = 'other'; }),
        v => { v.result.input.at++; }, v => { v.result.interpretations.push(copy(v.result.interpretations[0])); },
        v => { v.result.interpretations[0].demonstratedStatus = 'unmet'; },
        v => { v.result.interpretations[0].roles.actualParticipation = true; },
        ...['kind', 'conditionStatus', 'subject', 'eventTime'].map(key => v => { v.result.understandings[0][key] = 'other'; }),
        v => { v.result.understandings[0].complete = true; },
        v => { v.result.understandings[0].roles = copy(v.result.interpretations[0].roles); },
        v => { v.result.understandings[0].relationReferences = []; },
        v => { v.result.conditionJudgment = { status: 'met' }; },
        ...['basis', 'conditionBasis', 'proposalBasis'].map(key => v => { v.result.relationLearning.candidates[0][key] = {}; }),
        ...['inputId', 'raw', 'locale', 'speaker', 'scene', 'target', 'application', 'duration', 'conditionSubject', 'conditionMeaning']
            .map(key => v => { v.result.relationLearning.candidates[0][key] = 'other'; }),
        ...['source', 'subject', 'activity', 'target', 'status'].map(key => v => { v.result.relationLearning.candidates[0].observation[key] = 'other'; }),
        ...['start', 'at', 'before', 'fatigue'].map(key => v => { v.result.relationLearning.candidates[0].observation[key] += .01; }),
        ...['kind', 'meaning', 'form', 'locale', 'speaker'].map(key => v => { v.beforeKnowledge.relations.find(r => r.id === 'request').scope[key] = 'other'; }),
        ...['inputId', 'raw', 'locale', 'speaker', 'scene', 'target', 'application', 'duration', 'conditionSubject', 'conditionMeaning']
            .map(key => v => { v.result.relationLearning.adopted[key] = 'other'; }),
        v => { v.result.relationLearning.adopted.understanding.conditionStatus = 'met'; },
        v => { v.result.relationLearning.adopted.observation.status = 'unmet'; },
        v => { v.result.relationLearning.adopted.roles.actualParticipation = true; },
        ...['basis', 'conditionBasis', 'proposalBasis'].map(key => v => { v.result.relationLearning.adopted[key] = {}; }),
        v => { v.result.relationLearning.adopted.at++; }, v => { v.result.relationLearning.adopted.heardAt = null; },
        v => { v.result.relationLearning.updated = ['condition']; },
        v => { v.result.relationLearning.relationAcquired = true; },
        v => { v.result.relationLearning.candidates.push(copy(v.result.relationLearning.candidates[0])); }
    ];
    for (const mutate of mutators) { const invalid = copy(scoped); mutate(invalid); add('tampered', [invalid], [false]); }
    for (const raw of [catalog.conditionTeaching.ja.utterance, catalog.proposalTeaching.ja.request.utterance,
        catalog.timeTeaching.ja.now.utterance, catalog.reportTeaching.ja.self.utterance,
        catalog.sequenceTeaching.ja.utterance, demo('met') + '. unknown']) {
        const value = existing.setup(); prepare(value, 'ja'); start(value);
        add('other-entry', [hear(value, raw)], [false]);
    }
    return result;
}
module.exports = { fixtures, prepare, start, hear, demo };
