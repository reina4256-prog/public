const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const root = { nodeType: 1, lang: '', hasAttribute: () => false, closest: () => null };
const document = {
    documentElement: root,
    body: null,
    createTreeWalker: () => ({ nextNode: () => null }),
    addEventListener: () => {},
    getElementById: () => null
};
class MutationObserver { observe() {} }
class CanvasRenderingContext2D {
    fillText(text) { return text; }
    strokeText(text) { return text; }
    measureText(text) { return { text }; }
}

const storage = new Map([['ai_pet_language', 'en']]);
const exact = '\u9032\u5316\u53ef\u80fd';
const template = '\u6b8b\u308a {{0}} \u5206';
const funds = '\u6240\u6301\u91d1';
const insufficient = '\u8db3\u308a\u307e\u305b\u3093';
const installedTemplate = '{{0}}\u500b\u8a2d\u7f6e\u6e08\u307f';
const wordsTemplate = '{{1}} / {{2}} \u8a9e';
const destinationTemplate = '{{0}}\u306e\u3068\u3053\u308d\u3078';
const stairErrorTemplate = '{{0}}\u306e{{1}}\uff08\u4f4d\u7f6e {{2}}, {{3}}\uff09\u306e{{4}} {{5}} \u306b\u5e8a\u304c\u3042\u308a\u307e\u305b\u3093\u3002\u305d\u306e\u30de\u30b9\u3092\u5e8a\u306b\u3059\u308b\u304b\u3001\u968e\u6bb5\u3092\u79fb\u52d5\u3057\u3066\u304f\u3060\u3055\u3044\u3002';
const canvasAuditRecords = [];
const window = {
    GAME_I18N_CATALOGS: {
        en: {
            [exact]: 'Evolution available',
            [template]: '{{0}} minutes remaining',
            [funds]: 'Funds',
            [insufficient]: 'insufficient',
            [installedTemplate]: '{{0}} installed',
            [wordsTemplate]: '{{1}} / {{2}} words',
            [destinationTemplate]: 'Go to {{0}}',
            [stairErrorTemplate]: 'There is no floor at the {{4}} {{5}} for {{1}} at {{2}}, {{3}} on {{0}}. Add a floor tile there or move the stairs.',
            '\u5efa\u7bc9\u58eb': 'Architect',
            '\u5730\u4e0b1\u968e': 'Basement 1',
            '\u4e0a\u308a\u968e\u6bb5': 'up stairs',
            '\u9032\u5165\u30fb\u9000\u51fa\u30de\u30b9': 'entry/exit cell'
        }
    },
    alert: () => {},
    confirm: () => true,
    prompt: () => '',
    CanvasRenderingContext2D,
    LocalizationAudit: {
        recordCanvasText: record => canvasAuditRecords.push(record)
    },
    dispatchEvent: () => {}
};
window.window = window;

const context = {
    window,
    document,
    Node: { TEXT_NODE: 3, ELEMENT_NODE: 1, DOCUMENT_NODE: 9 },
    NodeFilter: { SHOW_ELEMENT: 1, SHOW_TEXT: 4 },
    navigator: { language: 'en-US', languages: ['en-US'] },
    localStorage: {
        getItem: key => storage.get(key) || null,
        setItem: (key, value) => storage.set(key, value)
    },
    MutationObserver,
    CustomEvent: class {},
    CanvasRenderingContext2D,
    console
};

vm.runInNewContext(fs.readFileSync('localization_core.js', 'utf8'), context);

assert.strictEqual(window.GameI18n.language, 'en');
assert.strictEqual(window.GameI18n.translate(exact), 'Evolution available');
assert.strictEqual(window.GameI18n.translate('\u6b8b\u308a 12 \u5206'), '12 minutes remaining');
assert.strictEqual(window.GameI18n.translate(`${funds}\u304c${insufficient}`), 'Funds\u304cinsufficient');
assert.strictEqual(window.GameI18n.toJapaneseInput('Evolution available'), exact);
assert.strictEqual(window.GameI18n.translate('3\u500b\u8a2d\u7f6e\u6e08\u307f'), '3 installed');
assert.strictEqual(window.GameI18n.translate('110 / 312 \u8a9e'), '110 / 312 words');
assert.strictEqual(window.GameI18n.translate('\u5efa\u7bc9\u58eb\u306e\u3068\u3053\u308d\u3078'), 'Go to Architect');
assert.strictEqual(
    window.GameI18n.translate('\u5730\u4e0b1\u968e\u306e\u4e0a\u308a\u968e\u6bb5\uff08\u4f4d\u7f6e 7, 5\uff09\u306e\u9032\u5165\u30fb\u9000\u51fa\u30de\u30b9 (7, 8) \u306b\u5e8a\u304c\u3042\u308a\u307e\u305b\u3093\u3002\u305d\u306e\u30de\u30b9\u3092\u5e8a\u306b\u3059\u308b\u304b\u3001\u968e\u6bb5\u3092\u79fb\u52d5\u3057\u3066\u304f\u3060\u3055\u3044\u3002'),
    'There is no floor at the entry/exit cell (7, 8) for up stairs at 7, 5 on Basement 1. Add a floor tile there or move the stairs.'
);
const canvasContext = new CanvasRenderingContext2D();
assert.strictEqual(canvasContext.fillText(exact), 'Evolution available');
assert.strictEqual(canvasAuditRecords.length, 1);
assert.strictEqual(canvasAuditRecords[0].source, exact);
assert.strictEqual(canvasAuditRecords[0].translated, 'Evolution available');

console.log('localization runtime tests passed');
