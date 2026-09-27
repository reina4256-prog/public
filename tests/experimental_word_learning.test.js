'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const api = require('../experimental_word_learning_core');
const catalog = require('../experimental_word_learning_catalog.json');
const worldApi = require('../experimental_word_learning_world');
const notebookApi = require('../experimental_word_learning_notebook');
const reportApi = require('../experimental_word_learning_report');
const create = options => api.create(options, catalog);
const say = (state, text, options) => api.receive(state, text, catalog, { at: 100, ...options });
const focus = (state, scene = 'clearing', count = 1) => api.perceive(state, {
    scene, attention: Array.from({ length: count }, (_, i) => ({ id: `berry:${i + 1}`, meaning: 'berry' }))
});

const lifeLearning = require('../experimental_word_life_learning');
function lifeFixture(activity = 'eat', options = {}) {
    const state = create({ life: false, ...options }), world = worldApi.create();
    Object.assign(world, { mode: activity, elapsed: 10, activityStart: 10, dwell: 1,
        attention: activity === 'eat' ? 'berry:1' : 'shade', hunger: .8, fatigue: .8,
        harvest: 1, activityBefore: { hunger: .8, fatigue: .8 },
        mealTaste: activity === 'eat' ? { quality: 'sweet', pleasant: true } : null });
    return { state, world };
}
function labelLife(state, world, text, options) {
    const result = say(state, text, options);
    worldApi.respond(world, result, state);
    return result;
}
function finishLife(state, world) {
    for (let i = 0; i < 100; i++) {
        const event = worldApi.tick(world, .1);
        if (event) { worldApi.onArrival(world, state, event); return event; }
    }
    assert.fail('completion missing');
}

const relationLearning = require('../experimental_word_relation_learning');
function startRelationActivity(state, world, activity) {
    Object.assign(world, { mode: activity, activityStart: world.elapsed, dwell: 1,
        attention: activity === 'eat' ? `berry:${++world.harvest}` : 'shade',
        activityBefore: { hunger: .8, fatigue: .8 }, hunger: .8, fatigue: .8,
        mealTaste: activity === 'eat' ? { quality: 'sweet', pleasant: true } : null });
    api.perceive(state, worldApi.perception(world));
}
const relationForms = {
    ja: ['もぐは食べることだよ', 'ぽぽは休むことだよ'],
    en: ['"mogu" means "eat"', '"popo" means "rest"'],
    'zh-CN': ['“mogu”的意思是“吃”', '“popo”的意思是“休息”'],
    ru: ['"mogu" значит "есть"', '"popo" значит "отдых"'],
    'es-ES': ['"mogu" significa "comer"', '"popo" significa "descansar"'],
    'pt-BR': ['"mogu" significa "comer"', '"popo" significa "descansar"'],
    de: ['"mogu" bedeutet "speisen"', '"popo" bedeutet "ausruhen"']
};
test('3a: grounded naming relations retain unknown history across eight starts and seven languages', () => {
    const { valid } = require('../scripts/experimental/storage');
    for (const foundation of [false, true]) for (const life of [false, true]) for (const speech of ['gesture', 'short']) {
        for (const [locale, forms] of Object.entries(relationForms)) {
            let state = create({ foundation, life, speech }), world = worldApi.create();
            // Life-unknown children first acquire the two actions through actual labelled completions.
            if (!life) for (const [activity, raw] of [['eat', '食べる'], ['rest', '休む']]) {
                startRelationActivity(state, world, activity); labelLife(state, world, raw); finishLife(state, world);
            }
            const meanings = JSON.stringify(state.knowledge.meanings);
            for (const [index, activity] of ['eat', 'rest'].entries()) {
                startRelationActivity(state, world, activity);
                const result = labelLife(state, world, forms[index], { locale });
                assert.equal(result.understandings[0].complete, foundation, `${locale}:${activity}`);
                if (!foundation) {
                    assert.ok(result.relationLearning, `${locale}:${activity}`);
                    assert.equal(state.knowledge.relations.length, 0);
                    assert.equal(state.knowledge.wordExplanations, undefined);
                }
                const saved = JSON.parse(JSON.stringify({ version: 1, appearance: 'robot', state, world }));
                assert.ok(valid(saved), `pending ${locale}:${activity}`); ({ state, world } = saved);
                finishLife(state, world);
                assert.ok(valid({ ...saved, state, world }), `completed ${locale}:${activity}`);
                if (!foundation) assert.equal(state.knowledge.relations.length, index);
            }
            if (!foundation) {
                const original = JSON.stringify(state.experiences);
                const result = labelLife(state, world, forms[1], { locale });
                assert.ok(result.understandings[0].complete);
                assert.equal(result.understandings[0].relationReferences[0].evidence.length, 2);
                assert.equal(result.learning[0].updated.length, 1);
                assert.equal(say(state, forms[1], { locale, speaker: 'friend' }).understandings[0].complete, false);
                for (const raw of ['おいしかった？', '休んでね', '食べないで', '昨日は悲しかった', 'さっき間違えた。ぽぽは眠ることだよ']) {
                    assert.equal(say(state, raw).understandings[0].complete, false);
                }
                const before = JSON.stringify(state.knowledge);
                for (let i = 0; i < 3; i++) {
                    notebookApi.entries(state); assert.equal(relationLearning.learn(state).relationAcquired, false);
                }
                assert.equal(JSON.stringify(state.knowledge), before);
                assert.equal(JSON.stringify(state.experiences), original);
                assert.ok(notebookApi.entries(state).some(e => e.detail === 'note_relation_learned'));
            }
            assert.equal(JSON.stringify(state.knowledge.meanings), meanings);
        }
    }
});

test('3a: repetition, unknown content, correction, conflicting words and interrupted actions cannot acquire relations', () => {
    const state = create({ foundation: false }), world = worldApi.create();
    startRelationActivity(state, world, 'eat');
    for (const raw of ['もぐは休むことだよ', 'もぐは未知のことだよ', 'さっき間違えた。もぐは食べることだよ', '食べるは食べることだよ']) {
        assert.equal(labelLife(state, world, raw).relationLearning, undefined);
    }
    assert.equal(labelLife(state, world, relationForms.ja[0], { speaker: 'friend' }).relationLearning, undefined);
    for (let i = 0; i < 3; i++) {
        startRelationActivity(state, world, 'eat');
        for (let j = 0; j < 4; j++) labelLife(state, world, relationForms.ja[0]);
        finishLife(state, world);
    }
    assert.equal(state.knowledge.relationEvidence.length, 1);
    assert.equal(state.knowledge.relations.length, 0);
    startRelationActivity(state, world, 'rest');
    assert.equal(labelLife(state, world, 'もぐは休むことだよ').relationLearning, undefined);
    labelLife(state, world, relationForms.ja[1]);
    worldApi.approach(world, 'path');
    assert.deepEqual(world.relationLabels, []);
    assert.equal(state.knowledge.relations.length, 0);
    startRelationActivity(state, world, 'rest'); labelLife(state, world, relationForms.ja[1]); finishLife(state, world);
    assert.equal(state.knowledge.relations.length, 1);
    assert.equal(say(state, 'ぽぽは眠ることだよ').understandings[0].complete, false);
    assert.equal(say(state, relationForms.en[1], { locale: 'en' }).understandings[0].complete, false);
});

test('3a: unknown action meaning and ambiguous attention cannot be repaired by completion', () => {
    const state = create({ foundation: false, life: false }), world = worldApi.create();
    startRelationActivity(state, world, 'eat');
    labelLife(state, world, '食べる');
    assert.equal(labelLife(state, world, relationForms.ja[0]).relationLearning, undefined);
    finishLife(state, world);
    assert.ok(state.knowledge.meanings.some(m => m.id === 'eat'));
    assert.deepEqual(state.knowledge.relationEvidence, []);
    startRelationActivity(state, world, 'eat');
    api.perceive(state, { scene: 'clearing', attention: [{ id: world.attention, meaning: 'berry' }, { id: 'berry:99', meaning: 'berry' }] });
    assert.equal(labelLife(state, world, relationForms.ja[0]).relationLearning, undefined);
    finishLife(state, world);
    assert.deepEqual(state.knowledge.relationEvidence, []);
});

test('3a: saves reject forged relation scope, missing origins, altered raw input and retroactive knowledge', () => {
    const { valid } = require('../scripts/experimental/storage');
    const state = create({ foundation: false }), world = worldApi.create();
    for (const [i, activity] of ['eat', 'rest'].entries()) {
        startRelationActivity(state, world, activity); labelLife(state, world, relationForms.ja[i]); finishLife(state, world);
    }
    const value = { version: 1, appearance: 'robot', state, world };
    assert.ok(valid(value));
    for (const mutate of [
        v => { v.state.knowledge.relations[0].scope.kind = 'question'; },
        v => { v.state.knowledge.relations[0].scope.meanings.push('sleep'); },
        v => { v.state.knowledge.relations[0].source = 'initial'; },
        v => { v.state.knowledge.relationEvidence[0].experienceId = 999; },
        v => { v.state.experiences[0].relationLabels[0].subject = 'player'; },
        v => { v.state.experiences = []; },
        v => { v.world.experiences[0].relationLabels[0].raw = 'もぐは休むことだよ'; v.state.experiences[0].relationLabels[0].raw = 'もぐは休むことだよ'; },
        v => { v.world.experiences[0].relationLabels[0].at = -1; v.state.experiences[0].relationLabels[0].at = -1; }
    ]) {
        const changed = JSON.parse(JSON.stringify(value)); mutate(changed); assert.equal(!!valid(changed), false);
    }
    const legacy = { version: 1, appearance: 'robot', state: create({ foundation: false }), world: worldApi.create() };
    const before = JSON.stringify(legacy); assert.ok(valid(legacy)); assert.equal(JSON.stringify(legacy), before);
});

