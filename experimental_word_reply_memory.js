(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.ExperimentalWordReplyMemory = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';
    const locales = ['ja', 'en', 'zh-CN', 'ru', 'es-ES', 'pt-BR', 'de'];
    // Retain what the player said, not an inferred fact, learned meaning, or generated answer.
    function valid(memory) {
        if (memory === undefined) return true;
        if (!memory || memory.version !== 1 || !Array.isArray(memory.entries)) return false;
        const seen = new Set();
        return memory.entries.every(e => {
            if (!e || typeof e.inputId !== 'string' || !/^input:\d+$/.test(e.inputId) || seen.has(e.inputId)
                || e.speaker !== 'player' || !locales.includes(e.locale) || !Number.isFinite(e.at)
                || typeof e.raw !== 'string' || !e.raw.trim()) return false;
            seen.add(e.inputId); return true;
        });
    }
    function remember(state, input) {
        if (input?.speaker !== 'player' || !valid({ version: 1, entries: [{ inputId: input.id,
            raw: input.raw, locale: input.locale, at: input.at, speaker: input.speaker }] })) return false;
        if (state.replyMemory?.entries.some(e => e.inputId === input.id)) return false;
        state.replyMemory ||= { version: 1, entries: [] };
        state.replyMemory.entries.push({ inputId: input.id, raw: input.raw, locale: input.locale, at: input.at, speaker: input.speaker });
        return true;
    }
    function notes(state) {
        return (state.replyMemory?.entries || []).map(e => ({ group: 'conversations', message: 'conversation_note',
            detail: 'conversation_note_detail', literal: e.raw, sourceId: e.inputId, organized: false }));
    }
    function grams(text) {
        const normalized = text.normalize('NFKC').toLowerCase().replace(/[\p{P}\p{Z}\p{S}]/gu, '');
        return new Set(Array.from(normalized).slice(0, 4000).map((c, i, a) => c + (a[i + 1] || '')));
    }
    function context(state, query, excludeId) {
        const entries = (state.replyMemory?.entries || []).filter(e => e.inputId !== excludeId);
        const wanted = grams(query);
        const ranked = entries.map((e, index) => ({ e, index, score: [...grams(e.raw)].filter(g => wanted.has(g)).length }))
            .filter(e => e.score > 0).sort((a, b) => b.score - a.score || b.index - a.index);
        // Prefer the latest four plus relevant older sources, with a fixed transmission budget.
        const selected = new Set(entries.slice(-4));
        for (const { e } of ranked) { if (selected.size >= 12) break; selected.add(e); }
        let remaining = 8000;
        return entries.filter(e => selected.has(e)).reverse().map(e => {
            const text = e.raw.slice(0, Math.min(1200, remaining)); remaining -= text.length;
            return { inputId: e.inputId, speaker: e.speaker, locale: e.locale, at: e.at, text, truncated: text.length < e.raw.length };
        }).filter(e => e.text).reverse();
    }
    return { valid, remember, notes, context };
});
