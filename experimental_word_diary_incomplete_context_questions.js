(function (root, factory) {
    const node = typeof module === 'object' && module.exports;
    const api = factory(node ? require('./experimental_word_learning_core') : root.ExperimentalWordLearning,
        node ? require('./experimental_word_learning_world') : root.ExperimentalWordWorld,
        node ? require('./experimental_word_learning_catalog.json') : root.ExperimentalWordDiaryIncompleteContextQuestionsCatalog);
    if (node) module.exports = api;
    else root.ExperimentalWordDiaryIncompleteContextQuestions = api;
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
    // Preserve the existing incomplete context parse without completing its content.
    // No game, storage or notebook caller. This journal does not extend the five candidate kinds.
    function create() {
        const records = [];
        function retain(record) {
            if (!jsonData(record) || record?.kind !== 'incomplete_context_question'
                || !/^input:[1-9]\d*$/.test(record.sourceId)
                || !Number.isSafeInteger(Number(record.sourceId.slice(6)))
                || record.occurrenceId !== `incomplete_context_question:${record.sourceId}`
                || !record.captured || Array.isArray(record.captured) || typeof record.captured !== 'object') {
                throw new TypeError('Invalid incomplete context question material');
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
                || typeof input.speaker !== 'string' || !input.speaker || input.scene !== before.context.scene
                || !equal(input, receipt.input) || !equal(before.knowledge, receipt.inputKnowledge)
                || !equal(before.context, receipt.inputContext)
                || result.interpretations.length !== 1 || result.understandings.length !== 1
                || frame.kind !== 'question' || frame.slot !== 'context_detail' || frame.catalogRule !== 'context_detail'
                || !['question', 'partial'].includes(u.kind) || u.complete !== false || !u.unresolved.length
                || Object.hasOwn(u, 'reportSource') || !u.contextReference || u.answerReference) return false;
            const focus = before.context.lastOutput;
            if (!focus?.topic || focus.serial !== before.serial || focus.listener !== input.speaker
                || focus.subject !== 'self' || !equal(frame.contextReference, focus) || !equal(u.contextReference, focus)
                || !worldApi.validContext(before, receipt.beforeWorld)) return false;
            const referencedExperiences = [];
            if (focus.evidence.experienceId !== null) {
                const matches = receipt.beforeWorld.experiences.filter(e => e.id === focus.evidence.experienceId);
                if (matches.length !== 1 || !equal(matches[0], focus.evidence.activity)) return false;
                referencedExperiences.push(matches[0]);
            }
            const state = copy(before), world = copy(receipt.beforeWorld);
            const expected = core.receive(state, input.raw, catalog,
                { locale: input.locale, speaker: input.speaker, at: input.at });
            if (!equal(expected, result)) return false;
            const reply = worldApi.respond(world, expected, state, catalog);
            if (!equal(reply, receipt.reply) || !equal(state, receipt.afterState) || !equal(world, receipt.afterWorld)) return false;
            const turns = state.context.turns.filter(turn => turn.id === input.id);
            if (!worldApi.validContext(state, world) || turns.length !== 1 || Object.hasOwn(turns[0], 'answer')) return false;
            record = copy({ kind: 'incomplete_context_question', occurrenceId: `incomplete_context_question:${input.id}`,
                sourceId: input.id, captured: {
                    sources: { input, frame, originalOutput: focus, referencedExperiences, scene: before.context.scene, attention: before.context.attention,
                        state: { before, after: receipt.afterState },
                        activity: { before: receipt.beforeWorld, after: receipt.afterWorld } },
                    inputKnowledge: before.knowledge, inputContext: before.context, understanding: u,
                    missingRelationsBefore: u.unresolved.filter(item => item.type === 'relation').map(item => item.id),
                    missingMeaningsBefore: u.unresolved.filter(item => item.type === 'meaning').map(item => item.token),
                    response: reply, expression: result.expression, speechSetting: before.settings.speech,
                    actualSpeech: result.expression.channel === 'speech', turnAnswer: null,
                    newTeaching: false, newLearning: false, newExperience: false } });
        } catch (_) { return false; }
        return buffer.retain(record);
    }
    return Object.freeze({ create, capture });
});
