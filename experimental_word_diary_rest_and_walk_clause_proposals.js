(function (root, factory) {
    const node = typeof module === 'object' && module.exports;
    const api = factory(node ? require('./experimental_word_learning_core') : root.ExperimentalWordLearning,
        node ? require('./experimental_word_learning_world') : root.ExperimentalWordWorld,
        node ? require('./experimental_word_learning_catalog.json') : root.ExperimentalWordDiaryRestAndWalkClauseProposalsCatalog);
    if (node) module.exports = api;
    else root.ExperimentalWordDiaryRestAndWalkClauseProposals = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (core, worldApi, catalog) {
    'use strict';
    const copy = value => JSON.parse(JSON.stringify(value));
    const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    function jsonData(value, ancestors = new Set()) {
        if (value === null || ['string', 'boolean'].includes(typeof value)) return true;
        if (typeof value === 'number') return Number.isFinite(value);
        if (typeof value !== 'object' || ancestors.has(value)
            || !Array.isArray(value) && ![Object.prototype, null].includes(Object.getPrototypeOf(value))) return false;
        ancestors.add(value);
        const valid = Reflect.ownKeys(value).every(key => typeof key === 'string')
            && (Array.isArray(value) ? Array.from(value) : Object.values(value)).every(item => jsonData(item, ancestors));
        ancestors.delete(value); return valid;
    }
    // Retain both incomplete proposals in their original input order.
    // This adapter has no game, notebook or storage caller and adds no learning.
    function create() {
        const records = [];
        function retain(record) {
            if (!jsonData(record) || record?.kind !== 'rest_and_walk_clause_proposal'
                || !/^input:[1-9]\d*$/.test(record.sourceId)
                || !Number.isSafeInteger(Number(record.sourceId.slice(6)))
                || record.occurrenceId !== `rest_and_walk_clause_proposal:${record.sourceId}`
                || !record.captured || Array.isArray(record.captured) || typeof record.captured !== 'object') {
                throw new TypeError('Invalid rest and walk clause proposal material');
            }
            if (records.some(item => item.occurrenceId === record.occurrenceId)) return false;
            records.push(copy(record)); return true;
        }
        return Object.freeze({ retain, read: () => copy(records) });
    }
    function capture(buffer, result, receipt) {
        let record;
        try {
            if (!jsonData(result) || !jsonData(receipt)) return false;
            const input = result.input, before = receipt.beforeState;
            const frames = result.interpretations, understandings = result.understandings;
            if (input.locale !== 'ja' || !Number.isSafeInteger(before.serial) || before.serial < 0
                || before.serial === Number.MAX_SAFE_INTEGER
                || input.id !== `input:${before.serial + 1}` || !Number.isFinite(input.at)
                || typeof input.raw !== 'string' || !input.raw.trim()
                || typeof input.speaker !== 'string' || !input.speaker || input.scene !== before.context.scene
                || !equal(input, receipt.input) || !equal(before.knowledge, receipt.inputKnowledge)
                || !equal(before.context, receipt.inputContext)
                || frames.length !== 2 || understandings.length !== 2
                || result.relationLearning || result.conditionJudgment || result.sequenceJudgment) return false;
            const restIndex = frames.findIndex(frame => frame.kind === 'request'
                && frame.meaning === 'rest' && frame.catalogRule === 'rest_request');
            const walkIndex = frames.findIndex(frame => frame.kind === 'invitation'
                && frame.meaning === 'walk' && frame.catalogRule === 'walk_invitation');
            if (restIndex < 0 || walkIndex < 0 || restIndex === walkIndex) return false;
            for (const [index, kind, meaning] of [[restIndex, 'request', 'rest'], [walkIndex, 'invitation', 'walk']]) {
                const frame = frames[index], u = understandings[index];
                if (!equal(frame.relations, [kind])
                    || ['conditionMeaning', 'subject', 'conditionSubject', 'roles', 'target', 'time', 'application', 'proposalKind']
                        .some(key => Object.hasOwn(frame, key))
                    || ![kind, 'partial'].includes(u.kind) || u.complete !== false
                    || !Array.isArray(u.unresolved) || u.unresolved.filter(item => item.type === 'clause_scope').length !== 1
                    || u.unresolved.some(item => item.type === 'clause_scope' ? false : item.type === 'meaning'
                        ? item.field !== 'meaning' || item.token !== meaning : item.type !== 'relation' || item.id !== kind)
                    || u.polarity !== 'positive' || u.eventTime !== 'unspecified' || u.conditionStatus !== null
                    || u.target !== null || u.subject !== (u.kind === 'partial' ? null : input.speaker)
                    || Object.hasOwn(u, 'roles')) return false;
            }
            const meaningBasis = [], relationBasis = [];
            for (const [index, understanding] of understandings.entries()) {
                for (const id of Object.values(understanding.known)) {
                    const matches = before.knowledge.meanings.filter(item => item.id === id);
                    if (matches.length !== 1) return false;
                    meaningBasis.push({ index, basis: matches[0] });
                }
                for (const id of understanding.relations) {
                    const matches = before.knowledge.relations.filter(item => item.id === id
                        && (item.source === 'initial' || (understanding.relationReferences || []).some(ref => equal(ref, item))));
                    if (matches.length !== 1) return false;
                    relationBasis.push({ index, basis: matches[0] });
                }
            }
            const state = copy(before), world = copy(receipt.beforeWorld);
            if (!worldApi.validContext(state, world) || !worldApi.validSelections(state, world, catalog)) return false;
            const focus = before.context.lastOutput, referencedExperiences = [];
            if (focus?.topic && focus.evidence.experienceId !== null) {
                const matches = world.experiences.filter(item => item.id === focus.evidence.experienceId);
                if (matches.length !== 1 || !equal(matches[0], focus.evidence.activity)) return false;
                referencedExperiences.push(matches[0]);
            }
            const expected = core.receive(state, input.raw, catalog,
                { locale: input.locale, speaker: input.speaker, at: input.at });
            if (!equal(expected, result)) return false;
            const reply = worldApi.respond(world, expected, state, catalog);
            if (!equal(reply, receipt.reply) || !equal(state, receipt.afterState) || !equal(world, receipt.afterWorld)
                || !worldApi.validContext(state, world) || !worldApi.validSelections(state, world, catalog)
                || !equal(before.experiences, state.experiences)
                || !equal(receipt.beforeWorld.experiences, world.experiences)
                || !equal(before.selectionSources, state.selectionSources)) return false;
            if (!equal(before.knowledge, state.knowledge)) return false;
            const turns = state.context.turns.filter(turn => turn.id === input.id);
            if (turns.length !== 1 || ['answer', 'conditionJudgment', 'sequenceJudgment'].some(key => Object.hasOwn(turns[0], key))) return false;
            for (const field of ['mode', 'destination', 'attention', 'activityStart', 'reasons'])
                if (!equal(receipt.beforeWorld[field], world[field])) return false;
            record = copy({ kind: 'rest_and_walk_clause_proposal', occurrenceId: `rest_and_walk_clause_proposal:${input.id}`,
                sourceId: input.id, captured: {
                    sources: { input, frames, originalOutput: focus || null, referencedExperiences,
                        scene: before.context.scene, attention: before.context.attention,
                        state: { before, after: receipt.afterState },
                        activity: { before: receipt.beforeWorld, after: receipt.afterWorld } },
                    inputKnowledge: receipt.inputKnowledge, inputContext: receipt.inputContext,
                    restIndex, walkIndex, understandings,
                    missingBefore: understandings.map(item => item.unresolved), meaningBasis, relationBasis,
                    understandingStatus: 'incomplete', actualSpeaker: input.speaker,
                    originalResult: result, originalLearning: result.learning, originalTransfer: result.transfer,
                    knowledgeChanged: !equal(before.knowledge, state.knowledge),
                    response: reply, expression: result.expression, speechSetting: before.settings.speech,
                    actualSpeech: result.expression.channel === 'speech' && !reply.observation,
                    observationResponse: !!reply.observation, answerRecorded: false, turnAnswer: null,
                    compliance: null, actionDecisionRecorded: false,
                    conditionJudgmentRecorded: false, conditionJudgment: null,
                    sequenceJudgmentRecorded: false, sequenceJudgment: null, actionOrder: null,
                    actualParticipation: false, completedExperience: null, desire: null, refusal: null,
                    newTeaching: false, newLearning: false, newExperience: false } });
        } catch (_) { return false; }
        return buffer.retain(record);
    }
    return Object.freeze({ create, capture });
});
