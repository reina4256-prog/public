(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.ExperimentalWordDiaryKnownQuestionExamples = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';
    const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    const roles = { questioner: 'player', answerer: 'self', demonstrator: 'player', actualAnswer: false };
    // Input-time known 3b1 teaching only; no game, storage or learning caller.
    function capture(buffer, result, context, beforeKnowledge) {
        const input = result?.input, frame = result?.interpretations?.[0];
        const understanding = result?.understandings?.[0];
        if (input?.speaker !== 'player' || !/^input:[1-9]\d*$/.test(input.id) || typeof input.raw !== 'string'
            || result.interpretations.length !== 1 || result.understandings?.length !== 1
            || frame?.kind !== 'question_demonstration' || frame.slot !== 'current_activity'
            || typeof frame.question !== 'string' || !frame.question
            || typeof frame.answer !== 'string' || !frame.answer || frame.meaning !== frame.answer
            || typeof frame.form !== 'string' || !frame.form || frame.span !== input.raw.trim()
            || !equal(frame.relations, ['question']) || context?.scene !== input.scene
            || !Array.isArray(context.attention) || context.attention.length !== 1
            || !['eat', 'rest'].includes(context.mode)
            || !(context.mode === 'eat' ? /^berry:[1-9]\d*$/.test(context.target) : context.target === 'shade')
            || context.attention[0].id !== context.target
            || !Number.isFinite(input.at) || !Number.isFinite(context.elapsed)
            || !Number.isFinite(context.activityStart) || context.elapsed < context.activityStart
            || !Array.isArray(beforeKnowledge?.meanings) || !Array.isArray(beforeKnowledge.relations)
            || understanding?.kind !== 'question_demonstration' || understanding.complete !== true
            || understanding.known?.meaning !== context.mode || !equal(understanding.unresolved, [])
            || !equal(understanding.relations, ['question']) || result.relationLearning) return false;
        const basis = beforeKnowledge.meanings.find(item => item.id === context.mode);
        const applies = entry => entry.scope?.kind === 'question' && entry.scope.locale === input.locale
            && entry.scope.speaker === input.speaker && entry.scope.slot === frame.slot && entry.scope.form === frame.form;
        const relationBasis = beforeKnowledge.relations.filter(entry => entry.id === 'question'
            && (entry.source === 'initial' || entry.source === 'experienced_relation' && applies(entry)));
        const references = relationBasis.filter(entry => entry.source === 'experienced_relation');
        if (!basis || !relationBasis.length || !equal(understanding.relationReferences || [], references)) return false;
        // The core's generic subject is retained as source understanding, not
        // interpreted as the quoted answer's speaker or an actual spoken answer.
        return buffer.retain({ occurrenceId: `known_question_example:${input.id}`, kind: 'teaching', sourceId: input.id,
            captured: { sources: { input, scene: context.scene, attention: context.attention,
                activity: { mode: context.mode, target: context.target, start: context.activityStart, at: context.elapsed },
                frame, index: 0 }, basis, relationBasis, understanding, roles } });
    }
    return Object.freeze({ capture });
});
