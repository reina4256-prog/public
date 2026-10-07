(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.ExperimentalWordDiaryDefinitions = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';
    // Actual receive result, input-time context and pre-receive knowledge only.
    // This independent contract does not define a save schema or game caller.
    function capture(buffer, result, context, beforeKnowledge) {
        if (!result?.input || context?.scene !== result.input.scene
            || !Array.isArray(context?.attention) || result.interpretations?.length !== 1) return false;
        const frame = result.interpretations[0], understanding = result.understandings?.[0];
        const learning = result.learning?.[0], adopted = learning?.adopted;
        const basis = beforeKnowledge?.meanings?.find(item => item.id === understanding?.known?.meaning);
        const scope = { scene: context.scene, targets: context.attention.map(item => item.id) };
        if (frame.kind !== 'word_explanation' || understanding?.kind !== 'word_explanation'
            || !understanding.complete || !basis || !Array.isArray(learning?.updated)
            || learning.candidates?.length !== 1 || adopted?.word !== frame.word
            || adopted.meaning !== basis.id || adopted.status !== 'tentative'
            || JSON.stringify(adopted.scope) !== JSON.stringify(scope)
            || learning.candidates[0].word !== frame.word || learning.candidates[0].meaning !== basis.id
            || JSON.stringify(learning.candidates[0].scope) !== JSON.stringify(scope)) return false;
        // New input may repeat an explanation without adding knowledge evidence.
        // Do not turn its known meaning basis into a new personal experience.
        return buffer.retain({ occurrenceId: `definition:${result.input.id}`, kind: 'teaching',
            sourceId: result.input.id, captured: {
                sources: { input: result.input, scene: context.scene,
                    attention: context.attention, frame, index: 0 },
                basis, understanding, explanation: learning
            } });
    }
    return Object.freeze({ capture });
});
