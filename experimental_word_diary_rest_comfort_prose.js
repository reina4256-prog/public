(function (root, factory) {
    const node = typeof module === 'object' && module.exports;
    const api = factory(node ? require('./experimental_word_diary_candidates') : root.ExperimentalWordDiaryCandidates,
        node ? require('./experimental_word_diary_rest_comfort_reports') : root.ExperimentalWordDiaryRestComfortReports);
    if (node) module.exports = api;
    else root.ExperimentalWordDiaryRestComfortProse = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (candidates, reports) {
    'use strict';
    const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    function inScope(result, receipt) {
        const input = result.input, context = receipt.inputContext, world = receipt.beforeWorld;
        const match = /^横になると(?:気持ちいい|きもちいい|心地よい)(?:よね|ね|よ)?$/u.exec(input.raw);
        const initial = context.scene === 'clearing'
            && equal(context.attention, [{ id: 'berry:1', meaning: 'berry' }]);
        const noTarget = /^横になると気持ちいい$/u.test(input.raw)
            && context.scene === 'shore' && equal(context.attention, []);
        return typeof input.raw === 'string' && match?.[0] === input.raw
            && input.speaker === 'player' && input.locale === 'ja'
            && (initial || noTarget)
            && world.mode === 'idle' && world.attention === null && world.hunger === .35 && world.fatigue === .15;
    }
    // Read-only BL-BO display projection, using the av owner's full receipt check.
    // BN forms and BO's separate no-target scene cannot be combined.
    // Missing original expression material remains missing in the av record.
    // UI callers translate this source through GameI18n; no game/save connection.
    function render(record, result, receipt) {
        try {
            const supplied = candidates.create();
            supplied.retain(record);
            const checked = candidates.create();
            if (!reports.capture(checked, result, receipt)
                || !equal(supplied.read()[0], checked.read()[0]) || !inScope(result, receipt)) return null;
            return '横になると気持ちいいと聞いた。';
        } catch (_) { return null; }
    }
    return Object.freeze({ render });
});
