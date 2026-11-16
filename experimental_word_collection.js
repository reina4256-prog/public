(function(root, factory) {
    const api = factory(typeof module === 'object' && module.exports ? require('./experimental_word_evolution_routes') : root.ExperimentalWordEvolutionRoutes);
    if (typeof module === 'object' && module.exports) module.exports = api; else root.ExperimentalWordCollection = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function(tree) {
    'use strict';
    const skins = new Set([...Object.keys(tree), ...Object.values(tree).flat().map(e => e.next)]);
    const create = () => ({ version: 1, nextId: 1, entries: [] });
    const memoryKinds = ['meeting', 'encounter', 'meal', 'rest', 'work', 'evolution'];
    const jobs = ['explore', 'farming', 'fishing', 'cooking', 'smithing', 'building'];
    const safeName = name => name === null || typeof name === 'string' && name.trim() === name && name.length > 0
        && [...name].length <= 32 && !/[\u0000-\u001f\u007f-\u009f\u2028\u2029\u202a-\u202e\u2066-\u2069]/u.test(name);
    function validMemories(value) {
        if (value.memories === undefined) return true;
        return Array.isArray(value.memories) && value.memories.length <= 100000
            && new Set(value.memories.map(m => m && `${m.owner}:${m.kind}:${m.subject}`)).size === value.memories.length
            && value.memories.every(m => m && Number.isSafeInteger(m.owner) && m.owner > 0 && m.owner < value.nextId
                && safeName(m.name) && skins.has(m.skin) && memoryKinds.includes(m.kind)
                && (['encounter', 'work'].includes(m.kind) ? jobs.includes(m.subject)
                    : m.kind === 'evolution' ? skins.has(m.subject) : m.subject === m.kind)
                && Number.isFinite(m.at) && m.at >= 0
                && (['meeting', 'evolution'].includes(m.kind) ? m.eventId === null && m.evidence === null
                    : Number.isSafeInteger(m.eventId) && m.eventId > 0 && m.evidence?.id === m.eventId
                        && m.evidence.kind === (m.kind === 'encounter' ? 'arrive' : 'experience')
                        && (m.kind === 'encounter' ? m.evidence.target === `master:${m.subject}`
                            : m.evidence.activity === ({ meal: 'eat', rest: 'rest', work: 'work' }[m.kind])
                                && (m.kind !== 'work' || m.evidence.master === m.subject))
                        && JSON.stringify(m.evidence).length <= 64000));
    }
    function valid(value) {
        if (value === undefined) return true; // Legacy new-mode save, never import old-game discoveries.
        return value?.version === 1 && Number.isSafeInteger(value.nextId) && value.nextId > 0
            && validMemories(value) && Array.isArray(value.entries) && value.entries.length <= skins.size
            && new Set(value.entries.map(e => e?.skin)).size === value.entries.length
            && value.entries.every(e => !!e && skins.has(e.skin) && Array.isArray(e.people) && e.people.length > 0 && e.people.length <= 4096
                && new Set(e.people.map(p => p?.id)).size === e.people.length
                && e.people.every(p => !!p && Number.isSafeInteger(p.id) && p.id > 0 && p.id < value.nextId
                    && ['observed', 'legacy'].includes(p.source) && (p.name === null || typeof p.name === 'string'
                        && p.name.trim() === p.name && p.name.length > 0 && [...p.name].length <= 32
                        && !/[\u0000-\u001f\u007f-\u009f\u2028\u2029\u202a-\u202e\u2066-\u2069]/u.test(p.name))));
    }
    function validSave(value) {
        if (!valid(value.collection)) return false;
        const id = value.state?.collectionId;
        return id === undefined || !!value.collection && Number.isSafeInteger(id) && id > 0 && id < value.collection.nextId;
    }
    function register(collection, state, skin, source = 'observed') {
        if (!skins.has(skin)) return false;
        let entry = collection.entries.find(e => e.skin === skin);
        if (!entry) { entry = { skin, people: [] }; collection.entries.push(entry); }
        if (entry.people.some(p => p.id === state.collectionId)) return false;
        entry.people.push({ id: state.collectionId, name: state.identity?.characterName || null, source });
        return true;
    }
    function join(collection, state, base, legacy = false) {
        if (state.collectionId !== undefined) return state.collectionId;
        state.collectionId = collection.nextId++;
        for (const skin of state.evolution?.path || [base]) register(collection, state, skin, legacy ? 'legacy' : 'observed');
        return state.collectionId;
    }
    function remember(collection, state, world, kind, subject = kind, eventId = null, evidence = null) {
        if (!memoryKinds.includes(kind) || !state.collectionId) return false;
        if (kind === 'evolution' && state.evolution.path.at(-1) !== subject) return false;
        const memories = collection.memories ||= [];
        if (memories.some(m => m.owner === state.collectionId && m.kind === kind && m.subject === subject)) return false;
        const memory = { owner: state.collectionId, name: state.identity?.characterName || null,
            skin: state.evolution.skin, kind, subject, eventId, at: world.elapsed,
            evidence: evidence ? JSON.parse(JSON.stringify(evidence)) : null };
        if (!validMemories({ ...collection, memories: [...memories, memory] })) return false;
        memories.push(memory); return memory;
    }
    function observe(collection, state, world, event) {
        if (!event) return false;
        if (event.kind === 'arrive') {
            const encounter = state.encounters?.find(e => e.eventId === event.id);
            return encounter ? remember(collection, state, world, 'encounter', encounter.master, event.id, event) : false;
        }
        const original = state.experiences?.find(e => e.id === event.id);
        if (event.kind !== 'experience' || !original || JSON.stringify(original) !== JSON.stringify(event)) return false;
        const kind = { eat: 'meal', rest: 'rest', work: 'work' }[event.activity];
        return kind ? remember(collection, state, world, kind, kind === 'work' ? event.master : kind, event.id, event) : false;
    }
    return { create, valid, validSave, register, join, remember, observe };
});
