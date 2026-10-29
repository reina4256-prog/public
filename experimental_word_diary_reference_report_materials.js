(function (root, factory) {
    const node = typeof module === 'object' && module.exports;
    const api = factory(node ? require('./experimental_word_learning_core') : root.ExperimentalWordLearning,
        node ? require('./experimental_word_learning_world') : root.ExperimentalWordWorld,
        node ? require('./experimental_word_learning_catalog.json') : root.ExperimentalWordDiaryReferenceReportMaterialsCatalog);
    if (node) module.exports = api;
    else root.ExperimentalWordDiaryReferenceReportMaterials = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (core, worldApi, catalog) {
    'use strict';
    const copy = value => JSON.parse(JSON.stringify(value));
    const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    const reportRules = new Set(['feeling_report', 'external_event_report']);
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
    // Independent occurrence material only. No game, notebook or storage caller.
    function create() {
        const records = [];
        function retain(record) {
            if (!jsonData(record) || record?.kind !== 'reference_report_material'
                || !/^input:[1-9]\d*$/.test(record.sourceId)
                || !Number.isSafeInteger(Number(record.sourceId.slice(6)))
                || record.occurrenceId !== `reference_report_material:${record.sourceId}`
                || !record.captured || Array.isArray(record.captured) || typeof record.captured !== 'object') {
                throw new TypeError('Invalid reference report material');
            }
            if (records.some(item => item.occurrenceId === record.occurrenceId)) return false;
            records.push(copy(record)); return true;
        }
        return Object.freeze({ retain, read: () => copy(records) });
    }
    // Validate an actual preceding occurrence without recursively requiring its ancestry.
    function replaySource(result, receipt) {
        const input = result?.input, before = receipt?.beforeState;
        if (!input || !jsonData(result) || !jsonData(receipt) || !Number.isSafeInteger(before?.serial)
            || before.serial < 0 || before.serial === Number.MAX_SAFE_INTEGER
            || input.id !== `input:${before.serial + 1}` || !Number.isFinite(input.at)
            || typeof input.speaker !== 'string' || !input.speaker || input.scene !== before.context.scene
            || !equal(input, receipt.input) || !equal(before.knowledge, receipt.inputKnowledge)
            || !equal(before.context, receipt.inputContext)) return false;
        const state = copy(before), world = copy(receipt.beforeWorld);
        if (!worldApi.validContext(state, world) || !worldApi.validSelections(state, world, catalog)) return false;
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
            if (input.locale !== 'ja' || !Number.isSafeInteger(before.serial) || before.serial < 0
                || before.serial === Number.MAX_SAFE_INTEGER || input.id !== `input:${before.serial + 1}`
                || !Number.isFinite(input.at) || typeof input.raw !== 'string' || !input.raw.trim()
                || typeof input.speaker !== 'string' || !input.speaker || input.scene !== before.context.scene
                || !equal(input, receipt.input) || !equal(before.knowledge, receipt.inputKnowledge)
                || !equal(before.context, receipt.inputContext) || frames.length < 2
                || understandings.length !== frames.length || frames.some(frame => !['unknown', 'reference', 'word_reference'].includes(frame.kind) && !isReport(frame))
                || result.relationLearning || result.conditionJudgment || result.sequenceJudgment) return false;
            const referenceIndices = frames.flatMap((frame, index) => frame.kind === 'reference' ? [index] : []);
            const wordReferenceIndices = frames.flatMap((frame, index) => frame.kind === 'word_reference' ? [index] : []);
            const reportIndices = frames.flatMap((frame, index) => isReport(frame) ? [index] : []);
            if ((!referenceIndices.length && !wordReferenceIndices.length) || !reportIndices.length
                || !Array.isArray(result.learning) || result.learning.length !== frames.length) return false;
            const last = understandings.at(-1);
            if (last.kind === 'question' && last.complete && receipt.reply.message === 'answer_unknown') return false;
            const previous = before.context.turns.at(-1), antecedent = receipt.antecedent;
            if (previous) {
                if (!antecedent || Object.hasOwn(antecedent.receipt, 'antecedent') || !replaySource(antecedent.result, antecedent.receipt)
                    || antecedent.result.input.id !== previous.id || previous.id !== `input:${before.serial}`
                    || antecedent.result.input.at > input.at
                    || !equal(antecedent.receipt.afterState.context.turns.at(-1), previous)) return false;
            } else if (antecedent !== undefined && antecedent !== null) return false;
            const normalize = text => text.normalize('NFKC').trim().toLocaleLowerCase();
            if (!Array.isArray(receipt.origins)) return false;
            const origins = new Map(), requiredOrigins = new Set();
            let currentOrigins = null;
            const requireOrigin = id => { requiredOrigins.add(id); if (currentOrigins) currentOrigins.add(id); };
            for (const origin of receipt.origins) {
                const oldInput = origin?.result?.input, oldState = copy(origin.beforeState);
                if (!oldInput || !Number.isSafeInteger(oldState.serial) || oldState.serial < 0
                    || oldInput.id !== `input:${oldState.serial + 1}`
                    || oldState.serial + 1 >= before.serial + 1 || origins.has(oldInput.id)
                    || typeof oldInput.speaker !== 'string' || !oldInput.speaker
                    || !Number.isFinite(oldInput.at) || oldInput.at > input.at
                    || oldInput.scene !== oldState.context.scene
                    || !core.validWordLearning(oldState, catalog)) return false;
                const oldResult = core.receive(oldState, oldInput.raw, catalog,
                    { locale: oldInput.locale, speaker: oldInput.speaker, at: oldInput.at });
                if (!equal(oldResult, origin.result) || !equal(oldState, origin.afterState)) return false;
                origins.set(oldInput.id, origin);
            }
            function individualEvidence(link, evidence, retractedBy = null) {
                const id = evidence.inputId; requireOrigin(id);
                const origin = origins.get(id);
                if (!origin || origin.result.input.speaker !== link.speaker || (evidence.retractedBy || null) !== retractedBy) return false;
                const updates = origin.result.learning.flatMap(item => item.updated).filter(item => item.inputId === id
                    && item.word === link.word && item.target === link.target);
                const named = origin.result.interpretations.some((frame, index) => frame.kind === 'naming'
                    && frame.word === link.word && origin.result.understandings[index].kind === 'naming'
                    && origin.result.understandings[index].complete
                    && origin.result.understandings[index].target?.adopted?.id === link.target
                    && origin.result.learning[index].adopted?.source === 'explanation');
                const originals = origin.afterState.knowledge.associations.filter(item => item.word === link.word
                    && item.target === link.target && item.speaker === link.speaker);
                const originalEvidence = originals.length === 1 ? originals[0].evidence.filter(item => item.inputId === id) : [];
                const active = copy(evidence); delete active.retractedBy;
                return named && updates.length === 1 && originalEvidence.length === 1 && equal(originalEvidence[0], active);
            }
            const inScope = (entry, speaker) => entry.speaker === speaker
                && (entry.scope.targets.length && before.context.attention.length
                    ? entry.scope.targets.some(id => before.context.attention.some(item => item.id === id))
                    : entry.scope.scene === before.context.scene);
            function wordIndividualEvidence(id, retractedBy) {
                const links = before.knowledge.associations.filter(link => link.evidence.some(e => e.inputId === id));
                if (links.length !== 1) return false;
                const evidence = links[0].evidence.filter(e => e.inputId === id);
                return evidence.length === 1 && individualEvidence(links[0], evidence[0], retractedBy);
            }
            function explanation(id, visiting = new Set()) {
                if (visiting.has(id)) return false;
                visiting.add(id); requireOrigin(id);
                const entries = before.knowledge.wordExplanations.filter(entry => entry.inputId === id);
                const entry = entries[0], origin = origins.get(id);
                if (entries.length !== 1 || !origin || !['word_explanation', 'word_correction'].includes(origin.result.interpretations[0]?.kind)
                    || origin.result.interpretations.length !== 1 || !origin.result.understandings[0]?.complete) return false;
                const originals = origin.afterState.knowledge.wordExplanations.filter(item => item.inputId === id);
                const current = copy(entry); delete current.retractedBy;
                if (originals.length !== 1 || !equal(current, originals[0])) return false;
                if (entry.corrects) {
                    if (!/^input:[1-9]\d*$/.test(entry.corrects)
                        || Number(entry.corrects.slice(6)) >= Number(id.slice(6))) return false;
                    const old = before.knowledge.wordExplanations.find(item => item.inputId === entry.corrects);
                    if (old ? old.retractedBy !== id || !explanation(entry.corrects, visiting)
                        : !wordIndividualEvidence(entry.corrects, id)) return false;
                }
                return true;
            }
            const referenceSources = [];
            for (const index of referenceIndices) {
                currentOrigins = new Set();
                const frame = frames[index], understanding = understandings[index];
                const links = before.knowledge.associations.filter(link => normalize(link.word) === normalize(frame.target)
                    && link.speaker === input.speaker && link.evidence.some(e => !e.retractedBy));
                if (!links.length || understanding.kind !== 'reference') return false;
                const candidates = links.map(link => ({ id: link.target, source: 'experience',
                    evidence: link.evidence.filter(e => !e.retractedBy).map(e => e.inputId) }));
                if (!equal(candidates, understanding.target?.candidates)) return false;
                for (const link of links) for (const evidence of link.evidence.filter(e => !e.retractedBy))
                    if (!individualEvidence(link, evidence)) return false;
                // Original resolution and its absence are copied, never inferred from sources.
                referenceSources.push({ index, word: frame.target, candidates: links,
                    resolution: understanding.target, originalUnderstanding: understanding, originIds: [...currentOrigins] });
            }
            const wordReferenceSources = [];
            for (const index of wordReferenceIndices) {
                currentOrigins = new Set();
                const frame = frames[index], understanding = understandings[index];
                const entries = before.knowledge.wordExplanations.filter(entry => !entry.retractedBy
                    && normalize(entry.word) === normalize(frame.meaning) && inScope(entry, input.speaker));
                if (!entries.length || understanding.kind !== 'word_reference') return false;
                for (const entry of entries) if (!explanation(entry.inputId)) return false;
                const conflicts = before.knowledge.associations.filter(link => normalize(link.word) === normalize(frame.meaning)
                    && link.speaker === input.speaker && link.evidence.some(e => !e.retractedBy
                        && inScope({ speaker: link.speaker, scope: { scene: e.scene, targets: [link.target] } }, input.speaker)));
                for (const link of conflicts) for (const evidence of link.evidence)
                    if (!evidence.retractedBy && inScope({ speaker: link.speaker,
                        scope: { scene: evidence.scene, targets: [link.target] } }, input.speaker)
                        && !individualEvidence(link, evidence)) return false;
                // No new meaning adoption: unresolved competition keeps the original
                // absent applications absent, while source candidates remain inspectable.
                const meanings = [...new Set(entries.map(entry => entry.meaning))];
                const resolution = { candidates: entries.map(entry => ({ meaning: entry.meaning,
                    inputId: entry.inputId, scope: entry.scope })),
                    adopted: meanings.length === 1 && !conflicts.length ? meanings[0] : null,
                    ...(conflicts.length ? { unresolvedIndividual: true } : {}), updated: [], relationAcquired: false };
                const application = (understanding.applications || []).find(item => item.field === 'meaning');
                if (resolution.adopted ? !application || !equal(application, { field: 'meaning', ...resolution })
                    : application !== undefined || understanding.complete !== false) return false;
                wordReferenceSources.push({ index, word: frame.meaning, candidates: entries, resolution,
                    individualConflicts: conflicts, originalUnderstanding: understanding, originIds: [...currentOrigins] });
            }
            currentOrigins = null;
            if (origins.size !== requiredOrigins.size
                || [...origins.keys()].some(id => !requiredOrigins.has(id))) return false;
            const meaningBasis = [], relationBasis = [];
            for (const [index, understanding] of understandings.entries()) {
                for (const id of Object.values(understanding.known)) {
                    const matches = before.knowledge.meanings.filter(item => item.id === id);
                    if (matches.length !== 1) return false;
                    meaningBasis.push({ index, basis: matches[0] });
                }
                for (const id of understanding.relations) {
                    const matches = before.knowledge.relations.filter(item => item.id === id
                        && (item.source === 'initial' || (understanding.relationReferences || []).some(ref => equal(ref, item))));
                    if (matches.length !== 1) return false;
                    relationBasis.push({ index, basis: matches[0] });
                }
            }
            const state = copy(before), world = copy(receipt.beforeWorld);
            if (!worldApi.validContext(state, world) || !worldApi.validSelections(state, world, catalog)) return false;
            const focus = before.context.lastOutput, referencedExperiences = [];
            if (focus?.topic && focus.evidence.experienceId !== null) {
                const matches = world.experiences.filter(item => item.id === focus.evidence.experienceId);
                if (matches.length !== 1 || !equal(matches[0], focus.evidence.activity)) return false;
                referencedExperiences.push(matches[0]);
            }
            const expected = core.receive(state, input.raw, catalog,
                { locale: input.locale, speaker: input.speaker, at: input.at });
            if (!equal(expected, result)) return false;
            const reply = worldApi.respond(world, expected, state, catalog);
            if (!equal(reply, receipt.reply) || !equal(state, receipt.afterState) || !equal(world, receipt.afterWorld)
                || !worldApi.validContext(state, world) || !worldApi.validSelections(state, world, catalog)) return false;
            const turns = state.context.turns.filter(turn => turn.id === input.id);
            if (turns.length !== 1 || ['conditionJudgment', 'sequenceJudgment'].some(key => Object.hasOwn(turns[0], key))) return false;
            for (const field of ['mode', 'destination', 'attention', 'activityStart', 'reasons'])
                if (!equal(receipt.beforeWorld[field], world[field])) return false;
            const indices = predicate => frames.flatMap((frame, index) => predicate(frame) ? [index] : []);
            record = copy({ kind: 'reference_report_material', occurrenceId: `reference_report_material:${input.id}`,
                sourceId: input.id, captured: {
                    sources: { input, frames, antecedent: antecedent || null, antecedentRecorded: !!previous, originalOutput: focus || null, referencedExperiences,
                        scene: before.context.scene, attention: before.context.attention,
                        state: { before, after: receipt.afterState },
                        activity: { before: receipt.beforeWorld, after: receipt.afterWorld } },
                    inputKnowledge: receipt.inputKnowledge, inputContext: receipt.inputContext,
                    inputFeelingLearning: before.feelingLearning || null,
                    clauseIndices: frames.map((_, index) => index), understandings,
                    clauses: frames.map((frame, index) => ({ index, span: frame.span, frame,
                        understanding: understandings[index] })),
                    reportIndices,
                    feelingReportIndices: indices(frame => isReport(frame) && frame.aspect === 'feeling'),
                    eventReportIndices: indices(frame => isReport(frame) && frame.aspect === 'external_event'),
                    reportSources: reportIndices.map(index => ({ index, frame: frames[index],
                        understanding: understandings[index], learning: result.learning[index] })),
                    referenceIndices, referenceSources, wordReferenceIndices, wordReferenceSources, referenceOrigins: receipt.origins,
                    referenceOriginUsages: receipt.origins.map(origin => ({ inputId: origin.result.input.id,
                        individualIndices: referenceSources.filter(source => source.originIds.includes(origin.result.input.id)).map(source => source.index),
                        wordIndices: wordReferenceSources.filter(source => source.originIds.includes(origin.result.input.id)).map(source => source.index) })),
                    unknownIndices: indices(frame => frame.kind === 'unknown'),
                    missingBefore: understandings.map(item => item.unresolved), meaningBasis, relationBasis,
                    understandingStatus: 'per_clause', actualSpeaker: input.speaker,
                    originalResult: result, originalLearning: result.learning, originalTransfer: result.transfer,
                    knowledgeChanged: !equal(before.knowledge, state.knowledge),
                    response: reply, expression: result.expression, actualTurn: turns[0], speechSetting: before.settings.speech,
                    actualSpeech: result.expression.channel === 'speech' && !reply.observation,
                    observationResponse: !!reply.observation, answerRecorded: Object.hasOwn(turns[0], 'answer'),
                    turnAnswer: Object.hasOwn(turns[0], 'answer') ? turns[0].answer : null,
                    compliance: null, actionDecisionRecorded: false,
                    conditionJudgmentRecorded: false, conditionJudgment: null,
                    sequenceJudgmentRecorded: false, sequenceJudgment: null, actionOrder: null,
                    actualParticipation: false, completedExperience: null, desire: null, refusal: null,
                    captureAddsTeaching: false, captureAddsLearning: false, captureAddsExperience: false, captureAddsFeeling: false } });
        } catch (_) { return false; }
        return buffer.retain(record);
    }
    return Object.freeze({ create, capture });
});
