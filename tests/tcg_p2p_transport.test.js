const assert = require('assert');
const fs = require('fs');

const source = fs.readFileSync('tcg_p2p_core.js', 'utf8');
assert(source.includes("https://ai-pet-game-default-rtdb.asia-southeast1.firebasedatabase.app"));
assert(source.includes("await import(DATABASE_MODULE_URL)"), 'RTDB SDK must load only after the online action');
assert(source.includes("stun:stun.l.google.com:19302"));
assert(source.includes("net.peerId < remoteId"), 'one deterministic offerer must create each mesh edge');
assert(source.includes("createDataChannel('tcg'"));
assert(source.includes("await net.api.remove(net.roomRef)"), 'signaling room must be removed after mesh setup');
assert(source.includes("net.api.goOffline(net.db)"), 'RTDB connection must close after signaling');
assert(source.includes("window.endP2PMatchmakingSession"), 'anonymous auth must end after signaling');
assert(source.includes("TURN_LIMIT_MS = 60 * 1000"));
assert(source.includes("INTERRUPT_LIMIT_MS = 15 * 1000"));
assert(source.includes("window.promoteCasinoTCGNetworkAuthority"));
assert(source.includes("window.replaceCasinoTCGNetworkSeatWithCpu"));
assert(source.includes("CHUNK_SIZE = 4000"));

const rules = JSON.parse(fs.readFileSync('database.rules.json', 'utf8'));
assert(rules.rules.tcg_p2p_rooms, 'RTDB rules must scope P2P rooms');
assert.strictEqual(rules.rules.$other['.read'], false);
assert.strictEqual(rules.rules.$other['.write'], false);

console.log('TCG P2P transport harness passed');
