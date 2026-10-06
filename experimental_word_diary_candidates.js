(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.ExperimentalWordDiaryCandidates = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';
    // Isolated in-memory contract, not a diary save schema or a source detector.
    // The caller supplies what the actor captured at an occurrence, never a
    // notebook projection recomputed with later knowledge. No game calls this.
    const copy = value => JSON.parse(JSON.stringify(value));
    const id = value => typeof value === 'string' && value.length > 0
        || Number.isSafeInteger(value) && value >= 0;
    function jsonData(value, ancestors = new Set()) {
        if (value === null || typeof value === 'string' || typeof value === 'boolean') return true;
        if (typeof value === 'number') return Number.isFinite(value);
        if (typeof value !== 'object' || ancestors.has(value)
            || ![Object.prototype, null].includes(Object.getPrototypeOf(value)) && !Array.isArray(value)) return false;
        ancestors.add(value);
        const valid = Reflect.ownKeys(value).every(key => typeof key === 'string')
            && (Array.isArray(value) ? Array.from(value) : Object.values(value)).every(item => jsonData(item, ancestors));
        ancestors.delete(value);
        return valid;
    }
    function validate(candidate) {
        if (!candidate || !id(candidate.occurrenceId)
            || !['experience', 'teaching', 'question'].includes(candidate.kind)
            || !id(candidate.sourceId) || !candidate.captured
            || typeof candidate.captured !== 'object' || Array.isArray(candidate.captured)
            || !jsonData(candidate)) {
            throw new TypeError('Invalid diary candidate');
        }
    }
    function create() {
        const candidates = [];
        // Capture once. Views and repeated delivery do not append, teach or
        // update an occurrence. A later occurrence may cite the same source.
        function retain(candidate) {
            validate(candidate);
            const existing = candidates.find(item => item.occurrenceId === candidate.occurrenceId);
            if (existing) return false;
            candidates.push(copy(candidate));
            return true;
        }
        function read() { return copy(candidates); }
        return Object.freeze({ retain, read });
    }
    return Object.freeze({ create });
});
