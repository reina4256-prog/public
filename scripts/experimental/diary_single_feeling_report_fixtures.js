'use strict';
// Receive/respond runs only in disposable Node memory; copied snapshots can be
// exercised in the independent renderer without actors or real saves.
const assert = require('node:assert/strict');
const { setup, hear, select, texts } = require('./diary_feeling_word_fixtures');
const core = require('../../experimental_word_learning_core');
const catalog = require('../../experimental_word_learning_catalog.json');
const copy = v => JSON.parse(JSON.stringify(v));
const stages = ['sad', 'happy', 'reportSad', 'reportHappy', 'yesterday', 'now'];
function acquire(settings = { foundation: false, life: false }, locale = 'ja', contrast = false) {
    const v = setup(settings), t = texts(locale);
    select(v, locale);
    for (const stage of [...stages, ...(contrast ? ['retain', 'difference', 'noncausal'] : [])]) hear(v, t[stage], locale);
    return v;
}
function fixtures() {
    const output = [], seeds = [];
    const add = (group, values, expected) => output.push({ group, values, expected });
    const reports = (v, locale) => [catalog.feelingContrast[locale].past, catalog.feelingContrast[locale].present].map(raw => hear(v, raw, locale));
    for (const locale of Object.keys(catalog.feelingContrast)) for (const foundation of [false, true])
        for (const life of [false, true]) for (const speech of ['short', 'gesture']) {
            const v = setup({ foundation, life, speech });
            add('initial-seven-locales-eight-settings', reports(v, locale), Array(2).fill(foundation && life));
            const t = texts(locale), selected = select(v, locale);
            add('selection-is-not-normal-report', [selected], [false]);
            for (const stage of stages) {
                const lesson = hear(v, t[stage], locale);
                add('partial-prerequisites-and-teaching-separated', [lesson, ...reports(v, locale)],
                    [false, (foundation || stages.indexOf(stage) >= 5) && (life || stages.indexOf(stage) >= 0),
                        (foundation || stages.indexOf(stage) >= 5) && (life || stages.indexOf(stage) >= 1)]);
            }
            const complete = reports(v, locale);
            add('complete-without-contrast', complete, [true, true]);
            if (locale === 'ja' && speech === 'short') seeds.push(...complete);
            add('new-input-repetition', reports(v, locale), [true, true]);
            add('two-clause-and-contrast-teaching-separated', [hear(v, t.full, locale),
                ...['retain', 'difference', 'noncausal'].map(k => hear(v, t[k], locale))], Array(4).fill(false));
            add('contrast-never-attached-to-single', reports(v, locale), [true, true]);
            for (let i = 0; i < 20; i++) hear(v, 'unsupported ' + i, locale);
            add('selected-source-context-eviction', reports(v, locale), [true, true]);
            core.perceive(v.state, { scene: 'elsewhere', attention: [] });
            v.world.elapsed = 300; v.world.activityStart = 200;
            add('ordinary-hearing-scene-independent-of-teaching', reports(v, locale), [true, true]);
        }
    for (const locale of Object.keys(catalog.feelingContrast)) {
        const v = acquire(undefined, locale), pair = catalog.feelingContrast[locale];
        for (const [raw, loc, speaker] of [[pair.past, locale, 'visitor'], [catalog.feelingContrast.en.present, 'en', 'player'],
            ['今は悲しい', locale, 'player'], ['昨日はうれしかった', locale, 'player'], ['うれしくない', locale, 'player'],
            ['あなたはうれしい', locale, 'player'], ['悲しい', locale, 'player']]) {
            if (loc === locale && raw === catalog.feelingContrast.en.present && locale === 'en') continue;
            add('other-speaker-locale-expression', [hear(v, raw, loc, speaker)], [false]);
        }
        const normalized = setup({ foundation: true, life: true });
        add('existing-normalization', [hear(normalized, '  ' + pair.present.toUpperCase() + '  ', locale)], [true]);
        const before = setup({ foundation: false, life: false }), rejected = reports(before, locale);
        select(before, locale); for (const stage of stages) hear(before, texts(locale)[stage], locale);
        add('no-retroactive-candidate', [...rejected, ...reports(before, locale)], [false, false, true, true]);
    }
    // Changes to current sources, prior evidence, identity, timing and understood
    // roles must be rejected rather than silently repaired from newer knowledge.
    const changes = [
        v => { v.result.input.id = 'input:0'; }, v => { v.result.input.at = Infinity; },
        v => { v.context.scene = 'changed'; }, v => { v.context.elapsed = -1; },
        v => { v.context.activityStart = v.context.elapsed + 1; }, v => { v.context.activityStart = -1; },
        v => { v.context.attention = [null]; }, v => { v.result.interpretations.push(copy(v.result.interpretations[0])); },
        v => { v.result.interpretations[0].meaning = 'sad'; }, v => { v.result.interpretations[0].time = 'yesterday'; },
        v => { v.result.interpretations[0].catalogRule = 'feeling_contrast'; },
        v => { v.result.understandings[0].subject = 'self'; }, v => { v.result.understandings[0].eventTime = 'unspecified'; },
        v => { v.result.understandings[0].testimony.verified = true; }, v => { v.result.understandings[0].testimony.reporter = 'self'; },
        v => { v.result.understandings[0].reportSource.heardAt++; }, v => { v.result.understandings[0].feelingSource.input.raw = 'changed'; },
        v => { v.result.understandings[0].feelingBasis.taught = []; }, v => { v.result.understandings[0].contrastConnection = {}; },
        v => { v.result.understandings[0].complete = false; }, v => { v.result.feelingLearning = { adopted: {}, updated: [] }; },
        v => { v.result.learning[0].updated = [{ id: 'happy' }]; },
        v => { v.beforeFeelingLearning.knowledge = []; }, v => { v.beforeFeelingLearning.events[0].original.input.raw = 'changed'; },
        v => { v.beforeFeelingLearning.events[0].original.understandings[0].complete = true; },
        v => { v.beforeFeelingLearning.events[1].input.at = v.result.input.at + 1; },
        v => { v.beforeFeelingLearning.events[1].at = v.context.elapsed + 1; },
        v => { v.beforeFeelingLearning.events[1].frame.stage = 'happy'; },
        v => { v.beforeFeelingLearning.events[1].basis.meanings.push({ id: 'sad', source: 'initial' }); },
        v => { v.beforeFeelingLearning.events[1].understanding.subject = 'player'; },
        v => { v.beforeFeelingLearning.events[1].sourceId = 'input:99'; },
        v => { v.beforeFeelingLearning.events.reverse(); }, v => { v.beforeFeelingLearning.events.push(copy(v.beforeFeelingLearning.events[0])); },
        v => { v.beforeFeelingLearning.knowledge[0].scope.locale = 'wrong'; },
        v => { v.beforeFeelingLearning.knowledge[0].evidence = [v.result.input.id]; },
        v => { v.beforeTurns.push(copy(v.beforeTurns[0])); }, v => { v.beforeRecords.push(copy(v.beforeRecords[0])); },
        v => { v.beforeTurns[0].id = v.result.input.id; },
        v => { v.beforeKnowledge.meanings.push({ id: 'happy', source: 'initial' }); },
        v => { v.beforeKnowledge.relations.push({ id: 'report', source: 'initial' }); }
    ];
    for (const seed of seeds.filter(v => v.beforeFeelingLearning.knowledge.length)) for (const change of changes) {
        const v = copy(seed), original = JSON.stringify(v); change(v);
        if (JSON.stringify(v) === original) continue;
        add('current-and-prior-evidence-mutations', [v], [false]);
    }
    for (const locale of Object.keys(catalog.feelingContrast)) {
        const v = acquire(undefined, locale, true), seed = hear(v, catalog.feelingContrast[locale].present, locale);
        assert.equal(seed.result.understandings[0].contrastConnection, undefined);
        for (const field of ['speaker', 'form', 'meaning', 'time']) {
            const altered = copy(seed); altered.beforeFeelingLearning.knowledge.find(e => e.type === 'relation' && e.id === 'time').scope[field] = 'changed';
            add('learned-scope-mutations', [altered], [false]);
        }
        for (const id of ['happy', 'report', 'time']) {
            const altered = copy(seed); altered.beforeFeelingLearning.knowledge = altered.beforeFeelingLearning.knowledge.filter(e => e.id !== id);
            add('missing-learned-prerequisite', [altered], [false]);
        }
    }
    for (const locale of Object.keys(catalog.feelingContrast)) {
        const v = acquire(undefined, locale), seed = hear(v, catalog.feelingContrast[locale].present, locale);
        const source = seed.beforeFeelingLearning.events[0].original;
        for (const field of ['subject', 'eventTime', 'complete']) {
            const altered = copy(seed), u = copy(source.understandings);
            u[0][field] = field === 'complete' ? true : 'changed';
            altered.beforeRecords.push({ id: source.input.id, speaker: 'player', understandings: u });
            add('retained-original-conflicts', [altered], [false]);
        }
        for (const event of seed.beforeFeelingLearning.events.slice(1)) {
            const altered = copy(seed), operations = [{ kind: 'report', complete: true }];
            altered.beforeTurns = altered.beforeTurns.filter(t => t.id !== event.input.id);
            altered.beforeTurns.push({ id: event.input.id, speaker: 'player', understandings: operations });
            add('prior-teaching-operation-conflicts', [altered], [false]);
        }
    }
    for (const foundation of [false, true]) for (const life of [false, true]) {
        const v = setup({ foundation, life });
        for (const locale of Object.keys(catalog.feelingContrast)) {
            select(v, locale); for (const stage of [...stages, 'retain', 'difference', 'noncausal']) hear(v, texts(locale)[stage], locale);
        }
        assert.equal(v.state.feelingLearning.events.length, 70);
        add('seven-language-prior-teachings-at-capacity', Object.keys(catalog.feelingContrast).flatMap(locale => reports(v, locale)), Array(14).fill(true));
    }
    const initial = hear(setup({ foundation: true, life: true }), catalog.feelingContrast.ja.present);
    for (const list of ['meanings', 'relations']) for (const id of list === 'meanings' ? ['sad', 'happy'] : ['report', 'time', 'contrast']) {
        for (const kind of ['remove', 'duplicate', 'scope', 'source']) {
            const altered = copy(initial), items = altered.beforeKnowledge[list], i = items.findIndex(e => e.id === id);
            if (kind === 'remove') items.splice(i, 1);
            if (kind === 'duplicate') items.push(copy(items[i]));
            if (kind === 'scope') items[i].scope = {};
            if (kind === 'source') items[i].source = 'invented';
            add('initial-evidence-mutations', [altered], [false]);
        }
    }
    return output;
}
module.exports = { fixtures, acquire };
