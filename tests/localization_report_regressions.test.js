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

const window = {
    alert: () => {},
    confirm: () => true,
    prompt: () => '',
    CanvasRenderingContext2D,
    dispatchEvent: () => {}
};
window.window = window;

const context = {
    window,
    document,
    Node: { TEXT_NODE: 3, ELEMENT_NODE: 1, DOCUMENT_NODE: 9 },
    NodeFilter: { SHOW_ELEMENT: 1, SHOW_TEXT: 4 },
    navigator: { language: 'ru-RU', languages: ['ru-RU'] },
    localStorage: {
        getItem: key => key === 'ai_pet_language' ? 'ru' : null,
        setItem: () => {}
    },
    MutationObserver,
    CustomEvent: class {},
    CanvasRenderingContext2D,
    console
};

vm.runInNewContext(fs.readFileSync('localization_catalog.js', 'utf8'), context);
vm.runInNewContext(fs.readFileSync('localization_core.js', 'utf8'), context);

const translate = source => window.GameI18n.translate(source);
assert.strictEqual(translate('- クリックして開始 -'), '- Нажмите, чтобы начать -');
assert.strictEqual(translate('2個'), '2 штук');
assert.strictEqual(translate('3個設置済み'), 'Установлено: 3');
assert.strictEqual(translate('110 / 312 語'), '110 / 312 слова');
assert.strictEqual(translate('建築士のところへ'), 'К Архитектор');
assert.strictEqual(translate('森の精霊 のテーマ'), 'Тема: Дух леса');
assert.strictEqual(translate('森の精霊 のテーマ（タイトルVer.）'), 'Тема: Дух леса (титульная версия)');
assert.strictEqual(translate('60 G (借金)'), '60 G (долг)');
assert.strictEqual(translate('泡だて器'), 'Венчик');
assert.strictEqual(translate('いれる'), 'Положить');
assert.strictEqual(translate('イリュージョンカードパック'), 'Пакет карт «Призрак»');

console.log('localization report regression tests passed');
