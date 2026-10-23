(function (root, factory) {
    const node = typeof module === 'object' && module.exports;
    const api = factory(node ? require('./experimental_word_learning_core') : root.ExperimentalWordLearning,
        node ? require('./experimental_word_learning_world') : root.ExperimentalWordWorld,
        node ? require('./experimental_word_learning_catalog.json') : root.ExperimentalWordDiaryCompleteOtherSpeakerConditionalRestProposalsCatalog);
    if (node) module.exports = api;
    else root.ExperimentalWordDiaryCompleteOtherSpeakerConditionalRestProposals = api;
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
    // Original understanding and this hearing's sensory judgment are separate.
    // Replaying copied evidence cannot supply consent, action or learned scope.
    function create() {
        const records = [];
        function retain(record) {
            if (!jsonData(record) || record?.kind !== 'complete_other_speaker_conditional_rest_proposal'
                || !/^input:[1-9]\d*$/.test(record.sourceId)
                || !Number.isSafeInteger(Number(record.sourceId.slice(6)))
                || record.occurrenceId !== `complete_other_speaker_conditional_rest_proposal:${record.sourceId}`
                || !record.captured || Array.isArray(record.captured) || typeof record.captured !== 'object') {
                throw new TypeError('Invalid complete other-speaker conditional rest proposal material');
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
            const roles = { proposer: 'player', addressee: 'self', actors: ['self'], status: 'proposed', actualParticipation: false };
            if (!catalog.conditionTeaching[input.locale] || !Number.isSafeInteger(before.serial) || before.serial < 0
                || input.id !== `input:${before.serial + 1}` || !Number.isFinite(input.at)
                || typeof input.raw !== 'string' || !input.raw.trim()
                || typeof input.speaker !== 'string' || !input.speaker || input.speaker === 'player'
                || input.scene !== before.context.scene || !equal(input, receipt.input)
                || !equal(before.knowledge, receipt.inputKnowledge) || !equal(before.context, receipt.inputContext)
                || result.interpretations.length !== 1 || result.understandings.length !== 1
                || frame.kind !== 'conditional_proposal' || frame.subject !== 'self' || frame.meaning !== 'rest'
                || frame.conditionSubject !== 'self' || frame.conditionMeaning !== 'tired'
                || frame.proposalKind !== 'request' || frame.application !== 'when_met' || frame.duration !== 'unspecified'
                || !equal(frame.roles, roles) || !equal(frame.relations, ['request', 'condition'])
                || frame.demonstratedStatus !== undefined || u.kind !== 'conditional_proposal'
                || u.complete !== true || !equal(u.unresolved, []) || !equal(u.known, { meaning: 'rest', conditionMeaning: 'tired' })
                || !equal(u.relations, ['request', 'condition']) || !equal(u.roles, { ...roles, proposer: input.speaker })
                || u.subject !== 'self' || u.conditionStatus !== 'unknown' || u.polarity !== 'positive'
                || u.eventTime !== 'unspecified' || u.target !== null || u.applications || u.contextReference
                || u.answerReference || u.reportSource || result.relationLearning || result.sequenceJudgment
                || !result.conditionJudgment) return false;
            const meaningBasis = [], relationBasis = [];
            for (const id of ['rest', 'tired']) {
                const matches = before.knowledge.meanings.filter(item => item.id === id);
                if (matches.length !== 1) return false;
                meaningBasis.push(matches[0]);
            }
            for (const id of ['request', 'condition']) {
                const matches = before.knowledge.relations.filter(item => item.id === id
                    && (item.source === 'initial' || (u.relationReferences || []).some(ref => equal(ref, item))));
                if (matches.length !== 1) return false;
                relationBasis.push(matches[0]);
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
            // respond records the actual judgment in both result and turn.
            const reply = worldApi.respond(world, expected, state, catalog);
            if (!equal(expected, result) || !equal(reply, receipt.reply)
                || !equal(state, receipt.afterState) || !equal(world, receipt.afterWorld)
                || !worldApi.validContext(state, world) || !worldApi.validSelections(state, world, catalog)
                || !equal(before.knowledge, state.knowledge) || !equal(before.experiences, state.experiences)
                || !equal(receipt.beforeWorld.experiences, world.experiences)
                || !equal(before.selectionSources, state.selectionSources)) return false;
            const turns = state.context.turns.filter(turn => turn.id === input.id);
            if (turns.length !== 1 || Object.hasOwn(turns[0], 'answer')
                || !equal(turns[0].conditionJudgment, result.conditionJudgment)) return false;
            for (const field of ['mode', 'destination', 'attention', 'activityStart', 'reasons'])
                if (!equal(receipt.beforeWorld[field], world[field])) return false;
            record = copy({ kind: 'complete_other_speaker_conditional_rest_proposal',
                occurrenceId: `complete_other_speaker_conditional_rest_proposal:${input.id}`, sourceId: input.id,
                captured: {
                    sources: { input, frame, originalOutput: focus || null, referencedExperiences,
                        scene: before.context.scene, attention: before.context.attention,
                        state: { before, after: receipt.afterState },
                        activity: { before: receipt.beforeWorld, after: receipt.afterWorld } },
                    inputKnowledge: before.knowledge, inputContext: before.context, understanding: u,
                    meaningBasis, relationBasis, actualSpeaker: input.speaker,
                    response: reply, expression: result.expression, speechSetting: before.settings.speech,
                    actualSpeech: result.expression.channel === 'speech' && !reply.observation,
                    observationResponse: !!reply.observation, answerRecorded: false, turnAnswer: null,
                    conditionJudgmentRecorded: true, conditionJudgment: result.conditionJudgment,
                    observation: result.conditionJudgment.observation,
                    compliance: null, actionDecisionRecorded: false,
                    actualParticipation: false, completedExperience: null, desire: null, refusal: null,
                    newTeaching: false, newLearning: false, newExperience: false } });
        } catch (_) { return false; }
        return buffer.retain(record);
    }
    return Object.freeze({ create, capture });
});
