(function (root, factory) {
    const api = factory(typeof module === 'object' && module.exports
        ? require('./experimental_word_learning_catalog.json') : root.ExperimentalWordDiarySequenceProposalCatalog);
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.ExperimentalWordDiarySequenceProposals = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (catalog) {
    'use strict';
    const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    const normalize = text => text.normalize('NFKC').trim().toLocaleLowerCase();
    const roles = { proposer: 'player', addressee: 'self', actors: ['self'], status: 'proposed', actualParticipation: false };
    const serial = id => typeof id === 'string' && /^input:[1-9]\d*$/.test(id) ? Number(id.slice(6)) : NaN;
    function applies(entry, frame, input) {
        const scope = entry.scope;
        return scope?.locale === input.locale && scope.speaker === input.speaker && scope.meaning === 'rest'
            && equal(scope.roles, roles) && (entry.id === 'request'
                ? scope.kind === 'request' && scope.form === frame.proposalForm
                : scope.kind === 'sequential_proposal' && ['form', 'proposalForm', 'eventMeaning', 'eventSubject', 'application']
                    .every(field => scope[field] === frame[field]));
    }
    function basisValid(basis, meaning, input, at) {
        return basis?.id === meaning && (basis.source === 'initial'
            || basis.source === 'experienced_life' && Array.isArray(basis.evidence) && basis.evidence.length > 0
                && basis.evidence.every(e => Number.isSafeInteger(e.experienceId) && e.experienceId > 0
                    && e.scope?.subject === 'self' && e.scope.activity === meaning
                    && typeof e.scope.target === 'string' && e.scope.target.length > 0
                    && Number.isSafeInteger(serial(e.scope.inputId)) && serial(e.scope.inputId) < serial(input.id)
                    && Number.isFinite(e.scope.labelAt) && e.scope.labelAt >= 0 && e.scope.labelAt <= at
                    && typeof e.scope.speaker === 'string' && e.scope.speaker.length > 0
                    && typeof e.scope.label === 'string' && e.scope.label.length > 0));
    }
    // Ordinary requests only. Learning evidence is a comprehension source,
    // never the meal referred to by this request or a completion judgment.
    function capture(buffer, result, context, beforeKnowledge) {
        const input = result?.input, frame = result?.interpretations?.[0], u = result?.understandings?.[0];
        const item = catalog?.sequenceTeaching?.[input?.locale], proposal = catalog?.proposalTeaching?.[input?.locale]?.request;
        if (input?.speaker !== 'player' || !Number.isSafeInteger(serial(input.id)) || typeof input.raw !== 'string'
            || !Number.isFinite(input.at) || !item || !proposal
            || result.interpretations?.length !== 1 || result.understandings?.length !== 1
            || frame?.kind !== 'sequential_proposal' || frame.phase !== undefined
            || frame.subject !== 'self' || frame.meaning !== 'rest' || frame.eventMeaning !== 'eat'
            || frame.eventSubject !== 'self' || frame.application !== 'after_completion' || frame.proposalKind !== 'request'
            || !equal(frame.relations, ['request', 'sequence']) || !equal(frame.roles, roles)
            || frame.span !== input.raw || frame.utterance !== item.utterance || frame.form !== normalize(item.utterance)
            || frame.proposalForm !== normalize(proposal.utterance) || normalize(input.raw) !== frame.form
            || context?.scene !== input.scene || typeof context.mode !== 'string' || !context.mode
            || !(context.target === null || typeof context.target === 'string') || !Array.isArray(context.attention)
            || !Number.isFinite(context.elapsed) || !Number.isFinite(context.activityStart)
            || context.activityStart < 0 || context.elapsed < context.activityStart
            || !Array.isArray(beforeKnowledge?.meanings) || !Array.isArray(beforeKnowledge.relations)
            || u?.kind !== 'sequential_proposal' || u.complete !== true
            || !equal(u.known, { meaning: 'rest', eventMeaning: 'eat' })
            || !equal(u.relations, ['request', 'sequence']) || !equal(u.unresolved, []) || !equal(u.roles, roles)
            || u.subject !== 'self' || u.target !== null || u.aspect !== null || u.questionSlot !== null
            || u.conditionStatus !== null || u.polarity !== 'positive' || u.eventTime !== 'unspecified'
            || u.reportSource !== undefined || u.eventReference !== undefined
            || frame.eventReference !== undefined || result.relationLearning !== undefined
            || result.conditionJudgment !== undefined || result.sequenceJudgment !== undefined) return false;
        const basis = beforeKnowledge.meanings.find(m => m.id === 'rest');
        const eventBasis = beforeKnowledge.meanings.find(m => m.id === 'eat');
        const relationBasis = beforeKnowledge.relations.filter(r => ['request', 'sequence'].includes(r.id)
            && (r.source === 'initial' || r.source === 'experienced_relation' && applies(r, frame, input)));
        if (!basisValid(basis, 'rest', input, context.elapsed) || !basisValid(eventBasis, 'eat', input, context.elapsed)
            || !['request', 'sequence'].every(id => relationBasis.some(r => r.id === id))
            || !relationBasis.every(r => r.source === 'initial' || Array.isArray(r.evidence)
                && r.evidence.length === 2 && new Set(r.evidence).size === 2
                && r.evidence.every(id => Number.isSafeInteger(serial(id)) && serial(id) < serial(input.id)))
            || !equal(u.relationReferences || [], relationBasis.filter(r => r.source === 'experienced_relation'))) return false;
        return buffer.retain({ occurrenceId: `sequence_proposal:${input.id}`, kind: 'proposal', sourceId: input.id,
            captured: { sources: { input, frame, index: 0, scene: context.scene, attention: context.attention,
                activity: { mode: context.mode, target: context.target, start: context.activityStart, at: context.elapsed } },
                basis, eventBasis, relationBasis, understanding: u, roles } });
    }
    return Object.freeze({ capture });
});