test('ID 2 end to end: life experience, bounded word use, correction and reload across eight starts', () => {
    const storage = require('../scripts/experimental/storage');
    for (const foundation of [false, true]) for (const life of [false, true]) for (const speech of ['gesture', 'short']) {
        let { state, world } = lifeFixture('rest', { foundation, life, speech });
        for (const raw of ['休む', '眠る', '"疲れた"']) labelLife(state, world, raw);
        finishLife(state, world);
        const meaningBefore = JSON.stringify(state.knowledge.meanings);
        const experiencesBefore = JSON.stringify(state.experiences);
        const relationsBefore = JSON.stringify(state.knowledge.relations);
        const definition = labelLife(state, world, 'ぽぽは休むことだよ');
        assert.equal(definition.understandings[0].complete, foundation);
        if (!foundation) {
            assert.equal(state.knowledge.wordExplanations, undefined);
            assert.equal(say(state, '「ぽぽ」しよう').understandings[0].complete, false);
        } else {
            assert.equal(definition.learning[0].updated.length, 1);
            assert.equal(say(state, 'ぽぽは休むことだよ').learning[0].updated.length, 0);
            const applied = say(state, '「ぽぽ」しよう');
            assert.equal(applied.understandings[0].known.meaning, 'rest');
            assert.equal(applied.understandings[0].applications[0].candidates[0].inputId, definition.input.id);
            const response = worldApi.respond(world, applied, state);
            assert.equal(response.message, speech === 'short' ? 'join' : 'attend');
            // Persist a definition before correcting it, not just after.
            const value = JSON.parse(JSON.stringify({ version: 1, appearance: 'robot', state, world }));
            assert.ok(storage.valid(value)); ({ state, world } = value);
            const correction = labelLife(state, world, 'さっき間違えた。ぽぽは休むことじゃなくて、眠ることだよ');
            assert.equal(correction.understandings[0].corrects, definition.input.id);
            assert.equal(state.knowledge.wordExplanations[0].retractedBy, correction.input.id);
            assert.equal(say(state, 'ぽぽ').understandings[0].known.meaning, 'sleep');
            assert.ok(notebookApi.entries(state).some(e => e.withdrawn && e.literal === 'ぽぽ → 休む'));
            assert.ok(notebookApi.entries(state).some(e => !e.withdrawn && e.literal === 'ぽぽ → 眠る'));
            const notes = notebookApi.displayEntries(notebookApi.groupedEntries(state), 12);
            assert.ok(notes.findIndex(e => e.sourceId === definition.input.id) < notes.findIndex(e => e.corrects === definition.input.id));
            assert.ok(storage.valid(JSON.parse(JSON.stringify(value))));
        }
        assert.equal(JSON.stringify(state.knowledge.meanings), meaningBefore);
        assert.equal(JSON.stringify(state.experiences), experiencesBefore);
        assert.equal(JSON.stringify(state.knowledge.relations), relationsBefore);
    }
});

test('word application respects speaker, scene, individual scope and never reinforces itself', () => {
    const state = create(); focus(state);
    say(state, 'ぽぽは休むことだよ');
    const before = JSON.stringify(state.knowledge);
    for (let i = 0; i < 15; i++) { say(state, 'ぽぽ'); notebookApi.entries(state); }
    assert.equal(JSON.stringify(state.knowledge), before);
    assert.equal(say(state, 'ぽぽ', { speaker: 'friend' }).understandings[0].known.meaning, undefined);
    focus(state, 'elsewhere');
    assert.equal(say(state, 'ぽぽ').understandings[0].known.meaning, 'rest'); // same individual
    api.perceive(state, { scene: 'elsewhere', attention: [{ id: 'berry:2', meaning: 'berry' }] });
    assert.equal(say(state, 'ぽぽ').understandings[0].known.meaning, undefined);
    say(state, 'ぽぽは眠ることだよ');
    assert.equal(say(state, 'ぽぽ').understandings[0].known.meaning, 'sleep');
    focus(state); // original object and scene retain the original supported explanation
    assert.equal(say(state, 'ぽぽ').understandings[0].known.meaning, 'rest');
});

test('explicit replacement can revise an individual naming source without deleting the object experience', () => {
    const { state, world } = lifeFixture('eat', { life: true });
    focus(state); const name = say(state, 'これをぽぽって呼ぼう');
    api.perceive(state, { scene: 'clearing', attention: [{ id: 'berry:2', meaning: 'berry' }] });
    assert.equal(say(state, 'さっきは間違えた。ぽぽは休むことだよ').understandings[0].complete, false);
    assert.equal(state.knowledge.associations[0].evidence[0].retractedBy, undefined);
    focus(state);
    finishLife(state, world);
    const experiences = JSON.stringify(state.experiences);
    const correction = say(state, 'さっきは間違えた。ぽぽは休むことだよ');
    assert.equal(correction.understandings[0].corrects, name.input.id);
    assert.equal(state.knowledge.associations[0].evidence[0].retractedBy, correction.input.id);
    assert.equal(JSON.stringify(state.experiences), experiences);
    assert.equal(say(state, 'ぽぽ').understandings[0].known.meaning, 'rest');
    assert.ok(api.validWordLearning(JSON.parse(JSON.stringify(state))));
});

test('corrections target only one supported explanation; ambiguity and unknown relations remain unresolved', () => {
    const state = create(); focus(state);
    say(state, 'ぽぽは休むことだよ'); say(state, 'ぽぽは木の実のことだよ');
    const before = JSON.stringify(state.knowledge);
    assert.equal(say(state, 'ぽぽ').understandings[0].complete, false);
    assert.equal(say(state, 'さっき間違えた。ぽぽは眠ることだよ').understandings[0].complete, false);
    assert.equal(JSON.stringify(state.knowledge), before);
    const fixed = say(state, 'さっき間違えた。ぽぽは休むことじゃなくて、眠ることだよ');
    assert.ok(fixed.understandings[0].complete);
    assert.equal(state.knowledge.wordExplanations.filter(e => !e.retractedBy).length, 2);
    assert.ok(state.knowledge.wordExplanations.some(e => e.meaning === 'berry' && !e.retractedBy));
    assert.equal(say(state, 'ぽぽ').understandings[0].complete, false); // still two valid meanings
    for (const options of [{ speaker: 'friend' }, {}]) {
        const result = say(state, 'さっき間違えた。ぽぽは未知の動作のことだよ', options);
        assert.equal(result.understandings[0].complete, false);
    }
    assert.equal(state.knowledge.wordExplanations.length, 3);
    state.knowledge.relations = state.knowledge.relations.filter(r => r.id !== 'correction');
    assert.equal(say(state, 'さっき間違えた。ぽぽは木の実のことじゃなくて、食べることだよ').understandings[0].complete, false);
    assert.equal(state.knowledge.wordExplanations.length, 3);
});

test('seven language definitions, applications and corrections preserve literal words and scope', () => {
    for (const [locale, define, use, correct] of [
        ['ja', 'ぽぽは休むことだよ', '「ぽぽ」しよう', 'さっき間違えた。ぽぽは眠ることだよ'],
        ['en', '"ぽぽ" means "rest"', 'let\'s "ぽぽ"', 'I was wrong. "ぽぽ" means "sleep"'],
        ['zh-CN', '“ぽぽ”的意思是“休息”', '一起“ぽぽ”吧', '刚才说错了。“ぽぽ”的意思是“睡觉”'],
        ['ru', '"ぽぽ" значит "отдых"', 'давай "ぽぽ"', 'Я ошибся. "ぽぽ" значит "спать"'],
        ['es-ES', '"ぽぽ" significa "descansar"', 'vamos a "ぽぽ"', 'Me equivoqué. "ぽぽ" significa "dormir"'],
        ['pt-BR', '"ぽぽ" significa "descansar"', 'vamos "ぽぽ"', 'Eu errei. "ぽぽ" significa "dormir"'],
        ['de', '"ぽぽ" bedeutet "ausruhen"', 'lass uns "ぽぽ"', 'Ich habe mich geirrt. "ぽぽ" bedeutet "schlafen"']
    ]) {
        const state = create();
        const first = say(state, define, { locale });
        assert.equal(first.learning[0].updated.length, 1, locale);
        assert.equal(say(state, use, { locale }).understandings[0].known.meaning, 'rest', locale);
        assert.equal(say(state, correct, { locale }).understandings[0].corrects, first.input.id, locale);
        assert.equal(say(state, 'ぽぽ', { locale }).understandings[0].known.meaning, 'sleep', locale);
        assert.equal(state.knowledge.wordExplanations[1].word, 'ぽぽ');
        assert.ok(api.validWordLearning(JSON.parse(JSON.stringify(state))), locale);
    }
});

test('word save validation rejects broken provenance and correction chains without upgrading legacy saves', () => {
    const state = create(); say(state, 'ぽぽは休むことだよ');
    say(state, 'さっき間違えた。ぽぽは眠ることだよ');
    assert.ok(api.validWordLearning(state));
    for (const mutate of [s => s.knowledge.wordExplanations[0].speaker = 'someone',
        s => s.knowledge.wordExplanations[0].scope.scene = 'other',
        s => s.knowledge.wordExplanations[1].corrects = 'input:999',
        s => s.knowledge.wordExplanations[0].retractedBy = 'input:999',
        s => s.records.splice(0, 1), s => s.knowledge.wordExplanations[1].basis.id = 'sweet',
        s => s.knowledge.wordExplanations.push(s.knowledge.wordExplanations[0])]) {
        const altered = JSON.parse(JSON.stringify(state)); mutate(altered);
        assert.equal(api.validWordLearning(altered), false);
    }
    const old = create(); const before = JSON.stringify(old);
    assert.ok(api.validWordLearning(old)); assert.equal(JSON.stringify(old), before);
});

test('word definitions cannot smuggle negation, unknown senses or hypothetical actions into use', () => {
    const state = create(); say(state, 'ぽぽは休むことだよ');
    for (const raw of ['ぽぽは未知の感覚のことだよ', '休むは食べることだよ', 'ぽぽは休むことだよ？',
        '「ぽぽ」しないで', '疲れたら「ぽぽ」しよう', 'あの人が「ぽぽ」しよう', '「ぽぽ」しよう。知らないこともして']) {
        const result = say(state, raw);
        assert.ok(result.understandings.some(u => !u.complete), raw);
        assert.ok(!result.learning.some(l => l.updated.length), raw);
    }
    assert.equal(state.knowledge.wordExplanations.length, 1);
});

