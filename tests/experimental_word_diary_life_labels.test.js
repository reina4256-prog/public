'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const core = require('../experimental_word_learning_core');
const worldApi = require('../experimental_word_learning_world');
const catalog = require('../experimental_word_learning_catalog.json');
const candidates = require('../experimental_word_diary_candidates');
const labels = require('../experimental_word_diary_life_labels');
const copy = value => JSON.parse(JSON.stringify(value));
function setup(activity = 'eat', options = {}) {
    const state = core.create({ life: false, ...options }, catalog), world = worldApi.create();
    Object.assign(world, { mode: activity, attention: activity === 'eat' ? 'berry:1' : 'shade',
        elapsed: 1, activityStart: 1, dwell: .1, harvest: 1, hunger: .8, fatigue: .7,
        activityBefore: { hunger: .8, fatigue: .7 } });
    if (activity === 'eat') world.mealTaste = { quality: 'sweet', pleasant: true };
    return { state, world };
}
function hear(value, raw = '甘い', locale = 'ja', speaker = 'player') {
    const { state, world } = value;
    const beforeKnowledge = copy(state.knowledge), context = copy({ ...world, scene: state.context.scene });
    const result = core.receive(state, raw, catalog, { locale, speaker, at: 100 + state.serial });
    worldApi.respond(world, result, state);
    return { result, context, beforeKnowledge };
}
const capture = (buffer, v) => labels.capture(buffer, v.result, v.context, v.beforeKnowledge);
test('life label acceptance keeps sensory pairing distinct from unknown meaning without mutation', () => {
    const v = hear(setup()), before = JSON.stringify(v), buffer = candidates.create();
    assert.equal(capture(buffer, v), true);
    const entry = buffer.read()[0];
    assert.equal(entry.kind, 'teaching'); assert.equal(entry.sourceId, v.result.input.id);
    assert.equal(entry.captured.understanding.status, 'unrecognized');
    assert.equal(entry.captured.understanding.basis, null);
    assert.equal(entry.captured.sources.label.taste.quality, 'sweet');
    assert.equal(JSON.stringify(v), before);
});
test('all eight meanings and eight starts across seven catalogs preserve acceptance and prior basis', () => {
    const forms = {
        ja: ['木の実', '食べ物', '食べる', '甘い', 'おなかがすいた', '休む', '眠る', '疲れた'],
        en: ['berry', 'food', 'eat', 'sweet', 'hungry', 'rest', 'sleep', 'tired'],
        'zh-CN': ['浆果', '食物', '吃', '甜', '饿', '休息', '睡觉', '累'],
        ru: ['ягода', 'еда', 'есть', 'сладкий', 'голод', 'отдых', 'спать', 'устал'],
        'es-ES': ['baya', 'comida', 'comer', 'dulce', 'hambre', 'descansar', 'dormir', 'cansado'],
        'pt-BR': ['fruta', 'comida', 'comer', 'doce', 'fome', 'descansar', 'dormir', 'cansado'],
        de: ['Beere', 'Essen', 'speisen', 'süß', 'hungrig', 'ausruhen', 'schlafen', 'müde']
    };
    for (const [locale, words] of Object.entries(forms)) {
        for (const foundation of [false, true]) for (const life of [false, true]) for (const speech of ['short', 'gesture']) {
            for (const [index, id] of ['berry', 'food', 'eat', 'sweet', 'hungry', 'rest', 'sleep', 'tired'].entries()) {
                const raw = words[index]; assert.ok(catalog.meanings[id].includes(raw));
                const v = hear(setup(['rest', 'sleep', 'tired'].includes(id) ? 'rest' : 'eat', { foundation, life, speech }),
                    ['hungry', 'tired'].includes(id) ? `"${raw}"` : raw, locale);
                const buffer = candidates.create();
                // Existing normalization makes German Essen/essen ambiguous; do not invent a choice.
                const accepted = !(locale === 'de' && id === 'food');
                assert.equal(capture(buffer, v), accepted, `${locale}/${id}`);
                if (!accepted) { assert.deepEqual(v.result.lifeLabel, ['food', 'eat']); continue; }
                assert.equal(buffer.read()[0].captured.understanding.status, life ? 'recognized' : 'unrecognized');
            }
        }
    }
});
test('repeated new inputs remain separate despite first-only pending labels', () => {
    const value = setup(), buffer = candidates.create();
    for (let i = 0; i < 2; i++) assert.equal(capture(buffer, hear(value)), true);
    assert.equal(value.world.lifeLabels.length, 1); assert.equal(buffer.read().length, 2);
    assert.equal(value.state.knowledge.meanings.length, 0);
});
test('completion learns separately and never upgrades earlier teaching or grows on redelivery', () => {
    const value = setup(), v = hear(value), buffer = candidates.create(); capture(buffer, v);
    const original = buffer.read(); value.world.pause = 0;
    const event = worldApi.tick(value.world, .1); worldApi.onArrival(value.world, value.state, event);
    assert.ok(value.state.knowledge.meanings.some(item => item.id === 'sweet'));
    assert.equal(capture(buffer, v), false); assert.deepEqual(buffer.read(), original);
    v.result.input.raw = 'changed'; buffer.read()[0].captured.sources.label.taste.quality = 'changed';
    assert.deepEqual(buffer.read(), original);
});
test('interruption and later knowledge do not remove or rewrite accepted teaching', () => {
    const value = setup(), v = hear(value), buffer = candidates.create(); capture(buffer, v);
    const original = buffer.read(); value.world.lifeLabels = []; value.world.mode = 'observe';
    value.state.knowledge.meanings.push({ id: 'sweet', source: 'initial' });
    assert.equal(capture(buffer, v), false); assert.deepEqual(buffer.read(), original);
});
test('reports questions wrong sensation and other teaching are not accepted labels', () => {
    for (const raw of ['甘い？', '甘くない', '疲れた', '甘い 食べる', 'ぽぽは休むことだよ'])
        assert.equal(capture(candidates.create(), hear(setup(), raw)), false);
    const value = setup(); value.world.mealTaste.quality = 'bitter';
    assert.equal(capture(candidates.create(), hear(value)), false);
    assert.equal(capture(candidates.create(), hear(setup(), '甘い', 'ja', 'visitor')), false);
});
test('missing snapshots mismatched adoption and sensory scope fail closed', () => {
    const v = hear(setup());
    for (const mutate of [v => { delete v.beforeKnowledge.meanings; }, v => { v.context.scene = 'other'; },
        v => { v.context.attention = 'shade'; }, v => { v.context.mealTaste = null; },
        v => { v.result.lifeLearning.adopted = 'rest'; }, v => { v.result.lifeLearning.updated = ['sweet']; }]) {
        const invalid = copy(v); mutate(invalid); assert.equal(capture(candidates.create(), invalid), false);
    }
});
