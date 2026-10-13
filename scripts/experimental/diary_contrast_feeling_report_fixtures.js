'use strict';
// Actors exist only in disposable Node memory, never in the preview renderer.
const assert = require('node:assert/strict');
const { setup, hear, select, texts } = require('./diary_feeling_word_fixtures');
const { acquire } = require('./diary_single_feeling_report_fixtures');
const core = require('../../experimental_word_learning_core');
const catalog = require('../../experimental_word_learning_catalog.json');
const copy = v => JSON.parse(JSON.stringify(v));
const stages = ['sad', 'happy', 'reportSad', 'reportHappy', 'yesterday', 'now', 'retain', 'difference', 'noncausal'];
function fixtures() {
    const output = [], seeds = [];
    const add = (group, values, expected) => output.push({ group, values, expected });
    for (const locale of Object.keys(catalog.feelingContrast)) for (const foundation of [false, true])
        for (const life of [false, true]) for (const speech of ['short', 'gesture']) {
            const v = setup({ foundation, life, speech }), t = texts(locale);
            add('initial-seven-locales-eight-settings', [hear(v, t.full, locale)], [foundation && life]);
            add('selection-is-not-report', [hear(v, t.source, locale)], [false]);
            for (const [i, stage] of stages.entries()) {
                const lesson = hear(v, t[stage], locale);
                add('every-prerequisite-and-teaching-separated', [lesson, hear(v, t.full, locale)],
                    [false, (foundation || i === 8) && (life || i >= 1)]);
            }
            const complete = hear(v, t.full, locale);
            add('complete-both-clauses-one-report', [complete], [true]);
            if (speech === 'short') seeds.push(complete);
            add('new-input-repetition', [hear(v, t.full, locale)], [true]);
            add('single-clauses-remain-ag', [hear(v, catalog.feelingContrast[locale].past, locale),
                hear(v, catalog.feelingContrast[locale].present, locale)], [false, false]);
            for (let i = 0; i < 20; i++) hear(v, 'unsupported ' + i, locale);
            core.perceive(v.state, { scene: 'elsewhere', attention: [] });
            v.world.elapsed = 300; v.world.activityStart = 200;
            add('hearing-scene-independent-and-source-evicted', [hear(v, t.full, locale)], [true]);
        }
    for (const locale of Object.keys(catalog.feelingContrast)) {
        const t = texts(locale), v = acquire(undefined, locale, false);
        const rejected = hear(v, t.full, locale);
        assert.ok(rejected.result.understandings.every(u => !u.complete));
        const lessons = ['retain', 'difference', 'noncausal'].map(k => hear(v, t[k], locale));
        add('contrast-required-no-retroactive-generation', [rejected, ...lessons, hear(v, t.full, locale)], [false, false, false, false, true]);
        const initial = setup({ foundation: true, life: true });
        add('existing-normalization', [hear(initial, '  ' + t.full.toUpperCase() + '  ', locale)], [true]);
        for (const raw of [catalog.feelingContrast[locale].past, catalog.feelingContrast[locale].present,
            t.full.replace(catalog.feelingContrast[locale].join, ' / '), '今は悲しい', '昨日はうれしかった', 'うれしくない']) {
            add('other-expression-not-adopted', [hear(v, raw, locale)], [false]);
        }
        add('other-speaker', [hear(v, t.full, locale, 'visitor')], [false]);
        const wrongLocale = locale === 'en' ? 'de' : 'en';
        add('learned-locale-scope', [hear(v, texts(wrongLocale).full, wrongLocale)], [false]);
    }
    const changes = [
        v => { v.result.input.id = 'input:0'; }, v => { v.result.input.raw = 'changed'; },
        v => { v.result.input.at = Infinity; }, v => { v.context.scene = 'changed'; },
        v => { v.context.elapsed = -1; }, v => { v.context.activityStart = v.context.elapsed + 1; },
        v => { v.context.attention = [null]; }, v => { v.result.interpretations.reverse(); },
        v => { v.result.interpretations.pop(); }, v => { v.result.understandings.reverse(); },
        v => { v.result.understandings.pop(); }, v => { v.result.learning.pop(); },
        v => { v.result.learning[0].updated = [{ id: 'sad' }]; },
        v => { v.result.feelingLearning = { adopted: {}, updated: [] }; },
        v => { v.beforeFeelingLearning.events.reverse(); },
        v => { if (v.beforeFeelingLearning.events.length) v.beforeFeelingLearning.events.push(copy(v.beforeFeelingLearning.events[0])); },
        v => { v.beforeFeelingLearning.knowledge = []; },
        v => { if (v.beforeTurns.length) v.beforeTurns.push(copy(v.beforeTurns[0])); },
        v => { if (v.beforeRecords.length) v.beforeRecords.push(copy(v.beforeRecords[0])); }
    ];
    for (const index of [0, 1]) for (const change of [
        u => { u.subject = 'self'; }, u => { u.complete = false; }, u => { u.kind = 'partial'; },
        u => { u.eventTime = 'unspecified'; }, u => { u.polarity = 'negative'; },
        u => { u.testimony.verified = true; }, u => { u.testimony.contentSubject = 'self'; },
        u => { u.reportSource.inputId = 'input:1'; }, u => { u.reportSource.heardAt++; },
        u => { u.clauseSource.index = 99; }, u => { u.clauseSource.input.raw = 'changed'; },
        u => { u.clauseSource.frame.time = 'changed'; }, u => { u.feelingBasis.taught = []; },
        u => { u.contrastConnection = {}; }, u => { u.relations.pop(); }
    ]) changes.push(v => change(v.result.understandings[index]));
    for (const seed of seeds) for (const change of changes) {
        const altered = copy(seed), before = JSON.stringify(altered);
        change(altered);
        if (JSON.stringify(altered) !== before) add('current-input-and-two-understandings-mutations', [altered], [false]);
    }
    for (const locale of Object.keys(catalog.feelingContrast)) {
        const v = acquire(undefined, locale, true), seed = hear(v, texts(locale).full, locale);
        const source = seed.beforeFeelingLearning.events[0].original;
        for (const event of seed.beforeFeelingLearning.events) for (const field of ['basis', 'frame', 'input', 'at']) {
            const altered = copy(seed), target = altered.beforeFeelingLearning.events.find(e => e.input.id === event.input.id);
            target[field] = field === 'at' ? -1 : {};
            add('all-prior-teaching-snapshot-mutations', [altered], [false]);
        }
        for (const e of seed.beforeFeelingLearning.knowledge) for (const field of ['speaker', 'form', 'meaning', 'time', 'locale']) {
            const altered = copy(seed);
            altered.beforeFeelingLearning.knowledge.find(k => k.type === e.type && k.id === e.id && k.scope.form === e.scope.form).scope[field] = 'changed';
            add('every-learned-scope-mutation', [altered], [false]);
        }
        for (const id of ['sad', 'happy', 'report', 'time', 'contrast']) {
            const altered = copy(seed);
            altered.beforeFeelingLearning.knowledge = altered.beforeFeelingLearning.knowledge.filter(e => e.id !== id);
            add('missing-learned-prerequisite', [altered], [false]);
        }
        for (const index of [0, 1]) for (const field of ['sourceId', 'form', 'retainedClauses', 'difference', 'replaces', 'causalClaim']) {
            const altered = copy(seed), connection = altered.result.understandings[index].contrastConnection;
            connection[field] = ['replaces', 'causalClaim'].includes(field) ? true : 'changed';
            add('contrast-connection-origin-and-noncausal-mutations', [altered], [false]);
        }
        for (const index of [0, 1]) for (const field of ['subject', 'eventTime', 'complete', 'known']) {
            const altered = copy(seed), u = copy(source.understandings);
            u[index][field] = field === 'complete' ? true : field === 'known' ? { meaning: 'sad' } : 'changed';
            altered.beforeRecords = altered.beforeRecords.filter(r => r.id !== source.input.id);
            altered.beforeRecords.push({ id: source.input.id, speaker: 'player', understandings: u });
            add('original-understanding-never-written-back', [altered], [false]);
        }
        for (const event of seed.beforeFeelingLearning.events.slice(1)) {
            const altered = copy(seed);
            altered.beforeTurns = altered.beforeTurns.filter(t => t.id !== event.input.id);
            altered.beforeTurns.push({ id: event.input.id, speaker: 'player', understandings: [{ kind: 'report', complete: true }] });
            add('prior-operation-is-not-content-understanding', [altered], [false]);
        }
    }
    for (const foundation of [false, true]) for (const life of [false, true]) {
        const v = setup({ foundation, life });
        for (const locale of Object.keys(catalog.feelingContrast)) {
            select(v, locale); for (const stage of stages) hear(v, texts(locale)[stage], locale);
        }
        assert.equal(v.state.feelingLearning.events.length, 70);
        add('seven-language-seventy-event-coexistence', Object.keys(catalog.feelingContrast).map(locale => hear(v, texts(locale).full, locale)), Array(7).fill(true));
    }
    const initial = hear(setup({ foundation: true, life: true }), texts().full);
    for (const list of ['meanings', 'relations']) for (const id of list === 'meanings' ? ['sad', 'happy'] : ['report', 'time', 'contrast'])
        for (const kind of ['remove', 'duplicate', 'scope', 'source']) {
            const altered = copy(initial), items = altered.beforeKnowledge[list], i = items.findIndex(e => e.id === id);
            if (kind === 'remove') items.splice(i, 1);
            if (kind === 'duplicate') items.push(copy(items[i]));
            if (kind === 'scope') items[i].scope = {};
            if (kind === 'source') items[i].source = 'invented';
            add('initial-evidence-no-reacquisition-or-invention', [altered], [false]);
        }
    return output;
}
module.exports = { fixtures };
