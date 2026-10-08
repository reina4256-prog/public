(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.ExperimentalWordDiaryConditionExamples = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';
    const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    const roles = { proposer: 'player', addressee: 'self', actors: ['self'], status: 'proposed', actualParticipation: false };
    const status = fatigue => fatigue >= .55 ? 'met' : fatigue <= .25 ? 'unmet' : 'unknown';
    function partial(value) {
        return value?.kind === 'partial' && value.complete === false
            && equal(value.known, { meaning: 'rest', conditionMeaning: 'tired' })
            && equal(value.relations, ['request'])
            && equal(value.unresolved, [{ type: 'relation', id: 'condition' }])
            && value.conditionStatus === 'unknown' && value.subject === null && value.aspect === null
            && value.target === null && value.questionSlot === null
            && value.polarity === 'positive' && value.eventTime === 'unspecified'
            && value.roles === undefined && value.reportSource === undefined;
    }
    function validObservation(value) {
        return value?.source === 'self_sensation' && value.subject === 'self'
            && value.activity === 'rest' && value.target === 'shade'
            && Number.isFinite(value.start) && Number.isFinite(value.at) && value.at >= value.start
            && Number.isFinite(value.before) && value.before >= 0 && value.before <= 1
            && Number.isFinite(value.fatigue) && value.fatigue >= 0 && value.fatigue <= value.before
            && ['met', 'unmet'].includes(value.status) && value.status === status(value.fatigue);
    }
    // Existing 3c3b acceptance only. A matching sensation is teaching material,
    // not understanding the condition, following the request, or a new rest.
    function capture(buffer, result, context, beforeKnowledge) {
        const input = result?.input, frame = result?.interpretations?.[0];
        const understanding = result?.understandings?.[0], pairing = result?.relationLearning;
        const label = pairing?.candidates?.[0], adopted = pairing?.adopted;
        if (input?.speaker !== 'player' || !/^input:[1-9]\d*$/.test(input.id)
            || result.interpretations?.length !== 1 || result.understandings?.length !== 1
            || frame?.kind !== 'condition_demonstration' || frame.subject !== 'self'
            || frame.meaning !== 'rest' || frame.conditionMeaning !== 'tired' || frame.conditionSubject !== 'self'
            || frame.proposalKind !== 'request' || !equal(frame.relations, ['request', 'condition'])
            || !equal(frame.roles, roles) || frame.application !== 'when_met' || frame.duration !== 'unspecified'
            || !['met', 'unmet'].includes(frame.demonstratedStatus)
            || !['utterance', 'form', 'proposalForm'].every(key => typeof frame[key] === 'string' && frame[key])
            || frame.span !== input.raw || context?.scene !== input.scene
            || context.mode !== 'rest' || context.target !== 'shade'
            || !Array.isArray(context.attention) || context.attention.length !== 1 || context.attention[0].id !== 'shade'
            || !Number.isFinite(input.at) || !Number.isFinite(context.elapsed)
            || !Number.isFinite(context.activityStart) || context.elapsed < context.activityStart
            || !Array.isArray(beforeKnowledge?.meanings) || !Array.isArray(beforeKnowledge.relations)
            || !partial(understanding) || result.conditionJudgment !== undefined
            || pairing?.candidates?.length !== 1 || pairing.updated?.length !== 0 || pairing.relationAcquired !== false) return false;
        const basis = beforeKnowledge.meanings.find(item => item.id === 'rest');
        const conditionBasis = beforeKnowledge.meanings.find(item => item.id === 'tired');
        const proposalBasis = beforeKnowledge.relations.find(item => item.id === 'request'
            && (item.source === 'initial' || item.source === 'experienced_relation'
                && item.scope?.kind === 'request' && item.scope.meaning === 'rest'
                && item.scope.form === frame.proposalForm && item.scope.locale === input.locale
                && item.scope.speaker === input.speaker && equal(item.scope.roles, roles)));
        const references = proposalBasis?.source === 'experienced_relation' ? [proposalBasis] : [];
        const observation = label?.observation;
        if (!basis || !conditionBasis || !proposalBasis || !equal(understanding.relationReferences || [], references)
            || !validObservation(observation) || observation.status !== frame.demonstratedStatus
            || observation.start !== context.activityStart || observation.at !== context.elapsed
            || observation.before !== context.activityBefore?.fatigue || observation.fatigue !== context.fatigue
            || !equal(label?.basis, basis) || !equal(label.conditionBasis, conditionBasis)
            || !equal(label.proposalBasis, proposalBasis) || !equal(label.understanding, understanding)
            || label.relation !== 'condition' || label.inputId !== input.id || label.raw !== input.raw
            || label.locale !== input.locale || label.speaker !== input.speaker || label.heardAt !== input.at
            || label.scene !== input.scene || label.subject !== 'self' || !equal(label.roles, roles)
            || label.meaning !== 'rest' || label.activity !== 'rest' || label.target !== 'shade'
            || label.start !== context.activityStart || label.at !== context.elapsed
            || !['utterance', 'form', 'proposalForm', 'conditionMeaning', 'conditionSubject', 'application', 'duration',
                'demonstratedStatus'].every(key => label[key] === frame[key])
            || adopted?.relation !== 'condition' || !/^input:[1-9]\d*$/.test(adopted.inputId)
            || Number(adopted.inputId.slice(6)) > Number(input.id.slice(6))
            || !Number.isFinite(adopted.heardAt) || !Number.isFinite(adopted.at)
            || adopted.at < context.activityStart || adopted.at > context.elapsed
            || !['locale', 'speaker', 'scene', 'subject', 'meaning', 'activity', 'target', 'start', 'utterance', 'form',
                'proposalForm', 'conditionMeaning', 'conditionSubject', 'application', 'duration']
                .every(key => adopted[key] === label[key])
            || !equal(adopted.roles, roles) || !equal(adopted.basis, basis)
            || !equal(adopted.conditionBasis, conditionBasis) || !equal(adopted.proposalBasis, proposalBasis)
            || !partial(adopted.understanding) || !equal(adopted.understanding.relationReferences || [], references)
            || !validObservation(adopted.observation) || adopted.observation.start !== adopted.start
            || adopted.observation.at !== adopted.at || adopted.observation.status !== adopted.demonstratedStatus
            || adopted.observation.before !== context.activityBefore.fatigue
            || typeof adopted.raw !== 'string' || !adopted.raw.endsWith(`「${frame.utterance}」`)
            || (adopted.demonstratedStatus === label.demonstratedStatus && adopted.raw !== label.raw)
            || (adopted.inputId === input.id && !equal(adopted, label))) return false;
        return buffer.retain({ occurrenceId: `condition_example:${input.id}`, kind: 'teaching', sourceId: input.id,
            captured: { sources: { input, scene: context.scene, attention: context.attention,
                activity: { mode: context.mode, target: context.target, start: context.activityStart, at: context.elapsed },
                frame, index: 0, observation }, basis, conditionBasis, proposalBasis, understanding, pairing } });
    }
    return Object.freeze({ capture });
});
