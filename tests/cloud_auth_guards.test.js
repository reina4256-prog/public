const assert = require('assert');
const fs = require('fs');

const source = fs.readFileSync('cloud_manager.js', 'utf8');
const guardedFunctions = [
    'checkAndPromptPlayerName', 'registerPlayerName', 'backupSaveDataToCloud', 'restoreSaveDataFromCloud',
    'uploadMyAIToCloud', 'fetchCloudAIs', 'uploadMyDeckToCloud', 'fetchOnlineDecks',
    'updateDungeonRanking', 'fetchDungeonRanking', 'openPlayerDetail', 'requestRescue',
    'fetchRescueRequests', 'completeRescue', 'checkMyRescueStatus', 'updateArenaRanking',
    'fetchArenaRanking', 'sendItemToFriend', 'sendFoodEffectToFriend', 'fetchPlayerSaveData',
    'sendTradeToHost', 'processTradeMailbox', 'uploadTCGMarketItem', 'fetchTCGMarketItems',
    'buyTCGMarketItem', 'cancelTCGMarketItem', 'updateDefenseRanking', 'fetchDefenseRanking'
];

function functionBody(name) {
    const marker = `window.${name} = async function`;
    const start = source.indexOf(marker);
    assert(start >= 0, `${name} must exist`);
    const next = source.indexOf('\nwindow.', start + marker.length);
    return source.slice(start, next < 0 ? source.length : next);
}

guardedFunctions.forEach(name => {
    const body = functionBody(name);
    assert(/requireRegularOnlineUser|isRegularOnlineUser/.test(body), `${name} must check regular authentication internally`);
});

assert(!/setTimeout\(\(\)\s*=>\s*\{\s*window\.performSteamAutoLogin\(\)/s.test(source), 'Steam login must not run at module load');
assert.strictEqual((source.match(/cloudTavernUploadTimer\s*=\s*setInterval/g) || []).length, 1, 'only the login-owned tavern interval may exist');
assert(/if \(isRegularOnlineUser\(user\)\)[\s\S]*startCloudTavernUploadTimer\(\)/.test(source), 'login observer must start the upload timer');
assert(/else \{[\s\S]*stopCloudTavernUploadTimer\(\)/.test(source), 'logout observer must stop the upload timer');

console.log('Cloud authentication guard harness passed');
