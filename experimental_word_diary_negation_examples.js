(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.ExperimentalWordDiaryNegationExamples = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';
    const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    // Existing 3c1 unknown-negation acceptance only; source polarity is not
    // understood polarity. No game caller, completed experience or save hook.
    function capture(buffer, result, context, beforeKnowledge) {
        const input = result?.input, frame = result?.interpretations?.[0];
        const understanding = result?.understandings?.[0], pairing = result?.relationLearning;
        const label = pairing?.candidates?.[0], adopted = pairing?.adopted;
        const roles = { reporter: 'player', contentSubject: 'self', status: 'reported', verified: false };
        const activity = frame?.polarity === 'positive' ? 'rest' : 'eat';
        if (input?.speaker !== 'player' || !/^input:[1-9]\d*$/.test(input.id)
            || result.interpretations.length !== 1 || frame?.kind !== 'negation_demonstration'
            || frame.subject !== 'self' || frame.meaning !== 'rest' || frame.aspect !== 'activity_report'
            || !['positive', 'negative'].includes(frame.polarity)
            || !equal(frame.relations, ['report', 'negation']) || !equal(frame.roles, roles)
            || !['utterance', 'form', 'reportForm'].every(key => typeof frame[key] === 'string' && frame[key])
            || frame.span !== input.raw || context?.scene !== input.scene
            || !Array.isArray(context.attention) || context.attention.length !== 1
            || context.mode !== activity || context.attention[0].id !== context.target
            || (activity === 'rest' ? context.target !== 'shade' : !/^berry:[1-9]\d*$/.test(context.target))
            || !Number.isFinite(input.at) || !Number.isFinite(context.elapsed)
            || !Number.isFinite(context.activityStart) || context.elapsed < context.activityStart
            || !Array.isArray(beforeKnowledge?.meanings) || !Array.isArray(beforeKnowledge.relations)
            || understanding?.kind !== 'partial' || understanding.complete !== false
            || understanding.known?.meaning !== 'rest' || !equal(understanding.relations, ['report'])
            || understanding.polarity !== 'unknown' || understanding.subject !== null || understanding.aspect !== null
            || understanding.eventTime !== 'unspecified' || understanding.roles !== undefined
            || understanding.reportSource !== undefined
            || !equal(understanding.unresolved, [{ type: 'relation', id: 'negation' }])
            || pairing?.candidates?.length !== 1 || pairing.updated?.length !== 0
            || pairing.relationAcquired !== false) return false;
        const basis = beforeKnowledge.meanings.find(item => item.id === 'rest');
        const observationBasis = beforeKnowledge.meanings.find(item => item.id === activity);
        const reportBasis = beforeKnowledge.relations.find(item => item.id === 'report'
            && (item.source === 'initial' || item.source === 'experienced_relation'
                && item.scope?.kind === 'report' && item.scope.meaning === 'rest'
                && item.scope.form === frame.reportForm && item.scope.locale === input.locale
                && item.scope.speaker === input.speaker && equal(item.scope.roles, roles)));
        if (!basis || !observationBasis || !reportBasis
            || !equal(understanding.relationReferences || [], reportBasis.source === 'experienced_relation' ? [reportBasis] : [])
            || !equal(label?.basis, basis) || !equal(label.observationBasis, observationBasis)
            || !equal(label.reportBasis, reportBasis) || !equal(label.understanding, understanding)
            || label.relation !== 'negation' || label.inputId !== input.id || label.raw !== input.raw
            || label.locale !== input.locale || label.speaker !== input.speaker || label.heardAt !== input.at
            || label.scene !== input.scene || label.subject !== 'self' || !equal(label.roles, roles)
            || label.meaning !== 'rest' || label.activity !== activity || label.target !== context.target
            || label.start !== context.activityStart || label.at !== context.elapsed
            || !['utterance', 'form', 'reportForm', 'polarity'].every(key => label[key] === frame[key])
            || adopted?.relation !== 'negation' || !equal(adopted.roles, roles)
            || adopted.activity !== label.activity || adopted.target !== label.target || adopted.start !== label.start
            || adopted.polarity !== label.polarity || adopted.form !== label.form
            || adopted.reportForm !== label.reportForm) return false;
        return buffer.retain({ occurrenceId: `negation_example:${input.id}`, kind: 'teaching', sourceId: input.id,
            captured: { sources: { input, scene: context.scene, attention: context.attention,
                activity: { mode: context.mode, target: context.target, start: context.activityStart, at: context.elapsed },
                frame, index: 0 }, basis, observationBasis, reportBasis, understanding, pairing } });
    }
    return Object.freeze({ capture });
});
