(function () {
    'use strict';
    const U = window.ResidentUI;
    if (!window.GameRelease.online) {
        // Gate late-defined UI entry points too (including translated chat commands).
        for (const name of ['openTavernPanel', 'openRankingPanel', 'switchRankingCategory', 'openOnlineMatchLobby',
            'uploadMyDeck', 'openCardMarketUI', 'renderArenaRankingList', 'renderDefenseRankingList',
            'openFriendSelectionUI', 'sendRescueRequest', 'showRescueWaitingScreen']) {
            window[name] = () => false;
        }
    }
    let endView = null;
    const notify = (message, retry) => U.notify(message, retry);

    function ensureMemory() {
        const hero = window.aiPet;
        if (!hero.demoProgress?.ended) return;
        if (!hero.demoProgress.memoryCard) {
            hero.demoProgress.memoryCard = window.generateCardFromAI(hero, { preview: true });
            saveGameData();
        }
        const card = hero.demoProgress.memoryCard;
        if (card && !window.TCG.myCollection.some(item => item.uid === card.uid)) {
            window.TCG.myCollection.push(card);
            window.saveTCGData();
        }
    }

    async function exportData() {
        try {
            if (!window.DemoRules.enabled || localStorage.getItem('debug_test_session_v1')) throw Error('invalid_export');
            if (window.aiPet.timeProgress?.pending) throw Error('pending_save');
            ensureMemory(); saveGameData(); window.saveTCGData();
            const bundle = { format: 'aipet-demo', version: 1, exportedAt: Date.now(), data: window.DemoSave.snapshot(localStorage) };
            window.DemoSave.validate(bundle);
            const bytes = await window.DemoSave.encrypt(bundle);
            const url = URL.createObjectURL(new Blob([bytes], { type: 'application/octet-stream' }));
            const link = document.createElement('a'); link.href = url; link.download = 'aipet-demo-save.aipetdemo';
            document.body.appendChild(link); link.click(); link.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch (error) { console.error(error); notify('体験版データを書き出せませんでした。保存状態を確認して、もう一度お試しください。'); }
    }

    function showEnd() {
        if (!window.DemoRules.ended(window.aiPet) || endView?.root.isConnected) return;
        window.DemoRules.markEnded(window.aiPet);
        window.isGamePaused = true;
        endView = U.modal('体験版終了');
        endView.root.id = 'demo-end-ui';
        endView.card.querySelector('header button').remove();
        endView.root.addEventListener('keydown', event => {
            if (event.key === 'Escape') { event.preventDefault(); event.stopImmediatePropagation(); }
        }, true);
        try {
            if (window.aiPet.timeProgress?.pending) throw Error('pending_save');
            ensureMemory(); saveGameData();
        } catch (error) {
            console.error(error);
            U.element('p', '保存できませんでした。もう一度お試しください。', endView.card);
            U.button(endView.card, '保存', () => { endView.close(); endView = null; showEnd(); });
            return;
        }
        U.element('p', 'この世代の寿命に到達しました。遊んだデータは保存されています。製品版へ引き継ぐと、世代引継ぎ画面から再開できます。', endView.card);
        U.button(endView.card, '体験版データを書き出す', exportData);
        U.button(endView.card, 'タイトルへ戻る', () => {
            endView.close(); endView = null;
            window.isGamePaused = false; window.switchMode('title');
        });
    }

    function resumeBoundary() {
        const hero = window.aiPet;
        if (window.DemoRules.ended(hero)) { showEnd(); return true; }
        if (!window.DemoRules.enabled && hero.demoImport) {
            if (hero.demoImport.pending) {
                const elapsed = Math.max(0, Date.now() - hero.demoImport.importedAt);
                const seen = new WeakSet();
                window.DemoSave.rebase(hero, elapsed, seen); window.DemoSave.rebase(assets, elapsed, seen);
                hero.demoImport.pending = false;
                hero.lastSaveTime = Date.now();
                hero.timeProgress = { version: 1, checkpoint: hero.lastSaveTime, report: null };
                saveGameData();
            }
            if (hero.demoProgress?.ended || hero.isReincarnating) {
                if (!hero.isReincarnating) return false;
                window.openInheritanceShop();
                return true;
            }
        }
        return false;
    }

    function importFile() {
        if (window.DemoRules.enabled) return;
        if (window.DemoSave.hasSave(localStorage)) { notify('製品版のセーブデータがあるため、体験版データは読み込めません。'); return; }
        const input = document.createElement('input'); input.type = 'file'; input.accept = '.aipetdemo';
        input.onchange = async () => {
            try {
                const file = input.files[0]; if (!file) return;
                if (file.size > 20 * 1024 * 1024) throw Error('oversize_demo_file');
                const bundle = await window.DemoSave.decrypt(await file.arrayBuffer());
                const view = U.modal('体験版データの読み込み');
                U.element('p', 'この体験版データで製品版を開始します。読み込みまでの不在時間は加算しません。', view.card);
                U.button(view.card, '読み込む', () => {
                    try {
                        window.DemoSave.importData(localStorage, bundle);
                        window.location.reload();
                    } catch (error) { console.error(error); view.close(); notify('体験版データを読み込めませんでした。ファイルと保存領域を確認してください。'); }
                });
            } catch (error) { console.error(error); notify('体験版データを読み込めませんでした。ファイルと保存領域を確認してください。'); }
        };
        input.click();
    }

    const importButton = U.button(document.body, '体験版データの読み込み', importFile);
    importButton.id = 'demo-import-button'; importButton.className = 'quiz-btn';
    if (window.DemoRules.enabled) {
        importButton.remove();
        const parent = document.getElementById('action-buttons-row');
        const button = U.button(parent, '体験版データを書き出す', exportData); button.className = 'quiz-btn';
    }
    window.DemoTransfer = Object.freeze({ showEnd, exportData, importFile, resumeBoundary });
    if (!window.DemoRules.enabled && localStorage.getItem('demo_import_resume_v1') === 'true') {
        localStorage.removeItem('demo_import_resume_v1');
        window.addEventListener('load', () => {
            startGameSequence(); window.switchMode('title'); window.startActualGame(false);
        }, { once: true });
    }
})();
