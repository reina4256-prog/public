(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.ExperimentalWordDiaryConditionProposals = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';
    const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    const key = value => value.normalize('NFKC').trim().toLocaleLowerCase();
    const roles = { proposer: 'player', addressee: 'self', actors: ['self'], status: 'proposed', actualParticipation: false };
    const status = fatigue => fatigue >= .55 ? 'met' : fatigue <= .25 ? 'unmet' : 'unknown';
    // Ordinary conditional requests only. Syntax, this hearing's judgment and
    // its sensory source stay separate; none is a followed request or lesson.
    function capture(buffer, result, context, beforeKnowledge) {
        const input = result?.input, frame = result?.interpretations?.[0];
        const understanding = result?.understandings?.[0], judgment = result?.conditionJudgment;
        if (input?.speaker !== 'player' || !/^input:[1-9]\d*$/.test(input.id)
            || typeof input.raw !== 'string' || !Number.isFinite(input.at)
            || !['ja', 'en', 'zh-CN', 'ru', 'es-ES', 'pt-BR', 'de'].includes(input.locale)
            || result.interpretations?.length !== 1 || result.understandings?.length !== 1
            || frame?.kind !== 'conditional_proposal' || frame.subject !== 'self' || frame.meaning !== 'rest'
            || frame.conditionMeaning !== 'tired' || frame.conditionSubject !== 'self'
            || frame.proposalKind !== 'request' || !equal(frame.relations, ['request', 'condition'])
            || !equal(frame.roles, roles) || frame.application !== 'when_met' || frame.duration !== 'unspecified'
            || frame.demonstratedStatus !== undefined
            || !['utterance', 'form', 'proposalForm'].every(field => typeof frame[field] === 'string' && frame[field])
            || frame.span !== input.raw || key(input.raw) !== frame.form || key(frame.utterance) !== frame.form
            || context?.scene !== input.scene || !Array.isArray(context.attention)
            || typeof context.mode !== 'string' || !(context.target === null || typeof context.target === 'string')
            || !Number.isFinite(context.elapsed) || context.elapsed < 0
            || !Number.isFinite(context.activityStart) || context.activityStart < 0 || context.activityStart > context.elapsed
            || !Array.isArray(beforeKnowledge?.meanings) || !Array.isArray(beforeKnowledge.relations)
            || understanding?.kind !== 'conditional_proposal' || understanding.complete !== true
            || !equal(understanding.known, { meaning: 'rest', conditionMeaning: 'tired' })
            || !equal(understanding.relations, ['request', 'condition']) || !equal(understanding.unresolved, [])
            || understanding.conditionStatus !== 'unknown' || understanding.subject !== 'self'
            || understanding.aspect !== null || understanding.target !== null || understanding.questionSlot !== null
            || understanding.polarity !== 'positive' || understanding.eventTime !== 'unspecified'
            || !equal(understanding.roles, roles) || understanding.reportSource !== undefined
            || result.relationLearning !== undefined || !judgment) return false;
        const basis = beforeKnowledge.meanings.find(item => item.id === 'rest');
        const conditionBasis = beforeKnowledge.meanings.find(item => item.id === 'tired');
        const applies = entry => entry.scope?.locale === input.locale && entry.scope.speaker === input.speaker
            && entry.scope.meaning === 'rest' && equal(entry.scope.roles, roles)
            && (entry.id === 'request' ? entry.scope.kind === 'request' && entry.scope.form === frame.proposalForm
                : entry.scope.kind === 'conditional_proposal' && entry.scope.form === frame.form
                    && ['proposalForm', 'conditionMeaning', 'conditionSubject', 'application', 'duration']
                        .every(field => entry.scope[field] === frame[field]));
        const relationBasis = beforeKnowledge.relations.filter(entry => ['request', 'condition'].includes(entry.id)
            && (entry.source === 'initial' || entry.source === 'experienced_relation' && applies(entry)));
        if (!basis || !conditionBasis || !['request', 'condition'].every(id => relationBasis.some(entry => entry.id === id))
            || !equal(understanding.relationReferences || [], relationBasis.filter(entry => entry.source === 'experienced_relation'))) return false;
        const observed = context.mode === 'rest' && context.target === 'shade'
            && context.attention.length === 1 && context.attention[0]?.id === 'shade'
            && Number.isFinite(context.fatigue) && Number.isFinite(context.activityBefore?.fatigue);
        if (observed && (context.fatigue < 0 || context.activityBefore.fatigue > 1
            || context.fatigue > context.activityBefore.fatigue)) return false;
        const observation = observed ? { source: 'self_sensation', subject: 'self', activity: 'rest', target: 'shade',
            start: context.activityStart, at: context.elapsed, before: context.activityBefore.fatigue,
            fatigue: context.fatigue, status: status(context.fatigue) } : null;
        const expected = { inputId: input.id, raw: input.raw, locale: input.locale, speaker: input.speaker,
            heardAt: input.at, at: context.elapsed, status: observation?.status || 'unknown', observation,
            application: 'when_met', duration: 'unspecified' };
        if (!equal(judgment, expected)) return false;
        return buffer.retain({ occurrenceId: `condition_proposal:${input.id}`, kind: 'proposal', sourceId: input.id,
            captured: { sources: { input, scene: context.scene, attention: context.attention,
                activity: { mode: context.mode, target: context.target, start: context.activityStart, at: context.elapsed },
                frame, index: 0, observation }, basis, conditionBasis, relationBasis, understanding, roles,
                conditionJudgment: judgment } });
    }
    return Object.freeze({ capture });
});
