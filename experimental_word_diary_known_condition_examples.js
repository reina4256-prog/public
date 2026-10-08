(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.ExperimentalWordDiaryKnownConditionExamples = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';
    const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    const roles = { proposer: 'player', addressee: 'self', actors: ['self'], status: 'proposed', actualParticipation: false };
    const status = fatigue => fatigue >= .55 ? 'met' : fatigue <= .25 ? 'unmet' : 'unknown';
    // Input-time known 3c3b teaching only. Sensation is separate material,
    // never a condition judgment, new learned side or followed request.
    function capture(buffer, result, context, beforeKnowledge) {
        const input = result?.input, frame = result?.interpretations?.[0];
        const understanding = result?.understandings?.[0];
        if (input?.speaker !== 'player' || !/^input:[1-9]\d*$/.test(input.id)
            || typeof input.raw !== 'string' || result.interpretations?.length !== 1
            || result.understandings?.length !== 1 || frame?.kind !== 'condition_demonstration'
            || frame.subject !== 'self' || frame.meaning !== 'rest'
            || frame.conditionMeaning !== 'tired' || frame.conditionSubject !== 'self'
            || frame.proposalKind !== 'request' || !equal(frame.relations, ['request', 'condition'])
            || !equal(frame.roles, roles) || frame.application !== 'when_met' || frame.duration !== 'unspecified'
            || !['met', 'unmet'].includes(frame.demonstratedStatus)
            || !['utterance', 'form', 'proposalForm'].every(key => typeof frame[key] === 'string' && frame[key])
            || frame.span !== input.raw || context?.scene !== input.scene
            || context.mode !== 'rest' || context.target !== 'shade'
            || !Array.isArray(context.attention) || context.attention.length !== 1 || context.attention[0].id !== 'shade'
            || !Number.isFinite(input.at) || !Number.isFinite(context.elapsed)
            || !Number.isFinite(context.activityStart) || context.elapsed < context.activityStart
            || !Number.isFinite(context.activityBefore?.fatigue) || context.activityBefore.fatigue < 0
            || context.activityBefore.fatigue > 1 || !Number.isFinite(context.fatigue)
            || context.fatigue < 0 || context.fatigue > context.activityBefore.fatigue
            || status(context.fatigue) !== frame.demonstratedStatus
            || !Array.isArray(beforeKnowledge?.meanings) || !Array.isArray(beforeKnowledge.relations)
            || understanding?.kind !== 'condition_demonstration' || understanding.complete !== true
            || !equal(understanding.known, { meaning: 'rest', conditionMeaning: 'tired' })
            || !equal(understanding.relations, ['request', 'condition']) || !equal(understanding.unresolved, [])
            || understanding.conditionStatus !== 'unknown' || understanding.subject !== 'self'
            || understanding.aspect !== null || understanding.target !== null || understanding.questionSlot !== null
            || understanding.polarity !== 'positive' || understanding.eventTime !== 'unspecified'
            || !equal(understanding.roles, roles) || understanding.reportSource !== undefined
            || result.relationLearning !== undefined || result.conditionJudgment !== undefined) return false;
        const basis = beforeKnowledge.meanings.find(item => item.id === 'rest');
        const conditionBasis = beforeKnowledge.meanings.find(item => item.id === 'tired');
        const applies = entry => entry.scope?.locale === input.locale && entry.scope.speaker === input.speaker
            && entry.scope.meaning === 'rest' && equal(entry.scope.roles, roles)
            && (entry.id === 'request' ? entry.scope.kind === 'request' && entry.scope.form === frame.proposalForm
                : entry.scope.kind === 'conditional_proposal' && entry.scope.form === frame.form
                    && ['proposalForm', 'conditionMeaning', 'conditionSubject', 'application', 'duration']
                        .every(key => entry.scope[key] === frame[key]));
        const relationBasis = beforeKnowledge.relations.filter(entry => ['request', 'condition'].includes(entry.id)
            && (entry.source === 'initial' || entry.source === 'experienced_relation' && applies(entry)));
        if (!basis || !conditionBasis || !['request', 'condition'].every(id => relationBasis.some(entry => entry.id === id))
            || !equal(understanding.relationReferences || [], relationBasis.filter(entry => entry.source === 'experienced_relation'))) return false;
        const observation = { source: 'self_sensation', subject: 'self', activity: 'rest', target: 'shade',
            start: context.activityStart, at: context.elapsed, before: context.activityBefore.fatigue,
            fatigue: context.fatigue, status: status(context.fatigue) };
        return buffer.retain({ occurrenceId: `known_condition_example:${input.id}`, kind: 'teaching', sourceId: input.id,
            captured: { sources: { input, scene: context.scene, attention: context.attention,
                activity: { mode: context.mode, target: context.target, start: context.activityStart, at: context.elapsed },
                frame, index: 0, observation }, basis, conditionBasis, relationBasis, understanding, roles } });
    }
    return Object.freeze({ capture });
});
