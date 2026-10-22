(function (root, factory) {
    const node = typeof module === 'object' && module.exports;
    const api = factory(node ? require('./experimental_word_learning_core') : root.ExperimentalWordLearning,
        node ? require('./experimental_word_learning_world') : root.ExperimentalWordWorld,
        node ? require('./experimental_word_learning_catalog.json') : root.ExperimentalWordDiaryUncertainDirectTasteQuestionsCatalog);
    if (node) module.exports = api;
    else root.ExperimentalWordDiaryUncertainDirectTasteQuestions = api;
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
    // Independent occurrence material; no game/storage caller or new candidate kind.
    function create() {
        const records = [];
        function retain(record) {
            if (!jsonData(record) || record?.kind !== 'uncertain_direct_taste_question'
                || !/^input:[1-9]\d*$/.test(record.sourceId)
                || !Number.isSafeInteger(Number(record.sourceId.slice(6)))
                || record.occurrenceId !== `uncertain_direct_taste_question:${record.sourceId}`
                || !record.captured || Array.isArray(record.captured) || typeof record.captured !== 'object') {
                throw new TypeError('Invalid uncertain direct taste question material');
            }
            if (records.some(item => item.occurrenceId === record.occurrenceId)) return false;
            records.push(copy(record)); return true;
        }
        return Object.freeze({ retain, read: () => copy(records) });
    }
    function capture(buffer, result, receipt) {
        let record;
        try {
            if (!jsonData(result) || !jsonData(receipt)) return false;
            const input = result.input, before = receipt.beforeState, priorWorld = receipt.beforeWorld;
            const frame = result.interpretations[0], u = result.understandings[0];
            const rule = { taste_now: 'taste_now', taste_evaluation: 'taste_question' }[frame.slot];
            if (input.locale !== 'ja' || !rule || frame.catalogRule !== rule
                || !Number.isSafeInteger(before.serial) || before.serial < 0
                || input.id !== `input:${before.serial + 1}` || !Number.isFinite(input.at)
                || typeof input.raw !== 'string' || !input.raw.trim()
                || typeof input.speaker !== 'string' || !input.speaker || input.scene !== before.context.scene
                || !equal(input, receipt.input) || !equal(before.knowledge, receipt.inputKnowledge)
                || !equal(before.context, receipt.inputContext)
                || result.interpretations.length !== 1 || result.understandings.length !== 1
                || frame.kind !== 'question' || before.settings.speech !== 'short'
                || u.kind !== 'question' || u.complete !== true || u.unresolved.length
                || u.subject !== 'self' || u.questionSlot !== frame.slot
                || Object.hasOwn(u, 'reportSource') || u.contextReference || u.answerReference
                || !worldApi.validContext(before, priorWorld)) return false;
            const currentMeal = u.questionSlot === 'taste_now' && priorWorld.mode === 'eat';
            const meal = [...priorWorld.experiences].reverse().find(e => e.kind === 'eat');
            const referencedExperiences = [];
            if (!currentMeal) {
                if (!meal || !Number.isSafeInteger(meal.id) || meal.id <= 0
                    || priorWorld.experiences.filter(e => e.id === meal.id).length !== 1) return false;
                referencedExperiences.push(meal);
            }
            const state = copy(before), world = copy(priorWorld);
            const expected = core.receive(state, input.raw, catalog,
                { locale: input.locale, speaker: input.speaker, at: input.at });
            if (!equal(expected, result)) return false;
            const reply = worldApi.respond(world, expected, state, catalog);
            if (!equal(reply, receipt.reply) || !equal(state, receipt.afterState) || !equal(world, receipt.afterWorld)
                || reply.observation || reply.message !== 'taste_unsure'
                || result.expression.channel !== 'speech') return false;
            const turns = state.context.turns.filter(turn => turn.id === input.id);
            if (!worldApi.validContext(state, world) || turns.length !== 1 || Object.hasOwn(turns[0], 'answer')) return false;
            record = copy({ kind: 'uncertain_direct_taste_question',
                occurrenceId: `uncertain_direct_taste_question:${input.id}`, sourceId: input.id, captured: {
                    sources: { input, frame, scene: before.context.scene, attention: before.context.attention,
                        state: { before, after: receipt.afterState },
                        activity: { before: priorWorld, after: receipt.afterWorld },
                        currentMeal, mealTasteRecorded: Object.hasOwn(priorWorld, 'mealTaste'),
                        ...(Object.hasOwn(priorWorld, 'mealTaste') ? { mealTaste: priorWorld.mealTaste } : {}),
                        referencedExperiences },
                    inputKnowledge: before.knowledge, inputContext: before.context, understanding: u,
                    response: reply, expression: result.expression, speechSetting: before.settings.speech,
                    actualSpeech: true, answerRecorded: false, turnAnswer: null,
                    newTeaching: false, newLearning: false, newExperience: false } });
        } catch (_) { return false; }
        return buffer.retain(record);
    }
    return Object.freeze({ create, capture });
});