test('contrast correction and conflicting individual explanations cannot silently revive old meanings', () => {
    const state = create(); focus(state);
    say(state, 'これをぽぽって呼ぼう'); say(state, 'ぽぽは休むことだよ');
    assert.equal(say(state, 'ぽぽ').understandings[0].complete, false);
    say(state, 'ぽぽは木の実のことじゃなくて、眠ることだよ');
    assert.ok(state.knowledge.associations[0].evidence[0].retractedBy);
    assert.equal(say(state, 'ぽぽ').understandings[0].complete, false, 'other explanation still competes');
    const second = say(state, 'ぽぽは休むことじゃなくて、眠ることだよ');
    assert.ok(second.understandings[0].complete);
    assert.equal(say(state, 'ぽぽ').understandings[0].known.meaning, 'sleep');
    const unchanged = JSON.stringify(state.knowledge);
    say(state, 'さっき間違えた。ぽぽは眠ることだよ');
    assert.equal(JSON.stringify(state.knowledge), unchanged);
    assert.ok(api.validWordLearning(state));
    // Moving to another individual in the same scene does not expand the scope.
    api.perceive(state, { scene: 'clearing', attention: [{ id: 'berry:2', meaning: 'berry' }] });
    assert.equal(api.wordApplication(state, 'ぽぽ', 'player').adopted, null);
});
test('life labels connect objects actions and senses across eight starts only on completion', () => {
    for (const foundation of [false, true]) for (const life of [false, true]) for (const speech of ['gesture', 'short']) {
        for (const activity of ['eat', 'rest']) {
            const { state, world } = lifeFixture(activity, { foundation, life, speech });
            const relations = JSON.stringify(state.knowledge.relations);
            const ids = activity === 'eat' ? ['berry', 'food', 'eat', 'sweet', 'hungry'] : ['rest', 'sleep', 'tired'];
            for (const id of ids) {
                const word = catalog.meanings[id][0];
                const result = labelLife(state, world, ['hungry', 'tired'].includes(id) ? `"${word}"` : word);
                assert.ok(result.lifeLearning);
                assert.equal(state.knowledge.meanings.some(m => m.id === id), life);
            }
            const event = finishLife(state, world);
            for (const id of ids) {
                const meaning = state.knowledge.meanings.find(m => m.id === id);
                assert.equal(meaning.source, life ? 'initial' : 'experienced_life');
                if (!life) {
                    assert.equal(meaning.evidence[0].experienceId, event.id);
                    assert.equal(meaning.evidence[0].scope.target, event.target);
                    assert.equal(meaning.evidence[0].scope.subject, 'self');
                }
            }
            assert.equal(JSON.stringify(state.knowledge.relations), relations);
            assert.ok(lifeLearning.valid(state, world));
            const before = JSON.stringify(state);
            lifeLearning.learn(state, event.id); notebookApi.entries(state);
            assert.equal(JSON.stringify(state), before);
        }
    }
});
test('life learning rejects questions reports negation conditions wrong senses and absent labels', () => {
    for (const raw of ['甘い？', '甘くない', '私は甘いものが好き', '疲れたら休んで', '甘い 食べる', '食べるよ', '疲れた', 'おなかがすいた']) {
        const { state, world } = lifeFixture();
        assert.equal(labelLife(state, world, raw).lifeLearning, undefined);
        finishLife(state, world);
        assert.equal(state.knowledge.meanings.length, 0);
    }
    for (const change of [{ mode: 'observe' }, { attention: 'berry:2', mode: 'rest' }, { mealTaste: null }, { mealTaste: { quality: 'bitter' } }]) {
        const { state, world } = lifeFixture(); Object.assign(world, change);
        assert.equal(labelLife(state, world, '甘い').lifeLearning, undefined);
    }
    const { state, world } = lifeFixture();
    assert.equal(labelLife(state, world, '甘い', { speaker: 'someone' }).lifeLearning, undefined);
    finishLife(state, world); assert.equal(state.knowledge.meanings.length, 0);
});
test('life labels use existing seven language terms and keep relations unknown', () => {
    for (const [locale, raw] of [['ja', '甘い'], ['en', 'sweet'], ['zh-CN', '甜'], ['ru', 'сладкий'], ['es-ES', 'dulce'], ['pt-BR', 'doce'], ['de', 'süß']]) {
        const { state, world } = lifeFixture('eat', { foundation: false });
        labelLife(state, world, raw, { locale }); finishLife(state, world);
        assert.equal(state.knowledge.meanings[0].id, 'sweet');
        assert.equal(state.knowledge.meanings[0].evidence[0].scope.label, raw);
        assert.equal(state.knowledge.relations.length, 0);
    }
});
test('life labels survive mid-action saving, reject altered sources and do not retrofit old experiences', () => {
    const store = require('../scripts/experimental/storage');
    let { state, world } = lifeFixture();
    labelLife(state, world, '甘い'); labelLife(state, world, '甘い');
    assert.equal(world.lifeLabels.length, 1);
    let value = JSON.parse(JSON.stringify({ version: 1, appearance: 'robot', state, world }));
    assert.ok(store.valid(value));
    ({ state, world } = value); const event = finishLife(state, world);
    assert.ok(store.valid(value));
    for (const mutate of [v => v.state.knowledge.meanings[0].evidence[0].scope.subject = 'player',
        v => delete v.state.knowledge.meanings[0].evidence[0].scope,
        v => v.state.experiences[0].lifeLabels[0].target = 'berry:2',
        v => v.world.experiences[0].taste.quality = 'bitter',
        v => v.state.experiences[0].lifeLabels = {}]) {
        const altered = JSON.parse(JSON.stringify(value)); mutate(altered); assert.equal(store.valid(altered), false);
    }
    delete state.experiences[0].lifeLabels; delete world.experiences[0].lifeLabels;
    state.knowledge.meanings = [];
    assert.equal(lifeLearning.learn(state, event.id).updated.length, 0);
    assert.ok(store.valid(value));
});
test('interrupted rest drops pending life labels and does not teach from later rest', () => {
    const { state, world } = lifeFixture('rest'); labelLife(state, world, '休む');
    assert.ok(worldApi.approach(world, 'path'));
    assert.deepEqual(world.lifeLabels, []);
    assert.equal(state.knowledge.meanings.length, 0);
});

test('shared experience learning separates candidates, adoption and updates without teaching relations', () => {
    const rule = { id: 'eat', source: 'test_demonstration', activity: 'eat',
        demonstration: 'test_label', result: 'test_finished' };
    for (const foundation of [false, true]) for (const life of [false, true]) for (const speech of ['gesture', 'short']) {
        const state = create({ foundation, life, speech });
        const relations = JSON.stringify(state.knowledge.relations);
        const event = { id: 1, kind: 'experience', activity: 'eat', start: 3, end: 8,
            demonstration: 'test_label', result: 'test_finished' };
        assert.equal(api.learnExperience(state, 1, [rule]).updated.length, 0, 'no original experience');
        state.experiences = [event];
        const before = JSON.stringify(state.knowledge);
        assert.equal(api.experienceCandidates(state, 1, [rule]).length, 1);
        assert.equal(JSON.stringify(state.knowledge), before, 'forming candidates is read-only');
        const ambiguous = api.learnExperience(state, 1, [rule, { ...rule, source: 'conflicting' }]);
        assert.equal(ambiguous.adopted.length, 0);
        assert.equal(JSON.stringify(state.knowledge), before);
        const learned = api.learnExperience(state, 1, [rule]);
        assert.equal(learned.adopted.length, 1);
        assert.equal(learned.updated.length, life ? 0 : 1, 'initial knowledge is not relabelled');
        assert.equal(learned.relationAcquired, false);
        assert.equal(JSON.stringify(state.knowledge.relations), relations);
        const restored = JSON.parse(JSON.stringify(state));
        assert.equal(api.learnExperience(restored, 1, [rule]).updated.length, 0);
        assert.ok(api.validExperienceLearning(restored, [rule]));
        if (!life) {
            assert.deepEqual(restored.knowledge.meanings[0].evidence[0].scope,
                { subject: 'self', activity: 'eat', result: 'test_finished' });
            restored.knowledge.meanings[0].evidence[0].scope.subject = 'player';
            assert.equal(api.validExperienceLearning(restored, [rule]), false);
        }
    }
});

test('experience learning rejects missing labels, unfinished events and ambiguous original IDs', () => {
    const state = create({ life: false });
    const rule = { id: 'eat', source: 'test_demonstration', activity: 'eat', demonstration: 'test_label', result: 'done' };
    const event = { id: 1, kind: 'experience', activity: 'eat', demonstration: 'test_label', result: 'done', start: 2, end: 7 };
    for (const change of [{ demonstration: null }, { kind: 'speaker_report' }, { result: 'other' }, { end: 1 }, { end: undefined }]) {
        state.experiences = [{ ...event, ...change }];
        assert.equal(api.learnExperience(state, 1, [rule]).updated.length, 0);
    }
    state.experiences = [event, { ...event }];
    assert.equal(api.learnExperience(state, 1, [rule]).updated.length, 0);
    state.experiences = [event]; api.learnExperience(state, 1, [rule]);
    const evidence = state.knowledge.meanings[0].evidence;
    evidence.push({ ...evidence[0] });
    assert.equal(api.validExperienceLearning(state, [rule]), false);
    evidence.pop(); delete evidence[0].scope;
    assert.ok(api.validExperienceLearning(state, [rule]), 'old evidence stays valid without manufactured scope');
    state.experiences[0].demonstration = null;
    assert.equal(api.validExperienceLearning(state, [rule]), false);
});

test('external reports distinguish heard time, event, feeling and unresolved real details', () => {
    const state = create(), world = worldApi.create();
    const knowledge = JSON.stringify(state.knowledge), experiences = JSON.stringify(world.experiences);
    const result = say(state, '昨日は量子実験で失敗して悲しかった', { at: 123 });
    const u = result.understandings[0];
    assert.deepEqual(u.known, { meaning: 'sad', eventMeaning: 'failure' });
    assert.equal(u.subject, 'player'); assert.equal(u.eventTime, 'yesterday');
    assert.deepEqual(u.unresolved, [{ type: 'detail', token: '量子実験' }]);
    assert.equal(u.reportSource.heardAt, 123);
    assert.equal(worldApi.respond(world, result, state).message, 'heard_feeling_partial');
    assert.equal(state.context.lastOutput.topic, null);
    assert.equal(JSON.stringify(state.knowledge), knowledge);
    assert.equal(JSON.stringify(world.experiences), experiences);
    const prior = state.records.length;
    const echo = say(state, 'そう、その話');
    assert.equal(echo.understandings[0].reportReference.inputId, result.input.id);
    assert.equal(echo.understandings[0].eventTime, 'yesterday');
    assert.equal(echo.understandings[0].complete, false);
    assert.equal(state.records.length, prior);
    assert.equal(worldApi.respond(world, echo, state).message, 'heard_feeling_partial');
});

