(function (root, factory) {
    const node = typeof module === 'object' && module.exports;
    const api = factory(node ? require('./experimental_word_learning_core') : root.ExperimentalWordLearning,
        node ? require('./experimental_word_learning_world') : root.ExperimentalWordWorld,
        node ? require('./experimental_word_learning_catalog.json') : root.ExperimentalWordDiaryExplicitNamingReportMaterialsCatalog);
    if (node) module.exports = api;
    else root.ExperimentalWordDiaryExplicitNamingReportMaterials = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (core, worldApi, catalog) {
    'use strict';
    const copy = value => JSON.parse(JSON.stringify(value));
    const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    const reportRules = new Set(['feeling_report', 'external_event_report']);
    const namingRules = new Set(['name', 'name_description', 'name_answer']);
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
            if (!jsonData(record) || record?.kind !== 'explicit_naming_report_material'
                || !/^input:[1-9]\d*$/.test(record.sourceId)
                || !Number.isSafeInteger(Number(record.sourceId.slice(6)))
                || record.occurrenceId !== `explicit_naming_report_material:${record.sourceId}`
                || !record.captured || Array.isArray(record.captured) || typeof record.captured !== 'object') {
                throw new TypeError('Invalid explicit naming report material');
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
            const isNaming = frame => frame.kind === 'naming' && namingRules.has(frame.catalogRule);
            const namingIndices = frames.flatMap((frame, index) => isNaming(frame) ? [index] : []);
            const completeNamingIndices = namingIndices.filter(index => understandings[index].kind === 'naming' && understandings[index].complete === true);
            if (input.locale !== 'ja' || frames.length < 2 || understandings.length !== frames.length
                || !frames.some(isReport) || !namingIndices.length || completeNamingIndices.length === 1
                || frames.some(frame => !isReport(frame) && frame.kind !== 'unknown' && !isNaming(frame))
                || result.relationLearning || result.conditionJudgment || result.sequenceJudgment) return false;
            // The older actual-question owner keeps its entire input, even if a
            // caller omits that owner's expected receipt elsewhere.
            const last = understandings.at(-1);
            if (last.kind === 'question' && last.complete && receipt.reply.message === 'answer_unknown') return false;
            if (!replay(result, receipt)) return false;
            for (const index of completeNamingIndices) {
                const frame = frames[index];
                const target = understandings[index].target?.adopted?.id, learning = result.learning[index];
                const adopted = learning?.adopted, candidate = learning?.candidates?.[0];
                if (!target || !before.context.attention.some(item => item.id === target)
                    || learning?.candidates?.length !== 1 || !Array.isArray(learning.updated)
                    || adopted?.source !== 'explanation' || adopted.word !== frame.word
                    || adopted.target !== target || adopted.speaker !== input.speaker
                    || candidate?.source !== 'explanation' || candidate.word !== adopted.word
                    || candidate.target !== target || candidate.speaker !== adopted.speaker) return false;
            }
            const previous = before.context.turns.at(-1), antecedent = receipt.antecedent;
            if (previous) {
                if (!antecedent || Object.hasOwn(antecedent.receipt, 'antecedent')
                    || antecedent.result.input.id !== previous.id || previous.id !== `input:${before.serial}`
                    || antecedent.result.input.at > input.at
                    || !equal(previous, antecedent.receipt.afterState.context.turns.at(-1))
                    || !replay(antecedent.result, antecedent.receipt)) return false;
            } else if (Object.hasOwn(receipt, 'antecedent')) return false;
            const turn = receipt.afterState.context.turns.filter(item => item.id === input.id);
            if (turn.length !== 1) return false;
            const indices = predicate => frames.flatMap((frame, index) => predicate(frame) ? [index] : []);
            record = copy({ kind: 'explicit_naming_report_material',
                occurrenceId: `explicit_naming_report_material:${input.id}`, sourceId: input.id,
                captured: {
                    sources: { input, frames, scene: before.context.scene, attention: before.context.attention,
                        antecedent: previous ? antecedent : null, originalOutput: before.context.lastOutput || null,
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
                    namingIndices, completeNamingIndices,
                    incompleteNamingIndices: namingIndices.filter(index => !understandings[index].complete),
                    namingSources: namingIndices.map(index => ({ index, frame: frames[index],
                        understanding: understandings[index], learning: result.learning[index] })),
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
