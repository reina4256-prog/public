(function (root, factory) {
    'use strict';
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else root.ExperimentalWordVoiceCache = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';
    function create(host) {
        const encoded = new Map(), decoded = new Map();
        let bytes = 0, decodedBytes = 0;
        const valid = data => data instanceof ArrayBuffer && data.byteLength > 0 && data.byteLength <= 4 * 1024 * 1024;
        function remember(key, data) {
            if (!valid(data)) return;
            if (encoded.has(key)) bytes -= encoded.get(key).byteLength;
            encoded.delete(key); encoded.set(key, data.slice(0)); bytes += data.byteLength;
            while (bytes > 16 * 1024 * 1024 || encoded.size > 64) {
                const first = encoded.keys().next().value; bytes -= encoded.get(first).byteLength; encoded.delete(first);
            }
        }
        async function diskKey(key) {
            if (!host.crypto?.subtle || !host.wordVoiceCache) return null;
            const data = new TextEncoder().encode(key);
            return Array.from(new Uint8Array(await host.crypto.subtle.digest('SHA-256', data)), b => b.toString(16).padStart(2, '0')).join('');
        }
        async function bounded(operation) {
            let timer;
            try { return await Promise.race([operation, new Promise(resolve => { timer = setTimeout(() => resolve(null), 5000); })]); }
            catch (_) { return null; } finally { clearTimeout(timer); }
        }
        return {
            async get(key, persistent) {
                const found = encoded.get(key);
                if (found) { encoded.delete(key); encoded.set(key, found); return found.slice(0); }
                if (!persistent) return null;
                try {
                    const hash = await diskKey(key); if (!hash) return null;
                    const value = await bounded(host.wordVoiceCache.get(hash));
                    const data = value?.ok && value.data instanceof Uint8Array ? value.data.slice().buffer : null;
                    if (valid(data)) { remember(key, data); return data.slice(0); }
                } catch (_) { /* Optional cache cannot block speech or text. */ }
                return null;
            },
            put(key, data, persistent) {
                remember(key, data);
                if (persistent && valid(data)) void (async () => {
                    try { const hash = await diskKey(key); if (hash) await bounded(host.wordVoiceCache.put(hash, new Uint8Array(data.slice(0)))); }
                    catch (_) { /* Keep the in-memory copy if disk storage is unavailable. */ }
                })();
            },
            getDecoded(key) {
                const value = decoded.get(key); if (!value) return null;
                decoded.delete(key); decoded.set(key, value); return value.buffer;
            },
            putDecoded(key, buffer) {
                const size = (buffer.length || 0) * (buffer.numberOfChannels || 1) * 4;
                if (!size || size > 16 * 1024 * 1024) return;
                if (decoded.has(key)) decodedBytes -= decoded.get(key).size;
                decoded.delete(key); decoded.set(key, { buffer, size }); decodedBytes += size;
                while (decodedBytes > 16 * 1024 * 1024 || decoded.size > 8) {
                    const first = decoded.keys().next().value; decodedBytes -= decoded.get(first).size; decoded.delete(first);
                }
            }
        };
    }
    return { create };
});
