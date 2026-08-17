const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

function elementFactory(registry) {
    const classes = new Set();
    const element = {
        _id: '', innerHTML: '', style: { setProperty() {} }, children: [], isConnected: true,
        classList: { add: value => classes.add(value), remove: value => classes.delete(value), contains: value => classes.has(value), toggle() {} },
        appendChild(child) { this.children.push(child); child.isConnected = true; if (child.id) registry.set(child.id, child); return child; },
        remove() { this.isConnected = false; if (this.id) registry.delete(this.id); },
        querySelector() { return null; }, querySelectorAll() { return []; },
        addEventListener() {}, setAttribute() {}, getAttribute() { return ''; },
        getBoundingClientRect() { return { left: 0, top: 0, width: 100, height: 100 }; }
    };
    Object.defineProperty(element, 'id', { get() { return this._id; }, set(value) { this._id = value; if (value) registry.set(value, this); } });
    return element;
}

const registry = new Map();
const body = elementFactory(registry);
body.contains = element => !!element && element.isConnected;
const document = {
    body,
    createElement: () => elementFactory(registry),
    getElementById: id => registry.get(id) || null,
    querySelector: () => null,
    querySelectorAll: () => []
};
const localStorage = { getItem() { return null; }, setItem() {}, removeItem() {} };
const windowObject = {
    document, localStorage, innerWidth: 1280, innerHeight: 720,
    addEventListener() {}, audioManager: null,
    aiPet: { name: 'Tester', apprentice: { rank: { dealer: 10 } } },
    TCG: { decks: [[], [], []], myCollection: [], deckNames: [] },
    TCG_MASTER: { test_monster: { name: 'Test Monster', type: 'monster', baseHp: 40, baseDmg: 20, baseCost: 0 } },
    getCasinoMasterProfile: type => ({ name: type || 'CPU', image: '' }),
    getTCGMasterDeckProfile: () => ({ strategy: {} }),
    renderCardHTML: card => `<div>${card.name}</div>`
};
windowObject.window = windowObject;
const context = vm.createContext({ window: windowObject, document, localStorage, console, setTimeout, clearTimeout, Promise, Math, JSON, Object, Array, Number, String, Boolean, Date, Map, Set });
vm.runInContext(fs.readFileSync('tcg_tag_core.js', 'utf8'), context, { filename: 'tcg_tag_core.js' });

const deck = () => Array.from({ length: 60 }, (_, index) => ({ uid: `c${index}`, masterId: 'test_monster', hp: 40, damage: 20 }));
const human = (actorId, name, controllerId) => ({ actorId, name, controllerId, isHuman: true, deck: deck(), fallbackCpu: { name: 'Dealer CPU', masterType: 'dealer' } });

assert.strictEqual(windowObject.startCasinoTCGNetworkBattleEngine({ mode: 'single', roomCode: 'ABC234', localActorId: 'player', seats: [human('player', 'A', 'peerA'), human('enemy1', 'B', 'peerB')] }), true);
let battle = windowObject.TCG_TAG_BATTLE;
assert.deepStrictEqual(Object.keys(battle.actors).sort(), ['enemy1', 'player']);
assert.strictEqual(battle.teams.player.maxHp, 200);
assert.strictEqual(battle.teams.enemy.maxHp, 200);
assert.strictEqual(battle.actors.player.hand.length, 5);
assert.strictEqual(battle.actors.player.deck.length, 55);
assert.strictEqual(battle.order.length, 2);

battle.cursor = battle.order.indexOf('player');
battle.isAnimating = false;
const attacker = battle.actors.player.hand.shift();
attacker.canAttack = true;
battle.actors.player.field.push(attacker);
windowObject.selectCasinoTagAttacker('player', attacker._tagId);

const snapshot = windowObject.exportCasinoTCGNetworkSnapshot();
assert(snapshot && snapshot.networkMode === 'single');
assert.strictEqual(snapshot.actors.enemy1.hand.length, 5);
assert(snapshot.actors.enemy1.hand[0]._tagId, 'network snapshots must preserve runtime card identity');
assert.strictEqual(windowObject.installCasinoTCGNetworkSnapshot(snapshot, 'enemy1', false), true);
battle = windowObject.TCG_TAG_BATTLE;
assert.strictEqual(battle.localActorId, 'enemy1');
assert.strictEqual(battle.isNetworkAuthority, false);
assert.strictEqual(battle.selectedAttacker.card, battle.actors.player.field[0]);
assert(battle.pendingTarget.some(target => target.zone === 'leader'));

let sentIntent = null;
windowObject.sendCasinoTCGNetworkIntent = intent => { sentIntent = intent; return true; };
battle.cursor = battle.order.indexOf('enemy1');
battle.isAnimating = false;
windowObject.endCasinoTagPlayerTurn();
assert(sentIntent && sentIntent.type === 'end_turn');

assert.strictEqual(windowObject.startCasinoTCGNetworkBattleEngine({ mode: 'tag', roomCode: 'XYZ789', localActorId: 'player', seats: [human('player', 'A', 'peerA'), human('ally', 'B', 'peerB'), human('enemy1', 'C', 'peerC'), human('enemy2', 'D', 'peerD')] }), true);
battle = windowObject.TCG_TAG_BATTLE;
assert.strictEqual(Object.keys(battle.actors).length, 4);
assert.strictEqual(battle.teams.player.maxHp, 400);
assert.strictEqual(battle.order.length, 4);
for (let index = 1; index < battle.order.length; index++) assert.notStrictEqual(battle.actors[battle.order[index - 1]].team, battle.actors[battle.order[index]].team);

console.log('TCG P2P engine harness passed');
process.exit(0);
