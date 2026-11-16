(function(root, factory) {
    const api = factory(typeof module === 'object' && module.exports ? require('./experimental_word_evolution_routes') : root.ExperimentalWordEvolutionRoutes);
    if (typeof module === 'object' && module.exports) module.exports = api; else root.ExperimentalWordCollection = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function(tree) {
    'use strict';
    const skins = new Set([...Object.keys(tree), ...Object.values(tree).flat().map(e => e.next)]);
    const create = () => ({ version: 1, nextId: 1, entries: [] });
    function valid(value) {
        if (value === undefined) return true; // Legacy new-mode save, never import old-game discoveries.
        return value?.version === 1 && Number.isSafeInteger(value.nextId) && value.nextId > 0
            && Array.isArray(value.entries) && value.entries.length <= skins.size
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
    return { create, valid, validSave, register, join };
});
