(function () {
    'use strict';

    const STORAGE_KEY = 'ai_pet_language';
    const JAPANESE_RE = /[\u3040-\u30ff\u3400-\u9fff]/;
    const KANA_RE = /[\u3040-\u30ff]/g;
    const PLACEHOLDER_RE = /\{\{(\d+)\}\}/g;
    const ATTRIBUTE_NAMES = ['title', 'placeholder', 'aria-label', 'alt'];
    const LEGACY_SOURCE_ALIASES = Object.freeze({
        '泡だて器': '泡立て器',
        'いれる': '入れる',
        'イリュージョンカードパック': '幻影のカードパック'
    });
    const TRANSLATED_TEMPLATE_VALUE_SOURCES = new Set([
        '{{0}}のところへ',
        '{{0}} のテーマ',
        '{{0}} のテーマ（タイトルVer.）',
        '{{0}}が1階と階段で接続されていません。その階と接続元の階を「この階を初期配置に戻す」で復元してください。',
        '{{0}}で設備が重なっています。{{1}}と{{2}}がマス {{3}} を共有しています。どちらかを移動してください。',
        '{{0}}の{{1}} {{2}} に必要な床です。先に階段を別の有効な位置へ移動してください。',
        '{{0}}の{{1}}（位置 {{2}}, {{3}}）が入口マス {{4}} と重なっています。設備か入口を移動してください。',
        '{{0}}の{{1}}（位置 {{2}}, {{3}}）の{{4}} {{5}} が{{6}}で塞がれています。その設備または階段を移動し、空き床にしてください。',
        '{{0}}の{{1}}（位置 {{2}}, {{3}}）の{{4}} {{5}} に床がありません。そのマスを床にするか、階段を移動してください。',
        '{{0}}の{{1}}（位置 {{2}}, {{3}}）の設備が床の外にあります。設置マス {{4}} に床がありません。設備を床マスへ移動するか、そのマスへ床を移してください。',
        '{{0}}の{{1}}（位置 {{2}}, {{3}}）の設備が床の外にあります。本体マス {{4}} に床がありません。階段の画像全体が床に収まる位置へ移動するか、不足マスへ床を移してください。',
        '{{0}}の{{1}}（位置 {{2}}, {{3}}）の本体マス {{4}} が{{5}}と重なっています。どちらかの設備を移動してください。',
        '{{0}}の{{1}}（位置 {{2}}, {{3}}）の本体マス {{4}} が入口と重なっています。階段か入口を移動してください。'
    ]);
    const LANGUAGES = Object.freeze({
        ja: { label: '日本語', speech: 'ja-JP' },
        en: { label: 'English', speech: 'en-US' },
        'zh-CN': { label: '简体中文', speech: 'zh-CN' },
        ru: { label: 'Русский', speech: 'ru-RU' },
        'es-ES': { label: 'Español', speech: 'es-ES' },
        'pt-BR': { label: 'Português (Brasil)', speech: 'pt-BR' },
        de: { label: 'Deutsch', speech: 'de-DE' }
    });
    const textRecords = new WeakMap();
    const attributeRecords = new WeakMap();
    const compiledByLocale = new Map();
    const translationCache = new Map();
    let observer = null;

    function resolveLocale(value) {
        const language = String(value || '').replace('_', '-');
        if (LANGUAGES[language]) return language;
        const lower = language.toLowerCase();
        if (lower.startsWith('ja')) return 'ja';
        if (lower.startsWith('zh')) return 'zh-CN';
        if (lower.startsWith('ru')) return 'ru';
        if (lower.startsWith('es')) return 'es-ES';
        if (lower.startsWith('pt')) return 'pt-BR';
        if (lower.startsWith('de')) return 'de';
        return 'en';
    }

    function initialLocale() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) return resolveLocale(saved);
        } catch (_) {}
        return resolveLocale(navigator.languages && navigator.languages[0] || navigator.language || 'ja');
    }

    let currentLocale = initialLocale();

    function escapeRegExp(value) {
        return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function makeTemplate(source, translated) {
        const parts = [];
        const placeholderIndexes = [];
        let cursor = 0;
        let match;
        PLACEHOLDER_RE.lastIndex = 0;
        while ((match = PLACEHOLDER_RE.exec(source))) {
            parts.push(escapeRegExp(source.slice(cursor, match.index)));
            parts.push('([\\s\\S]*?)');
            placeholderIndexes.push(Number(match[1]));
            cursor = match.index + match[0].length;
        }
        parts.push(escapeRegExp(source.slice(cursor)));
        const literalLength = source.replace(PLACEHOLDER_RE, '').length;
        const firstLiteral = /^\{\{\d+\}\}/.test(source)
            ? '*'
            : source.replace(/^\{\{\d+\}\}/, '').charAt(0) || '*';
        return {
            source,
            translated,
            firstLiteral,
            literalLength,
            placeholderIndexes,
            regex: new RegExp(`^${parts.join('')}$`)
        };
    }

    function trieNode() {
        return { next: new Map(), value: null };
    }

    function compileLocale(locale) {
        if (compiledByLocale.has(locale)) return compiledByLocale.get(locale);
        const catalog = window.GAME_I18N_CATALOGS && window.GAME_I18N_CATALOGS[locale] || {};
        const templates = new Map();
        const trie = trieNode();
        const reverse = new Map();

        for (const [source, translated] of Object.entries(catalog)) {
            if (!source || !translated) continue;
            if (source.includes('{{')) {
                const template = makeTemplate(source, translated);
                const bucket = templates.get(template.firstLiteral) || [];
                bucket.push(template);
                templates.set(template.firstLiteral, bucket);
                continue;
            }

            const japaneseCharacters = (source.match(KANA_RE) || []).length;
            const kanjiCharacters = (source.match(/[\u3400-\u9fff]/g) || []).length;
            if (source.length >= 2 && source.length <= 100 && japaneseCharacters + kanjiCharacters >= 2) {
                let node = trie;
                for (const char of source) {
                    if (!node.next.has(char)) node.next.set(char, trieNode());
                    node = node.next.get(char);
                }
                node.value = translated;
            }

            if (source.length <= 60) {
                const reverseKey = translated.trim().toLocaleLowerCase(locale);
                const previous = reverse.get(reverseKey);
                if (!previous || source.length < previous.length) reverse.set(reverseKey, source);
            }
        }

        for (const bucket of templates.values()) bucket.sort((a, b) => b.literalLength - a.literalLength);
        const compiled = { catalog, templates, trie, reverse };
        compiledByLocale.set(locale, compiled);
        return compiled;
    }

    function applyTemplate(template, source) {
        const match = template.regex.exec(source);
        if (!match) return null;
        const values = new Map();
        const translateValues = TRANSLATED_TEMPLATE_VALUE_SOURCES.has(template.source);
        template.placeholderIndexes.forEach((placeholderIndex, captureIndex) => {
            const value = match[captureIndex + 1] ?? '';
            values.set(placeholderIndex, translateValues ? translateText(value) : value);
        });
        return template.translated.replace(PLACEHOLDER_RE, (_, index) => values.get(Number(index)) ?? '');
    }

    function translateByTemplate(compiled, source) {
        const keys = [source.charAt(0), '*'];
        for (const key of keys) {
            const bucket = compiled.templates.get(key);
            if (!bucket) continue;
            for (const template of bucket) {
                const translated = applyTemplate(template, source);
                if (translated !== null) return translated;
            }
        }
        return null;
    }

    function translateByTrie(compiled, source) {
        let output = '';
        let changed = false;
        let index = 0;
        while (index < source.length) {
            let node = compiled.trie;
            let cursor = index;
            let bestEnd = -1;
            let bestValue = '';
            while (cursor < source.length && node.next.has(source[cursor])) {
                node = node.next.get(source[cursor]);
                cursor += 1;
                if (node.value !== null) {
                    bestEnd = cursor;
                    bestValue = node.value;
                }
            }
            if (bestEnd !== -1) {
                output += bestValue;
                index = bestEnd;
                changed = true;
            } else {
                output += source[index++];
            }
        }
        return changed ? output : source;
    }

    function translateText(value) {
        if (typeof value !== 'string' || currentLocale === 'ja' || !JAPANESE_RE.test(value)) return value;
        const cacheKey = `${currentLocale}\u0000${value}`;
        if (translationCache.has(cacheKey)) return translationCache.get(cacheKey);
        const compiled = compileLocale(currentLocale);

        const leading = value.match(/^\s*/)[0];
        const trailing = value.match(/\s*$/)[0];
        const source = value.slice(leading.length, value.length - trailing.length || undefined);
        let translated = compiled.catalog[source];
        if (!translated) translated = translateByTemplate(compiled, source);
        if (!translated) translated = translateByTrie(compiled, source);
        const result = `${leading}${translated || source}${trailing}`;
        translationCache.set(cacheKey, result);
        return result;
    }

    function shouldSkipNode(node) {
        const parent = node && node.parentElement;
        return !parent || !!parent.closest('script, style, noscript, [data-i18n-skip], [contenteditable="true"]');
    }

    function localizeTextNode(node) {
        if (!node || node.nodeType !== Node.TEXT_NODE || shouldSkipNode(node)) return;
        const current = node.data;
        const previous = textRecords.get(node);
        if (previous && current === previous.translated) return;
        const source = previous && current === previous.source ? previous.source : current;
        const translated = translateText(source);
        textRecords.set(node, { source, translated });
        if (translated !== current) node.data = translated;
    }

    function localizeAttribute(element, name) {
        if (!element.hasAttribute(name) || element.closest('[data-i18n-skip]')) return;
        const current = element.getAttribute(name);
        let records = attributeRecords.get(element);
        if (!records) {
            records = {};
            attributeRecords.set(element, records);
        }
        const previous = records[name];
        if (previous && current === previous.translated) return;
        const source = previous && current === previous.source ? previous.source : current;
        const translated = translateText(source);
        records[name] = { source, translated };
        if (translated !== current) element.setAttribute(name, translated);
    }

    function localizeElement(element) {
        if (!element || element.nodeType !== Node.ELEMENT_NODE) return;
        for (const name of ATTRIBUTE_NAMES) localizeAttribute(element, name);
    }

    function localizeTree(root) {
        if (!root) return;
        if (root.nodeType === Node.TEXT_NODE) {
            localizeTextNode(root);
            return;
        }
        if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) return;
        if (root.nodeType === Node.ELEMENT_NODE) localizeElement(root);
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
        let node;
        while ((node = walker.nextNode())) {
            if (node.nodeType === Node.TEXT_NODE) localizeTextNode(node);
            else localizeElement(node);
        }
    }

    function sourceText(element) {
        if (!element) return '';
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
        const parts = [];
        let node;
        while ((node = walker.nextNode())) {
            const record = textRecords.get(node);
            parts.push(record ? record.source : node.data);
        }
        return parts.join('');
    }

    function toJapaneseInput(value) {
        const text = String(value || '').trim();
        if (!text || currentLocale === 'ja') return text;
        const compiled = compileLocale(currentLocale);
        const source = compiled.reverse.get(text.toLocaleLowerCase(currentLocale)) || text;
        return LEGACY_SOURCE_ALIASES[source] || source;
    }

    function installObserver() {
        if (observer || !document.documentElement) return;
        localizeTree(document.documentElement);
        observer = new MutationObserver(mutations => {
            for (const mutation of mutations) {
                if (mutation.type === 'characterData') localizeTextNode(mutation.target);
                else if (mutation.type === 'attributes') localizeAttribute(mutation.target, mutation.attributeName);
                else for (const node of mutation.addedNodes) localizeTree(node);
            }
        });
        observer.observe(document.documentElement, {
            subtree: true,
            childList: true,
            characterData: true,
            attributes: true,
            attributeFilter: ATTRIBUTE_NAMES
        });
    }

    function refreshRecordedText() {
        if (!document.documentElement) return;
        const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
        let node = document.documentElement;
        while (node) {
            if (node.nodeType === Node.TEXT_NODE) {
                const record = textRecords.get(node);
                if (record) {
                    const translated = translateText(record.source);
                    record.translated = translated;
                    if (node.data !== translated) node.data = translated;
                } else localizeTextNode(node);
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const records = attributeRecords.get(node);
                if (records) {
                    for (const [name, record] of Object.entries(records)) {
                        const translated = translateText(record.source);
                        record.translated = translated;
                        if (node.getAttribute(name) !== translated) node.setAttribute(name, translated);
                    }
                } else localizeElement(node);
            }
            node = walker.nextNode();
        }
    }

    function setLanguage(locale) {
        const next = resolveLocale(locale);
        if (next === currentLocale) return;
        currentLocale = next;
        window.currentLang = next;
        translationCache.clear();
        document.documentElement.lang = next;
        try { localStorage.setItem(STORAGE_KEY, next); } catch (_) {}
        refreshRecordedText();
        window.dispatchEvent(new CustomEvent('game-language-changed', { detail: { language: next } }));
    }

    function patchDialogs() {
        if (window.__gameI18nDialogsPatched) return;
        window.__gameI18nDialogsPatched = true;
        const originalAlert = window.alert && window.alert.bind(window);
        const originalConfirm = window.confirm && window.confirm.bind(window);
        const originalPrompt = window.prompt && window.prompt.bind(window);
        if (originalAlert) window.alert = message => originalAlert(translateText(String(message)));
        if (originalConfirm) window.confirm = message => originalConfirm(translateText(String(message)));
        if (originalPrompt) window.prompt = (message, defaultValue) => originalPrompt(translateText(String(message)), defaultValue);
    }

    function patchCanvas() {
        const proto = window.CanvasRenderingContext2D && window.CanvasRenderingContext2D.prototype;
        if (!proto || proto.__gameI18nPatched) return;
        Object.defineProperty(proto, '__gameI18nPatched', { value: true });
        for (const method of ['fillText', 'strokeText', 'measureText']) {
            const original = proto[method];
            if (typeof original !== 'function') continue;
            proto[method] = function (text, ...args) {
                const source = typeof text === 'string' ? text : String(text);
                const translated = translateText(source);
                const audit = window.LocalizationAudit;
                if (audit && typeof audit.recordCanvasText === 'function') {
                    audit.recordCanvasText({ method, source, translated, canvas: this.canvas });
                }
                return original.call(this, translated, ...args);
            };
        }
    }

    window.GameI18n = Object.freeze({
        languages: LANGUAGES,
        get language() { return currentLocale; },
        get speechLanguage() { return LANGUAGES[currentLocale].speech; },
        getSourceText: sourceText,
        localizeTree,
        resolveLocale,
        setLanguage,
        toJapaneseInput,
        translate: translateText
    });
    window.currentLang = currentLocale;
    window.getLocalizedSourceText = sourceText;
    window.setGameLanguage = setLanguage;
    window.translateGameText = translateText;

    document.documentElement.lang = currentLocale;
    patchDialogs();
    patchCanvas();
    installObserver();
})();
