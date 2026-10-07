(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.ExperimentalWordDiaryRelationLabels = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';
    const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    // Only the existing unknown explanation-relation entry, at acceptance.
    // Input-time copies are supplied independently; no game or save caller.
    function capture(buffer, result, context, beforeKnowledge) {
        const input = result?.input, frame = result?.interpretations?.[0];
        const understanding = result?.understandings?.[0], pairing = result?.relationLearning;
        const label = pairing?.candidates?.[0], adopted = pairing?.adopted;
        if (input?.speaker !== 'player' || !/^input:[1-9]\d*$/.test(input.id)
            || result.interpretations.length !== 1 || frame?.kind !== 'word_explanation'
            || context?.scene !== input.scene || !Array.isArray(context.attention) || context.attention.length !== 1
            || !['eat', 'rest'].includes(context.mode)
            || !(context.mode === 'eat' ? /^berry:[1-9]\d*$/.test(context.target) : context.target === 'shade')
            || context.attention[0].id !== context.target
            || !Number.isFinite(input.at) || !Number.isFinite(context.elapsed)
            || !Number.isFinite(context.activityStart) || context.elapsed < context.activityStart
            || !Array.isArray(beforeKnowledge?.meanings)
            || understanding?.kind !== 'partial' || understanding.complete !== false
            || understanding.known?.meaning !== context.mode
            || !equal(understanding.unresolved, [{ type: 'relation', id: 'naming' }])
            || pairing?.candidates?.length !== 1 || pairing.updated?.length !== 0
            || pairing.relationAcquired !== false) return false;
        const basis = beforeKnowledge.meanings.find(item => item.id === context.mode);
        if (!basis || !equal(label?.basis, basis) || !equal(label?.understanding, understanding)
            || label.relation !== 'naming' || label.inputId !== input.id || label.raw !== input.raw
            || label.locale !== input.locale || label.speaker !== input.speaker
            || label.heardAt !== input.at || label.scene !== input.scene || label.subject !== 'self'
            || label.word !== frame.word || label.meaning !== context.mode
            || label.activity !== context.mode || label.target !== context.target
            || label.start !== context.activityStart || label.at !== context.elapsed
            || adopted?.relation !== 'naming' || adopted.activity !== label.activity
            || adopted.target !== label.target || adopted.start !== label.start) return false;
        // candidates[0] belongs to this input; adopted may be the first input
        // retained for learning. Do not reuse that older input as today's source.
        return buffer.retain({ occurrenceId: `relation_label:${input.id}`, kind: 'teaching', sourceId: input.id,
            captured: { sources: { input, scene: context.scene, attention: context.attention,
                activity: { mode: context.mode, target: context.target, start: context.activityStart, at: context.elapsed },
                frame, index: 0 }, basis, understanding, pairing } });
    }
    return Object.freeze({ capture });
});
