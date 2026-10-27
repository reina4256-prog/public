(function (root, factory) {
    const node = typeof module === 'object' && module.exports;
    const api = factory(node ? require('./experimental_word_learning_core') : root.ExperimentalWordLearning,
        node ? require('./experimental_word_learning_world') : root.ExperimentalWordWorld,
        node ? require('./experimental_word_learning_catalog.json') : root.ExperimentalWordDiaryMultipleCompleteNamingsCatalog);
    if (node) module.exports = api;
    else root.ExperimentalWordDiaryMultipleCompleteNamings = api;
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
    // Independent occurrence material only. No game, notebook or storage caller.
    function create() {
        const records = [];
        function retain(record) {
            if (!jsonData(record) || record?.kind !== 'multiple_complete_naming'
                || !/^input:[1-9]\d*$/.test(record.sourceId)
                || !Number.isSafeInteger(Number(record.sourceId.slice(6)))
                || record.occurrenceId !== `multiple_complete_naming:${record.sourceId}`
                || !record.captured || Array.isArray(record.captured) || typeof record.captured !== 'object') {
                throw new TypeError('Invalid multiple complete naming material');
            }
            if (records.some(item => item.occurrenceId === record.occurrenceId)) return false;
            records.push(copy(record)); return true;
        }
        return Object.freeze({ retain, read: () => copy(records) });
    }
    // Validate an actual preceding occurrence without recursively requiring its ancestry.
    function replaySource(result, receipt) {
        const input = result?.input, before = receipt?.beforeState;
        if (!input || !jsonData(result) || !jsonData(receipt) || !Number.isSafeInteger(before?.serial)
            || before.serial < 0 || before.serial === Number.MAX_SAFE_INTEGER
            || input.id !== `input:${before.serial + 1}` || !Number.isFinite(input.at)
            || typeof input.speaker !== 'string' || !input.speaker || input.scene !== before.context.scene
            || !equal(input, receipt.input) || !equal(before.knowledge, receipt.inputKnowledge)
            || !equal(before.context, receipt.inputContext)) return false;
        const state = copy(before), world = copy(receipt.beforeWorld);
        if (!worldApi.validContext(state, world) || !worldApi.validSelections(state, world, catalog)) return false;
        const expected = core.receive(state, input.raw, catalog,
            { locale: input.locale, speaker: input.speaker, at: input.at });
        if (!equal(expected, result)) return false;
        const reply = worldApi.respond(world, expected, state, catalog);
        return equal(reply, receipt.reply) && equal(state, receipt.afterState) && equal(world, receipt.afterWorld)
            && worldApi.validContext(state, world) && worldApi.validSelections(state, world, catalog);
    }
    function capture(buffer, result, receipt) {
        let record;
        try {
            if (!jsonData(result) || !jsonData(receipt)) return false;
            const input = result.input, before = receipt.beforeState;
            const frames = result.interpretations, understandings = result.understandings;
            if (input.locale !== 'ja' || !Number.isSafeInteger(before.serial) || before.serial < 0
                || before.serial === Number.MAX_SAFE_INTEGER || input.id !== `input:${before.serial + 1}`
                || !Number.isFinite(input.at) || typeof input.raw !== 'string' || !input.raw.trim()
                || typeof input.speaker !== 'string' || !input.speaker || input.scene !== before.context.scene
                || !equal(input, receipt.input) || !equal(before.knowledge, receipt.inputKnowledge)
                || !equal(before.context, receipt.inputContext) || frames.length < 2
                || understandings.length !== frames.length || frames.some(frame => frame.kind !== 'naming' || !['name', 'name_description', 'name_answer'].includes(frame.catalogRule))
                || understandings.some(u => u.kind !== 'naming' || u.complete !== true)
                || result.relationLearning || result.conditionJudgment || result.sequenceJudgment) return false;
            // Each clause must independently satisfy the existing unique naming contract.
            // Never pick one clause, collapse repetition or turn association into a general name.
            if (!Array.isArray(result.learning) || result.learning.length !== frames.length) return false;
            for (const [index, frame] of frames.entries()) {
                const target = understandings[index].target?.adopted?.id, learning = result.learning[index];
                const adopted = learning?.adopted, candidate = learning?.candidates?.[0];
                if (!target || !before.context.attention.some(item => item.id === target)
                    || learning?.candidates?.length !== 1 || !Array.isArray(learning.updated)
                    || adopted?.source !== 'explanation' || adopted.word !== frame.word
                    || adopted.target !== target || adopted.speaker !== input.speaker
                    || candidate?.source !== 'explanation' || candidate.word !== adopted.word
                    || candidate.target !== target || candidate.speaker !== adopted.speaker) return false;
            }
            const previous = before.context.turns.at(-1), antecedent = receipt.antecedent;
            if (previous) {
                if (!antecedent || !replaySource(antecedent.result, antecedent.receipt)
                    || antecedent.result.input.id !== previous.id || previous.id !== `input:${before.serial}`
                    || antecedent.result.input.at > input.at
                    || !equal(antecedent.receipt.afterState.context.turns.at(-1), previous)) return false;
            } else if (antecedent !== undefined && antecedent !== null) return false;
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
            // Preserve actual naming association and record effects, including empty
            // updates on repetition. Capturing never creates teaching or learning.
            for (const key of new Set([...Object.keys(before.knowledge), ...Object.keys(state.knowledge)]))
                if (key !== 'associations' && !equal(before.knowledge[key], state.knowledge[key])) return false;
            for (const field of ['correctionLessons', 'feelingLearning'])
                if (!equal(before[field], state[field])) return false;
            const turns = state.context.turns.filter(turn => turn.id === input.id);
            if (turns.length !== 1 || ['conditionJudgment', 'sequenceJudgment'].some(key => Object.hasOwn(turns[0], key))) return false;
            for (const field of ['mode', 'destination', 'attention', 'activityStart', 'reasons'])
                if (!equal(receipt.beforeWorld[field], world[field])) return false;
            const indices = predicate => frames.flatMap((frame, index) => predicate(frame) ? [index] : []);
            record = copy({ kind: 'multiple_complete_naming', occurrenceId: `multiple_complete_naming:${input.id}`,
                sourceId: input.id, captured: {
                    sources: { input, frames, antecedent: antecedent || null, antecedentRecorded: !!previous, originalOutput: focus || null, referencedExperiences,
                        scene: before.context.scene, attention: before.context.attention,
                        state: { before, after: receipt.afterState },
                        activity: { before: receipt.beforeWorld, after: receipt.afterWorld } },
                    inputKnowledge: receipt.inputKnowledge, inputContext: receipt.inputContext,
                    clauseIndices: frames.map((_, index) => index), understandings,
                    clauses: frames.map((frame, index) => ({ index, span: frame.span, frame,
                        understanding: understandings[index] })),
                    namingIndices: indices(frame => frame.kind === 'naming'),
                    namingDetails: frames.map((frame, index) => ({ index, word: frame.word,
                        target: understandings[index].target, learning: result.learning[index] })),
                    missingBefore: understandings.map(item => item.unresolved), meaningBasis, relationBasis,
                    understandingStatus: 'per_clause', actualSpeaker: input.speaker,
                    originalResult: result, originalLearning: result.learning, originalTransfer: result.transfer,
                    knowledgeChanged: !equal(before.knowledge, state.knowledge),
                    response: reply, expression: result.expression, speechSetting: before.settings.speech,
                    actualSpeech: result.expression.channel === 'speech' && !reply.observation,
                    observationResponse: !!reply.observation, answerRecorded: Object.hasOwn(turns[0], 'answer'),
                    turnAnswer: Object.hasOwn(turns[0], 'answer') ? turns[0].answer : null,
                    compliance: null, actionDecisionRecorded: false,
                    conditionJudgmentRecorded: false, conditionJudgment: null,
                    sequenceJudgmentRecorded: false, sequenceJudgment: null, actionOrder: null,
                    actualParticipation: false, completedExperience: null, desire: null, refusal: null,
                    captureAddsTeaching: false, captureAddsLearning: false, captureAddsExperience: false } });
        } catch (_) { return false; }
        return buffer.retain(record);
    }
    return Object.freeze({ create, capture });
});
