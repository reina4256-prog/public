(function (root, factory) {
    const api = factory(typeof module === 'object' && module.exports
        ? require('./experimental_word_diary_greetings') : root.ExperimentalWordDiaryGreetings);
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.ExperimentalWordDiaryGreetingProse = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (greetings) {
    'use strict';
    const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    // Exact, already adopted AV-BC input forms, not a new parser or normalizer.
    const initialForms = /^(?:おはよう|おはよ|おはよー|おはよ～|おはよ〜|おはようございます|おはよう。|おはよう！| おはよう )$/u;
    const exact = (pattern, raw) => typeof raw === 'string' && pattern.exec(raw)?.[0] === raw;
    function inScope(result, receipt) {
        const input = result.input, context = receipt.inputContext, world = receipt.beforeWorld;
        if (input.speaker !== 'player' || input.locale !== 'ja'
            || world.attention !== null || world.hunger !== .35 || world.fatigue !== .15) return false;
        if (context.scene === 'clearing' && equal(context.attention, [{ id: 'berry:1', meaning: 'berry' }]))
            return world.mode === 'idle' && exact(initialForms, input.raw);
        return context.scene === 'shore' && equal(context.attention, [])
            && ['idle', 'rest'].includes(world.mode) && exact(/^おはよう$/u, input.raw);
    }
    // A read-only display projection. The original record, result and independent
    // receipt are all required; no missing source is reconstructed from the prose.
    // UI callers translate the returned Japanese source through GameI18n.
    function render(record, result, receipt) {
        try {
            const supplied = greetings.create();
            supplied.retain(record); // Existing owner's JSON/material validation.
            const checked = greetings.create();
            if (!greetings.capture(checked, result, receipt)
                || !equal(supplied.read()[0], checked.read()[0]) || !inScope(result, receipt)) return null;
            return '挨拶された。';
        } catch (_) { return null; }
    }
    return Object.freeze({ render });
});
