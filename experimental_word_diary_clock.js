(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.ExperimentalWordDiaryClock = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';
    // Isolated arithmetic prototype. No calendar, wall clock, records, or storage.
    // The caller supplies active elapsed time only, never a resume/catch-up gap.
    const DAY_MS = 25 * 60 * 1000;
    const STOP_REASONS = Object.freeze(['manualPaused', 'encounterOpen', 'hidden', 'closed']);
    function create() { return { dayIndex: 0, elapsedMs: 0 }; }
    function advance(state, activeDeltaMs, stops = {}) {
        if (!state || !Number.isSafeInteger(state.dayIndex) || state.dayIndex < 0
            || !Number.isFinite(state.elapsedMs) || state.elapsedMs < 0 || state.elapsedMs >= DAY_MS) {
            throw new RangeError('Invalid diary clock state');
        }
        if (!Number.isFinite(activeDeltaMs) || activeDeltaMs < 0 || activeDeltaMs > Number.MAX_SAFE_INTEGER) {
            throw new RangeError('Invalid active elapsed time');
        }
        if (!stops || typeof stops !== 'object' || Array.isArray(stops)
            || Object.keys(stops).some(key => !STOP_REASONS.includes(key) || typeof stops[key] !== 'boolean')) {
            throw new TypeError('Invalid diary clock stop reasons');
        }
        const stopped = STOP_REASONS.some(key => stops[key] === true);
        const total = state.elapsedMs + (stopped ? 0 : activeDeltaMs);
        if (total > Number.MAX_SAFE_INTEGER) throw new RangeError('Diary elapsed time overflow');
        const crossedDays = Math.floor(total / DAY_MS);
        const dayIndex = state.dayIndex + crossedDays;
        if (!Number.isSafeInteger(dayIndex)) throw new RangeError('Diary day index overflow');
        // Return new data; crossing a boundary does not end an action or choose a drawing.
        return { state: { dayIndex, elapsedMs: total % DAY_MS }, crossedDays };
    }
    return Object.freeze({ DAY_MS, STOP_REASONS, create, advance });
});