test('event-to-feeling continuation keeps original report through JSON and never creates own work', () => {
    let state = create(); const world = worldApi.create();
    const event = say(state, '昨日は仕事で失敗した', { at: 321 });
    assert.equal(worldApi.respond(world, event, state).message, 'heard_event_partial');
    state = JSON.parse(JSON.stringify(state));
    const extension = say(state, 'それで悲しかった');
    const u = extension.understandings[0];
    assert.equal(u.known.meaning, 'sad'); assert.equal(u.eventTime, 'yesterday');
    assert.equal(u.timeSource, 'report_reference'); assert.equal(u.reportReference.inputId, event.input.id);
    assert.equal(u.reportReference.heardAt, 321); assert.equal(u.unresolved[0].token, '仕事');
    worldApi.respond(world, extension, state);
    const echo = say(state, 'そのことだよ'); worldApi.respond(world, echo, state);
    assert.equal(echo.understandings[0].reportReference.inputId, event.input.id);
    assert.equal(world.experiences.length, 0); assert.equal(state.records.length, 2);
    assert.ok(worldApi.validContext(state, world));
    const damaged = JSON.parse(JSON.stringify(state));
    damaged.context.turns.at(-1).understandings[0].reportReference.inputId = 'input:999';
    assert.equal(worldApi.validContext(damaged, world), false);
    delete state.context.lastOutput;
    assert.ok(worldApi.validContext(state, world));
});

test('all eight settings preserve report comprehension independently of spoken expression', () => {
    for (const foundation of [false, true]) for (const life of [false, true]) for (const speech of ['short', 'gesture']) {
        const state = create({ foundation, life, speech }), world = worldApi.create();
        const before = JSON.stringify(state.knowledge);
        const report = say(state, '今日は仕事で失敗して悲しかった');
        const response = worldApi.respond(world, report, state);
        assert.equal(response.message === 'heard_feeling_partial', foundation && life && speech === 'short');
        const echo = say(state, 'その話だよ');
        assert.equal(!!echo.understandings[0].reportReference, foundation && life);
        assert.equal(JSON.stringify(state.knowledge), before);
        assert.equal(world.experiences.length, 0);
    }
});

test('report continuation does not cross speaker, topic, unknown relation or unsupported scope', () => {
    for (const interruption of ['今何してるの？', 'よく分からない言葉', '悲しくない', '彼は悲しかった', '悲しかったら休もう', '悲しかった。うれしい']) {
        const state = create(), world = worldApi.create();
        worldApi.respond(world, say(state, '昨日は悲しかった'), state);
        worldApi.respond(world, say(state, interruption), state);
        assert.equal(say(state, 'その話だよ').understandings[0].reportReference, undefined, interruption);
    }
    const state = create(); say(state, '昨日は悲しかった');
    assert.equal(say(state, 'その話だよ', { speaker: 'other' }).understandings[0].reportReference, undefined);
    for (const text of ['私は昨日は仕事で失敗して悲しかった？', '彼は今日は仕事で失敗して悲しかった',
        '今日は彼が仕事で失敗して悲しかった', 'そのことで悲しかったら休もう']) {
        assert.notEqual(say(create(), text).understandings[0].kind, 'report', text);
    }
});

test('past and present contrast remains separate and unknown details do not become known by echo', () => {
    const state = create();
    const result = say(state, '昨日は悲しかったけど、今はうれしい');
    assert.equal(result.understandings.length, 2);
    assert.deepEqual(result.understandings.map(u => [u.known.meaning, u.eventTime]), [['sad', 'yesterday'], ['happy', 'now']]);
    assert.equal(say(state, 'その話だよ').understandings[0].reportReference, undefined);
    for (const text of ['今日は仕事で成功してうれしかった', '今はつらい', '私は疲れている']) {
        const s = create(), w = worldApi.create(), r = say(s, text);
        assert.equal(r.understandings[0].kind, 'report', text);
        assert.ok(['heard_feeling_partial', 'heard_feeling'].includes(worldApi.respond(w, r, s).message));
    }
});

test('report ellipsis stops at intervening observations and old reports gain no retroactive source', () => {
    const state = create(), world = worldApi.create();
    worldApi.respond(world, say(state, '昨日は悲しかった'), state);
    const event = { id: 6, kind: 'experience', activity: 'eat', target: 'berry:1' };
    world.experiences.push({ ...event, kind: 'eat' });
    worldApi.onArrival(world, state, event);
    assert.equal(say(state, 'その話だよ').understandings[0].reportReference, undefined);
    const old = create(); say(old, '昨日は悲しかった');
    delete old.context.turns[0].understandings[0].reportSource;
    assert.equal(say(old, 'その話だよ').understandings[0].reportReference, undefined);
    const punctuated = create(); say(punctuated, '昨日は仕事で失敗した');
    assert.equal(say(punctuated, 'それで悲しかった。').understandings[0].eventTime, 'yesterday');
});

test('seven languages share report continuation and retain the original input evidence', () => {
    const cases = [['ja', '悲しい', 'そう、その話'], ['en', 'I am sad', "Yes, that is what I meant"],
        ['zh-CN', '我很难过', '对，我说的就是这件事'], ['ru', 'мне грустно', 'да, я об этом'],
        ['es-ES', 'estoy triste', 'sí, a eso me refiero'], ['pt-BR', 'estou triste', 'sim, é disso que estou falando'],
        ['de', 'ich bin traurig', 'ja, das meine ich']];
    for (const [locale, text, followup] of cases) {
        const state = create(), world = worldApi.create();
        const first = say(state, text, { locale }); worldApi.respond(world, first, state);
        const next = say(state, followup, { locale });
        assert.equal(next.understandings[0].reportReference?.inputId, first.input.id, locale);
        assert.equal(next.input.raw, followup); assert.equal(state.records.length, 1);
        assert.equal(worldApi.respond(world, next, state).message, 'receive_sadness');
    }
});

test('context clarification composes meaning, ellipsis and paraphrase with the delivered life topic', () => {
    const state = create(), world = worldApi.create();
    const ask = text => worldApi.respond(world, say(state, text), state);
    assert.equal(ask('今何してるの？').message, 'taking_break');
    const before = JSON.stringify({ knowledge: state.knowledge, records: state.records, world });
    for (const text of ['一息って？', 'ひと息ってどういうこと？', 'つまり休んでいるということ？', 'それってどういうこと？', '休憩？']) {
        const result = say(state, text);
        assert.equal(result.understandings[0].complete, true, text);
        assert.equal(result.understandings[0].questionSlot, 'context_detail', text);
        assert.equal(worldApi.respond(world, result, state).message, 'break_explained');
        assert.equal(state.context.lastOutput.source.message, 'taking_break');
    }
    assert.equal(JSON.stringify({ knowledge: state.knowledge, records: state.records, world }), before);
    assert.equal(ask('もう一度教えて').message, 'break_explained');
});

test('context taste confirmation keeps the original experience across newer meals and save resumption', () => {
    const state = create(), world = worldApi.create();
    world.experiences.push({ id: 8, kind: 'eat', target: 'berry:1', taste: { quality: 'sweet', pleasant: true } });
    assert.equal(worldApi.respond(world, say(state, 'おいしかった？'), state).message, 'tasted_good');
    world.experiences.push({ id: 9, kind: 'eat', target: 'berry:2', taste: { quality: 'bitter', pleasant: false } });
    const restored = JSON.parse(JSON.stringify(state));
    const result = say(restored, '甘いの？');
    assert.equal(result.understandings[0].contextReference.evidence.experienceId, 8);
    assert.equal(result.understandings[0].eventTime, 'past');
    assert.equal(worldApi.respond(world, result, restored).message, 'tasted_good');
    assert.equal(worldApi.respond(world, say(restored, 'おいしかった？'), restored).message, 'taste_unsure');
    assert.equal(say(restored, '甘いの？').understandings[0].contextReference, undefined);
});

test('all locales share semantic context resolution and retain raw input', () => {
    const cases = [
        ['ja', '一息って？', '甘いの？', 'それってどういうこと？'], ['en', 'What do you mean by a break?', 'Is it sweet?', 'What does that mean?'],
        ['zh-CN', '休息是什么意思？', '甜吗？', '那是什么意思？'], ['ru', 'Что значит отдых?', 'Это сладкий?', 'Что это значит?'],
        ['es-ES', '¿Qué significa descanso?', '¿Es dulce?', '¿Qué significa eso?'], ['pt-BR', 'O que significa pausa?', 'É doce?', 'O que isso significa?'],
        ['de', 'Was bedeutet Pause?', 'Ist es süß?', 'Was bedeutet das?']
    ];
    for (const [locale, rest, sweet, omitted] of cases) {
        const state = create(), world = worldApi.create();
        worldApi.respond(world, say(state, '今何してるの？'), state);
        let result = say(state, rest, { locale });
        assert.equal(result.input.raw, rest);
        assert.equal(worldApi.respond(world, result, state).message, 'break_explained', locale);
        assert.equal(worldApi.respond(world, say(state, omitted, { locale }), state).message, 'break_explained', locale);
        world.mode = 'eat'; world.mealTaste = { quality: 'sweet', pleasant: true };
        worldApi.respond(world, say(state, 'おいしい？'), state);
        result = say(state, sweet, { locale });
        assert.equal(result.understandings[0].complete, true, locale);
        assert.equal(worldApi.respond(world, result, state).message, 'tastes_good', locale);
    }
});

test('all eight settings preserve unknown meanings, relations and gesture expression in follow-ups', () => {
    for (const foundation of [false, true]) for (const life of [false, true]) for (const speech of ['short', 'gesture']) {
        const state = create({ foundation, life, speech }), world = worldApi.create();
        const knowledge = JSON.stringify(state.knowledge);
        worldApi.respond(world, say(state, '今何してるの？'), state);
        const result = say(state, '一息って？');
        const response = worldApi.respond(world, result, state);
        assert.equal(response.message === 'break_explained', foundation && life && speech === 'short');
        assert.equal(JSON.stringify(state.knowledge), knowledge);
    }
    const state = create(), world = worldApi.create();
    worldApi.respond(world, say(state, '今何してるの？'), state);
    state.knowledge.meanings = state.knowledge.meanings.filter(m => m.id !== 'rest');
    const result = say(state, '一息って？');
    assert.equal(result.understandings[0].complete, false);
    assert.notEqual(worldApi.respond(world, result, state).message, 'break_explained');
});

