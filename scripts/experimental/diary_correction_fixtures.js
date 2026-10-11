'use strict';
// Real gameplay and prerequisite learning run only in disposable Node memory.
const assert = require('node:assert/strict');
const core = require('../../experimental_word_learning_core');
const worldApi = require('../../experimental_word_learning_world');
const catalog = require('../../experimental_word_learning_catalog.json');
const existing = require('./diary_negation_fixtures');
const copy = v => JSON.parse(JSON.stringify(v));
const words = { ja: ['食べる', '休む'], en: ['eat', 'rest'], 'zh-CN': ['吃', '休息'], ru: ['есть', 'отдых'],
    'es-ES': ['comer', 'descansar'], 'pt-BR': ['comer', 'descansar'], de: ['speisen', 'ausruhen'] };
function hear(value, raw, locale = 'ja', speaker = 'player') {
    const { state, world } = value;
    const context = copy({ scene: state.context.scene, attention: state.context.attention,
        mode: world.mode, target: world.attention, activityStart: world.activityStart, elapsed: world.elapsed });
    const beforeKnowledge = copy(state.knowledge), beforeExperiences = copy(state.experiences || []);
    const beforeLessons = copy(state.correctionLessons || []), beforeRecords = copy(state.records);
    const result = core.receive(state, raw, catalog, { locale, speaker, at: 100 + state.serial });
    worldApi.respond(world, result, state, catalog);
    return copy({ result, context, beforeKnowledge, beforeExperiences, beforeLessons, beforeRecords });
}
function prepare(value, locale = 'ja') {
    for (const mode of ['eat', 'rest']) if (!value.state.knowledge.meanings.some(m => m.id === mode)) {
        existing.start(value, mode); hear(value, words[locale][mode === 'eat' ? 0 : 1], locale); existing.finish(value);
    }
    if (!value.state.settings.foundation) for (const mode of ['eat', 'rest']) {
        existing.start(value, mode);
        const form = mode === 'rest' ? catalog.correctionTeaching[locale].exampleSource
            : core.wordFrame(catalog.correctionTeaching[locale].exampleReplacement, locale);
        const raw = typeof form === 'string' ? form : catalog.correctionTeaching[locale].exampleSource
            .replace(core.wordFrame(catalog.correctionTeaching[locale].exampleSource, locale).meaning, form.meaning);
        hear(value, mode === 'eat' ? raw.replace(form.word, 'mogu') : raw, locale); existing.finish(value);
    }
    assert.ok(value.state.knowledge.relations.some(r => r.id === 'naming'));
    core.perceive(value.state, { scene: 'clearing', attention: [] });
    value.world.mode = 'idle'; value.world.attention = null;
}
const demo = (phase, locale = 'ja', raw) => `${catalog.correctionTeaching[locale][phase]}«${raw || catalog.correctionTeaching[locale][phase === 'source' ? 'exampleSource' : 'exampleReplacement']}»`;
function fixtures() {
    const output = [], add = (group, values, expected) => output.push({ group, values, expected });
    let source, replacement;
    for (const locale of Object.keys(catalog.correctionTeaching)) for (const foundation of [false, true])
        for (const life of [false, true]) for (const speech of ['short', 'gesture']) {
            const value = existing.setup({ foundation, life, speech });
            add('unprepared-or-no-original', [hear(value, demo('source', locale), locale)], [false]);
            prepare(value, locale);
            hear(value, catalog.correctionTeaching[locale].exampleSource, locale);
            const first = hear(value, demo('source', locale), locale);
            const repeated = hear(value, demo('source', locale), locale);
            const second = hear(value, demo('replacement', locale), locale);
            add('real-prerequisites-eight-starts-seven-locales', [first, repeated, second], [!foundation, false, !foundation]);
            if (!foundation && !life && speech === 'short' && locale === 'ja') { source = copy(first); replacement = copy(second); }
            add('completed-repetition-and-actual-correction-excluded', [hear(value, demo('replacement', locale), locale),
                hear(value, catalog.correctionTeaching[locale].exampleReplacement, locale)], [false, false]);
        }
    assert.ok(source && replacement);
    for (const locale of Object.keys(catalog.correctionTeaching)) {
        const value = existing.setup({ foundation: true }); prepare(value, locale);
        value.state.knowledge.relations = value.state.knowledge.relations.filter(r => r.id !== 'correction');
        hear(value, catalog.correctionTeaching[locale].exampleSource, locale);
        add('test-only-initial-naming-unknown-correction', [hear(value, demo('source', locale), locale),
            hear(value, demo('replacement', locale), locale)], [true, true]);
    }
    for (const locale of Object.keys(catalog.correctionTeaching)) for (const life of [false, true]) for (const speech of ['short', 'gesture']) {
        const value = existing.setup({ life, speech }); prepare(value, locale);
        const forms = catalog.correctionTeaching[locale], old = core.wordFrame(forms.exampleSource, locale);
        const next = core.wordFrame(forms.exampleReplacement, locale);
        const raw = forms.exampleSource.replace(old.word, 'lulu').replace(old.meaning, next.meaning);
        const corrected = forms.exampleReplacement.replace(next.word, 'lulu').replace(next.meaning, old.meaning);
        hear(value, raw, locale);
        add('reverse-direction-custom-word', [hear(value, demo('source', locale, raw), locale),
            hear(value, demo('replacement', locale, corrected), locale)], [true, true]);
    }
    for (const scenario of ['replacement-first', 'source-mismatch', 'same-meaning', 'other-speaker', 'other-locale',
        'changed-scene', 'changed-target', 'competing-explanation', 'retracted-original', 'missing-input']) {
        const value = existing.setup(); prepare(value); hear(value, catalog.correctionTeaching.ja.exampleSource);
        if (scenario !== 'replacement-first') hear(value, demo('source'));
        if (scenario === 'changed-scene') core.perceive(value.state, { scene: 'elsewhere', attention: [] });
        if (scenario === 'changed-target') core.perceive(value.state, { scene: 'clearing', attention: [{ id: 'shade', meaning: 'rest' }] });
        if (scenario === 'competing-explanation') hear(value, catalog.correctionTeaching.ja.exampleSource.replace('休む', '食べる'));
        if (scenario === 'retracted-original') value.state.knowledge.wordExplanations[0].retractedBy = 'input:999';
        if (scenario === 'missing-input') delete value.state.knowledge.wordExplanations[0].input;
        const locale = scenario === 'other-locale' ? 'en' : 'ja';
        const raw = scenario === 'source-mismatch' ? demo('source', locale).replace('ぽぽ', 'lulu')
            : scenario === 'same-meaning' ? demo('replacement').replace('食べる', '休む') : demo('replacement', locale);
        add('invalid-occasion', [hear(value, raw, locale, scenario === 'other-speaker' ? 'visitor' : 'player')], [false]);
    }
    const returned = existing.setup(); prepare(returned); hear(returned, catalog.correctionTeaching.ja.exampleSource);
    const first = hear(returned, demo('source'));
    core.perceive(returned.state, { scene: 'elsewhere', attention: [] });
    const outside = hear(returned, demo('replacement'));
    core.perceive(returned.state, { scene: 'clearing', attention: [] });
    add('return-to-original-scope', [first, outside, hear(returned, demo('replacement'))], [true, false, true]);
    const growing = existing.setup({ life: false }); prepare(growing); hear(growing, catalog.correctionTeaching.ja.exampleSource);
    const early = hear(growing, demo('source'));
    existing.start(growing, 'rest'); hear(growing, words.ja[1]); existing.finish(growing);
    growing.world.mode = 'idle'; growing.world.attention = null; core.perceive(growing.state, { scene: 'clearing', attention: [] });
    const late = hear(growing, demo('replacement'));
    assert.ok(late.beforeKnowledge.meanings.find(m => m.id === 'rest').evidence.length > early.beforeKnowledge.meanings.find(m => m.id === 'rest').evidence.length);
    add('later-meaning-evidence-original-basis-preserved', [early, late], [true, true]);
    const independent = existing.setup(); prepare(independent);
    const successive = [];
    for (const word of ['lulu', 'ruru']) {
        const old = catalog.correctionTeaching.ja.exampleSource.replace('ぽぽ', word);
        const next = catalog.correctionTeaching.ja.exampleReplacement.replace('ぽぽ', word);
        hear(independent, old); successive.push(hear(independent, demo('source', 'ja', old)), hear(independent, demo('replacement', 'ja', next)));
    }
    add('new-original-separate-input-and-scope', successive, [true, true, true, true]);
    for (const sample of [source, replacement]) {
        add('copied-input-time-materials', [copy(sample)], [true]);
        const mutations = [
            v => { v.result.interpretations = []; }, v => { v.result.understandings = []; },
            v => { v.result.relationLearning = undefined; }, v => { v.context = undefined; },
            v => { v.beforeKnowledge = undefined; }, v => { v.beforeExperiences = []; },
            v => { v.beforeLessons = undefined; }, v => { v.beforeRecords = []; },
            v => { v.beforeKnowledge.meanings = []; }, v => { v.beforeKnowledge.relations = []; },
            v => { v.beforeKnowledge.wordExplanations = []; },
            v => { v.beforeKnowledge.relations.push({ id: 'correction', source: 'initial' }); },
            ...['id', 'raw', 'locale', 'speaker', 'at', 'scene'].map(k => v => { v.result.input[k] = 'other'; }),
            ...['mode', 'target', 'activityStart', 'elapsed', 'attention', 'scene'].map(k => v => { v.context[k] = undefined; }),
            ...['kind', 'word', 'meaning', 'relations', 'span', 'catalogRule', 'phase', 'utterance'].map(k => v => { v.result.interpretations[0][k] = 'other'; }),
            ...['complete', 'kind', 'relations', 'known', 'unresolved', 'subject', 'relationReferences', 'roles'].map(k => v => { v.result.understandings[0][k] = 'other'; }),
            ...['updated', 'adopted', 'relationAcquired', 'candidates'].map(k => v => { v.result.relationLearning[k] = null; }),
            ...['inputId', 'heardAt', 'input', 'word', 'explainedAs', 'meaning', 'speaker', 'scope', 'basis'].map(k => v => { v.result.relationLearning.candidates[0].original[k] = null; }),
            ...['input', 'frame', 'understanding', 'at', 'scope', 'basis', 'namingBasis'].map(k => v => { v.result.relationLearning.candidates[0][v.result.interpretations[0].phase][k] = null; }),
            v => { v.beforeKnowledge.wordExplanations.push(copy(v.beforeKnowledge.wordExplanations[0])); },
            v => { v.beforeRecords.push(copy(v.beforeRecords[0])); },
            v => { v.beforeRecords[0].understandings[0].wordExplanation.input.raw = 'other'; },
            v => { v.beforeRecords[0].understandings[0].complete = false; },
            v => { v.beforeKnowledge.relationEvidence = []; },
            v => { v.beforeExperiences.at(-1).relationLabels[0].understanding.complete = true; },
            v => { v.beforeExperiences.at(-1).end = 999; }
        ];
        for (const mutate of mutations) { const invalid = copy(sample); mutate(invalid); add('tampered-materials', [invalid], [false]); }
    }
    for (const mutate of [v => { v.beforeLessons = []; }, v => { v.beforeLessons.push(copy(v.beforeLessons[0])); },
        v => { v.beforeLessons[0].source.input.raw = 'other'; }, v => { v.beforeLessons[0].source.understanding.complete = false; },
        v => { v.beforeLessons[0].replacement = copy(v.result.relationLearning.candidates[0].replacement); }]) {
        const invalid = copy(replacement); mutate(invalid); add('tampered-source-teaching', [invalid], [false]);
    }
    for (const sample of [source, replacement]) for (const mutate of [
        v => { v.beforeKnowledge.relations.find(r => r.id === 'naming').evidence.reverse(); },
        v => { v.beforeKnowledge.relations.find(r => r.id === 'naming').scope.locale = 'en'; },
        v => { v.beforeKnowledge.wordExplanations[0].basis.evidence = []; },
        v => { v.beforeKnowledge.wordExplanations[0].input.id = 'input:999'; },
        v => { v.beforeKnowledge.wordExplanations[0].retractedBy = 'input:999'; },
        v => { v.beforeLessons.push({ original: {}, source: { input: { id: v.result.input.id } } }); }
    ]) { const invalid = copy(sample); mutate(invalid); add('tampered-original-and-prerequisites', [invalid], [false]); }
    // Matching alterations in both candidate/adopted must still be refused.
    for (const sample of [source, replacement]) for (const mutate of [
        l => { l.original.input.raw = 'other'; }, l => { l.source.input.id = l.original.inputId; },
        l => { l.source.scope.scene = 'elsewhere'; }, l => { l.source.frame.utterance = 'other'; },
        l => { l.source.understanding.relations.push('correction'); }, l => { l.source.at = -1; },
        l => { l.source.namingBasis[0].evidence.reverse(); }, l => { l.source.basis.evidence = []; }
    ]) {
        const invalid = copy(sample), lesson = invalid.result.relationLearning.candidates[0]; mutate(lesson);
        invalid.result.relationLearning.adopted = { relation: 'correction', ...copy(lesson) };
        add('jointly-tampered-candidate-and-adopted', [invalid], [false]);
    }
    return output;
}
module.exports = { fixtures, hear, prepare, demo };
