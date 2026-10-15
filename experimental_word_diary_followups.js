(function (root, factory) {
    const node = typeof module === 'object' && module.exports;
    const api = factory(node ? require('./experimental_word_learning_core') : root.ExperimentalWordLearning,
        node ? require('./experimental_word_learning_world') : root.ExperimentalWordWorld,
        node ? require('./experimental_word_diary_candidates') : root.ExperimentalWordDiaryCandidates,
        node ? require('./experimental_word_learning_catalog.json') : root.ExperimentalWordDiaryFollowupsCatalog);
    if (node) module.exports = api;
    else root.ExperimentalWordDiaryFollowups = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (core, worldApi, candidates, catalog) {
    'use strict';
    const copy = value => JSON.parse(JSON.stringify(value));
    const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    const inputSerial = id => /^input:[1-9]\d*$/.test(id) ? Number(id.slice(6)) : NaN;
    // An isolated temporary journal: repetitions are evidence of delivery,
    // never additional diary candidates or updates to an original candidate.
    function create() {
        const buffer = candidates.create(), repetitions = [];
        function retainRepetition(record) {
            if (repetitions.some(item => item.occurrenceId === record.occurrenceId)) return false;
            repetitions.push(copy(record)); return true;
        }
        function readRepetitions() { return copy(repetitions); }
        return Object.freeze({ retain: buffer.retain, read: buffer.read, retainRepetition, readRepetitions });
    }
    // Input-time snapshots only. Replay uses disposable copies of the existing
    // owners; this module adds no parser, learning, game caller or save schema.
    function capture(buffer, result, receipt) {
        let captured, repetition;
        try {
            const input = result?.input, u = result?.understandings?.[0], frame = result?.interpretations?.[0];
            const before = receipt?.beforeState, world = receipt?.beforeWorld, answer = receipt?.answer;
            if (!core || !worldApi || !catalog || !input || !catalog.patterns[input.locale]
                || typeof input.raw !== 'string' || !input.raw.trim() || !Number.isFinite(input.at)
                || !equal(input, receipt.input)
                || typeof input.speaker !== 'string' || !input.speaker
                || !Number.isSafeInteger(before?.serial) || before.serial < 0
                || input.id !== `input:${before.serial + 1}` || input.scene !== before.context?.scene
                || before.settings?.speech !== 'short' || result.interpretations?.length !== 1
                || result.understandings?.length !== 1 || frame?.kind !== 'question'
                || u?.kind !== 'question' || u.complete !== true || u.subject !== 'self'
                || !['repeat_answer', 'context_detail'].includes(u.questionSlot)
                || !Array.isArray(before.context.turns) || !Array.isArray(before.knowledge?.meanings)
                || !Array.isArray(before.knowledge.relations) || !equal(before.knowledge, receipt.inputKnowledge)
                || new Set(before.context.turns.map(t => t.id)).size !== before.context.turns.length
                || new Set(before.knowledge.meanings.map(m => m.id)).size !== before.knowledge.meanings.length
                || new Set(before.knowledge.relations.map(r => JSON.stringify(r))).size !== before.knowledge.relations.length
                || !world || !Array.isArray(world.history) || !Array.isArray(world.experiences)
                || !Number.isFinite(world.elapsed) || !Number.isFinite(world.activityStart)
                || world.activityStart < 0 || world.activityStart > world.elapsed
                || !worldApi.validContext(before, world) || !answer || answer.subject !== 'self'
                || !equal(answer.response, receipt.reply) || typeof receipt.reply?.message !== 'string'
                || receipt.reply.observation || ['answer_unknown', 'attend', 'taste_unsure'].includes(receipt.reply.message)) return false;
            const previous = before.context.turns.at(-1), output = before.context.lastOutput || null;
            if (!equal(output, receipt.originalOutput) || !equal(previous || null, receipt.previousTurn)) return false;
            repetition = u.questionSlot === 'repeat_answer';
            if (repetition) {
                if (frame.catalogRule !== 'context_repeat' || !u.answerReference || u.contextReference
                    || !previous?.answer || previous.speaker !== input.speaker
                    || u.answerReference.turnId !== previous.id || !equal(previous.answer, answer)
                    || !Number.isSafeInteger(inputSerial(answer.source?.inputId))
                    || inputSerial(answer.source.inputId) > inputSerial(previous.id)
                    || !Number.isFinite(answer.source.answeredAt) || answer.source.answeredAt > input.at) return false;
            } else if (frame.catalogRule !== 'context_detail' || !u.contextReference || u.answerReference
                || !equal(u.contextReference, output) || output.serial !== before.serial
                || output.listener !== input.speaker || output.subject !== 'self'
                || answer.source?.inputId !== input.id || answer.source.questionSlot !== 'context_detail'
                || answer.source.answeredAt !== input.at) return false;
            const stateCopy = copy(before), worldCopy = copy(world);
            const expected = core.receive(stateCopy, input.raw, catalog,
                { locale: input.locale, speaker: input.speaker, at: input.at });
            if (!equal(expected, result)) return false;
            const reply = worldApi.respond(worldCopy, expected, stateCopy, catalog);
            const actual = stateCopy.context.turns.filter(turn => turn.id === input.id);
            if (actual.length !== 1 || !equal(actual[0], receipt.turn) || !equal(actual[0].answer, answer)
                || !equal(reply, receipt.reply) || !equal(worldCopy, receipt.afterWorld)
                || !worldApi.validContext(stateCopy, worldCopy)) return false;
            const ids = [answer.source.experienceId, output?.evidence?.experienceId].filter(id => id != null);
            const experiences = [];
            for (const id of new Set(ids)) {
                const matches = world.experiences.filter(e => e.id === id);
                if (matches.length !== 1) return false;
                if (output?.evidence?.experienceId === id && !equal(output.evidence.activity, matches[0])) return false;
                experiences.push(matches[0]);
            }
            captured = copy({ sources: { input, frame, previousTurn: previous || null,
                originalOutput: output, referencedExperiences: experiences,
                activityAtQuestion: { mode: world.mode, target: world.attention, destination: world.destination,
                    start: world.activityStart, at: world.elapsed } },
                inputKnowledge: before.knowledge, understanding: u, retainedAnswer: answer,
                answer: receipt.reply, actualAnswer: true, newExperience: false });
        } catch (_) { return false; }
        const record = { occurrenceId: `self_${repetition ? 'repeat' : 'clarification'}:${result.input.id}`,
            kind: 'question', sourceId: result.input.id, captured };
        return repetition ? buffer.retainRepetition(record) : buffer.retain(record);
    }
    return Object.freeze({ create, capture });
});