test('context does not strip other subjects, negation, conditions, unknown clauses or new times', () => {
    for (const text of ['私は休んでいるの？', 'プレイヤーは休んでいるの？', '休んでいないの？',
        '疲れたら休むってこと？', '一息って？私は悲しい', '休むし魔法を使うってこと？', '今も甘いの？', '昨日も一息って？']) {
        const state = create(), world = worldApi.create();
        worldApi.respond(world, say(state, '今何してるの？'), state);
        assert.ok(!say(state, text).understandings.some(u => u.contextReference), text);
    }
    for (const intervening of ['私は悲しい', '未知のこと', 'おはよう']) {
        const state = create(), world = worldApi.create();
        worldApi.respond(world, say(state, '今何してるの？'), state);
        worldApi.respond(world, say(state, intervening), state);
        assert.equal(say(state, '一息って？').understandings[0].contextReference, undefined);
    }
    const state = create(), world = worldApi.create();
    worldApi.respond(world, say(state, '今何してるの？'), state);
    assert.equal(say(state, '一息って？', { speaker: 'other' }).understandings[0].contextReference, undefined);
});

test('observation provenance never becomes the character claiming a feeling or reason', () => {
    const state = create(), world = worldApi.create();
    worldApi.respond(world, say(state, '今何してるの？'), state);
    const event = { id: 6, kind: 'experience', activity: 'eat', target: 'berry:1' };
    world.experiences.push({ ...event, kind: 'eat' });
    assert.equal(worldApi.onArrival(world, state, event).observation, true);
    const saved = JSON.parse(JSON.stringify(state));
    assert.notEqual(say(saved, 'もう一度教えて').understandings[0].questionSlot, 'repeat_answer');
    const result = say(state, 'ほっとしたの？');
    assert.equal(result.understandings[0].contextReference.source.kind, 'observation');
    assert.equal(result.understandings[0].complete, false, 'no relief meaning is secretly taught');
    assert.deepEqual(worldApi.respond(world, result, state), { message: 'observed_feeling_unknown', observation: true });
    assert.ok(!state.context.turns.at(-1).answer);
    worldApi.onArrival(world, state, event);
    const factual = say(state, 'それってどういうこと？');
    assert.equal(worldApi.respond(world, factual, state).message, 'ate');
    assert.equal(state.context.lastOutput.source.kind, 'observation', 'original source survives a grounded factual answer');
});

test('current sensory statements become past clarification if the referenced activity changed', () => {
    const state = create(), world = worldApi.create();
    world.mode = 'eat'; world.mealTaste = { quality: 'sweet', pleasant: true };
    worldApi.respond(world, say(state, 'おいしい？'), state);
    world.mode = 'move'; world.activityStart = 10; world.mealTaste = null;
    const result = say(state, '甘いの？');
    assert.equal(result.understandings[0].contextReference.eventTime, 'present', 'original time is retained');
    assert.equal(worldApi.respond(world, result, state).message, 'tasted_good', 'not a claim about current food');
});

test('an omitted taste topic can use the observed meal but cannot invent its missing taste', () => {
    for (const hasTaste of [true, false]) {
        const state = create(), world = worldApi.create();
        const event = { id: 1, kind: 'experience', activity: 'eat', target: 'berry:1',
            ...(hasTaste ? { taste: { quality: 'sweet', pleasant: true } } : {}) };
        world.experiences.push({ ...event, kind: 'eat' });
        worldApi.onArrival(world, state, event);
        const result = say(state, '甘いの？');
        assert.equal(result.understandings[0].contextReference.source.kind, 'observation');
        assert.equal(worldApi.respond(world, result, state).message, hasTaste ? 'tasted_good' : 'taste_unsure');
        if (hasTaste) {
            assert.equal(worldApi.respond(world, say(state, 'それってどういうこと？'), state).message, 'tasted_good');
            assert.equal(state.context.lastOutput.source.kind, 'observation');
        }
    }
});

test('context save validation rejects malformed or missing evidence and leaves legacy context absent', () => {
    const { valid } = require('../scripts/experimental/storage');
    const state = create(), world = worldApi.create();
    const save = { version: 1, appearance: 'robot', state, world };
    assert.ok(valid(save)); assert.equal(state.context.lastOutput, undefined);
    worldApi.respond(world, say(state, '今何してるの？'), state);
    assert.ok(valid(JSON.parse(JSON.stringify(save))));
    for (const mutate of [f => { f.meanings = null; }, f => { f.source.kind = 'player_report'; },
        f => { f.evidence.experienceId = 999; }, f => { f.serial++; }]) {
        const damaged = JSON.parse(JSON.stringify(save)); mutate(damaged.state.context.lastOutput);
        assert.equal(!!valid(damaged), false);
    }
    delete state.context.lastOutput;
    world.mode = 'eat'; world.activityStart = 9;
    worldApi.respond(world, say(state, 'もう一度教えて'), state);
    assert.equal(state.context.lastOutput.topic, null, 'a legacy answer cannot manufacture a snapshot of its original context');
});

test('explicit follow-ups retain the expressed answer without replacing its time or experience', () => {
    for (const [locale, text] of [['ja', 'もう一度教えて'], ['en', 'say that again'], ['zh-CN', '再说一遍'],
        ['ru', 'повтори'], ['es', 'repítelo'], ['pt-BR', 'repita'], ['de', 'sag das noch einmal']]) {
        const state = create(); const world = worldApi.create();
        world.history.push({ mode: 'eat', target: 'berry:1' });
        const first = worldApi.respond(world, say(state, '何をしたの？'), state);
        const knowledge = JSON.stringify(state.knowledge); const records = JSON.stringify(state.records);
        world.history.push({ mode: 'rest', target: 'shade' });
        const restored = JSON.parse(JSON.stringify(state));
        const result = say(restored, text, { locale });
        assert.equal(result.understandings[0].answerReference.eventTime, 'past');
        assert.deepEqual(worldApi.respond(world, result, restored), first);
        assert.equal(JSON.stringify(restored.knowledge), knowledge);
        assert.equal(JSON.stringify(restored.records), records);
        assert.equal(worldApi.respond(world, say(restored, '何をしたの？'), restored).message, 'rested');
    }
});

test('follow-ups do not borrow answers across unknown turns, speakers or starting settings', () => {
    for (const foundation of [false, true]) for (const life of [false, true]) for (const speech of ['short', 'gesture']) {
        const state = create({ foundation, life, speech }); const world = worldApi.create();
        world.history.push({ mode: 'eat' });
        worldApi.respond(world, say(state, '何をしたの？'), state);
        const result = say(state, 'もう一度教えて');
        assert.equal(result.understandings[0].questionSlot === 'repeat_answer', foundation && life && speech === 'short');
    }
    for (const intervening of [true, false]) {
        const state = create(); const world = worldApi.create(); world.history.push({ mode: 'eat' });
        worldApi.respond(world, say(state, '何をしたの？'), state);
        if (intervening) worldApi.respond(world, say(state, '未知の話題です'), state);
        const result = say(state, 'もう一度教えて', intervening ? {} : { speaker: 'other' });
        assert.notEqual(result.understandings[0].questionSlot, 'repeat_answer');
    }
});

test('situation questions compose address, time, predicate and endings without teaching facts', () => {
    for (const prefix of ['', 'ねえ、', '君は今、', 'あなたはいま']) {
        for (const ending of ['？', 'の？', 'のかな？', 'んですか', 'のでしょうか']) {
            for (const [body, slot] of [['なにしてる', 'current_activity'], ['何を見ている', 'attention'],
                ['そこにはなにがある', 'attention'], ['どこに向かってる', 'destination'], ['木陰へ向かっている', 'destination']]) {
                const state = create(); const world = worldApi.create();
                world.mode = 'move'; world.destination = 'shade';
                const input = prefix + body + ending;
                const result = say(state, input);
                assert.equal(result.understandings[0].questionSlot, slot, input);
                const knowledge = JSON.stringify(state.knowledge);
                const response = worldApi.respond(world, result, state);
                assert.equal(response.message, slot === 'destination' ? 'going_rest' : slot === 'attention' ? 'answer_unknown' : 'walking', input);
                assert.equal(JSON.stringify(state.knowledge), knowledge);
                assert.equal(world.destination, 'shade');
                assert.equal(state.records.length, 0);
            }
        }
    }
});

test('situation answers distinguish activity, attention, destination and completed history', () => {
    for (const [mode, target, expected] of [['observe', 'path', 'looking_walk'], ['observe', 'berry:6', 'looking_berry'],
        ['rest', 'shade', 'resting'], ['eat', 'berry:6', 'eating'], ['idle', null, 'taking_break']]) {
        const state = create(); const world = worldApi.create();
        Object.assign(world, { mode, attention: target, destination: 'shade' });
        assert.equal(worldApi.respond(world, say(state, 'いまなにしてるの？'), state).message, expected);
        world.history.push({ mode: 'eat', target: 'berry:5' });
        assert.equal(worldApi.respond(world, say(state, '何をしていましたか？'), state).message, 'ate');
        assert.equal(worldApi.respond(world, say(state, 'さっき何してたの？'), state).message, 'ate');
        assert.equal(worldApi.respond(world, say(state, 'どこに行くの？'), state).message, 'not_going');
    }
    const state = create(); const world = worldApi.create();
    Object.assign(world, { mode: 'move', destination: 'path', attention: null });
    assert.equal(worldApi.respond(world, say(state, '木陰に向かっているの？'), state).message, 'going_walk');
    assert.equal(worldApi.respond(world, say(state, 'そこには何がありますか？'), state).message, 'answer_unknown');
});

test('situation grammar does not erase subjects, conditions, negation or unknown knowledge', () => {
    for (const text of ['私は何してるの？', '疲れたらどこに行くの？', '木陰に向かっていないの？',
        'どこにも行かないの？', '木陰に行ってね', 'そこには道があるね', 'どこまで続いているんだろう？',
        'さっきどこに向かっているの？']) {
        assert.ok(!api.interpret(text, 'ja', catalog).some(f => f.catalogRule === 'situation_question'), text);
    }
    for (const options of [{ life: false }, { foundation: false }, { speech: 'gesture' }]) {
        const state = create(options); const world = worldApi.create();
        Object.assign(world, { mode: 'move', destination: 'shade' });
        const response = worldApi.respond(world, say(state, 'どこに向かっていますか？'), state);
        assert.ok(!['going_rest', 'walking'].includes(response.message));
        assert.equal(world.destination, 'shade');
    }
});

