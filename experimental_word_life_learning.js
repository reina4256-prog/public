(function (root, factory) {
    const api = factory(typeof module === 'object' && module.exports
        ? require('./experimental_word_learning_core') : root.ExperimentalWordLearning);
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.ExperimentalWordLifeLearning = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (core) {
    'use strict';
    const copy = value => JSON.parse(JSON.stringify(value));
    const ids = ['berry', 'food', 'eat', 'sweet', 'hungry', 'rest', 'sleep', 'tired'];
    function fits(id, activity, target, before, taste) {
        if (['berry', 'food', 'eat', 'sweet', 'hungry'].includes(id)) {
            if (activity !== 'eat' || !/^berry:[1-9]\d*$/.test(target)) return false;
            if (id === 'sweet') return taste?.quality === 'sweet';
            if (id === 'hungry') return before?.hunger >= .45;
            return true;
        }
        return activity === 'rest' && target === 'shade' && (id !== 'tired' || before?.fatigue >= .55);
    }
    function labelValid(label) {
        return label && ids.includes(label.meaning) && label.speaker === 'player'
            && /^input:[1-9]\d*$/.test(label.inputId) && typeof label.raw === 'string' && label.raw.length > 0
            && Number.isFinite(label.at) && Number.isFinite(label.heardAt)
            && Number.isFinite(label.start) && label.at >= label.start
            && fits(label.meaning, label.activity, label.target, label.before, label.taste);
    }
    const rules = ids.map(id => ({ id, source: 'experienced_life', requireScope: true, resolve(event) {
        const labels = Array.isArray(event.lifeLabels) ? event.lifeLabels.filter(label => label?.meaning === id) : null;
        if (event.kind !== 'experience' || !Array.isArray(labels) || labels.length !== 1) return null;
        const label = labels[0];
        if (!labelValid(label) || label.start !== event.start || label.at > event.end
            || label.target !== event.target || label.activity !== event.activity
            || !fits(id, event.activity, event.target, event.before, event.taste)) return null;
        return { target: event.target, inputId: label.inputId, speaker: label.speaker,
            labelAt: label.at, label: label.raw };
    } }));
    function offer(world, state, result) {
        if (result.input.speaker !== 'player' || result.lifeLabel?.length !== 1) return false;
        const meaning = result.lifeLabel[0];
        if (!ids.includes(meaning)) return false;
        const activity = world.mode;
        const target = world.attention;
        // The label must coincide with the actor's action and sensed properties.
        if (!fits(meaning, activity, target, world.activityBefore, world.mealTaste)) return false;
        if ((meaning === 'hungry' && world.hunger < .45) || (meaning === 'tired' && world.fatigue < .55)) return false;
        const label = { meaning, speaker: 'player', inputId: result.input.id, raw: result.input.raw,
            heardAt: result.input.at, at: world.elapsed, start: world.activityStart,
            activity, target, before: copy(world.activityBefore), taste: world.mealTaste ? copy(world.mealTaste) : null };
        world.lifeLabels ||= [];
        if (!world.lifeLabels.some(item => item.meaning === meaning)) world.lifeLabels.push(label);
        result.lifeLearning = { candidates: [meaning], adopted: meaning, updated: [], relationAcquired: false };
        return true;
    }
    function finish(world, experience) {
        const labels = (world.lifeLabels || []).filter(label => label.start === experience.start
            && label.target === experience.target && label.activity === experience.kind);
        if (labels.length) experience.lifeLabels = copy(labels);
        world.lifeLabels = [];
    }
    function learn(state, id) { return core.learnExperience(state, id, rules); }
    function valid(state, world) {
        if (!core.validExperienceLearning(state, rules)) return false;
        if (world.lifeLabels !== undefined && (!Array.isArray(world.lifeLabels)
            || new Set(world.lifeLabels.map(label => label?.meaning)).size !== world.lifeLabels.length
            || !world.lifeLabels.every(label => labelValid(label) && label.at <= world.elapsed
                && label.start === world.activityStart && label.activity === world.mode && label.target === world.attention))) return false;
        return (state.experiences || []).every(event => {
            if (event.lifeLabels === undefined) return true;
            if (!Array.isArray(event.lifeLabels) || !event.lifeLabels.every(label => labelValid(label)
                && rules.find(rule => rule.id === label.meaning).resolve(event))) return false;
            const original = world.experiences.filter(item => item.id === event.id);
            return original.length === 1 && ['start', 'end', 'target'].every(key => original[0][key] === event[key])
                && original[0].kind === event.activity
                && ['lifeLabels', 'before', 'after', 'taste'].every(key => JSON.stringify(original[0][key]) === JSON.stringify(event[key]));
        });
    }
    return Object.freeze({ offer, finish, learn, valid, rules });
});
