(function (root, factory) {
    const node = typeof module === 'object' && module.exports;
    const api = factory(node ? require('./experimental_word_diary_candidates') : root.ExperimentalWordDiaryCandidates,
        node ? require('./experimental_word_diary_rest_explanation_reports') : root.ExperimentalWordDiaryRestExplanationReports,
        node ? require('./experimental_word_diary_rest_value_reports') : root.ExperimentalWordDiaryRestValueReports,
        node ? require('./experimental_word_diary_incomplete_rest_explanation_reports') : root.ExperimentalWordDiaryIncompleteRestExplanationReports);
    if (node) module.exports = api;
    else root.ExperimentalWordDiaryRestExplanationProse = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (candidates, reports, priorReports, incompleteReports) {
    'use strict';
    const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    function boundary(result, receipt, speech, shore = false) {
        const input = result.input, context = receipt.inputContext, settings = receipt.beforeState.settings;
        return typeof input.raw === 'string' && input.speaker === 'player' && input.locale === 'ja'
            && settings.foundation === true && settings.life === true && settings.speech === speech
            && (shore ? context.scene === 'shore' && equal(context.attention, []) && input.at === 987654321
                : context.scene === 'clearing' && equal(context.attention, [{ id: 'berry:1', meaning: 'berry' }]))
            && receipt.beforeWorld.attention === null && receipt.beforeWorld.hunger === .35;
    }
    function initial(result, receipt, form, speech, shore = false, current = false) {
        const input = result.input, world = receipt.beforeWorld;
        const varied = current && !shore && /^体力や眠気が回復するから$/u.exec(input.raw)?.[0] === input.raw
            && (['observe', 'eat', 'rest', 'work', 'walk'].includes(world.mode) && world.fatigue === .15
                || speech === 'short' && world.mode === 'idle' && [0, .2, .4, .8, 1].includes(world.fatigue));
        return boundary(result, receipt, speech, shore) && form.exec(input.raw)?.[0] === input.raw
            && (world.mode === 'idle' && world.fatigue === .15 || varied)
            && receipt.reply.message === (speech === 'short' ? 'heard_rest_partial' : 'attend')
            && !Object.hasOwn(receipt.reply, 'observation');
    }
    function alternativePrior(result, receipt, speech) {
        const a = receipt.antecedent, input = a.result.input, u = a.result.understandings[0];
        const frame = a.result.interpretations[0], before = a.receipt.beforeWorld, after = a.receipt.afterWorld;
        const world = receipt.beforeWorld, invitation = /^休もう$/u.exec(input.raw)?.[0] === input.raw;
        const report = /^あなたは休んでいる$/u.exec(input.raw)?.[0] === input.raw;
        if (!invitation && !report || !boundary(a.result, a.receipt, speech) || !boundary(result, receipt, speech)
            || /^体力や眠気が回復するから$/u.exec(result.input.raw)?.[0] !== result.input.raw
            || before.mode !== 'idle' || before.fatigue !== .15 || world.fatigue !== .15
            || a.result.understandings.length !== 1 || a.result.interpretations.length !== 1
            || u.complete !== true || !equal(u.known, { meaning: 'rest' }) || !equal(u.unresolved, [])
            || u.polarity !== 'positive' || u.eventTime !== 'unspecified' || u.conditionStatus !== null
            || !equal(a.receipt.reply, { message: speech === 'short' ? invitation ? 'join' : 'heard_report_self' : 'attend' })
            || !equal(receipt.reply, { message: speech === 'short' ? 'heard_rest_partial' : 'attend' })) return false;
        if (invitation) {
            const source = a.receipt.afterState.selectionSources?.find(item => item.kind === 'selected_proposal'
                && item.subject === 'self' && item.target === 'shade' && equal(item.input, input)
                && equal(item.frame, frame) && equal(item.understanding, u));
            const reason = after.reasons.find(item => item.kind === 'understood_suggestion' && item.target === 'shade'
                && item.inputId === input.id && equal(item.selectionSource, { inputId: input.id, selectedAt: source?.selectedAt }));
            return u.kind === 'invitation' && u.subject === 'player' && u.aspect === null
                && equal(u.relations, ['invitation']) && frame.catalogRule === 'rest_invitation'
                && after.mode === 'move' && after.destination === 'shade'
                && world.mode === 'move' && world.destination === 'shade' && !!source && !!reason
                && receipt.beforeState.selectionSources?.some(item => equal(item, source))
                && world.reasons.some(item => equal(item, reason));
        }
        const roles = { reporter: 'player', contentSubject: 'self', status: 'reported', verified: false };
        return u.kind === 'report' && frame.kind === 'report' && u.subject === 'self' && u.aspect === 'activity_report'
            && equal(u.relations, ['report']) && equal(u.roles, roles) && equal(frame.roles, roles)
            && equal(u.reportSource, { kind: 'speaker_report', inputId: input.id, heardAt: input.at,
                raw: input.raw, locale: input.locale, reporter: input.speaker, contentSubject: 'self' })
            && world.mode === 'idle';
    }
    function incomplete(record, result, receipt) {
        const checked = candidates.create(), supplied = candidates.create();
        supplied.retain(record);
        if (!incompleteReports.capture(checked, result, receipt)
            || !equal(supplied.read()[0], checked.read()[0])) return null;
        const speech = receipt.beforeState.settings.speech, a = receipt.antecedent;
        if (!['short', 'gesture'].includes(speech)
            || !priorReports.capture(candidates.create(), a.result, a.receipt)
            || !initial(a.result, a.receipt, /^休むことは大事$/u, speech)
            || !boundary(result, receipt, speech)
            || /^体力や眠気が回復するから$/u.exec(result.input.raw)?.[0] !== result.input.raw
            || receipt.beforeWorld.mode !== 'idle' || receipt.beforeWorld.fatigue !== .15) return null;
        const captured = checked.read()[0].captured, knowledge = receipt.inputKnowledge;
        const meaningMissing = equal(captured.missingMeaningsBefore, [{ type: 'meaning', field: 'meaning', token: 'rest' }])
            && equal(captured.missingRelationsBefore, []) && !knowledge.meanings.some(item => item.id === 'rest');
        const reportMissing = equal(captured.missingMeaningsBefore, [])
            && equal(captured.missingRelationsBefore, ['report']) && !knowledge.relations.some(item => item.id === 'report');
        if (!meaningMissing && !reportMissing || !equal(receipt.reply,
            { message: reportMissing && speech === 'short' ? 'uncertain' : 'attend' })) return null;
        // Missing records are distinct from inapplicable scope. Original prior
        // knowledge is never copied into this input or changed by its shortage.
        return meaningMissing ? '何かを伝えられたけれど、何のことか分からなかった。'
            : '休むことは分かったけれど、言われたことは全部は分からなかった。';
    }
    // Read-only DK through DV projection. Each owner replays both original
    // receipts; no missing antecedent is rebuilt from current or later knowledge.
    function render(record, result, receipt) {
        try {
            if (record?.occurrenceId?.startsWith('incomplete_rest_explanation_report:'))
                return incomplete(record, result, receipt);
            const supplied = candidates.create(), checked = candidates.create();
            supplied.retain(record);
            if (!reports.capture(checked, result, receipt) || !equal(supplied.read()[0], checked.read()[0])) return null;
            const antecedent = receipt.antecedent, speech = receipt.beforeState.settings.speech;
            const shore = receipt.inputContext.scene === 'shore';
            const currentForm = shore ? /^体力や眠気が回復するから$/u
                : speech === 'short' ? /^(?:(?:うん[、, ]?)?体力や眠気が回復するから(?:ね)?| 体力や眠気が回復するから |体力や眠気が回復するから[。！])$/u
                : /^(?:うん[、, ]?)?体力や眠気が回復するから(?:ね)?$/u;
            if (!['short', 'gesture'].includes(speech)) return null;
            const importance = priorReports.capture(candidates.create(), antecedent.result, antecedent.receipt)
                && initial(antecedent.result, antecedent.receipt, /^休むことは大事$/u, speech)
                && initial(result, receipt, currentForm, speech, shore, true);
            if (!importance && !alternativePrior(result, receipt, speech)) return null;
            // Existing seven-locale text. Reason knowledge never completes the
            // current explanation or rewrites an original prior understanding.
            return '休むことは分かったけれど、言われたことは全部は分からなかった。';
        } catch (_) { return null; }
    }
    return Object.freeze({ render });
});
