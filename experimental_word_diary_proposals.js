(function (root, factory) {
    const api = factory(typeof module === 'object' && module.exports
        ? require('./experimental_word_learning_core') : root.ExperimentalWordDiaryProposalCore,
    typeof module === 'object' && module.exports
        ? require('./experimental_word_learning_catalog.json') : root.ExperimentalWordDiaryProposalCatalog);
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.ExperimentalWordDiaryProposals = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (core, catalog) {
    'use strict';
    const copy = value => JSON.parse(JSON.stringify(value));
    const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    const serial = id => typeof id === 'string' && /^input:[1-9]\d*$/.test(id) ? Number(id.slice(6)) : NaN;
    const simpleRules = ['rest', 'rest_request', 'rest_invitation', 'walk_invitation'];
    const actionFields = ['mode', 'destination', 'attention', 'dwell', 'elapsed', 'activityStart', 'reasons',
        'experiences', 'hunger', 'fatigue', 'x', 'y', 'island', 'route', 'history', 'lifeLabels', 'relationLabels'];
    const snapshot = world => Object.fromEntries(actionFields.filter(key => world[key] !== undefined)
        .map(key => [key, copy(world[key])]));
    function basisValid(basis, meaning, input, at) {
        return basis?.id === meaning && (basis.source === 'initial' || meaning === 'rest'
            && basis.source === 'experienced_life' && Array.isArray(basis.evidence) && basis.evidence.length > 0
            && basis.evidence.every(e => Number.isSafeInteger(e.experienceId) && e.experienceId > 0
                && e.scope?.subject === 'self' && e.scope.activity === 'rest'
                && typeof e.scope.target === 'string' && e.scope.target.length > 0
                && Number.isSafeInteger(serial(e.scope.inputId)) && serial(e.scope.inputId) < serial(input.id)
                && Number.isFinite(e.scope.labelAt) && e.scope.labelAt >= 0 && e.scope.labelAt <= at
                && typeof e.scope.speaker === 'string' && e.scope.speaker.length > 0
                && typeof e.scope.label === 'string' && e.scope.label.length > 0));
    }
    // The caller copies this receipt at receive/respond time. No game calls
    // this adapter; these five arguments are not a persistence schema.
    function capture(buffer, result, context, beforeKnowledge, decision) {
        const input = result?.input, frame = result?.interpretations?.[0], u = result?.understandings?.[0];
        if (!core || !catalog || input?.speaker !== 'player' || !Number.isSafeInteger(serial(input.id))
            || typeof input.raw !== 'string' || !Number.isFinite(input.at) || !catalog.patterns[input.locale]
            || result.interpretations?.length !== 1 || result.understandings?.length !== 1
            || !['request', 'invitation'].includes(frame?.kind) || !['rest', 'walk'].includes(frame.meaning)
            || frame.catalogRule && !simpleRules.includes(frame.catalogRule)
            || !frame.catalogRule && !frame.proposalKind
            || frame.meaning === 'walk' && (input.locale !== 'ja' || frame.catalogRule !== 'walk_invitation')
            || !equal(frame.relations, [frame.kind]) || frame.conditionMeaning || frame.target || frame.time
            || context?.scene !== input.scene || !Array.isArray(context.attention)
            || typeof context.mode !== 'string' || !(context.target === null || typeof context.target === 'string')
            || !Number.isFinite(context.elapsed) || !Number.isFinite(context.activityStart)
            || context.activityStart < 0 || context.elapsed < context.activityStart
            || !Array.isArray(beforeKnowledge?.meanings) || !Array.isArray(beforeKnowledge.relations)
            || u?.complete !== true || !equal(u.known, { meaning: frame.meaning })
            || !equal(u.relations, [frame.kind]) || !equal(u.unresolved, []) || u.applications || u.contextReference
            || u.target !== null || u.conditionStatus !== null || u.polarity !== 'positive'
            || u.eventTime !== 'unspecified' || result.relationLearning || result.conditionJudgment
            || !decision || !['short', 'gesture'].includes(decision.speech)
            || !Array.isArray(decision.beforeSelections) || !Array.isArray(decision.afterSelections)) return false;
        // Reuse the existing parser and comprehension on disposable knowledge,
        // never today's game state. This also preserves absent generic roles.
        if (!equal(core.interpret(input.raw, input.locale, catalog), result.interpretations)) return false;
        const state = core.create({ foundation: false, life: false, speech: decision.speech }, catalog);
        state.knowledge = copy(beforeKnowledge); state.context.scene = context.scene;
        state.context.attention = copy(context.attention);
        if (!equal(core.understand(state, frame, input.speaker, catalog, input.locale), u)) return false;
        const meanings = beforeKnowledge.meanings.filter(m => m.id === frame.meaning);
        const basis = meanings[0];
        const relationBasis = beforeKnowledge.relations.filter(r => r.id === frame.kind
            && (r.source === 'initial' || (u.relationReferences || []).some(ref => equal(ref, r))));
        if (meanings.length !== 1 || !basisValid(basis, frame.meaning, input, context.elapsed)
            || relationBasis.length !== 1 || !relationBasis.every(r => r.source === 'initial'
                || r.source === 'experienced_relation' && r.evidence?.length === 2 && new Set(r.evidence).size === 2
                    && r.evidence.every(id => Number.isSafeInteger(serial(id)) && serial(id) < serial(input.id)))
            || !equal(u.relationReferences || [], relationBasis.filter(r => r.source === 'experienced_relation'))) return false;
        const before = decision.before, after = decision.after, response = decision.response;
        if (!before || !after || !response || !Array.isArray(before.reasons) || !Array.isArray(before.experiences)
            || !Array.isArray(before.history) || !Number.isFinite(before.dwell)
            || decision.beforeSelections.some(s => !Number.isSafeInteger(serial(s.input?.id))
                || serial(s.input.id) >= serial(input.id) || !Number.isFinite(s.selectedAt) || s.selectedAt > before.elapsed)
            || new Set(decision.beforeSelections.map(s => s.input.id)).size !== decision.beforeSelections.length
            || before.mode !== context.mode || before.attention !== context.target
            || before.activityStart !== context.activityStart || before.elapsed !== context.elapsed
            || !['elapsed', 'dwell', 'experiences', 'hunger', 'fatigue', 'x', 'y', 'island']
                .every(key => equal(before[key], after[key]))) return false;
        const interested = before.mode === 'eat' || before.mode === 'work'
            || typeof before.attention === 'string' && before.attention.startsWith('berry:') && before.dwell > 4;
        const target = frame.meaning === 'rest' ? 'shade' : 'path';
        let outcome, selectedSource = null;
        if (interested) {
            outcome = 'continuing';
            const expected = before.mode === 'work' ? { message: 'work', observation: true }
                : { message: decision.speech === 'short' ? 'keep_looking' : 'looking' };
            if (!equal(response, expected) || !equal(snapshot(before), snapshot(after))
                || !equal(decision.beforeSelections, decision.afterSelections)) return false;
        } else if (after.mode === 'move' && after.destination === target && after.attention === null
            && after.activityStart === before.elapsed
            && equal(after.reasons, [{ kind: 'understood_suggestion', target, inputId: input.id,
                ...(frame.meaning === 'rest' ? { selectionSource: { inputId: input.id, selectedAt: before.elapsed } } : {}) }])) {
            outcome = 'approaching';
            if (!equal(response, { message: decision.speech === 'short' ? 'join' : 'attend' })
                || !equal(after.lifeLabels, []) || !equal(after.relationLabels, [])
                || before.island && (!before.island.places?.some(p => p.id === target) || !after.route)) return false;
            const history = copy(before.history);
            if (before.mode !== 'move' && before.elapsed > before.activityStart)
                history.push({ mode: before.mode, target: before.attention, start: before.activityStart,
                    end: before.elapsed, reasons: copy(before.reasons) });
            if (!equal(after.history, history)) return false;
            if (frame.meaning === 'rest') {
                selectedSource = { kind: 'selected_proposal', subject: 'self', target: 'shade', selectedAt: before.elapsed,
                    input, frame, understanding: u, meaningBasis: basis, relationBasis };
                if (decision.beforeSelections.some(s => s.input?.id === input.id)
                    || !equal(decision.afterSelections, [...decision.beforeSelections, selectedSource])) return false;
            } else if (!equal(decision.beforeSelections, decision.afterSelections)) return false;
        } else {
            outcome = 'not_started';
            if (!before.island || !Array.isArray(before.island.places)
                || !equal(response, { message: decision.speech === 'short' ? 'answer_unknown' : 'attend' })
                || !equal(snapshot(before), snapshot(after))
                || !equal(decision.beforeSelections, decision.afterSelections)) return false;
        }
        return buffer.retain({ occurrenceId: `ordinary_proposal:${input.id}`, sourceId: input.id, kind: 'proposal',
            captured: { sources: { input, frame, scene: context.scene, attention: context.attention,
                activity: { mode: context.mode, target: context.target, start: context.activityStart, at: context.elapsed } },
                basis, relationBasis, understanding: u, decision: { outcome, response,
                    before: snapshot(before), after: snapshot(after), selectedSource } } });
    }
    return Object.freeze({ capture });
});
