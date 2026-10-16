(function (root, factory) {
    const node = typeof module === 'object' && module.exports;
    const api = factory(node ? require('./experimental_word_learning_core') : root.ExperimentalWordLearning,
        node ? require('./experimental_word_learning_world') : root.ExperimentalWordWorld,
        node ? require('./experimental_word_learning_catalog.json') : root.ExperimentalWordDiaryExternalEventContrastsCatalog);
    if (node) module.exports = api;
    else root.ExperimentalWordDiaryExternalEventContrasts = api;
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
    // Supplied occurrence material is checked in disposable copies. This does
    // not authenticate its source, change understanding, or connect live saves.
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
            if (input.locale !== 'ja' || frames.length !== 2 || understandings.length !== 2
                || !frames.some(frame => frame.catalogRule === 'external_event_report' && frame.aspect === 'external_event')) return false;
            const missingRelationsBefore = [], missingMeaningsBefore = [];
            for (let index = 0; index < 2; index++) {
                const frame = frames[index], u = understandings[index];
                const external = frame.catalogRule === 'external_event_report' && frame.aspect === 'external_event';
                const feeling = frame.catalogRule === 'feeling_report' && frame.aspect === 'feeling';
                if (frame.kind !== 'report' || !external && !feeling
                    || external && (!['failure', 'success'].includes(frame.meaning)
                        || !Object.hasOwn(frame, 'detail') || Object.hasOwn(frame, 'eventMeaning'))
                    || feeling && (!['sad', 'happy', 'painful', 'tired'].includes(frame.meaning)
                        || Object.hasOwn(frame, 'eventMeaning') !== Object.hasOwn(frame, 'detail')
                        || frame.eventMeaning && !['failure', 'success'].includes(frame.eventMeaning))
                    || !frame.relations.includes('report') || !frame.relations.includes('contrast')) return false;
                const missing = u.unresolved.filter(item => item.type === 'relation').map(item => item.id);
                const meanings = ['meaning', 'eventMeaning'].filter(field => frame[field] && !Object.hasOwn(u.known, field))
                    .map(field => ({ type: 'meaning', field, token: frame[field] }));
                if (missing.some(id => !['report', 'time', 'reason', 'contrast'].includes(id))
                    || !equal(missing, frame.relations.filter(id => missing.includes(id)))
                    || !equal(u.unresolved, [...missing.map(id => ({ type: 'relation', id })), ...meanings,
                        ...(frame.detail ? [{ type: 'detail', token: frame.detail }] : [])])
                    || u.kind !== (missing.length ? 'partial' : 'report') || u.complete !== (u.unresolved.length === 0)
                    || !equal(u.relations, frame.relations.filter(id => !missing.includes(id)))
                    || Object.hasOwn(u, 'reportSource') !== (missing.length === 0)
                    || ['testimony', 'contrastConnection'].some(key => Object.hasOwn(u, key))) return false;
                missingRelationsBefore.push(missing); missingMeaningsBefore.push(meanings);
            }
            // Both fully applicable and missing prerequisites retain their original
            // clause understanding. Details never become understood work names.
            return buffer.retain({ kind: 'report', occurrenceId: `external_event_contrast:${input.id}`, sourceId: input.id,
                captured: { sources: { input, frames, scene: receipt.beforeState.context.scene,
                    attention: receipt.beforeState.context.attention,
                    activity: { before: receipt.beforeWorld, after: receipt.afterWorld } },
                inputKnowledge: receipt.inputKnowledge, inputFeelingLearning: receipt.beforeState.feelingLearning || null,
                understandings, response: receipt.reply, clauseOrder: [0, 1],
                meaningKnownBefore: understandings.map(u => Object.hasOwn(u.known, 'meaning')),
                eventMeaningKnownBefore: frames.map((frame, index) => frame.eventMeaning
                    ? Object.hasOwn(understandings[index].known, 'eventMeaning') : null),
                relationsKnownBefore: missingRelationsBefore.every(ids => ids.length === 0),
                missingRelationsBefore, missingMeaningsBefore,
                clauseRelationsKnownBefore: missingRelationsBefore.map(ids => ids.length === 0), detailsUnderstood: false,
                newTeaching: false, newLearning: false, newExperience: false } });
        } catch (_) { return false; }
    }
    return Object.freeze({ capture });
});
