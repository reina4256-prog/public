(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.ExperimentalWordAutoRecord = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';
    const copy = value => JSON.parse(JSON.stringify(value));
    function create(options = {}, host = globalThis) {
        let config, database, sessionId, sequence = 0, enabled = false, paused = false;
        let failed = false, lost = false, persisting = false, draining = false, stored = 0;
        const memory = [];
        const native = typeof host.wordStorage?.recordPersonalEvent === 'function';
        function status() {
            return { enabled, checking: !config, paused, sessionId, pending: memory.length + stored,
                status: failed || lost ? 'failed' : paused ? 'paused' : memory.length + stored ? 'pending' : 'saved' };
        }
        function notify() { try { options.onStatus?.(status()); } catch (_) { /* Diagnostics cannot stop play. */ } }
        function transaction(mode, operation) {
            return new Promise((resolve, reject) => {
                const tx = database.transaction('events', mode), store = tx.objectStore('events');
                let value;
                const request = operation(store);
                request.onsuccess = () => { value = request.result; };
                tx.oncomplete = () => resolve(value);
                tx.onerror = tx.onabort = () => reject(new Error('outbox'));
            });
        }
        function openDatabase() {
            return new Promise((resolve, reject) => {
                const request = host.indexedDB.open('word-personal-playtests', 1);
                request.onupgradeneeded = () => request.result.createObjectStore('events', { keyPath: 'id', autoIncrement: true });
                request.onsuccess = () => resolve(request.result);
                request.onerror = request.onblocked = () => reject(new Error('outbox'));
            });
        }
        async function drain() {
            if (draining || !database || !config?.available) return;
            draining = true;
            try {
                for (;;) {
                    const cursor = await transaction('readonly', store => store.openCursor());
                    if (!cursor) break;
                    const packet = cursor.value;
                    const response = await host.fetch('/__word_playtest/events', { method: 'POST', credentials: 'same-origin',
                        headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...packet, token: config.token }) });
                    const result = await response.json();
                    if (!response.ok || !result.ok || result.sequence !== packet.sequence) throw new Error('append');
                    await transaction('readwrite', store => store.delete(packet.id)); stored--;
                    failed = false;
                }
            } catch (_) { failed = true; }
            finally { draining = false; notify(); }
        }
        async function persist() {
            if (persisting || !enabled || !config?.available) return;
            persisting = true;
            try {
                while (memory.length) {
                    const packet = memory[0];
                    if (native) {
                        const result = host.wordStorage.recordPersonalEvent(packet);
                        if (!result?.ok || result.sequence !== packet.sequence) throw new Error('append');
                    } else {
                        if (!database) break;
                        await transaction('readwrite', store => store.add(packet)); stored++;
                    }
                    memory.shift(); failed = false;
                }
            } catch (_) { failed = true; }
            finally { persisting = false; notify(); if (!native) void drain(); }
        }
        function record(kind, data, at = Date.now()) {
            if (!sessionId || paused || config && !enabled) return;
            try {
                const event = copy({ kind, at, ...data });
                memory.push({ sessionId, sequence: ++sequence, event });
                notify(); if (config?.available) void persist(); else void ready.then(persist);
            } catch (_) { lost = true; notify(); }
        }
        function start(initial) {
            if (paused || config && !enabled) return;
            try {
                sessionId = host.crypto.randomUUID(); sequence = 0;
                record('session', { format: 'word-learning-personal-playtest', version: 1,
                    runtime: copy(config?.version || null), initial });
            } catch (_) { lost = true; notify(); }
        }
        const ready = (async () => {
            try {
                // Discover the explicit local capability first. Existing preview windows
                // without a diagnostics IPC handler must never send a synchronous IPC call.
                const response = await host.fetch('/__word_playtest/config', { credentials: 'same-origin' });
                if (!response.ok) { config = { enabled: false }; memory.length = 0; return; }
                config = await response.json();
                enabled = config.enabled === true;
                if (!enabled) { memory.length = 0; return; }
                if (!config.available) throw new Error('storage');
                if (!native) {
                    database = await openDatabase();
                    database.onversionchange = () => { database.close(); database = null; failed = true; notify(); };
                    stored = await transaction('readonly', store => store.count());
                }
            } catch (_) {
                failed = true;
                if (!enabled) { config = { enabled: false }; memory.length = 0; }
            }
            finally { notify(); }
        })();
        // Attach identity only to new session headers, never rewrite recovered outbox rows.
        ready.then(() => {
            for (const packet of memory) if (packet.event.kind === 'session') packet.event.runtime = copy(config?.version || null);
            void persist(); if (!native) void drain();
        });
        const timer = host.setInterval(() => { void persist(); if (!native) void drain(); }, 3000);
        host.addEventListener?.('pagehide', () => { void persist(); });
        return Object.freeze({ ready, status, record,
            snapshot(value) { try { return copy(value); } catch (_) { lost = true; notify(); return null; } },
            start,
            pause() { paused = true; sessionId = null; notify(); },
            resume(initial) { paused = false; this.start(initial); notify(); },
            async flush() { await ready; await persist(); if (!native) await drain(); return status(); },
            close() { host.clearInterval(timer); database?.close(); }
        });
    }
    return Object.freeze({ create });
});
