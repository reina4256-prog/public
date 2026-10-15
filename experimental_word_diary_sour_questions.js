(function (root, factory) {
    const node = typeof module === 'object' && module.exports;
    const api = factory(node ? require('./experimental_word_learning_core') : root.ExperimentalWordLearning,
        node ? require('./experimental_word_learning_world') : root.ExperimentalWordWorld,
        node ? require('./experimental_word_learning_catalog.json') : root.ExperimentalWordDiarySourQuestionsCatalog);
    if (node) module.exports = api;
    else root.ExperimentalWordDiarySourQuestions = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (core, worldApi, catalog) {
    'use strict';
    const copy = value => JSON.parse(JSON.stringify(value));
    const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    const serial = id => typeof id === 'string' && /^input:[1-9]\d*$/.test(id) ? Number(id.slice(6)) : NaN;
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
    // Partial-question speech is separate from successful answers and the five candidate kinds.
    function create() {
        const records = [];
        function retain(record) {
            if (!record || record.kind !== 'sour_question_response'
                || !Number.isSafeInteger(serial(record.sourceId))
                || record.occurrenceId !== `sour_question:${record.sourceId}` || !record.captured
                || Array.isArray(record.captured) || typeof record.captured !== 'object' || !jsonData(record)) {
                throw new TypeError('Invalid sour question material');
            }
            if (records.some(item => item.occurrenceId === record.occurrenceId)) return false;
            records.push(copy(record)); return true;
        }
        return Object.freeze({ retain, read: () => copy(records) });
    }
    function replay(result, receipt) {
        const input = result?.input, before = receipt?.beforeState;
        if (!input || !catalog.patterns[input.locale] || !Number.isSafeInteger(before?.serial) || before.serial < 0
            || input.id !== `input:${before.serial + 1}` || !Number.isFinite(input.at)
            || typeof input.speaker !== 'string' || !input.speaker || input.scene !== before.context.scene
            || !equal(input, receipt.input) || !equal(before.knowledge, receipt.inputKnowledge)
            || !equal(before.context, receipt.inputContext) || !receipt.beforeWorld) return false;
        const state = copy(before), world = copy(receipt.beforeWorld);
        const expected = core.receive(state, input.raw, catalog,
            { locale: input.locale, speaker: input.speaker, at: input.at });
        if (!equal(expected, result)) return false;
        const reply = worldApi.respond(world, expected, state, catalog);
        return equal(reply, receipt.reply) && equal(state, receipt.afterState) && equal(world, receipt.afterWorld);
    }
    function capture(buffer, result, receipt) {
        let record;
        try {
            if (!jsonData(result) || !jsonData(receipt) || !replay(result, receipt)) return false;
            const input = result.input, frame = result.interpretations[0], u = result.understandings[0];
            const before = receipt.beforeState, after = receipt.afterState, reply = receipt.reply;
            if (input.locale !== 'ja' || result.interpretations.length !== 1 || result.understandings.length !== 1
                || frame.kind !== 'question' || frame.catalogRule !== 'sour_question' || frame.slot !== 'sour_evaluation'
                || u.kind !== 'question' || u.complete !== false || u.questionSlot !== 'sour_evaluation'
                || !equal(u.unresolved, [{ type: 'detail', token: 'sour' }]) || u.known.meaning !== 'eat'
                || !equal(u.relations, ['question', 'negation']) || u.subject !== 'self'
                || u.polarity !== 'positive' || u.eventTime !== 'unspecified' || u.aspect !== null
                || u.target !== null || u.conditionStatus !== null || before.settings.speech !== 'short'
                || reply.observation || !['unknown_taste_word', 'uncertain'].includes(reply.message)) return false;
            const turns = after.context.turns.filter(turn => turn.id === input.id);
            if (turns.length !== 1 || Object.hasOwn(turns[0], 'answer')) return false;
            const meal = [...receipt.beforeWorld.experiences].reverse().find(e => e.kind === 'eat') || null;
            const sweet = before.knowledge.meanings.some(entry => entry.id === 'sweet');
            if (reply.message !== (sweet && meal?.taste?.quality === 'sweet' ? 'unknown_taste_word' : 'uncertain')) return false;
            record = copy({ kind: 'sour_question_response', occurrenceId: `sour_question:${input.id}`, sourceId: input.id,
                captured: { sources: { input, frame, scene: before.context.scene, attention: before.context.attention,
                    activity: { before: receipt.beforeWorld, after: receipt.afterWorld }, meal },
                inputKnowledge: before.knowledge, understanding: u, response: reply, responseKind: reply.message,
                actualSpeech: true, turnAnswer: null, newTeaching: false, newLearning: false, newExperience: false } });
        } catch (_) { return false; }
        return buffer.retain(record);
    }
    return Object.freeze({ create, capture });
});
