(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.ExperimentalWordDiaryKnownProposalExamples = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';
    const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    // Input-time known 3b2 teaching only; no game, storage or learning caller.
    function capture(buffer, result, context, beforeKnowledge) {
        const input = result?.input, frame = result?.interpretations?.[0];
        const understanding = result?.understandings?.[0], relation = frame?.proposalKind;
        const roles = { proposer: 'player', addressee: 'self',
            actors: relation === 'request' ? ['self'] : ['player', 'self'],
            status: 'proposed', actualParticipation: false };
        if (input?.speaker !== 'player' || !/^input:[1-9]\d*$/.test(input.id) || typeof input.raw !== 'string'
            || result.interpretations.length !== 1 || result.understandings?.length !== 1
            || frame?.kind !== 'proposal_demonstration' || !['request', 'invitation'].includes(relation)
            || frame.meaning !== 'rest' || frame.subject !== 'self' || !equal(frame.roles, roles)
            || typeof frame.utterance !== 'string' || !frame.utterance
            || typeof frame.form !== 'string' || !frame.form || frame.span !== input.raw.trim()
            || !equal(frame.relations, [relation]) || context?.scene !== input.scene
            || !Array.isArray(context.attention) || context.attention.length !== 1
            || context.mode !== 'rest' || context.target !== 'shade' || context.attention[0].id !== 'shade'
            || !Number.isFinite(input.at) || !Number.isFinite(context.elapsed)
            || !Number.isFinite(context.activityStart) || context.elapsed < context.activityStart
            || !Array.isArray(beforeKnowledge?.meanings) || !Array.isArray(beforeKnowledge.relations)
            || understanding?.kind !== 'proposal_demonstration' || understanding.complete !== true
            || understanding.known?.meaning !== 'rest' || !equal(understanding.unresolved, [])
            || !equal(understanding.relations, [relation]) || understanding.subject !== 'self'
            || !equal(understanding.roles, roles) || result.relationLearning) return false;
        const basis = beforeKnowledge.meanings.find(item => item.id === 'rest');
        const applies = entry => entry.scope?.kind === relation && entry.scope.locale === input.locale
            && entry.scope.speaker === input.speaker && entry.scope.meaning === 'rest'
            && entry.scope.form === frame.form && equal(entry.scope.roles, roles);
        const relationBasis = beforeKnowledge.relations.filter(entry => entry.id === relation
            && (entry.source === 'initial' || entry.source === 'experienced_relation' && applies(entry)));
        const references = relationBasis.filter(entry => entry.source === 'experienced_relation');
        if (!basis || !relationBasis.length || !equal(understanding.relationReferences || [], references)) return false;
        // Understood proposed roles remain proposals, never compliance or shared rest.
        return buffer.retain({ occurrenceId: `known_proposal_example:${input.id}`, kind: 'teaching', sourceId: input.id,
            captured: { sources: { input, scene: context.scene, attention: context.attention,
                activity: { mode: context.mode, target: context.target, start: context.activityStart, at: context.elapsed },
                frame, index: 0 }, basis, relationBasis, understanding, roles } });
    }
    return Object.freeze({ capture });
});