test('playtest phrasing preserves partial meaning and never names a place after an explanation', () => {
    const state = create(); const world = worldApi.create();
    api.perceive(state, { scene: 'clearing', attention: [{ id: 'shade', meaning: 'rest' }] });
    world.experiences.push({ kind: 'rest', before: { fatigue: .8 }, after: { fatigue: .1 } },
        { kind: 'eat', taste: { quality: 'sweet', pleasant: true } });
    const cases = [
        ['おはよ～', 'good_morning'], ['しっかりやすんだかな？', 'rest_helped'],
        ['しっかり休めた？', 'rest_helped'], ['そこに木の実落ちているね', 'heard_berry'],
        ['おいしかった？', 'tasted_good'], ['すっぱくない？', 'unknown_taste_word'],
        ['今から、木陰で休んでね', 'join'], ['横になると気持ちいいよね', 'heard_rest_comfort'],
        ['休むことは大事だよ', 'heard_rest_partial'], ['うん、体力や眠気が回復するからね', 'heard_rest_partial']
    ];
    for (const [input, response] of cases) {
        const result = say(state, input);
        assert.equal(worldApi.respond(world, result, state).message, response, input);
    }
    assert.ok(!state.knowledge.associations.some(a => a.evidence.length));
    assert.ok(!state.knowledge.meanings.some(m => m.id === 'sour'));
    for (const phrase of ['そこは休む場所だよ', '疲れがとれるんだよ', '食べるとおいしいのだよ', '休むことは大切だよ']) {
        const result = say(state, phrase);
        assert.ok(!result.learning.some(item => item.updated.length), phrase);
    }
    const fresh = create();
    assert.equal(say(fresh, 'うん、体力や眠気が回復するからね').understandings[0].complete, false);
});

test('rest variants keep negation and unknown knowledge from turning into commands', () => {
    for (const phrase of ['今から、木陰で休まないでね', '疲れたら木陰で休んでね']) {
        const state = create(); const world = worldApi.create();
        worldApi.respond(world, say(state, phrase), state);
        assert.equal(world.destination, null);
    }
    const state = create({ life: false }); const world = worldApi.create();
    worldApi.respond(world, say(state, '今から、木陰で休んでね'), state);
    assert.equal(world.destination, null);
});

test('playtest report keeps exact input, contextual traces and all notebook entries without changing learning', () => {
    const state = create(); const world = worldApi.create(); focus(state);
    const report = reportApi.create({ state, world }, 1000);
    const raw = 'ぽぽだよ\n<script>literal</script>';
    report.record('player', { text: raw, context: state.context }, 2000);
    const result = say(state, 'これはぽぽだよ');
    report.record('understanding', { result }, 2100);
    const before = JSON.stringify(state);
    const output = report.build({ state, world }, notebookApi.groupedEntries(state), {}, 3000);
    assert.equal(output.timeline[0].text, raw);
    assert.equal(output.initial.state.serial, 0);
    assert.equal(output.current.state.serial, 1);
    assert.equal(output.recording.startedAt, new Date(1000).toISOString());
    assert.equal(output.notebook[0].literal, 'ぽぽ');
    output.timeline[0].text = 'changed';
    assert.equal(report.build({}, [], {}, 3000).timeline[0].text, raw);
    assert.equal(JSON.stringify(state), before);
});

test('report export writes only a user-chosen file; cancellation and errors preserve game data', async () => {
    const { exportReport } = require('../scripts/experimental/export_report');
    const payload = { title: 'Report', text: JSON.stringify({ format: 'word-learning-playtest', version: 1 }) };
    const writes = [];
    const write = async (...args) => { writes.push(args); };
    assert.equal((await exportReport({ showSaveDialog: async () => ({ canceled: true }) }, null, payload, write)).canceled, true);
    assert.equal(writes.length, 0);
    assert.equal((await exportReport({ showSaveDialog: async () => ({ filePath: 'chosen.json' }) }, null, payload, write)).ok, true);
    assert.deepEqual(writes[0], ['chosen.json', payload.text, 'utf8']);
    assert.equal((await exportReport({ showSaveDialog: async () => ({ filePath: 'chosen.json' }) }, null, payload, async () => { throw Error('full'); })).ok, false);
});

test('natural rest question and a berry-name answer bind to the actual experience or question', () => {
    const state = create(); const world = worldApi.create(); focus(state);
    worldApi.onArrival(world, state, { kind: 'arrive', target: 'berry:1' });
    const answer = say(state, '木の実だよ');
    assert.equal(worldApi.respond(world, answer, state).message, 'name_echo');
    assert.equal(state.knowledge.associations[0].word, '木の実');
    world.experiences.push({ kind: 'rest', before: { fatigue: .7 }, after: { fatigue: .1 } });
    assert.equal(worldApi.respond(world, say(state, 'しっかり休めた？'), state).message, 'rest_helped');
    assert.equal(worldApi.respond(world, say(state, 'ゆっくり休めた？'), state).message, 'rest_helped');
});

test('notebook reading preserves sources, never turns co-occurrence into learned names', () => {
    const state = create();
    assert.deepEqual(notebookApi.entries(state), []);
    focus(state);
    say(state, 'ふわふわ');
    assert.deepEqual(notebookApi.entries(state), []);
    say(state, 'これはぽぽだよ');
    const before = JSON.stringify(state);
    const entries = notebookApi.entries(state);
    assert.equal(entries[0].literal, 'ぽぽ');
    assert.equal(entries[0].organized, false);
    assert.equal(entries[0].withdrawn, false);
    assert.deepEqual(notebookApi.entries(state), entries);
    assert.equal(JSON.stringify(state), before);
    say(state, 'さっきの説明は間違えた');
    assert.equal(notebookApi.entries(state)[0].withdrawn, true);
    assert.equal(notebookApi.entries(state)[0].literal, 'ぽぽ');
});

test('yes replies bind to explicit and recalled names without learning a name called yes', () => {
    for (const recalled of [false, true]) {
        const state = create(); const world = worldApi.create(); focus(state);
        const naming = say(state, 'これはぽぽだよ');
        worldApi.respond(world, naming, state);
        if (recalled) {
            state.context.pendingQuestion = null;
            worldApi.onArrival(world, state, { kind: 'arrive', target: 'berry:1' });
        }
        const reply = say(state, 'そうだよ');
        assert.equal(worldApi.respond(world, reply, state).message, 'name_confirmed');
        assert.ok(!state.knowledge.associations.some(a => a.word === 'そう'));
        const link = state.knowledge.associations.find(a => a.word === 'ぽぽ');
        assert.equal(link.evidence.length, 1);
        assert.ok(link.confirmedBy);
        assert.equal(notebookApi.entries(state)[0].detail, 'note_name_confirmed');
        assert.equal(worldApi.respond(world, say(state, 'ぽぽ'), state).message, 'name_known');
    }
    const state = create(); focus(state);
    say(state, 'そうだよ'); say(state, '休む場所は木陰だよ');
    assert.ok(!state.knowledge.associations.some(a => a.evidence.length));
});

test('food questions use experienced taste, respect knowledge, and do not invent old taste', () => {
    const state = create(); const world = worldApi.create(); world.hunger = .8;
    assert.equal(worldApi.respond(world, say(state, 'おいしかった？'), state).message, 'not_eaten_yet');
    world.pause = 0;
    for (let i = 0; i < 1500 && !world.experiences.some(e => e.kind === 'eat'); i++) {
        const event = worldApi.tick(world, .1);
        if (event) worldApi.onArrival(world, state, event);
    }
    for (const phrase of ['おいしかった？', '木の実はおいしかった？', 'おいしい？']) {
        assert.equal(worldApi.respond(world, say(state, phrase), state).message, 'tasted_good');
    }
    assert.ok(notebookApi.entries(state).some(e => e.detail === 'note_experienced_sweet'));
    const unknown = create({ life: false });
    assert.notEqual(worldApi.respond(world, say(unknown, 'おいしかった？'), unknown).message, 'tasted_good');
    world.experiences.filter(e => e.kind === 'eat').forEach(e => { delete e.taste; });
    assert.equal(worldApi.respond(world, say(state, 'おいしかった？'), state).message, 'taste_unsure');
});

test('notebook groups repeated outcomes without deleting or merging different meanings', () => {
    const state = create();
    state.experiences = Array.from({ length: 30 }, (_, i) => ({ id: i, activity: 'eat', before: { hunger: .8 }, after: { hunger: .2 } }));
    state.experiences.push({ id: 31, activity: 'rest', before: { fatigue: .8 }, after: { fatigue: .2 } });
    const before = JSON.stringify(state);
    const groups = notebookApi.groupedEntries(state);
    assert.equal(groups.length, 2);
    assert.equal(groups[0].count, 30);
    assert.equal(groups[1].count, 1);
    assert.equal(JSON.stringify(state), before);
});

test('notebook describes actual outcomes and separates player reports from own preferences', () => {
    const state = create({ speech: 'gesture' });
    focus(state);
    say(state, '私は木の実が好き');
    state.experiences = [{ id: 4, activity: 'eat', before: { hunger: .8 }, after: { hunger: .2 } }];
    state.notes.push({ experienceId: 4, organizedAt: 5 });
    const entries = notebookApi.entries(state);
    assert.ok(entries.some(e => e.message === 'note_player_likes' && e.detail === 'note_heard'));
    assert.ok(entries.some(e => e.message === 'note_ate' && e.organized));
    assert.ok(!JSON.stringify(entries).includes('taste'));
    const unknown = create({ life: false });
    unknown.experiences = state.experiences;
    assert.equal(notebookApi.entries(unknown)[0].message, 'note_ate_sensation');
    assert.deepEqual(unknown.knowledge.meanings, []);
});

test('notebook only retains unanswered questions the character actually understood', () => {
    const state = create();
    const world = worldApi.create();
    const result = say(state, 'どうして休んだの？');
    const reply = worldApi.respond(world, result, state);
    notebookApi.rememberQuestion(state, result, reply);
    notebookApi.rememberQuestion(state, result, reply);
    assert.equal(state.notebookQuestions.length, 1);
    assert.equal(notebookApi.entries(state)[0].literal, 'どうして休んだの？');
    const unknown = say(state, '全く対応していない文');
    notebookApi.rememberQuestion(state, unknown, { message: 'answer_unknown' });
    assert.equal(state.notebookQuestions.length, 1);
    assert.deepEqual(notebookApi.entries(JSON.parse(JSON.stringify(state))), notebookApi.entries(state));
});

