(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.ExperimentalWordAdventure = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';
    // Language-neutral physical events. Neither ownership nor success grants words.
    const copy = value => JSON.parse(JSON.stringify(value));
    const TYPES = Object.freeze(['wood', 'stone', 'berry', 'bag', 'stick', 'shield', 'ration', 'cloth']);
    const RECIPES = Object.freeze({ bridge: { wood: 4, stone: 2 }, home: { wood: 6, stone: 4 },
        bag: { wood: 1 }, stick: { wood: 1 }, shield: { wood: 2 }, ration: { berry: 1 }, cloth: {} });
    const RULES = Object.freeze({ capacity: 6, largeSize: 2, floors: 5, hits: 3, armoredHits: 5,
        bareHits: 3, armedHits: 2, moveFatigue: .003, moveHunger: .002, fightFatigue: .006, fightHunger: .003 });
    const same = (a, b) => a.x === b.x && a.y === b.y;
    const distance = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    function create() {
        return { version: 1, serial: 0, items: [], sources: [], events: [], damage: 0, recoveryMeal: null, careEvents: [],
            mastery: { stage: 0, evidence: [] }, building: { learned: false, bridge: false, home: false },
            training: { completed: false, floor: 1, evidence: [] }, run: null, recoveries: [], teachings: [] };
    }
    function ensure(state) { return state.adventure ||= create(); }
    function event(a, kind, data = {}) {
        const value = { id: ++a.serial, kind, ...copy(data) }; a.events.push(value); return value;
    }
    function item(a, type, source, location = 'hand', extra = {}) {
        if (!TYPES.includes(type) || !a.events.some(e => e.id === source)) return null;
        const value = { id: 'item:' + (++a.serial), type, source, location, ...extra };
        a.items.push(value); return value;
    }
    const carried = a => a.items.filter(i => ['hand', 'body', 'bag'].includes(i.location));
    const size = i => ['wood', 'stone'].includes(i.type) ? RULES.largeSize : 1;
    const equipped = (a, type) => a.items.some(i => i.type === type && (type === 'stick' ? i.location === 'hand' : i.location === 'body'));
    const limit = a => equipped(a, 'shield') ? RULES.armoredHits : RULES.hits;
    const capacity = a => a.items.some(i => i.type === 'bag' && i.location === 'body') ? RULES.capacity : 0;
    const used = a => a.items.filter(i => i.location === 'bag').reduce((n, i) => n + size(i), 0);
    function transfer(a, id, location, world) {
        const value = a.items.find(i => i.id === id);
        if (!value || !['hand', 'body', 'bag', 'home'].includes(location)) return false;
        if (value.location === location) return false;
        if (value.type === 'bag' && value.location === 'body' && location !== 'body' && used(a) > 0) return false;
        if (!['hand', 'body', 'bag', 'home', 'floor', 'ground'].includes(value.location)) return false;
        if (value.location === 'ground' && (a.run || !world || Math.hypot(world.x-value.position.x,world.y-value.position.y)>1e-6)) return false;
        if ((value.location === 'home' || location === 'home') && (!a.building.home || a.run)) return false;
        if (value.location === 'floor' && (!a.run || value.dungeon !== a.run.dungeon || value.floor !== a.run.floor
            || !same(value.position, a.run.position))) return false;
        if (location === 'bag' && used(a) + size(value) > capacity(a)) return false;
        if (location === 'hand' && a.items.some(i => i.location === 'hand')) return false;
        if (location === 'body' && (!['bag', 'shield'].includes(value.type)
            || a.items.some(i => i.location === 'body' && i.type === value.type))) return false;
        const before = value.location; value.location = location;
        delete value.dungeon; delete value.floor; delete value.position;
        event(a, 'transfer', { item: id, before, after: location }); return true;
    }
    function drop(a, world, id) {
        const i=a.items.find(i=>i.id===id);
        if(a.run || !world?.island || !i || !['hand','bag'].includes(i.location)
            || !Number.isFinite(world.x) || !Number.isFinite(world.y))return false;
        const before=i.location; i.location='ground'; i.position={x:world.x,y:world.y};
        event(a,'drop',{item:id,before,position:i.position}); return true;
    }
    function discover(a, type, place, objectId) {
        if (!['wood', 'stone', 'berry'].includes(type) || typeof objectId !== 'string' || !objectId
            || place !== ({ wood: 'forest', stone: 'mountain', berry: 'forest' })[type]
            || a.sources.some(s => s.objectId === objectId)) return false;
        const original = event(a, 'material_seen', { type, place, objectId });
        a.sources.push({ type, place, objectId, event: original.id, collected: false }); return true;
    }
    function collect(a, type, place, objectId) {
        if (a.run || !['wood', 'stone', 'berry'].includes(type)
            || place !== ({ wood: 'forest', stone: 'mountain', berry: 'forest' })[type]) return null;
        const source = a.sources.find(s => s.objectId === objectId && s.type === type && s.place === place && !s.collected);
        if (!source) return null;
        const location = used(a) + size({ type }) <= capacity(a) ? 'bag'
            : !a.items.some(i => i.location === 'hand') ? 'hand' : null;
        if (!location) return null;
        source.collected = true;
        return item(a, type, event(a, 'gather', { type, place, objectId, source: source.event }).id, location);
    }
    // Materials may be delivered at the builder before a bag exists; they retain
    // an explicit project location rather than an abstract island storage.
    function deliver(a, id, project) {
        const value = a.items.find(i => i.id === id);
        if (a.run || !value || !['hand', 'bag'].includes(value.location) || !Object.hasOwn(RECIPES, project)
            || !Object.hasOwn(RECIPES[project], value.type)) return false;
        value.location = 'project'; value.project = project;
        event(a, 'deliver', { item: id, project }); return true;
    }
    function craft(a, project, method = 'request') {
        if (a.run || !Object.hasOwn(RECIPES, project) || !['request', 'self'].includes(method)
            || method === 'self' && !a.building.learned || a.building[project] === true) return null;
        const chosen = [];
        for (const [type, count] of Object.entries(RECIPES[project])) {
            const matches = a.items.filter(i => i.type === type && i.location === 'project' && i.project === project);
            if (matches.length < count) return null;
            chosen.push(...matches.slice(0, count));
        }
        const location = ['bag', 'shield'].includes(project) && !equipped(a, project) ? 'body'
            : !a.items.some(i => i.location === 'hand') ? 'hand' : used(a) + 1 <= capacity(a) ? 'bag' : null;
        if (!['bridge', 'home'].includes(project) && !location) return null;
        const result = event(a, 'craft', { project, method, materials: chosen.map(i => i.id) });
        for (const i of chosen) i.location = 'consumed';
        if (['bridge', 'home'].includes(project)) a.building[project] = true;
        else item(a, project, result.id, location);
        if (project === 'bridge') a.building.learned = true;
        return result;
    }
    function recordLesson(a, action, source, inputId, word, locale) {
        const original = a.events.find(e => e.id === source);
        if (!original || typeof word !== 'string' || !word.trim() || typeof inputId !== 'string'
            || !['player', 'master'].some(s => inputId.startsWith(s + ':')) || typeof locale !== 'string') return null;
        if (original.action !== action && original.kind !== action) return null;
        if (a.teachings.some(k => k.inputId === inputId)) return null;
        const value = { action, source, inputId, word, locale }; a.teachings.push(copy(value)); return value;
    }
    function certify(a, evidence) {
        if (a.run || a.mastery.stage >= 4 || !Number.isInteger(evidence)) return false;
        const e = a.events.find(e => e.id === evidence), required = ['survey', 'deliver', 'preparation', 'field_return'][a.mastery.stage];
        if (!e || e.kind !== required || a.mastery.evidence.includes(e.id)) return false;
        a.mastery.evidence.push(e.id); a.mastery.stage++; event(a, 'master_review', { stage: a.mastery.stage, evidence }); return true;
    }
    function floor(dungeon, number, serial) {
        // Every generated room has a connected perimeter. Objects never block
        // either staircase; retained recovery items use reachable floor cells.
        const grid = ['#########', '#.......#', '#.......#', '#.......#', '#.......#', '#.......#', '#########'];
        return { dungeon, floor: number, seed: serial, grid, position: { x: 1, y: 1 }, entry: { x: 1, y: 1 }, exit: { x: 7, y: 5 },
            enemy: { x: 4 + serial % 2, y: 3, phase: 'idle', hits: 0, defeated: false, observed: false },
            retreating: false, turn: 0, lesson: 0, last: null };
    }
    function enter(a, dungeon) {
        if (a.run || a.mastery.stage !== 4 || !a.building.bridge || a.damage >= limit(a)
            || !['skull', 'crystal'].includes(dungeon)) return false;
        const training = !a.training.completed;
        if (training) {
            // Personal property remains at its real pre-training location. Loan
            // items are isolated and returned; they never replace personal items.
            a.training.personal = carried(a).map(i => ({ id: i.id, location: i.location }));
            for (const i of carried(a)) i.location = 'training_hold';
            const source = event(a, 'loan', { dungeon }).id;
            for (const [type, location] of [['bag', 'body'], ['stick', 'bag'], ['shield', 'bag'], ['ration', 'bag'], ['cloth', 'bag']])
                item(a, type, source, location, { loan: true });
        }
        a.run = { ...floor(dungeon, training ? a.training.floor : 1, ++a.serial), training };
        if (training && a.training.evidence.some(e => e.floor === a.run.floor)) a.run.lesson = 1;
        placeRecoveries(a); placeSupplies(a); event(a, 'enter', { dungeon, training, floor: a.run.floor }); return true;
    }
    function placeSupplies(a) {
        const run = a.run;
        if (run.training) return;
        for (const [type, x] of [['ration', 2], ['cloth', 3]]) {
            if (a.events.some(e => e.kind === 'floor_supply' && e.dungeon === run.dungeon && e.floor === run.floor && e.type === type)) continue;
            const position = { x, y: 1 }, source = event(a, 'floor_supply', { dungeon: run.dungeon, floor: run.floor, type, position });
            item(a, type, source.id, 'floor', { dungeon: run.dungeon, floor: run.floor, position: { ...position } });
        }
    }
    function placeRecoveries(a) {
        for (const i of a.items.filter(i => i.location === 'floor' && i.dungeon === a.run.dungeon && i.floor === a.run.floor))
            if (a.recoveries.some(r => r.items.includes(i.id))) i.position = { x: 2, y: 1 };
    }
    function changeFloor(a, number, upstairs) {
        const current = a.run, rooms = current.rooms || {};
        const retained = { ...current }; delete retained.rooms;
        rooms[current.floor] = copy(retained);
        const next = rooms[number] ? copy(rooms[number]) : floor(current.dungeon, number, ++a.serial);
        a.run = { ...next, training: current.training, retreating: current.retreating, rooms };
        a.run.position = { ...(upstairs ? a.run.exit : a.run.entry) };
        if (current.training && a.training.evidence.some(e => e.floor === number)) a.run.lesson = 1;
        placeRecoveries(a); placeSupplies(a);
    }
    function returnIsland(a, reason) {
        const run = a.run;
        if (!run) return null;
        if (run.training) {
            for (const i of a.items.filter(i => i.loan && i.location !== 'consumed')) i.location = 'returned';
            for (const p of a.training.personal || []) {
                const i = a.items.find(i => i.id === p.id); if (i) i.location = p.location;
            }
            delete a.training.personal;
            if (reason === 'walked_out' && [1, 2, 3, 4, 5].every(n => a.training.evidence.some(e => e.floor === n))) {
                a.training.completed = true;
                event(a, 'training_complete', { evidence: a.training.evidence.map(e => e.review) });
            }
        }
        const result = event(a, 'return', { dungeon: run.dungeon, floor: run.floor, reason, training: run.training });
        a.run = null; return result;
    }
    function rescue(a, reason) {
        if (!a.run) return null;
        if (a.run.training) return returnIsland(a, 'master_safety');
        const source = event(a, 'rescue', { dungeon: a.run.dungeon, floor: a.run.floor, reason, damage: a.damage });
        const ids = [];
        for (const i of carried(a)) {
            i.location = 'floor'; i.dungeon = a.run.dungeon; i.floor = a.run.floor; i.position = { ...a.run.position }; ids.push(i.id);
        }
        a.recoveries.push({ event: source.id, dungeon: a.run.dungeon, floor: a.run.floor, items: ids });
        return returnIsland(a, reason);
    }
    function consume(a, world, id) {
        const i = a.items.find(i => i.id === id);
        if (!i || !['hand', 'bag'].includes(i.location) || !['ration', 'cloth'].includes(i.type)) return null;
        if (i.type === 'cloth' && a.damage === 0 || i.type === 'ration' && world.hunger === 0) return null;
        const before = { damage: a.damage, hunger: world.hunger };
        if (i.type === 'cloth') a.damage = Math.max(0, a.damage - 1);
        else world.hunger = Math.max(0, world.hunger - .55);
        i.location = 'consumed';
        return event(a, 'use', { action: 'use', item: i.id, type: i.type, before, after: { damage: a.damage, hunger: world.hunger } });
    }
    function care(a, lifeEvent) {
        if (a.run || !lifeEvent || lifeEvent.kind !== 'experience' || !Number.isInteger(lifeEvent.id) || a.careEvents.includes(lifeEvent.id)
            || !Number.isFinite(lifeEvent.start) || !Number.isFinite(lifeEvent.end) || lifeEvent.end <= lifeEvent.start) return false;
        if (lifeEvent.activity === 'eat') { a.recoveryMeal = lifeEvent.id; a.careEvents.push(lifeEvent.id); return false; }
        if (lifeEvent.activity !== 'rest' || a.recoveryMeal === null || lifeEvent.id <= a.recoveryMeal
            || !(lifeEvent.end > lifeEvent.start) || a.damage === 0) return false;
        a.damage--; a.careEvents.push(lifeEvent.id); a.recoveryMeal = null;
        event(a, 'care', { source: lifeEvent.id, damage: a.damage }); return true;
    }
    function toward(run, target, avoid = false) {
        const queue = [{ ...run.position, first: null }], seen = new Set([run.position.x + ',' + run.position.y]);
        for (let index = 0; index < queue.length; index++) {
            const p = queue[index]; if (same(p, target)) return p.first;
            for (const [dx, dy] of [[1, 0], [0, 1], [-1, 0], [0, -1]]) {
                const n = { x: p.x + dx, y: p.y + dy }, key = n.x + ',' + n.y;
                if (seen.has(key) || run.grid[n.y]?.[n.x] !== '.' || !run.enemy.defeated && same(n, run.enemy)
                    || avoid && !run.enemy.defeated && distance(n, run.enemy) <= 1) continue;
                seen.add(key); queue.push({ ...n, first: p.first || n });
            }
        }
        return null;
    }
    function step(a, world, action = 'observe', target = null, inputId = null) {
        const run = a.run;
        if (!run || !['observe', 'walk', 'attack', 'avoid', 'return', 'down', 'up', 'use', 'equip', 'pick'].includes(action)) return null;
        if (a.damage >= limit(a) || world.fatigue >= 1) return rescue(a, a.damage >= limit(a) ? 'injury' : 'exhaustion');
        const before = copy(run.position), enemy = run.enemy, damageBefore = a.damage;
        let applied = false, effect = null;
        if (action === 'observe') { enemy.observed = true; applied = true; }
        else if (action === 'equip') {
            const i = a.items.find(i => i.id === target && ['hand', 'bag'].includes(i.location));
            if (i) applied = transfer(a, i.id, i.type === 'stick' ? 'hand' : 'body');
        } else if (action === 'use') { effect = consume(a, world, target); applied = !!effect; }
        else if (action === 'pick') {
            const i=a.items.find(i=>i.id===target && i.location==='floor' && i.dungeon===run.dungeon && i.floor===run.floor);
            if(i)applied=transfer(a,target,used(a)+size(i)<=capacity(a)?'bag':'hand');
        }
        else if (action === 'attack') {
            if (!enemy.defeated && distance(run.position, enemy) === 1) {
                const armed = equipped(a, 'stick');
                enemy.hits += armed ? 1.5 : 1; enemy.defeated = enemy.hits >= RULES.bareHits;
                applied = true; effect = { armed, hits: enemy.hits, defeated: enemy.defeated };
            }
        } else if (['down', 'up'].includes(action)) {
            if (action === 'up' && same(run.position, run.entry)) {
                if (run.floor === 1) return returnIsland(a, 'walked_out');
                changeFloor(a, run.floor - 1, true); applied = true;
            } else if (action === 'down' && same(run.position, run.exit) && run.floor < RULES.floors) {
                if (run.training && run.lesson < 1) return null;
                changeFloor(a, run.floor + 1, false);
                if (run.training) a.training.floor = a.run.floor;
                applied = true;
            }
        } else {
            if (action === 'return') run.retreating = true;
            const goal = action === 'avoid' ? null : action === 'return' || run.retreating ? run.entry : target || run.exit;
            let next;
            if (goal && Number.isInteger(goal.x) && Number.isInteger(goal.y)) next = toward(run, goal, enemy.observed && !enemy.defeated && !target);
            else if (action === 'avoid') next = [[1, 0], [0, 1], [-1, 0], [0, -1]].map(([dx, dy]) => ({ x: run.position.x + dx, y: run.position.y + dy }))
                .find(p => run.grid[p.y]?.[p.x] === '.' && distance(p, enemy) > distance(run.position, enemy));
            if (next) { run.position = next; applied = true; }
        }
        if (!applied) return null;
        const fight = ['attack', 'avoid'].includes(action), moved = !same(before, a.run?.position || before);
        world.fatigue = Math.min(1, world.fatigue + (fight ? RULES.fightFatigue : moved ? RULES.moveFatigue : 0));
        world.hunger = Math.min(1, world.hunger + (fight ? RULES.fightHunger : moved ? RULES.moveHunger : 0));
        // A visible preparation always precedes an attack. The same turn cannot
        // both prepare and hit. Moving out of reach makes the prepared hit miss.
        if (a.run === run && !enemy.defeated) {
            if (enemy.phase === 'ready') {
                if (distance(run.position, enemy) === 1) {
                    if (run.training && a.damage >= limit(a) - 1) event(a, 'master_intervention', { floor: run.floor, reason: 'injury' });
                    else a.damage++;
                }
                enemy.phase = 'idle';
            }
            else if (distance(run.position, enemy) === 1) enemy.phase = 'ready';
            else if (distance(run.position, enemy) > 1) {
                const options = [[1, 0], [0, 1], [-1, 0], [0, -1]].map(([dx, dy]) => ({ x: enemy.x + dx, y: enemy.y + dy }))
                    .filter(p => run.grid[p.y]?.[p.x] === '.' && !same(p, run.position) && !same(p, run.entry) && !same(p, run.exit));
                const next = options.sort((x, y) => distance(x, run.position) - distance(y, run.position))[0];
                if (next) { enemy.x = next.x; enemy.y = next.y; }
            }
        }
        const result = event(a, 'action', { action, inputId, dungeon: run.dungeon, floor: run.floor, training: run.training, before, after: a.run?.position || null,
            effect, damageBefore, damage: a.damage, equipment: { shield: equipped(a,'shield'), stick: equipped(a,'stick') },
            enemy: copy(enemy), fatigue: world.fatigue, hunger: world.hunger });
        if (a.run) { a.run.turn++; a.run.last = result.id; }
        if (a.damage >= limit(a) || world.fatigue >= 1) rescue(a, a.damage >= limit(a) ? 'injury' : 'exhaustion');
        return result;
    }
    function reviewTraining(a) {
        const run = a.run;
        if (!run?.training || a.training.evidence.some(e => e.floor === run.floor)) return false;
        const start = [...a.events].reverse().find(e => e.kind === 'enter' && e.training)?.id;
        const actions = a.events.filter(e => e.kind === 'action' && e.training && e.floor === run.floor && e.id > start);
        const did = action => actions.some(e => e.action === action);
        const uses = type => actions.some(e => e.action === 'use' && e.effect?.type === type);
        const success = run.floor === 1 ? did('observe') && did('walk')
            : run.floor === 2 ? did('attack') && did('avoid')
            : run.floor === 3 ? actions.some(e => e.action === 'attack' && e.effect?.armed)
                && actions.some(e => e.damage > e.damageBefore && e.equipment?.shield === true)
                && uses('ration') && uses('cloth')
            : run.floor === 4 ? actions.some(e => e.action === 'return' && (e.damage > 0 || e.fatigue >= .55 || e.hunger >= .45))
            : did('walk') && did('return');
        if (!success) return false;
        const result = event(a, 'training_review', { floor: run.floor, actions: actions.map(e => e.id) });
        a.training.evidence.push({ floor: run.floor, review: result.id }); run.lesson = 1; return true;
    }
    function decide(a, world) {
        const run = a.run; if (!run) return null;
        if (world.fatigue >= .7 || world.hunger >= .75 || a.damage >= limit(a) - 1) run.retreating = true;
        if (run.retreating) return { action: same(run.position, run.entry) ? 'up'
            : toward(run, run.entry, true) ? 'return'
            : run.enemy.phase === 'ready' && distance(run.position, run.enemy) === 1 ? 'avoid' : 'observe' };
        if (!run.enemy.observed) return { action: 'observe' };
        if (run.enemy.phase === 'ready' && distance(run.position, run.enemy) === 1) return { action: 'avoid' };
        const learnedAttack = a.events.some(e => e.kind === 'action' && e.action === 'attack' && e.effect);
        if (!run.enemy.defeated && distance(run.position, run.enemy) === 1 && learnedAttack) return { action: 'attack' };
        // This is the actor's memory of its own belongings, not word knowledge.
        // Picking them up and putting equipment on still take physical hands.
        const held=carried(a).find(i=>['bag','shield'].includes(i.type) && i.location!=='body');
        if(held)return {action:'equip',target:held.id};
        const recoverable=a.items.filter(i=>i.location==='floor' && i.dungeon===run.dungeon && i.floor===run.floor
            && (a.recoveries.some(r=>r.items.includes(i.id)) || a.events.some(e=>e.id===i.source && e.kind==='floor_supply'))
            && (!a.items.some(h=>h.location==='hand') || used(a)+size(i)<=capacity(a)))
            .sort((a,b)=>Number(b.type==='bag')-Number(a.type==='bag'));
        const recovered=recoverable[0];
        if(recovered)return same(run.position,recovered.position)?{action:'pick',target:recovered.id}:{action:'walk',target:recovered.position};
        if (same(run.position, run.exit)) {
            if (run.floor === RULES.floors) { run.retreating = true; return { action: 'return' }; }
            return { action: 'down' };
        }
        return { action: toward(run, run.exit, run.enemy.observed && !run.enemy.defeated) ? 'walk' : 'observe' };
    }
    function validate(a) {
        if (a === undefined) return true;
        if (!a || a.version !== 1 || !Number.isSafeInteger(a.serial) || a.serial < 0 || !Number.isInteger(a.damage) || a.damage < 0
            || !Array.isArray(a.items) || !Array.isArray(a.sources) || !Array.isArray(a.events) || !Array.isArray(a.recoveries) || !Array.isArray(a.teachings)
            || !Array.isArray(a.careEvents) || !a.mastery || !a.building || !a.training) return false;
        const events = new Set(a.events.map(e => e.id)), ids = new Set(a.items.map(i => i.id));
        if (events.size !== a.events.length || ids.size !== a.items.length || a.events.some(e => !Number.isSafeInteger(e.id) || e.id > a.serial || e.id < 1)) return false;
        if (new Set(a.sources.map(s => s.objectId)).size !== a.sources.length || !a.sources.every(s => typeof s.objectId === 'string'
            && typeof s.collected === 'boolean' && a.events.some(e => e.id === s.event && e.kind === 'material_seen'
                && e.objectId === s.objectId && e.type === s.type && e.place === s.place)
            && a.events.filter(e => e.kind === 'gather' && e.source === s.event).length === (s.collected ? 1 : 0))) return false;
        if (!Number.isInteger(a.mastery.stage) || a.mastery.stage < 0 || a.mastery.stage > 4 || !Array.isArray(a.mastery.evidence)
            || a.mastery.evidence.length !== a.mastery.stage || !a.mastery.evidence.every(id => events.has(id))
            || !['learned', 'bridge', 'home'].every(k => typeof a.building[k] === 'boolean') || typeof a.training.completed !== 'boolean'
            || !Number.isInteger(a.training.floor) || a.training.floor < 1 || a.training.floor > RULES.floors
            || !Array.isArray(a.training.evidence) || !a.training.evidence.every(e => Number.isInteger(e.floor) && e.floor >= 1 && e.floor <= 5
                && a.events.some(original => original.id === e.review && original.kind === 'training_review' && original.floor === e.floor))
            || new Set(a.training.evidence.map(e => e.floor)).size !== a.training.evidence.length) return false;
        if (!a.items.every(i => TYPES.includes(i.type) && typeof i.id === 'string' && events.has(i.source)
            && a.events.some(e => e.id === i.source && (e.kind === 'loan' && i.loan === true
                || e.kind === 'gather' && e.type === i.type || e.kind === 'craft' && e.project === i.type
                || e.kind === 'floor_supply' && e.type === i.type))
            && (i.loan === true || a.items.filter(other => other.source === i.source).length === 1)
            && ['hand', 'body', 'bag', 'home', 'floor', 'ground', 'project', 'consumed', 'returned', 'training_hold'].includes(i.location)
            && (i.location !== 'ground' || i.position && Number.isFinite(i.position.x) && Number.isFinite(i.position.y) && Math.abs(i.position.x)<10 && Math.abs(i.position.y)<10)
            && (i.location !== 'home' || a.building.home)
            && (i.location !== 'floor' || ['skull', 'crystal'].includes(i.dungeon) && Number.isInteger(i.floor) && i.floor >= 1 && i.floor <= RULES.floors
                && Number.isInteger(i.position?.x) && Number.isInteger(i.position?.y))
            && (i.location !== 'project' || Object.hasOwn(RECIPES, i.project)))) return false;
        const supplies = a.events.filter(e => e.kind === 'floor_supply');
        if (new Set(supplies.map(e => e.dungeon + ':' + e.floor + ':' + e.type)).size !== supplies.length
            || !supplies.every(e => a.training.completed && ['skull','crystal'].includes(e.dungeon)
                && Number.isInteger(e.floor) && e.floor >= 1 && e.floor <= RULES.floors && ['ration','cloth'].includes(e.type)
                && e.position?.x === (e.type === 'ration' ? 2 : 3) && e.position.y === 1
                && a.items.some(i => i.source === e.id && i.type === e.type))) return false;
        if (a.items.filter(i => i.location === 'hand').length > 1 || used(a) > capacity(a)
            || ['bag', 'shield'].some(type => a.items.filter(i => i.location === 'body' && i.type === type).length > 1)) return false;
        if (!a.recoveries.every(r => events.has(r.event) && Array.isArray(r.items) && r.items.every(id => ids.has(id)))
            || !a.teachings.every(k => events.has(k.source) && typeof k.word === 'string' && typeof k.inputId === 'string' && typeof k.locale === 'string')) return false;
        const roomValid = run => !!run && ['skull', 'crystal'].includes(run.dungeon) && Number.isInteger(run.floor) && run.floor >= 1 && run.floor <= RULES.floors
            && typeof run.training === 'boolean' && typeof run.retreating === 'boolean' && Array.isArray(run.grid) && run.grid.length === 7
            && run.grid.every(row => typeof row === 'string' && row.length === 9 && /^[#.]+$/.test(row))
            && Number.isInteger(run.position?.x) && Number.isInteger(run.position?.y) && run.grid[run.position.y]?.[run.position.x] === '.'
            && [run.entry, run.exit].every(p => Number.isInteger(p?.x) && Number.isInteger(p?.y) && run.grid[p.y]?.[p.x] === '.')
            && Number.isFinite(run.enemy?.hits) && Number.isInteger(run.enemy.hits * 2) && run.enemy.hits >= 0
            && Number.isInteger(run.enemy.x) && Number.isInteger(run.enemy.y) && run.grid[run.enemy.y]?.[run.enemy.x] === '.'
            && typeof run.enemy.defeated === 'boolean' && typeof run.enemy.observed === 'boolean' && ['idle', 'ready'].includes(run.enemy.phase);
        const run = a.run;
        return run === null || roomValid(run) && (run.rooms === undefined || run.rooms && !Array.isArray(run.rooms)
            && Object.keys(run.rooms).length <= RULES.floors && Object.entries(run.rooms).every(([number, room]) => /^[1-5]$/.test(number)
                && room.floor === Number(number) && room.dungeon === run.dungeon && room.rooms === undefined && roomValid(room)));
    }
    function valid(a) { try { return validate(a); } catch (_) { return false; } }
    return Object.freeze({ RULES, TYPES, RECIPES, create, ensure, event, discover, collect, deliver, craft, transfer, recordLesson, certify,
        enter, step, decide, rescue, care, drop, use: consume, reviewTraining, carried, capacity, used, limit, valid });
});
