(function (root, factory) {
    const node = typeof module === 'object' && module.exports;
    const api = factory(node ? require('./experimental_word_learning_core') : root.ExperimentalWordLearning,
        node ? require('./experimental_word_learning_world') : root.ExperimentalWordWorld,
        node ? require('./experimental_word_learning_catalog.json') : root.ExperimentalWordDiaryAnswersCatalog);
    if (node) module.exports = api;
    else root.ExperimentalWordDiaryAnswers = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (core, worldApi, catalog) {
    'use strict';
    const copy = value => JSON.parse(JSON.stringify(value));
    const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    const slots = ['current_activity', 'past_activity', 'attention', 'destination', 'work_past', 'work_again',
        'taste_evaluation', 'taste_now', 'rest_result'];
    // Three temporary arguments. The receipt is copied at the occurrence,
    // before receive and after respond, never reconstructed from a notebook.
    // Replay runs only on disposable copies; no game caller or save contract.
    function capture(buffer, result, receipt) {
        let captured;
        try {
            const input = result?.input, u = result?.understandings?.[0], frame = result?.interpretations?.[0];
            const before = receipt?.beforeState, world = receipt?.beforeWorld, answer = receipt?.answer;
            if (!core || !worldApi || !catalog || !input || !catalog.patterns[input.locale]
                || typeof input.raw !== 'string' || !input.raw.trim() || !Number.isFinite(input.at)
                || typeof input.speaker !== 'string' || !input.speaker
                || !Number.isSafeInteger(before?.serial) || before.serial < 0 || input.id !== `input:${before.serial + 1}`
                || input.scene !== before.context?.scene || before.settings?.speech !== 'short'
                || result.interpretations?.length !== 1 || result.understandings?.length !== 1
                || frame?.kind !== 'question' || u?.kind !== 'question' || u.complete !== true
                || u.subject !== 'self' || !slots.includes(u.questionSlot) || u.contextReference || u.answerReference
                || !Array.isArray(before.knowledge?.meanings) || !Array.isArray(before.knowledge.relations)
                || new Set(before.knowledge.meanings.map(m => m.id)).size !== before.knowledge.meanings.length
                || new Set(before.knowledge.relations.map(r => JSON.stringify(r))).size !== before.knowledge.relations.length
                || !world || !Array.isArray(world.history) || !Array.isArray(world.experiences)
                || !Number.isFinite(world.elapsed) || !Number.isFinite(world.activityStart)
                || world.activityStart < 0 || world.activityStart > world.elapsed
                || !answer || answer.source?.inputId !== input.id || answer.source.questionSlot !== u.questionSlot
                || answer.source.answeredAt !== input.at || answer.subject !== 'self'
                || !equal(answer.response, receipt.reply) || receipt.reply?.observation
                || ['answer_unknown', 'attend', 'taste_unsure'].includes(receipt.reply?.message)) return false;
            // Use the existing parser, input-time knowledge and owner response
            // rather than an independently invented understanding/answer rule.
            const stateCopy = copy(before), worldCopy = copy(world);
            const expected = core.receive(stateCopy, input.raw, catalog,
                { locale: input.locale, speaker: input.speaker, at: input.at });
            if (!equal(expected, result)) return false;
            const reply = worldApi.respond(worldCopy, expected, stateCopy, catalog);
            const actual = stateCopy.context.turns.filter(turn => turn.id === input.id);
            if (actual.length !== 1 || !actual[0].answer || !equal(actual[0], receipt.turn) || !equal(actual[0].answer, answer)
                || !equal(reply, receipt.reply) || !equal(worldCopy, receipt.afterWorld)) return false;
            const experienceId = answer.source.experienceId;
            const matches = experienceId === null ? [] : world.experiences.filter(event => event.id === experienceId);
            if (experienceId !== null && matches.length !== 1) return false;
            captured = { sources: { input, frame, index: 0,
                scene: before.context.scene, attention: before.context.attention,
                activity: { mode: world.mode, target: world.attention, destination: world.destination,
                    start: world.activityStart, at: world.elapsed },
                history: u.questionSlot === 'past_activity' ? world.history.at(-1) || null : null,
                referencedExperience: matches[0] || null,
                mealTaste: u.questionSlot === 'taste_now' && world.mode === 'eat' ? world.mealTaste || null : null,
                work: ['work_past', 'work_again'].includes(u.questionSlot) || matches[0]?.activity === 'work'
                    ? world.careers || null : null },
                inputKnowledge: before.knowledge, understanding: u,
                retainedAnswer: answer, answer: receipt.reply, actualAnswer: true };
            // Omitted source fields stay omitted, not inferred from later data.
            captured = copy(captured);
        } catch (_) { return false; }
        return buffer.retain({ occurrenceId: `self_answer:${result.input.id}`, kind: 'question',
            sourceId: result.input.id, captured });
    }
    return Object.freeze({ capture });
});
