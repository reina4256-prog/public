(function (root, factory) {
    const node = typeof module === 'object' && module.exports;
    const api = factory(node ? require('./experimental_word_diary_candidates') : root.ExperimentalWordDiaryCandidates,
        node ? require('./experimental_word_diary_rest_explanation_reports') : root.ExperimentalWordDiaryRestExplanationReports,
        node ? require('./experimental_word_diary_rest_value_reports') : root.ExperimentalWordDiaryRestValueReports);
    if (node) module.exports = api;
    else root.ExperimentalWordDiaryRestExplanationProse = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (candidates, reports, priorReports) {
    'use strict';
    const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    function initial(result, receipt, form, speech, shore = false) {
        const input = result.input, context = receipt.inputContext, world = receipt.beforeWorld;
        const settings = receipt.beforeState.settings;
        return typeof input.raw === 'string' && form.exec(input.raw)?.[0] === input.raw
            && input.speaker === 'player' && input.locale === 'ja'
            && settings.foundation === true && settings.life === true && settings.speech === speech
            && (shore ? context.scene === 'shore' && equal(context.attention, []) && input.at === 987654321
                : context.scene === 'clearing' && equal(context.attention, [{ id: 'berry:1', meaning: 'berry' }]))
            && world.mode === 'idle' && world.attention === null && world.hunger === .35 && world.fatigue === .15
            && receipt.reply.message === (speech === 'short' ? 'heard_rest_partial' : 'attend')
            && !Object.hasOwn(receipt.reply, 'observation');
    }
    // Read-only DK through DP projection. The ax and aw owners replay separate original
    // receipts; no missing antecedent is rebuilt from current or later knowledge.
    function render(record, result, receipt) {
        try {
            const supplied = candidates.create(), checked = candidates.create();
            supplied.retain(record);
            if (!reports.capture(checked, result, receipt) || !equal(supplied.read()[0], checked.read()[0])) return null;
            const antecedent = receipt.antecedent, speech = receipt.beforeState.settings.speech;
            const shore = receipt.inputContext.scene === 'shore';
            const currentForm = shore ? /^体力や眠気が回復するから$/u
                : speech === 'short' ? /^(?:(?:うん[、, ]?)?体力や眠気が回復するから(?:ね)?| 体力や眠気が回復するから |体力や眠気が回復するから[。！])$/u
                : /^(?:うん[、, ]?)?体力や眠気が回復するから(?:ね)?$/u;
            if (!['short', 'gesture'].includes(speech)
                || !priorReports.capture(candidates.create(), antecedent.result, antecedent.receipt)
                || !initial(antecedent.result, antecedent.receipt, /^休むことは大事$/u, speech)
                || !initial(result, receipt, currentForm, speech, shore)) return null;
            // Existing seven-locale text. Reason knowledge never fills either
            // original importance or recovery_explanation detail.
            return '休むことは分かったけれど、言われたことは全部は分からなかった。';
        } catch (_) { return null; }
    }
    return Object.freeze({ render });
});
