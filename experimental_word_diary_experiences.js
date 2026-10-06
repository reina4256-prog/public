(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.ExperimentalWordDiaryExperiences = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';
    const copy = value => JSON.parse(JSON.stringify(value));
    // Independent occurrence adapter. The caller copies knowledge immediately
    // before onArrival, then supplies knowledge immediately after its learning.
    // No game caller, prose, calendar or save schema. Numerical/sensory sources
    // are retained separately, never interpreted as feelings or reasons.
    function capture(buffer, event, beforeKnowledge, afterKnowledge) {
        if (event?.kind !== 'experience' || !['eat', 'rest'].includes(event.activity)) return false;
        if (event.activity === 'eat' ? !/^berry:[1-9]\d*$/.test(event.target) : event.target !== 'shade') return false;
        if (!Number.isSafeInteger(event.id) || event.id < 0 || !Number.isFinite(event.start)
            || !Number.isFinite(event.end) || event.end < event.start
            || typeof event.target !== 'string' || !event.target
            || !['before', 'after'].every(key => event[key]
                && ['hunger', 'fatigue'].every(field => Number.isFinite(event[key][field])
                    && event[key][field] >= 0 && event[key][field] <= 1))
            || !Array.isArray(beforeKnowledge?.meanings) || !Array.isArray(afterKnowledge?.meanings)) {
            throw new TypeError('Invalid diary completion');
        }
        function grounding(ids) {
            const known = [], missing = [];
            for (const id of ids) {
                const previous = beforeKnowledge.meanings.find(item => item.id === id);
                const current = afterKnowledge.meanings.find(item => item.id === id);
                // A later lesson from a different experience cannot stand in for
                // knowledge acquired during this completion. No retroactive grant.
                const acquired = !previous && current?.source === 'experienced_life'
                    && current.evidence?.some(item => item.experienceId === event.id);
                if ((previous && current) || acquired) known.push({ id,
                    acquired: previous ? 'before_completion' : 'at_completion',
                    basis: copy(previous || current) });
                else missing.push(id);
            }
            return { status: missing.length ? 'unrecognized' : 'recognized', known, missing };
        }
        const field = event.activity === 'eat' ? 'hunger' : 'fatigue';
        const improved = event.after[field] < event.before[field];
        const understanding = { point: 'after_completion_learning',
            activity: grounding([event.activity]),
            recovery: improved ? grounding(event.activity === 'eat' ? ['eat', 'hungry'] : ['rest', 'tired'])
                : { status: 'not_applicable', known: [], missing: [] } };
        if (event.activity === 'eat') understanding.taste = event.taste?.quality === 'sweet'
            ? grounding(['sweet']) : { status: 'uninterpreted', known: [], missing: [] };
        return buffer.retain({ occurrenceId: `experience:${event.id}`, kind: 'experience', sourceId: event.id,
            captured: { activity: event.activity, target: event.target, start: event.start, end: event.end,
                sensation: { before: copy(event.before), after: copy(event.after),
                    ...(event.activity === 'eat' && event.taste ? { taste: copy(event.taste) } : {}) },
                understanding } });
    }
    return Object.freeze({ capture });
});
