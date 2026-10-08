(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.ExperimentalWordDiaryTimeExamples = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';
    const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    // Existing unknown-time teaching only. References remain teaching sources,
    // never the child's understood event time or a new completed experience.
    function capture(buffer, result, context, beforeKnowledge, beforeExperiences) {
        const input = result?.input, frame = result?.interpretations?.[0];
        const understanding = result?.understandings?.[0], pairing = result?.relationLearning;
        const label = pairing?.candidates?.[0], adopted = pairing?.adopted;
        const roles = { reporter: 'player', contentSubject: 'self', status: 'reported', verified: false };
        if (input?.speaker !== 'player' || !/^input:[1-9]\d*$/.test(input.id)
            || result.interpretations.length !== 1 || result.understandings?.length !== 1
            || frame?.kind !== 'time_demonstration' || frame.subject !== 'self' || frame.meaning !== 'rest'
            || frame.aspect !== 'activity_report' || frame.polarity !== 'positive'
            || !['now', 'past'].includes(frame.time) || !equal(frame.relations, ['report', 'time'])
            || !equal(frame.roles, roles) || frame.span !== input.raw
            || !['utterance', 'form', 'reportForm'].every(key => typeof frame[key] === 'string' && frame[key])
            || context?.scene !== input.scene || context.mode !== 'rest' || context.target !== 'shade'
            || !Array.isArray(context.attention) || context.attention.length !== 1 || context.attention[0].id !== 'shade'
            || !Number.isFinite(input.at) || !Number.isFinite(context.elapsed)
            || !Number.isFinite(context.activityStart) || context.elapsed < context.activityStart
            || !Array.isArray(beforeKnowledge?.meanings) || !Array.isArray(beforeKnowledge.relations)
            || understanding?.kind !== 'partial' || understanding.complete !== false
            || understanding.known?.meaning !== 'rest' || !equal(understanding.relations, ['report'])
            || understanding.polarity !== 'positive' || understanding.eventTime !== 'unspecified'
            || understanding.subject !== null || understanding.aspect !== null || understanding.roles !== undefined
            || understanding.reportSource !== undefined || !equal(understanding.unresolved, [{ type: 'relation', id: 'time' }])
            || pairing?.candidates?.length !== 1 || pairing.updated?.length !== 0 || pairing.relationAcquired !== false) return false;
        const basis = beforeKnowledge.meanings.find(item => item.id === 'rest');
        const reportBasis = beforeKnowledge.relations.find(item => item.id === 'report'
            && (item.source === 'initial' || item.source === 'experienced_relation'
                && item.scope?.kind === 'report' && item.scope.meaning === 'rest'
                && item.scope.form === frame.reportForm && item.scope.locale === input.locale
                && item.scope.speaker === input.speaker && equal(item.scope.roles, roles)));
        const knownTime = beforeKnowledge.relations.some(item => item.id === 'time'
            && (item.source === 'initial' || item.source === 'experienced_relation'
                && item.scope?.kind === 'report' && item.scope.meaning === 'rest'
                && item.scope.form === frame.form && item.scope.locale === input.locale
                && item.scope.speaker === input.speaker && item.scope.eventTime === frame.time
                && item.scope.polarity === 'positive' && item.scope.reportForm === frame.reportForm
                && equal(item.scope.roles, roles)));
        if (!basis || !reportBasis || knownTime || !equal(understanding.relationReferences || [],
            reportBasis.source === 'experienced_relation' ? [reportBasis] : [])
            || !equal(label?.basis, basis) || !equal(label.reportBasis, reportBasis)
            || !equal(label.understanding, understanding) || label.relation !== 'time'
            || label.inputId !== input.id || label.raw !== input.raw || label.locale !== input.locale
            || label.speaker !== input.speaker || label.heardAt !== input.at || label.scene !== input.scene
            || label.subject !== 'self' || !equal(label.roles, roles) || label.meaning !== 'rest'
            || label.activity !== 'rest' || label.target !== 'shade' || label.start !== context.activityStart
            || label.at !== context.elapsed || label.eventTime !== frame.time
            || !['utterance', 'form', 'reportForm'].every(key => label[key] === frame[key])
            || adopted?.relation !== 'time' || adopted.activity !== label.activity || adopted.target !== label.target
            || adopted.start !== label.start || adopted.eventTime !== label.eventTime
            || adopted.form !== label.form || adopted.reportForm !== label.reportForm
            || adopted.locale !== input.locale || adopted.speaker !== input.speaker || adopted.scene !== input.scene
            || adopted.subject !== 'self' || adopted.meaning !== 'rest' || adopted.utterance !== frame.utterance
            || !/^input:[1-9]\d*$/.test(adopted.inputId) || Number(adopted.inputId.slice(6)) > Number(input.id.slice(6))
            || !Number.isFinite(adopted.heardAt) || !Number.isFinite(adopted.at)
            || adopted.at < label.start || adopted.at > label.at || !equal(adopted.understanding, understanding)
            || !equal(adopted.roles, roles) || !equal(adopted.basis, basis) || !equal(adopted.reportBasis, reportBasis)) return false;
        let referencedExperience = null, referenceLabel = null, referenceEvidence = null;
        if (frame.time === 'now') {
            if (!equal(label.eventReference, { experienceId: null, inputId: input.id, start: label.start, end: null })
                || !equal(adopted.eventReference, { experienceId: null, inputId: adopted.inputId, start: label.start, end: null })) return false;
        } else {
            if (!Array.isArray(beforeExperiences)) return false;
            referenceEvidence = beforeKnowledge.relationEvidence?.find(item => item.relation === 'time'
                && item.eventTime === 'now' && item.locale === input.locale && item.speaker === input.speaker);
            referencedExperience = beforeExperiences?.find(item => item.id === referenceEvidence?.experienceId);
            referenceLabel = referencedExperience?.relationLabels?.find(item => item.relation === 'time'
                && item.eventTime === 'now' && item.locale === input.locale && item.speaker === input.speaker);
            const ref = label.eventReference;
            if (!referenceEvidence || !referencedExperience || !referenceLabel
                || referencedExperience.kind !== 'experience' || referencedExperience.activity !== 'rest'
                || referencedExperience.target !== 'shade' || !Number.isFinite(referencedExperience.start)
                || !Number.isFinite(referencedExperience.end) || referencedExperience.end < referencedExperience.start
                || referencedExperience.end > label.start || referenceLabel.start !== referencedExperience.start
                || referenceLabel.inputId !== referenceEvidence.inputId || !/^input:[1-9]\d*$/.test(referenceLabel.inputId)
                || Number(referenceLabel.inputId.slice(6)) >= Number(input.id.slice(6))
                || referenceLabel.meaning !== 'rest' || referenceLabel.activity !== 'rest' || referenceLabel.target !== 'shade'
                || referenceLabel.subject !== 'self' || !Number.isFinite(referenceLabel.at)
                || referenceLabel.at < referencedExperience.start || referenceLabel.at > referencedExperience.end
                || !Number.isFinite(referenceLabel.heardAt) || typeof referenceLabel.raw !== 'string' || !referenceLabel.raw
                || typeof referenceLabel.utterance !== 'string' || !referenceLabel.utterance
                || !referenceLabel.raw.trim().endsWith(`「${referenceLabel.utterance}」`)
                || !/^【[^】]+】「/.test(referenceLabel.raw.trim())
                || referenceLabel.form !== referenceLabel.utterance.normalize('NFKC').trim().toLocaleLowerCase()
                || !equal(referenceLabel.eventReference, { experienceId: null, inputId: referenceLabel.inputId,
                    start: referencedExperience.start, end: null })
                || !equal(referenceLabel.basis, basis) || !equal(referenceLabel.reportBasis, reportBasis)
                || !equal(referenceLabel.roles, roles) || referenceLabel.understanding?.eventTime !== 'unspecified'
                || referenceLabel.understanding.complete !== false || referenceLabel.understanding.subject !== null
                || referenceLabel.understanding.roles !== undefined || referenceLabel.understanding.reportSource !== undefined
                || referenceEvidence.meaning !== 'rest' || referenceEvidence.form !== referenceLabel.form
                || referenceEvidence.reportForm !== referenceLabel.reportForm || !equal(referenceEvidence.roles, roles)
                || !equal(referenceEvidence.eventReference, referenceLabel.eventReference)
                || !equal(ref, { experienceId: referencedExperience.id, inputId: referenceLabel.inputId,
                    start: referencedExperience.start, end: referencedExperience.end })
                || !equal(adopted.eventReference, ref)) return false;
        }
        return buffer.retain({ occurrenceId: `time_example:${input.id}`, kind: 'teaching', sourceId: input.id,
            captured: { sources: { input, scene: context.scene, attention: context.attention,
                activity: { mode: context.mode, target: context.target, start: context.activityStart, at: context.elapsed },
                frame, index: 0, referencedExperience, referenceLabel, referenceEvidence },
                basis, reportBasis, understanding, pairing } });
    }
    return Object.freeze({ capture });
});
