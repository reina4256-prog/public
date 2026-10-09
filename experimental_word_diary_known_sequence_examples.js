(function (root, factory) {
    const api = factory(typeof module === 'object' && module.exports
        ? require('./experimental_word_learning_catalog.json') : root.ExperimentalWordDiaryKnownSequenceCatalog);
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.ExperimentalWordDiaryKnownSequenceExamples = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (catalog) {
    'use strict';
    const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    const roles = { proposer: 'player', addressee: 'self', actors: ['self'], status: 'proposed', actualParticipation: false };
    const serial = id => /^input:[1-9]\d*$/.test(id) ? Number(id.slice(6)) : NaN;
    const normalize = text => text.normalize('NFKC').trim().toLocaleLowerCase();
    function applies(entry, frame, input) {
        const scope = entry.scope;
        return scope?.locale === input.locale && scope.speaker === input.speaker && scope.meaning === 'rest'
            && equal(scope.roles, roles) && (entry.id === 'request'
                ? scope.kind === 'request' && scope.form === frame.proposalForm
                : scope.kind === 'sequential_proposal' && ['form', 'proposalForm', 'eventMeaning', 'eventSubject', 'application']
                    .every(key => scope[key] === frame[key]));
    }
    function basisValid(basis, id, at, knowledge, experiences) {
        const current = knowledge.meanings.find(item => item.id === id);
        return basis?.id === id && current?.source === basis.source && (basis.source === 'initial'
            ? equal(basis, current) : basis.source === 'experienced_life' && Array.isArray(basis.evidence)
                && basis.evidence.length > 0 && basis.evidence.every(evidence =>
                    current.evidence?.some(item => equal(item, evidence)) && experiences.some(event =>
                        event.id === evidence.experienceId && event.kind === 'experience' && event.activity === id
                        && Number.isFinite(event.start) && Number.isFinite(event.end)
                        && event.end >= event.start && event.end <= at)));
    }
    function originalValid(label, event, frame, input, knowledge, experiences) {
        const u = label?.understanding, request = label?.proposalBasis;
        return label?.relation === 'sequence' && label.phase === 'before' && label.activity === 'eat'
            && label.subject === 'self' && label.target === event.target && label.start === event.start
            && Number.isFinite(serial(label.inputId)) && serial(label.inputId) < serial(input.id)
            && typeof label.scene === 'string' && Number.isFinite(label.heardAt) && label.heardAt <= input.at
            && Number.isFinite(label.at) && label.at >= event.start && label.at < event.end
            && label.locale === input.locale && label.speaker === input.speaker && equal(label.roles, roles)
            && ['form', 'utterance', 'proposalForm', 'meaning', 'eventMeaning', 'eventSubject', 'application']
                .every(key => label[key] === frame[key])
            && typeof label.raw === 'string'
            && label.raw.trim() === `${catalog.sequenceTeaching[input.locale].before}「${frame.utterance}」`
            && equal(label.eventReference, { experienceId: null, inputId: label.inputId, start: event.start, end: null })
            && basisValid(label.basis, 'rest', label.start, knowledge, experiences)
            && basisValid(label.eventBasis, 'eat', label.start, knowledge, experiences)
            && request?.id === 'request' && knowledge.relations.some(item => equal(item, request))
            && (request.source === 'initial' || request.source === 'experienced_relation' && applies(request, frame, input)
                && Array.isArray(request.evidence) && request.evidence.length > 0 && request.evidence.every(id =>
                    experiences.some(e => Number.isFinite(e.end) && e.end <= label.start
                        && e.relationLabels?.some(l => l.inputId === id))))
            && u?.kind === 'partial' && u.complete === false && equal(u.known, { meaning: 'rest', eventMeaning: 'eat' })
            && equal(u.relations, ['request']) && equal(u.unresolved, [{ type: 'relation', id: 'sequence' }])
            && u.subject === null && u.target === null && u.aspect === null && u.questionSlot === null
            && u.conditionStatus === null && u.roles === undefined && u.reportSource === undefined
            && u.polarity === 'positive' && u.eventTime === 'unspecified'
            && equal(u.relationReferences || [], request.source === 'experienced_relation' ? [request] : []);
    }
    function relationValid(entry, input, at, knowledge, experiences) {
        if (entry.source === 'initial') return true;
        return Array.isArray(entry.evidence) && entry.evidence.length === 2 && new Set(entry.evidence).size === 2
            && Array.isArray(knowledge.relationEvidence) && entry.evidence.every(id => {
                if (!Number.isFinite(serial(id)) || serial(id) >= serial(input.id)) return false;
                const evidence = knowledge.relationEvidence.find(e => e.inputId === id);
                const event = experiences.find(e => e.id === evidence?.experienceId);
                const label = event?.relationLabels?.find(l => l.inputId === id);
                return event?.kind === 'experience' && Number.isFinite(event.start) && Number.isFinite(event.end)
                    && event.end > event.start && event.end <= at && label
                    && Number.isFinite(label.heardAt) && label.heardAt <= input.at
                    && Number.isFinite(label.at) && label.at >= event.start && label.at <= at
                    && label.start === event.start && label.target === event.target && label.activity === event.activity
                    && label.locale === entry.scope.locale && label.speaker === entry.scope.speaker
                    && ['relation', 'locale', 'speaker', 'form', 'meaning'].every(key => evidence[key] === label[key])
                    && equal(evidence.roles, label.roles)
                    && (entry.id !== 'sequence' || label.relation === 'sequence'
                        && ['phase', 'proposalForm', 'eventMeaning', 'eventSubject', 'application'].every(key => evidence[key] === label[key])
                        && label.form === entry.scope.form && equal(evidence.eventReference, label.eventReference));
            });
    }
    // Known teaching only. The concrete meal reference is source material,
    // separate from comprehension and from the then-unknown original teaching.
    function capture(buffer, result, context, beforeKnowledge, beforeExperiences) {
        const input = result?.input, frame = result?.interpretations?.[0], u = result?.understandings?.[0];
        const item = catalog?.sequenceTeaching?.[input?.locale];
        const proposal = catalog?.proposalTeaching?.[input?.locale]?.request;
        if (input?.speaker !== 'player' || !Number.isFinite(serial(input.id)) || typeof input.raw !== 'string'
            || !Number.isFinite(input.at) || result.interpretations?.length !== 1 || result.understandings?.length !== 1
            || !item || !proposal || frame?.kind !== 'sequence_demonstration' || !['before', 'after'].includes(frame.phase)
            || frame.subject !== 'self' || frame.meaning !== 'rest' || frame.eventMeaning !== 'eat'
            || frame.eventSubject !== 'self' || frame.application !== 'after_completion' || frame.proposalKind !== 'request'
            || !equal(frame.relations, ['request', 'sequence']) || !equal(frame.roles, roles) || frame.span !== input.raw
            || frame.utterance !== item.utterance || frame.form !== normalize(item.utterance)
            || frame.proposalForm !== normalize(proposal.utterance)
            || input.raw.trim() !== `${item[frame.phase]}「${item.utterance}」`
            || context?.scene !== input.scene || typeof context.mode !== 'string' || !context.mode
            || !(context.target === null || typeof context.target === 'string') || !Array.isArray(context.attention)
            || !Number.isFinite(context.elapsed) || !Number.isFinite(context.activityStart)
            || context.elapsed < context.activityStart || !Array.isArray(beforeKnowledge?.meanings)
            || !Array.isArray(beforeKnowledge.relations) || !Array.isArray(beforeExperiences)
            || u?.kind !== 'sequence_demonstration' || u.complete !== true
            || !equal(u.known, { meaning: 'rest', eventMeaning: 'eat' })
            || !equal(u.relations, ['request', 'sequence']) || !equal(u.unresolved, []) || !equal(u.roles, roles)
            || u.subject !== 'self' || u.target !== null || u.aspect !== null || u.questionSlot !== null
            || u.conditionStatus !== null || u.polarity !== 'positive' || u.eventTime !== 'unspecified'
            || u.reportSource !== undefined || result.relationLearning !== undefined || result.conditionJudgment !== undefined) return false;
        const basis = beforeKnowledge.meanings.find(m => m.id === 'rest');
        const eventBasis = beforeKnowledge.meanings.find(m => m.id === 'eat');
        const relationBasis = beforeKnowledge.relations.filter(r => ['request', 'sequence'].includes(r.id)
            && (r.source === 'initial' || r.source === 'experienced_relation' && applies(r, frame, input)));
        if (!basisValid(basis, 'rest', context.elapsed, beforeKnowledge, beforeExperiences)
            || !basisValid(eventBasis, 'eat', context.elapsed, beforeKnowledge, beforeExperiences)
            || !['request', 'sequence'].every(id => relationBasis.some(r => r.id === id))
            || !relationBasis.every(r => relationValid(r, input, context.elapsed, beforeKnowledge, beforeExperiences))
            || !equal(u.relationReferences || [], relationBasis.filter(r => r.source === 'experienced_relation'))) return false;
        let referencedExperience = null, referenceLabel = null, eventReference = null;
        if (frame.phase === 'before') {
            if (context.mode !== 'eat' || !/^berry:\d+$/.test(context.target)
                || context.attention.length !== 1 || context.attention[0].id !== context.target
                || !Number.isFinite(context.dwell) || context.dwell <= 0) return false;
        } else {
            if (context.mode === 'eat' || !Number.isInteger(context.harvest) || context.harvest < 0) return false;
            const event = beforeExperiences.filter(e => e.activity === 'eat').at(-1);
            if (event) {
                if (event.kind !== 'experience' || !Number.isInteger(event.id) || event.id < 1
                    || event.target !== `berry:${context.harvest}`
                    || !Number.isFinite(event.start) || !Number.isFinite(event.end)
                    || event.end <= event.start || event.end > context.elapsed
                    || event.relationLabels !== undefined && !Array.isArray(event.relationLabels)) return false;
                const label = event.relationLabels?.find(l => l.relation === 'sequence' && l.phase === 'before'
                    && l.locale === input.locale && l.speaker === input.speaker && l.form === frame.form);
                if (label) {
                    if (!originalValid(label, event, frame, input, beforeKnowledge, beforeExperiences)) return false;
                    referencedExperience = event; referenceLabel = label;
                    eventReference = { experienceId: event.id, inputId: label.inputId, start: event.start, end: event.end };
                }
            }
        }
        return buffer.retain({ occurrenceId: `known_sequence_example:${input.id}`, kind: 'teaching', sourceId: input.id,
            captured: { sources: { input, frame, index: 0, scene: context.scene, attention: context.attention,
                activity: { mode: context.mode, target: context.target, start: context.activityStart, at: context.elapsed },
                referencedExperience, referenceLabel }, basis, eventBasis, relationBasis, understanding: u, roles,
                completionReference: { status: frame.phase === 'before' ? 'not_applicable'
                    : eventReference ? 'source_matched' : 'unidentified', eventReference } } });
    }
    return Object.freeze({ capture });
});
