'use strict';
// Real receive/respond, labels and demonstrated work run in disposable Node
// memory. Only copied pre-input material enters the isolated renderer.
const assert = require('node:assert/strict');
const core = require('../../experimental_word_learning_core');
const worldApi = require('../../experimental_word_learning_world');
const careers = require('../../experimental_word_careers');
const catalog = require('../../experimental_word_learning_catalog.json');
const existing = require('./diary_negation_fixtures');
const { hear } = require('./diary_correction_fixtures');
const copy = v => JSON.parse(JSON.stringify(v));
const locales = Object.keys(catalog.correctionTeaching);
const life = ['berry', 'food', 'eat', 'sweet', 'hungry', 'rest', 'sleep', 'tired'];
const ids = [...life, ...Object.keys(catalog.experienceMeanings)];
const indices = {
    berry: [0, 2, 4, 5, 7, 9, 10], food: [0, 1, 2, 3, 4, 4, 5], eat: [0, 1, 2, 3, 4, 4, 6],
    sweet: [0, 1, 2, 3, 4, 5, 6], hungry: [0, 2, 3, 4, 5, 6, 7], rest: [0, 2, 3, 4, 5, 5, 6],
    sleep: [0, 2, 3, 4, 5, 5, 6], tired: [0, 2, 3, 4, 5, 5, 6], work: [0, 2, 4, 5, 6, 7, 8]
};
function word(id, locale) {
    const forms = catalog.meanings[id] || catalog.experienceMeanings[id];
    return forms[(indices[id] || [0, 2, 3, 4, 5, 6, 7])[locales.indexOf(locale)]];
}
function form(id, locale, correction = false, name = 'lulu') {
    const raw = catalog.correctionTeaching[locale][correction ? 'exampleReplacement' : 'exampleSource'];
    const frame = core.wordFrame(raw, locale);
    return raw.replace(frame.word, name).replace(frame.meaning, word(id, locale));
}
function idle(v, scene = 'clearing', attention = []) {
    v.world.mode = 'idle'; v.world.attention = null;
    core.perceive(v.state, { scene, attention });
}
function prepare(options = {}, locale = 'ja') {
    const v = existing.setup({ foundation: true, ...options });
    if (!v.state.settings.life) for (const activity of ['eat', 'rest']) {
        existing.start(v, activity);
        for (const id of life.filter(id => ['berry', 'food', 'eat', 'sweet', 'hungry'].includes(id) === (activity === 'eat')))
            // Sensory labels reuse unambiguous catalog aliases; German Essen
            // overlaps food/eat and is not a one-meaning acquisition label.
            hear(v, `"${catalog.meanings[id][0]}"`, locale);
        existing.finish(v);
    }
    for (const master of Object.keys(careers.JOBS)) {
        Object.assign(v.world, { mode: 'observe', attention: `master:${master}`, elapsed: v.world.elapsed + 1,
            dwell: 0, hunger: .2, fatigue: .2 });
        careers.arrive(v.world, { id: ++v.world.event, target: v.world.attention }); v.world.dwell = 0;
        worldApi.onArrival(v.world, v.state, careers.tick(v.world));
        assert.equal(v.world.mode, 'work');
        v.world.elapsed += careers.JOBS[master].seconds; v.world.dwell = 0;
        worldApi.onArrival(v.world, v.state, careers.tick(v.world));
    }
    idle(v);
    for (const id of ids) assert.ok(v.state.knowledge.meanings.some(m => m.id === id), id);
    return v;
}
function fixtures() {
    const output = [], seeds = [];
    const add = (group, values, expected) => output.push({ group, values, expected });
    for (const locale of locales) for (const lifeKnown of [false, true]) for (const speech of ['short', 'gesture']) {
        const base = prepare({ life: lifeKnown, speech }, locale);
        for (const old of ids) for (const next of ids) if (old !== next && ![old, next].every(id => ['eat', 'rest'].includes(id))) {
            const v = copy(base); hear(v, form(old, locale), locale);
            const actual = hear(v, form(next, locale, true), locale);
            assert.equal(actual.result.understandings[0].complete, true);
            add('seven-locales-all-remaining-pairs', [actual], [true]);
            if (locale === 'ja' && speech === 'short' && ((old === 'berry' && next === 'sleep') || (old === 'work:farming' && next === 'work:fishing')))
                seeds.push(copy(actual));
        }
    }
    for (const locale of locales) for (const foundation of [false, true]) for (const lifeKnown of [false, true])
        for (const speech of ['short', 'gesture']) {
            const v = existing.setup({ foundation, life: lifeKnown, speech }); idle(v);
            hear(v, form('berry', locale), locale);
            add('eight-starts-before-learning', [hear(v, form('sleep', locale, true), locale)], [foundation && lifeKnown]);
        }
    for (const locale of locales) {
        const v = prepare({}, locale);
        hear(v, form('berry', locale), locale);
        add('normalized-existing-form', [hear(v, '  ' + form('sleep', locale, true).toUpperCase() + '  ', locale)], [true]);
        add('repeat-after-retraction', [hear(v, form('sleep', locale, true), locale)], [false]);
        hear(v, form('berry', locale, false, 'ruru'), locale);
        add('new-original-independent', [hear(v, form('sleep', locale, true, 'ruru'), locale)], [true]);
        const x = prepare({}, locale); hear(x, form('eat', locale), locale);
        add('x-eat-rest-ownership', [hear(x, form('rest', locale, true), locale)], [false]);
    }
    for (const scenario of ['no-original', 'competing', 'same-meaning', 'other-speaker', 'other-locale',
        'other-scene', 'other-target', 'missing-input', 'recorrection', 'builtin', 'unallowed', 'unknown-new', 'unknown-correction', 'unknown-naming']) {
        const v = prepare();
        if (scenario === 'other-target') idle(v, 'clearing', [{ id: 'berry:1', meaning: 'berry' }]);
        if (scenario !== 'no-original') hear(v, form('berry', 'ja'));
        if (scenario === 'competing') hear(v, form('food', 'ja'));
        if (scenario === 'other-scene') idle(v, 'elsewhere');
        if (scenario === 'other-target') idle(v, 'clearing', [{ id: 'berry:2', meaning: 'berry' }]);
        if (scenario === 'missing-input') delete v.state.knowledge.wordExplanations.at(-1).input;
        if (scenario === 'recorrection') hear(v, form('sleep', 'ja', true));
        if (scenario === 'unknown-new') v.state.knowledge.meanings = v.state.knowledge.meanings.filter(m => m.id !== 'sleep');
        if (scenario.startsWith('unknown-') && scenario !== 'unknown-new') v.state.knowledge.relations = v.state.knowledge.relations.filter(r => r.id !== scenario.slice(8));
        const locale = scenario === 'other-locale' ? 'en' : 'ja';
        const raw = form(scenario === 'same-meaning' || scenario === 'recorrection' ? 'berry' : 'sleep', locale, true,
            scenario === 'builtin' ? word('berry', locale) : 'lulu');
        add('invalid-existing-occasion', [hear(v, scenario === 'unallowed' ? raw.replace(word('sleep', locale), catalog.meanings.walk[0]) : raw,
            locale, scenario === 'other-speaker' ? 'visitor' : 'player')], [false]);
    }
    const retry = prepare({ foundation: false });
    hear(retry, form('berry', 'ja')); const rejected = hear(retry, form('sleep', 'ja', true));
    // Test-only later prerequisite: the rejected occurrence itself stays rejected.
    retry.state.knowledge.relations.push({ id: 'naming', source: 'initial' }, { id: 'correction', source: 'initial' });
    add('rejected-input-not-retroactive', [rejected], [false]);
    for (const locale of locales) {
        const v = prepare({}, locale);
        idle(v, 'clearing', [{ id: 'berry:1', meaning: 'berry' }]);
        hear(v, form('berry', locale), locale);
        idle(v, 'elsewhere', [{ id: 'berry:1', meaning: 'berry' }]);
        add('same-target-across-scenes-existing-scope', [hear(v, form('sleep', locale, true), locale)], [true]);
        const marked = prepare({}, locale); hear(marked, form('berry', locale), locale);
        const marks = catalog.correctionTeaching[locale];
        add('marked-teaching-not-actual-correction', [hear(marked, `${marks.source}«${form('berry', locale)}»`, locale),
            hear(marked, `${marks.replacement}«${form('sleep', locale, true)}»`, locale)], [false, false]);
    }
    // The existing x fixture supplies a complete individual-source correction;
    // importing that copied receipt does not run any renderer learning API.
    const xFixtures = require('./diary_actual_correction_fixtures').fixtures();
    const individualReceipt = xFixtures.find(f => f.group === 'valid-individual-correction-separate-entry').values[0];
    assert.equal(individualReceipt.result.understandings[0].complete, true);
    add('individual-source-not-general-definition', [individualReceipt], [false]);
    const experiencedReceipt = xFixtures.find(f => f.group === 'real-seven-locales-eight-settings'
        && f.values[0].result.understandings[0].relationReferences?.some(r => r.id === 'correction')).values[0];
    add('experienced-relations-retain-x-boundary', [experiencedReceipt], [false]);
    const xCompound = xFixtures.find(f => f.group === 'invalid-occasion'
        && f.values[0].result.interpretations[0].oldMeaning).values[0];
    add('negation-contrast-not-general-replacement', [xCompound], [false]);
    const growth = prepare({ life: false }); hear(growth, form('berry', 'ja'));
    existing.start(growth, 'eat'); hear(growth, word('berry', 'ja')); existing.finish(growth); idle(growth);
    add('later-evidence-original-basis-preserved', [hear(growth, form('sleep', 'ja', true))], [true]);
    for (const seed of seeds) {
        add('copied-input-time-receipt', [copy(seed)], [true]);
        const original = v => v.beforeKnowledge.wordExplanations.find(e => e.inputId === v.result.understandings[0].corrects);
        const mutations = [
            ...['id', 'raw', 'locale', 'speaker', 'at', 'scene'].map(k => v => { v.result.input[k] = null; }),
            ...['scene', 'attention', 'mode', 'target', 'activityStart', 'elapsed'].map(k => v => { v.context[k] = undefined; }),
            ...['kind', 'word', 'meaning', 'relations', 'span', 'catalogRule'].map(k => v => { v.result.interpretations[0][k] = null; }),
            ...['complete', 'kind', 'known', 'relations', 'unresolved', 'subject', 'corrects', 'wordExplanation'].map(k => v => { v.result.understandings[0][k] = null; }),
            ...['candidates', 'adopted', 'updated', 'retraction', 'relationAcquired'].map(k => v => { v.result.learning[0][k] = null; }),
            ...['meanings', 'relations', 'wordExplanations', 'associations'].map(k => v => { v.beforeKnowledge[k] = undefined; }),
            ...['inputId', 'heardAt', 'input', 'word', 'explainedAs', 'meaning', 'speaker', 'scope', 'basis'].map(k => v => { original(v)[k] = null; }),
            v => { v.beforeRecords = []; }, v => { v.beforeExperiences = undefined; },
            v => { v.beforeRecords.push(null); }, v => { v.beforeKnowledge.meanings.push(null); },
            v => { v.beforeKnowledge.relations.push(null); }, v => { v.beforeKnowledge.associations.push({ evidence: [null] }); },
            v => { v.beforeKnowledge.wordExplanations.push(copy(original(v))); },
            v => { v.beforeRecords.push(copy(v.beforeRecords.find(r => r.id === original(v).inputId))); },
            v => { original(v).corrects = 'input:1'; }, v => { original(v).retractedBy = v.result.input.id; },
            v => { v.beforeRecords.find(r => r.id === original(v).inputId).understandings[0].complete = false; },
            v => { v.beforeKnowledge.meanings.push(copy(original(v).basis)); },
            v => { v.beforeKnowledge.relations.push(copy(v.beforeKnowledge.relations.find(r => r.id === 'naming'))); },
            v => { v.beforeKnowledge.relations.find(r => r.id === 'correction').scope = {}; },
            v => { v.beforeKnowledge.meanings.find(m => m.id === original(v).meaning).source = 'other'; }
        ];
        for (const mutate of mutations) { const invalid = copy(seed); mutate(invalid); add('tampered-receipt-original-result', [invalid], [false]); }
        const basis = original(seed).basis;
        if (basis.source !== 'initial') for (const mutate of [
            v => { original(v).basis.evidence.reverse(); original(v).basis.evidence[0].scope.subject = 'player'; },
            v => { const e = original(v).basis.evidence[0]; v.beforeExperiences.push(copy(v.beforeExperiences.find(event => event.id === e.experienceId))); },
            ...['activity', 'target', 'start', 'end', ...(basis.source === 'demonstrated_work' ? ['master', 'result', 'demonstration'] : ['lifeLabels'])].map(k => v => {
                v.beforeExperiences.find(event => event.id === original(v).basis.evidence[0].experienceId)[k] = null;
            })
        ]) { const invalid = copy(seed); mutate(invalid); add('tampered-original-experience-basis', [invalid], [false]); }
    }
    return output;
}
module.exports = { fixtures, prepare, form, word, idle };
