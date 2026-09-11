const fs = require('fs');
const { execFile } = require('child_process');
const {
    LOCALES_DIR,
    extractMessages,
    localeFile,
    placeholderList,
    readJson,
    writeJson
} = require('./catalog_shared');

const TARGETS = {
    en: 'en',
    'zh-CN': 'zh-CN',
    ru: 'ru',
    'es-ES': 'es',
    'pt-BR': 'pt',
    de: 'de'
};
const CONCURRENCY = 2;
const MAX_BATCH_CHARS = 2400;
const MAX_BATCH_ITEMS = 120;
const MIN_REQUEST_INTERVAL_MS = 1100;
const KANA_RE = /[\u3040-\u30ff]/;
const JAPANESE_LETTER_RE = /[\u3041-\u3096\u30a1-\u30fa\u3400-\u9fff]/;
const POWERSHELL_TRANSLATE_COMMAND = [
    '$ProgressPreference = "SilentlyContinue"',
    '(Invoke-WebRequest -Uri $env:GAME_TRANSLATION_URL -UseBasicParsing -TimeoutSec 30).Content'
].join('; ');
let requestGate = Promise.resolve();
let nextRequestAt = 0;

function appearsUntranslated(locale, source, translated) {
    if (!translated) return true;
    if (!JAPANESE_LETTER_RE.test(source)) return false;
    const kanaCount = [...translated].filter(char => KANA_RE.test(char)).length;
    const visibleLength = Math.max(1, translated.replace(/\s/g, '').length);
    if (locale === 'zh-CN') return kanaCount / visibleLength > 0.35;
    if (translated === source) return true;
    return kanaCount / visibleLength > 0.35;
}

function protectPlaceholders(text) {
    return text.replace(/\{\{(\d+)\}\}/g, '[[PH$1]]');
}

