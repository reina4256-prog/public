(function () {
    'use strict';
    const keys = new Set(['ai_pet_data_v1', 'map_data_v6', 'map_catalog_v1', 'ai_configs_v8', 'custom_images_v1',
        'ai_legacy_data', 'grazing_data_v1', 'tcg_data_v1', 'ai_pet_chat_history', 'daily_quests', 'last_login_date',
        'tcg_tutorial_done_v2', 'memory_tutorial_done_v1', 'tcg_card_tutorial_done_v3', 'game_tutorial_archive_v1', 'skip_tutorial',
        'casino_daifugo_rank_settings_v1', 'casino_daifugo_rules_v1', 'demo_full_facilities_v1']);
    const journalKey = 'demo_import_rollback_v1';
    const allowed = key => keys.has(key) || /^unlocked_cards_gen_\d+$/.test(key);
    const hasSave = storage => storage.getItem('ai_pet_data_v1') !== null || storage.getItem('ai_pet_data') !== null;
    function snapshot(storage) {
        const data = {};
        for (let i = 0; i < storage.length; i++) {
            const key = storage.key(i);
            if (allowed(key)) data[key] = storage.getItem(key);
        }
        return data;
    }
    function restore(storage, data) {
        for (const key of Object.keys(snapshot(storage))) storage.removeItem(key);
        for (const [key, value] of Object.entries(data)) if (allowed(key)) storage.setItem(key, value);
    }
    function recover(storage) {
        const raw = storage.getItem(journalKey);
        if (!raw) return;
        restore(storage, JSON.parse(raw));
        storage.removeItem('demo_import_resume_v1');
        storage.removeItem(journalKey);
    }
    function validate(bundle) {
        if (!bundle || bundle.format !== 'aipet-demo' || bundle.version !== 1 || !Number.isFinite(bundle.exportedAt)
            || !bundle.data || typeof bundle.data !== 'object' || Array.isArray(bundle.data)) throw Error('invalid_demo_file');
        const data = {};
        for (const [key, value] of Object.entries(bundle.data)) {
            if (!allowed(key) || typeof value !== 'string') throw Error('invalid_demo_key');
            data[key] = value;
        }
        const hero = JSON.parse(data.ai_pet_data_v1 || 'null');
        const map = JSON.parse(data.map_data_v6 || 'null');
        const flags = new Set(['last_login_date', 'tcg_tutorial_done_v2', 'memory_tutorial_done_v1', 'tcg_card_tutorial_done_v3', 'skip_tutorial']);
        for (const [key, value] of Object.entries(data)) if (!flags.has(key)) {
            const parsed = JSON.parse(value);
            if (!parsed || typeof parsed !== 'object') throw Error('invalid_demo_value');
        }
        if (!hero || typeof hero !== 'object' || Array.isArray(hero) || !hero.stats || !map || typeof map !== 'object' || Array.isArray(map)
            || !Number.isFinite(hero.age) || !Number.isFinite(hero.lifespan) || hero.lifespan <= 0
            || Number(hero.generation || 1) !== 1 || hero.pendingInheritanceData || hero.timeProgress?.pending) throw Error('invalid_demo_state');
        for (const key of ['intel', 'power', 'beauty', 'speed']) {
            if (hero.stats[key] !== undefined && (!Number.isFinite(hero.stats[key]) || hero.stats[key] > 150)) throw Error('invalid_demo_stats');
        }
        return { data, hero, map };
    }
    function rebase(value, elapsed, seen = new WeakSet()) {
        if (!value || typeof value !== 'object' || seen.has(value)) return;
        seen.add(value);
        const clockKeys = ['freshnessStartedAt', 'freshnessFrozenAt', 'pestStartedAt', 'leaveAt', 'until', 'speechUntil', 'nextOpenAt'];
        for (const [key, child] of Object.entries(value)) {
            if (clockKeys.includes(key) && typeof child === 'number' && child > 0) value[key] += elapsed;
            else if (child && typeof child === 'object') rebase(child, elapsed, seen);
        }
        if (value.dropClockOffsetMs !== undefined) value.dropClockOffsetMs = (Number(value.dropClockOffsetMs) || 0) + elapsed;
    }
    function importData(storage, bundle, now = Date.now()) {
        if (hasSave(storage)) throw Error('full_save_exists');
        const { data, hero, map } = validate(bundle);
        const reserved = JSON.parse(data.demo_full_facilities_v1 || '{}');
        for (const [id, asset] of Object.entries(reserved)) {
            if (!map[id] && asset && asset.type === 'pharmacy') map[id] = asset;
        }
        delete data.demo_full_facilities_v1;
        const elapsed = Math.max(0, now - bundle.exportedAt);
        rebase(hero, elapsed); rebase(map, elapsed);
        delete hero.bgmVolume;
        hero.lastSaveTime = now;
        hero.timeProgress = { version: 1, checkpoint: now, report: null };
        hero.demoImport = { version: 1, pending: true, importedAt: now };
        hero.isReincarnating = !!hero.demoProgress?.ended || hero.age >= hero.lifespan;
        data.ai_pet_data_v1 = JSON.stringify(hero);
        data.map_data_v6 = JSON.stringify(map);
        const before = snapshot(storage);
        storage.setItem(journalKey, JSON.stringify(before));
        try {
            restore(storage, data);
            storage.setItem('demo_import_resume_v1', 'true');
            storage.removeItem(journalKey);
        } catch (error) {
            recover(storage);
            throw error;
        }
        // The old page must not autosave its in-memory hero over the imported save.
        window.demoImportReloadPending = true;
        return hero;
    }
    // A versioned, authenticated binary container. The embedded key prevents casual
    // plaintext spoilers; it is not a security boundary against reverse engineering.
    const magic = new TextEncoder().encode('AIPETDEMO\u0001');
    async function transferKey() {
        const seed = new TextEncoder().encode('AIPetGame/demo-transfer/v1/8bc62e734af04129');
        const hash = await crypto.subtle.digest('SHA-256', seed);
        return crypto.subtle.importKey('raw', hash, 'AES-GCM', false, ['encrypt', 'decrypt']);
    }
    async function encrypt(bundle) {
        validate(bundle);
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const payload = new TextEncoder().encode(JSON.stringify(bundle));
        const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: magic }, await transferKey(), payload);
        const result = new Uint8Array(magic.length + iv.length + cipher.byteLength);
        result.set(magic); result.set(iv, magic.length); result.set(new Uint8Array(cipher), magic.length + iv.length);
        return result;
    }
    async function decrypt(buffer) {
        const bytes = new Uint8Array(buffer);
        if (bytes.length < magic.length + 28 || bytes.length > 20 * 1024 * 1024
            || !magic.every((value, index) => bytes[index] === value)) throw Error('invalid_demo_container');
        const iv = bytes.slice(magic.length, magic.length + 12);
        const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv, additionalData: magic }, await transferKey(), bytes.slice(magic.length + 12));
        const bundle = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(plain));
        validate(bundle);
        return bundle;
    }
    window.DemoSave = Object.freeze({ snapshot, validate, importData, hasSave, recover, rebase, encrypt, decrypt });
    recover(localStorage);
})();
