(function (root, factory) {
    const node = typeof module === 'object' && module.exports;
    const api = factory(node ? require('./experimental_word_learning_core') : root.ExperimentalWordLearning,
        node ? require('./experimental_word_learning_world') : root.ExperimentalWordWorld,
        node ? require('./experimental_word_learning_catalog.json') : root.ExperimentalWordDiaryCompleteOtherSpeakerActivityReportsCatalog);
    if (node) module.exports = api;
    else root.ExperimentalWordDiaryCompleteOtherSpeakerActivityReports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (core, worldApi, catalog) {
    'use strict';
    const copy = value => JSON.parse(JSON.stringify(value));
    const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    const key = value => value.normalize('NFKC').trim().toLocaleLowerCase();
    function jsonData(value, ancestors = new Set()) {
        if (value === null || ['string', 'boolean'].includes(typeof value)) return true;
        if (typeof value === 'number') return Number.isFinite(value);
        if (typeof value !== 'object' || ancestors.has(value)
            || !Array.isArray(value) && ![Object.prototype, null].includes(Object.getPrototypeOf(value))) return false;
        ancestors.add(value);
        const valid = Reflect.ownKeys(value).every(name => typeof name === 'string')
            && (Array.isArray(value) ? Array.from(value) : Object.values(value)).every(item => jsonData(item, ancestors));
        ancestors.delete(value); return valid;
    }
    // Independent hearing material. It never supplies missing comprehension,
    // verifies testimony, or connects to the game, notebook or storage.
    function create() {
        const records = [];
        function retain(record) {
            if (!jsonData(record) || record?.kind !== 'complete_other_speaker_activity_report'
                || !/^input:[1-9]\d*$/.test(record.sourceId)
                || !Number.isSafeInteger(Number(record.sourceId.slice(6)))
                || record.occurrenceId !== `complete_other_speaker_activity_report:${record.sourceId}`
                || !record.captured || Array.isArray(record.captured) || typeof record.captured !== 'object') {
                throw new TypeError('Invalid complete other-speaker activity report material');
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
            const input = result.input, before = receipt.beforeState;
            const frame = result.interpretations[0], u = result.understandings[0];
            const reportForms = catalog.reportTeaching[input.locale], timeForms = catalog.timeTeaching[input.locale];
            if (!reportForms || !timeForms || !Number.isSafeInteger(before.serial) || before.serial < 0
                || input.id !== `input:${before.serial + 1}` || !Number.isFinite(input.at)
                || typeof input.speaker !== 'string' || !input.speaker || input.speaker === 'player' || input.scene !== before.context.scene
                || !equal(input, receipt.input) || !equal(before.knowledge, receipt.inputKnowledge)
                || !equal(before.context, receipt.inputContext)
                || result.interpretations.length !== 1 || result.understandings.length !== 1
                || frame.kind !== 'report' || frame.meaning !== 'rest' || frame.aspect !== 'activity_report'
                || !['self', 'player'].includes(frame.subject) || u.kind !== 'report'
                || u.complete !== true || !equal(u.unresolved, []) || u.contextReference || u.answerReference
                || result.relationLearning || result.conditionJudgment || result.sequenceJudgment) return false;
            const forms = [reportForms.self.utterance, reportForms.player.utterance,
                catalog.negationTeaching[input.locale].negative.utterance];
            for (const time of ['now', 'past']) for (const field of ['utterance', 'negative', 'player', 'playerNegative'])
                forms.push(timeForms[time][field]);
            if (!forms.some(raw => key(raw) === key(input.raw))) return false;
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
            if (!equal(before.knowledge, state.knowledge) || !equal(receipt.beforeWorld.experiences, world.experiences)
                || u.roles?.reporter !== input.speaker || u.reportSource?.reporter !== input.speaker
                || u.subject !== (frame.subject === 'player' ? input.speaker : 'self')
                || u.roles.contentSubject !== u.subject || u.reportSource.contentSubject !== u.subject) return false;
            const turns = state.context.turns.filter(turn => turn.id === input.id);
            if (turns.length !== 1 || Object.hasOwn(turns[0], 'answer')) return false;
            record = copy({ kind: 'complete_other_speaker_activity_report', occurrenceId: `complete_other_speaker_activity_report:${input.id}`,
                sourceId: input.id, captured: {
                    sources: { input, frame, originalOutput: focus || null, referencedExperiences,
                        scene: before.context.scene, attention: before.context.attention,
                        state: { before, after: receipt.afterState },
                        activity: { before: receipt.beforeWorld, after: receipt.afterWorld } },
                    inputKnowledge: before.knowledge, inputContext: before.context, understanding: u,
                    expression: result.expression, response: reply, speechSetting: before.settings.speech,
                    actualSpeech: result.expression.channel === 'speech', answerRecorded: false, turnAnswer: null,
                    reportVerified: false, reportedExperience: null,
                    newTeaching: false, newLearning: false, newExperience: false } });
        } catch (_) { return false; }
        return buffer.retain(record);
    }
    return Object.freeze({ create, capture });
});
