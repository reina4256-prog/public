(function () {
    'use strict';
    const C = window.ScheduleCore;
    let hiddenAt = null, lastTick = Date.now(), started = false, blocked = false, stepMs = 50;
    const world = () => typeof assets === 'undefined' ? {} : assets;
    const effectFields = ['consecutiveSleepCount', 'darknessCounter', 'activeBooks', 'consumedLegacyBookIds', 'apprentice', 'buffs', 'conditions', 'isSick', 'lifespan'];
    function state(hero) { return hero.timeProgress ||= { version: 1, checkpoint: Number(hero.lastSaveTime) || Date.now(), report: null }; }
    function residentActor(person) {
        return { ...C.clone(person.profile), personId: person.personId, inventory: C.clone(person.possessions.inventory),
            freezer: C.clone(person.possessions.freezer), routineState: C.clone(person.routineState || {}),
            ...Object.fromEntries(['equipWeapon', 'equipShield', 'equipArmor', 'equipAccessory'].map(key => [key, C.clone(person.possessions.equipment[key] || null)])),
            godMode: false, buffs: C.clone(person.profile.buffs || {}), conditions: C.clone(person.profile.conditions || {}),
            x: person.location?.x, y: person.location?.y, residentHome: person.home, location: C.clone(person.location), resident: true };
    }
    function applyResident(person, actor) {
        for (const key of ['energy', 'hunger', 'maxHunger', 'stats', 'skills', ...effectFields]) if (actor[key] !== undefined) person.profile[key] = actor[key];
        person.possessions.inventory = actor.inventory; person.possessions.freezer = actor.freezer;
        person.routineState = actor.routineState;
        if (actor.routineState.position) person.location = { ...actor.routineState.position };
        const working = !actor.routineState.failed && !actor.routineState.path?.length && ['gather', 'fish'].includes(actor.routineState.action);
        person.activity = { owner: 'routine', phase: working ? 'work' : 'scheduled', job: actor.routineState.action, path: actor.routineState.path || [], elapsed: actor.routineState.seconds * 1000 || 0 };
        if (!actor.routineState.failed && !actor.routineState.completed && actor.routineState.craftPhase) {
            person.activity.phase = actor.routineState.craftPhase;
            person.activity.elapsed = actor.routineState.transitionMs || 0;
        }
    }
    function context(map = world(), hero = window.aiPet) {
        const inherited = actor => {
            // Offline/forecast heroes are JSON data, so their behavior methods
            // are absent. Borrow methods while keeping every own mutable field
            // on the simulated person.
            const proxy = Object.create(window.aiPet);
            Object.assign(proxy, hero, actor);
            return proxy;
        };
        return {
            canStart: (actor, slot) => {
                if (['mix', 'tailor'].includes(slot.action)) {
                    if (!actor.resident || !window.CraftCore) return 'unavailable';
                    const master = window.CraftCore.master(slot.action);
                    if (!hero.apprentice?.metMasters?.includes(master) || !(actor.apprentice?.rank?.[master] >= 1)) return 'unavailable';
                    const target = Object.entries(map).find(([, a]) => a.instanceId === slot.destination);
                    if (!target) return 'facility_missing';
                    if (!(slot.action === 'mix' ? ['pharmacy'] : ['atelier', 'tailor']).includes(target[0].split('_')[0])) return 'unavailable';
                    return null;
                }
                if (!['gather', 'fish'].includes(slot.action)) return null;
                if (!actor.resident) return 'unavailable';
                const target = Object.entries(map).find(([, a]) => a.instanceId === slot.destination);
                if (!target) return 'facility_missing';
                if (slot.action === 'fish') return ['sea', 'water', 'bridge'].includes(target[1].type) && actor.inventory.some(i => ['rod_old', 'rod_norm', 'rod_super'].includes(typeof i === 'string' ? i : i.id)) ? null : 'unavailable';
                const app = actor.apprentice || {};
                return (app.currentMaster === 'explore' || app.retired?.explore || app.rank?.explore >= 10) && ['mountain', 'palms', 'nature'].includes(target[0].split('_')[0]) ? null : 'unavailable';
            },
            craftDuration: window.CraftCore?.durationSeconds,
            craftStart: (actor, slot, state, seed) => {
                // The random sequence belongs to this person/occurrence, never to
                // Math.random or a live forecast's caller.
                const data = window.CraftCore.start(actor, slot.action, slot.craftTarget || null, {
                    random: window.CraftCore.seededRandom(seed),
                    isEquipment: id => typeof itemCatalog !== 'undefined' && itemCatalog[id]?.type === 'equip'
                });
                if (data.error || data.isPractice) return 'unavailable';
                state.craft = data;
                return null;
            },
            craftFinish: (actor, slot, state) => window.CraftCore.finish(actor, slot.action, state.craft),
            unit: (actor, slot, action, seed, at) => {
                const target = Object.entries(map).find(([, a]) => a.instanceId === slot.destination);
                if (!target) return null;
                const season = hero.season || 'spring'; let entries;
                if (action === 'fish') {
                    const table = target[1].type === 'sea' ? (typeof seaFishingTable === 'undefined' ? {} : seaFishingTable) : (typeof riverFishingTable === 'undefined' ? {} : riverFishingTable);
                    entries = table[season] || table.spring || [];
                } else {
                    const table = typeof facilityData === 'undefined' ? null : facilityData[target[0].split('_')[0]]?.items;
                    entries = (Array.isArray(table) ? table : [...(table?.default || []), ...(table?.[season] || [])]).map(id => ({ id, prob: 1 }));
                }
                let roll = seed / 4294967296 * entries.reduce((sum, item) => sum + item.prob, 0);
                const item = entries.find(i => (roll -= i.prob) < 0);
                if (!item) return null;
                const data = typeof itemCatalog === 'undefined' ? null : itemCatalog[item.id];
                actor.inventory.push(['food', 'dish', 'ingredient'].includes(data?.type) ? { id: item.id, age: 0, freshnessStartedAt: at } : item.id);
                return item.id;
            },
            items: (actor, source) => source === 'inventory' ? actor.inventory : actor.freezer,
            canUseSource: (actor, source) => {
                if (source === 'inventory') return true;
                if (actor.atOwnHome) return true;
                const pos = actor.routineState?.position || actor.location || actor;
                if (actor.resident) return pos.kind === 'home';
                const hut = Object.values(map).find(a => a.instanceId === hero.residentState?.protagonistHomeId);
                if (!hut) return false;
                return Math.hypot(pos.x - (hut.dx + hut.sw * (hut.scale ?? .5) / 2), pos.y - (hut.dy + hut.sh * (hut.scale ?? .5) - 10)) <= 10;
            },
            trait: actor => { try { return inherited(actor).getTraitData?.() || {}; } catch (_) { return {}; } },
            watch: actor => { try { return inherited(actor).getAmuletPlus?.('eternal_watch') ?? -1; } catch (_) { return -1; } },
            health: actor => { try { return inherited(actor).getAmuletPlus?.('misanga_health') ?? -1; } catch (_) { return -1; } },
            efficiency: type => typeof getActionEfficiency === 'function' ? getActionEfficiency(type).rate : 1,
            food: (item, at, source, actor, options = {}) => {
                const id = typeof item === 'string' ? item : item.id;
                const data = typeof itemCatalog === 'undefined' ? null : itemCatalog[id];
                if (!data) return null;
                if (data.type === 'medicine') {
                    const needed = { item_medicine_cold: actor?.conditions?.cold,
                        item_medicine_stomach: actor?.conditions?.stomachache, item_antidote: actor?.conditions?.poisoning,
                        item_medicine_cure: actor?.isSick || Object.values(actor?.conditions || {}).some(Boolean),
                        elixir: actor?.isSick || Object.values(actor?.conditions || {}).some(Boolean) };
                    return options.itemId === id || needed[id] ? data : null;
                }
                if (!['food', 'dish', 'ingredient'].includes(data.type)) return null;
                if (!options.itemId && (data.quality === 'bad' || id === 'poison_mushroom')) return null;
                const hours = typeof item === 'string' ? 0 : source === 'freezer'
                    ? (item.freshnessFrozenAt !== undefined && item.freshnessStartedAt !== undefined ? Math.max(0, item.freshnessFrozenAt - item.freshnessStartedAt) / 3600000 : Number(item.age) || 0)
                    : item.freshnessStartedAt !== undefined ? Math.max(0, at - item.freshnessStartedAt) / 3600000 : Number(item.age) || 0;
                const limit = data.type === 'dish' || id.startsWith('fish_') ? 12 : 24;
                return hours >= limit ? null : data;
            },
            route: (actor, slot, position) => {
                if (!slot.destination || slot.destination === 'current') return null;
                const homeId = actor.residentHome?.buildingId || hero.residentState?.protagonistHomeId;
                const targetId = slot.destination === 'home' ? homeId : slot.destination;
                const target = Object.values(map).find(a => a.instanceId === targetId);
                if (!target) return { error: 'facility_missing' };
                let from = position || actor.location || { kind: 'island', x: actor.x, y: actor.y };
                if (from.kind === 'home' && targetId === homeId) {
                    const bed = { kind: 'home', x: 2 + actor.residentHome.slot * 2, y: 1 };
                    const path = window.residentIndoorPath?.(from, bed);
                    return path ? { position: { ...from }, path: path.map(p => ({ ...p, kind: 'home' })), destination: bed } : { error: 'route_missing' };
                }
                const entrance = a => ({ kind: 'island', x: a.dx + a.sw * (a.scale ?? .5) / 2, y: a.dy + a.sh * (a.scale ?? .5) - 10 });
                // Home departure is a distinct, timed indoor path; no teleport at a calendar boundary.
                const origin = { ...from }, prefix = [];
                if (from.kind === 'home') {
                    const home = Object.values(map).find(a => a.instanceId === homeId);
                    if (!home) return { error: 'facility_missing' };
                    const indoor = window.residentIndoorPath?.(from, { x: 5, y: 8 });
                    if (!indoor) return { error: 'route_missing' };
                    prefix.push(...indoor.map(p => ({ ...p, kind: 'home' })));
                    from = entrance(home);
                    prefix.push({ ...from, transition: true });
                }
                let to = entrance(target);
                const proxy = inherited(actor); Object.assign(proxy, { x: from.x, y: from.y, pathQueue: [], schedule: [] });
                let found = false;
                for (const offset of slot.action === 'fish' ? [0, 20, -20, 40, -40, 80, -80] : [0]) {
                    const point = { ...to, x: to.x + offset, y: to.y + Math.abs(offset) / 2 };
                    if (proxy.isPointOnWater?.(point.x, point.y) || !proxy.setDestination?.(point.x, point.y)) continue;
                    const reached = proxy.pathQueue?.at(-1) || from;
                    if (Math.hypot(reached.x - point.x, reached.y - point.y) > .01) continue;
                    to = point; found = true; break;
                }
                if (!found) return { error: 'route_missing' };
                const path = [...prefix, ...proxy.pathQueue.map(p => ({ kind: 'island', x: p.x, y: p.y }))];
                const destination = targetId === homeId && actor.resident ? { kind: 'home', x: 2 + actor.residentHome.slot * 2, y: 1 } : to;
                if (destination.kind === 'home') {
                    const entry = { kind: 'home', x: 5, y: 8 };
                    const indoor = window.residentIndoorPath?.(entry, destination);
                    if (!indoor) return { error: 'route_missing' };
                    path.push({ ...entry, transition: true }, ...indoor.map(p => ({ ...p, kind: 'home' })));
                }
                return { position: origin, path, destination };
            }
        };
    }
    function heroActor(hero, map) {
        const actor = {};
        for (const key of ['personId', 'currentSkin', 'personality', 'stats', 'skills', 'inventory', 'energy', 'hunger', 'maxHunger', 'isSick', 'conditions', 'buffs',
            'equipWeapon', 'equipShield', 'equipArmor', 'equipAccessory', 'godMode', 'routine', 'routineState', 'x', 'y', 'flip', 'schedule',
            'age', 'lifespan', 'lifeAgeTimer', 'activeMonuments', ...effectFields]) {
            if (hero[key] !== undefined) actor[key] = C.clone(hero[key]);
        }
        const home = Object.values(map).find(a => a.instanceId === hero.residentState?.protagonistHomeId);
        actor.freezer = C.clone(home?.storage?.freezer?.items || []);
        return actor;
    }
    function applyHero(hero, actor, map) {
        for (const key of ['energy', 'hunger', 'maxHunger', 'stats', 'inventory', 'routineState', 'x', 'y', 'flip', 'schedule', 'age', 'lifeAgeTimer', ...effectFields]) if (actor[key] !== undefined) hero[key] = actor[key];
        const home = Object.values(map).find(a => a.instanceId === hero.residentState?.protagonistHomeId);
        if (home?.storage?.freezer && Array.isArray(home.storage.freezer.items)) home.storage.freezer.items = actor.freezer;
    }
    function passive(hero, from, to, report) {
        if (hero.isReincarnating || hero.pendingInheritanceData) return from;
        if (hero.godMode) return to;
        const age = Number(hero.age) || 0, lifespan = Number(hero.lifespan) || 100;
        const remainder = (Number(hero.lifeAgeTimer) || 0) * 50;
        const untilDeath = Math.max(0, (lifespan - age) * C.config.ageUnitMs - remainder);
        const elapsed = Math.min(to - from, untilDeath);
        const total = remainder + elapsed;
        hero.age = Math.min(lifespan, age + Math.floor(total / C.config.ageUnitMs));
        hero.lifeAgeTimer = (total % C.config.ageUnitMs) / 50;
        if (untilDeath <= to - from) { report.deathAt = from + untilDeath; hero.age = lifespan; }
        return report.deathAt ?? to;
    }
    function simulate(hero, map, from, to, offline) {
        const events = [], before = {};
        const report = { id: hero.personId + ':' + from + ':' + to, from, to, events, before, after: {}, acknowledged: false };
        before[hero.personId] = { age: hero.age, energy: hero.energy, hunger: hero.hunger, stats: C.clone(hero.stats || {}) };
        const start = Math.max(from, to - C.config.actionLimitMs);
        report.capped = start > from;
        if (start > from) passive(hero, from, start, report);
        if (!hero.isReincarnating && !hero.pendingInheritanceData && report.deathAt === undefined && start < to) {
            const actor = heroActor(hero, map);
            const immediate = actor.schedule || [];
            const ctx = context(map, hero);
            ctx.limitEnd = (person, cursor, end) => person.godMode ? end : Math.min(end, cursor + Math.max(0,
                ((Number(person.lifespan) || 100) - (Number(person.age) || 0)) * C.config.ageUnitMs - (Number(person.lifeAgeTimer) || 0) * 50));
            ctx.advanceTime = (person, cursor, end) => {
                passive(person, cursor, end, report);
                return report.deathAt === undefined;
            };
            // Interactive tasks remain untouched, but do not stop passive aging.
            const supported = !immediate.length || ['study', 'train', 'run', 'rest', 'sleep', 'eat'].includes(immediate[0].type);
            if (supported) C.simulateActor(actor, actor.routine, start, to, ctx, events, immediate);
            else passive(actor, start, to, report);
            applyHero(hero, actor, map);
        }
        const deathAt = report.deathAt ?? (hero.isReincarnating || hero.pendingInheritanceData ? from : to);
        report.through = deathAt;
        report.after[hero.personId] = { age: hero.age, energy: hero.energy, hunger: hero.hunger, stats: C.clone(hero.stats || {}) };
        for (const person of Object.values(hero.residentState?.people || {})) {
            if (!person.home || person.activity?.lockId || !person.routine?.enabled) continue;
            const actor = residentActor(person);
            before[actor.personId] = { energy: actor.energy, hunger: actor.hunger, stats: C.clone(actor.stats || {}) };
            C.simulateActor(actor, person.routine, start, deathAt, context(map, hero), events);
            applyResident(person, actor);
            report.after[actor.personId] = { energy: actor.energy, hunger: actor.hunger, stats: C.clone(actor.stats) };
        }
        // Freshness has no seven-day action cap, and stops at the death boundary.
        const freshen = (items, id) => {
            for (let i = 0; i < (items || []).length; i++) {
                let item = items[i]; const key = typeof item === 'string' ? item : item.id;
                const data = typeof itemCatalog === 'undefined' ? null : itemCatalog[key];
                if (!data || data.quality === 'bad' || !['food', 'ingredient', 'dish'].includes(data.type)) continue;
                if (typeof item === 'string') item = items[i] = { id: item, freshnessStartedAt: from };
                item.freshnessStartedAt ??= from - (Number(item.age) || 0) * 3600000;
                const elapsed = Math.max(0, deathAt - item.freshnessStartedAt);
                const limit = key.startsWith('fish_') || data.type === 'dish' ? 12 : 24;
                if (elapsed >= limit * 3600000) {
                    item.id = key.startsWith('fish_') ? 'rotten_fish' : data.type === 'dish' ? 'rotten_food' : 'rotten_veg';
                    item.age = 0; delete item.freshnessStartedAt; delete item.freshnessFrozenAt;
                    C.eventsAdd(events, id, 'freshness', 'spoiled', deathAt);
                } else { item.age = Math.floor(elapsed / 3600000); item.freshnessStartedAt += to - deathAt; }
            }
        };
        freshen(hero.inventory, hero.personId);
        for (const person of Object.values(hero.residentState?.people || {})) {
            freshen(person.possessions.inventory, person.personId); freshen(person.possessions.warehouse, person.personId);
        }
        if (offline) {
            const previous = state(hero).report;
            if (previous && !previous.acknowledged) {
                report.from = previous.from;
                report.before = { ...report.before, ...previous.before };
                report.events = [...previous.events, ...report.events];
                report.deathAt = previous.deathAt ?? report.deathAt;
            }
            state(hero).report = report;
        }
        state(hero).checkpoint = to;
        hero.lastSaveTime = to;
        return report;
    }
    function commitLive(draft, map) {
        const hero = window.aiPet;
        for (const [key, value] of Object.entries(draft)) if (typeof hero[key] !== 'function') hero[key] = value;
        const currentMap = world();
        for (const [key, asset] of Object.entries(map)) {
            // Keep live actor identity and image/rendering objects.
            if (currentMap[key]?.storage && asset.storage) currentMap[key].storage = asset.storage;
        }
    }
    function recover() {
        const pending = state(window.aiPet).pending;
        if (!pending) return;
        window.Residents.saveWorld(pending.result, pending.map);
        commitLive(pending.result, pending.map);
    }
    function settle(now = Date.now()) {
        const hero = window.aiPet;
        if (!hero || hero.pendingInheritanceData) return;
        recover();
        const from = state(hero).checkpoint;
        if (now <= from) return;
        const draft = C.clone(hero), map = C.clone(world());
        delete draft.timeProgress.pending;
        simulate(draft, map, from, now, true);
        // Persist the exact input and chosen result before applying. Recovery never reruns it.
        const prepared = C.clone(hero);
        state(prepared).pending = { id: draft.timeProgress.report.id, from, to: now, input: C.clone(hero), result: draft, map };
        window.Residents.saveWorld(prepared, world());
        hero.timeProgress = prepared.timeProgress;
        recover();
    }
    function failure(error) {
        console.error(error); blocked = true;
        if (!window.ResidentUI) return;
        const view = window.ResidentUI.modal('お知らせ');
        window.ResidentUI.element('p', '保存できませんでした。もう一度お試しください。', view.card);
        window.ResidentUI.button(view.card, '保存', () => {
            try { settle(); blocked = false; hiddenAt = null; lastTick = Date.now(); view.close(); window.ScheduleUI?.report(); }
            catch (next) { console.error(next); }
        });
    }
    function boot() {
        if (!window.aiPet || started) return;
        started = true;
        window.Residents.ensure(window.aiPet, world());
        if (typeof savedPet !== 'undefined' && !savedPet) {
            state(window.aiPet).checkpoint = Date.now(); lastTick = Date.now(); return;
        }
        try { settle(); } catch (error) { failure(error); }
        lastTick = Date.now();
    }
    function tick(now = Date.now()) {
        if (blocked || document.hidden) return false;
        const hero = window.aiPet; if (!hero) return true;
        const elapsed = now - lastTick;
        stepMs = Math.max(0, elapsed);
        if (started && elapsed > C.config.sleepGapMs) {
            try { settle(now); window.ScheduleUI?.report(); } catch (error) { failure(error); }
            lastTick = now; return false;
        }
        lastTick = now;
        if (!started) return true;
        state(hero).checkpoint = Math.max(state(hero).checkpoint, now);
        if (typeof currentMode !== 'undefined' && currentMode === 'play') window.ScheduleUI?.report();
        return true;
    }
    function advance(now, ms) {
        ms = stepMs;
        const hero = window.aiPet;
        if (!hero || hero.isReincarnating || hero.pendingInheritanceData) return false;
        planLiveHero(now);
        const events = [];
        for (const person of Object.values(hero.residentState?.people || {})) {
            if (!person.home || !person.routine?.enabled || person.activity?.lockId) continue;
            const actor = residentActor(person);
            C.simulateActor(actor, person.routine, now - ms, now, context(), events);
            applyResident(person, actor);
        }
        // The ordinary update owns all protagonist movement, entry, animation,
        // task effects and HUD progress, including calendar-created tasks.
        return false;
    }
    function cancelLiveHero(hero) {
        const visible = hero === window.aiPet;
        const own = hero.schedule?.some(task => task.routineKey);
        if (own) {
            hero.schedule = hero.schedule.filter(task => !task.routineKey);
            hero.pathQueue = [];
            hero.visualAction = null;
            if (visible && window.myHomeMapOpen) window.cancelMyHomeAction?.();
            else hero.actionState = hero.isIndoors ? 'exiting' : 'idle';
            if (visible) window.updateScheduleList?.();
        }
        if (visible && hero.routineLive?.homePending) {
            window.cancelMyHomeRoutineMovement?.();
            if (window.myHomeMapOpen) window.cancelMyHomeAction?.();
            window.pendingMyHomeConciergeVisit = false;
            window.pendingMyHomeConciergeAction = null;
        }
        delete hero.routineLive;
    }
    function planLiveHero(now = Date.now()) {
        const hero = window.aiPet;
        if (!hero) return;
        if (!hero.routine?.enabled) { cancelLiveHero(hero); return; }
        if (!window.myHomeMapOpen && window.GameShell.currentScene === 'island' && hero.schedule?.some(task => task.routineKey && task.myHomeIndoor)
            && window.isMyHomeIndoorUnlocked?.()) {
            window.openMyHomeMapUI?.({ preservePosition: true, skipEncounter: true });
        }
        const cal = C.calendar(hero.routine, now);
        if (hero.routineLive?.key !== cal.key) cancelLiveHero(hero);
        const live = hero.routineLive;
        if (live) {
            const task = hero.schedule?.find(task => task.routineKey === live.key);
            if (task && task.type !== 'visit_master') task.duration = Math.min(task.duration, Math.max(0, (live.end - now) / 1000));
            return;
        }
        if (hero.schedule?.length || hero.pathQueue?.length || !['island', 'myhome'].includes(window.GameShell.currentScene)) return;
        if (hero.isIndoors && !window.myHomeMapOpen || hero.actionState === 'exiting') return;
        const slot = cal.slot;
        const action = slot.action === 'free' ? slot.allowed[C.hash(hero.personId + cal.key) % slot.allowed.length] : slot.action;
        const endDate = new Date(now); endDate.setHours(0, slot.end, 0, 0);
        const end = endDate.getTime();
        hero.routineLive = { key: cal.key, action, end, slot: C.clone(slot), status: 'waiting' };
        if (action === 'blank') return;
        if (hero.routineState?.key === cal.key && hero.routineState.completed) { hero.routineLive.status = 'completed'; return; }
        const destinationId = slot.destination === 'home' ? hero.residentState?.protagonistHomeId : slot.destination;
        let facility = slot.destination && slot.destination !== 'current' ? Object.values(world()).find(asset => asset.instanceId === destinationId) : null;
        if (window.myHomeMapOpen && (!slot.destination || slot.destination === 'current')) {
            facility = Object.values(world()).find(asset => asset.instanceId === hero.residentState?.protagonistHomeId);
        }
        if (window.myHomeMapOpen && facility?.instanceId !== hero.residentState?.protagonistHomeId) {
            delete hero.routineLive;
            if (!hero.myHomeExiting) window.requestMyHomeExit?.();
            return;
        }
        if (slot.destination && slot.destination !== 'current' && !facility) { hero.routineLive.status = 'facility_missing'; return; }
        if (facility && window.Residents?.isResidentHome(hero, facility, world())) { hero.routineLive.status = 'unavailable'; return; }
        if (action === 'walk') {
            if (facility) hero.setDestination?.(facility.dx + facility.sw * (facility.scale ?? .5) / 2, facility.dy + facility.sh * (facility.scale ?? .5) - 10);
            hero.routineLive.status = 'moving'; return;
        }
        if (!['study', 'train', 'run', 'rest', 'eat'].includes(action)) { hero.routineLive.status = 'unavailable'; return; }
        const task = { type: action === 'rest' ? 'sleep' : action, duration: Math.max(1, (end - now) / 1000),
            routineKey: cal.key, routineDestination: facility?.instanceId || 'current', routineMeal: C.clone(slot.meal || null) };
        if (action === 'eat' && slot.meal?.itemId) task.targetItem = slot.meal.itemId;
        hero.routineLive.status = 'active';
        if (facility?.type === 'hut' && window.isMyHomeIndoorUnlocked?.()) {
            hero.routineLive.homePending = true;
            const homeAction = action === 'rest' ? 'bed' : action;
            if (window.myHomeMapOpen) { window.startMyHomeRoutineAction?.(homeAction); return; }
            window.pendingMyHomeConciergeVisit = true;
            window.pendingMyHomeConciergeAction = homeAction;
            hero.schedule.push({ type: 'visit_master', masterType: 'concierge', duration: 0, myHomeAction: homeAction, routineKey: cal.key });
            hero.startBuildingInteraction(facility);
        } else hero.schedule.push(task);
        window.updateScheduleList?.();
    }
    function adoptHomeTask(task) {
        const live = window.aiPet?.routineLive;
        if (!live?.homePending || !window.aiPet.routine?.enabled) return;
        const type = live.action === 'rest' ? 'sleep' : live.action;
        if (task.type !== type) return;
        live.homePending = false;
        task.routineKey = live.key;
        task.routineMeal = C.clone(live.slot.meal || null);
        task.targetItem = live.slot.meal?.itemId || null;
        task.duration = task.maxDuration = Math.max(1, (live.end - Date.now()) / 1000);
        C.startBuffs(window.aiPet);
    }
    function completeLiveTask(task) {
        if (!task.routineKey || task.type === 'visit_master') return;
        const hero = window.aiPet;
        hero.routineState = { key: task.routineKey, action: task.type === 'sleep' ? 'rest' : task.type,
            completed: true, effectsCompleted: true, seconds: task.maxDuration || 0 };
        if (hero.routineLive?.key === task.routineKey) hero.routineLive.status = 'completed';
    }
    function consumeLiveMeal(task) {
        if (task.routineAte) return true;
        const hero = window.aiPet, actor = heroActor(hero, world());
        actor.routineState = { key: task.routineKey };
        actor.atOwnHome = !!task.myHomeIndoor && !!window.myHomeMapOpen;
        const result = C.food(actor, { meal: task.routineMeal || { sources: ['inventory'], itemId: task.targetItem || '' } }, context(), Date.now());
        const routineState = hero.routineState;
        actor.schedule = hero.schedule;
        applyHero(hero, actor, world());
        hero.routineState = routineState;
        const current = hero.schedule.find(candidate => candidate.routineKey === task.routineKey);
        if (current) current.routineAte = true;
        task.routineAte = true;
        return result;
    }
    function visibility() {
        if (!started) return;
        if (document.hidden) {
            hiddenAt = Date.now();
            window.GameShell?.suspendPauseClock(true);
            state(window.aiPet).checkpoint = hiddenAt;
            try { window.Residents.saveWorld(window.aiPet, world()); } catch (error) { failure(error); }
        } else if (hiddenAt !== null) {
            try { settle(); hiddenAt = null; window.ScheduleUI?.report(); } catch (error) { failure(error); }
            window.GameShell?.suspendPauseClock(false);
            lastTick = Date.now();
        }
    }
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('pagehide', () => { if (started && !document.hidden) { state(window.aiPet).checkpoint = Date.now(); try { window.Residents.saveWorld(window.aiPet, world()); } catch (error) { console.error(error); } } });
    window.ScheduleRuntime = { boot, tick, advance, settle, simulate, context, heroActor, residentActor, state, planLiveHero, cancelLiveHero, adoptHomeTask, completeLiveTask, consumeLiveMeal,
        get absent() { return document.hidden || hiddenAt !== null || blocked; } };
})();
