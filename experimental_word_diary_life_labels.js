(function (root, factory) {
    const api = factory(typeof module === 'object' && module.exports
        ? require('./experimental_word_life_learning') : root.ExperimentalWordLifeLearning);
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.ExperimentalWordDiaryLifeLabels = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (life) {
    'use strict';
    // Input-time snapshots only. No game caller, completion update or save schema.
    function capture(buffer, result, context, beforeKnowledge) {
        const input = result?.input, pairing = result?.lifeLearning;
        if (input?.speaker !== 'player' || !/^input:[1-9]\d*$/.test(input.id)
            || context?.scene !== input.scene || !Array.isArray(beforeKnowledge?.meanings)
            || result.lifeLabel?.length !== 1 || pairing?.candidates?.length !== 1
            || pairing.adopted !== result.lifeLabel[0] || pairing.candidates[0] !== pairing.adopted
            || pairing.updated?.length !== 0 || pairing.relationAcquired !== false) return false;
        const meaning = pairing.adopted, rule = life?.rules.find(item => item.id === meaning);
        const label = { meaning, speaker: input.speaker, inputId: input.id, raw: input.raw,
            heardAt: input.at, at: context.elapsed, start: context.activityStart,
            activity: context.mode, target: context.attention, before: context.activityBefore,
            taste: context.mealTaste || null };
        if (!rule || !rule.resolve({ kind: 'experience', activity: label.activity, target: label.target,
            start: label.start, end: label.at, before: label.before, taste: label.taste, lifeLabels: [label] })
            || (meaning === 'hungry' && !(context.hunger >= .45))
            || (meaning === 'tired' && !(context.fatigue >= .55))) return false;
        const basis = beforeKnowledge.meanings.find(item => item.id === meaning) || null;
        return buffer.retain({ occurrenceId: `life_label:${input.id}`, kind: 'teaching', sourceId: input.id,
            captured: { sources: { input, scene: context.scene, label,
                interpretations: result.interpretations },
                understanding: { status: basis ? 'recognized' : 'unrecognized', meaning, basis,
                    point: 'at_acceptance' }, pairing } });
    }
    return Object.freeze({ capture });
});
