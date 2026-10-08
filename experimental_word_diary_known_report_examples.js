(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.ExperimentalWordDiaryKnownReportExamples = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';
    const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    // Input-time known 3b3 teaching only. No game, storage or learning caller.
    function capture(buffer, result, context, beforeKnowledge) {
        const input = result?.input, frame = result?.interpretations?.[0];
        const understanding = result?.understandings?.[0];
        const roles = { reporter: 'player', contentSubject: frame?.subject, status: 'reported', verified: false };
        if (input?.speaker !== 'player' || !/^input:[1-9]\d*$/.test(input.id) || typeof input.raw !== 'string'
            || result.interpretations.length !== 1 || result.understandings?.length !== 1
            || frame?.kind !== 'report_demonstration' || !['self', 'player'].includes(frame.subject)
            || frame.meaning !== 'rest' || frame.aspect !== 'activity_report' || !equal(frame.roles, roles)
            || typeof frame.utterance !== 'string' || !frame.utterance
            || typeof frame.form !== 'string' || !frame.form || frame.span !== input.raw
            || !equal(frame.relations, ['report']) || context?.scene !== input.scene
            || !Array.isArray(context.attention) || context.attention.length !== 1
            || context.mode !== 'rest' || context.target !== 'shade' || context.attention[0].id !== 'shade'
            || !Number.isFinite(input.at) || !Number.isFinite(context.elapsed)
            || !Number.isFinite(context.activityStart) || context.elapsed < context.activityStart
            || !Array.isArray(beforeKnowledge?.meanings) || !Array.isArray(beforeKnowledge.relations)
            || understanding?.kind !== 'report_demonstration' || understanding.complete !== true
            || understanding.known?.meaning !== 'rest' || !equal(understanding.unresolved, [])
            || !equal(understanding.relations, ['report']) || understanding.subject !== frame.subject
            || understanding.aspect !== 'activity_report' || understanding.polarity !== 'positive'
            || understanding.eventTime !== 'unspecified' || !equal(understanding.roles, roles)
            || understanding.reportSource !== undefined || result.relationLearning) return false;
        const basis = beforeKnowledge.meanings.find(item => item.id === 'rest');
        const applies = entry => entry.scope?.kind === 'report' && entry.scope.locale === input.locale
            && entry.scope.speaker === input.speaker && entry.scope.meaning === 'rest'
            && entry.scope.form === frame.form && equal(entry.scope.roles, roles);
        const relationBasis = beforeKnowledge.relations.filter(entry => entry.id === 'report'
            && (entry.source === 'initial' || entry.source === 'experienced_relation' && applies(entry)));
        const references = relationBasis.filter(entry => entry.source === 'experienced_relation');
        if (!basis || !relationBasis.length || !equal(understanding.relationReferences || [], references)) return false;
        // Understood reported roles remain quoted teaching, never self-observation,
        // the child's speech, player rest or verified testimony.
        return buffer.retain({ occurrenceId: `known_report_example:${input.id}`, kind: 'teaching', sourceId: input.id,
            captured: { sources: { input, scene: context.scene, attention: context.attention,
                activity: { mode: context.mode, target: context.target, start: context.activityStart, at: context.elapsed },
                frame, index: 0 }, basis, relationBasis, understanding, roles } });
    }
    return Object.freeze({ capture });
});
