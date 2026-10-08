(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.ExperimentalWordDiaryReportExamples = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';
    const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    // Existing 3b3 acceptance only. Source roles do not establish understood
    // roles, child observation, player experience or testimony verification.
    // This independent receiver has no game caller or persistence hook.
    function capture(buffer, result, context, beforeKnowledge) {
        const input = result?.input, frame = result?.interpretations?.[0];
        const understanding = result?.understandings?.[0], pairing = result?.relationLearning;
        const label = pairing?.candidates?.[0], adopted = pairing?.adopted;
        const roles = { reporter: 'player', contentSubject: frame?.subject, status: 'reported', verified: false };
        if (input?.speaker !== 'player' || !/^input:[1-9]\d*$/.test(input.id)
            || result.interpretations.length !== 1 || frame?.kind !== 'report_demonstration'
            || !['self', 'player'].includes(frame.subject) || frame.meaning !== 'rest'
            || frame.aspect !== 'activity_report' || !equal(frame.relations, ['report']) || !equal(frame.roles, roles)
            || typeof frame.utterance !== 'string' || !frame.utterance
            || typeof frame.form !== 'string' || !frame.form
            || context?.scene !== input.scene || !Array.isArray(context.attention) || context.attention.length !== 1
            || context.mode !== 'rest' || context.target !== 'shade' || context.attention[0].id !== 'shade'
            || !Number.isFinite(input.at) || !Number.isFinite(context.elapsed)
            || !Number.isFinite(context.activityStart) || context.elapsed < context.activityStart
            || !Array.isArray(beforeKnowledge?.meanings)
            || understanding?.kind !== 'partial' || understanding.complete !== false
            || understanding.known?.meaning !== 'rest' || !equal(understanding.relations, [])
            || understanding.subject !== null || understanding.aspect !== null
            || understanding.eventTime !== 'unspecified' || understanding.roles !== undefined
            || understanding.reportSource !== undefined
            || !equal(understanding.unresolved, [{ type: 'relation', id: 'report' }])
            || pairing?.candidates?.length !== 1 || pairing.updated?.length !== 0
            || pairing.relationAcquired !== false) return false;
        const basis = beforeKnowledge.meanings.find(item => item.id === 'rest');
        if (!basis || !equal(label?.basis, basis) || !equal(label?.understanding, understanding)
            || label.relation !== 'report' || label.inputId !== input.id || label.raw !== input.raw
            || label.locale !== input.locale || label.speaker !== input.speaker
            || label.heardAt !== input.at || label.scene !== input.scene || label.subject !== 'self'
            || label.utterance !== frame.utterance || label.form !== frame.form || !equal(label.roles, roles)
            || label.meaning !== 'rest' || label.activity !== 'rest' || label.target !== 'shade'
            || label.start !== context.activityStart || label.at !== context.elapsed
            || adopted?.relation !== 'report' || !equal(adopted.roles, roles)
            || adopted.activity !== label.activity || adopted.target !== label.target || adopted.start !== label.start) return false;
        // Learning keeps its first accepted subject; the current same-subject
        // input still has its own occurrence. A conflicting subject has no label.
        return buffer.retain({ occurrenceId: `report_example:${input.id}`, kind: 'teaching', sourceId: input.id,
            captured: { sources: { input, scene: context.scene, attention: context.attention,
                activity: { mode: context.mode, target: context.target, start: context.activityStart, at: context.elapsed },
                frame, index: 0 }, basis, understanding, pairing } });
    }
    return Object.freeze({ capture });
});
