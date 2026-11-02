(function (root, factory) {
    const api = factory(typeof module === 'object' && module.exports
        ? require('./experimental_word_diary_greeting_materials') : root.ExperimentalWordDiaryGreetingMaterials);
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.ExperimentalWordDiaryIncompleteGreetingProse = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (materials) {
    'use strict';
    const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    function inScope(result, receipt) {
        const input = result.input, context = receipt.inputContext, world = receipt.beforeWorld;
        const u = result.understandings[0];
        return typeof input.raw === 'string' && /^おはよう$/u.exec(input.raw)?.[0] === input.raw
            && input.speaker === 'player' && input.locale === 'ja'
            && context.scene === 'clearing' && equal(context.attention, [{ id: 'shade', meaning: 'rest' }])
            && world.mode === 'rest' && world.attention === 'shade' && world.hunger === .8 && world.fatigue === .7
            && ['short', 'gesture'].includes(receipt.beforeState.settings.speech)
            && !receipt.inputKnowledge.relations.some(item => item.id === 'report')
            && result.interpretations.length === 1 && result.interpretations[0].catalogRule === 'greeting_morning'
            && u.kind === 'partial' && u.complete === false && equal(u.known, {}) && equal(u.relations, [])
            && equal(u.unresolved, [{ type: 'relation', id: 'report' }]) && u.subject === null && u.aspect === null
            && equal(result.expression, { channel: 'gesture', message: 'attend' })
            && equal(receipt.reply, { message: 'attend' });
    }
    // Read-only BD/BE display projection. The existing owner verifies all six
    // source categories on copies; missing originals are never inferred here.
    function render(record, result, receipt) {
        try {
            const supplied = materials.create(); supplied.retain(record);
            const checked = materials.create();
            if (!materials.capture(checked, result, receipt)
                || !equal(supplied.read()[0], checked.read()[0]) || !inScope(result, receipt)) return null;
            // Translate at the display boundary through GameI18n.
            return '言われたことが分からなかった。';
        } catch (_) { return null; }
    }
    return Object.freeze({ render });
});
