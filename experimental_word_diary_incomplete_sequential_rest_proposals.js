(function (root, factory) {
    const node = typeof module === 'object' && module.exports;
    const api = factory(node ? require('./experimental_word_learning_core') : root.ExperimentalWordLearning,
        node ? require('./experimental_word_learning_world') : root.ExperimentalWordWorld,
        node ? require('./experimental_word_learning_catalog.json') : root.ExperimentalWordDiaryIncompleteSequentialRestProposalsCatalog);
    if (node) module.exports = api;
    else root.ExperimentalWordDiaryIncompleteSequentialRestProposals = api;
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
    // Independent incomplete material, never consent, an action or a new candidate kind.
    // There is no game, notebook or storage caller.
    function create() {
        const records = [];
        function retain(record) {
            if (!jsonData(record) || record?.kind !== 'incomplete_sequential_rest_proposal'
                || !/^input:[1-9]\d*$/.test(record.sourceId)
                || !Number.isSafeInteger(Number(record.sourceId.slice(6)))
                || record.occurrenceId !== `incomplete_sequential_rest_proposal:${record.sourceId}`
                || !record.captured || Array.isArray(record.captured) || typeof record.captured !== 'object') {
                throw new TypeError('Invalid incomplete sequential rest proposal material');
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
            const frame = result.interpretations[0], u = result.understandings[0];
            if (!catalog.sequenceTeaching[input.locale] || !Number.isSafeInteger(before.serial) || before.serial < 0
                || input.id !== `input:${before.serial + 1}` || !Number.isFinite(input.at)
                || typeof input.speaker !== 'string' || !input.speaker || input.scene !== before.context.scene
                || !equal(input, receipt.input) || !equal(before.knowledge, receipt.inputKnowledge)
                || !equal(before.context, receipt.inputContext)
                || result.interpretations.length !== 1 || result.understandings.length !== 1
                || frame.kind !== 'sequential_proposal' || frame.meaning !== 'rest'
                || frame.eventMeaning !== 'eat' || frame.eventSubject !== 'self'
                || frame.proposalKind !== 'request' || frame.application !== 'after_completion'
                || frame.phase !== undefined || !equal(frame.relations, ['request', 'sequence'])
                || !['sequential_proposal', 'partial'].includes(u.kind) || u.complete !== false
                || !u.unresolved.length || u.contextReference || u.answerReference || u.reportSource
                || result.relationLearning || result.conditionJudgment || result.sequenceJudgment
                || u.conditionStatus !== null || frame.eventReference !== undefined || u.eventReference !== undefined) return false;
            const missingMeaningsBefore = u.unresolved.filter(item => item.type === 'meaning');
            const missingRelationsBefore = u.unresolved.filter(item => item.type === 'relation').map(item => item.id);
            if (!missingMeaningsBefore.some(item => item.field === 'meaning' && item.token === 'rest'
                || item.field === 'eventMeaning' && item.token === 'eat')
                && !missingRelationsBefore.some(id => ['request', 'sequence'].includes(id))) return false;
            const state = copy(before), world = copy(receipt.beforeWorld);
            if (!worldApi.validContext(state, world) || !worldApi.validSelections(state, world, catalog)) return false;
            // Preserve and verify original context evidence even when this proposal does not use it.
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
                || !worldApi.validContext(state, world) || !worldApi.validSelections(state, world, catalog)) return false;
            const turns = state.context.turns.filter(turn => turn.id === input.id);
            if (turns.length !== 1 || Object.hasOwn(turns[0], 'answer')) return false;
            record = copy({ kind: 'incomplete_sequential_rest_proposal', occurrenceId: `incomplete_sequential_rest_proposal:${input.id}`,
                sourceId: input.id, captured: {
                    sources: { input, frame, originalOutput: focus || null, referencedExperiences,
                        scene: before.context.scene, attention: before.context.attention,
                        state: { before, after: receipt.afterState },
                        activity: { before: receipt.beforeWorld, after: receipt.afterWorld } },
                    inputKnowledge: before.knowledge, inputContext: before.context, understanding: u,
                    missingMeaningsBefore, missingRelationsBefore,
                    response: reply, expression: result.expression, speechSetting: before.settings.speech,
                    actualSpeech: result.expression.channel === 'speech', answerRecorded: false, turnAnswer: null,
                    compliance: null, actionDecisionRecorded: false,
                    sequenceJudgmentRecorded: false, sequenceJudgment: null,
                    newTeaching: false, newLearning: false, newExperience: false } });
        } catch (_) { return false; }
        return buffer.retain(record);
    }
    return Object.freeze({ create, capture });
});
