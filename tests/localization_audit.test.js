const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const listeners = {};
const document = {
    body: null,
    documentElement: { lang: 'ru' },
    addEventListener: (name, handler) => { listeners[`document:${name}`] = handler; }
};
const window = {
    addEventListener: (name, handler) => { listeners[`window:${name}`] = handler; },
    clearInterval,
    setInterval,
    setTimeout
};
window.window = window;

vm.runInNewContext(fs.readFileSync('localization_audit_core.js', 'utf8'), {
    window,
    document,
    console,
    setTimeout,
    Promise
});

const audit = window.LocalizationAudit;
assert.ok(audit);
assert.strictEqual(audit.enabled, false);
assert.strictEqual(audit.containsJapaneseResidue('春 泡だて器 ところへ', 'ru'), true);
assert.strictEqual(audit.containsJapaneseResidue('Командный центр ИИ', 'ru'), false);
assert.strictEqual(audit.containsJapaneseResidue('春天到了', 'zh-CN'), false);
assert.strictEqual(audit.containsJapaneseResidue('泡だて器', 'zh-CN'), true);
assert.strictEqual(audit.containsJapaneseResidue('春', 'ja'), false);

const index = fs.readFileSync('index.html', 'utf8');
const electronMain = fs.readFileSync('electron_main.js', 'utf8');
const auditSource = fs.readFileSync('localization_audit_core.js', 'utf8');
assert.match(index, /localization_catalog\.js[\s\S]*localization_audit_core\.js[\s\S]*localization_core\.js/);
assert.match(electronMain, /ipcMain\.handle\('localization-audit:capture'/);
assert.match(electronMain, /webContents\.capturePage\(\)/);
assert.match(electronMain, /\.localization-audit/);
assert.match(auditSource, /panel\.setAttribute\('data-i18n-skip', ''\)/);
assert.doesNotMatch(auditSource, /GameI18n\.translate/);
assert.match(auditSource, /data-audit-drag-handle/);
assert.match(auditSource, /pointerdown[\s\S]*pointermove[\s\S]*pointerup/);

console.log('localization audit tests passed');
