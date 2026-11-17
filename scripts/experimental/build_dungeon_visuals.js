'use strict';
// Project only the authored sprite literal; do not load legacy dungeon gameplay.
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const root = path.resolve(__dirname, '../..');
const source = fs.readFileSync(path.join(root, 'dungeon_render.js'), 'utf8');
const marker = 'window.DUNGEON_SPRITES = ', start = source.indexOf(marker) + marker.length;
const end = source.indexOf('\n};', start) + 2;
const original = vm.runInNewContext('(' + source.slice(start, end) + ')');
const result = Object.fromEntries(Object.entries(original).filter(([key]) => /^(skull|crystal)_(floor|wall|stair)$|^spr_item_|_(up|down|left|right)$/.test(key)));
for (const [key, value] of Object.entries(result)) {
    if (!['sx','sy','sw','sh','scale'].every(k => Number.isFinite(value[k])) || !fs.existsSync(path.join(root, value.img))) throw Error(key);
}
fs.writeFileSync(path.join(root, 'experimental_word_dungeon_visuals.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ sprites: Object.keys(result).length }));
