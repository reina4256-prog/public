(function () {
    'use strict';

    const MAX_ISSUES_PER_KIND = 80;
    const SCAN_INTERVAL_MS = 2000;
    const NON_ZH_JAPANESE_RE = /[\u3040-\u30ff\u3400-\u9fff]/;
    const KANA_RE = /[\u3040-\u30ff]/;
    const SKIP_SELECTOR = [
        'script', 'style', 'noscript', 'template',
        'input', 'textarea', 'select', '[contenteditable="true"]',
        '[data-localization-audit-ui]', '[data-localization-audit-ignore]',
        '#loginOverlay', '[type="password"]'
    ].join(',');

    let enabled = false;
    let panel = null;
    let scanTimer = null;
    let lastScan = emptyScan();
    let canvasIssues = [];
    let dragState = null;
    const highlightedElements = new Set();

    function emptyScan() {
        return { residue: [], overflow: [], layout: [], scannedAt: null };
    }

    function currentLocale() {
        return window.GameI18n && window.GameI18n.language
            || document.documentElement && document.documentElement.lang
            || 'ja';
    }

    function containsJapaneseResidue(value, locale) {
        const text = String(value || '');
        if (!text || locale === 'ja') return false;
        return locale === 'zh-CN' ? KANA_RE.test(text) : NON_ZH_JAPANESE_RE.test(text);
    }

    function normalizeSnippet(value) {
        return String(value || '').replace(/\s+/g, ' ').trim().slice(0, 180);
    }

    function selectorFor(element) {
        if (!element || element.nodeType !== 1) return '';
        if (element.id) return `#${String(element.id).replace(/[^A-Za-z0-9_-]/g, '')}`;
        const classes = Array.from(element.classList || []).filter(name => !name.startsWith('lqa-')).slice(0, 2);
        return `${element.tagName.toLowerCase()}${classes.map(name => `.${name}`).join('')}`;
    }

    function rectangleOf(element) {
        const rect = element.getBoundingClientRect();
        return {
            x: Math.round(rect.x),
            y: Math.round(rect.y),
            width: Math.round(rect.width),
            height: Math.round(rect.height)
        };
    }

    function isSkipped(element) {
        if (!element || element.nodeType !== 1) return true;
        return !!element.closest(SKIP_SELECTOR);
    }

    function isVisible(element) {
        if (!element || isSkipped(element)) return false;
        const rect = element.getBoundingClientRect();
        if (rect.width < 1 || rect.height < 1) return false;
        if (rect.bottom <= 0 || rect.right <= 0 || rect.top >= window.innerHeight || rect.left >= window.innerWidth) return false;
        let current = element;
        while (current && current.nodeType === 1) {
            const style = window.getComputedStyle(current);
            if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) <= 0.01) return false;
            current = current.parentElement;
        }
        return true;
    }

    function clearHighlights() {
        for (const element of highlightedElements) {
            if (element && element.removeAttribute) element.removeAttribute('data-localization-audit-highlight');
        }
        highlightedElements.clear();
    }

    function movePanelWithinViewport(left, top) {
        if (!panel) return;
        const maxLeft = Math.max(0, window.innerWidth - panel.offsetWidth);
        const maxTop = Math.max(0, window.innerHeight - panel.offsetHeight);
        panel.style.right = 'auto';
        panel.style.left = `${Math.max(0, Math.min(left, maxLeft))}px`;
        panel.style.top = `${Math.max(0, Math.min(top, maxTop))}px`;
    }

    function startPanelDrag(event) {
        if (!panel || event.button !== 0) return;
        const rect = panel.getBoundingClientRect();
        dragState = { pointerId: event.pointerId, offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top };
        movePanelWithinViewport(rect.left, rect.top);
        if (event.currentTarget.setPointerCapture) event.currentTarget.setPointerCapture(event.pointerId);
        event.preventDefault();
    }

    function movePanelDrag(event) {
        if (!dragState || event.pointerId !== dragState.pointerId) return;
        movePanelWithinViewport(event.clientX - dragState.offsetX, event.clientY - dragState.offsetY);
        event.preventDefault();
    }

    function stopPanelDrag(event) {
        if (!dragState || event.pointerId !== dragState.pointerId) return;
        dragState = null;
    }

    function mark(element, kind) {
        if (!element || !element.setAttribute) return;
        const previous = element.getAttribute('data-localization-audit-highlight');
        const kinds = new Set(String(previous || '').split(' ').filter(Boolean));
        kinds.add(kind);
        element.setAttribute('data-localization-audit-highlight', Array.from(kinds).join(' '));
        highlightedElements.add(element);
    }

    function scanResidue(locale) {
        const issues = [];
        if (locale === 'ja' || !document.body) return issues;
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        let node;
        while (issues.length < MAX_ISSUES_PER_KIND && (node = walker.nextNode())) {
            const element = node.parentElement;
            const text = normalizeSnippet(node.data);
            if (!text || !containsJapaneseResidue(text, locale) || !isVisible(element)) continue;
            issues.push({ kind: 'dom-japanese-residue', selector: selectorFor(element), text, rect: rectangleOf(element) });
            mark(element, 'residue');
        }
        return issues;
    }

    function scanOverflow() {
        const issues = [];
        if (!document.body) return issues;
        const elements = document.body.querySelectorAll('*');
        for (const element of elements) {
            if (issues.length >= MAX_ISSUES_PER_KIND) break;
            if (!isVisible(element) || ['CANVAS', 'IMG', 'SVG', 'VIDEO'].includes(element.tagName)) continue;
            if (element.clientWidth < 6 || element.clientHeight < 6) continue;
            const text = normalizeSnippet(element.textContent);
            if (!text && element.id !== 'aiStatus') continue;
            const style = window.getComputedStyle(element);
            const intentionalEllipsis = style.textOverflow === 'ellipsis' && ['hidden', 'clip'].includes(style.overflowX);
            const horizontal = element.scrollWidth > element.clientWidth + 3
                && !['auto', 'scroll'].includes(style.overflowX)
                && !intentionalEllipsis;
            const vertical = element.scrollHeight > element.clientHeight + 3 && !['auto', 'scroll'].includes(style.overflowY);
            if (!horizontal && !vertical) continue;
            issues.push({
                kind: horizontal && vertical ? 'overflow-both' : horizontal ? 'overflow-horizontal' : 'overflow-vertical',
                selector: selectorFor(element),
                text: text.slice(0, 100),
                client: { width: element.clientWidth, height: element.clientHeight },
                scroll: { width: element.scrollWidth, height: element.scrollHeight },
                rect: rectangleOf(element)
            });
            mark(element, 'overflow');
        }
        return issues;
    }

    function scanStatusLayout() {
        const issues = [];
        const status = document.getElementById('aiStatus');
        if (!status || !isVisible(status)) return issues;
        const boxes = Array.from(status.querySelectorAll(':scope > .stat-box')).filter(isVisible);
        const valueTops = boxes.map(box => {
            const value = box.querySelector('.stat-val');
            return value && isVisible(value) ? value.getBoundingClientRect().top : null;
        }).filter(value => value !== null);
        if (valueTops.length > 1 && Math.max(...valueTops) - Math.min(...valueTops) > 4) {
            issues.push({
                kind: 'status-value-row-shift',
                selector: '#aiStatus',
                difference: Math.round(Math.max(...valueTops) - Math.min(...valueTops)),
                rect: rectangleOf(status)
            });
            mark(status, 'layout');
        }

        for (const box of boxes) {
            if (issues.length >= MAX_ISSUES_PER_KIND) break;
            const boxRect = box.getBoundingClientRect();
            const content = Array.from(box.querySelectorAll('.stat-label, .stat-val')).filter(isVisible);
            const outside = content.some(item => {
                const rect = item.getBoundingClientRect();
                return rect.left < boxRect.left - 1 || rect.right > boxRect.right + 1;
            });
            if (!outside) continue;
            issues.push({
                kind: 'status-content-outside-column',
                selector: selectorFor(box),
                text: normalizeSnippet(box.textContent).slice(0, 100),
                rect: rectangleOf(box)
            });
            mark(box, 'layout');
        }
        return issues;
    }

    function updatePanel() {
        if (!panel) return;
        const locale = currentLocale();
        const setText = (name, text) => {
            const target = panel.querySelector(`[data-audit-field="${name}"]`);
            if (target) target.textContent = text;
        };
        setText('locale', `現在の言語: ${locale}`);
        setText('residue', `DOM内の日本語残り: ${lastScan.residue.length}件`);
        setText('canvas', `Canvas内の日本語残り: ${canvasIssues.length}件`);
        setText('overflow', `はみ出し候補: ${lastScan.overflow.length}件`);
        setText('layout', `配置ずれ候補: ${lastScan.layout.length}件`);
    }

    function scanNow() {
        if (!enabled) return lastScan;
        clearHighlights();
        const locale = currentLocale();
        lastScan = {
            residue: scanResidue(locale),
            overflow: scanOverflow(),
            layout: scanStatusLayout(),
            scannedAt: new Date().toISOString()
        };
        updatePanel();
        return lastScan;
    }

    function recordCanvasText(record) {
        if (!enabled || !record) return;
        const locale = currentLocale();
        const translated = normalizeSnippet(record.translated);
        if (!containsJapaneseResidue(translated, locale)) return;
        const canvasId = record.canvas && record.canvas.id || '';
        const key = `${record.method}|${canvasId}|${translated}`;
        if (canvasIssues.some(issue => issue.key === key)) return;
        canvasIssues.push({
            key,
            kind: 'canvas-japanese-residue',
            method: String(record.method || ''),
            canvas: canvasId ? `#${canvasId}` : 'canvas',
            source: normalizeSnippet(record.source),
            text: translated
        });
        if (canvasIssues.length > MAX_ISSUES_PER_KIND) canvasIssues.shift();
        updatePanel();
    }

    function ipcRenderer() {
        try {
            if (typeof window.require !== 'function') return null;
            const electron = window.require('electron');
            return electron && electron.ipcRenderer || null;
        } catch (_) {
            return null;
        }
    }

    function animationFrame() {
        return new Promise(resolve => window.requestAnimationFrame(() => window.requestAnimationFrame(resolve)));
    }

    async function captureCurrentScreen() {
        if (!enabled || !panel) return null;
        scanNow();
        const ipc = ipcRenderer();
        const message = panel.querySelector('[data-audit-field="message"]');
        if (!ipc) {
            if (message) message.textContent = 'この保存機能はElectron版でのみ使用できます。';
            return { ok: false, error: 'Electron IPC unavailable' };
        }

        const report = {
            version: 1,
            locale: currentLocale(),
            capturedAt: new Date().toISOString(),
            viewport: { width: window.innerWidth, height: window.innerHeight, devicePixelRatio: window.devicePixelRatio || 1 },
            location: window.location && window.location.pathname || '',
            issues: {
                domJapaneseResidue: lastScan.residue,
                canvasJapaneseResidue: canvasIssues.map(({ key, ...issue }) => issue),
                overflow: lastScan.overflow,
                layout: lastScan.layout
            }
        };

        if (message) message.textContent = '現在の画面を保存しています...';
        panel.style.visibility = 'hidden';
        await animationFrame();
        let result;
        try {
            result = await ipc.invoke('localization-audit:capture', report);
        } catch (error) {
            result = { ok: false, error: error && error.message ? error.message : String(error) };
        } finally {
            panel.style.visibility = '';
        }
        if (message) {
            message.textContent = result && result.ok
                ? `保存しました: ${result.reportPath}`
                : `保存に失敗しました: ${result && result.error || 'unknown error'}`;
        }
        return result;
    }

    function startTimer() {
        if (scanTimer) window.clearInterval(scanTimer);
        scanTimer = window.setInterval(scanNow, SCAN_INTERVAL_MS);
    }

    function enable() {
        if (!panel) setupPanel();
        if (!panel || enabled) return;
        enabled = true;
        canvasIssues = [];
        panel.hidden = false;
        panel.setAttribute('aria-hidden', 'false');
        scanNow();
        startTimer();
    }

    function disable() {
        enabled = false;
        if (scanTimer) window.clearInterval(scanTimer);
        scanTimer = null;
        clearHighlights();
        if (panel) {
            panel.hidden = true;
            panel.setAttribute('aria-hidden', 'true');
        }
    }

    function toggle() {
        if (enabled) disable();
        else enable();
    }

    function setupPanel() {
        if (panel || !document.body) return;
        const style = document.createElement('style');
        style.setAttribute('data-localization-audit-ui', '');
        style.textContent = `
            [data-localization-audit-highlight~="residue"] { outline: 3px solid #ff2d55 !important; outline-offset: 1px !important; }
            [data-localization-audit-highlight~="overflow"] { box-shadow: inset 0 0 0 3px #ffb000 !important; }
            [data-localization-audit-highlight~="layout"] { outline: 3px dashed #00d5ff !important; outline-offset: 2px !important; }
            #localization-audit-panel { position: fixed; z-index: 2147483647; top: 12px; right: 12px; width: min(360px, calc(100vw - 24px)); box-sizing: border-box; padding: 14px; border: 2px solid #00d5ff; border-radius: 10px; background: rgba(12, 18, 24, 0.97); color: #fff; font: 13px/1.45 sans-serif; box-shadow: 0 8px 30px rgba(0,0,0,.65); }
            #localization-audit-panel[hidden] { display: none !important; }
            #localization-audit-panel h2 { margin: -4px -4px 8px; padding: 4px; color: #00d5ff; font-size: 17px; cursor: move; user-select: none; touch-action: none; }
            #localization-audit-panel p { margin: 5px 0; }
            #localization-audit-panel .audit-note { color: #b8c4cf; font-size: 12px; }
            #localization-audit-panel .audit-actions { display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap; }
            #localization-audit-panel button { border: 1px solid #5b7083; border-radius: 5px; padding: 6px 10px; background: #263746; color: #fff; cursor: pointer; }
            #localization-audit-panel button:hover { background: #365069; }
            #localization-audit-panel [data-audit-field="message"] { overflow-wrap: anywhere; color: #9fe7ff; font-size: 11px; }
        `;
        document.head.appendChild(style);

        panel = document.createElement('aside');
        panel.id = 'localization-audit-panel';
        panel.hidden = true;
        panel.setAttribute('aria-hidden', 'true');
        panel.setAttribute('data-localization-audit-ui', '');
        panel.setAttribute('data-i18n-skip', '');
        panel.innerHTML = `
            <h2 data-audit-drag-handle>ローカライズ監査モード</h2>
            <p class="audit-note">通常のテストプレイ中、気づいた画面だけ保存できます。進行状態やセーブデータは変更しません。</p>
            <p data-audit-field="locale"></p>
            <p data-audit-field="residue"></p>
            <p data-audit-field="canvas"></p>
            <p data-audit-field="overflow"></p>
            <p data-audit-field="layout"></p>
            <p class="audit-note">赤: 日本語残り / 黄: はみ出し / 水色: 配置ずれ</p>
            <div class="audit-actions">
                <button type="button" data-audit-action="scan">再スキャン</button>
                <button type="button" data-audit-action="capture">現在の画面を保存</button>
                <button type="button" data-audit-action="close">閉じる</button>
            </div>
            <p data-audit-field="message"></p>
            <p class="audit-note">Ctrl+Shift+L で表示・非表示を切り替えます。</p>
        `;
        panel.addEventListener('click', event => {
            const action = event.target && event.target.getAttribute && event.target.getAttribute('data-audit-action');
            if (action === 'scan') scanNow();
            else if (action === 'capture') captureCurrentScreen();
            else if (action === 'close') disable();
        });
        const dragHandle = panel.querySelector('[data-audit-drag-handle]');
        dragHandle.addEventListener('pointerdown', startPanelDrag);
        window.addEventListener('pointermove', movePanelDrag, { passive: false });
        window.addEventListener('pointerup', stopPanelDrag);
        window.addEventListener('pointercancel', stopPanelDrag);
        window.addEventListener('resize', () => {
            if (!panel || !panel.style.left) return;
            const rect = panel.getBoundingClientRect();
            movePanelWithinViewport(rect.left, rect.top);
        });
        document.body.appendChild(panel);
        updatePanel();
    }

    document.addEventListener('keydown', event => {
        if (event.repeat || !event.ctrlKey || !event.shiftKey || String(event.key).toLowerCase() !== 'l') return;
        event.preventDefault();
        toggle();
    }, true);

    window.addEventListener('game-language-changed', () => {
        canvasIssues = [];
        if (enabled) window.setTimeout(scanNow, 100);
        else updatePanel();
    });

    window.LocalizationAudit = {
        captureCurrentScreen,
        containsJapaneseResidue,
        disable,
        enable,
        get enabled() { return enabled; },
        get lastScan() { return lastScan; },
        recordCanvasText,
        scanNow,
        toggle
    };

    if (document.body) setupPanel();
    else document.addEventListener('DOMContentLoaded', setupPanel, { once: true });
})();
