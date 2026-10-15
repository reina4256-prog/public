(function (root, factory) {
    const node = typeof module === 'object' && module.exports;
    const api = factory(node ? require('./experimental_word_learning_core') : root.ExperimentalWordLearning,
        node ? require('./experimental_word_learning_world') : root.ExperimentalWordWorld,
        node ? require('./experimental_word_learning_catalog.json') : root.ExperimentalWordDiaryGreetingsCatalog);
    if (node) module.exports = api;
    else root.ExperimentalWordDiaryGreetings = api;
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
    // Disposable occurrence material, separate from the five candidate kinds.
    function create() {
        const records = [];
        function retain(record) {
            if (!record || record.kind !== 'greeting' || !/^input:[1-9]\d*$/.test(record.sourceId)
                || !Number.isSafeInteger(Number(record.sourceId.slice(6)))
                || record.occurrenceId !== `greeting:${record.sourceId}` || !record.captured
                || Array.isArray(record.captured) || typeof record.captured !== 'object' || !jsonData(record)) {
                throw new TypeError('Invalid greeting material');
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
            if (input.locale !== 'ja' || !Number.isSafeInteger(before.serial) || before.serial < 0
                || input.id !== `input:${before.serial + 1}` || !Number.isFinite(input.at)
                || typeof input.speaker !== 'string' || !input.speaker || input.scene !== before.context.scene
                || !equal(input, receipt.input) || !equal(before.knowledge, receipt.inputKnowledge)
                || !equal(before.context, receipt.inputContext)
                || result.interpretations.length !== 1 || result.understandings.length !== 1
                || frame.kind !== 'greeting' || frame.catalogRule !== 'greeting_morning'
                || u.kind !== 'greeting' || !u.complete || u.unresolved.length) return false;
            const state = copy(before), world = copy(receipt.beforeWorld);
            const expected = core.receive(state, input.raw, catalog,
                { locale: input.locale, speaker: input.speaker, at: input.at });
            if (!equal(expected, result)) return false;
            const reply = worldApi.respond(world, expected, state, catalog);
            const actualSpeech = before.settings.speech === 'short';
            if (!equal(reply, receipt.reply) || !equal(state, receipt.afterState) || !equal(world, receipt.afterWorld)
                || reply.message !== (actualSpeech ? 'good_morning' : 'attend') || reply.observation) return false;
            record = copy({ kind: 'greeting', occurrenceId: `greeting:${input.id}`, sourceId: input.id, captured: {
                sources: { input, frame, scene: before.context.scene, attention: before.context.attention,
                    activity: { before: receipt.beforeWorld, after: receipt.afterWorld } },
                inputKnowledge: before.knowledge, understanding: u, response: reply, actualSpeech,
                newTeaching: false, newLearning: false, newExperience: false, morningVerified: false } });
        } catch (_) { return false; }
        return buffer.retain(record);
    }
    return Object.freeze({ create, capture });
});
