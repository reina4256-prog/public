(function (root, factory) {
    const node = typeof module === 'object' && module.exports;
    const api = factory(node ? require('./experimental_word_diary_greeting_materials') : root.ExperimentalWordDiaryGreetingMaterials,
        node ? require('./experimental_word_relation_learning') : root.ExperimentalWordRelationLearning,
        node ? require('./experimental_word_learning_catalog.json') : root.ExperimentalWordDiaryGreetingMaterialsCatalog);
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.ExperimentalWordDiaryIncompleteGreetingProse = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (materials, relationLearning, catalog) {
    'use strict';
    const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    function missingReportScope(receipt) {
        const reports = receipt.inputKnowledge.relations.filter(item => item.id === 'report');
        const world = receipt.beforeWorld;
        // BD/BE and BH/BI: no report record. BF/BG: the two original, rest-only learned
        // scopes with their experience evidence; a matching ID alone is insufficient.
        if (!reports.length) return world.mode === 'rest' && world.attention === 'shade'
            && world.hunger === .8 && world.fatigue === .7;
        return /^おはよう$/u.exec(receipt.input.raw)?.[0] === receipt.input.raw
            && world.mode === 'idle' && world.attention === null && reports.length === 2
            && ['self', 'player'].every(subject => reports.filter(item => item.source === 'experienced_relation'
                && equal(item.scope, { kind: 'report', locale: 'ja', speaker: 'player', meaning: 'rest',
                    form: catalog.reportTeaching.ja[subject].utterance,
                    roles: { reporter: 'player', contentSubject: subject, status: 'reported', verified: false } })).length === 1)
            && relationLearning.valid(receipt.beforeState, world, catalog)
            && relationLearning.valid(receipt.afterState, receipt.afterWorld, catalog);
    }
    function inScope(result, receipt) {
        const input = result.input, context = receipt.inputContext;
        const u = result.understandings[0];
        return typeof input.raw === 'string'
            && /^(?:おはよう|おはようございます！)$/u.exec(input.raw)?.[0] === input.raw
            && input.speaker === 'player' && input.locale === 'ja'
            && context.scene === 'clearing' && equal(context.attention, [{ id: 'shade', meaning: 'rest' }])
            && ['short', 'gesture'].includes(receipt.beforeState.settings.speech)
            && missingReportScope(receipt)
            && result.interpretations.length === 1 && result.interpretations[0].catalogRule === 'greeting_morning'
            && u.kind === 'partial' && u.complete === false && equal(u.known, {}) && equal(u.relations, [])
            && equal(u.unresolved, [{ type: 'relation', id: 'report' }]) && u.subject === null && u.aspect === null
            && equal(result.expression, { channel: 'gesture', message: 'attend' })
            && equal(receipt.reply, { message: 'attend' });
    }
    // Read-only BD/BE, BF/BG and BH/BI display projection. The existing owner verifies all six
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
