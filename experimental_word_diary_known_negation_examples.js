(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.ExperimentalWordDiaryKnownNegationExamples = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';
    const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    // Input-time known 3c1 teaching only; no game, learning or storage caller.
    function capture(buffer, result, context, beforeKnowledge) {
        const input = result?.input, frame = result?.interpretations?.[0];
        const understanding = result?.understandings?.[0];
        const roles = { reporter: 'player', contentSubject: 'self', status: 'reported', verified: false };
        const activity = frame?.polarity === 'positive' ? 'rest' : 'eat';
        if (input?.speaker !== 'player' || !/^input:[1-9]\d*$/.test(input.id)
            || typeof input.raw !== 'string' || result.interpretations.length !== 1
            || result.understandings?.length !== 1 || frame?.kind !== 'negation_demonstration'
            || frame.subject !== 'self' || frame.meaning !== 'rest' || frame.aspect !== 'activity_report'
            || !['positive', 'negative'].includes(frame.polarity)
            || !equal(frame.relations, ['report', 'negation']) || !equal(frame.roles, roles)
            || !['utterance', 'form', 'reportForm'].every(key => typeof frame[key] === 'string' && frame[key])
            || frame.span !== input.raw || context?.scene !== input.scene
            || !Array.isArray(context.attention) || context.attention.length !== 1
            || context.mode !== activity || context.attention[0].id !== context.target
            || (activity === 'rest' ? context.target !== 'shade' : !/^berry:[1-9]\d*$/.test(context.target))
            || !Number.isFinite(input.at) || !Number.isFinite(context.elapsed)
            || !Number.isFinite(context.activityStart) || context.elapsed < context.activityStart
            || !Array.isArray(beforeKnowledge?.meanings) || !Array.isArray(beforeKnowledge.relations)
            || understanding?.kind !== 'negation_demonstration' || understanding.complete !== true
            || understanding.known?.meaning !== 'rest' || !equal(understanding.unresolved, [])
            || !equal(understanding.relations, ['report', 'negation'])
            || understanding.subject !== 'self' || understanding.aspect !== 'activity_report'
            || understanding.polarity !== frame.polarity || understanding.eventTime !== 'unspecified'
            || !equal(understanding.roles, roles) || understanding.reportSource !== undefined
            || result.relationLearning) return false;
        const basis = beforeKnowledge.meanings.find(item => item.id === 'rest');
        const observationBasis = beforeKnowledge.meanings.find(item => item.id === activity);
        const applies = entry => entry.scope?.kind === 'report' && entry.scope.meaning === 'rest'
            && entry.scope.locale === input.locale && entry.scope.speaker === input.speaker
            && equal(entry.scope.roles, roles) && (entry.id === 'report'
                ? entry.scope.form === frame.reportForm
                : entry.scope.form === frame.form && entry.scope.polarity === frame.polarity
                    && entry.scope.reportForm === frame.reportForm);
        const relationBasis = beforeKnowledge.relations.filter(entry => ['report', 'negation'].includes(entry.id)
            && (entry.source === 'initial' || entry.source === 'experienced_relation' && applies(entry)));
        if (!basis || !observationBasis || !['report', 'negation'].every(id => relationBasis.some(entry => entry.id === id))
            || !equal(understanding.relationReferences || [], relationBasis.filter(entry => entry.source === 'experienced_relation'))) return false;
        // Understood polarity and reported roles do not verify the testimony,
        // become child speech, or imply eating or a wish not to rest.
        return buffer.retain({ occurrenceId: `known_negation_example:${input.id}`, kind: 'teaching', sourceId: input.id,
            captured: { sources: { input, scene: context.scene, attention: context.attention,
                activity: { mode: context.mode, target: context.target, start: context.activityStart, at: context.elapsed },
                frame, index: 0 }, basis, observationBasis, relationBasis, understanding, roles } });
    }
    return Object.freeze({ capture });
});
