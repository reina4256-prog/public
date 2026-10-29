(function (root, factory) {
    const node = typeof module === 'object' && module.exports;
    const api = factory(node ? require('./experimental_word_learning_core') : root.ExperimentalWordLearning,
        node ? require('./experimental_word_learning_world') : root.ExperimentalWordWorld,
        node ? require('./experimental_word_learning_catalog.json') : root.ExperimentalWordDiaryIncompleteNameResponseReportMaterialsCatalog);
    if (node) module.exports = api;
    else root.ExperimentalWordDiaryIncompleteNameResponseReportMaterials = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (core, worldApi, catalog) {
    'use strict';
    const copy = value => JSON.parse(JSON.stringify(value));
    const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    const reportRules = new Set(['feeling_report', 'external_event_report']);
    const responseRules = new Set(['retract_explanation', 'yes_reply_priority', 'no_reply_priority', 'yes_reply', 'no_reply']);
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
    // Independent occurrence material. No notebook, storage or game caller.
    function create() {
        const records = [];
        function retain(record) {
            if (!jsonData(record) || record?.kind !== 'incomplete_name_response_report_material'
                || !/^input:[1-9]\d*$/.test(record.sourceId)
                || !Number.isSafeInteger(Number(record.sourceId.slice(6)))
                || record.occurrenceId !== `incomplete_name_response_report_material:${record.sourceId}`
                || !record.captured || Array.isArray(record.captured) || typeof record.captured !== 'object') {
                throw new TypeError('Invalid incomplete name response report material');
            }
            if (records.some(item => item.occurrenceId === record.occurrenceId)) return false;
            records.push(copy(record)); return true;
        }
        return Object.freeze({ retain, read: () => copy(records) });
    }
    // Replay only supplied occurrence-time copies, never repair missing evidence.
    function replay(result, receipt) {
        const input = result?.input, before = receipt?.beforeState;
        if (!input || !Number.isSafeInteger(before?.serial) || before.serial < 0
            || before.serial === Number.MAX_SAFE_INTEGER || input.id !== `input:${before.serial + 1}`
            || !Number.isFinite(input.at) || typeof input.raw !== 'string' || !input.raw.trim()
            || typeof input.speaker !== 'string' || !input.speaker || input.scene !== before.context.scene
            || !equal(input, receipt.input) || !equal(before.knowledge, receipt.inputKnowledge)
            || !equal(before.context, receipt.inputContext)) return false;
        const state = copy(before), world = copy(receipt.beforeWorld);
        if (!worldApi.validContext(state, world) || !worldApi.validSelections(state, world, catalog)) return false;
        const focus = before.context.lastOutput;
        if (focus?.topic && focus.evidence.experienceId !== null) {
            const matches = world.experiences.filter(item => item.id === focus.evidence.experienceId);
            if (matches.length !== 1 || !equal(matches[0], focus.evidence.activity)) return false;
        }
        const expected = core.receive(state, input.raw, catalog,
            { locale: input.locale, speaker: input.speaker, at: input.at });
        if (!equal(expected, result)) return false;
        const reply = worldApi.respond(world, expected, state, catalog);
        return equal(reply, receipt.reply) && equal(state, receipt.afterState) && equal(world, receipt.afterWorld)
            && worldApi.validContext(state, world) && worldApi.validSelections(state, world, catalog);
    }
    function capture(buffer, result, receipt) {
        let record;
        try {
            if (!jsonData(result) || !jsonData(receipt)) return false;
            const input = result.input, before = receipt.beforeState;
            const frames = result.interpretations, understandings = result.understandings;
            const isReport = frame => frame.kind === 'report' && reportRules.has(frame.catalogRule)
                && !frame.relations.includes('contrast');
            const isResponse = frame => ['correction', 'reply'].includes(frame.kind) && responseRules.has(frame.catalogRule);
            if (input.locale !== 'ja' || frames.length < 2 || understandings.length !== frames.length
                || !frames.some(isReport) || !frames.some(isResponse)
                || frames.some(frame => !isReport(frame) && frame.kind !== 'unknown' && !isResponse(frame))
                || result.relationLearning || result.conditionJudgment || result.sequenceJudgment) return false;
            if (!Array.isArray(result.learning) || result.learning.length !== frames.length
                || frames.some((frame, index) => isResponse(frame) && (understandings[index].complete !== false
                    || Object.hasOwn(understandings[index], 'corrects')))
                || result.learning.some(item => Object.hasOwn(item, 'retraction'))
                || receipt.origins && (!Array.isArray(receipt.origins) || receipt.origins.length)) return false;
            // Unresolved confirmation and retraction never invalidate existing evidence.
            if (receipt.afterState.knowledge.associations.some(link => link.confirmedBy === input.id
                || link.evidence.some(evidence => evidence.retractedBy === input.id))
                || receipt.afterState.records.some(item => item.retractedBy === input.id)) return false;
            const last = understandings.at(-1);
            if (last.kind === 'question' && last.complete && receipt.reply.message === 'answer_unknown') return false;
            if (!replay(result, receipt)) return false;
            const previous = before.context.turns.at(-1), antecedent = receipt.antecedent;
            if (previous) {
                if (!antecedent || ['antecedent', 'origin', 'origins'].some(key => Object.hasOwn(antecedent.receipt, key))
                    || antecedent.result.input.id !== previous.id || previous.id !== `input:${before.serial}`
                    || antecedent.result.input.at > input.at
                    || !equal(previous, antecedent.receipt.afterState.context.turns.at(-1))
                    || !replay(antecedent.result, antecedent.receipt)) return false;
            } else if (Object.hasOwn(receipt, 'antecedent')) return false;
            const replies = frames.filter(frame => frame.kind === 'reply'), origin = receipt.origin;
            if (replies.length) {
                if (!origin || Object.hasOwn(origin.receipt, 'antecedent') || Object.hasOwn(origin.receipt, 'origin')
                    || Object.hasOwn(origin.receipt, 'origins') || !replay(origin.result, origin.receipt)) return false;
                const pending = before.context.pendingQuestion, original = origin.result, id = original.input.id;
                if (pending?.kind !== 'confirm_name' || pending.inputId !== id
                    || pending.speaker !== input.speaker || before.serial + 1 > pending.expires
                    || original.input.speaker !== input.speaker || original.input.locale !== input.locale
                    || original.input.at > input.at || origin.receipt.beforeState.serial >= before.serial
                    || original.interpretations.length !== 1 || original.interpretations[0].kind !== 'naming'
                    || original.understandings.length !== 1 || original.understandings[0].kind !== 'naming'
                    || original.understandings[0].complete !== true
                    || !replies.every(frame => ['yes', 'no'].includes(frame.answer) && equal(frame.replyTo, pending))
                    || !antecedent || antecedent.receipt.reply.message !== 'name_echo'
                    || !equal(antecedent.receipt.afterState.context.pendingQuestion, pending)) return false;
                const updates = original.learning.flatMap(item => item.updated);
                const links = before.knowledge.associations.filter(link => link.word === pending.word
                    && link.target === pending.target && link.speaker === input.speaker);
                const originalLinks = origin.receipt.afterState.knowledge.associations.filter(link => link.word === pending.word
                    && link.target === pending.target && link.speaker === input.speaker);
                if (updates.length !== 1 || updates[0].word !== pending.word || updates[0].target !== pending.target
                    || links.length !== 1 || originalLinks.length !== 1) return false;
                const evidence = links[0].evidence.filter(item => item.inputId === id);
                const records = before.records.filter(item => item.id === id);
                if (evidence.length !== 1 || evidence[0].retractedBy
                    || !equal(evidence, originalLinks[0].evidence.filter(item => item.inputId === id))
                    || records.length !== 1
                    || !equal(records, origin.receipt.afterState.records.filter(item => item.id === id))) return false;
            } else if (Object.hasOwn(receipt, 'origin')) return false;
            const turn = receipt.afterState.context.turns.filter(item => item.id === input.id);
            if (turn.length !== 1) return false;
            const indices = predicate => frames.flatMap((frame, index) => predicate(frame) ? [index] : []);
            record = copy({ kind: 'incomplete_name_response_report_material',
                occurrenceId: `incomplete_name_response_report_material:${input.id}`, sourceId: input.id,
                captured: {
                    sources: { input, frames, scene: before.context.scene, attention: before.context.attention,
                        antecedent: previous ? antecedent : null, origin: origin || null, originalOutput: before.context.lastOutput || null,
                        state: { before, after: receipt.afterState },
                        activity: { before: receipt.beforeWorld, after: receipt.afterWorld } },
                    inputKnowledge: receipt.inputKnowledge, inputContext: receipt.inputContext,
                    inputFeelingLearning: before.feelingLearning || null,
                    clauseIndices: frames.map((_, index) => index), understandings,
                    clauses: frames.map((frame, index) => ({ index, span: frame.span, frame,
                        understanding: understandings[index] })),
                    reportIndices: indices(isReport), allReportIndices: indices(frame => frame.kind === 'report'),
                    feelingReportIndices: indices(frame => isReport(frame) && frame.aspect === 'feeling'),
                    eventReportIndices: indices(frame => isReport(frame) && frame.aspect === 'external_event'),
                    correctionIndices: indices(frame => frame.kind === 'correction'),
                    replyIndices: indices(frame => frame.kind === 'reply'),
                    responseSources: frames.flatMap((frame, index) => isResponse(frame) ? [{ index, frame,
                        understanding: understandings[index], learning: result.learning[index],
                        pendingQuestion: before.context.pendingQuestion || null,
                        origin: frame.kind === 'reply' ? origin : null }] : []),
                    reportSources: frames.flatMap((frame, index) => isReport(frame) ? [{ index, frame,
                        understanding: understandings[index], learning: result.learning[index] }] : []),
                    unknownIndices: indices(frame => frame.kind === 'unknown'),
                    missingBefore: understandings.map(item => item.unresolved),
                    understandingStatus: 'per_clause', actualSpeaker: input.speaker,
                    originalResult: result, originalLearning: result.learning, originalTransfer: result.transfer,
                    expression: result.expression, response: receipt.reply, actualTurn: turn[0],
                    answerRecorded: Object.hasOwn(turn[0], 'answer'), turnAnswer: turn[0].answer ?? null,
                    knowledgeChanged: !equal(before.knowledge, receipt.afterState.knowledge),
                    captureAddsTeaching: false, captureAddsLearning: false, captureAddsExperience: false,
                    captureAddsFeeling: false } });
        } catch (_) { return false; }
        return buffer.retain(record);
    }
    return Object.freeze({ create, capture });
});
