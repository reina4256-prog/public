(function (root, factory) {
    const node = typeof module === 'object' && module.exports;
    const api = factory(node ? require('./experimental_word_adventure') : root.ExperimentalWordAdventure,
        node ? require('./experimental_word_learning_core') : root.ExperimentalWordLearning,
        node ? require('./experimental_word_learning_world') : root.ExperimentalWordWorld,
        node ? require('./experimental_word_island_navigation') : root.WordIslandNavigation);
    if (node) module.exports = api; else root.ExperimentalWordAdventureConnection = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (physical, core, life, navigation) {
    'use strict';
    const copy = x => JSON.parse(JSON.stringify(x));
    const same = (a, b) => a.x === b.x && a.y === b.y;
    const near = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y) === 1;
    const actions = ['attack', 'avoid', 'pick', 'equip', 'use', 'store', 'take'];
    const teachable = [...actions, 'walk'];
    const meaningFor = action => action === 'walk' ? 'walk' : 'action:' + action;
    const words = {
        ja: ['攻撃する', 'かわす', '拾う', '装備する', '使う', 'しまう', '取り出す'],
        en: ['attack', 'evade', 'pick up', 'equip', 'use', 'store', 'take out'],
        'zh-CN': ['攻击', '闪避', '拾取', '装备', '使用', '存放', '取出'],
        ru: ['атаковать', 'уклониться', 'подобрать', 'экипировать', 'использовать', 'убрать', 'достать'],
        'es-ES': ['atacar', 'esquivar', 'recoger', 'equipar', 'usar', 'guardar', 'sacar'],
        'pt-BR': ['atacar', 'desviar', 'pegar', 'equipar', 'usar', 'guardar', 'retirar'],
        de: ['angreifen', 'ausweichen', 'aufheben', 'ausrüsten', 'benutzen', 'verstauen', 'herausnehmen']
    };
    const commands = {
        ja: ['冒険家の課題', '橋を依頼する', '橋を建てる', '家を依頼する', 'かばんを作る', '棒を作る', '盾を作る', '携行食を作る', '手当て布を作る', 'スカルへ行く', 'クリスタルへ行く', '見る', '歩く', '帰る', '下りる', '上る'],
        en: ['adventurer lessons', 'request a bridge', 'build a bridge', 'request a home', 'make a bag', 'make a stick', 'make a shield', 'make a ration', 'make a bandage', 'go to skull', 'go to crystal', 'look', 'walk', 'return', 'downstairs', 'upstairs'],
        'zh-CN': ['冒险家课题', '委托造桥', '自己造桥', '委托建家', '制作背包', '制作木棒', '制作木盾', '制作干粮', '制作绷带', '去骷髅地牢', '去水晶地牢', '观察', '走路', '返回', '下楼', '上楼'],
        ru: ['уроки искателя', 'заказать мост', 'построить мост', 'заказать дом', 'сделать сумку', 'сделать палку', 'сделать щит', 'сделать паёк', 'сделать бинт', 'идти в череп', 'идти в кристалл', 'осмотреться', 'идти', 'вернуться', 'вниз', 'вверх'],
        'es-ES': ['lecciones de aventura', 'encargar un puente', 'construir un puente', 'encargar una casa', 'hacer una bolsa', 'hacer un palo', 'hacer un escudo', 'hacer una ración', 'hacer una venda', 'ir a calavera', 'ir a cristal', 'mirar', 'caminar', 'volver', 'bajar', 'subir'],
        'pt-BR': ['lições de aventura', 'encomendar uma ponte', 'construir uma ponte', 'encomendar uma casa', 'fazer uma bolsa', 'fazer um bastão', 'fazer um escudo', 'fazer uma ração', 'fazer uma bandagem', 'ir à caveira', 'ir ao cristal', 'observar', 'andar', 'voltar', 'descer', 'subir'],
        de: ['Abenteuerunterricht', 'Brücke beauftragen', 'Brücke bauen', 'Haus beauftragen', 'Tasche herstellen', 'Stock herstellen', 'Schild herstellen', 'Proviant herstellen', 'Verband herstellen', 'zum Schädel gehen', 'zum Kristall gehen', 'schauen', 'gehen', 'zurückkehren', 'hinabsteigen', 'hinaufsteigen']
    };
    const buildingLabels = { ja: '橋の建築を学ぶ', en: 'learn bridge building', 'zh-CN': '学习造桥', ru: 'учиться строить мост',
        'es-ES': 'aprender a construir puentes', 'pt-BR': 'aprender a construir pontes', de: 'Brückenbau lernen' };
    for (const locale of Object.keys(commands)) commands[locale].push(buildingLabels[locale]);
    const dropLabels={ja:'地面に置く',en:'put on the ground','zh-CN':'放到地上',ru:'положить на землю','es-ES':'dejar en el suelo','pt-BR':'colocar no chão',de:'auf den Boden legen'};
    for(const locale of Object.keys(commands))commands[locale].push(dropLabels[locale]);
    const commandIds = ['lesson', 'bridge', 'self', 'home', 'bag', 'stick', 'shield', 'ration', 'cloth', 'skull', 'crystal', 'observe', 'walk', 'return', 'down', 'up', 'building','drop'];
    const normalize = text => text.normalize('NFKC').trim().toLocaleLowerCase().replace(/[。.!！]$/, '');
    function parse(raw, locale = 'ja') {
        const text = normalize(raw), c = commands[locale] || commands.en, w = words[locale] || words.en;
        const n = c.findIndex(x => normalize(x) === text), i = w.findIndex(x => normalize(x) === text);
        return n >= 0 ? commandIds[n] : i >= 0 ? actions[i] : null;
    }
    const say = message => ({ message, observation: true });
    function init(state, world) {
        const a = physical.ensure(state);
        navigation.adventurePlaces(world.island);
        a.connection ||= { version: 1, task: null, receipts: [] };
        world.island.bridgeOpen = a.building.bridge;
        syncGround(a,world);
        return a;
    }
    function syncGround(a,world) {
        world.island.places=world.island.places.filter(p=>!p.id.startsWith('adventure:item:'));
        for(const i of a.items.filter(i=>i.location==='ground'))world.island.places.push({id:'adventure:item:'+i.id,meaning:'adventure:item:'+i.id,...i.position});
    }
    function drop(state,world,id) {
        const a=init(state,world);
        if(a.connection.task || !physical.drop(a,world,id))return say('advCannot');
        syncGround(a,world);return say('advUsed');
    }
    function at(world, id) {
        const p = world.island.places.find(p => p.id === id);
        return !!p && Math.hypot(world.x - p.x, world.y - p.y) < 1e-6 && world.mode !== 'move';
    }
    function sources(a, world, type) {
        const place = type === 'stone' ? 'mountain' : 'forest';
        if (!at(world, 'adventure:' + place)) return;
        for (const [key, asset] of Object.entries(world.island.assets)) if (['ground', 'road'].includes(asset.type)) {
            const id = 'island:' + key + ':' + type;
            if (!a.sources.some(s => s.objectId === id)) physical.discover(a, type, place, id);
        }
    }
    function start(state, world, kind, data = {}, input = null) {
        const a = init(state, world);
        if (a.run || a.connection.task || ['eat', 'work'].includes(world.mode)) return say('advBusy');
        a.connection.task = { kind, phase: 'start', start: world.elapsed, steps: [], index: 0, remaining: 0,
            input: input ? copy(input) : null, ...data };
        if (['idle','observe'].includes(world.mode)) world.dwell = 1000000;
        return say('advStarted');
    }
    const go = id => ({ go: id });
    const work = (effect, data = {}) => ({ effect, seconds: 2, ...data });
    function plan(a, world, task) {
        if (['craft','enter'].includes(task.kind) && (world.hunger >= .6 || world.fatigue >= .55)) return [
            ...(world.hunger >= .6 ? [go('berry:1'), { life: 'eat' }] : []),
            ...(world.fatigue >= .55 ? [go('shade'), { life: 'rest' }] : []), work('replan')];
        if (task.kind === 'enter') return [go('adventure:bridge'), go('adventure:' + task.dungeon), work('enter')];
        if (task.kind === 'lesson') {
            if (a.mastery.stage === 0) return [go('master:explore'), go('adventure:forest'), work('survey'), go('adventure:mountain'), work('survey'), go('master:explore'), work('review')];
            if (a.mastery.stage === 1) return [go('master:explore'), go('adventure:forest'), work('gather', { type: 'wood' }), go('master:building'), work('deliver', { project: 'bridge' }), go('master:explore'), work('review')];
            if (a.mastery.stage === 2) return [go('master:explore'), go('shade'), { life: 'rest' }, go('master:explore'), work('review')];
            return [go('master:explore'), go('adventure:forest'), work('survey'), work('gather', { type: 'wood' }), go('master:building'), work('deliver', { project: 'bridge' }), work('decide'), go('master:explore'), work('review')];
        }
        if (task.kind === 'craft') {
            for (const [type, count] of Object.entries(physical.RECIPES[task.project])) {
                if (a.items.filter(i => i.type === type && i.location === 'project' && i.project === task.project).length >= count) continue;
                const carrying = physical.carried(a).find(i => i.type === type);
                return [...(carrying ? [] : [go('adventure:' + (type === 'stone' ? 'mountain' : 'forest')), work('gather', { type })]),
                    go(task.project === 'ration' ? 'master:cooking' : 'master:building'), work('deliver', { project: task.project }), work('replan')];
            }
            return [go(task.project === 'ration' ? 'master:cooking' : 'master:building'), { ...work('craft'), seconds: 18 }];
        }
        if (task.kind === 'storage') return [go('adventure:home'), work(task.action, { item: task.item })];
        if(task.kind==='pickup')return [go('adventure:item:'+task.item),work('pick',{item:task.item})];
        return [];
    }
    function stop(state, world) {
        const c=state?.adventure?.connection;
        if (c) { const active=!!c.task; c.task=null; if(active && world && ['idle','observe'].includes(world.mode)) world.dwell=0; }
    }
    function effect(state, world, task, step) {
        const a = state.adventure;
        if (step.effect === 'survey') physical.event(a, 'survey', { place: world.attention, at: world.elapsed, start: task.start });
        if (step.effect === 'gather') {
            const size=['wood','stone'].includes(step.type)?2:1;
            if(physical.used(a)+size>physical.capacity(a)) {
                const held=a.items.find(i=>i.location==='hand');
                if(held && physical.drop(a,world,held.id))syncGround(a,world);
            }
            sources(a, world, step.type);
            const s = a.sources.find(s => s.type === step.type && !s.collected);
            if (!s) return 'advNoMaterial';
            if (!physical.collect(a, s.type, s.place, s.objectId)) return 'advFull';
        }
        if (step.effect === 'deliver') for (const i of physical.carried(a)) if (Object.hasOwn(physical.RECIPES[step.project], i.type)) physical.deliver(a, i.id, step.project);
        if (step.effect === 'decide') {
            const target = world.hunger >= .45 ? 'berry:1' : world.fatigue >= .55 ? 'shade' : null;
            physical.event(a, 'field_decision', { target, hunger: world.hunger, fatigue: world.fatigue, at: world.elapsed });
            if (target) task.steps.splice(task.index + 1, 0, go(target), { life: target === 'shade' ? 'rest' : 'eat' });
        }
        if (step.effect === 'review') {
            const recent = a.events.filter(e => e.id > task.eventStart), stage = a.mastery.stage;
            if (stage === 0 && new Set(recent.filter(e => e.kind === 'survey').map(e => e.place)).size < 2
                || stage === 1 && !recent.some(e => e.kind === 'deliver')
                || stage === 2 && !world.experiences.some(e => e.kind === 'rest' && e.start >= task.start && e.end > e.start)
                || stage === 3 && (!recent.some(e => e.kind === 'gather') || !recent.some(e => e.kind === 'deliver') || !recent.some(e => e.kind === 'field_decision'))) return 'advCannot';
            const e = physical.event(a, ['survey', 'deliver', 'preparation', 'field_return'][stage], { at: world.elapsed, start: task.start,
                originals: recent.map(e => e.id), life: world.experiences.filter(e => e.start >= task.start).map(e => e.id) });
            physical.certify(a, e.id); return a.mastery.stage === 4 ? 'advMastery' : 'advReviewed';
        }
        if (step.effect === 'craft') {
            const coached=task.coached && task.project==='bridge' && !a.building.learned;
            if(coached)a.building.learned=true;
            const e = physical.craft(a, task.project, task.method || 'request');
            if (!e) { if(coached)a.building.learned=false; return 'advFull'; }
            e.start = task.start; e.end = world.elapsed; e.place = world.attention;
            if(coached)e.coached=true;
            world.island.bridgeOpen = a.building.bridge; return 'advBuilt';
        }
        if (step.effect === 'replan') { task.steps = plan(a, world, task); task.index = -1; }
        if (step.effect === 'enter') {
            if (!physical.enter(a, task.dungeon)) return 'advCannot';
            state.context.pendingQuestion = null; delete state.context.lastOutput; perceive(state);
            world.mode = 'idle'; world.destination = null; world.attention = null; return 'advEntered';
        }
        if (['store', 'take'].includes(step.effect)) {
            if (!physical.transfer(a, step.item, step.effect === 'store' ? 'home' : physical.used(a) < physical.capacity(a) ? 'bag' : 'hand')) return 'advFull';
            teach(state, world, a.events.at(-1), task.input, step.effect, task.locale); return 'advUsed';
        }
        if(step.effect==='pick') {
            const i=a.items.find(i=>i.id===step.item && i.location==='ground');
            if(!i || !physical.transfer(a,i.id,physical.used(a)+(['wood','stone'].includes(i.type)?2:1)<=physical.capacity(a)?'bag':'hand',world))return 'advFull';
            teach(state,world,a.events.at(-1),task.input,'pick',task.locale);
            world.attention=null;world.destination=null;world.route=[];syncGround(a,world);return 'advPicked';
        }
        return null;
    }
    // Runs after actual world tick/arrival handling. No teleport or retrospective success.
    function tick(state, world, dt, holding, event) {
        const a = init(state, world), task = a.connection.task;
        if (event?.kind === 'experience' && ['eat', 'rest'].includes(event.activity)) physical.care(a, event);
        if (!task || holding || a.run) return null;
        if (task.phase === 'start') { task.eventStart = a.serial; task.steps = plan(a, world, task); task.phase = 'steps'; }
        const step = task.steps[task.index];
        if (!step) { stop(state,world); return null; }
        if (step.go) {
            if (['eat','work'].includes(world.mode)) return null;
            const attending = world.attention === step.go || step.go === 'berry:1' && world.attention?.startsWith('berry:');
            if (at(world, step.go) && attending) { task.index++; return null; }
            if (world.mode !== 'move' || world.destination !== step.go) if (!life.approach(world, step.go, 'pointing')) { stop(state,world); return say('advCannot'); }
            return null;
        }
        if (step.life) {
            if (event?.kind === 'experience' && event.activity === step.life && event.start >= task.start) task.index++;
            return null;
        }
        world.dwell = 1000000;
        task.remaining += Math.min(.1, Math.max(0, dt));
        if (task.remaining < step.seconds) return null;
        task.remaining = 0;
        const message = effect(state, world, task, step); task.index++;
        if (message || !task.steps[task.index]) stop(state,world);
        if (!a.connection.task && !a.run) { world.mode = 'idle'; world.attention = null; world.dwell = 3; }
        return message ? say(message) : null;
    }
    const rules = teachable.map(action => ({ id: meaningFor(action), source: 'experienced_adventure', requireScope: true,
        resolve(e) {
            const t = e.adventureTeaching;
            if (e.kind !== 'experience' || e.activity !== 'action:' + action || !t || t.action !== action
                || !/^input:[1-9]\d*$/.test(t.input?.id) || t.input.speaker !== 'player' || typeof t.input.raw !== 'string'
                || parse(t.input.raw, t.locale) !== action || !Number.isSafeInteger(e.adventureSource)) return null;
            return { action, inputId: t.input.id, label: t.input.raw, locale: t.locale, physicalSource: e.adventureSource };
        } }));
    function teach(state, world, original, input, action, locale = 'ja') {
        const a = state.adventure;
        if (!input || input.speaker !== 'player' || !teachable.includes(action) || parse(input.raw, locale) !== action || !original
            || a.connection.receipts.some(r => r.input.id === input.id)) return null;
        const receipt = { input: copy(input), locale, action, physicalSource: original.id, original: copy(original) };
        a.connection.receipts.push(receipt);
        const e = { id: ++world.event, kind: 'experience', activity: 'action:' + action, target: a.run ? 'dungeon:' + a.run.dungeon + ':' + a.run.floor : 'island',
            start: world.elapsed, end: world.elapsed, adventureSource: original.id, adventureTeaching: copy(receipt) };
        world.experiences.push(copy(e)); state.experiences ||= []; state.experiences.push(copy(e));
        return core.learnExperience(state, e.id, rules);
    }
    function itemFor(a, action, preferred) {
        if (preferred) return preferred;
        if (action === 'equip') return a.items.find(i => ['bag', 'hand'].includes(i.location) && ['stick', 'shield', 'bag'].includes(i.type)
            && (i.type !== 'stick' || i.location !== 'hand'))?.id;
        if (action === 'use') return a.items.find(i => ['bag', 'hand'].includes(i.location) && i.type === (a.damage ? 'cloth' : 'ration'))?.id;
        if (action === 'pick') return a.items.find(i => i.location === 'floor' && i.dungeon === a.run?.dungeon && i.floor === a.run?.floor && same(i.position, a.run.position))?.id;
        return null;
    }
    function equipTransfer(a,e) {
        return e?.kind==='transfer' && a.items.some(i=>i.id===e.item && (i.type==='stick' && e.after==='hand'
            || ['bag','shield'].includes(i.type) && e.after==='body'));
    }
    function hand(state, world, action, target = null, input = null, locale = 'ja') {
        const a = state.adventure;
        if (!a?.run) return say('advCannot');
        if (action === 'return') { a.run.retreating=true; if(same(a.run.position,a.run.entry))action='up'; }
        const oldCompleted = a.training.completed;
        const result = physical.step(a, world, action, itemFor(a, action, target) || target, input?.id);
        if (!result) return say('advCannot');
        if (result.kind === 'action' && teachable.includes(action)) teach(state, world, result, input, action, locale);
        const reviewed = physical.reviewTraining(a);
        if (reviewed && a.run.floor === 4) a.run.retreating = false;
        state.context.pendingQuestion = null; delete state.context.lastOutput;
        if (!a.run) {
            world.mode = 'idle'; world.attention = null; world.destination = null; world.dwell = 0;
            world.activityStart = world.elapsed; world.reasons = []; world.route = [];
            return say(a.training.completed && !oldCompleted ? 'advGraduated'
                : a.events.at(-1)?.reason === 'walked_out' ? 'advReturned' : a.events.at(-1)?.reason === 'master_safety' ? 'advSafety' : 'advRescued');
        }
        if (reviewed) return say('advTraining');
        return say(result.damage > result.damageBefore ? 'advHurt' : a.run.enemy.phase === 'ready' ? 'advReady'
            : ({ observe: 'advObserved', attack: 'advHit', avoid: 'advAvoided', use: 'advUsed', equip: 'advEquipped', pick: 'advPicked' })[action] || 'advMoved');
    }
    function receive(state, world, result, locale = 'ja', labelOnly = false) {
        const id = parse(result.input.raw, locale);
        if (!id) return null;
        const a = init(state, world);
        if (!a.run && !['lesson','bridge','self','home','bag','stick','shield','ration','cloth','skull','crystal','building','drop','pick','store','take','use','equip'].includes(id)) return null;
        // Let the ordinary world own omitted/identity replies and their cost.
        // A supported practical label must not bypass common processing limits.
        if (result.identityReply || result.processing?.omitted.length) return null;
        if (result.processing) core.consumeProcessing(world, result.processing);
        if (a.connection.task) return say('advBusy');
        if (a.run) {
            if (!['observe', 'walk', 'return', 'up', 'down', ...actions].includes(id)) return say('advCannot');
            if (teachable.includes(id) && (labelOnly || !state.knowledge.meanings.some(m => m.id === meaningFor(id)))) {
                const e = a.events.find(e => e.id === a.run.last);
                if (e?.action === id) { result.adventureLearning = teach(state, world, e, result.input, id, locale); return say('advUsed'); }
                return say('advUnknown');
            }
            return hand(state, world, id, null, result.input, locale);
        }
        if(id==='drop')return drop(state,world,a.items.find(i=>i.location==='hand')?.id);
        if(id==='pick') {
            const i=a.items.find(i=>i.location==='ground' && !['wood','stone','berry'].includes(i.type)) || a.items.find(i=>i.location==='ground');
            return i?start(state,world,'pickup',{item:i.id,locale},result.input):say('advCannot');
        }
        if (id === 'lesson') return a.mastery.stage === 4 ? say('advMastery') : start(state, world, 'lesson', {}, result.input);
        if (['skull', 'crystal'].includes(id)) {
            if (a.mastery.stage < 4) return say('advNeedMastery');
            if (!a.building.bridge) return say('advNeedBridge');
            return start(state, world, 'enter', { dungeon: id }, result.input);
        }
        if (id === 'self' && !a.building.learned) return say('advNeedBuilding');
        if (id === 'building') return a.building.bridge ? say('advBuilt') : start(state, world, 'craft', {project:'bridge',method:'self',coached:true}, result.input);
        if (['bridge','self','home'].includes(id) && a.building[id==='self'?'bridge':id]) return say('advBuilt');
        if (Object.hasOwn(physical.RECIPES, id) || id === 'self') return start(state, world, 'craft', { project: id === 'self' ? 'bridge' : id, method: id === 'self' ? 'self' : 'request' }, result.input);
        if (['store', 'take'].includes(id)) {
            if (!a.building.home) return say('advCannot');
            const i = a.items.find(i => id === 'store' ? ['hand', 'bag'].includes(i.location) : i.location === 'home');
            return i ? start(state, world, 'storage', { action: id, item: i.id, locale }, result.input) : say('advCannot');
        }
        const last = a.events.at(-1);
        if(id==='equip') {
            if((labelOnly || !state.knowledge.meanings.some(m=>m.id==='action:equip')) && equipTransfer(a,last)) {
                result.adventureLearning=teach(state,world,last,result.input,id,locale); return say('advEquipped');
            }
            if(!state.knowledge.meanings.some(m=>m.id==='action:equip'))return say('advUnknown');
            const item=a.items.find(i=>i.id===itemFor(a,id));
            if(item?.type==='stick') { const held=a.items.find(i=>i.location==='hand');if(held)physical.transfer(a,held.id,'bag'); }
            if(!item || !physical.transfer(a,item.id,item.type==='stick'?'hand':'body'))return say('advCannot');
            teach(state,world,a.events.at(-1),result.input,id,locale);return say('advEquipped');
        }
        if (actions.includes(id) && labelOnly && last && (last.kind === 'use' && id === 'use' || last.kind === 'transfer' && ['equip','store','take'].includes(id))) {
            result.adventureLearning = teach(state, world, last, result.input, id, locale); return say('advUsed');
        }
        if (id === 'use') {
            const i = itemFor(a, id), e = i && physical.use(a, world, i);
            if (!e) return say('advCannot');
            teach(state, world, e, result.input, id, locale); return say('advUsed');
        }
        return null;
    }
    function adjacent(run) {
        return [[-1, 0], [1, 0], [0, -1], [0, 1]].map(([dx, dy]) => ({ x: run.enemy.x + dx, y: run.enemy.y + dy }))
            .filter(p => run.grid[p.y]?.[p.x] === '.').sort((a, b) => Math.abs(a.x - run.position.x) + Math.abs(a.y - run.position.y) - Math.abs(b.x - run.position.x) - Math.abs(b.y - run.position.y))[0];
    }
    function trainingChoice(a, world) {
        const r = a.run, f = r.floor;
        if (r.lesson) return f === 5 || r.retreating ? { action: same(r.position, r.entry) ? 'up' : 'return' }
            : same(r.position, r.exit) ? { action: 'down' } : { action: 'walk', target: r.exit };
        const start = [...a.events].reverse().find(e => e.kind === 'enter' && e.training)?.id;
        const did = action => a.events.some(e => e.id > start && e.floor === f && e.kind === 'action' && e.action === action);
        if (!r.enemy.observed) return { action: 'observe' };
        if (f === 1) return { action: 'walk' };
        if (f === 3) {
            for (const type of ['shield', 'stick']) {
                const i = a.items.find(i => i.loan && i.type === type && i.location === 'bag');
                if (i) return { action: 'equip', target: i.id };
            }
            for (const type of ['ration', 'cloth']) {
                const i = a.items.find(i => i.loan && i.type === type && i.location === 'bag');
                if (i && (type === 'cloth' ? a.damage > 0 : world.hunger > 0)) return { action: 'use', target: i.id };
            }
            if (!a.events.some(e => e.id > start && e.floor === 3 && e.damage > e.damageBefore) && near(r.position, r.enemy)) return { action: 'observe' };
        }
        if (f === 4) return did('walk') && (a.damage > 0 || world.fatigue >= .55 || world.hunger >= .45) ? { action: 'return' }
            : near(r.position, r.enemy) ? { action: 'observe' } : { action: 'walk', target: adjacent(r) };
        if (f === 5) return { action: did('walk') ? 'return' : 'walk' };
        if (r.enemy.phase === 'ready' && near(r.position, r.enemy) && (f !== 2 || !did('avoid'))) return { action: 'avoid' };
        if (!r.enemy.defeated && near(r.position, r.enemy)) return { action: 'attack' };
        return { action: 'walk', target: r.enemy.defeated ? r.exit : adjacent(r) };
    }
    function choice(state, world) {
        const a = state.adventure;
        return a?.run?.training ? trainingChoice(a, world) : a?.run ? physical.decide(a, world) : null;
    }
    function autoCommand(state, locale = 'ja') {
        const a = state.adventure, c = commands[locale] || commands.en;
        if (!a || a.run || a.connection.task) return null;
        if(a.training.completed && physical.capacity(a)===0) return c[4];
        if(physical.capacity(a)>physical.used(a) && a.items.some(i=>i.location==='ground' && !['wood','stone','berry'].includes(i.type)))return (words[locale]||words.en)[2];
        if (a.damage > 0) return a.items.some(i => i.type === 'cloth' && ['hand','bag'].includes(i.location))
            ? (words[locale] || words.en)[4] : c[8];
        if(a.training.completed && a.items.some(i=>i.type==='stick' && i.location==='bag')
            && (!a.items.some(i=>i.location==='hand') || physical.used(a)<physical.capacity(a)))return (words[locale]||words.en)[3];
        if (a.mastery.stage < 4) return c[0];
        if (!a.building.bridge) return c[1];
        if (a.training.completed) for (const [type, n] of [['bag', 4], ['stick', 5], ['shield', 6], ['ration', 7], ['cloth', 8]])
            if (!a.items.some(i => i.type === type && ['hand', 'body', 'bag'].includes(i.location))) return c[n];
        return c[9];
    }
    function perceive(state) {
        const r = state.adventure?.run;
        if (!r) return false;
        core.perceive(state, { scene: 'dungeon:' + r.dungeon + ':' + r.floor, attention: [
            { id: 'opponent:' + r.dungeon + ':' + r.floor, meaning: 'adventure:enemy', x: r.enemy.x, y: r.enemy.y },
            { id: 'stairs:up:' + r.floor, meaning: 'adventure:entry', ...r.entry },
            { id: 'stairs:down:' + r.floor, meaning: 'adventure:exit', ...r.exit }
        ] }); return true;
    }
    function validate(state, world) {
        const a = state.adventure;
        if (!physical.valid(a)) return false;
        if (!a) return !world.island?.bridgeOpen && !state.knowledge.meanings.some(m=>m.source==='experienced_adventure')
            && !(state.experiences||[]).some(e=>e.adventureSource!==undefined);
        const c = a.connection;
        if (!c || c.version !== 1 || !Array.isArray(c.receipts) || world.island?.bridgeOpen !== a.building.bridge || !core.validExperienceLearning(state, rules)) return false;
        const ground=a.items.filter(i=>i.location==='ground'), places=world.island.places.filter(p=>p.id.startsWith('adventure:item:'));
        if(ground.length!==places.length || !ground.every(i=>places.some(p=>p.id==='adventure:item:'+i.id && same(p,i.position))
            && a.events.some(e=>e.kind==='drop' && e.item===i.id && same(e.position,i.position))))return false;
        if (new Set(c.receipts.map(r=>r.input?.id)).size !== c.receipts.length) return false;
        if (!c.receipts.every(r => r && teachable.includes(r.action) && parse(r.input?.raw || '', r.locale) === r.action
            && r.input.locale === r.locale && r.input.speaker === 'player' && Number.isFinite(r.input.at)
            && Number(r.input.id.slice(6)) <= state.serial
            && (r.original?.kind === 'action' && r.original.action === r.action
                || r.action === 'use' && r.original?.kind === 'use'
                || r.original?.kind === 'transfer' && (r.action === 'store' && r.original.after === 'home'
                    || r.action === 'take' && r.original.before === 'home'
                    || r.action === 'pick' && r.original.before === 'ground'
                    || r.action === 'equip' && equipTransfer(a,r.original)))
            && a.events.some(e => e.id === r.physicalSource && JSON.stringify(e) === JSON.stringify(r.original))
            && world.experiences.some(e => e.adventureSource === r.physicalSource && e.adventureTeaching?.input?.id === r.input.id
                && state.experiences?.some(s => JSON.stringify(s) === JSON.stringify(e))))) return false;
        if ((state.experiences || []).some(e => e.adventureSource !== undefined && !c.receipts.some(r => r.physicalSource === e.adventureSource && r.input.id === e.adventureTeaching?.input?.id))) return false;
        if (a.mastery.evidence.some((id, index) => {
            const e = a.events.find(e => e.id === id);
            return e.kind !== ['survey', 'deliver', 'preparation', 'field_return'][index] || !Number.isFinite(e.start) || !Number.isFinite(e.at)
                || e.at <= e.start || !Array.isArray(e.originals) || !e.originals.every(id => a.events.some(o => o.id === id && o.id < e.id));
        })) return false;
        if (['bridge', 'home'].some(p => a.building[p] && !a.events.some(e => e.kind === 'craft' && e.project === p && e.end > e.start))) return false;
        if (a.careEvents.some(id => !world.experiences.some(e => e.id === id && ['eat','rest'].includes(e.kind) && e.end > e.start
            && state.experiences?.some(s => s.id === id && s.kind === 'experience' && s.activity === e.kind && s.start === e.start && s.end === e.end)))) return false;
        if (a.training.completed && (!a.events.some(e => e.kind === 'training_complete') || a.training.evidence.length !== 5)) return false;
        if (a.run?.training) {
            const personal=a.training.personal;
            if (!Array.isArray(personal) || new Set(personal.map(i=>i.id)).size !== personal.length
                || !personal.every(p=>['hand','body','bag'].includes(p.location) && a.items.some(i=>i.id===p.id && i.location==='training_hold'))
                || a.items.some(i=>i.location==='training_hold' && !personal.some(p=>p.id===i.id))) return false;
        } else if (a.training.personal !== undefined || a.items.some(i=>i.location==='training_hold')) return false;
        if (a.events.filter(e => e.kind === 'rescue').length !== a.recoveries.length || !a.recoveries.every(r => a.events.some(e => e.id === r.event
            && e.kind === 'rescue' && e.dungeon === r.dungeon && e.floor === r.floor))) return false;
        const consumed = new Set();
        for (const e of a.events.filter(e => e.kind === 'craft')) {
            const recipe = physical.RECIPES[e.project];
            if (!recipe || !Array.isArray(e.materials) || new Set(e.materials).size !== e.materials.length) return false;
            if (e.materials.some(id => consumed.has(id))) return false;
            for (const [type,count] of Object.entries(recipe)) if (e.materials.filter(id => a.items.some(i => i.id === id && i.type === type && i.location === 'consumed')).length !== count) return false;
            if (e.materials.length !== Object.values(recipe).reduce((n,x)=>n+x,0)) return false;
            e.materials.forEach(id=>consumed.add(id));
        }
        if (a.building.learned && !a.events.some(e => e.kind === 'craft' && e.project === 'bridge' && e.end > e.start)) return false;
        if (c.task !== null && (!c.task || !['lesson', 'craft', 'enter', 'storage','pickup'].includes(c.task.kind)
            || !['start', 'steps'].includes(c.task.phase) || !Array.isArray(c.task.steps) || !Number.isInteger(c.task.index)
            || c.task.index < 0 || !Number.isFinite(c.task.remaining) || c.task.remaining < 0 || c.task.start > world.elapsed
            || c.task.steps.some(s => !s || s.go && !world.island.places.some(p => p.id === s.go)
                || s.life && !['eat','rest'].includes(s.life) || s.effect && !['survey','gather','deliver','decide','review','craft','replan','enter','store','take','pick'].includes(s.effect))
            || c.task.kind === 'craft' && !Object.hasOwn(physical.RECIPES,c.task.project)
            || c.task.kind === 'enter' && !['skull','crystal'].includes(c.task.dungeon))) return false;
        return true;
    }
    function valid(state, world) { try { return validate(state,world); } catch (_) { return false; } }
    return { init, start, stop, drop, tick, receive, hand, choice, autoCommand, perceive, valid, rules, words, commands, parse, actions, teachable, meaningFor };
});
