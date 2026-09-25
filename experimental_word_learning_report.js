(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.ExperimentalWordReport = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';
    const clone = value => JSON.parse(JSON.stringify(value));
    function create(initial, now = Date.now()) {
        const baseline = clone(initial);
        const startedAt = new Date(now).toISOString();
        const timeline = [];
        return Object.freeze({
            record(kind, data, at = Date.now()) {
                timeline.push({ sequence: timeline.length + 1, at, kind, ...clone(data) });
            },
            build(current, notebook, metadata = {}, now = Date.now()) {
                return clone({ format: 'word-learning-playtest', version: 1,
                    implementation: '2026-09-25-report-v1', recording: { scope: 'current-session', startedAt },
                    exportedAt: new Date(now).toISOString(), metadata, initial: baseline, timeline, notebook, current });
            }
        });
    }
    return Object.freeze({ create });
});
