(function (root, factory) {
    const api = factory(typeof module === 'object' && module.exports
        ? require('./experimental_word_learning_catalog.json') : root.ExperimentalWordDiarySequenceCatalog);
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.ExperimentalWordDiarySequenceExamples = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (catalog) {
    'use strict';
    const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    const roles = { proposer: 'player', addressee: 'self', actors: ['self'], status: 'proposed', actualParticipation: false };
    const serial = id => /^input:[1-9]\d*$/.test(id) ? Number(id.slice(6)) : NaN;
    function partial(u) {
        return u?.kind === 'partial' && u.complete === false && equal(u.known, { meaning: 'rest', eventMeaning: 'eat' })
            && equal(u.relations, ['request']) && equal(u.unresolved, [{ type: 'relation', id: 'sequence' }])
            && u.subject === null && u.aspect === null && u.target === null && u.questionSlot === null
            && u.roles === undefined && u.conditionStatus === null
            && u.polarity === 'positive' && u.eventTime === 'unspecified' && u.reportSource === undefined;
    }
    function validBasis(basis, id, start, knowledge, experiences) {
        const current = knowledge.meanings.find(m => m.id === id);
        return current?.id === id && basis?.id === id && current.source === basis.source
            && (basis.source === 'initial' ? equal(basis, current) : basis.source === 'experienced_life'
                && Array.isArray(basis.evidence) && basis.evidence.length > 0 && basis.evidence.every(e =>
                    current.evidence?.some(item => equal(item, e))
                    && experiences.some(event => event.id === e.experienceId && event.kind === 'experience'
                        && event.activity === id && Number.isFinite(event.start) && Number.isFinite(event.end)
                        && event.end >= event.start && event.end <= start)));
    }
    function validLabel(label, frame, input, knowledge, experiences) {
        const request = knowledge.relations.find(r => r.id === 'request' && (r.source === 'initial'
            || r.source === 'experienced_relation' && r.scope?.kind === 'request' && r.scope.meaning === 'rest'
                && r.scope.form === frame.proposalForm && r.scope.locale === input.locale
                && r.scope.speaker === input.speaker && equal(r.scope.roles, roles)));
        return label?.relation === 'sequence' && Number.isFinite(serial(label.inputId))
            && serial(label.inputId) <= serial(input.id) && label.locale === input.locale && label.speaker === input.speaker
            && typeof label.scene === 'string' && Number.isFinite(label.heardAt) && Number.isFinite(label.at)
            && Number.isFinite(label.start) && label.at >= label.start && label.activity === 'eat'
            && /^berry:\d+$/.test(label.target) && label.subject === 'self' && partial(label.understanding)
            && equal(label.roles, roles) && ['meaning', 'eventMeaning', 'eventSubject', 'application', 'form', 'utterance', 'proposalForm']
                .every(key => label[key] === frame[key])
            && ['before', 'after'].includes(label.phase)
            && typeof label.raw === 'string'
            && label.raw.trim() === `${catalog?.sequenceTeaching?.[input.locale]?.[label.phase]}「${frame.utterance}」`
            && validBasis(label.basis, 'rest', label.start, knowledge, experiences)
            && validBasis(label.eventBasis, 'eat', label.start, knowledge, experiences)
            && request && equal(label.proposalBasis, request)
            && (request.source === 'initial' || request.evidence?.length > 0 && request.evidence.every(id =>
                experiences.some(e => e.end <= label.start && e.relationLabels?.some(l => l.inputId === id))))
            && equal(label.understanding.relationReferences || [], request.source === 'experienced_relation' ? [request] : []);
    }
    // Copy the existing accepted teaching. Completion references the original
    // meal; it never replaces the then-unknown connection with learned knowledge.
    function capture(buffer, result, context, beforeKnowledge, beforeExperiences) {
        const input = result?.input, frame = result?.interpretations?.[0], u = result?.understandings?.[0];
        const pairing = result?.relationLearning, label = pairing?.candidates?.[0], adopted = pairing?.adopted;
        if (input?.speaker !== 'player' || !Number.isFinite(serial(input.id)) || !Number.isFinite(input.at)
            || result.interpretations?.length !== 1 || result.understandings?.length !== 1
            || frame?.kind !== 'sequence_demonstration' || !['before', 'after'].includes(frame.phase)
            || frame.subject !== 'self' || frame.meaning !== 'rest' || frame.eventMeaning !== 'eat'
            || frame.eventSubject !== 'self' || frame.application !== 'after_completion' || frame.proposalKind !== 'request'
            || !equal(frame.relations, ['request', 'sequence']) || !equal(frame.roles, roles) || frame.span !== input.raw
            || !['utterance', 'form', 'proposalForm'].every(key => typeof frame[key] === 'string' && frame[key])
            || frame.utterance !== catalog?.sequenceTeaching?.[input.locale]?.utterance
            || frame.proposalForm !== catalog?.proposalTeaching?.[input.locale]?.request?.utterance.normalize('NFKC').trim().toLocaleLowerCase()
            || frame.form !== frame.utterance.normalize('NFKC').trim().toLocaleLowerCase()
            || !partial(u) || result.conditionJudgment !== undefined || context?.scene !== input.scene
            || typeof context.mode !== 'string' || !context.mode
            || !(context.target === null || typeof context.target === 'string')
            || !Array.isArray(context.attention) || !Number.isFinite(context.elapsed)
            || !Number.isFinite(context.activityStart) || context.elapsed < context.activityStart
            || !Array.isArray(beforeKnowledge?.meanings) || !Array.isArray(beforeKnowledge.relations)
            || !Array.isArray(beforeExperiences) || pairing?.candidates?.length !== 1
            || beforeKnowledge.relations.some(r => r.id === 'sequence' && (r.source === 'initial'
                || r.source === 'experienced_relation' && r.scope?.kind === 'sequential_proposal'
                    && r.scope.locale === input.locale && r.scope.speaker === input.speaker
                    && r.scope.form === frame.form && r.scope.proposalForm === frame.proposalForm
                    && r.scope.meaning === 'rest' && r.scope.eventMeaning === 'eat'
                    && r.scope.eventSubject === 'self' && r.scope.application === 'after_completion'
                    && equal(r.scope.roles, roles)))
            || !Array.isArray(pairing.updated) || typeof pairing.relationAcquired !== 'boolean'
            || !validLabel(label, frame, input, beforeKnowledge, beforeExperiences)
            || !validLabel(adopted, frame, input, beforeKnowledge, beforeExperiences)
            || label.inputId !== input.id || label.raw !== input.raw || label.heardAt !== input.at
            || label.scene !== input.scene || label.at !== context.elapsed || label.phase !== frame.phase
            || !equal(label.understanding, u)) return false;
        let referencedExperience = null, referenceLabel = null;
        if (frame.phase === 'before') {
            if (context.mode !== 'eat' || context.target !== label.target || context.activityStart !== label.start
                || !Number.isFinite(context.dwell) || context.dwell <= 0
                || context.attention.length !== 1 || context.attention[0].id !== label.target
                || !Array.isArray(context.relationLabels) || pairing.updated.length !== 0 || pairing.relationAcquired
                || !equal(label.basis, beforeKnowledge.meanings.find(m => m.id === 'rest'))
                || !equal(label.eventBasis, beforeKnowledge.meanings.find(m => m.id === 'eat'))
                || adopted.phase !== 'before' || adopted.start !== label.start || adopted.target !== label.target
                || adopted.scene !== label.scene || adopted.at > label.at
                || !equal(adopted.basis, label.basis) || !equal(adopted.eventBasis, label.eventBasis)
                || !equal(label.eventReference, { experienceId: null, inputId: input.id, start: label.start, end: null })
                || !equal(adopted.eventReference, { experienceId: null, inputId: adopted.inputId, start: label.start, end: null })) return false;
            const first = context.relationLabels.find(l => l.relation === 'sequence');
            if (!equal(adopted, first || label)) return false;
        } else {
            referencedExperience = beforeExperiences.filter(e => e.activity === 'eat').at(-1);
            referenceLabel = referencedExperience?.relationLabels?.find(l => l.relation === 'sequence' && l.phase === 'before'
                && l.locale === input.locale && l.speaker === input.speaker && l.form === frame.form);
            if (context.mode === 'eat' || !Number.isInteger(context.harvest) || context.harvest < 1
                || !referencedExperience || referencedExperience.kind !== 'experience'
                || referencedExperience.target !== `berry:${context.harvest}` || referencedExperience.target !== label.target
                || !Number.isFinite(referencedExperience.start) || !Number.isFinite(referencedExperience.end)
                || referencedExperience.end <= referencedExperience.start || referencedExperience.end > label.at
                || referencedExperience.relationLabels.some(l => l.relation === 'sequence' && l.phase === 'after')
                || !validLabel(referenceLabel, frame, input, beforeKnowledge, beforeExperiences)
                || referenceLabel.start !== referencedExperience.start || label.start !== referencedExperience.start
                || referenceLabel.target !== referencedExperience.target || referenceLabel.at >= referencedExperience.end
                || serial(referenceLabel.inputId) >= serial(input.id)
                || !equal(referenceLabel.eventReference, { experienceId: null, inputId: referenceLabel.inputId,
                    start: referencedExperience.start, end: null })
                || !equal(label.eventReference, { experienceId: referencedExperience.id, inputId: referenceLabel.inputId,
                    start: referencedExperience.start, end: referencedExperience.end })
                || !['basis', 'eventBasis', 'proposalBasis'].every(key => equal(label[key], referenceLabel[key]))
                || !equal(adopted, label) || !equal(pairing.updated, [{ relation: 'sequence', experienceId: referencedExperience.id,
                    inputId: input.id, locale: input.locale, speaker: input.speaker, form: frame.form, roles,
                    proposalForm: frame.proposalForm, phase: 'after', eventReference: label.eventReference,
                    eventMeaning: 'eat', eventSubject: 'self', application: 'after_completion', meaning: 'rest' }])
                || pairing.relationAcquired !== true) return false;
        }
        return buffer.retain({ occurrenceId: `sequence_example:${input.id}`, kind: 'teaching', sourceId: input.id,
            captured: { sources: { input, frame, index: 0, scene: context.scene, attention: context.attention,
                activity: { mode: context.mode, target: context.target, start: context.activityStart, at: context.elapsed },
                referencedExperience, referenceLabel }, basis: label.basis, eventBasis: label.eventBasis,
                proposalBasis: label.proposalBasis, understanding: u, pairing } });
    }
    return Object.freeze({ capture });
});
