(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.ExperimentalWordDiaryQuestionExamples = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';
    const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    const roles = { questioner: 'player', answerer: 'self', demonstrator: 'player', actualAnswer: false };
    // Existing 3b1 acceptance only. The quoted answer is a teaching example,
    // never an answer spoken by the child. No game or storage caller.
    function capture(buffer, result, context, beforeKnowledge) {
        const input = result?.input, frame = result?.interpretations?.[0];
        const understanding = result?.understandings?.[0], pairing = result?.relationLearning;
        const label = pairing?.candidates?.[0], adopted = pairing?.adopted;
        if (input?.speaker !== 'player' || !/^input:[1-9]\d*$/.test(input.id)
            || result.interpretations.length !== 1 || frame?.kind !== 'question_demonstration'
            || frame.slot !== 'current_activity' || typeof frame.question !== 'string' || !frame.question
            || typeof frame.answer !== 'string' || !frame.answer || typeof frame.form !== 'string' || !frame.form
            || context?.scene !== input.scene || !Array.isArray(context.attention) || context.attention.length !== 1
            || !['eat', 'rest'].includes(context.mode)
            || !(context.mode === 'eat' ? /^berry:[1-9]\d*$/.test(context.target) : context.target === 'shade')
            || context.attention[0].id !== context.target
            || !Number.isFinite(input.at) || !Number.isFinite(context.elapsed)
            || !Number.isFinite(context.activityStart) || context.elapsed < context.activityStart
            || !Array.isArray(beforeKnowledge?.meanings)
            || understanding?.kind !== 'partial' || understanding.complete !== false
            || understanding.known?.meaning !== context.mode
            || !equal(understanding.unresolved, [{ type: 'relation', id: 'question' }])
            || pairing?.candidates?.length !== 1 || pairing.updated?.length !== 0
            || pairing.relationAcquired !== false) return false;
        const basis = beforeKnowledge.meanings.find(item => item.id === context.mode);
        if (!basis || !equal(label?.basis, basis) || !equal(label?.understanding, understanding)
            || label.relation !== 'question' || label.inputId !== input.id || label.raw !== input.raw
            || label.locale !== input.locale || label.speaker !== input.speaker
            || label.heardAt !== input.at || label.scene !== input.scene || label.subject !== 'self'
            || label.question !== frame.question || label.answer !== frame.answer || label.form !== frame.form
            || label.slot !== frame.slot || !equal(label.roles, roles) || label.meaning !== context.mode
            || label.activity !== context.mode || label.target !== context.target
            || label.start !== context.activityStart || label.at !== context.elapsed
            || adopted?.relation !== 'question' || !equal(adopted.roles, roles)
            || adopted.activity !== label.activity || adopted.target !== label.target || adopted.start !== label.start) return false;
        // Current candidates belong to this input. First-only adoption is a
        // learning policy, not the source or answer of a later teaching input.
        return buffer.retain({ occurrenceId: `question_example:${input.id}`, kind: 'teaching', sourceId: input.id,
            captured: { sources: { input, scene: context.scene, attention: context.attention,
                activity: { mode: context.mode, target: context.target, start: context.activityStart, at: context.elapsed },
                frame, index: 0 }, basis, understanding, pairing } });
    }
    return Object.freeze({ capture });
});
