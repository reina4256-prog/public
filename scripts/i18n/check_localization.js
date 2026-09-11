const fs = require('fs');
const path = require('path');
const {
    ROOT,
    extractMessages,
    localeFile,
    placeholderList,
    readJson
} = require('./catalog_shared');

const locales = ['en', 'zh-CN', 'ru', 'es-ES', 'pt-BR', 'de'];
const KANA_RE = /[\u3040-\u30ff]/;
const JAPANESE_LETTER_RE = /[\u3041-\u3096\u30a1-\u30fa\u3400-\u9fff]/;
const extracted = extractMessages();
const japaneseCatalog = readJson(localeFile('ja'), {});
const problems = [];

for (const source of extracted) {
    if (!Object.prototype.hasOwnProperty.call(japaneseCatalog, source)) {
        problems.push(`ja: missing source: ${source.slice(0, 160)}`);
    }
}

for (const locale of locales) {
    const catalog = readJson(localeFile(locale), {});
    for (const source of extracted) {
        const translated = catalog[source];
        if (!translated) {
            problems.push(`${locale}: missing: ${source.slice(0, 160)}`);
            continue;
        }
        const kanaCount = [...translated].filter(char => KANA_RE.test(char)).length;
        const visibleLength = Math.max(1, translated.replace(/\s/g, '').length);
        const needsSemanticTranslation = JAPANESE_LETTER_RE.test(source);
        const exactSourceIsUntranslated = locale !== 'zh-CN' && translated === source;
        if (needsSemanticTranslation && (exactSourceIsUntranslated || kanaCount / visibleLength > 0.35)) {
            problems.push(`${locale}: untranslated: ${source.slice(0, 160)}`);
        }
        const expectedPlaceholders = placeholderList(source).join('|');
        const actualPlaceholders = placeholderList(translated).join('|');
        if (expectedPlaceholders !== actualPlaceholders) {
            problems.push(`${locale}: placeholder mismatch: ${source.slice(0, 160)}`);
        }
    }
}

const runtimePath = path.join(ROOT, 'localization_catalog.js');
if (!fs.existsSync(runtimePath)) problems.push('localization_catalog.js is missing; run npm run i18n:build.');

if (problems.length) {
    process.stderr.write(`Localization check failed with ${problems.length} problem(s).\n`);
    process.stderr.write(`${problems.slice(0, 80).join('\n')}\n`);
    if (problems.length > 80) process.stderr.write(`...and ${problems.length - 80} more.\n`);
    process.exit(1);
}

process.stdout.write(`Localization check passed: ${extracted.length} messages across ${locales.length + 1} languages.\n`);
