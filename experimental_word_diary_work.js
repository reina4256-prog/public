(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.ExperimentalWordDiaryWork = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';
    const copy = value => JSON.parse(JSON.stringify(value));
    const masters = ['explore', 'farming', 'fishing', 'cooking', 'smithing', 'building'];
    // Independent completion adapter; only smoke tests inject it in a renderer.
    // Results, demonstration labels and selection history are source material,
    // not proof of result vocabulary, understood dialogue or reason relations.
    function capture(buffer, event, beforeKnowledge, afterKnowledge) {
        if (event?.kind !== 'experience' || event.activity !== 'work' || !masters.includes(event.master)) return false;
        if (!Number.isSafeInteger(event.id) || event.id < 0 || event.target !== `master:${event.master}`
            || !Number.isFinite(event.start) || !Number.isFinite(event.end) || event.end < event.start
            || typeof event.result !== 'string' || !event.result
            || !(event.demonstration === null || event.demonstration === `work_label_${event.master}`)
            || !Array.isArray(event.reasons)
            || !['before', 'after'].every(key => event[key]
                && ['hunger', 'fatigue'].every(field => Number.isFinite(event[key][field])
                    && event[key][field] >= 0 && event[key][field] <= 1)
                && Number.isSafeInteger(event[key].completed) && event[key].completed >= 0)
            || !Array.isArray(beforeKnowledge?.meanings) || !Array.isArray(afterKnowledge?.meanings)) {
            throw new TypeError('Invalid diary work completion');
        }
        function grounding(id) {
            const previous = beforeKnowledge.meanings.find(item => item.id === id);
            const current = afterKnowledge.meanings.find(item => item.id === id);
            const acquired = !previous && current?.source === 'demonstrated_work'
                && event.demonstration === `work_label_${event.master}`
                && current.evidence?.some(item => item.experienceId === event.id
                    && item.master === event.master && item.demonstration === event.demonstration
                    && item.scope?.subject === 'self' && item.scope.activity === 'work'
                    && item.scope.master === event.master && item.scope.result === event.result);
            const known = (previous && current) || acquired;
            return { status: known ? 'recognized' : 'unrecognized',
                known: known ? [{ id, acquired: previous ? 'before_completion' : 'at_completion',
                    basis: copy(previous || current) }] : [], missing: known ? [] : [id] };
        }
        return buffer.retain({ occurrenceId: `experience:${event.id}`, kind: 'experience', sourceId: event.id,
            captured: { activity: 'work', master: event.master, target: event.target, start: event.start, end: event.end,
                sources: { before: event.before, after: event.after, result: event.result,
                    demonstration: event.demonstration, reasons: event.reasons },
                understanding: { point: 'after_completion_learning', activity: grounding('work'),
                    task: grounding(`work:${event.master}`) } } });
    }
    return Object.freeze({ capture });
});
