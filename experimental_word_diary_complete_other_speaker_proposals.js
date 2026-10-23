(function (root, factory) {
    const node = typeof module === 'object' && module.exports;
    const api = factory(node ? require('./experimental_word_learning_core') : root.ExperimentalWordLearning,
        node ? require('./experimental_word_learning_world') : root.ExperimentalWordWorld,
        node ? require('./experimental_word_learning_catalog.json') : root.ExperimentalWordDiaryCompleteOtherSpeakerProposalsCatalog);
    if (node) module.exports = api;
    else root.ExperimentalWordDiaryCompleteOtherSpeakerProposals = api;
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
        const valid = Reflect.ownKeys(value).every(name => typeof name === 'string')
            && (Array.isArray(value) ? Array.from(value) : Object.values(value)).every(item => jsonData(item, ancestors));
        ancestors.delete(value); return valid;
    }
    // Occurrence material only. Replay never changes the caller's state,
    // transfers learned scope, or supplies missing roles, participation or desire.
    function create() {
        const records = [];
        function retain(record) {
            if (!jsonData(record) || record?.kind !== 'complete_other_speaker_proposal'
                || !/^input:[1-9]\d*$/.test(record.sourceId)
                || !Number.isSafeInteger(Number(record.sourceId.slice(6)))
                || record.occurrenceId !== `complete_other_speaker_proposal:${record.sourceId}`
                || !record.captured || Array.isArray(record.captured) || typeof record.captured !== 'object') {
                throw new TypeError('Invalid complete other-speaker proposal material');
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
            if (!catalog.patterns[input.locale] || !Number.isSafeInteger(before.serial) || before.serial < 0
                || input.id !== `input:${before.serial + 1}` || !Number.isFinite(input.at)
                || typeof input.raw !== 'string' || !input.raw.trim()
                || typeof input.speaker !== 'string' || !input.speaker || input.speaker === 'player'
                || input.scene !== before.context.scene || !equal(input, receipt.input)
                || !equal(before.knowledge, receipt.inputKnowledge) || !equal(before.context, receipt.inputContext)
                || result.interpretations.length !== 1 || result.understandings.length !== 1
                || !['request', 'invitation'].includes(frame.kind) || !['rest', 'walk'].includes(frame.meaning)
                || frame.catalogRule && !['rest', 'rest_request', 'rest_invitation', 'walk_invitation'].includes(frame.catalogRule)
                || !frame.catalogRule && frame.proposalKind !== frame.kind
                || frame.meaning === 'walk' && (input.locale !== 'ja' || frame.catalogRule !== 'walk_invitation')
                || frame.conditionMeaning || frame.eventMeaning || frame.target || frame.time
                || !equal(frame.relations, [frame.kind]) || u.kind !== frame.kind
                || u.complete !== true || !equal(u.unresolved, []) || !equal(u.known, { meaning: frame.meaning })
                || !equal(u.relations, [frame.kind]) || u.polarity !== 'positive' || u.eventTime !== 'unspecified'
                || u.conditionStatus !== null || u.target !== null || u.applications || u.contextReference || u.answerReference
                || result.relationLearning || result.conditionJudgment || result.sequenceJudgment) return false;
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
                || !equal(before.knowledge, state.knowledge) || !equal(before.experiences || [], state.experiences || [])
                || !equal(receipt.beforeWorld.experiences, world.experiences)) return false;
            const turns = state.context.turns.filter(turn => turn.id === input.id);
            if (turns.length !== 1 || Object.hasOwn(turns[0], 'answer')) return false;
            const meaningBasis = before.knowledge.meanings.filter(item => item.id === frame.meaning);
            const relationBasis = before.knowledge.relations.filter(item => item.id === frame.kind
                && (item.source === 'initial' || (u.relationReferences || []).some(ref => equal(ref, item))));
            if (meaningBasis.length !== 1 || relationBasis.length !== 1) return false;
            const prior = receipt.beforeWorld;
            const interested = prior.mode === 'eat' || prior.mode === 'work'
                || typeof prior.attention === 'string' && prior.attention.startsWith('berry:') && prior.dwell > 4;
            const target = frame.meaning === 'rest' ? 'shade' : 'path';
            const choseNow = world.mode === 'move' && world.destination === target
                && world.reasons.some(reason => reason.kind === 'understood_suggestion' && reason.inputId === input.id);
            const outcome = interested ? 'continuing' : choseNow ? 'approaching' : 'not_started';
            const selected = (state.selectionSources || []).filter(source => source.input.id === input.id);
            if (selected.length !== Number(outcome === 'approaching' && frame.meaning === 'rest')) return false;
            record = copy({ kind: 'complete_other_speaker_proposal', occurrenceId: `complete_other_speaker_proposal:${input.id}`,
                sourceId: input.id, captured: {
                    sources: { input, frame, originalOutput: focus || null, referencedExperiences,
                        scene: before.context.scene, attention: before.context.attention,
                        state: { before, after: receipt.afterState }, activity: { before: prior, after: receipt.afterWorld } },
                    inputKnowledge: before.knowledge, inputContext: before.context, understanding: u,
                    meaningBasis: meaningBasis[0], relationBasis, actualSpeaker: input.speaker,
                    expression: result.expression, response: reply, speechSetting: before.settings.speech,
                    actualSpeech: result.expression.channel === 'speech' && !reply.observation,
                    observationResponse: !!reply.observation, answerRecorded: false, turnAnswer: null,
                    decision: { outcome, response: reply, selectedSource: selected[0] || null,
                        beforeSelections: before.selectionSources || [], afterSelections: state.selectionSources || [] },
                    actualParticipation: false, completedExperience: null, desire: null, refusal: null,
                    newTeaching: false, newLearning: false, newExperience: false } });
        } catch (_) { return false; }
        return buffer.retain(record);
    }
    return Object.freeze({ create, capture });
});
