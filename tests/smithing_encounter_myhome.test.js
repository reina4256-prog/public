const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const aiSource = fs.readFileSync(path.join(__dirname, '..', 'ai_core.js'), 'utf8');
const myHomeSource = fs.readFileSync(path.join(__dirname, '..', 'myhome_map_core.js'), 'utf8');
const uiSource = fs.readFileSync(path.join(__dirname, '..', 'ui_controller.js'), 'utf8');
const start = aiSource.indexOf('window.tryTriggerSmithingIntroFromBasicAction = function');
const end = aiSource.indexOf('// ==========================================', start);
assert(start >= 0 && end > start, 'shared smithing encounter helper should exist');

let encounter = null;
let saves = 0;
const context = {
    Number,
    Array,
    window: null,
    saveGameData: () => { saves += 1; },
    openEncounterUI: (masterType, message, mode) => { encounter = { masterType, message, mode }; },
    playMasterEncounterVideo: () => false,
    myHomeMapOpen: false
};
context.window = context;
vm.createContext(context);
vm.runInContext(aiSource.slice(start, end), context, { filename: 'smithing_encounter_helper.js' });

function makeHero(overrides = {}) {
    return {
        apprentice: {
            learnedWords: ['睡眠', '食事', '勉強'],
            metMasters: [],
            currentMaster: null,
            isGraduated: false,
            rank: {},
            retired: {}
        },
        schedule: [{ type: 'sleep' }],
        currentTask: { type: 'sleep' },
        actionState: 'inside',
        isIndoors: true,
        indoorTarget: { type: 'hut' },
        ...overrides
    };
}

for (const action of ['睡眠', '食事', '勉強', '筋トレ', 'ランニング']) {
    encounter = null;
    context.myHomeMapOpen = false;
    const hero = makeHero();
    assert.strictEqual(context.tryTriggerSmithingIntroFromBasicAction(action, { hero }), true, `${action} should trigger from the training screen`);
    assert.deepStrictEqual(encounter && { masterType: encounter.masterType, mode: encounter.mode }, { masterType: 'smithing', mode: 'encounter_intro' });
    assert.strictEqual(hero.isIndoors, false);
    assert.strictEqual(hero.schedule.length, 0);
}

context.myHomeMapOpen = true;
assert.strictEqual(context.tryTriggerSmithingIntroFromBasicAction('睡眠', { hero: makeHero() }), false, 'actions inside My Home should not trigger');
context.myHomeMapOpen = false;
assert.strictEqual(context.tryTriggerSmithingIntroFromBasicAction('掃除', { hero: makeHero() }), false, 'unrelated actions should not trigger');
assert.strictEqual(context.tryTriggerSmithingIntroFromBasicAction('睡眠', { hero: makeHero({ apprentice: { learnedWords: ['睡眠', '勉強'], metMasters: [] } }) }), false, 'three learned words are required');
assert.strictEqual(context.tryTriggerSmithingIntroFromBasicAction('睡眠', { hero: makeHero({ apprentice: { learnedWords: ['a', 'b', 'c'], metMasters: ['smithing'] } }) }), false, 'already-met blacksmith should not retrigger');
assert.strictEqual(context.tryTriggerSmithingIntroFromBasicAction('睡眠', { hero: makeHero({ apprentice: { learnedWords: ['a', 'b', 'c'], metMasters: [], currentMaster: 'concierge' } }) }), false, 'an active apprenticeship should block another master encounter');
assert.strictEqual(context.tryTriggerSmithingIntroFromBasicAction('睡眠', { hero: makeHero({ apprentice: { learnedWords: ['a', 'b', 'c'], metMasters: [], retired: { smithing: true } } }) }), false, 'mastered legacy state should not retrigger');

assert(!myHomeSource.includes('tryTriggerSmithingIntroFromBasicAction'), 'My Home actions should not call the smithing encounter helper');
const trainingEncounterIndex = uiSource.indexOf('if (knows(interpretedWord) && triggerSmithingIntroFromBasicCommand())');
const myHomeRouteIndex = uiSource.indexOf('if (aiPet.conciergeEncountered || aiPet.conciergeUnlocked');
assert(trainingEncounterIndex >= 0 && myHomeRouteIndex > trainingEncounterIndex, 'training-screen encounter should run before My Home routing');
assert(saves >= 5, 'successful encounters should persist pending state');
console.log('smithing encounter training-screen boundary tests passed');
