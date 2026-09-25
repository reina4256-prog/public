'use strict';
// Copy only authored visual frames; never execute the legacy game's data/bootstrap.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const source = fs.readFileSync(path.join(root, 'data.js'), 'utf8');
const marker = 'const defaultAiConfigs = ';
const start = source.indexOf(marker) + marker.length;
const end = source.indexOf('\n};', start) + 2;
const configs = JSON.parse(source.slice(start, end));
const result = {};
for (const id of ['robot', 'spirit', 'seed']) {
    result[id] = { image: `${id}.png`, actions: {} };
    for (const action of ['idle', 'move', 'sleep']) result[id].actions[action] = configs[id].actions[action];
}
fs.writeFileSync(path.join(root, 'experimental_word_learning_visuals.json'), JSON.stringify(result, null, 2) + '\n');
