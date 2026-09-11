const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const LOCALES_DIR = path.join(ROOT, 'locales');
const JAPANESE_RE = /[\u3040-\u30ff\u3400-\u9fff]/;
const PLACEHOLDER_RE = /\{\{\d+\}\}/g;
const SOURCE_EXTENSIONS = new Set(['.js', '.html']);
const SOURCE_EXCLUDES = new Set(['localization_catalog.js']);
const ATTRIBUTE_RE = /\b(?:title|placeholder|aria-label|alt)\s*=\s*(["'])([\s\S]*?)\1/gi;

function decodeEscapes(raw) {
    return raw
        .replace(/\\\r?\n/g, '')
        .replace(/\\u\{([0-9a-f]+)\}/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
        .replace(/\\u([0-9a-f]{4})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
        .replace(/\\x([0-9a-f]{2})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\t/g, '\t')
        .replace(/\\b/g, '\b')
        .replace(/\\f/g, '\f')
        .replace(/\\v/g, '\v')
        .replace(/\\([\\'"`$])/g, '$1');
}

function normalizeCandidate(value) {
    if (typeof value !== 'string') return '';
    let text = value
        .replace(/&nbsp;/gi, '\u00a0')
        .replace(/&amp;/gi, '&')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
        .replace(/\r\n?/g, '\n')
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n[ \t]+/g, '\n')
        .trim();
    if (!JAPANESE_RE.test(text)) return '';
    if (text.length > 1200) return '';
    if (/@keyframes|\b(?:position|transform|background(?:-color)?|border(?:-color)?|box-shadow)\s*:/i.test(text)) return '';
    if (text.length > 120 && !/[\s。、！？「」『』：:]/.test(text)) return '';
    const codeSignals = (text.match(/\b(?:const|let|var|function|return|window|document)\b|=>|===|\?\.|@keyframes/g) || []).length;
    if (text.includes('\n') && codeSignals >= 2) return '';
    return text;
}

function visibleMarkupText(value) {
    let output = '';
    let index = 0;
    let insideTag = false;
    let quote = '';
    while (index < value.length) {
        const char = value[index];
        if (!insideTag) {
            if (char === '<') {
                insideTag = true;
                output += '\n';
            } else {
                output += char;
            }
            index += 1;
            continue;
        }
        if (quote) {
            if (char === '\\') index += 2;
            else {
                if (char === quote) quote = '';
                index += 1;
            }
            continue;
        }
        if (char === '"' || char === "'") quote = char;
        else if (char === '>') insideTag = false;
        index += 1;
    }
    return output;
}

function addCandidate(set, value) {
    const normalized = normalizeCandidate(value);
    if (!normalized) return;
    set.add(normalized);

    if (normalized.includes('\n')) {
        for (const line of normalized.split(/\n+/)) {
            const part = normalizeCandidate(line);
            if (part && part.length >= 2) set.add(part);
        }
    }
}

function extractDisplayCandidates(set, value) {
    if (!JAPANESE_RE.test(value)) return;
    const looksLikeMarkup = /<[a-z!/][\s\S]*?>/i.test(value);
    if (!looksLikeMarkup) {
        addCandidate(set, value);
        return;
    }

    const withoutStyles = value
        .replace(/<style\b[\s\S]*?<\/style>/gi, '')
        .replace(/<script\b[\s\S]*?<\/script>/gi, '');

    let match;
    ATTRIBUTE_RE.lastIndex = 0;
    while ((match = ATTRIBUTE_RE.exec(withoutStyles))) addCandidate(set, match[2]);

    const contentProperty = /\bcontent\s*:\s*(["'])([\s\S]*?)\1/gi;
    while ((match = contentProperty.exec(value))) addCandidate(set, match[2]);

    const dialogInAttribute = /\b(?:alert|confirm|prompt)\s*\(\s*(["'])([\s\S]*?)\1/gi;
    while ((match = dialogInAttribute.exec(value))) addCandidate(set, match[2]);

    for (const piece of visibleMarkupText(withoutStyles).split(/\n+/g)) addCandidate(set, piece);
}

function scanJavaScriptStrings(source, onValue) {
    const length = source.length;
    let index = 0;

    function readQuoted(quote) {
        index += 1;
        let raw = '';
        while (index < length) {
            const char = source[index++];
            if (char === '\\' && index < length) {
                raw += char + source[index++];
                continue;
            }
            if (char === quote) break;
            raw += char;
        }
        onValue(decodeEscapes(raw));
    }

    function skipLineComment() {
        index += 2;
        while (index < length && source[index] !== '\n') index += 1;
    }

    function skipBlockComment() {
        index += 2;
        while (index < length && !(source[index] === '*' && source[index + 1] === '/')) index += 1;
        index = Math.min(length, index + 2);
    }

    function looksLikeRegexStart(position) {
        let cursor = position - 1;
        while (cursor >= 0 && /\s/.test(source[cursor])) cursor -= 1;
        if (cursor < 0 || /[([{:;,=!?&|+*%^~<>-]/.test(source[cursor])) return true;
        const before = source.slice(Math.max(0, cursor - 16), cursor + 1);
        return /(?:^|\b)(?:return|case|throw|typeof|instanceof|yield|await|in|of)\s*$/.test(before);
    }

    function skipRegex() {
        index += 1;
        let inClass = false;
        while (index < length) {
            const char = source[index++];
            if (char === '\\' && index < length) {
                index += 1;
                continue;
            }
            if (char === '[') inClass = true;
            else if (char === ']') inClass = false;
            else if (char === '/' && !inClass) break;
            else if (char === '\n' || char === '\r') break;
        }
        while (index < length && /[a-z]/i.test(source[index])) index += 1;
    }

    function readTemplate() {
        index += 1;
        let raw = '';
        let placeholderIndex = 0;
        while (index < length) {
            const char = source[index];
            if (char === '\\' && index + 1 < length) {
                raw += char + source[index + 1];
                index += 2;
                continue;
            }
            if (char === '`') {
                index += 1;
                break;
            }
            if (char === '$' && source[index + 1] === '{') {
                raw += `{{${placeholderIndex++}}}`;
                index += 2;
                readExpression();
                continue;
            }
            raw += char;
            index += 1;
        }
        onValue(decodeEscapes(raw));
    }

    function readExpression() {
        let depth = 1;
        while (index < length && depth > 0) {
            const char = source[index];
            if (char === "'" || char === '"') {
                readQuoted(char);
                continue;
            }
            if (char === '`') {
                readTemplate();
                continue;
            }
            if (char === '/' && source[index + 1] === '/') {
                skipLineComment();
                continue;
            }
            if (char === '/' && source[index + 1] === '*') {
                skipBlockComment();
                continue;
            }
            if (char === '/' && looksLikeRegexStart(index)) {
                skipRegex();
                continue;
            }
            if (char === '{') depth += 1;
            if (char === '}') depth -= 1;
            index += 1;
        }
    }

    while (index < length) {
        const char = source[index];
        if (char === "'" || char === '"') {
            readQuoted(char);
            continue;
        }
        if (char === '`') {
            readTemplate();
            continue;
        }
        if (char === '/' && source[index + 1] === '/') {
            skipLineComment();
            continue;
        }
        if (char === '/' && source[index + 1] === '*') {
            skipBlockComment();
            continue;
        }
        if (char === '/' && looksLikeRegexStart(index)) {
            skipRegex();
            continue;
        }
        index += 1;
    }
}

function extractFromHtml(source, set) {
    const scriptRe = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
    let match;
    while ((match = scriptRe.exec(source))) scanJavaScriptStrings(match[1], value => extractDisplayCandidates(set, value));

    const withoutCode = source
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/<script\b[\s\S]*?<\/script>/gi, '')
        .replace(/<style\b[\s\S]*?<\/style>/gi, '');

    ATTRIBUTE_RE.lastIndex = 0;
    while ((match = ATTRIBUTE_RE.exec(withoutCode))) addCandidate(set, match[2]);
    for (const piece of visibleMarkupText(withoutCode).split(/\n+/g)) addCandidate(set, piece);
}

function sourceFiles() {
    return fs.readdirSync(ROOT, { withFileTypes: true })
        .filter(entry => entry.isFile() && SOURCE_EXTENSIONS.has(path.extname(entry.name)) && !SOURCE_EXCLUDES.has(entry.name))
        .map(entry => path.join(ROOT, entry.name))
        .sort();
}

function extractMessages() {
    const set = new Set();
    for (const file of sourceFiles()) {
        const source = fs.readFileSync(file, 'utf8');
        if (path.extname(file) === '.html') extractFromHtml(source, set);
        else scanJavaScriptStrings(source, value => extractDisplayCandidates(set, value));
    }
    return [...set].sort((a, b) => a.localeCompare(b, 'ja'));
}

function readJson(file, fallback = {}) {
    if (!fs.existsSync(file)) return fallback;
    return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, value) {
    fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function localeFile(locale) {
    return path.join(LOCALES_DIR, `${locale}.json`);
}

function placeholderList(text) {
    return [...String(text).matchAll(PLACEHOLDER_RE)].map(match => match[0]).sort();
}

module.exports = {
    JAPANESE_RE,
    LOCALES_DIR,
    PLACEHOLDER_RE,
    ROOT,
    extractMessages,
    localeFile,
    placeholderList,
    readJson,
    writeJson
};
