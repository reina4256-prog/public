// Calendar planning and deterministic, event-based person simulation.
(function (root) {
    'use strict';
    const clone = value => JSON.parse(JSON.stringify(value));
    const config = { version: 1, actionLimitMs: 7 * 86400000, forecastWeeks: 12,
        ageUnitMs: 86400 * 50, sleepGapMs: 5000, walkPixelsPerMs: .035, ordinaryTickMs: 50 };
    const actions = ['blank', 'free', 'study', 'train', 'run', 'rest', 'eat', 'walk', 'gather', 'fish', 'mix', 'tailor'];
    const number = (v, fallback = 0) => Number.isFinite(Number(v)) ? Number(v) : fallback;
    const clamp = (v, max = 100) => Math.max(0, Math.min(max, v));
    function empty() { return { version: config.version, enabled: false, days: Array.from({ length: 7 }, () => []) }; }
    function validate(plan) {
        if (!plan || plan.version !== config.version || !Array.isArray(plan.days) || plan.days.length !== 7) throw Error('invalid_plan');
        const result = clone(plan);
        for (const day of result.days) {
            if (!Array.isArray(day) || day.length > 96) throw Error('invalid_plan');
            day.sort((a, b) => a.start - b.start);
            let end = 0;
            for (const slot of day) {
                if (!Number.isInteger(slot.start) || !Number.isInteger(slot.end) || slot.start < end || slot.end <= slot.start || slot.end > 1440 || !actions.includes(slot.action)) throw Error('invalid_slot');
                if (slot.action === 'free' && (!Array.isArray(slot.allowed) || !slot.allowed.length || slot.allowed.some(a => !['study', 'train', 'run', 'walk', 'gather', 'fish'].includes(a)))) throw Error('invalid_free');
                if (slot.action === 'eat' && (!slot.meal || !Array.isArray(slot.meal.sources) || !slot.meal.sources.length || slot.meal.sources.some(s => !['inventory', 'freezer'].includes(s)))) throw Error('invalid_meal');
                end = slot.end;
            }
        }
        return result;
    }
    function timeline(plan, day) {
        const result = []; let start = 0;
        for (const slot of plan.days[day]) {
            if (slot.start > start) result.push({ start, end: slot.start, action: 'blank' });
            result.push(slot); start = slot.end;
        }
        if (start < 1440) result.push({ start, end: 1440, action: 'blank' });
        return result;
    }
    // One local minute is an event boundary, including DST repeats/skips.
    function calendar(plan, time) {
        const date = new Date(time), minute = date.getHours() * 60 + date.getMinutes();
        const slot = plan?.enabled ? plan.days[date.getDay()].find(s => s.start <= minute && minute < s.end) : null;
        const key = slot ? [date.getFullYear(), date.getMonth(), date.getDate(), slot.start, slot.end].join(':') : 'blank';
        return { slot: slot || { action: 'blank', start: minute, end: minute + 1 }, key,
            next: time + (60 - date.getSeconds()) * 1000 - date.getMilliseconds() };
    }
    function hash(text) { let h = 2166136261; for (const c of text) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; }
    function initialize(actor) {
        actor.stats ||= {};
        for (const key of ['intel', 'power', 'speed', 'beauty']) actor.stats[key] = number(actor.stats[key], 10);
        actor.stats.mood = number(actor.stats.mood, 100);
        actor.energy = number(actor.energy, 100); actor.hunger = number(actor.hunger, 100);
        actor.maxHunger = Math.max(100, number(actor.maxHunger, 100));
        actor.routineState ||= {};
    }
    function eventsAdd(events, id, action, status, at, detail) {
        const key = [id, action, status, detail || ''].join('/');
        const event = events.find(e => e.key === key);
        if (event) { event.count++; event.lastAt = at; }
        else events.push({ key, personId: id, action, status, at, lastAt: at, count: 1, detail });
    }
    function move(actor, state, duration) {
        let left = duration;
        while (state.path?.length) {
            const p = state.path[0], from = state.position;
            if (p.transition) { state.position = { x: p.x, y: p.y, kind: p.kind }; state.path.shift(); continue; }
            const distance = Math.hypot(p.x - from.x, p.y - from.y);
            if (distance > 0 && left <= 0) break;
            const needed = distance / (p.kind === 'home' ? 1 / 220 : config.walkPixelsPerMs);
            if (left >= needed) { state.position = { ...p, flip: p.x === from.x ? from.flip : p.x < from.x }; state.path.shift(); left -= needed; }
            else {
                state.position = { x: from.x + (p.x - from.x) * left / needed, y: from.y + (p.y - from.y) * left / needed, kind: from.kind, flip: p.x === from.x ? from.flip : p.x < from.x };
                left = 0;
            }
        }
        if (!state.path?.length && state.destination) state.position = { ...state.destination, flip: state.position?.flip };
        if (state.position) { actor.x = state.position.x; actor.y = state.position.y; actor.flip = state.position.flip; }
        return left;
    }
    function rates(actor, type, context) {
        const trait = context.trait?.(actor) || {};
        const consumption = actor.godMode ? 0 : number(trait.consumption, 1);
        const watch = context.watch?.(actor) ?? -1;
        const drain = .005 * (1000 / config.ordinaryTickMs) * consumption * (['train', 'run'].includes(type) ? 1.5 : 1) * (watch >= 0 ? Math.max(.1, .8 - watch * .02) : 1);
        const eff = context.efficiency?.(type, actor) ?? 1;
        const focus = actor.buffs?.focus > 0 ? 1.5 : 1;
        const stat = type === 'study' ? 'intel' : type === 'train' ? 'power' : type === 'run' ? 'speed' : null;
        const bonus = stat === 'intel' ? number(trait.statBonus?.intel, 1) : number(trait.statBonus?.power, 1);
        return { drain, eff, stat, gain: .1 * eff * bonus * focus * (type === 'train' && actor.buffs?.tough > 0 ? 1.5 : 1), consumption };
    }
    // Pure person effects: also called by the ordinary task completion path.
    // Persistence and presentation belong to the caller, never to a forecast.
    function completeSleep(actor, type, recovery) {
        let bonus = 0;
        if (type === 'sleep' || type === 'rest') {
            if (actor.energy >= 60 && actor.hunger >= 60) {
                actor.consecutiveSleepCount = number(actor.consecutiveSleepCount) + 1;
                if (actor.consecutiveSleepCount >= 2) bonus = actor.consecutiveSleepCount * 2;
                actor.stats.beauty += bonus;
            }
        } else if (!recovery) actor.consecutiveSleepCount = 0;
        return bonus;
    }
    function completeBooks(actor) {
        const used = [];
        for (const book of actor.activeBooks || []) {
            if (book.charges > 0) {
                book.charges--;
                actor.stats[book.stat] += book.val;
                used.push({ ...book });
                if (book.charges <= 0 && !actor.resident && book.id) {
                    actor.consumedLegacyBookIds ||= [];
                    if (!actor.consumedLegacyBookIds.includes(book.id)) actor.consumedLegacyBookIds.push(book.id);
                }
            }
        }
        if (actor.activeBooks) actor.activeBooks = actor.activeBooks.filter(book => book.charges > 0);
        return used;
    }
    function completeExile(actor, type) {
        const app = actor.apprentice;
        if (!app?.isExcommunicated || !['study', 'train', 'run'].includes(type)) return false;
        app.exileTrainingCount = number(app.exileTrainingCount) + 1;
        if (app.exileTrainingCount < 10) return false;
        app.isExcommunicated = false;
        app.exileTrainingCount = 0;
        if (app.excommunicatedFrom) (app.attempts ||= {})[app.excommunicatedFrom] = 3;
        return true;
    }
    function startBuffs(actor) {
        for (const key of ['focus', 'tough']) if (actor.buffs?.[key] > 0) actor.buffs[key]--;
    }
    function completeFocusedStudy(actor) {
        if (!(actor.buffs?.focus > 0)) return;
        for (const quest of actor.apprentice?.activeQuests || []) {
            if (quest.masterType === 'pharmacist' && quest.desc?.includes('集中薬')) quest.qVal = number(quest.qVal) + 1;
        }
    }
    function completeScheduled(actor, type, state, context, at) {
        if (state.effectsCompleted) return;
        state.effectsCompleted = true;
        const recovery = ['sleep', 'rest', 'eat'].includes(type);
        completeSleep(actor, type, recovery);
        completeBooks(actor);
        completeExile(actor, type);
        if (type === 'study') completeFocusedStudy(actor);
        if (!recovery && actor.age > (actor.lifespan || 100) * .5 && actor.stats.mood <= 30) {
            actor.darknessCounter = number(actor.darknessCounter) + 1;
        }
        context.complete?.(actor, type, state, at);
    }
    function medicineEffect(actor, id) {
        actor.conditions ||= {}; actor.buffs ||= {};
        if (id === 'item_medicine_cure' || id === 'elixir') {
            actor.isSick = false;
            for (const key of ['cold', 'stomachache', 'poisoning']) actor.conditions[key] = false;
            if (!actor.resident) actor.lifespan += id === 'elixir' ? 10 : -5;
        } else if (id === 'item_medicine_cold') actor.conditions.cold = false;
        else if (id === 'item_medicine_stomach') actor.conditions.stomachache = false;
        else if (id === 'item_antidote') actor.conditions.poisoning = false;
        else if (id === 'item_medicine_focus') actor.buffs.focus = 5;
    }
    function nutritionEffect(actor, data, trait = {}) {
        let energy = 5, hunger = 10;
        if (data.stats) {
            energy = data.stats.energy || 0;
            hunger = data.stats.hunger || 20;
            for (const key of ['power', 'intel', 'mood']) {
                if (data.stats[key]) actor.stats[key] += data.stats[key] * (trait.statBonus?.[key] || 1);
            }
        }
        actor.energy = Math.min(100, actor.energy + energy);
        actor.hunger = Math.min(actor.maxHunger || 100, actor.hunger + hunger);
    }
    function foodRisk(base, healthPlus = -1) {
        return base * (healthPlus >= 0 ? Math.max(0, .5 - healthPlus * .05) : 1);
    }
    function consumeSelected(actor, data, id, trait, healthPlus, random) {
        actor.conditions ||= {};
        if (data.type === 'medicine') { medicineEffect(actor, id); return; }
        nutritionEffect(actor, data, trait);
        if (id === 'poison_mushroom') {
            if (random() < foodRisk(1, healthPlus)) { actor.conditions.poisoning = true; actor.stats.mood -= 30; }
            else actor.stats.mood -= 10;
        }
        if (id.startsWith('fish_') && data.type !== 'dish' && data.quality !== 'bad' && random() < foodRisk(.25, healthPlus)) {
            actor.conditions.stomachache = true; actor.stats.mood -= 10;
        }
        if (data.quality === 'bad') {
            actor.stats.mood -= 20;
            if (random() < foodRisk(.3, healthPlus)) actor.conditions.stomachache = true;
        }
    }
    function food(actor, slot, context, time) {
        const options = slot.meal || { sources: ['inventory'], itemId: slot.targetItem || '' };
        if (actor.hunger >= actor.maxHunger && !options.itemId && !actor.isSick && !Object.values(actor.conditions || {}).some(Boolean)) return true;
        for (const source of options.sources) {
            if (context.canUseSource && !context.canUseSource(actor, source)) continue;
            const inventory = context.items(actor, source);
            if (!inventory) continue;
            const candidates = inventory.map((item, index) => ({ item, index, data: context.food?.(item, time, source, actor, options) }))
                .filter(c => c.data && (!options.itemId || (typeof c.item === 'string' ? c.item : c.item.id) === options.itemId))
                .sort((a, b) => number(b.data.stats?.hunger, 10) - number(a.data.stats?.hunger, 10));
            const selected = candidates[0]; if (!selected) continue;
            inventory.splice(selected.index, 1);
            const id = typeof selected.item === 'string' ? selected.item : selected.item.id;
            let seed = hash(actor.personId + ':' + actor.routineState.key + ':meal');
            const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
            consumeSelected(actor, selected.data, id, context.trait?.(actor) || {}, context.health?.(actor) ?? -1, random);
            return true;
        }
        return false;
    }
    function simulateActor(actor, plan, from, to, context, events, immediate) {
        initialize(actor);
        const id = actor.personId;
        let cursor = from;
        while (cursor < to) {
            const cal = calendar(plan, cursor);
            const queued = immediate?.[0];
            const task = queued && ['study', 'train', 'run', 'rest', 'sleep', 'eat'].includes(queued.type) ? queued : null;
            if (queued && !task) {
                // Preserve interactive work while passive time still reaches its boundary.
                const end = context.limitEnd ? context.limitEnd(actor, cursor, to) : to;
                context.advanceTime?.(actor, cursor, end);
                return;
            }
            if (task && (!Number.isFinite(task.duration) || task.duration <= 0)) {
                immediate.shift(); eventsAdd(events, id, task.type, 'invalid', cursor); continue;
            }
            const slot = task ? { ...task, meal: task.routineMeal || task.meal, action: task.type === 'sleep' ? 'rest' : task.type, destination: 'current' } : cal.slot;
            if (task && !task.routineId) task.routineId = 'immediate:' + id + ':' + cursor;
            const key = task ? task.routineKey || task.routineId : cal.key;
            const state = actor.routineState;
            if (state.key === key && state.resumeTravel) {
                const travel = context.route?.(actor, slot, state.position);
                if (travel?.error) { state.failed = travel.error; eventsAdd(events, id, state.action, travel.error, cursor); }
                else if (travel) Object.assign(state, travel);
                delete state.resumeTravel;
            }
            if (state.key !== key) {
                if (state.path?.length) eventsAdd(events, id, state.action, 'travel_short', cursor);
                const position = state.position;
                Object.keys(state).forEach(k => delete state[k]);
                Object.assign(state, { key, action: slot.action, seconds: 0, position });
                if (slot.action === 'free') state.action = slot.allowed[hash(id + key) % slot.allowed.length];
                if (state.action !== 'blank') {
                    const error = context.canStart?.(actor, { ...slot, action: state.action });
                    if (error) { state.failed = error; eventsAdd(events, id, state.action, error, cursor); }
                    const travel = context.route?.(actor, slot, state.position);
                    if (travel?.error) { state.failed = travel.error; eventsAdd(events, id, state.action, travel.error, cursor); }
                    else if (travel) Object.assign(state, travel);
                }
            }
            let end = Math.min(to, cal.next);
            if (!state.failed && !state.completed) move(actor, state, 0);
            const crafting = ['mix', 'tailor'].includes(state.action);
            const craftSeconds = context.craftDuration || 30;
            if (crafting && !state.failed && !state.completed && !state.path?.length) {
                state.craftPhase ||= 'enter';
                if (state.craftPhase !== 'work') end = Math.min(end, cursor + Math.max(0, 800 - (state.transitionMs || 0)));
                if (state.craftPhase === 'work' && !state.craft && !actor.isSick && actor.energy > 5 && actor.hunger > 5) {
                    const error = context.craftStart?.(actor, slot, state, hash(id + key));
                    if (error || !state.craft) {
                        state.failed = error || 'unavailable';
                        eventsAdd(events, id, state.action, state.failed, cursor);
                    }
                }
                if (state.craftPhase === 'work' && state.craft) end = Math.min(end, cursor + Math.max(0, craftSeconds - state.seconds) * 1000);
            }
            if (task) end = Math.min(end, cursor + Math.max(.001, task.duration) * 1000);
            if (context.limitEnd) end = context.limitEnd(actor, cursor, end);
            if (end <= cursor) { context.advanceTime?.(actor, cursor, cursor); break; }
            let ms = end - cursor;
            const wasTraveling = !!state.path?.length;
            let workMs = state.failed || state.completed ? 0 : move(actor, state, ms);
            if (wasTraveling && workMs > 0 && workMs < ms) {
                end -= workMs; ms -= workMs; workMs = 0;
            }
            if (crafting && state.craftPhase && state.craftPhase !== 'work' && workMs > 0) {
                state.transitionMs = (state.transitionMs || 0) + workMs;
                workMs = 0;
                if (state.transitionMs >= 800) {
                    if (state.craftPhase === 'exit') state.completed = true;
                    else state.craftPhase = 'work';
                    state.transitionMs = 0;
                }
            }
            if (state.action === 'blank' || state.action === 'walk') workMs = 0;
            if (workMs > 0) {
                if (!state.effectsStarted && (['rest', 'eat'].includes(state.action) || (!actor.isSick && actor.energy > 5 && actor.hunger > 5))) {
                    state.effectsStarted = true;
                    if (!task?._started) startBuffs(actor);
                }
                const r = rates(actor, state.action, context);
                const recovery = ['rest', 'eat'].includes(state.action);
                if (!recovery && (actor.isSick || actor.energy <= 5 || actor.hunger <= 5)) {
                    state.failed = actor.isSick ? 'sick' : 'resources';
                    eventsAdd(events, id, state.action, state.failed, cursor);
                } else if (state.action === 'eat') {
                    if (!state.ate) {
                        state.ate = true;
                        if (!food(actor, slot, context, cursor)) { state.failed = 'food_missing'; eventsAdd(events, id, state.action, state.failed, cursor); }
                        else eventsAdd(events, id, state.action, 'completed', cursor);
                        if (context.limitEnd) {
                            end = context.limitEnd(actor, cursor, end);
                            ms = Math.max(0, end - cursor);
                        }
                    }
                } else {
                    let seconds = workMs / 1000;
                    if (!recovery && r.drain > 0) seconds = Math.min(seconds, Math.max(0, Math.min(actor.energy, actor.hunger) - 5) / r.drain);
                    if (state.action === 'rest') {
                        const energyBefore = actor.energy;
                        actor.energy = clamp(actor.energy + seconds * r.eff);
                        const healthySeconds = actor.hunger >= 60 ? Math.max(0, seconds - Math.max(0, 60 - energyBefore) / r.eff) : 0;
                        const hour = new Date(cursor).getHours();
                        actor.stats.beauty += healthySeconds * .1 * r.eff * (hour >= 22 || hour <= 4 ? 2 : 1);
                        actor.stats.mood = clamp(actor.stats.mood + seconds * .05 * (1000 / config.ordinaryTickMs) * r.consumption);
                    } else {
                        if (r.stat) actor.stats[r.stat] += seconds * r.gain;
                        actor.energy = clamp(actor.energy - seconds * r.drain);
                        actor.hunger = clamp(actor.hunger - seconds * r.drain, actor.maxHunger);
                        actor.stats.mood = clamp(actor.stats.mood - seconds * .01 * (1000 / config.ordinaryTickMs) * r.consumption);
                    }
                    for (const monument of actor.activeMonuments || []) {
                        actor.stats[monument.stat] += seconds * .05 * (1000 / config.ordinaryTickMs);
                    }
                    if (state.action === 'rest' && actor.activeMonuments?.some(m => m.stat === 'beauty')) {
                        actor.stats.beauty += seconds * .1 * (1000 / config.ordinaryTickMs);
                    }
                    const priorSeconds = state.seconds;
                    state.seconds += seconds;
                    if (['gather', 'fish'].includes(state.action)) {
                        const oldUnits = state.units || 0, units = Math.floor(state.seconds / 15);
                        for (let unit = oldUnits; unit < units; unit++) {
                            const at = cursor + ms - workMs + ((unit + 1) * 15 - priorSeconds) * 1000;
                            const itemId = context.unit?.(actor, slot, state.action, hash(id + key + ':' + unit), at);
                            if (itemId) eventsAdd(events, id, state.action, 'completed', at, itemId);
                        }
                        state.units = units;
                    }
                    if (seconds < workMs / 1000) { state.failed = 'resources'; eventsAdd(events, id, state.action, 'resources', cursor + seconds * 1000); }
                }
            }
            const alive = context.advanceTime?.(actor, cursor, end) !== false;
            if (alive && crafting && state.craftPhase === 'work' && !state.failed && !state.completed && state.seconds >= craftSeconds - 1e-9) {
                const result = context.craftFinish?.(actor, slot, state, end);
                completeScheduled(actor, state.action, state, context, end);
                state.craftPhase = 'exit'; state.transitionMs = 0;
                eventsAdd(events, id, state.action, 'completed', end, result?.itemId);
            }
            if (task && alive) {
                task.duration = Math.max(0, task.duration - ms / 1000);
                if (state.failed || task.duration === 0) {
                    immediate.shift();
                    if (!state.failed) {
                        completeScheduled(actor, state.action, state, context, end);
                        if (task.routineKey) state.completed = true;
                        eventsAdd(events, id, state.action, 'completed', end);
                    }
                }
            }
            if (alive && !task && !state.completed && !state.failed && state.action !== 'blank' && calendar(plan, end).key !== key) {
                if (state.path?.length) eventsAdd(events, id, state.action, 'travel_short', end);
                else if (crafting && state.seconds < craftSeconds) eventsAdd(events, id, state.action, 'work_short', end);
                else {
                    completeScheduled(actor, state.action, state, context, end);
                    if (!['eat', 'gather', 'fish'].includes(state.action)) eventsAdd(events, id, state.action, 'completed', end);
                }
                state.completed = true;
            }
            cursor = end;
            if (!alive) break;
        }
    }
    function forecast(actor, plan, context, start = Date.now()) {
        const draft = clone(actor); const events = []; let previous;
        delete draft.routineState;
        for (let week = 1; week <= config.forecastWeeks; week++) {
            const from = start + (week - 1) * 7 * 86400000;
            simulateActor(draft, plan, from, from + 7 * 86400000, context, events);
            const failure = events.find(e => !['completed'].includes(e.status));
            if (failure) return { stable: false, week, failure };
            const signature = JSON.stringify([draft.energy, draft.hunger, context.items(draft, 'inventory'), context.items(draft, 'freezer')]);
            if (signature === previous) return { stable: true, week };
            previous = signature;
        }
        return { stable: false, week: config.forecastWeeks, inconclusive: true };
    }
    root.ScheduleCore = { config, actions, empty, validate, timeline, calendar, simulateActor, forecast, rates, clone, eventsAdd,
        completeSleep, completeBooks, completeExile, startBuffs, completeFocusedStudy,
        medicineEffect, nutritionEffect, foodRisk, consumeSelected, hash, food };
    if (typeof module !== 'undefined') module.exports = root.ScheduleCore;
})(typeof window === 'undefined' ? globalThis : window);
