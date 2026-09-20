// Shared scene host and independently owned simulation pauses.
(() => {
    'use strict';
    const pauses = new Map();
    const overlays = new Map();
    const scenes = [];
    let pausedAt = null;
    let excludedMs = 0;
    let legacyPaused = !!window.isGamePaused;
    let observer;
    let pauseClockSuspended = false;
    const byId = id => document.getElementById(id);
    const current = () => scenes[scenes.length - 1] || null;
    const isPaused = () => legacyPaused || pauses.size > 0 || !!window.ScheduleRuntime?.absent;

    // Preserve old callers without allowing their `false` to release another owner.
    Object.defineProperty(window, 'isGamePaused', {
        configurable: true,
        get: isPaused,
        set(value) { legacyPaused = !!value; }
    });

    function shiftWorldClocks(elapsed) {
        const seen = new Set();
        const visit = value => {
            if (!value || typeof value !== 'object' || seen.has(value)) return;
            seen.add(value);
            for (const [key, child] of Object.entries(value)) {
                if (['freshnessStartedAt', 'freshnessFrozenAt'].includes(key) && Number.isFinite(child)) {
                    value[key] += elapsed;
                } else if (child && typeof child === 'object') visit(child);
            }
        };
        visit(window.aiPet);
        if (typeof assets !== 'undefined') visit(assets);
        if (typeof party !== 'undefined') visit(party);
        const state = window.aiPet && window.aiPet.myHomeIndoor;
        if (state) {
            state.dropClockOffsetMs = (Number(state.dropClockOffsetMs) || 0) + elapsed;
            for (const [object, key] of [[state.visitor, 'leaveAt'], [state.tableDish, 'until'],
                [state.player, 'speechUntil'], [state.concierge, 'speechUntil'], [state.visitor, 'speechUntil']]) {
                if (object && Number(object[key]) > 0) object[key] += elapsed;
            }
        }
    }

    function flushPausedTime() {
        if (pausedAt === null || pauseClockSuspended) return;
        const now = Date.now();
        const elapsed = Math.max(0, now - pausedAt);
        shiftWorldClocks(elapsed);
        excludedMs += elapsed;
        pausedAt = now;
    }

    function suspendPauseClock(value) {
        if (value) flushPausedTime();
        pauseClockSuspended = value;
        if (!value && pausedAt !== null) pausedAt = Date.now();
    }

    function acquirePause(owner) {
        const token = Symbol(owner);
        if (!pauses.size) pausedAt = Date.now();
        pauses.set(token, owner);
        return token;
    }

    function releasePause(token) {
        if (!pauses.has(token)) return false;
        flushPausedTime();
        pauses.delete(token);
        if (!pauses.size) pausedAt = null;
        return true;
    }

    function focusFirst(root) {
        const target = root.querySelector('button:not([disabled]), input:not([disabled]), select, textarea, [tabindex="0"]') || root;
        if (target === root && !root.hasAttribute('tabindex')) root.tabIndex = -1;
        target.focus({ preventScroll: true });
    }

    function topOverlay() {
        return Array.from(overlays.keys()).sort((a, b) =>
            (Number(getComputedStyle(a).zIndex) || 0) - (Number(getComputedStyle(b).zIndex) || 0)).pop();
    }

    function syncInput() {
        const top = topOverlay();
        const shell = byId('main-container');
        if (shell) shell.inert = !!top && !shell.contains(top);
        for (const root of overlays.keys()) root.inert = root !== top && !root.contains(top);
    }

    function beginExclusive(root, owner = root.id || 'content') {
        if (overlays.has(root)) return overlays.get(root).token;
        const record = { token: acquirePause(owner), focus: document.activeElement, inert: root.inert };
        overlays.set(root, record);
        syncInput();
        focusFirst(root);
        return record.token;
    }

    function endExclusive(root) {
        const record = overlays.get(root);
        if (!record) return;
        overlays.delete(root);
        root.inert = record.inert;
        releasePause(record.token);
        syncInput();
        if (!overlays.size && current()?.options.resume) current().options.resume();
        const top = topOverlay();
        if (record.focus && record.focus.isConnected && (!top || top.contains(record.focus))) {
            record.focus.focus({ preventScroll: true });
        } else if (top) focusFirst(top);
    }

    // Content clocks run before the world-pause gate, never through pet.update().
    function setExclusiveUpdate(root, update) {
        beginExclusive(root);
        overlays.get(root).update = update;
    }

    function tickExclusive() {
        const root = topOverlay();
        const record = overlays.get(root);
        if (!record?.update || !visible(root)) return false;
        if (!legacyPaused && pauses.size === 1) record.update();
        return true;
    }

    function visible(root) {
        if (!root.isConnected || root.hidden) return false;
        const style = getComputedStyle(root);
        return style.display !== 'none' && style.visibility !== 'hidden' && root.getClientRects().length > 0;
    }

    // Compatibility adapter for existing full-screen UIs. New content can call
    // beginExclusive/endExclusive directly; removal or display:none also releases it.
    function syncOverlays() {
        const legacyIndoor = ['casino-map-ui', 'castle-map-ui', 'dungeon-ui']
            .some(id => { const root = byId(id); return root && visible(root); });
        const active = !!current() || (!legacyIndoor && typeof currentMode !== 'undefined' && currentMode === 'play');
        const candidates = active ? document.querySelectorAll('.overlay, [data-game-exclusive], body > div, #game-container > div') : [];
        for (const root of candidates) {
            if (root === byId('game-container') || root === byId('main-container') || !visible(root)) continue;
            const style = getComputedStyle(root);
            const rect = root.getBoundingClientRect();
            if (root.matches('.overlay, [data-game-exclusive]') || (style.position === 'fixed' && rect.width >= window.innerWidth * .9 && rect.height >= window.innerHeight * .9)) {
                beginExclusive(root);
            }
        }
        // Acquire replacements before releasing old owners: a dialogue-to-editor
        // transition must never briefly run background simulation.
        for (const root of Array.from(overlays.keys())) if (!visible(root)) endExclusive(root);
        syncInput();
    }

    function enterScene(id, element, options = {}) {
        if (current() && current().id === id) return current();
        const host = byId('scene-host');
        if (!host) throw new Error('Missing scene host');
        const previous = current();
        if (previous) previous.element.hidden = true;
        const scene = { id, element, options, focus: document.activeElement };
        scenes.push(scene);
        host.appendChild(element);
        host.hidden = false;
        byId('canvas-wrapper').classList.add('has-indoor-scene');
        byId('main-container').dataset.scene = id;
        syncOverlays();
        return scene;
    }

    function leaveScene(id) {
        const scene = current();
        if (!scene || scene.id !== id) return false;
        scenes.pop();
        scene.element.remove();
        if (scene.options.dispose) scene.options.dispose();
        const previous = current();
        if (previous) previous.element.hidden = false;
        byId('scene-host').hidden = !previous;
        byId('canvas-wrapper').classList.toggle('has-indoor-scene', !!previous);
        byId('main-container').dataset.scene = previous ? previous.id : 'island';
        syncOverlays();
        if (!topOverlay() && scene.focus && scene.focus.isConnected) scene.focus.focus({ preventScroll: true });
        return true;
    }

    function enterFacility(id, element, options = {}) {
        if (current()?.id === id) return current();
        const ai = window.aiPet;
        const origin = ai ? { x: ai.x, y: ai.y } : null;
        const oldCamera = typeof camera !== 'undefined' ? { ...camera } : null;
        element.classList.add('central-facility');
        const scene = enterScene(id, element, {
            ...options,
            dispose() {
                if (origin && window.aiPet === ai) Object.assign(ai, origin);
                if (oldCamera && typeof camera !== 'undefined') Object.assign(camera, oldCamera);
                options.dispose?.();
            }
        });
        return scene;
    }

    function routeChat(text) {
        if (isPaused()) return true;
        const scene = current();
        if (!scene || !scene.options.chat) return false;
        return scene.options.chat(text) !== false;
    }

    function deferScene(callback, delay = 0) {
        const scene = current();
        const run = () => {
            if (current() !== scene) return;
            if (isPaused()) { setTimeout(run, 50); return; }
            callback();
        };
        return setTimeout(run, delay);
    }

    function initialize() {
        observer = new MutationObserver(syncOverlays);
        observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class', 'hidden'] });
        // Do not allow global game shortcuts or focus helpers to consume content input.
        for (const type of ['keydown', 'keyup', 'click', 'pointerdown', 'mousedown', 'touchstart', 'wheel']) {
            document.addEventListener(type, event => {
                const top = topOverlay();
                if (!top) return;
                if (!top.contains(event.target)) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    return;
                }
                if (type === 'keydown' && event.key === 'Tab') {
                    const items = Array.from(top.querySelectorAll('button:not([disabled]), input:not([disabled]), select, textarea, [tabindex="0"]')).filter(visible);
                    if (!items.length) { event.preventDefault(); focusFirst(top); return; }
                    const index = items.indexOf(document.activeElement);
                    if (event.shiftKey && index <= 0) { event.preventDefault(); items[items.length - 1].focus(); }
                    else if (!event.shiftKey && (index < 0 || index === items.length - 1)) { event.preventDefault(); items[0].focus(); }
                }
            }, { capture: true, passive: false });
        }
        document.addEventListener('focusin', event => {
            const top = topOverlay();
            if (top && !top.contains(event.target)) focusFirst(top);
        });
        window.addEventListener('resize', () => { if (current()?.options.resize) current().options.resize(); });
    }

    window.GameShell = { acquirePause, releasePause, isPaused, beginExclusive, endExclusive,
        enterScene, enterFacility, leaveScene, routeChat, deferScene, syncOverlays, flushPausedTime,
        setExclusiveUpdate, tickExclusive, suspendPauseClock,
        get currentScene() { return current()?.id || 'island'; },
        get exclusiveOpen() { return overlays.size > 0; },
        worldNow: () => pausedAt === null ? Date.now() : pausedAt,
        activeTime: () => Date.now() - excludedMs - (pausedAt === null ? 0 : Date.now() - pausedAt) };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize);
    else initialize();
})();
