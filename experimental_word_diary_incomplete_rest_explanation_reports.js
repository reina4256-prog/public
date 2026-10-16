(function (root, factory) {
    const node = typeof module === 'object' && module.exports;
    const api = factory(node ? require('./experimental_word_learning_core') : root.ExperimentalWordLearning,
        node ? require('./experimental_word_learning_world') : root.ExperimentalWordWorld,
        node ? require('./experimental_word_learning_catalog.json') : root.ExperimentalWordDiaryIncompleteRestExplanationReportsCatalog);
    if (node) module.exports = api;
    else root.ExperimentalWordDiaryIncompleteRestExplanationReports = api;
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
    // Report is a material category. Missing understanding and sources stay missing.
    // Preserve the existing prior-rest gate without inventing a causal reference.
    function capture(buffer, result, receipt) {
        let record;
        try {
            if (!jsonData(result) || !jsonData(receipt)) return false;
            const input = result.input, before = receipt.beforeState;
            const frame = result.interpretations[0], u = result.understandings[0];
            if (input.locale !== 'ja' || result.interpretations.length !== 1 || result.understandings.length !== 1
                || frame.kind !== 'report' || frame.catalogRule !== 'rest_explanation'
                || frame.meaning !== 'rest' || frame.detail !== 'recovery_explanation'
                || !['report', 'partial'].includes(u.kind) || u.complete !== false) return false;
            const missingMeaningsBefore = u.unresolved.filter(item => item.type === 'meaning');
            const missingRelationsBefore = u.unresolved.filter(item => item.type === 'relation').map(item => item.id);
            if (!missingMeaningsBefore.length && !missingRelationsBefore.length) return false;
            const antecedent = receipt.antecedent;
            if (!antecedent || Object.hasOwn(antecedent.receipt, 'antecedent')
                || !replay(antecedent.result, antecedent.receipt)
                || antecedent.result.input.id !== `input:${before.serial}`
                || !equal(before.context.turns.at(-1), antecedent.receipt.afterState.context.turns.at(-1))
                || !antecedent.result.understandings.some(item => item.known.meaning === 'rest')
                || !replay(result, receipt)) return false;
            record = copy({ kind: 'report', occurrenceId: `incomplete_rest_explanation_report:${input.id}`, sourceId: input.id, captured: {
                sources: { input, frame, antecedent, scene: before.context.scene, attention: before.context.attention,
                    state: { before, after: receipt.afterState },
                    activity: { before: receipt.beforeWorld, after: receipt.afterWorld } },
                inputKnowledge: before.knowledge, inputContext: before.context, understanding: u,
                ...(Object.hasOwn(u, 'reportSource') ? { reportSource: u.reportSource } : {}),
                meaningKnownBefore: u.known.meaning === 'rest',
                relationsKnownBefore: missingRelationsBefore.length === 0,
                missingMeaningsBefore, missingRelationsBefore,
                response: receipt.reply, actualSpeech: before.settings.speech === 'short',
                newTeaching: false, newLearning: false, newExperience: false } });
        } catch (_) { return false; }
        return buffer.retain(record);
    }
    return Object.freeze({ capture });
});
