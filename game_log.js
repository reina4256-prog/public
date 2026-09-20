// Shared, bounded dialogue history. Player input is stored verbatim.
(() => {
    let observedPet;
    let lastMessage = '';
    let lastTimer = 0;
    const translate = text => window.GameI18n ? window.GameI18n.translate(text) : text;
    const speakers = { ai: 'AI', visitor: '来客', retirement: '余生', player: 'プレイヤー', explore: '冒険家', farming: '農家', fishing: '漁師', cooking: '料理人',
        smithing: '鍛冶師', building: '建築士', pharmacist: '薬剤師', tailor: '仕立屋', pastry_chef: 'パティシエ',
        hairdresser: '美容師', concierge: 'コンシェルジュ', dealer: 'ディーラー' };
    function entries() {
        const ai = window.aiPet;
        if (!ai) return [];
        if (!Array.isArray(ai.gameLog)) ai.gameLog = [];
        if (!ai.gameLogHomeImported && Array.isArray(ai.myHomeIndoor?.logs)) {
            for (const html of ai.myHomeIndoor.logs) {
                const template = document.createElement('template');
                template.innerHTML = String(html);
                ai.gameLog.push({ text: template.content.textContent, scene: 'myhome', speaker: '', at: 0, literal: true });
            }
            ai.gameLogHomeImported = true;
        }
        if (ai.gameLog.length > 300) ai.gameLog.splice(0, ai.gameLog.length - 300);
        return ai.gameLog;
    }
    function add(text, options = {}) {
        if (!text || !window.aiPet) return;
        const list = entries();
        const speaker = Object.keys(speakers).find(id => speakers[id] === options.speaker) || options.speaker || 'ai';
        const entry = { text: String(text), speaker,
            scene: options.scene || (window.castleMapOpen ? 'castle' : window.casinoMapOpen ? 'casino' : window.GameShell?.currentScene || 'island'),
            at: Date.now(), literal: !!options.literal, generation: window.aiPet.generation || 1 };
        const last = list[list.length - 1];
        if (last && last.text === entry.text && last.speaker === entry.speaker && last.scene === entry.scene && entry.at - last.at < 1000) return;
        list.push(entry);
        if (list.length > 300) list.shift();
    }
    function observe(ai) {
        if (observedPet !== ai) { observedPet = ai; lastMessage = ''; lastTimer = 0; }
        const message = String(ai.message || '');
        const timer = Number(ai.messageTimer) || 0;
        if (message && timer > 0 && (message !== lastMessage || timer > lastTimer)) add(message);
        lastMessage = message;
        lastTimer = timer;
    }
    function close() {
        const root = document.getElementById('game-log-overlay');
        if (!root) return;
        root.remove();
        window.GameShell?.endExclusive(root);
    }
    function importRestaurant() {
        const state = window.SHOP_STATE;
        if (!state || state.gameLogImported) return;
        for (const html of state.logs || []) {
            const template = document.createElement('template'); template.innerHTML = String(html);
            add(template.content.textContent, { scene: 'restaurant', literal: true });
        }
        state.gameLogImported = true;
    }
    function open() {
        if (document.getElementById('game-log-overlay')) return;
        if (window.GameShell?.currentScene === 'restaurant') importRestaurant();
        observe(window.aiPet || {});
        const root = document.createElement('div');
        root.id = 'game-log-overlay';
        root.className = 'overlay active';
        root.innerHTML = '<section class="game-log-card" role="dialog" aria-modal="true" aria-labelledby="game-log-title"><header><h2 id="game-log-title">ログ・状況</h2><button type="button">閉じる</button></header><div class="game-log-entries"></div></section>';
        root.querySelector('button').onclick = close;
        root.addEventListener('keydown', event => {
            if (event.key === 'Escape') { event.preventDefault(); close(); }
            event.stopPropagation();
        });
        const body = root.querySelector('.game-log-entries');
        const list = entries();
        if (!list.length) body.textContent = translate('ログはまだありません。');
        for (const entry of list) {
            const row = document.createElement('div');
            row.className = 'game-log-entry';
            const meta = document.createElement('small');
            const scene = ({ myhome: 'マイホーム', restaurant: 'レストラン', blacksmith: '鍛冶屋', castle: '城', casino: 'カジノ', 'resident-home': '住人用小屋' })[entry.scene] || '島';
            meta.textContent = [entry.at ? new Date(entry.at).toLocaleTimeString(document.documentElement.lang, { hour: '2-digit', minute: '2-digit' }) : '', translate(scene), translate(speakers[entry.speaker] || entry.speaker)].filter(Boolean).join(' · ');
            const message = document.createElement('div');
            message.setAttribute('data-i18n-skip', '');
            message.textContent = entry.literal ? entry.text : translate(entry.text);
            row.append(meta, message);
            body.appendChild(row);
        }
        if (window.GameShell?.currentScene === 'restaurant') {
            window.updateShopUI?.({ dashboard: true });
            const details = document.createElement('section');
            details.className = 'game-log-restaurant';
            details.innerHTML = '<h3>📊 お店の状況</h3>';
            const status = document.getElementById('shop-dashboard-area');
            if (status) {
                const copy = status.cloneNode(true); copy.removeAttribute('id'); details.appendChild(copy);
            }
            const exportButton = document.createElement('button');
            exportButton.textContent = translate('ログを書き出す');
            exportButton.onclick = () => window.downloadRestaurantDebugLog();
            details.append(exportButton);
            root.querySelector('.game-log-card').appendChild(details);
        }
        document.body.appendChild(root);
        window.GameShell?.beginExclusive(root, 'dialogue-log');
        body.scrollTop = body.scrollHeight;
    }
    window.GameLog = { add, observe, open, close, importRestaurant };
})();