function cleanTranslation(text) {
    return String(text || '')
        .trim()
        .replace(/["'“”‘’]\s*(\{\{\d+\}\})\s*["'“”‘’]/g, '$1')
        .replace(/\[\[\s*PH\s*(\d+)\s*\]\]/gi, '{{$1}}')
        .replace(/\{\s*(\d+)\s*\}\}/g, '{{$1}}')
        .replace(/\{\{\s*(\d+)\s*\}\}/g, '{{$1}}')
        .replace(/\s+([,.!?;:。！？、])/g, '$1');
}

function waitForRequestSlot() {
    const scheduled = requestGate.then(async () => {
        const delay = Math.max(0, nextRequestAt - Date.now());
        if (delay) await new Promise(done => setTimeout(done, delay));
        nextRequestAt = Date.now() + MIN_REQUEST_INTERVAL_MS;
    });
    requestGate = scheduled.catch(() => {});
    return scheduled;
}

async function requestTranslation(target, text, attempt = 0) {
    await waitForRequestSlot();
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ja&tl=${encodeURIComponent(target)}&dt=t&q=${encodeURIComponent(text)}`;

    return new Promise((resolve, reject) => {
        execFile(
            'powershell.exe',
            ['-NoProfile', '-NonInteractive', '-Command', POWERSHELL_TRANSLATE_COMMAND],
            {
                encoding: 'utf8',
                timeout: 40000,
                maxBuffer: 10 * 1024 * 1024,
                env: { ...process.env, GAME_TRANSLATION_URL: url }
            },
            async (error, stdout, stderr) => {
                if (!error) {
                    try {
                        const parsed = JSON.parse(String(stdout || '').replace(/^\uFEFF/, '').trim());
                        resolve((parsed[0] || []).map(part => part[0] || '').join(''));
                        return;
                    } catch (parseError) {
                        error = parseError;
                    }
                }
                if (attempt >= 6) {
                    reject(new Error(`${error.message}${stderr ? `\n${stderr.trim()}` : ''}`));
                    return;
                }
                await new Promise(done => setTimeout(done, 1500 * (2 ** attempt)));
                try {
                    resolve(await requestTranslation(target, text, attempt + 1));
                } catch (retryError) {
                    reject(retryError);
                }
            }
        );
    });
}

function makeBatches(messages) {
    const batches = [];
    let current = [];
    let currentLength = 0;
    for (const source of messages) {
        const protectedText = protectPlaceholders(source).replace(/\n/g, ' ⏎ ');
        const extraLength = protectedText.length + 24;
        if (current.length && (current.length >= MAX_BATCH_ITEMS || currentLength + extraLength > MAX_BATCH_CHARS)) {
            batches.push(current);
            current = [];
            currentLength = 0;
        }
        current.push({ source, protectedText });
        currentLength += extraLength;
    }
    if (current.length) batches.push(current);
    return batches;
}

function parseBatchTranslation(batch, translated) {
    const output = new Map();
    const marker = /\[\[\[(\d+)\]\]\]([\s\S]*?)(?=\[\[\[\d+\]\]\]|$)/g;
    let match;
    while ((match = marker.exec(translated))) {
        const index = Number(match[1]);
        if (!batch[index]) continue;
        output.set(batch[index].source, cleanTranslation(match[2].replace(/\s*⏎\s*/g, '\n')));
    }
    return output;
}

async function translateSingle(target, source) {
    const protectedText = protectPlaceholders(source).replace(/\n/g, ' ⏎ ');
    const translated = await requestTranslation(target, protectedText);
    return cleanTranslation(translated.replace(/\s*⏎\s*/g, '\n'));
}

async function translateBatch(locale, target, batch) {
    const body = batch.map((entry, index) => `[[[${index}]]]${entry.protectedText}`).join('\n');
    const translated = await requestTranslation(target, body);
    const parsed = parseBatchTranslation(batch, translated);

    for (const entry of batch) {
        const candidate = parsed.get(entry.source);
        const expected = placeholderList(entry.source).join('|');
        const actual = placeholderList(candidate || '').join('|');
        if (!candidate || expected !== actual || appearsUntranslated(locale, entry.source, candidate)) {
            parsed.set(entry.source, await translateSingle(target, entry.source));
        }
    }
    return parsed;
}

async function runPool(items, worker) {
    let cursor = 0;
    const workers = Array.from({ length: Math.min(CONCURRENCY, items.length) }, async () => {
        while (true) {
            const index = cursor++;
            if (index >= items.length) return;
            await worker(items[index], index);
        }
    });
    await Promise.all(workers);
}

async function translateLocale(locale, target, messages) {
    const file = localeFile(locale);
    const existing = readJson(file, {});
    const pending = messages.filter(source => {
        const translated = existing[source];
        return appearsUntranslated(locale, source, translated)
            || placeholderList(source).join('|') !== placeholderList(translated).join('|');
    });
    const batches = makeBatches(pending);
    process.stdout.write(`${locale}: ${pending.length} missing messages in ${batches.length} batches.\n`);

    let completed = 0;
    await runPool(batches, async batch => {
        const translated = await translateBatch(locale, target, batch);
        for (const [source, value] of translated) existing[source] = value;
        completed += batch.length;
        writeJson(file, existing);
        process.stdout.write(`${locale}: ${completed}/${pending.length}\n`);
    });

    const ordered = {};
    for (const source of messages) ordered[source] = existing[source] || '';
    writeJson(file, ordered);
}

async function main() {
    fs.mkdirSync(LOCALES_DIR, { recursive: true });
    const messages = extractMessages();
    const japanese = {};
    for (const source of messages) japanese[source] = source;
    writeJson(localeFile('ja'), japanese);

    const requested = process.argv.slice(2);
    const locales = requested.length ? requested : Object.keys(TARGETS);
    for (const locale of locales) {
        if (!TARGETS[locale]) throw new Error(`Unsupported locale: ${locale}`);
        await translateLocale(locale, TARGETS[locale], messages);
    }
}

main().catch(error => {
    process.stderr.write(`${error.stack || error}\n`);
    process.exit(1);
});
