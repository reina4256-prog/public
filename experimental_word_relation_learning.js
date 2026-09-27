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
    function validLabel(label, state, catalog) {
        if (!label || !['naming', 'question', 'request', 'invitation'].includes(label.relation) || label.speaker !== 'player'
            || !locales.includes(label.locale) || !/^input:[1-9]\d*$/.test(label.inputId)
            || Number(label.inputId.slice(6)) > state.serial || !Number.isFinite(label.heardAt)
            || !Number.isFinite(label.at) || !Number.isFinite(label.start) || label.at < label.start
            || !fits(label.activity, label.target) || typeof label.raw !== 'string'
            || typeof label.scene !== 'string' || label.subject !== 'self') return false;
        if (label.understanding?.complete !== false || label.understanding.kind !== 'partial'
            || label.understanding.known?.meaning !== label.meaning
            || !equal(label.understanding.unresolved, [{ type: 'relation', id: label.relation }])) return false;
        if (label.meaning !== label.activity || label.basis?.id !== label.meaning) return false;
        if (label.relation === 'naming') {
            const frame = core.wordFrame(label.raw, label.locale);
            if (frame?.kind !== 'word_explanation' || frame.word !== label.word || !label.word) return false;
            if (catalog && (core.lexicalMeaning(frame.meaning, catalog) !== label.meaning
                || core.lexicalMeaning(frame.word, catalog))) return false;
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
        } else {
            if (label.slot !== 'current_activity' || typeof label.form !== 'string' || !label.form
                || label.roles?.questioner !== 'player' || label.roles?.answerer !== 'self'
                || label.roles?.demonstrator !== 'player' || label.roles?.actualAnswer !== false) return false;
            if (catalog) {
                const frame = core.questionDemonstration(label.raw, label.locale, catalog);
                if (!frame || frame.form !== label.form || frame.question !== label.question
                    || frame.answer !== label.answer || core.lexicalMeaning(frame.answer, catalog) !== label.meaning) return false;
            }
        }
        const known = state.knowledge.meanings.find(m => m.id === label.meaning);
        if (!known || known.source !== label.basis.source) return false;
        if (known.source === 'initial') return state.settings.life && equal(label.basis, known);
        return known.source === 'experienced_life' && Array.isArray(label.basis.evidence)
            && label.basis.evidence.length > 0 && label.basis.evidence.every(e =>
                known.evidence.some(item => equal(item, e)) && (state.experiences || [])
                    .some(event => event.id === e.experienceId && event.end <= label.at));
    }
    function offer(world, state, result) {
        const frame = result.interpretations[0], u = result.understandings[0];
        const relation = frame.kind === 'proposal_demonstration' ? frame.proposalKind
            : frame.kind === 'question_demonstration' ? 'question' : 'naming';
        if (result.interpretations.length !== 1 || result.input.speaker !== 'player'
            || !['word_explanation', 'question_demonstration', 'proposal_demonstration'].includes(frame.kind) || u.known.meaning !== world.mode
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
        const label = { relation, inputId: result.input.id, raw: result.input.raw,
            locale: result.input.locale, speaker: result.input.speaker, heardAt: result.input.at,
            at: world.elapsed, start: world.activityStart, activity: world.mode, target: world.attention,
            subject: 'self', scene: result.input.scene, ...(relation === 'naming' ? { word: frame.word }
                : isProposal(relation) ? { form: frame.form, utterance: frame.utterance, roles: copy(frame.roles) }
                : { question: frame.question, answer: frame.answer, form: frame.form, slot: frame.slot,
                    roles: { questioner: 'player', answerer: 'self', demonstrator: 'player', actualAnswer: false } }), meaning: u.known.meaning,
            basis: copy(basis), understanding: copy(u) };
        if (!validLabel(label, state)) return false;
        if (relation === 'naming' && state.knowledge.relationEvidence.some(e => e.relation === 'naming' && e.locale === label.locale
            && e.meaning !== label.meaning && wordKey(e.word) === wordKey(label.word))) return false;
        world.relationLabels ||= [];
        // A single rest cannot serve as both sides of the role contrast.
        if (isProposal(relation) && world.relationLabels.some(l => isProposal(l.relation) && l.relation !== relation)) return false;
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
                && event.end >= l.at && Number.isFinite(event.end))
            .map(l => ({ relation: l.relation, experienceId: event.id, inputId: l.inputId,
                locale: l.locale, speaker: l.speaker, ...(l.relation === 'naming' ? { word: l.word }
                    : isProposal(l.relation) ? { form: l.form, roles: copy(l.roles) }
                    : { form: l.form, slot: l.slot }), meaning: l.meaning })));
    }
    function acquired(evidence) {
        const pairs = [];
        for (const locale of locales) {
            const items = evidence.filter(e => e.relation === 'naming' && e.locale === locale);
            const eat = items.find(e => e.meaning === 'eat');
            const rest = items.find(e => e.meaning === 'rest' && (!eat || wordKey(e.word) !== wordKey(eat.word)));
            if (eat && rest) pairs.push({ id: 'naming', source: 'experienced_relation',
                scope: { kind: 'word_explanation', locale, speaker: 'player', meanings: ['eat', 'rest'] }, evidence: [eat.inputId, rest.inputId] });
            // The same open question must have contrasting, witnessed answers.
            // A repeated fixed response does not demonstrate an answer slot.
            const questions = evidence.filter(e => e.relation === 'question' && e.locale === locale);
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
    const evidenceKey = e => JSON.stringify([e?.relation, e?.locale, e?.form || null, e?.meaning]);
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
        if (state.knowledge.relations.some(r => !['initial', 'experienced_relation'].includes(r.source)
            || (r.source === 'initial' && !state.settings.foundation))) return false;
        if (new Set(state.knowledge.relations.map(r => JSON.stringify([r.id, r.scope])))
            .size !== state.knowledge.relations.length) return false;
        const allLabels = [...(Array.isArray(world.relationLabels) ? world.relationLabels : []),
            ...(state.experiences || []).flatMap(e => Array.isArray(e.relationLabels) ? e.relationLabels : [])];
        if (new Set(allLabels.map(l => l?.inputId)).size !== allLabels.length) return false;
        if (world.relationLabels !== undefined && (!Array.isArray(world.relationLabels)
            || world.relationLabels.length > 3 || world.relationLabels.filter(l => isProposal(l?.relation)).length > 1
            || new Set(world.relationLabels.map(l => l?.relation)).size !== world.relationLabels.length
            || !world.relationLabels.every(l => validLabel(l, state, catalog)
                && l.at <= world.elapsed && l.start === world.activityStart
                && l.activity === world.mode && l.target === world.attention))) return false;
        for (const event of state.experiences || []) {
            if (event.relationLabels === undefined) continue;
            const originals = world.experiences.filter(e => e.id === event.id);
            if (!Array.isArray(event.relationLabels) || !event.relationLabels.length || event.relationLabels.length > 3
                || event.relationLabels.filter(l => isProposal(l?.relation)).length > 1
                || new Set(event.relationLabels.map(l => l?.relation)).size !== event.relationLabels.length
                || originals.length !== 1 || !equal(originals[0].relationLabels, event.relationLabels)
                || (state.experiences || []).filter(e => e.id === event.id).length !== 1
                || originals[0].kind !== event.activity || originals[0].target !== event.target
                || originals[0].start !== event.start || originals[0].end !== event.end
                || !event.relationLabels.every(l => validLabel(l, state, catalog) && l.start === event.start
                    && l.at <= event.end && l.activity === event.activity && l.target === event.target)) return false;
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
    return Object.freeze({ offer, finish, learn, valid });
});
