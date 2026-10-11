'use strict';
// Only disposable Node memory runs receive/respond and prerequisite learning.
const assert = require('node:assert/strict');
const core = require('../../experimental_word_learning_core');
const catalog = require('../../experimental_word_learning_catalog.json');
const existing = require('./diary_negation_fixtures');
const { hear, prepare, demo } = require('./diary_correction_fixtures');
const copy = v => JSON.parse(JSON.stringify(v));
function fixtures() {
    const output = [], add = (group, values, expected) => output.push({ group, values, expected });
    let initial, learned;
    for (const locale of Object.keys(catalog.correctionTeaching)) for (const foundation of [false, true])
        for (const life of [false, true]) for (const speech of ['short', 'gesture']) {
            const value = existing.setup({ foundation, life, speech }), forms = catalog.correctionTeaching[locale];
            add('no-original-or-prerequisites', [hear(value, forms.exampleReplacement, locale)], [false]);
            prepare(value, locale); hear(value, forms.exampleSource, locale);
            if (!foundation) add('unlearned-correction', [hear(value, forms.exampleReplacement, locale)], [false]);
            add('marked-teachings-separated', [hear(value, demo('source', locale), locale),
                hear(value, demo('replacement', locale), locale)], [false, false]);
            const actual = hear(value, forms.exampleReplacement, locale);
            add('real-seven-locales-eight-settings', [actual], [true]);
            assert.equal(value.state.knowledge.wordExplanations.find(e => e.inputId === actual.result.understandings[0].corrects).retractedBy, actual.result.input.id);
            if (locale === 'ja' && !life && speech === 'short') { if (foundation) initial = copy(actual); else learned = copy(actual); }
            add('repeat-after-retraction', [hear(value, forms.exampleReplacement, locale)], [false]);
            const word = core.wordFrame(forms.exampleSource, locale).word;
            const different = forms.exampleSource.replace(word, 'lulu');
            hear(value, different, locale);
            add('other-original-no-experienced-transfer', [hear(value, forms.exampleReplacement.replace(word, 'lulu'), locale)], [foundation]);
        }
    assert.ok(initial && learned);
    for (const locale of Object.keys(catalog.correctionTeaching)) {
        const value = existing.setup({ foundation: true }); prepare(value, locale);
        const forms = catalog.correctionTeaching[locale], word = core.wordFrame(forms.exampleSource, locale).word;
        const entries = [];
        for (const name of ['lulu', 'ruru']) {
            hear(value, forms.exampleSource.replace(word, name), locale);
            entries.push(hear(value, forms.exampleReplacement.replace(word, name), locale));
        }
        add('initial-no-teaching-separate-originals', entries, [true, true]);
    }
    for (const locale of Object.keys(catalog.correctionTeaching)) for (const foundation of [false, true]) {
        const value = existing.setup({ foundation }); prepare(value, locale);
        const forms = catalog.correctionTeaching[locale]; hear(value, forms.exampleSource, locale);
        if (!foundation) { hear(value, demo('source', locale), locale); hear(value, demo('replacement', locale), locale); }
        add('existing-normalized-form', [hear(value, '  ' + forms.exampleReplacement.toUpperCase() + '  ', locale)], [true]);
    }
    for (const locale of Object.keys(catalog.correctionTeaching)) for (const foundation of [false, true]) {
        const value = existing.setup({ foundation }); prepare(value, locale);
        const forms = catalog.correctionTeaching[locale], a = core.wordFrame(forms.exampleSource, locale), b = core.wordFrame(forms.exampleReplacement, locale);
        const old = forms.exampleSource.replace(a.word, 'lulu').replace(a.meaning, b.meaning);
        const next = forms.exampleReplacement.replace(b.word, 'lulu').replace(b.meaning, a.meaning);
        hear(value, old, locale);
        if (!foundation) { hear(value, demo('source', locale, old), locale); hear(value, demo('replacement', locale, next), locale); }
        add('reverse-direction', [hear(value, next, locale)], [true]);
    }
    for (const scenario of ['no-original', 'competing', 'same-meaning', 'other-speaker', 'other-locale', 'other-scene',
        'missing-original-input', 'individual', 'compound', 'recorrection']) {
        const value = existing.setup({ foundation: true }); prepare(value);
        if (scenario !== 'no-original') hear(value, scenario === 'individual' ? 'これはぽぽだよ' : catalog.correctionTeaching.ja.exampleSource);
        if (scenario === 'competing') hear(value, 'ぽぽは食べることだよ');
        if (scenario === 'other-scene') core.perceive(value.state, { scene: 'elsewhere', attention: [] });
        if (scenario === 'missing-original-input') delete value.state.knowledge.wordExplanations[0].input;
        if (scenario === 'recorrection') hear(value, catalog.correctionTeaching.ja.exampleReplacement);
        const raw = scenario === 'same-meaning' || scenario === 'recorrection' ? 'さっき間違えた。ぽぽは休むことだよ'
            : scenario === 'compound' ? 'ぽぽは休むことじゃなくて食べることだよ'
            : scenario === 'other-locale' ? catalog.correctionTeaching.en.exampleReplacement : catalog.correctionTeaching.ja.exampleReplacement;
        add('invalid-occasion', [hear(value, raw, scenario === 'other-locale' ? 'en' : 'ja', scenario === 'other-speaker' ? 'visitor' : 'player')], [false]);
    }
    const individual = existing.setup({ foundation: true }); prepare(individual);
    core.perceive(individual.state, { scene: 'clearing', attention: [{ id: 'berry:1', meaning: 'berry' }] });
    const named = hear(individual, 'これはぽぽだよ');
    assert.equal(named.result.understandings[0].complete, true);
    const changedName = hear(individual, catalog.correctionTeaching.ja.exampleReplacement);
    assert.equal(changedName.result.understandings[0].complete, true);
    assert.equal(changedName.result.learning[0].retraction, named.result.input.id);
    add('valid-individual-correction-separate-entry', [changedName], [false]);
    const growing = existing.setup({ foundation: true, life: false }); prepare(growing);
    hear(growing, catalog.correctionTeaching.ja.exampleSource);
    existing.start(growing, 'rest'); hear(growing, '休む'); existing.finish(growing);
    growing.world.mode = 'idle'; growing.world.attention = null; core.perceive(growing.state, { scene: 'clearing', attention: [] });
    add('later-meaning-evidence-original-preserved', [hear(growing, catalog.correctionTeaching.ja.exampleReplacement)], [true]);
    for (const sample of [initial, learned]) {
        add('input-time-copy', [copy(sample)], [true]);
        const mutations = [
            ...['id', 'raw', 'locale', 'speaker', 'at', 'scene'].map(k => v => { v.result.input[k] = 'other'; }),
            ...['scene', 'attention', 'mode', 'target', 'activityStart', 'elapsed'].map(k => v => { v.context[k] = undefined; }),
            ...['kind', 'word', 'meaning', 'relations', 'span', 'catalogRule'].map(k => v => { v.result.interpretations[0][k] = null; }),
            ...['complete', 'kind', 'known', 'relations', 'unresolved', 'subject', 'corrects', 'wordExplanation', 'relationReferences'].map(k => v => { v.result.understandings[0][k] = null; }),
            ...['candidates', 'adopted', 'updated', 'retraction', 'relationAcquired'].map(k => v => { v.result.learning[0][k] = null; }),
            ...['meanings', 'relations', 'wordExplanations', 'associations', 'relationEvidence'].map(k => v => { v.beforeKnowledge[k] = undefined; }),
            v => { v.beforeRecords = []; }, v => { v.beforeExperiences = []; }, v => { v.beforeLessons = undefined; },
            v => { v.beforeKnowledge.wordExplanations.push(copy(v.beforeKnowledge.wordExplanations.at(-1))); },
            v => { v.beforeRecords.push(copy(v.beforeRecords.find(r => r.id === v.result.understandings[0].corrects))); },
            ...['inputId', 'heardAt', 'input', 'word', 'explainedAs', 'meaning', 'speaker', 'scope', 'basis'].map(k => v => {
                v.beforeKnowledge.wordExplanations.find(e => e.inputId === v.result.understandings[0].corrects)[k] = null;
            }),
            v => { v.beforeRecords.find(r => r.id === v.result.understandings[0].corrects).understandings[0].complete = false; },
            v => { v.beforeRecords.find(r => r.id === v.result.understandings[0].corrects).understandings[0].wordExplanation.input.raw = 'other'; },
            v => { v.beforeKnowledge.wordExplanations.at(-1).corrects = 'input:1'; },
            v => { v.beforeKnowledge.wordExplanations.at(-1).retractedBy = v.result.input.id; },
            v => { v.beforeKnowledge.relations = v.beforeKnowledge.relations.filter(r => r.id !== 'correction'); },
            v => { v.beforeKnowledge.relations.push(copy(v.beforeKnowledge.relations.find(r => r.id === 'correction'))); }
        ];
        for (const mutate of mutations) { const invalid = copy(sample); mutate(invalid); add('tampered-input-original-and-result', [invalid], [false]); }
    }
    for (const mutate of [
        v => { v.beforeLessons = []; }, v => { v.beforeLessons.push(copy(v.beforeLessons[0])); },
        ...['input', 'frame', 'understanding', 'scope', 'at', 'basis', 'namingBasis'].flatMap(k => ['source', 'replacement'].map(phase => v => { v.beforeLessons[0][phase][k] = null; })),
        v => { v.beforeLessons[0].original.basis = {}; },
        v => { v.beforeKnowledge.relationEvidence = []; },
        v => { v.beforeKnowledge.relations.find(r => r.id === 'correction').evidence.reverse(); },
        v => { v.beforeKnowledge.relations.find(r => r.id === 'correction').scope.original = 'input:999'; },
        v => { v.beforeExperiences.at(-1).relationLabels[0].understanding.complete = true; }
    ]) { const invalid = copy(learned); mutate(invalid); add('tampered-experienced-correction', [invalid], [false]); }
    for (const mutate of [
        v => { const l = copy(v.beforeLessons[0]); l.original.inputId = 'input:998'; v.beforeLessons.push(l); },
        v => { v.beforeLessons[0].replacement.input.at = v.result.input.at + 1; },
        v => { v.beforeKnowledge.relations.find(r => r.id === 'naming').evidence.reverse(); },
        v => { v.beforeKnowledge.relations.find(r => r.id === 'correction').scope.form = 'other'; }
    ]) { const invalid = copy(learned); mutate(invalid); add('source-order-uniqueness-and-naming', [invalid], [false]); }
    for (const mutate of [
        v => { v.beforeKnowledge.relations.find(r => r.id === 'naming').scope = {}; },
        v => { v.beforeKnowledge.relations.find(r => r.id === 'correction').scope = {}; }
    ]) { const invalid = copy(initial); mutate(invalid); add('initial-relations-not-replaced', [invalid], [false]); }
    return output;
}
module.exports = { fixtures };
