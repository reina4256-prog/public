const assert = require('assert');
const fs = require('fs');
const path = require('path');

const tutorialSource = fs.readFileSync(path.join(__dirname, '..', 'tutorial_core.js'), 'utf8');
const blacksmithSource = fs.readFileSync(path.join(__dirname, '..', 'blacksmith_map_core.js'), 'utf8');

assert(tutorialSource.includes("id: 'business.blacksmith_bankruptcy'"), 'the Blacksmith bankruptcy tutorial entry should be registered');
assert(tutorialSource.includes("scene: 'normal'") && tutorialSource.includes("scene: 'warning'") && tutorialSource.includes("scene: 'bankruptcy'"), 'the entry should contain the approved three reconstructed scenes');
assert(tutorialSource.includes('openTutorialVisualLightbox'), 'visual tutorial cards should open a game-styled lightbox');
assert(tutorialSource.includes("window.BLACKSMITH_STATE.paused = true"), 'opening the archive over the Blacksmith should pause its simulation');
assert(tutorialSource.includes("window.BLACKSMITH_STATE.paused = window.TUTORIAL_ARCHIVE_PAUSE_STATE.blacksmithPaused"), 'closing the archive should restore the prior Blacksmith pause state');
assert(tutorialSource.includes("window.unlockTutorialEntry('business.blacksmith_bankruptcy', { viewed: true, silent: true })"), 'completed old Blacksmith tutorials should silently migrate the archive entry');
assert(blacksmithSource.includes("window.unlockTutorialEntry('business.blacksmith_bankruptcy')"), 'the first Blacksmith tutorial should unlock the entry as unread');
assert(blacksmithSource.includes('window.renderBlacksmithTutorialVisual'), 'the tutorial should reuse a Blacksmith-owned fixed-state renderer');
assert(blacksmithSource.includes("spriteElement(def.sprite, 'blacksmith-tutorial-visual-object'"), 'the reconstructed scenes should reuse real Blacksmith equipment crops');
assert(blacksmithSource.includes("characterElement(skin, 'up'"), 'the reconstructed scenes should reuse the live character renderer');

console.log('blacksmith tutorial visual tests passed');
