(function (root, factory) {
    const api = factory(typeof module === 'object' && module.exports
        ? require('./experimental_word_learning_catalog.json') : root.ExperimentalWordDiaryReasonExplanationCatalog);
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.ExperimentalWordDiaryReasonExplanationExamples = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (catalog) {
    'use strict';
    const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    const serial = id => typeof id === 'string' && /^input:[1-9]\d*$/.test(id) ? Number(id.slice(6)) : NaN;
    const normalize = text => text.normalize('NFKC').trim().toLocaleLowerCase();
    const roles = choice => ({ proposer: 'player', addressee: 'self',
        actors: choice === 'request' ? ['self'] : ['player', 'self'], status: 'proposed', actualParticipation: false });
    const partial = u => u?.kind === 'partial' && u.complete === false && equal(u.known, { meaning: 'rest' })
        && equal(u.relations, []) && equal(u.unresolved, [{ type: 'relation', id: 'question' }])
        && u.subject === null && u.target === null && u.aspect === null && u.questionSlot === null
        && u.conditionStatus === null && u.polarity === 'positive' && u.eventTime === 'unspecified'
        && ['roles', 'relationReferences', 'applications', 'reportSource', 'testimony'].every(key => u[key] === undefined);
    const questionRelations = (knowledge, locale, form) => (Array.isArray(knowledge?.relations) ? knowledge.relations : []).filter(r => r.id === 'question'
        && (r.source === 'initial' || r.source === 'experienced_relation'
            && equal(r.scope, { kind: 'question', slot: 'reason', locale, speaker: 'player', meaning: 'rest', form })));
    const complete = (u, relations) => relations.length > 0 && u?.kind === 'reason_demonstration' && u.complete === true
        && equal(u.known, { meaning: 'rest' }) && equal(u.relations, ['question']) && equal(u.unresolved, [])
        && u.subject === 'self' && u.target === null && u.aspect === null && u.questionSlot === null
        && u.conditionStatus === null && u.polarity === 'positive' && u.eventTime === 'unspecified'
        && equal(u.relationReferences || [], relations.filter(r => r.source === 'experienced_relation'))
        && ['roles', 'applications', 'reportSource', 'testimony', 'feelingReferences', 'contrastConnection']
            .every(key => u[key] === undefined);
    function validBasis(basis, knowledge, experiences, selection) {
        const current = knowledge.meanings.find(m => m.id === 'rest');
        return basis?.id === 'rest' && current?.source === basis.source
            && (basis.source === 'initial' ? equal(basis, current) : basis.source === 'experienced_life'
                && Array.isArray(basis.evidence) && basis.evidence.length > 0 && basis.evidence.every(e =>
                    current.evidence?.some(item => equal(item, e)) && Number.isFinite(serial(e.scope?.inputId))
                    && serial(e.scope.inputId) < serial(selection.input.id)
                    && e.scope?.subject === 'self' && e.scope.activity === 'rest' && e.scope.target === 'shade'
                    && Number.isFinite(e.scope.labelAt) && experiences.some(event => event.id === e.experienceId
                        && event.kind === 'experience' && event.activity === 'rest' && event.target === 'shade'
                        && Number.isFinite(event.start) && Number.isFinite(event.end) && event.end >= event.start
                        && e.scope.labelAt >= event.start && e.scope.labelAt <= event.end && event.end <= selection.selectedAt
                        && event.lifeLabels?.some(l => l.inputId === e.scope.inputId && l.at === e.scope.labelAt
                            && l.meaning === 'rest' && l.activity === 'rest' && l.target === 'shade'
                            && l.speaker === e.scope.speaker && l.raw === e.scope.label))));
    }
    function validSelection(source, choice, locale, inputId, knowledge, experiences) {
        const item = catalog?.proposalTeaching?.[locale]?.[choice], input = source?.input, frame = source?.frame, u = source?.understanding;
        if (!item || source?.kind !== 'selected_proposal' || source.subject !== 'self' || source.target !== 'shade'
            || !Number.isFinite(source.selectedAt) || source.selectedAt < 0 || !Number.isFinite(serial(input?.id))
            || serial(input.id) >= serial(inputId) || input.locale !== locale || input.speaker !== 'player'
            || !Number.isFinite(input.at) || typeof input.scene !== 'string' || typeof input.raw !== 'string'
            || normalize(input.raw) !== normalize(item.utterance)
            || !equal(frame, { kind: choice, proposalKind: choice, meaning: 'rest', relations: [choice], subject: 'self',
                roles: roles(choice), form: normalize(item.utterance), utterance: item.utterance, span: input.raw })
            || u?.kind !== choice || u.complete !== true || !equal(u.known, { meaning: 'rest' })
            || !equal(u.relations, [choice]) || !equal(u.unresolved, []) || !equal(u.roles, roles(choice))
            || u.subject !== 'self' || u.target !== null || u.aspect !== null || u.questionSlot !== null
            || u.polarity !== 'positive' || u.eventTime !== 'unspecified' || u.conditionStatus !== null || u.applications !== undefined
            || !validBasis(source.meaningBasis, knowledge, experiences, source)
            || !Array.isArray(source.relationBasis) || source.relationBasis.length !== 1) return false;
        const basis = source.relationBasis[0];
        return basis?.id === choice && knowledge.relations.some(r => equal(r, basis))
            && (basis.source === 'initial' && equal(basis, { id: choice, source: 'initial' }) || basis.source === 'experienced_relation'
                && equal(basis.scope, { kind: choice, locale, speaker: 'player', meaning: 'rest',
                    form: frame.form, roles: roles(choice) })
                && Array.isArray(basis.evidence) && basis.evidence.length === 2 && new Set(basis.evidence).size === 2
                && basis.evidence.every((id, index) => Number.isFinite(serial(id)) && serial(id) < serial(input.id)
                    && experiences.some(e => Number.isFinite(e.end) && e.end <= source.selectedAt
                        && e.relationLabels?.some(l => l.inputId === id && l.locale === locale && l.speaker === 'player'
                            && l.relation === (index === 0 ? 'request' : 'invitation') && l.meaning === 'rest'
                            && equal(l.roles, roles(l.relation))
                            && knowledge.relationEvidence.some(ref => ref.inputId === id && ref.experienceId === e.id
                                && ref.relation === l.relation && ref.form === l.form && equal(ref.roles, l.roles)))))
                && experiences.find(e => e.relationLabels?.some(l => l.inputId === basis.evidence[0]))?.id
                    !== experiences.find(e => e.relationLabels?.some(l => l.inputId === basis.evidence[1]))?.id)
            && equal(u.relationReferences || [], basis.source === 'initial' ? [] : [basis]);
    }
    function validQuestionLabel(label, event, selections, knowledge, experiences, currentId) {
        const item = catalog?.reasonTeaching?.[label?.locale], source = selections.find(s => s?.input?.id === label?.choiceSource?.inputId);
        const proposal = catalog?.proposalTeaching?.[label?.locale]?.[label?.choice];
        return item && proposal && event?.kind === 'experience' && event.activity === 'rest' && event.target === 'shade'
            && (typeof event.id === 'string' && event.id || Number.isInteger(event.id) && event.id >= 0)
            && Number.isFinite(event.start) && Number.isFinite(event.end) && event.start >= 0 && event.end > event.start
            && label?.relation === 'question' && label.slot === 'reason' && label.speaker === 'player'
            && Number.isFinite(serial(label.inputId)) && serial(label.inputId) <= serial(currentId)
            && typeof label.scene === 'string' && Number.isFinite(label.heardAt) && Number.isFinite(label.at)
            && label.at >= event.end && label.start === event.start && label.activity === 'rest'
            && label.target === 'shade' && label.subject === 'self' && label.meaning === 'rest'
            && label.form === normalize(item.utterance) && label.question === item.utterance && label.answer === proposal.utterance
            && typeof label.raw === 'string' && label.raw.trim() === `${item.question}「${item.utterance}」→「${proposal.utterance}」`
            && equal(label.eventReference, { experienceId: event.id, start: event.start, end: event.end })
            && equal(label.choiceSource, event.choiceSource) && source
            && equal(label.choiceSource, { inputId: source.input.id, selectedAt: source.selectedAt })
            && source.selectedAt <= event.start && validSelection(source, label.choice, label.locale, label.inputId, knowledge, experiences)
            && equal(label.basis, source.meaningBasis) && equal(label.proposalBasis, source.relationBasis)
            && label.questionBasis === null && (partial(label.understanding)
                || complete(label.understanding, questionRelations(knowledge, label.locale, label.form)
                    .filter(r => r.source === 'initial' || r.evidence?.every(id => serial(id) < serial(label.inputId)))));
    }
    const evidenceFor = (label, event) => ({ relation: label.relation, experienceId: event.id, inputId: label.inputId,
        locale: label.locale, speaker: 'player', slot: 'reason', form: label.form, choice: label.choice,
        choiceSource: label.choiceSource, meaning: 'rest' });
    function matchedExperience(event, source, context) {
        const physical = context.experiences.filter(e => e.id === event.id);
        return physical.length === 1 && physical[0].kind === 'rest'
            && ['target', 'start', 'end', 'before', 'after', 'choiceSource', 'relationLabels']
                .every(k => equal(physical[0][k], event[k]))
            && context.history.some(h => h.mode === 'move' && h.target === 'shade' && h.start === source.selectedAt
                && h.end === event.start && h.reasons?.some(r => equal(r.selectionSource, event.choiceSource)))
            && context.history.some(h => h.mode === 'rest' && h.target === 'shade' && h.experienceId === event.id
                && h.start === event.start && h.end === event.end
                && h.reasons?.some(r => equal(r.selectionSource, event.choiceSource)));
    }
    function validQuestionBasis(basis, knowledge, experiences, selections, context, inputId, at) {
        if (basis.source === 'initial') return equal(basis, { id: 'question', source: 'initial' });
        if (!Array.isArray(basis.evidence) || basis.evidence.length !== 2 || new Set(basis.evidence).size !== 2) return false;
        const originals = basis.evidence.map(id => {
            const matches = experiences.filter(e => e.relationLabels?.some(l => l.inputId === id));
            if (matches.length !== 1) return null;
            const event = matches[0], labels = event.relationLabels.filter(l => l.inputId === id), label = labels[0];
            const sources = selections.filter(s => s?.input?.id === label?.choiceSource?.inputId);
            return labels.length === 1 && sources.length === 1 && serial(id) < serial(inputId) && label.at <= at
                && label.locale === basis.scope.locale && label.form === basis.scope.form && partial(label.understanding)
                && validQuestionLabel(label, event, selections, knowledge, experiences, inputId)
                && matchedExperience(event, sources[0], context)
                && knowledge.relationEvidence.filter(e => e.inputId === id && e.slot === 'reason' && e.relation === 'question').length === 1
                && knowledge.relationEvidence.some(e => equal(e, evidenceFor(label, event))) ? { event, label } : null;
        });
        return originals.every(Boolean) && originals[0].label.choice === 'request' && originals[1].label.choice === 'invitation'
            && originals[0].event.id !== originals[1].event.id
            && originals[0].label.choiceSource.inputId !== originals[1].label.choiceSource.inputId;
    }
    const partialReason = (u, relations) => relations.length === 1 && u?.kind === 'partial' && u.complete === false
        && equal(u.known, { meaning: 'rest' }) && equal(u.relations, ['question'])
        && equal(u.unresolved, [{ type: 'relation', id: 'reason' }])
        && u.subject === null && u.target === null && u.aspect === null && u.questionSlot === null
        && u.conditionStatus === null && u.polarity === 'positive' && u.eventTime === 'unspecified'
        && equal(u.relationReferences || [], relations.filter(r => r.source === 'experienced_relation'))
        && ['roles', 'applications', 'reportSource', 'testimony', 'feelingReferences', 'contrastConnection']
            .every(key => u[key] === undefined);
    function validReasonLabel(label, event, selections, knowledge, experiences, currentId, context) {
        const item = catalog?.reasonTeaching?.[label?.locale], source = selections.find(s => s?.input?.id === label?.choiceSource?.inputId);
        const proposal = catalog?.proposalTeaching?.[label?.locale]?.[label?.choice];
        return item && proposal && event?.kind === 'experience' && event.activity === 'rest' && event.target === 'shade'
            && (typeof event.id === 'string' && event.id || Number.isInteger(event.id) && event.id >= 0)
            && Number.isFinite(event.start) && Number.isFinite(event.end) && event.start >= 0 && event.end > event.start
            && label?.relation === 'reason' && label.slot === 'reason' && label.speaker === 'player'
            && Number.isFinite(serial(label.inputId)) && serial(label.inputId) <= serial(currentId)
            && typeof label.scene === 'string' && Number.isFinite(label.heardAt) && Number.isFinite(label.at)
            && label.at >= event.end && label.start === event.start && label.activity === 'rest'
            && label.target === 'shade' && label.subject === 'self' && label.meaning === 'rest'
            && label.form === normalize(item.utterance) && label.question === item.utterance && label.answer === proposal.utterance
            && typeof label.raw === 'string' && label.raw.trim() === `${item.reason}「${item.utterance}」→「${proposal.utterance}」`
            && equal(label.eventReference, { experienceId: event.id, start: event.start, end: event.end })
            && equal(label.choiceSource, event.choiceSource) && source
            && equal(label.choiceSource, { inputId: source.input.id, selectedAt: source.selectedAt })
            && source.selectedAt <= event.start && validSelection(source, label.choice, label.locale, label.inputId, knowledge, experiences)
            && equal(label.basis, source.meaningBasis) && equal(label.proposalBasis, source.relationBasis)
            && partialReason(label.understanding, questionRelations(knowledge, label.locale, label.form))
            && equal(label.questionBasis, questionRelations(knowledge, label.locale, label.form)[0])
            && validQuestionBasis(label.questionBasis, knowledge, experiences, selections, context, label.inputId, label.at);
    }
    // The six arguments are temporary source snapshots, not a save contract.
    // Choosing a proposal, later teaching and input-time question understanding and then-unknown reason stay distinct.
    function capture(buffer, result, context, beforeKnowledge, beforeExperiences, beforeSelections) {
        const input = result?.input, frame = result?.interpretations?.[0], u = result?.understandings?.[0];
        const pairing = result?.relationLearning, label = pairing?.candidates?.[0], item = catalog?.reasonTeaching?.[input?.locale];
        if (!item || input?.speaker !== 'player' || !Number.isFinite(serial(input.id)) || !Number.isFinite(input.at)
            || result.interpretations?.length !== 1 || result.understandings?.length !== 1
            || !['request', 'invitation'].includes(frame?.choice)
            || !equal(frame, { kind: 'reason_demonstration', stage: 'reason', slot: 'reason', meaning: 'rest', subject: 'self',
                form: normalize(item.utterance), question: item.utterance,
                answer: catalog.proposalTeaching[input.locale][frame.choice].utterance, choice: frame.choice,
                relations: ['question', 'reason'], span: input.raw }) || !partialReason(u, questionRelations(beforeKnowledge || { relations: [] }, input.locale, frame.form))
            || context?.scene !== input.scene || !Array.isArray(context.attention)
            || !['idle', 'observe', 'move', 'eat', 'work'].includes(context.mode)
            || !(context.target === null || typeof context.target === 'string')
            || !Number.isFinite(context.elapsed) || !Number.isFinite(context.activityStart)
            || context.activityStart < 0 || context.activityStart > context.elapsed
            || context.mode === 'move' && context.destination === 'shade'
            || !Array.isArray(context.history) || !Array.isArray(context.experiences)
            || !Array.isArray(beforeExperiences) || !Array.isArray(beforeSelections)
            || !Array.isArray(beforeKnowledge?.meanings) || !Array.isArray(beforeKnowledge.relations)
            || !Array.isArray(beforeKnowledge.relationEvidence) || pairing?.candidates?.length !== 1
            || !equal(pairing.adopted, label) || !Array.isArray(pairing.updated) || typeof pairing.relationAcquired !== 'boolean'
            || ['conditionJudgment', 'sequenceJudgment'].some(k => result[k] !== undefined)
            || beforeKnowledge.relations.some(r => r.id === 'reason' && (r.source === 'initial'
                || r.source === 'experienced_relation' && equal(r.scope, { kind: 'question', slot: 'reason',
                    locale: input.locale, speaker: input.speaker, meaning: 'rest', form: frame.form })))) return false;
        const questionBasis = questionRelations(beforeKnowledge, input.locale, frame.form);
        if (questionBasis.length !== 1 || !validQuestionBasis(questionBasis[0], beforeKnowledge, beforeExperiences,
            beforeSelections, context, input.id, context.elapsed)) return false;
        const event = beforeExperiences.filter(e => e.activity === 'rest').at(-1);
        const physical = context.experiences.filter(e => e.id === event?.id);
        if (!validReasonLabel(label, event, beforeSelections, beforeKnowledge, beforeExperiences, input.id, context)
            || beforeExperiences.filter(e => e.id === event.id).length !== 1 || physical.length !== 1
            || physical[0].kind !== 'rest' || !['target', 'start', 'end', 'before', 'after', 'choiceSource', 'relationLabels']
                .every(k => equal(physical[0][k], event[k]))
            || event.end > context.elapsed || context.history.some(h => h.mode === 'rest' && h.start >= event.end)
            || event.relationLabels?.some(l => l.slot === 'reason' && l.relation === 'reason')
            || label.inputId !== input.id || label.raw !== input.raw || label.locale !== input.locale
            || label.heardAt !== input.at || label.scene !== input.scene || label.at !== context.elapsed
            || label.choice !== frame.choice || !equal(label.understanding, u)
            || beforeSelections.filter(s => s?.input?.id === label.choiceSource.inputId).length !== 1) return false;
        const selection = beforeSelections.find(s => s.input.id === label.choiceSource.inputId);
        const reference = label.choiceSource;
        if (!context.history.some(h => h.mode === 'move' && h.target === 'shade' && h.start === selection.selectedAt
            && h.end === event.start && h.reasons?.some(r => equal(r.selectionSource, reference)))
            || !context.history.some(h => h.mode === 'rest' && h.target === 'shade' && h.experienceId === event.id
                && h.start === event.start && h.end === event.end
                && h.reasons?.some(r => equal(r.selectionSource, reference)))) return false;
        const relevant = beforeKnowledge.relationEvidence.filter(e => e.relation === 'reason' && e.slot === 'reason'
            && e.locale === input.locale && e.form === frame.form);
        if (new Set(relevant.map(e => e.choice)).size !== relevant.length) return false;
        // The first accepted source for each choice already exists in the
        // supplied history. Missing evidence cannot make it a new first source.
        for (const choice of ['request', 'invitation']) {
            const original = beforeExperiences.flatMap(e => (e.relationLabels || [])
                .filter(l => l.relation === 'reason' && l.slot === 'reason' && l.locale === input.locale
                    && l.form === frame.form && l.choice === choice).map(label => ({ label, event: e })))[0];
            const retained = relevant.find(e => e.choice === choice);
            if (Boolean(original) !== Boolean(retained) || original && !equal(retained, evidenceFor(original.label, original.event))) return false;
        }
        for (const e of relevant) {
            const original = beforeExperiences.find(v => v.id === e.experienceId);
            const originalLabel = original?.relationLabels?.find(l => l.inputId === e.inputId);
            const originalSelection = beforeSelections.find(s => s?.input?.id === originalLabel?.choiceSource?.inputId);
            if (serial(e.inputId) >= serial(input.id) || !validReasonLabel(originalLabel, original, beforeSelections,
                beforeKnowledge, beforeExperiences, input.id, context) || originalLabel.at > context.elapsed
                || beforeExperiences.filter(v => v.id === e.experienceId).length !== 1
                || beforeExperiences.filter(v => v.relationLabels?.some(l => l.inputId === e.inputId)).length !== 1
                || original.relationLabels.filter(l => l.inputId === e.inputId).length !== 1
                || beforeSelections.filter(s => s?.input?.id === originalLabel.choiceSource.inputId).length !== 1
                || !matchedExperience(original, originalSelection, context)
                || !equal(e, evidenceFor(originalLabel, original))) return false;
        }
        const updated = relevant.some(e => e.choice === label.choice) ? [] : [evidenceFor(label, event)];
        const all = [...relevant, ...updated], request = all.find(e => e.choice === 'request');
        const invitation = all.find(e => e.choice === 'invitation' && request && e.experienceId !== request.experienceId
            && e.choiceSource.inputId !== request.choiceSource.inputId);
        if (!equal(pairing.updated, updated) || pairing.relationAcquired !== Boolean(request && invitation)) return false;
        return buffer.retain({ occurrenceId: `reason_explanation_example:${input.id}`, kind: 'teaching', sourceId: input.id,
            captured: { sources: { input, frame, index: 0, scene: context.scene, attention: context.attention,
                activity: { mode: context.mode, target: context.target, start: context.activityStart, at: context.elapsed },
                referencedExperience: event, selectionSource: selection }, basis: label.basis,
                proposalBasis: label.proposalBasis, questionBasis, understanding: u, pairing } });
    }
    return Object.freeze({ capture });
});
