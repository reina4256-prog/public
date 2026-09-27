(function (root, factory) {
    const api = factory(typeof module === 'object' && module.exports
        ? require('./experimental_word_learning_core') : root.ExperimentalWordLearning);
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.ExperimentalWordRelationLearning = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (core) {
    'use strict';
    const copy = value => JSON.parse(JSON.stringify(value));
    const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    const wordKey = word => word.normalize('NFKC').trim().toLocaleLowerCase();
    const locales = ['ja', 'en', 'zh-CN', 'ru', 'es-ES', 'pt-BR', 'de'];
    const isProposal = relation => ['request', 'invitation'].includes(relation);
    const fits = (activity, target) => activity === 'eat' ? /^berry:[1-9]\d*$/.test(target)
        : activity === 'rest' && target === 'shade';
    // A bounded sensory check while attending to one's rest, not a global
    // numeric truth oracle. The middle band and absent attention stay unknown.
    const fatigueStatus = fatigue => fatigue >= .55 ? 'met' : fatigue <= .25 ? 'unmet' : 'unknown';
    function sensation(world, state) {
        if (world.mode !== 'rest' || world.attention !== 'shade' || state.context.attention.length !== 1
            || state.context.attention[0].id !== 'shade' || !state.knowledge.meanings.some(m => m.id === 'tired')
            || !Number.isFinite(world.fatigue) || !Number.isFinite(world.activityBefore?.fatigue)) return null;
        return { source: 'self_sensation', subject: 'self', activity: 'rest', target: 'shade',
            start: world.activityStart, at: world.elapsed, before: world.activityBefore.fatigue,
            fatigue: world.fatigue, status: fatigueStatus(world.fatigue) };
    }
    function validSensation(sample) {
        return sample?.source === 'self_sensation' && sample.subject === 'self'
            && sample.activity === 'rest' && sample.target === 'shade'
            && Number.isFinite(sample.start) && Number.isFinite(sample.at) && sample.at >= sample.start
            && Number.isFinite(sample.before) && sample.before >= 0 && sample.before <= 1
            && Number.isFinite(sample.fatigue) && sample.fatigue >= 0 && sample.fatigue <= sample.before
            && sample.status === fatigueStatus(sample.fatigue);
    }
    function conditionJudgment(world, state, result) {
        const frame = result.interpretations[0], u = result.understandings[0];
        if (result.interpretations.length !== 1 || frame.kind !== 'conditional_proposal' || !u.complete) return null;
        const observation = sensation(world, state);
        const judgment = { inputId: result.input.id, raw: result.input.raw, locale: result.input.locale,
            speaker: result.input.speaker, heardAt: result.input.at, at: world.elapsed,
            status: observation?.status || 'unknown', observation, application: 'when_met', duration: 'unspecified' };
        result.conditionJudgment = copy(judgment);
        const turn = state.context.turns.find(t => t.id === result.input.id);
        if (turn) turn.conditionJudgment = copy(judgment);
        return judgment;
    }
    function validBasis(basis, meaning, at, state) {
        const known = state.knowledge.meanings.find(m => m.id === meaning);
        if (!known || basis?.id !== meaning || known.source !== basis.source) return false;
        if (known.source === 'initial') return state.settings.life && equal(basis, known);
        return known.source === 'experienced_life' && Array.isArray(basis.evidence)
            && basis.evidence.length > 0 && basis.evidence.every(e =>
                known.evidence.some(item => equal(item, e)) && (state.experiences || [])
                    .some(event => event.id === e.experienceId && event.end <= at));
    }
    function validLabel(label, state, catalog) {
        if (label?.slot === 'reason') return validReasonLabel(label, state, catalog);
        if (!label || !['naming', 'question', 'request', 'invitation', 'report', 'negation', 'time', 'condition', 'sequence'].includes(label.relation) || label.speaker !== 'player'
            || !locales.includes(label.locale) || !/^input:[1-9]\d*$/.test(label.inputId)
            || Number(label.inputId.slice(6)) > state.serial || !Number.isFinite(label.heardAt)
            || !Number.isFinite(label.at) || !Number.isFinite(label.start) || label.at < label.start
            || !fits(label.activity, label.target) || typeof label.raw !== 'string'
            || typeof label.scene !== 'string' || label.subject !== 'self') return false;
        if (label.understanding?.complete !== false || label.understanding.kind !== 'partial'
            || label.understanding.known?.meaning !== label.meaning
            || !equal(label.understanding.unresolved, [{ type: 'relation', id: label.relation }])) return false;
        if (label.basis?.id !== label.meaning) return false;
        if (label.relation === 'sequence') {
            const basis = label.proposalBasis;
            if (label.meaning !== 'rest' || label.activity !== 'eat' || label.eventMeaning !== 'eat'
                || label.eventSubject !== 'self' || label.application !== 'after_completion'
                || !['before', 'after'].includes(label.phase) || label.understanding.known.eventMeaning !== 'eat'
                || !equal(label.understanding.relations, ['request'])
                || !validBasis(label.eventBasis, 'eat', label.start, state)
                || !validBasis(label.basis, 'rest', label.start, state)
                || !equal(label.roles, { proposer: 'player', addressee: 'self', actors: ['self'], status: 'proposed', actualParticipation: false })
                || basis?.id !== 'request' || !state.knowledge.relations.some(r => equal(r, basis))
                || (basis.source !== 'initial' && (basis.scope?.kind !== 'request' || basis.scope?.meaning !== 'rest'
                    || basis.scope?.form !== label.proposalForm || basis.scope?.locale !== label.locale
                    || basis.scope?.speaker !== label.speaker || !equal(basis.scope.roles, label.roles)
                    || !basis.evidence.every(id => state.experiences.some(e => e.end <= label.start
                        && e.relationLabels?.some(l => l.inputId === id)))))) return false;
            if (label.phase === 'before') {
                if (!equal(label.eventReference, { experienceId: null, inputId: label.inputId, start: label.start, end: null })) return false;
            } else {
                const ref = label.eventReference;
                const event = state.experiences.find(e => e.id === ref?.experienceId);
                const original = event?.relationLabels?.find(l => l.inputId === ref.inputId);
                if (!event || event.kind !== 'experience' || event.activity !== 'eat' || event.target !== label.target
                    || event.start !== ref.start || event.start !== label.start || event.end !== ref.end || event.end > label.at
                    || original?.relation !== 'sequence' || original.phase !== 'before' || original.at >= event.end
                    || original.locale !== label.locale || original.speaker !== label.speaker || original.form !== label.form
                    || Number(original.inputId.slice(6)) >= Number(label.inputId.slice(6))
                    || !equal(original.basis, label.basis) || !equal(original.eventBasis, label.eventBasis)
                    || !equal(original.proposalBasis, basis)
                    || state.experiences.some(e => e.activity === 'eat' && e.start >= event.end && e.start < label.at)) return false;
            }
            if (catalog) {
                const frame = core.sequenceFrame(label.raw, label.locale, catalog);
                if (frame?.kind !== 'sequence_demonstration' || frame.phase !== label.phase || frame.form !== label.form
                    || frame.utterance !== label.utterance || frame.proposalForm !== label.proposalForm
                    || !equal(frame.roles, label.roles)) return false;
            }
        } else if (label.relation === 'condition') {
            const basis = label.proposalBasis;
            if (label.meaning !== 'rest' || label.activity !== 'rest' || label.conditionMeaning !== 'tired'
                || label.conditionSubject !== 'self' || label.application !== 'when_met' || label.duration !== 'unspecified'
                || !['met', 'unmet'].includes(label.demonstratedStatus)
                || !validSensation(label.observation) || label.observation.status !== label.demonstratedStatus
                || label.observation.start !== label.start || label.observation.at !== label.at
                || label.understanding.known.conditionMeaning !== 'tired' || label.understanding.conditionStatus !== 'unknown'
                || !equal(label.understanding.relations, ['request'])
                || !validBasis(label.conditionBasis, 'tired', label.at, state)
                || !equal(label.roles, { proposer: 'player', addressee: 'self', actors: ['self'], status: 'proposed', actualParticipation: false })
                || basis?.id !== 'request' || !state.knowledge.relations.some(r => equal(r, basis))
                || (basis.source !== 'initial' && (basis.scope?.kind !== 'request' || basis.scope?.meaning !== 'rest'
                    || basis.scope?.form !== label.proposalForm || basis.scope?.locale !== label.locale
                    || basis.scope?.speaker !== label.speaker || !equal(basis.scope.roles, label.roles)
                    || !basis.evidence.every(id => state.experiences.some(e => e.end <= label.start
                        && e.relationLabels?.some(l => l.inputId === id)))))) return false;
            if (catalog) {
                const frame = core.conditionFrame(label.raw, label.locale, catalog);
                if (frame?.kind !== 'condition_demonstration' || frame.form !== label.form
                    || frame.utterance !== label.utterance || frame.demonstratedStatus !== label.demonstratedStatus
                    || frame.proposalForm !== label.proposalForm || !equal(frame.roles, label.roles)) return false;
            }
        } else if (label.relation === 'time') {
            if (label.meaning !== 'rest' || label.activity !== 'rest' || !['now', 'past'].includes(label.eventTime)
                || label.understanding.eventTime !== 'unspecified' || label.understanding.polarity !== 'positive'
                || !equal(label.understanding.relations, ['report'])
                || !equal(label.roles, { reporter: 'player', contentSubject: 'self', status: 'reported', verified: false })
                || !label.reportBasis || label.reportBasis.id !== 'report'
                || !state.knowledge.relations.some(r => equal(r, label.reportBasis))
                || (label.reportBasis.source !== 'initial' && (label.reportBasis.scope?.form !== label.reportForm
                    || label.reportBasis.scope?.kind !== 'report' || label.reportBasis.scope?.meaning !== 'rest'
                    || label.reportBasis.scope?.locale !== label.locale || label.reportBasis.scope?.speaker !== label.speaker
                    || !equal(label.reportBasis.scope?.roles, label.roles)
                    || !label.reportBasis.evidence.every(id => state.experiences.some(e => e.end <= label.start
                        && e.relationLabels?.some(l => l.inputId === id)))))) return false;
            if (label.eventTime === 'now') {
                if (!equal(label.eventReference, { experienceId: null, inputId: label.inputId, start: label.start, end: null })) return false;
            } else {
                const ref = label.eventReference;
                const event = state.experiences.find(e => e.id === ref?.experienceId);
                const original = event?.relationLabels?.find(l => l.inputId === ref.inputId);
                if (!event || event.kind !== 'experience' || event.activity !== 'rest' || event.target !== 'shade'
                    || event.start !== ref.start || event.end !== ref.end || event.end > label.start
                    || original?.relation !== 'time' || original.eventTime !== 'now'
                    || original.locale !== label.locale || original.speaker !== label.speaker
                    || Number(original.inputId.slice(6)) >= Number(label.inputId.slice(6))
                    || !equal(original.reportBasis, label.reportBasis)) return false;
            }
            if (catalog) {
                const frame = core.timeFrame(label.raw, label.locale, catalog);
                if (frame?.kind !== 'time_demonstration' || frame.form !== label.form || frame.time !== label.eventTime
                    || frame.reportForm !== label.reportForm || frame.utterance !== label.utterance
                    || !equal(frame.roles, label.roles)) return false;
            }
        } else if (label.relation === 'negation') {
            if (label.meaning !== 'rest' || !['positive', 'negative'].includes(label.polarity)
                || label.understanding.polarity !== 'unknown' || !equal(label.understanding.relations, ['report'])
                || label.activity !== (label.polarity === 'positive' ? 'rest' : 'eat')
                || !validBasis(label.observationBasis, label.activity, label.at, state)
                || !equal(label.roles, { reporter: 'player', contentSubject: 'self', status: 'reported', verified: false })
                || typeof label.form !== 'string' || typeof label.reportForm !== 'string'
                || !label.reportBasis || label.reportBasis.id !== 'report'
                || !state.knowledge.relations.some(r => equal(r, label.reportBasis))
                || (label.reportBasis.source !== 'initial' && (label.reportBasis.scope?.form !== label.reportForm
                    || label.reportBasis.scope?.kind !== 'report' || label.reportBasis.scope?.meaning !== 'rest'
                    || label.reportBasis.scope?.locale !== label.locale || label.reportBasis.scope?.speaker !== label.speaker
                    || !equal(label.reportBasis.scope?.roles, label.roles)
                    || !label.reportBasis.evidence.every(id => state.experiences.some(e => e.end <= label.start
                        && e.relationLabels?.some(l => l.inputId === id)))))) return false;
            if (catalog) {
                const frame = core.negationFrame(label.raw, label.locale, catalog);
                if (frame?.kind !== 'negation_demonstration' || frame.form !== label.form
                    || frame.reportForm !== label.reportForm || frame.polarity !== label.polarity
                    || frame.utterance !== label.utterance || !equal(frame.roles, label.roles)) return false;
            }
        } else if (label.meaning !== label.activity) return false;
        if (label.relation === 'naming') {
            const frame = core.wordFrame(label.raw, label.locale);
            if (frame?.kind !== 'word_explanation' || frame.word !== label.word || !label.word) return false;
            if (catalog && (core.lexicalMeaning(frame.meaning, catalog) !== label.meaning
                || core.lexicalMeaning(frame.word, catalog))) return false;
        } else if (label.relation === 'report') {
            if (label.meaning !== 'rest' || !['self', 'player'].includes(label.roles?.contentSubject)
                || !equal(label.roles, { reporter: 'player', contentSubject: label.roles.contentSubject,
                    status: 'reported', verified: false }) || typeof label.form !== 'string' || !label.form
                || typeof label.utterance !== 'string') return false;
            if (catalog) {
                const frame = core.reportFrame(label.raw, label.locale, catalog);
                if (frame?.kind !== 'report_demonstration' || frame.form !== label.form
                    || frame.utterance !== label.utterance || !equal(frame.roles, label.roles)) return false;
            }
        } else if (isProposal(label.relation)) {
            const roles = { proposer: 'player', addressee: 'self',
                actors: label.relation === 'request' ? ['self'] : ['player', 'self'],
                status: 'proposed', actualParticipation: false };
            if (label.meaning !== 'rest' || !equal(label.roles, roles)
                || typeof label.form !== 'string' || !label.form || typeof label.utterance !== 'string') return false;
            if (catalog) {
                const frame = core.proposalFrame(label.raw, label.locale, catalog);
                if (frame?.kind !== 'proposal_demonstration' || frame.proposalKind !== label.relation
                    || frame.form !== label.form || frame.utterance !== label.utterance || !equal(frame.roles, label.roles)) return false;
            }
        } else if (label.relation === 'question') {
            if (label.slot !== 'current_activity' || typeof label.form !== 'string' || !label.form
                || label.roles?.questioner !== 'player' || label.roles?.answerer !== 'self'
                || label.roles?.demonstrator !== 'player' || label.roles?.actualAnswer !== false) return false;
            if (catalog) {
                const frame = core.questionDemonstration(label.raw, label.locale, catalog);
                if (!frame || frame.form !== label.form || frame.question !== label.question
                    || frame.answer !== label.answer || core.lexicalMeaning(frame.answer, catalog) !== label.meaning) return false;
            }
        }
        return validBasis(label.basis, label.meaning, label.at, state);
    }
    // These labels refer to an already completed rest and its retained choice.
    // They are later teaching, not edits to what the child knew when choosing.
    function validReasonLabel(label, state, catalog) {
        if (!Array.isArray(state.selectionSources)) return false;
        const event = state.experiences?.find(e => e.id === label.eventReference?.experienceId);
        const source = state.selectionSources.find(s => s?.input?.id === label.choiceSource?.inputId);
        const relation = label.relation, u = label.understanding;
        if (!['question', 'reason'].includes(relation) || label.speaker !== 'player' || !locales.includes(label.locale)
            || !/^input:[1-9]\d*$/.test(label.inputId) || Number(label.inputId.slice(6)) > state.serial
            || !Number.isFinite(label.heardAt) || !Number.isFinite(label.at) || typeof label.scene !== 'string'
            || label.subject !== 'self' || label.meaning !== 'rest' || label.activity !== 'rest' || label.target !== 'shade'
            || !event || event.kind !== 'experience' || event.activity !== 'rest' || event.target !== 'shade'
            || !equal(label.eventReference, { experienceId: event.id, start: event.start, end: event.end })
            || label.start !== event.start || label.at < event.end
            || state.experiences.some(e => e.activity === 'rest' && e.id !== event.id && e.start >= event.end && e.start < label.at)
            || !source || !equal(event.choiceSource, label.choiceSource)
            || source.selectedAt !== label.choiceSource.selectedAt || source.input.locale !== label.locale
            || source.input.speaker !== label.speaker || source.frame?.kind !== label.choice || source.frame?.utterance !== label.answer
            || state.selectionSources.some(s => s?.input?.id === label.inputId)
            || !equal(label.basis, source.meaningBasis) || !equal(label.proposalBasis, source.relationBasis)
            || Number(source.input.id.slice(6)) >= Number(label.inputId.slice(6))
            || !validBasis(label.basis, 'rest', source.selectedAt, state)
            || typeof label.raw !== 'string' || typeof label.form !== 'string'
            || !u || u.known?.meaning !== 'rest'
            || !(equal(u.unresolved, [{ type: 'relation', id: relation }]) || equal(u.unresolved, []))
            || u.complete !== (u.unresolved.length === 0)
            || u.kind !== (u.complete ? 'reason_demonstration' : 'partial')
            || !equal(u.relations, relation === 'reason' ? ['question', ...(u.complete ? ['reason'] : [])]
                : u.complete ? ['question'] : [])) return false;
        if (relation === 'reason') {
            const q = label.questionBasis;
            if (q?.id !== 'question' || !state.knowledge.relations.some(r => equal(r, q))
                || (q.source === 'initial' ? !state.settings.foundation
                    : q.scope?.kind !== 'question' || q.scope.slot !== 'reason' || q.scope.form !== label.form
                        || q.scope.locale !== label.locale || q.scope.speaker !== label.speaker
                        || !Array.isArray(q.evidence) || !q.evidence.every(id => Number(id.slice(6)) < Number(label.inputId.slice(6))
                            && state.experiences.some(e => e.relationLabels?.some(l => l.inputId === id && l.at <= label.at))))) return false;
        } else if (label.questionBasis !== null) return false;
        if (catalog) {
            const frame = core.reasonFrame(label.raw, label.locale, catalog);
            const proposal = core.proposalFrame(label.answer, label.locale, catalog);
            if (frame?.kind !== 'reason_demonstration' || frame.stage !== relation || frame.form !== label.form
                || frame.question !== label.question || frame.answer !== label.answer || frame.choice !== label.choice
                || proposal?.kind !== source.frame.kind || !equal(proposal, { ...source.frame, span: label.answer })) return false;
            const snapshot = core.create(state.settings, catalog);
            snapshot.knowledge.meanings = [copy(label.basis)];
            snapshot.knowledge.relations = copy(state.knowledge.relations.filter(r => r.source === 'initial'
                || Array.isArray(r.evidence) && r.evidence.every(id => Number(id.slice(6)) < Number(label.inputId.slice(6))
                    && state.experiences.some(e => e.relationLabels?.some(l => l.inputId === id && l.at <= label.at)))));
            const replay = core.receive(snapshot, label.raw, catalog, { locale: label.locale, speaker: label.speaker, at: label.heardAt });
            if (!equal(replay.understandings[0], u)) return false;
        }
        return true;
    }
    function offerReason(world, state, result) {
        const frame = result.interpretations[0], u = result.understandings[0];
        if (result.interpretations.length !== 1 || result.input.speaker !== 'player'
            || !(equal(u.unresolved, [{ type: 'relation', id: frame.stage }]) || u.complete)) return false;
        const event = state.experiences?.filter(e => e.activity === 'rest').at(-1);
        const source = state.selectionSources?.find(s => s.input.id === event?.choiceSource?.inputId);
        const physical = event && world.experiences.find(e => e.id === event.id);
        // Once another rest has begun, the unqualified example cannot reach back.
        if (!source || !physical || world.mode === 'rest' || world.mode === 'move' && world.destination === 'shade'
            || world.history.some(h => h.mode === 'rest' && h.start >= event.end)
            || event.relationLabels?.some(l => l.slot === 'reason' && l.relation === frame.stage)) return false;
        const label = { relation: frame.stage, slot: 'reason', inputId: result.input.id, raw: result.input.raw,
            locale: result.input.locale, speaker: result.input.speaker, heardAt: result.input.at,
            at: world.elapsed, start: event.start, activity: 'rest', target: 'shade', subject: 'self', scene: result.input.scene,
            meaning: 'rest', form: frame.form, question: frame.question, answer: frame.answer, choice: frame.choice,
            eventReference: { experienceId: event.id, start: event.start, end: event.end }, choiceSource: copy(event.choiceSource),
            basis: copy(source.meaningBasis), proposalBasis: copy(source.relationBasis),
            questionBasis: frame.stage === 'reason' ? copy(state.knowledge.relations.find(r => r.id === 'question'
                && (r.source === 'initial' || r.scope?.slot === 'reason' && r.scope.form === frame.form
                    && r.scope.locale === result.input.locale && r.scope.speaker === result.input.speaker)) || null) : null,
            understanding: copy(u) };
        if (!validReasonLabel(label, state)) return false;
        (event.relationLabels ||= []).push(copy(label)); (physical.relationLabels ||= []).push(copy(label));
        const learning = learn(state);
        result.relationLearning = { candidates: [copy(label)], adopted: copy(label), updated: learning.updated,
            relationAcquired: learning.relationAcquired };
        return true;
    }
    function offerSequence(world, state, result) {
        const frame = result.interpretations[0], u = result.understandings[0];
        if (result.interpretations.length !== 1 || result.input.speaker !== 'player'
            || !equal(u.unresolved, [{ type: 'relation', id: 'sequence' }])) return false;
        const event = frame.phase === 'after' ? state.experiences.filter(e => e.activity === 'eat').at(-1) : null;
        const original = event?.relationLabels?.find(l => l.relation === 'sequence' && l.phase === 'before'
            && l.locale === result.input.locale && l.speaker === result.input.speaker && l.form === frame.form);
        const physical = event && world.experiences.find(e => e.id === event.id);
        if (frame.phase === 'before') {
            if (world.mode !== 'eat' || !fits('eat', world.attention) || state.context.attention.length !== 1
                || state.context.attention[0].id !== world.attention || world.dwell <= 0) return false;
        } else if (!original || !physical || world.mode === 'eat' || event.target !== `berry:${world.harvest}`
            || event.end > world.elapsed || event.relationLabels.some(l => l.relation === 'sequence' && l.phase === 'after')) return false;
        const label = { relation: 'sequence', inputId: result.input.id, raw: result.input.raw,
            locale: result.input.locale, speaker: result.input.speaker, heardAt: result.input.at,
            at: world.elapsed, start: event?.start ?? world.activityStart, activity: 'eat', target: event?.target ?? world.attention,
            subject: 'self', scene: result.input.scene, meaning: 'rest', eventMeaning: 'eat', eventSubject: 'self',
            application: 'after_completion', phase: frame.phase, form: frame.form, utterance: frame.utterance,
            roles: copy(frame.roles), proposalForm: frame.proposalForm,
            eventReference: event ? { experienceId: event.id, inputId: original.inputId, start: event.start, end: event.end }
                : { experienceId: null, inputId: result.input.id, start: world.activityStart, end: null },
            // Reuse the prerequisite snapshot of the unfinished meal; later
            // vocabulary evidence must neither replace nor invalidate it.
            basis: copy(original?.basis || state.knowledge.meanings.find(m => m.id === 'rest') || null),
            eventBasis: copy(original?.eventBasis || state.knowledge.meanings.find(m => m.id === 'eat') || null),
            proposalBasis: copy(original?.proposalBasis || state.knowledge.relations.find(r => r.id === 'request' && (r.source === 'initial'
                || r.scope?.form === frame.proposalForm && r.scope.locale === result.input.locale
                    && r.scope.speaker === result.input.speaker)) || null), understanding: copy(u) };
        if (!validLabel(label, state)) return false;
        let learning;
        if (event) {
            // Append a later teaching, never change the original meal or its first input.
            event.relationLabels.push(copy(label)); physical.relationLabels.push(copy(label));
            learning = learn(state);
        } else {
            world.relationLabels ||= [];
            if (!world.relationLabels.some(l => l.relation === 'sequence')) world.relationLabels.push(label);
        }
        result.relationLearning = { candidates: [copy(label)], adopted: copy(event ? label
            : world.relationLabels.find(l => l.relation === 'sequence')), updated: learning?.updated || [],
            relationAcquired: learning?.relationAcquired || false };
        return true;
    }
    function offer(world, state, result) {
        const frame = result.interpretations[0], u = result.understandings[0];
        if (frame.kind === 'reason_demonstration') return offerReason(world, state, result);
        if (frame.kind === 'sequence_demonstration') return offerSequence(world, state, result);
        const relation = frame.kind === 'condition_demonstration' ? 'condition' : frame.kind === 'time_demonstration' ? 'time' : frame.kind === 'negation_demonstration' ? 'negation'
            : frame.kind === 'proposal_demonstration' ? frame.proposalKind
            : frame.kind === 'question_demonstration' ? 'question'
            : frame.kind === 'report_demonstration' ? 'report' : 'naming';
        if (result.interpretations.length !== 1 || result.input.speaker !== 'player'
            || !['word_explanation', 'question_demonstration', 'proposal_demonstration', 'report_demonstration', 'negation_demonstration', 'time_demonstration', 'condition_demonstration'].includes(frame.kind)
            || (relation === 'negation' ? world.mode !== (frame.polarity === 'positive' ? 'rest' : 'eat') : u.known.meaning !== world.mode)
            || !u.unresolved.some(item => item.type === 'relation' && item.id === relation)
            || u.unresolved.some(item => item.type !== 'relation' || item.id !== relation)
            || !fits(world.mode, world.attention) || state.context.attention.length !== 1
            || state.context.attention[0].id !== world.attention) return false;
        // No standard word, prior custom explanation or conflicting hypothesis is repurposed.
        if (relation === 'naming' && (result.learning[0]?.candidates.length || state.knowledge.associations.some(a => wordKey(a.word) === wordKey(frame.word))
            || (state.knowledge.wordExplanations || []).some(e => wordKey(e.word) === wordKey(frame.word)))) return false;
        if (relation === 'question' && state.knowledge.relations.some(r => r.id === 'question'
            && r.scope?.locale === result.input.locale && r.scope?.form === frame.form)) return false;
        const basis = state.knowledge.meanings.find(m => m.id === u.known.meaning);
        // The past teaching explicitly revisits the retained labelled rest, which
        // must have been labelled while it was present. Another rest provides
        // the teaching occasion, never the past event or a repetition bonus.
        const retained = state.knowledge.relationEvidence.find(e => e.relation === 'time' && e.eventTime === 'now'
            && e.locale === result.input.locale && e.speaker === result.input.speaker);
        const previous = relation === 'time' && frame.time === 'past'
            ? state.experiences.find(e => e.id === retained?.experienceId && e.end <= world.activityStart) : null;
        const original = previous?.relationLabels?.find(l => l.relation === 'time' && l.eventTime === 'now'
            && l.locale === result.input.locale && l.speaker === result.input.speaker);
        if (relation === 'time' && frame.time === 'past' && !original) return false;
        const label = { relation, inputId: result.input.id, raw: result.input.raw,
            locale: result.input.locale, speaker: result.input.speaker, heardAt: result.input.at,
            at: world.elapsed, start: world.activityStart, activity: world.mode, target: world.attention,
            subject: 'self', scene: result.input.scene, ...(relation === 'naming' ? { word: frame.word }
                : relation === 'condition' ? { form: frame.form, utterance: frame.utterance, roles: copy(frame.roles),
                    conditionMeaning: frame.conditionMeaning, conditionSubject: frame.conditionSubject,
                    application: frame.application, duration: frame.duration, demonstratedStatus: frame.demonstratedStatus,
                    observation: sensation(world, state), proposalForm: frame.proposalForm,
                    conditionBasis: copy(state.knowledge.meanings.find(m => m.id === 'tired') || null),
                    proposalBasis: copy(state.knowledge.relations.find(r => r.id === 'request' && (r.source === 'initial'
                        || r.scope?.form === frame.proposalForm && r.scope.locale === result.input.locale
                            && r.scope.speaker === result.input.speaker)) || null) }
                : relation === 'time' ? { form: frame.form, utterance: frame.utterance, roles: copy(frame.roles),
                    eventTime: frame.time, reportForm: frame.reportForm,
                    eventReference: previous ? { experienceId: previous.id, inputId: original.inputId, start: previous.start, end: previous.end }
                        : { experienceId: null, inputId: result.input.id, start: world.activityStart, end: null },
                    reportBasis: copy(state.knowledge.relations.find(r => r.id === 'report' && (r.source === 'initial'
                        || r.scope?.form === frame.reportForm && r.scope.locale === result.input.locale
                            && r.scope.speaker === result.input.speaker)) || null) }
                : relation === 'negation' ? { form: frame.form, utterance: frame.utterance, roles: copy(frame.roles),
                    polarity: frame.polarity, reportForm: frame.reportForm,
                    observationBasis: copy(state.knowledge.meanings.find(m => m.id === world.mode) || null),
                    reportBasis: copy(state.knowledge.relations.find(r => r.id === 'report' && (r.source === 'initial'
                        || r.scope?.form === frame.reportForm && r.scope.locale === result.input.locale
                            && r.scope.speaker === result.input.speaker)) || null) }
                : isProposal(relation) || relation === 'report' ? { form: frame.form, utterance: frame.utterance, roles: copy(frame.roles) }
                : { question: frame.question, answer: frame.answer, form: frame.form, slot: frame.slot,
                    roles: { questioner: 'player', answerer: 'self', demonstrator: 'player', actualAnswer: false } }), meaning: u.known.meaning,
            basis: copy(basis), understanding: copy(u) };
        if (!validLabel(label, state)) return false;
        if (relation === 'naming' && state.knowledge.relationEvidence.some(e => e.relation === 'naming' && e.locale === label.locale
            && e.meaning !== label.meaning && wordKey(e.word) === wordKey(label.word))) return false;
        world.relationLabels ||= [];
        // A single rest cannot serve as both sides of the role contrast.
        if (isProposal(relation) && world.relationLabels.some(l => isProposal(l.relation) && l.relation !== relation)) return false;
        // A retained report label grounds the known action in the child's rest.
        // Its content about the player remains testimony, never a player experience.
        if (relation === 'report' && world.relationLabels.some(l => l.relation === 'report'
            && l.roles.contentSubject !== label.roles.contentSubject)) return false;
        if (!world.relationLabels.some(l => l.relation === relation)) world.relationLabels.push(label);
        // Keep the first pairing; a different word in the same activity is not independent evidence.
        result.relationLearning = { candidates: [copy(label)], adopted: copy(world.relationLabels.find(l => l.relation === relation)), updated: [], relationAcquired: false };
        return true;
    }
    function finish(world, experience) {
        const labels = (world.relationLabels || []).filter(l => l.start === experience.start
            && l.activity === experience.kind && l.target === experience.target);
        if (labels.length) experience.relationLabels = copy(labels);
        world.relationLabels = [];
    }
    function candidates(state, catalog) {
        return (state.experiences || []).flatMap(event => (event.relationLabels || [])
            .filter(l => validLabel(l, state, catalog) && event.kind === 'experience'
                && event.activity === l.activity && event.target === l.target && event.start === l.start
                && (l.slot === 'reason' ? l.at >= event.end : l.relation === 'sequence' ? l.phase === 'after'
                    ? l.eventReference.experienceId === event.id && l.at >= event.end : l.at < event.end
                    : event.end >= l.at) && Number.isFinite(event.end))
            .map(l => ({ relation: l.relation, experienceId: event.id, inputId: l.inputId,
                locale: l.locale, speaker: l.speaker, ...(l.relation === 'naming' ? { word: l.word }
                    : l.slot === 'reason' ? { slot: 'reason', form: l.form, choice: l.choice, choiceSource: copy(l.choiceSource) }
                    : l.relation === 'sequence' ? { form: l.form, roles: copy(l.roles), proposalForm: l.proposalForm,
                        phase: l.phase, eventReference: copy(l.eventReference), eventMeaning: l.eventMeaning,
                        eventSubject: l.eventSubject, application: l.application }
                    : l.relation === 'condition' ? { form: l.form, roles: copy(l.roles), proposalForm: l.proposalForm,
                        conditionMeaning: l.conditionMeaning, conditionSubject: l.conditionSubject,
                        application: l.application, duration: l.duration, demonstratedStatus: l.demonstratedStatus }
                    : l.relation === 'time' ? { form: l.form, roles: copy(l.roles), eventTime: l.eventTime,
                        reportForm: l.reportForm, eventReference: copy(l.eventReference) }
                    : l.relation === 'negation' ? { form: l.form, roles: copy(l.roles), polarity: l.polarity, reportForm: l.reportForm }
                    : isProposal(l.relation) || l.relation === 'report' ? { form: l.form, roles: copy(l.roles) }
                    : { form: l.form, slot: l.slot }), meaning: l.meaning })));
    }
    function acquired(evidence) {
        const pairs = [];
        for (const locale of locales) {
            for (const relation of ['question', 'reason']) {
                const items = evidence.filter(e => e.relation === relation && e.slot === 'reason' && e.locale === locale);
                const request = items.find(e => e.choice === 'request');
                const invitation = items.find(e => e.choice === 'invitation' && request && e.form === request.form
                    && e.experienceId !== request.experienceId && e.choiceSource.inputId !== request.choiceSource.inputId);
                if (request && invitation) pairs.push({ id: relation, source: 'experienced_relation',
                    scope: { kind: 'question', slot: 'reason', locale, speaker: 'player', meaning: 'rest', form: request.form },
                    evidence: [request.inputId, invitation.inputId] });
            }
            const after = evidence.find(e => e.relation === 'sequence' && e.locale === locale && e.phase === 'after');
            const before = after && evidence.find(e => e.relation === 'sequence' && e.phase === 'before'
                && e.locale === locale && e.inputId === after.eventReference.inputId && e.experienceId === after.experienceId);
            if (before && after) pairs.push({ id: 'sequence', source: 'experienced_relation',
                scope: { kind: 'sequential_proposal', locale, speaker: 'player', meaning: 'rest', form: after.form,
                    roles: copy(after.roles), proposalForm: after.proposalForm, eventMeaning: 'eat',
                    eventSubject: 'self', application: 'after_completion' }, evidence: [before.inputId, after.inputId] });
            const met = evidence.find(e => e.relation === 'condition' && e.locale === locale && e.demonstratedStatus === 'met');
            const unmet = evidence.find(e => e.relation === 'condition' && e.locale === locale && e.demonstratedStatus === 'unmet'
                && met && e.form === met.form && e.proposalForm === met.proposalForm && e.experienceId !== met.experienceId);
            if (met && unmet) pairs.push({ id: 'condition', source: 'experienced_relation',
                scope: { kind: 'conditional_proposal', locale, speaker: 'player', meaning: 'rest', form: met.form,
                    roles: copy(met.roles), proposalForm: met.proposalForm, conditionMeaning: 'tired',
                    conditionSubject: 'self', application: 'when_met', duration: 'unspecified' },
                evidence: [met.inputId, unmet.inputId] });
            const present = evidence.find(e => e.relation === 'time' && e.locale === locale && e.eventTime === 'now');
            const past = evidence.find(e => e.relation === 'time' && e.locale === locale && e.eventTime === 'past'
                && present && e.eventReference.inputId === present.inputId && e.eventReference.experienceId === present.experienceId
                && e.experienceId !== present.experienceId);
            if (present && past) for (const item of [present, past]) pairs.push({ id: 'time', source: 'experienced_relation',
                scope: { kind: 'report', locale, speaker: 'player', meaning: 'rest', form: item.form,
                    roles: copy(item.roles), polarity: 'positive', reportForm: item.reportForm, eventTime: item.eventTime },
                evidence: [present.inputId, past.inputId] });
            // Negation contrasts the same predicate being present and absent.
            // Eating only witnesses absence of rest during this bounded activity;
            // it is not the meaning of "not resting" or evidence of a desire.
            const positive = evidence.find(e => e.relation === 'negation' && e.locale === locale && e.polarity === 'positive');
            const negative = evidence.find(e => e.relation === 'negation' && e.locale === locale && e.polarity === 'negative'
                && positive && e.reportForm === positive.reportForm && e.experienceId !== positive.experienceId);
            if (positive && negative) for (const item of [positive, negative]) pairs.push({ id: 'negation', source: 'experienced_relation',
                scope: { kind: 'report', locale, speaker: 'player', meaning: 'rest', form: item.form,
                    roles: copy(item.roles), polarity: item.polarity, reportForm: item.reportForm },
                evidence: [positive.inputId, negative.inputId] });
            // The contrast is who the reported action belongs to, not two actions
            // or a count of repetitions. Both inputs explicitly teach that role.
            const reports = evidence.filter(e => e.relation === 'report' && e.locale === locale);
            const self = reports.find(e => e.roles.contentSubject === 'self');
            const player = reports.find(e => e.roles.contentSubject === 'player' && self
                && e.experienceId !== self.experienceId);
            if (self && player) for (const item of [self, player]) pairs.push({ id: 'report', source: 'experienced_relation',
                scope: { kind: 'report', locale, speaker: 'player', meaning: 'rest', form: item.form,
                    roles: copy(item.roles) }, evidence: [self.inputId, player.inputId] });
            const items = evidence.filter(e => e.relation === 'naming' && e.locale === locale);
            const eat = items.find(e => e.meaning === 'eat');
            const rest = items.find(e => e.meaning === 'rest' && (!eat || wordKey(e.word) !== wordKey(eat.word)));
            if (eat && rest) pairs.push({ id: 'naming', source: 'experienced_relation',
                scope: { kind: 'word_explanation', locale, speaker: 'player', meanings: ['eat', 'rest'] }, evidence: [eat.inputId, rest.inputId] });
            // The same open question must have contrasting, witnessed answers.
            // A repeated fixed response does not demonstrate an answer slot.
            const questions = evidence.filter(e => e.relation === 'question' && e.slot === 'current_activity' && e.locale === locale);
            for (const form of new Set(questions.map(e => e.form))) {
                const answers = ['eat', 'rest'].map(meaning => questions.find(e => e.form === form && e.meaning === meaning));
                if (answers.every(Boolean)) pairs.push({ id: 'question', source: 'experienced_relation',
                    scope: { kind: 'question', locale, speaker: 'player', slot: 'current_activity', form },
                    evidence: answers.map(e => e.inputId) });
            }
            // Contrast the proposed actor roles for the SAME known action, in
            // distinct completed rests. This is explicit role teaching, not a
            // claim that the player physically participated or the child obeyed.
            const request = evidence.find(e => e.locale === locale && e.relation === 'request');
            const invitation = evidence.find(e => e.locale === locale && e.relation === 'invitation'
                && request && e.experienceId !== request.experienceId);
            if (request && invitation) for (const item of [request, invitation]) {
                pairs.push({ id: item.relation, source: 'experienced_relation',
                    scope: { kind: item.relation, locale, speaker: 'player', meaning: 'rest',
                        form: item.form, roles: copy(item.roles) }, evidence: [request.inputId, invitation.inputId] });
            }
        }
        return pairs;
    }
    const evidenceKey = e => JSON.stringify([e?.relation, e?.locale, e?.form || null, e?.meaning, e?.demonstratedStatus || null,
        ...(e?.slot === 'reason' ? [e.slot, e.choice] : e?.relation === 'sequence' ? [e.experienceId, e.phase] : [])]);
    const labelKey = l => l?.slot === 'reason' ? `${l.relation}:reason` : l?.relation === 'sequence' ? `${l.relation}:${l.phase}` : l?.relation;
    function learn(state) {
        const offered = candidates(state), updated = [];
        for (const item of offered) {
            if (state.knowledge.relationEvidence.some(e => evidenceKey(e) === evidenceKey(item))) continue;
            state.knowledge.relationEvidence.push(copy(item)); updated.push(copy(item));
        }
        const relations = acquired(state.knowledge.relationEvidence), added = [];
        for (const relation of relations) {
            if (!state.knowledge.relations.some(r => r.id === relation.id && (r.source === 'initial'
                || equal(r.scope, relation.scope)))) { state.knowledge.relations.push(relation); added.push(copy(relation)); }
        }
        return { candidates: offered, adopted: copy(state.knowledge.relationEvidence), updated,
            relations: added, relationAcquired: added.length > 0 };
    }
    function valid(state, world, catalog) {
        for (const turn of state.context.turns) {
            const j = turn.conditionJudgment;
            if (j === undefined) continue;
            const frame = catalog && core.conditionFrame(j.raw, j.locale, catalog);
            if (j.inputId !== turn.id || j.speaker !== turn.speaker || !Number.isFinite(j.heardAt)
                || !Number.isFinite(j.at) || j.at > world.elapsed || j.application !== 'when_met' || j.duration !== 'unspecified'
                || turn.understandings.length !== 1 || !turn.understandings[0].complete
                || turn.understandings[0].kind !== 'conditional_proposal'
                || !['met', 'unmet', 'unknown'].includes(j.status)
                || (j.observation === null ? j.status !== 'unknown' : !validSensation(j.observation)
                    || j.observation.at !== j.at || j.observation.status !== j.status)
                || (catalog && (frame?.kind !== 'conditional_proposal'
                    || !core.receive(copy(state), j.raw, catalog, { speaker: j.speaker, locale: j.locale }).understandings[0].complete))) return false;
        }
        // Keep heard reports distinct from the child's experience even after reload.
        for (const record of [...state.records, ...state.context.turns]) {
            for (const u of record.understandings || []) {
                if (u.kind !== 'report' || u.aspect !== 'activity_report') continue;
                const source = u.reportSource;
                if (record.source !== undefined && record.source !== 'speaker_report') return false;
                if (!source || source.kind !== 'speaker_report' || source.inputId !== record.id
                    || !Number.isFinite(source.heardAt) || source.reporter !== record.speaker
                    || source.contentSubject !== u.subject || typeof source.raw !== 'string'
                    || (record.heardAt !== undefined && record.heardAt !== source.heardAt)
                    || !equal(u.roles, { reporter: record.speaker, contentSubject: u.subject, status: 'reported', verified: false })) return false;
                if (catalog) {
                    const frame = core.timeFrame(source.raw, source.locale, catalog) || core.negationFrame(source.raw, source.locale, catalog) || core.reportFrame(source.raw, source.locale, catalog);
                    if (frame?.kind !== 'report' || (frame.subject === 'player' ? record.speaker : frame.subject) !== u.subject
                        || u.polarity !== (frame.polarity || 'positive') || u.eventTime !== (frame.time || 'unspecified')) return false;
                }
            }
        }
        if (state.knowledge.relations.some(r => !['initial', 'experienced_relation'].includes(r.source)
            || (r.source === 'initial' && !state.settings.foundation))) return false;
        if (new Set(state.knowledge.relations.map(r => JSON.stringify([r.id, r.scope])))
            .size !== state.knowledge.relations.length) return false;
        const allLabels = [...(Array.isArray(world.relationLabels) ? world.relationLabels : []),
            ...(state.experiences || []).flatMap(e => Array.isArray(e.relationLabels) ? e.relationLabels : [])];
        if (new Set(allLabels.map(l => l?.inputId)).size !== allLabels.length) return false;
        if (world.relationLabels !== undefined && (!Array.isArray(world.relationLabels)
            || world.relationLabels.length > 8 || world.relationLabels.filter(l => isProposal(l?.relation)).length > 1
            || new Set(world.relationLabels.map(labelKey)).size !== world.relationLabels.length
            || !world.relationLabels.every(l => validLabel(l, state, catalog)
                && l.slot !== 'reason' && (l.relation !== 'sequence' || l.phase === 'before')
                && l.at <= world.elapsed && l.start === world.activityStart
                && l.activity === world.mode && l.target === world.attention
                && (l.relation !== 'condition' || l.observation.before === world.activityBefore?.fatigue
                    && l.observation.fatigue >= world.fatigue)))) return false;
        for (const event of state.experiences || []) {
            if (event.relationLabels === undefined) continue;
            const originals = world.experiences.filter(e => e.id === event.id);
            if (!Array.isArray(event.relationLabels) || !event.relationLabels.length || event.relationLabels.length > 11
                || event.relationLabels.filter(l => isProposal(l?.relation)).length > 1
                || new Set(event.relationLabels.map(labelKey)).size !== event.relationLabels.length
                || originals.length !== 1 || !equal(originals[0].relationLabels, event.relationLabels)
                || (state.experiences || []).filter(e => e.id === event.id).length !== 1
                || originals[0].kind !== event.activity || originals[0].target !== event.target
                || originals[0].start !== event.start || originals[0].end !== event.end
                || !event.relationLabels.every(l => validLabel(l, state, catalog) && l.start === event.start
                    && (l.slot === 'reason' ? l.at >= event.end && l.at <= world.elapsed
                        && !world.history.some(h => h.mode === 'rest' && h.start >= event.end && h.start < l.at)
                        : l.relation === 'sequence' ? l.phase === 'after'
                        ? l.eventReference.experienceId === event.id && l.at >= event.end && l.at <= world.elapsed
                        : l.at < event.end : l.at <= event.end) && l.activity === event.activity && l.target === event.target
                    && (l.relation !== 'condition' || l.observation.before === event.before?.fatigue
                        && l.observation.before === originals[0].before?.fatigue
                        && l.observation.fatigue >= event.after?.fatigue && equal(event.after, originals[0].after)))) return false;
        }
        if (world.experiences.some(e => e.relationLabels !== undefined
            && !(state.experiences || []).some(event => event.id === e.id && equal(event.relationLabels, e.relationLabels)))) return false;
        const offered = candidates(state, catalog), evidence = state.knowledge.relationEvidence;
        if (new Set(evidence.map(evidenceKey)).size !== evidence.length
            || !evidence.every(e => offered.some(c => equal(c, e)))) return false;
        const expected = acquired(evidence);
        return state.knowledge.relations.filter(r => r.source === 'experienced_relation')
            .every(r => expected.some(e => equal(e, r)))
            && expected.every(e => state.knowledge.relations.some(r => r.source === 'initial' && r.id === e.id || equal(r, e)));
    }
    return Object.freeze({ offer, finish, learn, valid, conditionJudgment });
});
