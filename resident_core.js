// Persistent person identities and ownership. Rendering and simulation are separate.
(function (root) {
    'use strict';
    const VERSION = 1;
    const clone = value => JSON.parse(JSON.stringify(value));
    const id = prefix => prefix + ':' + (root.crypto && root.crypto.randomUUID
        ? root.crypto.randomUUID() : Date.now().toString(36) + ':' + Math.random().toString(36).slice(2));
    const own = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
    const setRecord = (object, key, value) => Object.defineProperty(object, key, {
        value, enumerable: true, configurable: true, writable: true
    });
    function fail(code) { throw new Error('Residents:' + code); }
    function ensure(hero, map) {
        if (!hero || typeof hero !== 'object') fail('missing_hero');
        if (!hero.residentState) {
            hero.residentState = {
                version: VERSION, lineageId: id('lineage'), islandId: id('island'),
                people: {}, completedTransactions: {}, generationPeople: {}
            };
        }
        const state = hero.residentState;
        if (state.version !== VERSION) fail('unsupported_version');
        for (const field of ['people', 'completedTransactions', 'generationPeople']) {
            if (!state[field] || typeof state[field] !== 'object' || Array.isArray(state[field])) fail('invalid_' + field);
        }
        if (!state.lineageId || !state.islandId) fail('invalid_identity');
        const generation = String(Math.max(1, Math.floor(Number(hero.generation) || 1)));
        if (!own(state.generationPeople, generation)) state.generationPeople[generation] = id('person');
        if (typeof state.generationPeople[generation] !== 'string' || !state.generationPeople[generation].startsWith('person:')) fail('invalid_person_id');
        if (new Set(Object.values(state.generationPeople)).size !== Object.keys(state.generationPeople).length) fail('duplicate_generation_person');
        hero.personId = state.generationPeople[generation];
        if (hero.residentEvolution?.personId !== hero.personId) hero.residentEvolution = { personId: hero.personId, forms: [] };
        const form = hero.currentSkin || hero.baseType;
        if (form && hero.residentEvolution.forms[hero.residentEvolution.forms.length - 1] !== form) hero.residentEvolution.forms.push(form);
        state.currentPersonId = hero.personId;
        if (own(state.people, hero.personId)) fail('protagonist_resident_conflict');
        if (map) {
            const seen = new Set();
            for (const asset of Object.values(map)) {
                if (!asset || typeof asset !== 'object') continue;
                if (!asset.instanceId) asset.instanceId = id('asset');
                if (seen.has(asset.instanceId)) fail('duplicate_asset_id');
                seen.add(asset.instanceId);
            }
            syncHomes(state, map);
        }
        return state;
    }
    function syncHomes(state, map) {
        state.homes = state.homes || {};
        const huts = Object.values(map).filter(a => a && a.type === 'hut' && !a.isMobile);
        const ids = new Set(huts.map(a => a.instanceId));
        for (const key of Object.keys(state.homes)) if (!ids.has(key)) delete state.homes[key];
        if (!ids.has(state.protagonistHomeId)) state.protagonistHomeId = null;
        for (const hut of huts) {
            if (!own(state.homes, hut.instanceId)) {
                const role = state.protagonistHomeId ? 'resident' : 'protagonist';
                state.homes[hut.instanceId] = { role, slots: [null, null, null, null] };
                if (role === 'protagonist') state.protagonistHomeId = hut.instanceId;
            }
        }
        for (const person of Object.values(state.people)) {
            const home = person.home && state.homes[person.home.buildingId];
            if (!home || home.role !== 'resident' || home.slots[person.home.slot] !== person.personId) {
                person.status = 'waiting'; person.home = null; person.location = null; person.activity = null;
            }
        }
    }
    function homeAsset(hero, map) {
        const state = ensure(hero, map);
        return Object.values(map).find(a => a && a.instanceId === state.protagonistHomeId) || null;
    }
    function newGameArchive(hero) {
        const next = clone(hero);
        const state = ensure(next);
        state.homes = {}; state.protagonistHomeId = null; state.islandId = id('island');
        state.generationPeople = {}; state.currentPersonId = null;
        for (const person of Object.values(state.people)) {
            person.home = null; person.location = null; person.activity = null; person.status = 'waiting';
        }
        next.generation = 1; next.age = 0; next.gold = 0; next.inventory = []; next.schedule = [];
        delete next.routine; delete next.routineState; delete next.timeProgress;
        next.isReincarnating = false; next.isIndoors = false; next.actionState = 'idle'; next.lastSaveTime = Date.now();
        delete next.pendingInheritanceData; delete next.residentWorldCommit; delete next.residentEvolution;
        ensure(next);
        return next;
    }
    function isResidentHome(hero, asset, map) {
        const state = ensure(hero, map);
        return !!(asset && state.homes && state.homes[asset.instanceId]?.role === 'resident');
    }
    // The AI key is the commit point. Mirror failures are repaired before the next load.
    function saveWorld(hero, map, storage = root.localStorage, legacy) {
        recoverStorage(storage);
        const draft = clone(hero);
        if (legacy === undefined && (hero.activeBooks || hero.consumedLegacyBookIds)) {
            const rawLegacy = storage.getItem('ai_legacy_data');
            if (rawLegacy) {
                legacy = JSON.parse(rawLegacy);
                const remaining = new Map((hero.activeBooks || []).map(book => [book.id, book]));
                const consumed = new Set(hero.consumedLegacyBookIds || []);
                legacy.books = (legacy.books || []).filter(book => !consumed.has(book.id)).map(book => {
                    const active = remaining.get(book.id);
                    return active ? { ...book, charges: active.charges } : book;
                });
            }
        }
        draft.residentWorldCommit = { map: clone(map) };
        if (legacy !== undefined) draft.residentWorldCommit.legacy = clone(legacy);
        storage.setItem('ai_pet_data_v1', JSON.stringify(draft));
        try { recoverStorage(storage); } catch (error) { console.error('Residents:mirror_pending', error); }
    }
    function recoverStorage(storage = root.localStorage) {
        const raw = storage.getItem('ai_pet_data_v1');
        if (!raw) return;
        const hero = JSON.parse(raw);
        const commit = hero.residentWorldCommit;
        if (!commit) return;
        storage.setItem('map_data_v6', JSON.stringify(commit.map));
        if (commit.legacy !== undefined) storage.setItem('ai_legacy_data', JSON.stringify(commit.legacy));
        delete hero.residentWorldCommit;
        storage.setItem('ai_pet_data_v1', JSON.stringify(hero));
    }
    function assignHome(hero, map, personId, buildingId, slot, storage = root.localStorage) {
        const draft = clone(hero);
        const state = ensure(draft, map);
        const person = state.people[personId];
        if (!person || person.activity?.lockId) fail('resident_unavailable');
        const home = buildingId && state.homes[buildingId];
        if (buildingId && (!home || home.role !== 'resident' || !Number.isInteger(slot) || slot < 0 || slot > 3)) fail('invalid_home');
        if (home && home.slots[slot] && home.slots[slot] !== personId) {
            const previous = state.people[home.slots[slot]];
            if (previous?.activity?.lockId) fail('resident_unavailable');
            if (previous) { previous.home = null; previous.status = 'waiting'; previous.location = null; previous.activity = null; }
        }
        if (person.home && state.homes[person.home.buildingId]) state.homes[person.home.buildingId].slots[person.home.slot] = null;
        person.home = home ? { buildingId, slot } : null;
        person.status = home ? 'housed' : 'waiting';
        person.location = home ? { kind: 'home', x: 2 + slot * 2, y: 1 } : null;
        person.activity = null;
        if (home) home.slots[slot] = personId;
        if (!person.roomTheme) person.roomTheme = { id: 'auto', hue: (person.generation * 67) % 360 };
        saveWorld(draft, map, storage);
        hero.residentState = draft.residentState;
    }
    function snapshot(hero) {
        ensure(hero);
        const person = {
            personId: hero.personId, source: 'protagonist', generation: hero.generation || 1,
            status: 'waiting', home: null, location: null, activity: null,
            profile: {}, possessions: { inventory: clone(hero.inventory || []), gold: Number(hero.gold) || 0,
                equipment: {}, warehouse: [], freezer: [], safeGold: 0 },
            relationships: {}, roomTheme: null
        };
        // Only personal durable fields; no shop stock, global discoveries, DOM or tasks.
        for (const key of ['name', 'petName', 'baseType', 'currentSkin', 'personality', 'cosmetic',
            'stats', 'skills', 'age', 'lifespan', 'energy', 'hunger', 'maxHunger', 'isSick',
            'apprentice', 'savedRecipes', 'savedRecipeFlags', 'evolutionHistory', 'memoryCapacity']) {
            if (hero[key] !== undefined) person.profile[key] = clone(hero[key]);
        }
        // Apprenticeship supplies and pending work do not become personal property.
        if (person.profile.apprentice) {
            delete person.profile.apprentice.inventory;
        }
        person.profile.evolutionHistory = clone(hero.residentEvolution.forms);
        if (typeof hero.getMaxVocabulary === 'function') person.profile.memoryCapacity = hero.getMaxVocabulary();
        for (const key of ['equipWeapon', 'equipShield', 'equipArmor', 'equipAccessory']) {
            if (hero[key]) person.possessions.equipment[key] = clone(hero[key]);
        }
        return person;
    }
    function owner(hero, reference, map) {
        const state = ensure(hero);
        if (!reference || typeof reference.id !== 'string') fail('invalid_owner');
        if (reference.kind === 'person') {
            if (reference.id === hero.personId) return { kind: 'protagonist', data: hero };
            if (own(state.people, reference.id)) return { kind: 'resident', data: state.people[reference.id].possessions };
        }
        if (reference.kind === 'building' && map) {
            const asset = Object.values(map).find(a => a && a.instanceId === reference.id);
            if (asset) return { kind: 'building', data: asset.storage || null };
        }
        if (reference.kind === 'island' && reference.id === state.islandId && map) {
            return { kind: 'island', data: map };
        }
        fail('unknown_owner');
    }
    // Future succession UI passes its already-settled successor. This pure operation
    // does not spend legacy Gold, choose inheritance, or change the live protagonist.
    function prepareSuccession(previous, successor, choices, transactionId) {
        if (!transactionId || typeof transactionId !== 'string') fail('invalid_transaction');
        const before = clone(previous);
        const state = ensure(before);
        if (own(state.completedTransactions, transactionId)) fail('already_committed');
        if ((successor.generation || 1) !== (before.generation || 1) + 1) fail('invalid_generation');
        const resident = snapshot(before);
        if (before.routine) resident.routine = clone(before.routine);
        if (own(state.people, resident.personId)) fail('duplicate_person');
        if (choices.inventory) {
            resident.possessions.inventory = [];
            resident.possessions.equipment = {};
        }
        if (choices.gold) resident.possessions.gold = 0;
        state.people[resident.personId] = resident;
        const result = clone(successor);
        delete result.routine; delete result.routineState; delete result.timeProgress;
        result.residentState = state;
        ensure(result);
        // Actual personal property is moved, preserving all item metadata.
        result.inventory = choices.inventory ? clone(before.inventory || []) : [];
        result.gold = choices.gold ? Number(before.gold) || 0 : 0;
        for (const key of ['equipWeapon', 'equipShield', 'equipArmor', 'equipAccessory']) {
            result[key] = choices.inventory && before[key] ? clone(before[key]) : null;
        }
        if (!choices.map) {
            state.islandId = id('island');
            state.homes = {}; state.protagonistHomeId = null;
            for (const person of Object.values(state.people)) {
                person.status = 'waiting'; person.home = null; person.location = null; person.activity = null;
            }
        }
        setRecord(state.completedTransactions, transactionId, { kind: 'succession', from: before.personId, to: result.personId });
        return result;
    }
    // Atomically persist a person-only operation before touching live state.
    // Building storage is intentionally excluded: its transaction must include map data.
    function transferGold(hero, fromId, toId, amount, transactionId, storage) {
        if (!Number.isSafeInteger(amount) || amount <= 0 || !transactionId || typeof transactionId !== 'string') fail('invalid_transfer');
        const draft = clone(hero);
        const state = ensure(draft);
        const signature = { kind: 'gold', from: fromId, to: toId, amount };
        if (own(state.completedTransactions, transactionId)) {
            if (JSON.stringify(state.completedTransactions[transactionId]) !== JSON.stringify(signature)) fail('transaction_conflict');
            return false;
        }
        if (fromId === toId) fail('same_owner');
        const source = owner(draft, { kind: 'person', id: fromId }).data;
        const target = owner(draft, { kind: 'person', id: toId }).data;
        if (!Number.isSafeInteger(source.gold) || source.gold < amount) fail('insufficient_gold');
        if (!Number.isSafeInteger(target.gold) || target.gold < 0 || !Number.isSafeInteger(target.gold + amount)) fail('invalid_balance');
        source.gold -= amount; target.gold += amount;
        setRecord(state.completedTransactions, transactionId, signature);
        (storage || root.localStorage).setItem('ai_pet_data_v1', JSON.stringify(draft));
        hero.gold = draft.gold;
        hero.residentState = draft.residentState;
        return true;
    }
    root.Residents = Object.freeze({ VERSION, ensure, snapshot, owner, prepareSuccession, transferGold,
        homeAsset, isResidentHome, saveWorld, recoverStorage, assignHome, newGameArchive });
})(typeof window !== 'undefined' ? window : globalThis);
