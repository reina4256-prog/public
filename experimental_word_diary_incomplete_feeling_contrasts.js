(function (root, factory) {
    const node = typeof module === 'object' && module.exports;
    const api = factory(node ? require('./experimental_word_learning_core') : root.ExperimentalWordLearning,
        node ? require('./experimental_word_learning_world') : root.ExperimentalWordWorld,
        node ? require('./experimental_word_learning_catalog.json') : root.ExperimentalWordDiaryIncompleteFeelingContrastsCatalog);
    if (node) module.exports = api;
    else root.ExperimentalWordDiaryIncompleteFeelingContrasts = api;
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
    // Validate supplied material in disposable copies, never repair partial
    // understanding or claim authenticity of the supplied occurrence.
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
        try {
            if (!jsonData(result) || !jsonData(receipt) || !replay(result, receipt)) return false;
            const input = result.input, frames = result.interpretations, understandings = result.understandings;
            if (input.locale !== 'ja' || frames.length !== 2 || understandings.length !== 2) return false;
            const missingRelationsBefore = [];
            for (let index = 0; index < 2; index++) {
                const frame = frames[index], u = understandings[index];
                if (frame.kind !== 'report' || frame.catalogRule !== 'feeling_report' || frame.aspect !== 'feeling'
                    || !['sad', 'happy', 'painful', 'tired'].includes(frame.meaning)
                    || Object.hasOwn(frame, 'eventMeaning') || Object.hasOwn(frame, 'detail')
                    || !frame.relations.includes('report') || !frame.relations.includes('contrast')) return false;
                const missing = u.unresolved.filter(item => item.type === 'relation').map(item => item.id);
                const meaningKnown = Object.hasOwn(u.known, 'meaning');
                if (missing.some(id => !['report', 'time', 'contrast'].includes(id))
                    || !equal(missing, frame.relations.filter(id => missing.includes(id)))
                    || !equal(u.unresolved, [...missing.map(id => ({ type: 'relation', id })),
                        ...(meaningKnown ? [] : [{ type: 'meaning', field: 'meaning', token: frame.meaning }])])
                    || meaningKnown && u.known.meaning !== frame.meaning
                    || u.kind !== (missing.length ? 'partial' : 'report') || u.complete !== (u.unresolved.length === 0)
                    || !equal(u.relations, frame.relations.filter(id => !missing.includes(id)))
                    || u.subject !== (missing.includes('report') ? null : input.speaker)
                    || u.aspect !== (missing.includes('report') ? null : 'feeling')
                    || u.eventTime !== (frame.relations.includes('time') && !missing.includes('time') ? frame.time : 'unspecified')
                    || u.polarity !== 'positive' || u.target !== null || u.conditionStatus !== null || u.questionSlot !== null
                    || Object.hasOwn(u, 'reportSource') !== (missing.length === 0)
                    || ['testimony', 'contrastConnection'].some(key => Object.hasOwn(u, key))) return false;
                missingRelationsBefore.push(missing);
            }
            // A missing optional time relation is not an incomplete report.
            // At least one clause must actually require unavailable report/time.
            if (!missingRelationsBefore.some(ids => ids.some(id => id === 'report' || id === 'time'))) return false;
            return buffer.retain({ kind: 'report', occurrenceId: `incomplete_feeling_contrast:${input.id}`, sourceId: input.id,
                captured: { sources: { input, frames, scene: receipt.beforeState.context.scene,
                    attention: receipt.beforeState.context.attention,
                    activity: { before: receipt.beforeWorld, after: receipt.afterWorld } },
                inputKnowledge: receipt.inputKnowledge,
                inputFeelingLearning: receipt.beforeState.feelingLearning || null,
                understandings, response: receipt.reply, clauseOrder: [0, 1],
                meaningKnownBefore: understandings.map(u => Object.hasOwn(u.known, 'meaning')),
                relationsKnownBefore: false, missingRelationsBefore,
                clauseRelationsKnownBefore: missingRelationsBefore.map(ids => ids.length === 0),
                newTeaching: false, newLearning: false, newExperience: false } });
        } catch (_) { return false; }
    }
    return Object.freeze({ capture });
});
