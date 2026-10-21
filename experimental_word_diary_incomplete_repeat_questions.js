(function (root, factory) {
    const node = typeof module === 'object' && module.exports;
    const api = factory(node ? require('./experimental_word_learning_core') : root.ExperimentalWordLearning,
        node ? require('./experimental_word_learning_world') : root.ExperimentalWordWorld,
        node ? require('./experimental_word_learning_catalog.json') : root.ExperimentalWordDiaryIncompleteRepeatQuestionsCatalog);
    if (node) module.exports = api;
    else root.ExperimentalWordDiaryIncompleteRepeatQuestions = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (core, worldApi, catalog) {
    'use strict';
    const copy = value => JSON.parse(JSON.stringify(value));
    const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    const serial = id => typeof id === 'string' && /^input:[1-9]\d*$/.test(id) && Number.isSafeInteger(Number(id.slice(6)))
        ? Number(id.slice(6)) : NaN;
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
    // Independent input-time evidence. A referenced answer is not a new answer.
    // No game caller, candidate-kind extension, learning rule or save schema.
    function create() {
        const records = [];
        function retain(record) {
            if (!jsonData(record) || record?.kind !== 'incomplete_repeat_question'
                || !Number.isFinite(serial(record.sourceId))
                || record.occurrenceId !== `incomplete_repeat_question:${record.sourceId}`
                || !record.captured || Array.isArray(record.captured) || typeof record.captured !== 'object') {
                throw new TypeError('Invalid incomplete repeat question material');
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
                || frame.kind !== 'question' || frame.slot !== 'repeat_answer' || frame.catalogRule !== 'context_repeat'
                || !['question', 'partial'].includes(u.kind) || u.complete !== false || !u.unresolved.length
                || !u.unresolved.some(item => item.type === 'relation' && item.id === 'question')
                || Object.hasOwn(u, 'reportSource') || u.contextReference || !u.answerReference) return false;
            const previous = before.context.turns.at(-1), answer = previous?.answer;
            const output = before.context.lastOutput || null;
            if (!previous || previous.speaker !== input.speaker || !answer || answer.subject !== 'self'
                || !Number.isFinite(serial(previous.id)) || serial(previous.id) > before.serial
                || frame.replyTo !== previous.id || u.answerReference.turnId !== previous.id
                || !equal(u.answerReference, { turnId: previous.id, subject: answer.subject,
                    eventTime: answer.eventTime, source: answer.source })
                || !Number.isFinite(serial(answer.source?.inputId)) || serial(answer.source.inputId) > serial(previous.id)
                || !Number.isFinite(answer.source.answeredAt) || answer.source.answeredAt > input.at
                || !worldApi.validContext(before, receipt.beforeWorld)
                || output && (output.inputId !== previous.id || output.deliveryKind !== 'speech'
                    || output.serial !== before.serial || output.listener !== input.speaker || output.subject !== 'self')) return false;
            const referencedExperiences = [];
            const ids = [answer.source.experienceId, output?.evidence?.experienceId].filter(id => id != null);
            for (const id of new Set(ids)) {
                const matches = receipt.beforeWorld.experiences.filter(e => e.id === id);
                if (matches.length !== 1 || output?.evidence?.experienceId === id && !equal(matches[0], output.evidence.activity)) return false;
                referencedExperiences.push(matches[0]);
            }
            const state = copy(before), world = copy(receipt.beforeWorld);
            const expected = core.receive(state, input.raw, catalog,
                { locale: input.locale, speaker: input.speaker, at: input.at });
            if (!equal(expected, result)) return false;
            const reply = worldApi.respond(world, expected, state, catalog);
            if (reply.message !== 'attend' || !equal(reply, receipt.reply)
                || !equal(state, receipt.afterState) || !equal(world, receipt.afterWorld)) return false;
            const turns = state.context.turns.filter(turn => turn.id === input.id);
            if (!worldApi.validContext(state, world) || turns.length !== 1 || Object.hasOwn(turns[0], 'answer')) return false;
            record = copy({ kind: 'incomplete_repeat_question', occurrenceId: `incomplete_repeat_question:${input.id}`,
                sourceId: input.id, captured: {
                    sources: { input, frame, previousTurn: previous, originalAnswer: answer, originalOutput: output,
                        referencedExperiences, scene: before.context.scene, attention: before.context.attention,
                        state: { before, after: receipt.afterState },
                        activity: { before: receipt.beforeWorld, after: receipt.afterWorld } },
                    inputKnowledge: before.knowledge, inputContext: before.context, understanding: u,
                    missingRelationsBefore: u.unresolved.filter(item => item.type === 'relation').map(item => item.id),
                    missingMeaningsBefore: u.unresolved.filter(item => item.type === 'meaning').map(item => item.token),
                    response: reply, expression: result.expression, speechSetting: before.settings.speech,
                    actualSpeech: result.expression.channel === 'speech', actualAnswer: false, turnAnswer: null,
                    newTeaching: false, newLearning: false, newExperience: false } });
        } catch (_) { return false; }
        return buffer.retain(record);
    }
    return Object.freeze({ create, capture });
});
