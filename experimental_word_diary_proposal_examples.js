(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.ExperimentalWordDiaryProposalExamples = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';
    const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    // Existing 3b2 acceptance only. Proposed roles are source material,
    // never understood roles, compliance or actual shared rest. No game caller.
    function capture(buffer, result, context, beforeKnowledge) {
        const input = result?.input, frame = result?.interpretations?.[0];
        const understanding = result?.understandings?.[0], pairing = result?.relationLearning;
        const label = pairing?.candidates?.[0], adopted = pairing?.adopted;
        const relation = frame?.proposalKind;
        const roles = { proposer: 'player', addressee: 'self',
            actors: relation === 'request' ? ['self'] : ['player', 'self'],
            status: 'proposed', actualParticipation: false };
        if (input?.speaker !== 'player' || !/^input:[1-9]\d*$/.test(input.id)
            || result.interpretations.length !== 1 || frame?.kind !== 'proposal_demonstration'
            || !['request', 'invitation'].includes(relation) || frame.meaning !== 'rest'
            || !equal(frame.relations, [relation]) || !equal(frame.roles, roles)
            || typeof frame.utterance !== 'string' || !frame.utterance
            || typeof frame.form !== 'string' || !frame.form
            || context?.scene !== input.scene || !Array.isArray(context.attention) || context.attention.length !== 1
            || context.mode !== 'rest' || context.target !== 'shade' || context.attention[0].id !== 'shade'
            || !Number.isFinite(input.at) || !Number.isFinite(context.elapsed)
            || !Number.isFinite(context.activityStart) || context.elapsed < context.activityStart
            || !Array.isArray(beforeKnowledge?.meanings)
            || understanding?.kind !== 'partial' || understanding.complete !== false
            || understanding.known?.meaning !== 'rest'
            || !equal(understanding.unresolved, [{ type: 'relation', id: relation }])
            || pairing?.candidates?.length !== 1 || pairing.updated?.length !== 0
            || pairing.relationAcquired !== false) return false;
        const basis = beforeKnowledge.meanings.find(item => item.id === 'rest');
        if (!basis || !equal(label?.basis, basis) || !equal(label?.understanding, understanding)
            || label.relation !== relation || label.inputId !== input.id || label.raw !== input.raw
            || label.locale !== input.locale || label.speaker !== input.speaker
            || label.heardAt !== input.at || label.scene !== input.scene || label.subject !== 'self'
            || label.utterance !== frame.utterance || label.form !== frame.form || !equal(label.roles, roles)
            || label.meaning !== 'rest' || label.activity !== 'rest' || label.target !== 'shade'
            || label.start !== context.activityStart || label.at !== context.elapsed
            || adopted?.relation !== relation || !equal(adopted.roles, roles)
            || adopted.activity !== label.activity || adopted.target !== label.target || adopted.start !== label.start) return false;
        // Retain the current input even when learning keeps only its first label.
        // The current marker remains in raw/span; its future replacement is separate.
        return buffer.retain({ occurrenceId: `proposal_example:${input.id}`, kind: 'teaching', sourceId: input.id,
            captured: { sources: { input, scene: context.scene, attention: context.attention,
                activity: { mode: context.mode, target: context.target, start: context.activityStart, at: context.elapsed },
                frame, index: 0 }, basis, understanding, pairing } });
    }
    return Object.freeze({ capture });
});
