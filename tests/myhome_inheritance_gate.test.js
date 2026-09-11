const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const window = {
    aiPet: { conciergeUnlocked: true },
    getMyHomeAsset: () => ({ type: 'hut' })
};
window.window = window;

vm.runInNewContext(fs.readFileSync('myhome_map_core.js', 'utf8'), {
    window,
    document: {},
    console,
    setTimeout,
    setInterval,
    clearInterval
});

assert.strictEqual(window.isMyHomeIndoorUnlocked(), true, 'Concierge and My Home together should unlock the indoor map');
window.getMyHomeAsset = () => null;
assert.strictEqual(window.isMyHomeIndoorUnlocked(), false, 'the indoor map must stay closed when My Home is absent');
window.getMyHomeAsset = () => ({ type: 'hut' });
window.aiPet.conciergeUnlocked = false;
assert.strictEqual(window.isMyHomeIndoorUnlocked(), false, 'the indoor map must stay closed when the Concierge is absent');

const inheritanceSource = fs.readFileSync('ai_core.js', 'utf8');
const captureStart = inheritanceSource.indexOf('const shouldKeepConciergePresence');
const captureEnd = inheritanceSource.indexOf('// ==========================================', captureStart);
assert(captureStart >= 0 && captureEnd > captureStart, 'Concierge inheritance capture must exist');

const captureBody = inheritanceSource.slice(captureStart, captureEnd);
assert.match(captureBody, /inheritanceSelections\.map/);
assert.match(captureBody, /inheritanceSelections\.license/);
assert.match(captureBody, /inheritedData\.myHomeIndoor/);

const applyStart = inheritanceSource.indexOf('window.applyInitialPet = function(skinKey)');
const applyEnd = inheritanceSource.indexOf('// ★ 余生システムの補助関数群', applyStart);
assert(applyStart >= 0 && applyEnd > applyStart, 'wrapped applyInitialPet must exist');

const applyBody = inheritanceSource.slice(applyStart, applyEnd);
assert.match(applyBody, /const conciergePresence = inheritanceData && inheritanceData\.conciergePresence/);
assert.match(applyBody, /window\.aiPet\.conciergeUnlocked = false/);
assert.match(applyBody, /delete window\.aiPet\.myHomeIndoor/);

console.log('My Home inheritance and entry gate tests passed');
