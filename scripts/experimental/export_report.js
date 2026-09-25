'use strict';
const fs = require('node:fs');
async function exportReport(dialog, parent, payload, writeFile = fs.promises.writeFile) {
    if (typeof payload?.text !== 'string' || Buffer.byteLength(payload.text, 'utf8') > 64 * 1024 * 1024
        || typeof payload.title !== 'string' || payload.title.length > 200) return { ok: false };
    try {
        const report = JSON.parse(payload.text);
        if (report.format !== 'word-learning-playtest' || report.version !== 1) return { ok: false };
        const result = await dialog.showSaveDialog(parent, { title: payload.title,
            defaultPath: `word-learning-report-${new Date().toISOString().replace(/[:.]/g, '-')}.json`,
            filters: [{ name: 'JSON', extensions: ['json'] }], properties: ['showOverwriteConfirmation'] });
        if (result.canceled || !result.filePath) return { ok: true, canceled: true };
        await writeFile(result.filePath, payload.text, 'utf8');
        return { ok: true };
    } catch (_) { return { ok: false }; }
}
module.exports = { exportReport };
