(function (root, factory) {
    const node = typeof module === 'object' && module.exports;
    const api = factory(node ? require('./experimental_word_diary_candidates') : root.ExperimentalWordDiaryCandidates,
        node ? require('./experimental_word_diary_rest_comfort_reports') : root.ExperimentalWordDiaryRestComfortReports,
        node ? require('./experimental_word_diary_incomplete_rest_comfort_reports') : root.ExperimentalWordDiaryIncompleteRestComfortReports);
    if (node) module.exports = api;
    else root.ExperimentalWordDiaryRestComfortProse = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (candidates, reports, incompleteReports) {
    'use strict';
    const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    function inScope(result, receipt) {
        const input = result.input, context = receipt.inputContext, world = receipt.beforeWorld;
        const match = /^横になると(?:気持ちいい|きもちいい|心地よい)(?:よね|ね|よ)?$/u.exec(input.raw);
        const plain = typeof input.raw === 'string' && match?.[0] === input.raw;
        const basicMatch = /^横になると気持ちいい$/u.exec(input.raw);
        const basic = typeof input.raw === 'string' && basicMatch?.[0] === input.raw;
        const punctuation = /^(?: 横になると気持ちいい |横になると気持ちいい[。！])$/u.exec(input.raw);
        const shortForm = typeof input.raw === 'string' && punctuation?.[0] === input.raw
            && receipt.beforeState.settings.speech === 'short';
        const initial = context.scene === 'clearing'
            && equal(context.attention, [{ id: 'berry:1', meaning: 'berry' }]);
        const noTarget = basic && world.mode === 'idle'
            && context.scene === 'shore' && equal(context.attention, []);
        const initialScope = initial && (world.mode === 'idle' ? plain || shortForm
            : basic && ['observe', 'eat', 'rest', 'work', 'walk'].includes(world.mode));
        const fatigueScope = initial && basic && world.mode === 'idle'
            && receipt.beforeState.settings.speech === 'short' && [0, .2, .4, .8, 1].includes(world.fatigue);
        return input.speaker === 'player' && input.locale === 'ja' && (initialScope || noTarget)
            && world.attention === null && world.hunger === .35 && (world.fatigue === .15 || fatigueScope);
    }
    function incompleteScope(result, receipt) {
        const input = result.input, context = receipt.inputContext, world = receipt.beforeWorld;
        const knowledge = receipt.inputKnowledge, u = result.understandings[0];
        const basic = /^横になると気持ちいい$/u.exec(input.raw);
        return basic?.[0] === input.raw && input.speaker === 'player' && input.locale === 'ja'
            && context.scene === 'clearing' && equal(context.attention, [{ id: 'berry:1', meaning: 'berry' }])
            && world.mode === 'idle' && world.attention === null && world.hunger === .35 && world.fatigue === .15
            && !knowledge.meanings.some(item => ['comfortable', 'rest'].includes(item.id))
            && !knowledge.relations.some(item => ['report', 'condition'].includes(item.id))
            && u.kind === 'partial' && u.complete === false && equal(u.known, {}) && equal(u.relations, [])
            && u.subject === null && u.aspect === null && u.conditionStatus === 'unknown'
            && !Object.hasOwn(u, 'reportSource') && receipt.reply.message === 'attend' && !receipt.reply.observation;
    }
    // Read-only BL-BS display projection. av and bo each own full receipt checks.
    // Finite form/context/fatigue scopes cannot combine; BS requires absent records,
    // not merely inapplicable scope or an attend reply. Original expression stays absent.
    // UI callers translate this source through GameI18n; no game/save connection.
    function render(record, result, receipt) {
        try {
            const supplied = candidates.create();
            supplied.retain(record);
            const checked = candidates.create();
            if (reports.capture(checked, result, receipt)) {
                return equal(supplied.read()[0], checked.read()[0]) && inScope(result, receipt)
                    ? '横になると気持ちいいと聞いた。' : null;
            }
            if (!incompleteReports.capture(checked, result, receipt)
                || !equal(supplied.read()[0], checked.read()[0]) || !incompleteScope(result, receipt)) return null;
            return '言われたことが分からなかった。';
        } catch (_) { return null; }
    }
    return Object.freeze({ render });
});
