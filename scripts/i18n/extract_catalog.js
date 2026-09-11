const fs = require('fs');
const {
    LOCALES_DIR,
    extractMessages,
    localeFile,
    readJson,
    writeJson
} = require('./catalog_shared');

fs.mkdirSync(LOCALES_DIR, { recursive: true });

const messages = extractMessages();
const previous = readJson(localeFile('ja'), {});
const next = {};
for (const source of messages) next[source] = previous[source] || source;
writeJson(localeFile('ja'), next);

process.stdout.write(`Extracted ${messages.length} Japanese display messages to locales/ja.json.\n`);
