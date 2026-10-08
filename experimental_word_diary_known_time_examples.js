(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.ExperimentalWordDiaryKnownTimeExamples = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';
    const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    const inputId = value => /^input:[1-9]\d*$/.test(value);
    // Known 3c2 teaching, copied at input time. No game or storage caller.
    function capture(buffer, result, context, beforeKnowledge, beforeExperiences) {
        const input = result?.input, frame = result?.interpretations?.[0];
        const understanding = result?.understandings?.[0];
        const roles = { reporter: 'player', contentSubject: 'self', status: 'reported', verified: false };
        if (input?.speaker !== 'player' || !inputId(input.id) || typeof input.raw !== 'string'
            || result.interpretations.length !== 1 || result.understandings?.length !== 1
            || frame?.kind !== 'time_demonstration' || frame.subject !== 'self' || frame.meaning !== 'rest'
            || frame.aspect !== 'activity_report' || frame.polarity !== 'positive'
            || !['now', 'past'].includes(frame.time) || !equal(frame.relations, ['report', 'time'])
            || !equal(frame.roles, roles) || frame.span !== input.raw
            || !['utterance', 'form', 'reportForm'].every(key => typeof frame[key] === 'string' && frame[key])
            || !/^【[^】]+】「/.test(input.raw.trim()) || !input.raw.trim().endsWith(`「${frame.utterance}」`)
            || frame.form !== frame.utterance.normalize('NFKC').trim().toLocaleLowerCase()
            || context?.scene !== input.scene || context.mode !== 'rest' || context.target !== 'shade'
            || !Array.isArray(context.attention) || context.attention.length !== 1 || context.attention[0].id !== 'shade'
            || !Number.isFinite(input.at) || !Number.isFinite(context.elapsed)
            || !Number.isFinite(context.activityStart) || context.elapsed < context.activityStart
            || !Array.isArray(beforeKnowledge?.meanings) || !Array.isArray(beforeKnowledge.relations)
            || understanding?.kind !== 'time_demonstration' || understanding.complete !== true
            || understanding.known?.meaning !== 'rest' || !equal(understanding.unresolved, [])
            || !equal(understanding.relations, ['report', 'time']) || understanding.subject !== 'self'
            || understanding.aspect !== 'activity_report' || understanding.polarity !== 'positive'
            || understanding.eventTime !== frame.time || !equal(understanding.roles, roles)
            || understanding.reportSource !== undefined || result.relationLearning) return false;
        const basis = beforeKnowledge.meanings.find(item => item.id === 'rest');
        const applies = entry => entry.scope?.kind === 'report' && entry.scope.meaning === 'rest'
            && entry.scope.locale === input.locale && entry.scope.speaker === input.speaker
            && equal(entry.scope.roles, roles) && (entry.id === 'report'
                ? entry.scope.form === frame.reportForm
                : entry.scope.form === frame.form && entry.scope.eventTime === frame.time
                    && entry.scope.polarity === 'positive' && entry.scope.reportForm === frame.reportForm);
        const relationBasis = beforeKnowledge.relations.filter(entry => ['report', 'time'].includes(entry.id)
            && (entry.source === 'initial' || entry.source === 'experienced_relation' && applies(entry)));
        if (!basis || !['report', 'time'].every(id => relationBasis.some(entry => entry.id === id))
            || !equal(understanding.relationReferences || [], relationBasis.filter(entry => entry.source === 'experienced_relation'))) return false;
        let referencedExperience = null, referenceLabel = null, referenceEvidence = null, eventReference = null;
        // Missing original sources leave the concrete past rest unidentified.
        // Present but inconsistent sources fail closed, never become "missing".
        if (frame.time === 'past') {
            if (!Array.isArray(beforeKnowledge.relationEvidence) || !Array.isArray(beforeExperiences)) return false;
            referenceEvidence = beforeKnowledge.relationEvidence.find(item => item.relation === 'time'
                && item.eventTime === 'now' && item.locale === input.locale && item.speaker === input.speaker) || null;
            if (referenceEvidence) {
                referencedExperience = beforeExperiences.find(item => item.id === referenceEvidence.experienceId);
                referenceLabel = referencedExperience?.relationLabels?.find(item => item.relation === 'time'
                    && item.eventTime === 'now' && item.locale === input.locale && item.speaker === input.speaker);
                if (!referencedExperience || !referenceLabel || referencedExperience.kind !== 'experience'
                    || referencedExperience.activity !== 'rest' || referencedExperience.target !== 'shade'
                    || !Number.isFinite(referencedExperience.start) || !Number.isFinite(referencedExperience.end)
                    || referencedExperience.end < referencedExperience.start || referencedExperience.end > context.activityStart
                    || referenceLabel.start !== referencedExperience.start || !inputId(referenceLabel.inputId)
                    || Number(referenceLabel.inputId.slice(6)) >= Number(input.id.slice(6))
                    || referenceLabel.meaning !== 'rest' || referenceLabel.activity !== 'rest' || referenceLabel.target !== 'shade'
                    || referenceLabel.subject !== 'self' || !equal(referenceLabel.roles, roles)
                    || !Number.isFinite(referenceLabel.at) || referenceLabel.at < referencedExperience.start
                    || referenceLabel.at > referencedExperience.end || !Number.isFinite(referenceLabel.heardAt)
                    || typeof referenceLabel.raw !== 'string' || typeof referenceLabel.utterance !== 'string' || !referenceLabel.utterance
                    || !/^【[^】]+】「/.test(referenceLabel.raw.trim())
                    || !referenceLabel.raw.trim().endsWith(`「${referenceLabel.utterance}」`)
                    || referenceLabel.form !== referenceLabel.utterance.normalize('NFKC').trim().toLocaleLowerCase()
                    || referenceLabel.reportForm !== frame.reportForm
                    || !equal(referenceLabel.eventReference, { experienceId: null, inputId: referenceLabel.inputId,
                        start: referencedExperience.start, end: null })
                    || !equal(referenceLabel.basis, basis)
                    || !relationBasis.some(item => item.id === 'report' && equal(item, referenceLabel.reportBasis))
                    || referenceLabel.understanding?.kind !== 'partial' || referenceLabel.understanding.complete !== false
                    || referenceLabel.understanding.known?.meaning !== 'rest'
                    || referenceLabel.understanding.eventTime !== 'unspecified' || referenceLabel.understanding.polarity !== 'positive'
                    || referenceLabel.understanding.subject !== null || referenceLabel.understanding.aspect !== null
                    || referenceLabel.understanding.roles !== undefined || referenceLabel.understanding.reportSource !== undefined
                    || !equal(referenceLabel.understanding.relations, ['report'])
                    || !equal(referenceLabel.understanding.unresolved, [{ type: 'relation', id: 'time' }])
                    || !equal(referenceLabel.understanding.relationReferences || [], referenceLabel.reportBasis?.source === 'experienced_relation'
                        ? [referenceLabel.reportBasis] : [])
                    || !equal(referenceEvidence, { relation: 'time', experienceId: referencedExperience.id, inputId: referenceLabel.inputId,
                        locale: input.locale, speaker: input.speaker, form: referenceLabel.form, roles,
                        eventTime: 'now', reportForm: referenceLabel.reportForm, eventReference: referenceLabel.eventReference, meaning: 'rest' })) return false;
                eventReference = { experienceId: referencedExperience.id, inputId: referenceLabel.inputId,
                    start: referencedExperience.start, end: referencedExperience.end };
            }
        }
        // Relative-time comprehension is distinct from identifying a concrete
        // event, child speech, self-observation or verification of testimony.
        return buffer.retain({ occurrenceId: `known_time_example:${input.id}`, kind: 'teaching', sourceId: input.id,
            captured: { sources: { input, scene: context.scene, attention: context.attention,
                activity: { mode: context.mode, target: context.target, start: context.activityStart, at: context.elapsed },
                frame, index: 0, referencedExperience, referenceLabel, referenceEvidence },
                basis, relationBasis, understanding, roles,
                pastReference: { status: frame.time === 'now' ? 'not_applicable' : eventReference ? 'source_matched' : 'unidentified',
                    eventReference } } });
    }
    return Object.freeze({ capture });
});
