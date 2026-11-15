(function (root, factory) {
    'use strict';
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.ExperimentalWordAutoTraining = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';
    const axes = ['life', 'conversation', 'exploration'];
    const defaults = { life: 2, conversation: 2, exploration: 2 };
    const questions = { ja: '今何してるの？', en: 'What are you doing?', 'zh-CN': '你在做什么？',
        ru: 'Что ты делаешь?', 'es-ES': '¿Qué estás haciendo?', 'pt-BR': 'O que você está fazendo?', de: 'Was machst du?' };
    const wordIds = ['berry', 'food', 'eat', 'sweet', 'hungry', 'rest', 'sleep', 'tired', 'walk'];
    const vocabulary = {
        ja: ['木の実', '食べ物', '食べる', '甘い', 'おなかがすいた', '休む', '眠る', '疲れた', '歩く'],
        en: ['berry', 'food', 'eat', 'sweet', 'hungry', 'rest', 'sleep', 'tired', 'walk'],
        'zh-CN': ['浆果', '食物', '吃', '甜', '饿', '休息', '睡觉', '累', '散步'],
        ru: ['ягода', 'еда', 'есть', 'сладкий', 'голод', 'отдых', 'спать', 'устал', 'гулять'],
        'es-ES': ['baya', 'comida', 'comer', 'dulce', 'hambre', 'descansar', 'dormir', 'cansado', 'pasear'],
        'pt-BR': ['fruta', 'comida', 'comer', 'doce', 'fome', 'descansar', 'dormir', 'cansado', 'passear'],
        // "Essen" overlaps food/eat in the existing parser. Do not teach an
        // ambiguous label or change the child's grammar to make automation work.
        de: ['Beere', null, 'speisen', 'süß', 'hungrig', 'ausruhen', 'schlafen', 'müde', 'spazieren']
    };
    const wordsFor = locale => Object.fromEntries(wordIds.map((id, index) => [id, vocabulary[locale]?.[index]]).filter(([, word]) => typeof word === 'string'));
    function weights(value) {
        return Object.fromEntries(axes.map(axis => [axis, Number.isInteger(value?.[axis]) && value[axis] >= 0 && value[axis] <= 3
            ? value[axis] : defaults[axis]]));
    }
    function validPreferences(value) {
        return value === undefined || !!value && value.version === 1 && Object.keys(value).length === 2
            && !!value.weights && Object.keys(value.weights).length === 3
            && axes.every(axis => Number.isInteger(value.weights[axis]) && value.weights[axis] >= 0 && value.weights[axis] <= 3);
    }
    function create(value) { return { weights: weights(value), counts: { life: 0, conversation: 0, exploration: 0 }, sent: [] }; }
    const known = (state, id) => state.knowledge.meanings.some(entry => entry.id === id);
    function questionKnown(state, locale) {
        return state.knowledge.relations.some(entry => entry.id === 'question' && (entry.source === 'initial'
            || entry.scope?.locale === locale && entry.scope.form === questions[locale]?.normalize('NFKC').toLocaleLowerCase().replace(/[？?]$/u, '')));
    }
    // Plans are descriptions only. Callers recheck them after the visible preview;
    // only the ordinary movement and chat entry points may execute them.
    function next(memory, state, world, locale) {
        if (!memory || !state || !world || !questions[locale]) return null;
        const words = wordsFor(locale);
        const activity = `${world.mode}:${world.activityStart}:${world.attention || world.destination || ''}`;
        const sent = id => memory.sent.includes(`${activity}:${locale}:${id}`);
        const candidates = [];
        const add = (axis, id, action) => {
            if (memory.weights[axis] > 0 && !sent(id)) candidates.push({ axis, id, activity, locale, ...action });
        };
        const label = (axis, id) => {
            if (known(state, id) || (world.lifeLabels || []).some(item => item.meaning === id) || !words[id]) return;
            add(axis, id, { kind: 'say', text: '「' + words[id] + '」', purpose: 'experience' });
        };
        const canEat = world.mode === 'eat' && /^berry:[1-9]\d*$/u.test(world.attention);
        const canRest = world.mode === 'rest' && world.attention === 'shade';
        if (canEat) {
            for (const id of ['eat', 'berry', 'food']) label('life', id);
            if (world.mealTaste?.quality === 'sweet') label('life', 'sweet');
            if (world.activityBefore?.hunger >= .45 && world.hunger >= .45) label('life', 'hungry');
        }
        if (canRest) {
            for (const id of ['rest', 'sleep']) label('life', id);
            if (world.activityBefore?.fatigue >= .55 && world.fatigue >= .55) label('life', 'tired');
        }
        if (canEat || canRest) {
            const meaning = world.mode;
            if (!known(state, meaning)) label('conversation', meaning);
            else if (!questionKnown(state, locale) && !(world.relationLabels || []).some(item => item.relation === 'question'))
                add('conversation', 'question-example', { kind: 'say', text: '「' + questions[locale] + '」→「' + words[meaning] + '」', purpose: 'example' });
            else if (questionKnown(state, locale))
                add('conversation', 'question', { kind: 'say', text: questions[locale], purpose: 'practice' });
        }
        if (world.mode === 'move' && world.pause <= 0) label('exploration', 'walk');
        if (world.mode === 'move' && known(state, 'walk') && questionKnown(state, locale))
            add('exploration', 'question', { kind: 'say', text: questions[locale], purpose: 'practice' });
        if (['idle', 'observe'].includes(world.mode) && world.pause <= 0 && world.hunger < .6 && world.fatigue < .55) {
            const places = world.island?.places || [{ id: 'path', x: .52, y: .82 }, { id: 'shade', x: .76, y: .57 }];
            const target = ['path', 'shade'].map(id => places.find(place => place.id === id))
                .find(place => place && Math.hypot(place.x - world.x, place.y - world.y) > .08);
            if (target) add('exploration', 'move', { kind: 'move', target: target.id, purpose: 'movement' });
        }
        if (!candidates.length) return null;
        candidates.sort((a, b) => memory.counts[a.axis] / memory.weights[a.axis] - memory.counts[b.axis] / memory.weights[b.axis]);
        return candidates[0];
    }
    function committed(memory, plan) {
        memory.counts[plan.axis]++;
        memory.sent.push(`${plan.activity}:${plan.locale}:${plan.id}`);
        memory.sent = memory.sent.slice(-100);
    }
    return Object.freeze({ axes, defaults, weights, validPreferences, create, next, committed, questions, wordsFor });
});
