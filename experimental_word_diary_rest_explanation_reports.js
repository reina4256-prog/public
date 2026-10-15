(function (root, factory) {
    const node = typeof module === 'object' && module.exports;
    const api = factory(node ? require('./experimental_word_learning_core') : root.ExperimentalWordLearning,
        node ? require('./experimental_word_learning_world') : root.ExperimentalWordWorld,
        node ? require('./experimental_word_learning_catalog.json') : root.ExperimentalWordDiaryRestExplanationReportsCatalog);
    if (node) module.exports = api;
    else root.ExperimentalWordDiaryRestExplanationReports = api;
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
    // The existing reason relation does not resolve the recovery explanation.
    // Replay the separate prior input without inventing a causal reference.
    function replay(result, receipt) {
        const input = result.input, before = receipt.beforeState;
        if (!Number.isSafeInteger(before.serial) || before.serial < 0
            || input.id !== `input:${before.serial + 1}` || !Number.isFinite(input.at)
            || typeof input.speaker !== 'string' || !input.speaker || input.scene !== before.context.scene
            || !equal(input, receipt.input) || !equal(before.knowledge, receipt.inputKnowledge)
            || !equal(before.context, receipt.inputContext)) return false;
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
            if (!jsonData(result) || !jsonData(receipt)) return false;
            const input = result.input, before = receipt.beforeState;
            const frame = result.interpretations[0], u = result.understandings[0];
            if (input.locale !== 'ja' || !Number.isSafeInteger(before.serial) || before.serial < 0
                || input.id !== `input:${before.serial + 1}` || !Number.isFinite(input.at)
                || typeof input.speaker !== 'string' || !input.speaker || input.scene !== before.context.scene
                || !equal(input, receipt.input) || !equal(before.knowledge, receipt.inputKnowledge)
                || !equal(before.context, receipt.inputContext)
                || result.interpretations.length !== 1 || result.understandings.length !== 1
                || frame.kind !== 'report' || frame.catalogRule !== 'rest_explanation'
                || frame.meaning !== 'rest' || frame.detail !== 'recovery_explanation'
                || u.kind !== 'report' || u.complete !== false
                || !equal(u.unresolved, [{ type: 'detail', token: 'recovery_explanation' }])
                || !equal(u.known, { meaning: 'rest' }) || !equal(u.relations, ['report', 'reason'])
                || u.aspect !== null || u.conditionStatus !== null
                || u.subject !== input.speaker || u.polarity !== 'positive' || u.eventTime !== 'unspecified'
                || !equal(u.reportSource, { kind: 'speaker_report', inputId: input.id, heardAt: input.at })) return false;
            const antecedent = receipt.antecedent;
            if (!antecedent || Object.hasOwn(antecedent.receipt, 'antecedent')
                || !replay(antecedent.result, antecedent.receipt)
                || antecedent.result.input.id !== `input:${before.serial}`
                || !equal(before.context.turns.at(-1), antecedent.receipt.afterState.context.turns.at(-1))
                || !antecedent.result.understandings.some(item => item.known.meaning === 'rest')
                || !replay(result, receipt)) return false;
            const reply = receipt.reply, actualSpeech = before.settings.speech === 'short';
            if (reply.message !== (actualSpeech ? 'heard_rest_partial' : 'attend') || reply.observation) return false;
            record = copy({ kind: 'report', occurrenceId: `rest_explanation_report:${input.id}`, sourceId: input.id, captured: {
                sources: { input, frame, antecedent, scene: before.context.scene, attention: before.context.attention,
                    activity: { before: receipt.beforeWorld, after: receipt.afterWorld } },
                inputKnowledge: before.knowledge, understanding: u, reportSource: u.reportSource,
                response: reply, actualSpeech, status: 'reported', verified: false,
                newTeaching: false, newLearning: false, newExperience: false } });
        } catch (_) { return false; }
        return buffer.retain(record);
    }
    return Object.freeze({ capture });
});