test('food, recovery and sleep use actual completed episodes without granting vocabulary', () => {
    const state = create({ life: false });
    const world = worldApi.create();
    world.hunger = .8;
    const events = [];
    for (let i = 0; i < 5000; i++) {
        const event = worldApi.tick(world, .1);
        if (event) { events.push(event); worldApi.onArrival(world, state, event); }
    }
    assert.ok(events.some(e => e.kind === 'experience' && e.activity === 'eat' && e.after.hunger < e.before.hunger));
    assert.ok(events.some(e => e.kind === 'experience' && e.activity === 'rest' && e.after.fatigue < e.before.fatigue));
    assert.ok(world.recovery.eat && world.recovery.rest);
    assert.ok(state.notes.some(n => n.kind === 'experienced_change'));
    assert.deepEqual(state.knowledge.meanings, []);
    assert.ok(world.fruit >= 0 && world.fruit <= 3);
    const episode = events.find(e => e.kind === 'experience');
    const count = state.experiences.length;
    worldApi.onArrival(world, state, episode);
    assert.equal(state.experiences.length, count);
});

test('pause freezes needs and fruit; eating cannot be cancelled into a lost meal', () => {
    const world = worldApi.create();
    const before = JSON.stringify(world);
    worldApi.tick(world, 60, true);
    assert.equal(JSON.stringify(world), before);
    world.mode = 'eat'; world.dwell = 1; world.activityBefore = { hunger: .8, fatigue: .2 };
    assert.equal(worldApi.approach(world, 'shade'), false);
    assert.equal(world.mode, 'eat');
});

test('save roundtrip and backup preserve learning; corrupt and full saves stop safely', () => {
    const { createStore } = require('../scripts/experimental/storage');
    const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'word-life-test-'));
    try {
        const store = createStore(directory);
        const value = { version: 1, appearance: 'seed', state: create(), world: worldApi.create() };
        const unanswered = say(value.state, 'どうして休んだの？');
        notebookApi.rememberQuestion(value.state, unanswered, worldApi.respond(value.world, unanswered, value.state));
        assert.equal(typeof value.state.notebookQuestions[0].inputId, 'string');
        assert.equal(store.load().value, null);
        assert.equal(store.save(value).ok, true);
        value.world.hunger = .7;
        assert.equal(store.save(value).ok, true);
        assert.equal(createStore(directory).load().value.world.hunger, .7);
        assert.deepEqual(notebookApi.entries(createStore(directory).load().value.state), notebookApi.entries(value.state));
        assert.equal(JSON.parse(fs.readFileSync(path.join(directory, 'word-life.json.backup'), 'utf8')).world.hunger, .35);
        const previous = fs.readFileSync(path.join(directory, 'word-life.json'), 'utf8');
        value.state.extra = 'x'.repeat(17 * 1024 * 1024);
        assert.equal(store.save(value).ok, false);
        assert.equal(fs.readFileSync(path.join(directory, 'word-life.json'), 'utf8'), previous);
        delete value.state.extra;
        assert.equal(store.save(value).ok, false);
        fs.writeFileSync(path.join(directory, 'word-life.json'), '{broken');
        const corrupt = createStore(directory);
        assert.equal(corrupt.load().ok, false);
        assert.equal(corrupt.save(value).ok, false);
        assert.equal(fs.readFileSync(path.join(directory, 'word-life.json'), 'utf8'), '{broken');
    } finally {
        for (const file of fs.readdirSync(directory)) fs.unlinkSync(path.join(directory, file));
        fs.rmdirSync(directory);
    }
});

test('all eight settings are independent and create no fictional experiences', () => {
    for (const foundation of [true, false]) for (const life of [true, false]) for (const speech of ['short', 'gesture']) {
        const state = create({ foundation, life, speech });
        assert.equal(state.knowledge.relations.length > 0, foundation);
        assert.equal(state.knowledge.meanings.length > 0, life);
        assert.deepEqual(state.records, []); assert.deepEqual(state.notes, []);
        const result = say(state, '少し休もう');
        assert.equal(result.understandings[0].complete, foundation && life);
        assert.equal(result.expression.channel === 'speech', speech === 'short' && life);
        assert.equal(result.reaction.action, null);
    }
});

test('gestures do not erase understanding', () => {
    const short = say(create(), '疲れたら休んでね');
    const gesture = say(create({ speech: 'gesture' }), '疲れたら休んでね');
    assert.deepEqual(short.understandings, gesture.understandings);
    assert.notDeepEqual(short.expression, gesture.expression);
});

test('unknown relationship never becomes an unconditional command', () => {
    const state = create();
    state.knowledge.relations = state.knowledge.relations.filter(r => r.id !== 'sequence');
    const result = say(state, '食べ終わったら、散歩しよう');
    assert.equal(result.understandings[0].kind, 'partial');
    assert.equal(result.understandings[0].known.meaning, 'walk');
    assert.equal(result.understandings[0].conditionStatus, 'unknown');
    assert.equal(result.reaction.action, null);
});

test('conditions, requests, and action execution remain separate', () => {
    const result = say(create(), '疲れたら休んでね');
    assert.equal(result.understandings[0].complete, true);
    assert.equal(result.understandings[0].conditionStatus, 'unknown');
    assert.equal(result.reaction.action, null);
});

test('six input categories reach their respective understanding paths', () => {
    const cases = [['少し休もう', 'invitation'], ['私は木の実が好き', 'report'], ['おいしかった？', 'question'],
        ['これを、ぽぽって呼ぼう', 'naming'], ['今日は仕事で失敗して悲しかった', 'report'], ['木の実は嫌いじゃない', 'report']];
    for (const [text, kind] of cases) {
        const state = create(); focus(state);
        assert.equal(say(state, text).understandings[0].kind, kind);
    }
});

test('real-world details stay unknown while the reported feeling is received', () => {
    const result = say(create(), '今日は量子実験で失敗して悲しかった');
    const u = result.understandings[0];
    assert.equal(u.known.meaning, 'sad'); assert.equal(u.subject, 'player');
    assert.equal(u.eventTime, 'past_today'); assert.equal(u.complete, false);
    assert.ok(u.unresolved.some(item => item.token === '量子実験'));
    assert.equal(result.reaction.intent, 'receive_sadness');
});

test('negation does not invert dislike into like or desire into preference', () => {
    const result = say(create(), '木の実は嫌いじゃない。今は食べたくない');
    assert.equal(result.understandings[0].known.meaning, 'dislike');
    assert.equal(result.understandings[0].polarity, 'negative');
    assert.equal(result.understandings[1].aspect, 'desire');
    assert.equal(result.understandings[1].eventTime, 'now');
    assert.equal(result.understandings[1].polarity, 'negative');
});

test('question slots are not missing understanding; no fabricated answers', () => {
    const result = say(create(), 'どうして休んだの？');
    assert.equal(result.understandings[0].complete, true);
    assert.equal(result.understandings[0].questionSlot, 'reason');
    assert.equal(result.reaction.intent, 'answer_unknown');
    assert.equal(say(create(), 'おいしかった').understandings[0].complete, false);
    const questionState = create();
    assert.equal(say(questionState, '木の実が好き？').understandings[0].kind, 'question');
    assert.equal(questionState.records.length, 0);
});

test('naming creates tentative adoption and supported links, not grammar mastery', () => {
    const state = create(); focus(state);
    const first = say(state, 'これを、ぽぽって呼ぼう');
    assert.equal(first.learning[0].adopted.status, 'tentative');
    assert.equal(first.learning[0].updated.length, 1);
    assert.equal(first.transfer[0].relationAcquired, false);
    assert.equal(say(state, 'これを、ぽぽって呼ぼう').learning[0].updated.length, 0);
    focus(state, 'path');
    const secondScene = say(state, 'これを、ぽぽって呼ぼう');
    assert.equal(secondScene.transfer[0].scope, 'same_object_across_scenes');
    assert.equal(say(state, 'ぽぽが好き').understandings[0].target.adopted.id, 'berry:1');
});

test('ambiguous attention preserves candidates and never reinforces a guessed target', () => {
    const state = create(); focus(state, 'clearing', 2);
    const result = say(state, 'これをぽぽって呼ぼう');
    assert.equal(result.learning[0].candidates.length, 2);
    assert.equal(result.learning[0].adopted, null); assert.equal(result.learning[0].updated.length, 0);
    assert.equal(say(state, 'ぽぽが好き').understandings[0].target.adopted, null);
});

test('naming a known object word does not silently name the whole species', () => {
    const state = create(); focus(state);
    assert.equal(say(state, '木の実をぽぽって呼ぼう').learning[0].adopted.target, 'berry:1');
    focus(state, 'path', 2);
    assert.equal(say(state, '木の実をぽぽって呼ぼう').learning[0].adopted, null);
});

test('retracting one explanation leaves independent prior evidence available', () => {
    const state = create(); focus(state);
    say(state, 'これをぽぽって呼ぼう');
    focus(state, 'path'); say(state, 'これをぽぽって呼ぼう');
    say(state, 'さっきの説明は間違えた');
    assert.equal(state.knowledge.associations[0].evidence.filter(e => !e.retractedBy).length, 1);
    assert.equal(say(state, 'ぽぽが好き').understandings[0].target.adopted.id, 'berry:1');
});

test('mere co-occurrence or rereading never creates understood names', () => {
    const state = create({ foundation: false, life: false }); focus(state);
    for (let i = 0; i < 10; i++) say(state, 'ぽぽ');
    assert.equal(state.knowledge.associations.length, 1);
    assert.deepEqual(state.knowledge.associations[0].evidence, []);
    assert.deepEqual(state.knowledge.meanings, []);
    assert.deepEqual(state.knowledge.relations, []);
});

test('retraction retains evidence history but removes it from active interpretation', () => {
    const state = create(); focus(state);
    const original = say(state, 'これをぽぽって呼ぼう');
    const correction = say(state, 'さっきの説明は間違えた');
    assert.equal(correction.understandings[0].corrects, original.input.id);
    assert.equal(state.records[0].retractedBy, correction.input.id);
    assert.equal(state.knowledge.associations[0].evidence[0].retractedBy, correction.input.id);
    assert.equal(say(state, 'ぽぽが好き').understandings[0].target.adopted, null);
});

