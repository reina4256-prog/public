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
        const speech = receipt.beforeState.settings.speech;
        const decorated = /^(?: 休むことは大事 |休むことは大事[。！])$/u.exec(input.raw);
        const ordinaryWorld = world.mode === 'idle' && world.fatigue === .15;
        const activity = ['observe', 'eat', 'rest', 'work', 'walk'].includes(world.mode) && world.fatigue === .15;
        const fatigue = world.mode === 'idle' && [0, .2, .4, .8, 1].includes(world.fatigue) && speech === 'short';
        return typeof input.raw === 'string'
            && input.speaker === 'player' && input.locale === 'ja'
            && (ordinaryWorld && (match?.[0] === input.raw && (initial || shore)
                || decorated?.[0] === input.raw && initial && speech === 'short')
                || basic?.[0] === input.raw && initial && (activity || fatigue))
            && world.attention === null && world.hunger === .35
            && ['short', 'gesture'].includes(speech);
    }
    // Read-only CR..CY projection; activity/fatigue never supply understanding.
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
