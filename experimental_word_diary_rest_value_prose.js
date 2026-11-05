(function (root, factory) {
    const node = typeof module === 'object' && module.exports;
    const api = factory(node ? require('./experimental_word_diary_candidates') : root.ExperimentalWordDiaryCandidates,
        node ? require('./experimental_word_diary_rest_value_reports') : root.ExperimentalWordDiaryRestValueReports);
    if (node) module.exports = api;
    else root.ExperimentalWordDiaryRestValueProse = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (candidates, reports) {
    'use strict';
    const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    function inScope(result, receipt) {
        const input = result.input, context = receipt.inputContext, world = receipt.beforeWorld;
        const match = /^(?:休む|やすむ)(?:こと|の)は大事(?:だよ|だね|だ|です)?$/u.exec(input.raw);
        const initial = context.scene === 'clearing'
            && equal(context.attention, [{ id: 'berry:1', meaning: 'berry' }]);
        const basic = /^休むことは大事$/u.exec(input.raw);
        const shore = basic?.[0] === input.raw && context.scene === 'shore' && equal(context.attention, []);
        return typeof input.raw === 'string' && match?.[0] === input.raw
            && input.speaker === 'player' && input.locale === 'ja'
            && (initial || shore)
            && world.mode === 'idle' && world.attention === null && world.hunger === .35 && world.fatigue === .15
            && ['short', 'gesture'].includes(receipt.beforeState.settings.speech);
    }
    // Read-only CR/CS and CT/CU display projection; form/shore combinations stay out.
    // The aw owner validates the original
    // report, unresolved importance, source and independent before/after receipt.
    // UI callers translate the existing Japanese source through GameI18n.
    function render(record, result, receipt) {
        try {
            const supplied = candidates.create(), checked = candidates.create();
            supplied.retain(record);
            if (!reports.capture(checked, result, receipt)
                || !equal(supplied.read()[0], checked.read()[0]) || !inScope(result, receipt)) return null;
            return '休むことは分かったけれど、言われたことは全部は分からなかった。';
        } catch (_) { return null; }
    }
    return Object.freeze({ render });
});