test('unrelated or missing correction antecedents are unresolved', () => {
    const state = create(); say(state, '私は木の実が好き');
    assert.equal(say(state, 'さっきの説明は間違えた').understandings[0].complete, false);
    assert.equal(state.records[0].retractedBy, undefined);
});

test('speaker-specific names coexist; literal input and names retain case', () => {
    const state = create(); focus(state);
    const result = say(state, 'これを「PoPo」って呼ぼう');
    assert.equal(result.input.raw, 'これを「PoPo」って呼ぼう');
    assert.equal(state.knowledge.associations[0].word, 'PoPo');
    assert.equal(say(state, 'PoPoが好き', { speaker: 'visitor' }).understandings[0].target.adopted, null);
});

test('context eviction never deletes selected records; recall is bounded', () => {
    const state = create(); say(state, '昨日は悲しかった');
    for (let i = 0; i < 20; i++) say(state, 'うれしい');
    assert.equal(state.context.turns.length, api.RULES.contextLimit);
    assert.equal(state.records.length, 21);
    assert.equal(state.records[0].understandings[0].eventTime, 'yesterday');
    const result = say(state, 'うれしい');
    assert.equal(result.recalled.length, api.RULES.recallLimit);
});

test('all seven input catalogs accept basics; unsupported text remains unresolved', () => {
    const samples = { ja: '少し休もう', en: "Let's rest", 'zh-CN': '休息一下吧', ru: 'Давай отдохнём',
        'es-ES': 'Descansemos un poco', 'pt-BR': 'Vamos descansar um pouco', de: 'Ruhen wir uns etwas aus' };
    for (const [locale, text] of Object.entries(samples)) {
        assert.equal(say(create(), text, { locale }).understandings[0].known.meaning, 'rest');
        assert.equal(say(create(), 'xyz 123 ???', { locale }).understandings[0].complete, false);
    }
});

test('isolated server cannot serve legacy entry points or saves', async () => {
    const { createServer } = require('../scripts/experimental/serve');
    const server = createServer();
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    try {
        const url = `http://127.0.0.1:${server.address().port}`;
        assert.equal((await fetch(url)).status, 200);
        for (const file of ['index.html', 'system.js', 'cloud_manager.js', 'package.json', '../package.json']) {
            assert.equal((await fetch(`${url}/${file}`)).status, 404);
        }
        assert.equal((await fetch(`${url}/experimental_word_learning_catalog.json`)).status, 200);
    } finally { await new Promise(resolve => server.close(resolve)); }
});

test('legacy release packages exclude experimental entry points', () => {
    for (const name of ['full', 'full-offline', 'demo']) {
        const config = require('../scripts/release/build_config')(name);
        assert.ok(config.files.includes('!experimental_word_learning*'));
    }
    const html = fs.readFileSync(path.join(__dirname, '../experimental_word_learning.html'), 'utf8');
    assert.doesNotMatch(html, /(?:system|ai_core|ui_controller|cloud_manager|release_config)\.js/);
});

test('pointing leads to continuous movement and perception only after arrival', () => {
    const world = worldApi.create();
    worldApi.approach(world, 'berry:1', 'pointing');
    assert.equal(worldApi.perception(world).attention.length, 0);
    const x = world.x; worldApi.tick(world, .1);
    assert.ok(world.x < x && world.x > .28);
    for (let i = 0; i < 80; i++) worldApi.tick(world, .1);
    assert.equal(worldApi.perception(world).attention[0].id, 'berry:1');
    assert.equal(world.mode, 'observe');
});

test('watching without instructions continues the life loop without inventing knowledge', () => {
    const world = worldApi.create(), state = create({ life: false, foundation: false });
    const arrivals = new Set();
    for (let i = 0; i < 2000; i++) {
        const event = worldApi.tick(world, .1);
        if (event?.kind === 'arrive' && event.target) arrivals.add(event.target.startsWith('berry:') ? 'berry:1' : event.target);
        api.perceive(state, worldApi.perception(world));
    }
    assert.deepEqual([...arrivals].sort(), ['berry:1', 'path', 'shade']);
    assert.equal(state.knowledge.meanings.length, 0); assert.equal(state.records.length, 0);
});

test('hidden or paused time cannot progress life or catch up a long interval', () => {
    const world = worldApi.create(); worldApi.approach(world, 'shade');
    const snapshot = structuredClone(world);
    worldApi.tick(world, 3600, true); assert.deepEqual(world, snapshot);
    worldApi.tick(world, 3600); assert.equal(world.elapsed, .1);
    assert.ok(Math.abs(world.x - snapshot.x) < .01);
});

test('understanding a suggestion permits a choice, not unconditional obedience', () => {
    const state = create(), world = worldApi.create();
    const result = say(state, '少し休もう');
    world.attention = 'berry:1'; world.mode = 'observe'; world.dwell = 8;
    assert.equal(worldApi.respond(world, result, state).message, 'keep_looking');
    assert.equal(world.destination, null);
    world.dwell = 2;
    assert.equal(worldApi.respond(world, result, state).message, 'join');
    assert.equal(world.destination, 'shade');
    assert.equal(world.reasons[0].inputId, result.input.id);
});

test('unknown, conditional and negative proposals do not dispatch immediate actions', () => {
    for (const [options, input] of [[{}, '疲れたら休んでね'], [{ foundation: false }, '少し休もう'],
        [{ life: false }, '少し休もう'], [{}, 'それは食べないで']]) {
        const state = create(options), world = worldApi.create();
        worldApi.respond(world, say(state, input), state);
        assert.equal(world.destination, null);
    }
});

test('a learned name changes observable response; recall adds no evidence', () => {
    const state = create(), world = worldApi.create();
    assert.equal(say(state, 'ぽぽ').understandings[0].kind, 'partial');
    focus(state); say(state, 'これをぽぽって呼ぼう');
    api.perceive(state, { scene: 'path', attention: [] });
    const result = say(state, 'ぽぽ');
    assert.equal(result.understandings[0].kind, 'reference');
    const response = worldApi.respond(world, result, state);
    assert.equal(response.target, 'berry:1'); assert.equal(response.message, 'name_echo');
    assert.equal(state.knowledge.associations[0].evidence.length, 1);
    state.settings.speech = 'gesture';
    assert.equal(worldApi.respond(world, result, state).message, 'recognize_gesture');
});

test('existing sprite frames all fit their actual PNG sheets', () => {
    const visuals = require('../experimental_word_learning_visuals.json');
    for (const config of Object.values(visuals)) {
        const png = fs.readFileSync(path.join(__dirname, '..', config.image));
        const width = png.readUInt32BE(16), height = png.readUInt32BE(20);
        for (const frames of Object.values(config.actions)) for (const frame of frames) {
            assert.ok(frame.sw > 0 && frame.sh > 0 && frame.sx >= 0 && frame.sy >= 0);
            assert.ok(frame.sx + frame.sw <= width && frame.sy + frame.sh <= height);
        }
    }
});

test('natural naming answers, confirmation and rejection keep their referent', () => {
    for (const answer of ['ぽぽだよ', 'これはぽぽだよ', 'ぽぽ']) {
        const state = create(), world = worldApi.create(); focus(state);
        assert.equal(worldApi.onArrival(world, state, { kind: 'arrive', target: 'berry:1' }).message, 'ask_name');
        const result = say(state, answer);
        assert.equal(result.understandings[0].kind, 'naming');
        assert.equal(worldApi.respond(world, result, state).word, 'ぽぽ');
        assert.equal(say(state, 'うん').understandings[0].answer, 'yes');
        assert.equal(state.knowledge.associations[0].evidence.length, 1);
    }
    const state = create(), world = worldApi.create(); focus(state);
    worldApi.respond(world, say(state, 'ぽぽだよ'), state);
    const no = say(state, 'ちがうよ');
    assert.equal(no.understandings[0].answer, 'no');
    assert.equal(state.knowledge.associations[0].evidence.filter(e => !e.retractedBy).length, 0);
    assert.equal(say(state, 'ぽぽ').understandings[0].kind, 'partial');
});

test('short replies cannot teach unrelated statements or unidentified objects', () => {
    const state = create();
    assert.equal(say(state, 'ぽぽだよ').learning[0].updated.length, 0);
    assert.equal(say(state, 'うん').understandings[0].kind, 'partial');
    focus(state);
    assert.equal(say(state, '食べたくないんだよ').learning[0].updated.length, 0);
    const world = worldApi.create(); worldApi.onArrival(world, state, { kind: 'arrive', target: 'berry:1' });
    api.perceive(state, { scene: 'path', attention: [] });
    assert.equal(state.context.pendingQuestion, null);
    assert.equal(say(state, 'ぽぽ').learning[0].updated.length, 0);
});

test('activity answers come from actual current and completed actions', () => {
    const state = create(), world = worldApi.create();
    assert.equal(worldApi.respond(world, say(state, '何をしてた？'), state).message, 'answer_unknown');
    world.pause = 0; worldApi.approach(world, 'shade');
    assert.equal(worldApi.respond(world, say(state, '何してるの？'), state).message, 'walking');
    world.pause = 0;
    for (let i = 0; i < 80; i++) worldApi.tick(world, .1);
    assert.equal(worldApi.respond(world, say(state, '何してるの？'), state).message, 'resting');
    assert.equal(worldApi.respond(world, say(state, '何をしてた？'), state).message, 'walked');
    assert.equal(worldApi.respond(world, say(state, 'どうして休んだの？'), state).message, 'answer_unknown');
});

test('name questions and spontaneous preference recall respect knowledge and evidence', () => {
    const state = create(), world = worldApi.create(); focus(state);
    assert.equal(worldApi.respond(world, say(state, 'これなに？'), state).message, 'known_berry');
    say(state, '私は木の実が好き');
    assert.equal(worldApi.onArrival(world, state, { kind: 'arrive', target: 'berry:1' }).message, 'player_likes_berry');
    assert.notEqual(worldApi.onArrival(world, state, { kind: 'arrive', target: 'berry:1' })?.message, 'player_likes_berry');
    const unknown = create({ life: false }); focus(unknown);
    assert.notEqual(worldApi.respond(world, say(unknown, 'これなに？'), unknown).message, 'known_berry');
    const gesture = create({ speech: 'gesture' }); focus(gesture);
    assert.equal(worldApi.onArrival(worldApi.create(), gesture, { kind: 'arrive', target: 'berry:1' }), null);
});
