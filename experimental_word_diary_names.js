(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.ExperimentalWordDiaryNames = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';
    // Supply the actual receive result and the attention/scene snapshot from
    // that input. This isolated contract is not a save schema or a game caller.
    // Naming understanding is separate from adding an association's evidence.
    function capture(buffer, result, context) {
        if (!result?.input || context?.scene !== result.input.scene
            || !Array.isArray(context?.attention)) return false;
        const matches = (result.interpretations || []).flatMap((frame, index) => {
            const understanding = result.understandings?.[index];
            const learning = result.learning?.[index];
            const adopted = learning?.adopted;
            const target = understanding?.target?.adopted?.id;
            if (frame.kind !== 'naming' || understanding?.kind !== 'naming'
                || !understanding.complete || !target
                || !context.attention.some(item => item.id === target)
                || learning?.candidates?.length !== 1 || !Array.isArray(learning.updated)
                || adopted?.source !== 'explanation' || adopted.word !== frame.word
                || adopted.target !== target || adopted.speaker !== result.input.speaker
                || learning.candidates[0].source !== 'explanation'
                || learning.candidates[0].word !== adopted.word
                || learning.candidates[0].target !== target
                || learning.candidates[0].speaker !== adopted.speaker) return [];
            return [{ frame, index, understanding, learning }];
        });
        // One individual correspondence; never claim whole-input comprehension
        // from parsing other clauses or select among competing naming clauses.
        if (matches.length !== 1) return false;
        const { frame, index, understanding, learning } = matches[0];
        return buffer.retain({ occurrenceId: `naming:${result.input.id}`, kind: 'teaching',
            sourceId: result.input.id, captured: {
                sources: { input: result.input, scene: context.scene,
                    attention: context.attention, frame, index },
                understanding, association: learning
            } });
    }
    return Object.freeze({ capture });
});
