(function (root, factory) {
    const node = typeof module === 'object' && module.exports;
    const api = factory(node ? require('./experimental_word_learning_core') : root.ExperimentalWordLearning,
        node ? require('./experimental_word_learning_world') : root.ExperimentalWordWorld,
        node ? require('./experimental_word_learning_catalog.json') : root.ExperimentalWordDiaryMixedReferenceMaterialsCatalog);
    if (node) module.exports = api;
    else root.ExperimentalWordDiaryMixedReferenceMaterials = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (core, worldApi, catalog) {
    'use strict';
    const copy = value => JSON.parse(JSON.stringify(value));
    const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    const rules = new Set(['after_eat_walk', 'berry_observation', 'conditional_rest', 'do_not_eat',
        'name_question', 'not_dislike', 'not_now', 'preference', 'reason_question', 'rest_comfort',
        'rest_invitation', 'rest_request', 'rest_result', 'rest_value', 'situation_question',
        'sour_question', 'taste_now', 'walk_invitation', 'greeting_morning', 'name', 'name_description', 'name_answer']);
    const additionalRules = new Set(['work_past', 'work_again', 'taste_question', 'rest_explanation']);
    for (const rule of additionalRules) rules.add(rule);
    for (const rule of ['retract_explanation', 'yes_reply_priority', 'no_reply_priority', 'yes_reply', 'no_reply']) rules.add(rule);
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
            if (!jsonData(record) || record?.kind !== 'mixed_reference_material'
                || !/^input:[1-9]\d*$/.test(record.sourceId)
                || !Number.isSafeInteger(Number(record.sourceId.slice(6)))
                || record.occurrenceId !== `mixed_reference_material:${record.sourceId}`
                || !record.captured || Array.isArray(record.captured) || typeof record.captured !== 'object') {
                throw new TypeError('Invalid mixed reference material');
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
            if (input.locale !== 'ja' || !Number.isSafeInteger(before.serial) || before.serial < 0
                || before.serial === Number.MAX_SAFE_INTEGER || input.id !== `input:${before.serial + 1}`
                || !Number.isFinite(input.at) || typeof input.raw !== 'string' || !input.raw.trim()
                || typeof input.speaker !== 'string' || !input.speaker || input.scene !== before.context.scene
                || !equal(input, receipt.input) || !equal(before.knowledge, receipt.inputKnowledge)
                || !equal(before.context, receipt.inputContext) || frames.length < 1
                || understandings.length !== frames.length || frames.some(frame => !['unknown', 'reference', 'word_reference'].includes(frame.kind) && !rules.has(frame.catalogRule))
                || result.relationLearning || result.conditionJudgment || result.sequenceJudgment) return false;
            const completeNamingIndices = frames.flatMap((frame, index) => frame.kind === 'naming'
                && understandings[index].kind === 'naming' && understandings[index].complete === true ? [index] : []);
            const correctionIndices = frames.flatMap((frame, index) => frame.kind === 'correction' ? [index] : []);
            const replyIndices = frames.flatMap((frame, index) => frame.kind === 'reply' ? [index] : []);
            const referenceIndices = frames.flatMap((frame, index) => frame.kind === 'reference' ? [index] : []);
            const wordReferenceIndices = frames.flatMap((frame, index) => frame.kind === 'word_reference' ? [index] : []);
            if (!referenceIndices.length || !wordReferenceIndices.length
                || completeNamingIndices.length === 1
                || [...correctionIndices, ...replyIndices].some(index => understandings[index].complete !== false
                    || !understandings[index].unresolved.some(item => item.type === 'clause_scope')
                    || Object.hasOwn(understandings[index], 'corrects'))
                || result.learning.some(item => Object.hasOwn(item, 'retraction'))) return false;
            const last = understandings.at(-1);
            // Preserve the older actual-reply question gate, including mixed inputs.
            if (last.kind === 'question' && last.complete && receipt.reply.message === 'answer_unknown') return false;
            const pending = before.context.pendingQuestion, output = before.context.lastOutput;
            // Each clause must independently satisfy the existing unique naming contract.
            // Never pick one clause, collapse repetition or turn association into a general name.
            if (!Array.isArray(result.learning) || result.learning.length !== frames.length) return false;
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
                if (!antecedent || !replaySource(antecedent.result, antecedent.receipt)
                    || antecedent.result.input.id !== previous.id || previous.id !== `input:${before.serial}`
                    || antecedent.result.input.at > input.at
                    || !equal(antecedent.receipt.afterState.context.turns.at(-1), previous)) return false;
            } else if (antecedent !== undefined && antecedent !== null) return false;
            if (frames.some(frame => frame.catalogRule === 'rest_explanation')
                && (!previous || !antecedent?.result.understandings.some(item => item.known.meaning === 'rest'))) return false;
            // A parsed mixed reply is not a successful confirmation or retraction.
            // Validate both its real immediate output and its original naming evidence.
            const confirmationSources = [];
            if (replyIndices.length) {
                if (pending?.kind !== 'confirm_name' || pending.speaker !== input.speaker
                    || !Number.isSafeInteger(pending.expires) || before.serial + 1 > pending.expires
                    || !antecedent || antecedent.receipt.reply.message !== 'name_echo'
                    || !equal(antecedent.receipt.afterState.context.pendingQuestion, pending)
                    || !equal(antecedent.receipt.afterState.context.lastOutput, output)) return false;
                const origin = pending.inputId === antecedent.result.input.id ? antecedent : receipt.origin;
                if (!origin || !replaySource(origin.result, origin.receipt)
                    || origin.result.input.id !== pending.inputId || origin.result.input.speaker !== input.speaker
                    || origin.result.input.at > antecedent.result.input.at
                    || origin.result.interpretations.length !== 1 || origin.result.understandings.length !== 1
                    || origin.result.interpretations[0].kind !== 'naming'
                    || origin.result.understandings[0].kind !== 'naming' || !origin.result.understandings[0].complete
                    || origin.result.learning.length !== 1 || origin.result.learning[0].updated.length !== 1) return false;
                const same = item => item.word === pending.word && item.target === pending.target && item.speaker === pending.speaker;
                const links = before.knowledge.associations.filter(same);
                const oldLinks = origin.receipt.afterState.knowledge.associations.filter(same);
                const records = before.records.filter(item => item.id === pending.inputId);
                const oldRecords = origin.receipt.afterState.records.filter(item => item.id === pending.inputId);
                if (links.length !== 1 || oldLinks.length !== 1 || records.length !== 1 || oldRecords.length !== 1
                    || !equal(records, oldRecords) || records[0].retractedBy || links[0].confirmedBy
                    || origin.result.learning[0].adopted?.source !== 'explanation'
                    || !same(origin.result.learning[0].adopted)
                    || origin.result.learning[0].updated[0].word !== pending.word
                    || origin.result.learning[0].updated[0].target !== pending.target
                    || origin.result.learning[0].updated[0].inputId !== pending.inputId) return false;
                const evidence = links[0].evidence.filter(item => item.inputId === pending.inputId);
                if (evidence.length !== 1 || evidence[0].retractedBy
                    || !equal(evidence, oldLinks[0].evidence.filter(item => item.inputId === pending.inputId))) return false;
                for (const index of replyIndices)
                    if (!['yes', 'no'].includes(frames[index].answer) || !equal(frames[index].replyTo, pending)) return false;
                confirmationSources.push({ indices: replyIndices, pendingQuestion: pending,
                    origin, antecedent, associationBefore: links[0], originalRecord: records[0] });
            }
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
                || !worldApi.validContext(state, world) || !worldApi.validSelections(state, world, catalog)
                || !equal(before.experiences, state.experiences)
                || !equal(receipt.beforeWorld.experiences, world.experiences)
                || !equal(before.selectionSources, state.selectionSources)) return false;
            // Preserve actual naming association and record effects, including empty
            // updates on repetition. Capturing never creates teaching or learning.
            for (const key of new Set([...Object.keys(before.knowledge), ...Object.keys(state.knowledge)]))
                if (key !== 'associations' && !equal(before.knowledge[key], state.knowledge[key])) return false;
            for (const field of ['correctionLessons', 'feelingLearning'])
                if (!equal(before[field], state[field])) return false;
            for (const old of before.records) {
                const retained = state.records.find(item => item.id === old.id);
                if (retained && !equal(old, retained)) return false;
            }
            for (const old of before.knowledge.associations) {
                const next = state.knowledge.associations.find(item => item.word === old.word
                    && item.target === old.target && item.speaker === old.speaker);
                if (!next || !equal(next.evidence.slice(0, old.evidence.length), old.evidence)
                    || next.confirmedBy !== old.confirmedBy) return false;
            }
            const turns = state.context.turns.filter(turn => turn.id === input.id);
            if (turns.length !== 1 || ['conditionJudgment', 'sequenceJudgment'].some(key => Object.hasOwn(turns[0], key))) return false;
            for (const field of ['mode', 'destination', 'attention', 'activityStart', 'reasons'])
                if (!equal(receipt.beforeWorld[field], world[field])) return false;
            const indices = predicate => frames.flatMap((frame, index) => predicate(frame) ? [index] : []);
            record = copy({ kind: 'mixed_reference_material', occurrenceId: `mixed_reference_material:${input.id}`,
                sourceId: input.id, captured: {
                    sources: { input, frames, antecedent: antecedent || null, antecedentRecorded: !!previous, originalOutput: focus || null, referencedExperiences,
                        scene: before.context.scene, attention: before.context.attention,
                        state: { before, after: receipt.afterState },
                        activity: { before: receipt.beforeWorld, after: receipt.afterWorld } },
                    inputKnowledge: receipt.inputKnowledge, inputContext: receipt.inputContext,
                    clauseIndices: frames.map((_, index) => index), understandings,
                    clauses: frames.map((frame, index) => ({ index, span: frame.span, frame,
                        understanding: understandings[index] })),
                    completeNamingIndices, correctionIndices, replyIndices, confirmationSources,
                    referenceIndices, referenceSources, wordReferenceIndices, wordReferenceSources, referenceOrigins: receipt.origins,
                    referenceOriginUsages: receipt.origins.map(origin => ({ inputId: origin.result.input.id,
                        individualIndices: referenceSources.filter(source => source.originIds.includes(origin.result.input.id)).map(source => source.index),
                        wordIndices: wordReferenceSources.filter(source => source.originIds.includes(origin.result.input.id)).map(source => source.index) })),
                    correctionDetails: correctionIndices.map(index => ({ index, frame: frames[index], understanding: understandings[index] })),
                    replyDetails: replyIndices.map(index => ({ index, frame: frames[index], understanding: understandings[index] })),
                    incompleteNamingIndices: frames.flatMap((frame, index) => frame.kind === 'naming' && !understandings[index].complete ? [index] : []),
                    otherRecognizedIndices: indices(frame => frame.kind !== 'naming' && frame.kind !== 'unknown'),
                    unknownIndices: indices(frame => frame.kind === 'unknown'),
                    catalogNamingIndices: indices(frame => frame.kind === 'naming' && Object.hasOwn(frame, 'catalogRule')),
                    additionalIndices: indices(frame => additionalRules.has(frame.catalogRule)),
                    recoveryExplanationIndices: indices(frame => frame.catalogRule === 'rest_explanation'),
                    namingIndices: indices(frame => frame.kind === 'naming'),
                    namingDetails: frames.flatMap((frame, index) => frame.kind === 'naming' ? [{ index, word: frame.word,
                        target: understandings[index].target, learning: result.learning[index] }] : []),
                    missingBefore: understandings.map(item => item.unresolved), meaningBasis, relationBasis,
                    understandingStatus: 'per_clause', actualSpeaker: input.speaker,
                    originalResult: result, originalLearning: result.learning, originalTransfer: result.transfer,
                    knowledgeChanged: !equal(before.knowledge, state.knowledge),
                    response: reply, expression: result.expression, speechSetting: before.settings.speech,
                    actualSpeech: result.expression.channel === 'speech' && !reply.observation,
                    observationResponse: !!reply.observation, answerRecorded: Object.hasOwn(turns[0], 'answer'),
                    turnAnswer: Object.hasOwn(turns[0], 'answer') ? turns[0].answer : null,
                    compliance: null, actionDecisionRecorded: false,
                    conditionJudgmentRecorded: false, conditionJudgment: null,
                    sequenceJudgmentRecorded: false, sequenceJudgment: null, actionOrder: null,
                    actualParticipation: false, completedExperience: null, desire: null, refusal: null,
                    captureAddsTeaching: false, captureAddsLearning: false, captureAddsExperience: false } });
        } catch (_) { return false; }
        return buffer.retain(record);
    }
    return Object.freeze({ create, capture });
});
