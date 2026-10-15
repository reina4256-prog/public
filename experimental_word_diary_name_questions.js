(function (root, factory) {
    const node = typeof module === 'object' && module.exports;
    const api = factory(node ? require('./experimental_word_learning_core') : root.ExperimentalWordLearning,
        node ? require('./experimental_word_learning_world') : root.ExperimentalWordWorld,
        node ? require('./experimental_word_learning_catalog.json') : root.ExperimentalWordDiaryNameQuestionsCatalog);
    if (node) module.exports = api;
    else root.ExperimentalWordDiaryNameQuestions = api;
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
    // Separate response material. This does not extend candidates or turn.answer.
    function create() {
        const records = [];
        function retain(record) {
            if (!record || record.kind !== 'name_question_response'
                || !Number.isSafeInteger(serial(record.sourceId))
                || record.occurrenceId !== `name_question:${record.sourceId}` || !record.captured
                || Array.isArray(record.captured) || typeof record.captured !== 'object' || !jsonData(record)) {
                throw new TypeError('Invalid name question material');
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
    function prior(step, input) {
        return step && !Object.hasOwn(step.receipt, 'origins') && !Object.hasOwn(step.receipt, 'confirmation')
            && Number.isSafeInteger(serial(step.result.input.id)) && serial(step.result.input.id) < serial(input.id)
            && step.result.input.at <= input.at && step.result.input.speaker === input.speaker
            && replay(step.result, step.receipt);
    }
    function capture(buffer, result, receipt) {
        let record;
        try {
            if (!jsonData(result) || !jsonData(receipt) || !replay(result, receipt)) return false;
            const input = result.input, frame = result.interpretations[0], u = result.understandings[0];
            const before = receipt.beforeState, after = receipt.afterState, reply = receipt.reply;
            if (input.locale !== 'ja' || result.interpretations.length !== 1 || result.understandings.length !== 1
                || frame.kind !== 'question' || frame.catalogRule !== 'name_question' || frame.slot !== 'name'
                || u.kind !== 'question' || !u.complete || u.unresolved.length || u.questionSlot !== 'name'
                || u.subject !== 'self' || u.polarity !== 'positive' || u.eventTime !== 'unspecified'
                || u.aspect !== null || u.conditionStatus !== null || u.target?.adopted?.source !== 'attention'
                || before.settings.speech !== 'short' || reply.observation
                || !['name_known', 'name_echo', 'known_berry'].includes(reply.message)
                || !Array.isArray(receipt.origins) || !Object.hasOwn(receipt, 'confirmation')) return false;
            const turns = after.context.turns.filter(turn => turn.id === input.id);
            if (turns.length !== 1 || Object.hasOwn(turns[0], 'answer')) return false;
            const target = u.target.adopted.id;
            const links = before.knowledge.associations.filter(link => link.target === target && link.speaker === input.speaker
                && link.evidence.some(e => !e.retractedBy));
            let association = null;
            if (reply.message === 'known_berry') {
                if (links.length || !target.startsWith('berry:') || receipt.origins.length || receipt.confirmation !== null
                    || !before.knowledge.meanings.some(entry => entry.id === 'berry')) return false;
            } else {
                if (links.length !== 1) return false;
                association = links[0];
                const active = association.evidence.filter(e => !e.retractedBy);
                if (reply.word !== association.word || reply.target !== target || receipt.origins.length !== active.length
                    || new Set(receipt.origins.map(step => step.result.input.id)).size !== active.length) return false;
                for (const evidence of active) {
                    const origins = receipt.origins.filter(step => step.result.input.id === evidence.inputId);
                    if (origins.length !== 1 || !prior(origins[0], input)) return false;
                    const origin = origins[0], original = origin.result;
                    const updates = original.learning.flatMap(item => item.updated);
                    const same = link => link.word === association.word && link.target === target && link.speaker === input.speaker;
                    const old = origin.receipt.afterState.knowledge.associations.filter(same);
                    const records = before.records.filter(item => item.id === evidence.inputId);
                    const originals = origin.receipt.afterState.records.filter(item => item.id === evidence.inputId);
                    if (original.interpretations.length !== 1 || original.interpretations[0].kind !== 'naming'
                        || original.understandings.length !== 1 || !original.understandings[0].complete
                        || original.understandings[0].kind !== 'naming' || updates.length !== 1
                        || updates[0].word !== association.word || updates[0].target !== target || old.length !== 1
                        || !equal(old[0].evidence.filter(e => e.inputId === evidence.inputId), [evidence])
                        || records.length !== 1 || originals.length !== 1 || !equal(records, originals)) return false;
                }
                if (reply.message === 'name_echo') {
                    if (association.confirmedBy || receipt.confirmation !== null) return false;
                } else {
                    const confirmation = receipt.confirmation;
                    if (!association.confirmedBy || !prior(confirmation, input)
                        || confirmation.result.input.id !== association.confirmedBy
                        || confirmation.result.understandings.length !== 1) return false;
                    const confirmed = confirmation.result.understandings[0];
                    const pending = confirmation.receipt.beforeState.context.pendingQuestion;
                    const confirmedLinks = confirmation.receipt.afterState.knowledge.associations.filter(link =>
                        link.word === association.word && link.target === target && link.speaker === input.speaker);
                    if (confirmed.kind !== 'reply' || !confirmed.complete || confirmed.answer !== 'yes'
                        || pending?.kind !== 'confirm_name' || pending.word !== association.word || pending.target !== target
                        || pending.speaker !== input.speaker || !equal(confirmed.replyTo, pending)
                        || confirmedLinks.length !== 1 || confirmedLinks[0].confirmedBy !== association.confirmedBy) return false;
                }
            }
            record = copy({ kind: 'name_question_response', occurrenceId: `name_question:${input.id}`, sourceId: input.id,
                captured: { sources: { input, frame, scene: before.context.scene, attention: before.context.attention,
                    activity: { before: receipt.beforeWorld, after: receipt.afterWorld },
                    origins: receipt.origins, confirmation: receipt.confirmation },
                inputKnowledge: before.knowledge, understanding: u, response: reply, actualSpeech: true,
                association, responseKind: reply.message,
                pending: { before: before.context.pendingQuestion, after: after.context.pendingQuestion },
                turnAnswer: null, newTeaching: false, newLearning: false, newExperience: false } });
        } catch (_) { return false; }
        return buffer.retain(record);
    }
    return Object.freeze({ create, capture });
});
