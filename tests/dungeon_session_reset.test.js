const assert = require('assert');
const fs = require('fs');

const source = fs.readFileSync('dungeon_core.js', 'utf8');
const openStart = source.indexOf('window.openDungeonUI = function');
const openEnd = source.indexOf('window.closeDungeonUI = function', openStart);

assert(openStart >= 0 && openEnd > openStart, 'openDungeonUI must exist');

const openBody = source.slice(openStart, openEnd);
const resetTurnIndex = openBody.indexOf('s.turnCount = 0; s.floorTurn = 0;');
const generateIndex = openBody.indexOf('window.generateDungeonFloor()');

assert(resetTurnIndex >= 0, 'a new dungeon session must reset total and floor turn counters');
assert(generateIndex > resetTurnIndex, 'turn counters must reset before the first floor is generated');

console.log('Dungeon session turn reset harness passed');
