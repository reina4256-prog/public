(function (root, factory) {
    const api = factory(typeof module === 'object' && module.exports
        ? require('./experimental_word_learning_core') : root.ExperimentalWordLearning);
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.ExperimentalWordLifeLearning = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (core) {
    'use strict';
    const copy = value => JSON.parse(JSON.stringify(value));
    const ids = ['berry', 'food', 'eat', 'sweet', 'hungry', 'rest', 'sleep', 'tired', 'walk'];
    const position = value => value && Number.isFinite(value.x) && Number.isFinite(value.y);
    const moved = (a, b) => position(a) && position(b) && Math.hypot(a.x - b.x, a.y - b.y) > 1e-8;
    function fits(id, activity, target, before, taste, walking) {
        if (id === 'walk') return activity === 'walk' && typeof target === 'string' && position(before)
            && ['island', 'dungeon:room:1'].includes(walking?.space);
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
            && fits(label.meaning, label.activity, label.target, label.before, label.taste, label.walking);
    }
    const rules = ids.map(id => ({ id, source: 'experienced_life', requireScope: true, resolve(event) {
        const labels = Array.isArray(event.lifeLabels) ? event.lifeLabels.filter(label => label?.meaning === id) : null;
        if (event.kind !== 'experience' || !Array.isArray(labels) || labels.length !== 1) return null;
        const label = labels[0];
        if (!labelValid(label) || label.start !== event.start || label.at > event.end
            || label.target !== event.target || label.activity !== event.activity
            || !fits(id, event.activity, event.target, event.before, event.taste, event.walking)) return null;
        if (id === 'walk' && (!moved(event.before, event.after)
            || JSON.stringify(event.before) !== JSON.stringify(label.before)
            || event.walking?.space !== label.walking.space
            || JSON.stringify(event.walking.from) !== JSON.stringify(event.before)
            || JSON.stringify(event.walking.to) !== JSON.stringify(event.after)
            || label.walking.space === 'dungeon:room:1' && (!label.walking.action
                || JSON.stringify(event.walking.action) !== JSON.stringify(label.walking.action)
                || JSON.stringify(event.before) !== JSON.stringify(label.walking.action.before)
                || JSON.stringify(event.after) !== JSON.stringify(label.walking.action.after)))) return null;
        return { target: event.target, inputId: label.inputId, speaker: label.speaker,
            labelAt: label.at, label: label.raw };
    } }));
    function offer(world, state, result) {
        if (result.input.speaker !== 'player' || result.lifeLabel?.length !== 1) return false;
        const meaning = result.lifeLabel[0];
        if (!ids.includes(meaning)) return false;
        if (meaning === 'walk' && world.pause > 0) return false;
        const activity = meaning === 'walk' && world.mode === 'move' ? 'walk' : world.mode;
        const target = meaning === 'walk' ? world.destination : world.attention;
        const before = meaning === 'walk' ? { x: world.x, y: world.y } : world.activityBefore;
        const walking = meaning === 'walk' ? { space: 'island' } : undefined;
        // The label must coincide with the actor's action and sensed properties.
        if (!fits(meaning, activity, target, before, world.mealTaste, walking)) return false;
        if ((meaning === 'hungry' && world.hunger < .45) || (meaning === 'tired' && world.fatigue < .55)) return false;
        const label = { meaning, speaker: 'player', inputId: result.input.id, raw: result.input.raw,
            heardAt: result.input.at, at: world.elapsed, start: world.activityStart,
            activity, target, before: copy(before), taste: world.mealTaste ? copy(world.mealTaste) : null,
            ...(walking ? { walking } : {}) };
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
    function cancelWalking(world) { if (world.lifeLabels) world.lifeLabels = world.lifeLabels.filter(label => label.meaning !== 'walk'); }
    function walkingExperience(world, label, after) {
        if (!labelValid(label) || !moved(label.before, after)) return null;
        const event = { id: ++world.event, kind: 'walk', start: label.start, end: world.elapsed,
            target: label.target, before: copy(label.before), after: copy(after), lifeLabels: [copy(label)],
            walking: { ...copy(label.walking), from: copy(label.before), to: copy(after) } };
        world.experiences.push(event);
        return { ...copy(event), kind: 'experience', activity: 'walk' };
    }
    function finishWalking(world) {
        const labels = (world.lifeLabels || []).filter(label => label.meaning === 'walk');
        cancelWalking(world);
        if (labels.length !== 1 || labels[0].target !== world.destination
            || labels[0].start !== world.activityStart || world.elapsed <= labels[0].at) return null;
        return walkingExperience(world, labels[0], { x: world.x, y: world.y });
    }
    function teachWalkingStep(world, state, result, action) {
        if (!world || result.input.speaker !== 'player' || result.lifeLabel?.length !== 1 || result.lifeLabel[0] !== 'walk'
            || !action || action.subject !== 'self' || !moved(action.before, action.after)
            || Math.abs(action.before.x - action.after.x) + Math.abs(action.before.y - action.after.y) !== 1
            || !state.dungeonLearning?.actions.some(a => JSON.stringify(a) === JSON.stringify(action))) return false;
        const label = { meaning: 'walk', speaker: 'player', inputId: result.input.id, raw: result.input.raw,
            heardAt: result.input.at, at: world.elapsed, start: world.elapsed, activity: 'walk', target: 'dungeon:room:1',
            before: copy(action.before), taste: null, walking: { space: 'dungeon:room:1', action: copy(action) } };
        const event = walkingExperience(world, label, action.after);
        state.experiences ||= []; state.experiences.push(copy(event));
        result.lifeLearning = learn(state, event.id);
        return true;
    }
    function valid(state, world) {
        if (!core.validExperienceLearning(state, rules)) return false;
        if (world.lifeLabels !== undefined && (!Array.isArray(world.lifeLabels)
            || new Set(world.lifeLabels.map(label => label?.meaning)).size !== world.lifeLabels.length
            || !world.lifeLabels.every(label => labelValid(label) && label.at <= world.elapsed
                && label.start === world.activityStart && (label.meaning === 'walk'
                    ? world.mode === 'move' && label.target === world.destination
                    : label.activity === world.mode && label.target === world.attention)))) return false;
        return (state.experiences || []).every(event => {
            if (event.lifeLabels === undefined) return true;
            if (!Array.isArray(event.lifeLabels) || !event.lifeLabels.every(label => labelValid(label)
                && rules.find(rule => rule.id === label.meaning).resolve(event))) return false;
            const original = world.experiences.filter(item => item.id === event.id);
            return original.length === 1 && ['start', 'end', 'target'].every(key => original[0][key] === event[key])
                && original[0].kind === event.activity
                && ['lifeLabels', 'before', 'after', 'taste', 'walking'].every(key => JSON.stringify(original[0][key]) === JSON.stringify(event[key]))
                && (event.activity !== 'walk' || event.walking.space !== 'dungeon:room:1'
                    || state.dungeonLearning?.actions.some(action => JSON.stringify(action) === JSON.stringify(event.walking.action)));
        });
    }
    return Object.freeze({ offer, finish, learn, valid, rules, finishWalking, cancelWalking, teachWalkingStep });
});
