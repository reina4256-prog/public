(function (root, factory) {
    const node = typeof module === 'object' && module.exports;
    const api = factory(node ? require('./experimental_word_learning_core') : root.ExperimentalWordLearning,
        node ? require('./experimental_word_learning_world') : root.ExperimentalWordWorld,
        node ? require('./experimental_word_learning_catalog.json') : root.ExperimentalWordDiaryNameResponsesCatalog);
    if (node) module.exports = api;
    else root.ExperimentalWordDiaryNameResponses = api;
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
    // Separate occurrence material, never another teaching candidate or save schema.
    function create() {
        const records = [];
        function retain(record) {
            if (!record || !['confirmation', 'retraction'].includes(record.kind)
                || record.occurrenceId !== `name_response:${record.sourceId}`
                || !Number.isSafeInteger(serial(record.sourceId)) || !record.captured
                || Array.isArray(record.captured) || typeof record.captured !== 'object' || !jsonData(record)) {
                throw new TypeError('Invalid name response material');
            }
            if (records.some(item => item.occurrenceId === record.occurrenceId)) return false;
            records.push(copy(record)); return true;
        }
        return Object.freeze({ retain, read: () => copy(records) });
    }
    function replay(result, receipt) {
        const input = result?.input, before = receipt?.beforeState;
        if (!input || !catalog.patterns[input.locale] || !Number.isSafeInteger(before?.serial) || before.serial < 0
            || input.id !== `input:${before.serial + 1}` || !equal(input, receipt.input)
            || !equal(before.knowledge, receipt.inputKnowledge) || !equal(before.context, receipt.inputContext)
            || input.scene !== before.context.scene || !Number.isFinite(input.at)
            || typeof input.speaker !== 'string' || !input.speaker || !receipt.beforeWorld) return false;
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
            if (result.interpretations.length !== 1 || result.understandings.length !== 1
                || !u.complete || u.unresolved.length || frame.kind !== u.kind
                || !['reply', 'correction'].includes(u.kind)) return false;
            const before = receipt.beforeState, after = receipt.afterState;
            const origin = receipt.origin, antecedent = receipt.antecedent;
            if (!origin || !antecedent || !replay(origin.result, origin.receipt)
                || !replay(antecedent.result, antecedent.receipt)) return false;
            const original = origin.result, id = original.input.id, previous = before.context.turns.at(-1);
            if (!Number.isSafeInteger(serial(id)) || serial(id) >= serial(input.id)
                || original.input.at > input.at || original.input.speaker !== input.speaker
                || original.interpretations.length !== 1 || original.interpretations[0].kind !== 'naming'
                || original.understandings.length !== 1 || !original.understandings[0].complete
                || original.understandings[0].kind !== 'naming'
                || antecedent.result.input.id !== previous?.id || serial(previous.id) !== before.serial
                || antecedent.result.input.at > input.at
                || !equal(antecedent.receipt.afterState.context.turns.at(-1), previous)) return false;
            const updates = original.learning.flatMap(item => item.updated);
            const links = before.knowledge.associations.filter(link => link.evidence.some(e => e.inputId === id));
            if (updates.length !== 1 || links.length !== 1) return false;
            const link = links[0], update = updates[0];
            const sameLink = item => item.word === link.word && item.target === link.target && item.speaker === link.speaker;
            const oldLinks = origin.receipt.afterState.knowledge.associations.filter(sameLink);
            const newLinks = after.knowledge.associations.filter(sameLink);
            const evidence = link.evidence.filter(e => e.inputId === id);
            const rootRecords = before.records.filter(item => item.id === id);
            const oldRecords = origin.receipt.afterState.records.filter(item => item.id === id);
            if (oldLinks.length !== 1 || newLinks.length !== 1 || evidence.length !== 1 || evidence[0].retractedBy
                || link.speaker !== input.speaker || update.word !== link.word || update.target !== link.target
                || !equal(evidence, oldLinks[0].evidence.filter(e => e.inputId === id))
                || rootRecords.length !== 1 || oldRecords.length !== 1 || !equal(rootRecords, oldRecords)) return false;
            const next = newLinks[0];
            const kind = u.kind === 'reply' && u.answer === 'yes' ? 'confirmation' : 'retraction';
            if (u.kind === 'reply') {
                const pending = before.context.pendingQuestion;
                if (!['yes', 'no'].includes(u.answer) || pending?.kind !== 'confirm_name'
                    || pending.inputId !== id || pending.word !== link.word || pending.target !== link.target
                    || pending.speaker !== input.speaker || before.serial + 1 > pending.expires
                    || !equal(pending, u.replyTo) || !equal(pending, frame.replyTo)
                    || !equal(pending, antecedent.receipt.afterState.context.pendingQuestion)
                    || antecedent.receipt.reply.message !== 'name_echo' || after.context.pendingQuestion !== null) return false;
                if (kind === 'confirmation' && (next.confirmedBy !== input.id || link.confirmedBy === input.id
                    || !equal(next.evidence, link.evidence))) return false;
            } else if (u.corrects !== id || result.learning[0]?.retraction !== id || previous.id !== id
                || !equal(origin, antecedent)) return false;
            if (kind === 'retraction') {
                const nextEvidence = next.evidence.filter(e => e.inputId === id);
                const nextRecords = after.records.filter(item => item.id === id);
                if (nextEvidence.length !== 1 || nextEvidence[0].retractedBy !== input.id
                    || nextRecords.length !== 1 || nextRecords[0].retractedBy !== input.id
                    || !equal(next.evidence.filter(e => e.inputId !== id), link.evidence.filter(e => e.inputId !== id))) return false;
            }
            record = copy({ occurrenceId: `name_response:${input.id}`, sourceId: input.id, kind, captured: {
                sources: { input, frame, origin, antecedent, originalInputId: id,
                    scene: before.context.scene, attention: before.context.attention },
                inputKnowledge: before.knowledge, understanding: u, response: receipt.reply,
                change: { before: link, after: next, recordBefore: rootRecords[0],
                    recordAfter: after.records.find(item => item.id === id),
                    pendingBefore: before.context.pendingQuestion, pendingAfter: after.context.pendingQuestion },
                newTeaching: false, newExperience: false, independentEvidenceAdded: false } });
        } catch (_) { return false; }
        return buffer.retain(record);
    }
    return Object.freeze({ create, capture });
});
