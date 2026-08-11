// tutorial_core.js : 進行に応じて解放され、世代をまたいで残るチュートリアル図鑑
(function() {
    'use strict';

    const STORAGE_KEY = 'game_tutorial_archive_v1';
    const STORAGE_VERSION = 1;

    const CATALOG = [
        {
            id: 'basics.first_word',
            category: 'はじめに',
            section: 'ことば',
            title: '最初のことば',
            paragraphs: [
                'AIは最初、まだ言葉を知りません。画面下のチャット欄から、思いついた言葉を教えてあげましょう。',
                '覚えた言葉が増えると、AIができることや行動の選択肢も少しずつ広がります。'
            ]
        },
        {
            id: 'basics.abilities',
            category: 'はじめに',
            section: '能力',
            title: '能力について',
            paragraphs: [
                '能力は、普段の行動や仕事の結果、AIの行動傾向などに影響します。必要な数値や正解は一つとは限りません。AIの様子を見ながら育て方を試してみましょう。'
            ],
            tips: [
                ['活力', '力や持久力を使う行動に影響します。高いほど、力仕事などで力を発揮しやすくなります。'],
                ['賢さ', '学習、調理、ものづくりや判断に影響します。高いほど、知識を使う行動が得意になります。'],
                ['機嫌', 'AIの気分や行動の傾向に影響します。成功や楽しい出来事で上がり、失敗や無理をすると下がることがあります。'],
                ['美しさ', '見た目や仕上がりが大切な仕事、相手への印象に影響します。高いほど、丁寧さや魅力を生かしやすくなります。'],
                ['素早さ', '動きの速さや、とっさの対応が必要な行動に影響します。高いほど、機敏さを求められる場面で役立ちます。']
            ]
        },
        {
            id: 'actions.exploration.preparation',
            category: 'アクション',
            section: '探検',
            title: '探検前の準備',
            paragraphs: [
                '探検では、進んだり帰ったりする間にも体力と満腹度を使います。出発できないときや途中で疲れて帰ってきたときは、休息と食事を試してみましょう。',
                '遠くへ移動したり、危険から逃げたりすると、いつもより消耗が増えることもあります。少し余裕を持たせるのが安全です。'
            ]
        },
        {
            id: 'actions.exploration.depth',
            category: 'アクション',
            section: '探検',
            title: 'さらに奥へ進むには',
            paragraphs: [
                '深い場所ほど、それまでの成長が試されます。一つの得意分野だけに頼らず、日々のさまざまな行動を試してみましょう。',
                'どの成長が役立つかは、AIの様子や挑戦の結果を手がかりに考えてみてください。'
            ]
        },
        {
            id: 'systems.rescue',
            category: '暮らしの機能',
            section: '救済',
            title: '救済について',
            paragraphs: [
                '食べ物がなくなり、生活を続けるのが難しいときは「救済」を利用できます。借金と引き換えに、緊急物資を届けてもらえます。'
            ]
        },
        {
            id: 'systems.online',
            category: '交流',
            section: 'オンライン',
            title: 'オンライン機能',
            paragraphs: [
                'ギルド酒場やランキングでは、ほかのAIとの交流や記録の比較を楽しめます。'
            ]
        },
        {
            id: 'collections.memories',
            category: 'コレクション',
            section: '思い出',
            title: '思い出について',
            paragraphs: [
                '冒険や日々の暮らしで心に残った出来事は、「思い出」としてアルバムに記録されることがあります。',
                '画面右下の「思い出アルバム」から、これまでの歩みを振り返れます。'
            ]
        },
        {
            id: 'collections.cards',
            category: 'コレクション',
            section: 'カード',
            title: 'カードについて',
            paragraphs: [
                'これまでに集めた思い出を、カードとして使えるようになりました。',
                'カードは眺めるだけでなく、デッキを組んでバトルにも使えます。'
            ]
        },
        {
            id: 'work.apprenticeship.first_master',
            category: '仕事',
            section: '修行',
            title: '修行への入口',
            paragraphs: [
                '島で暮らしていると、何かを極めた人と出会うことがあります。話を聞き、もう一度その人を訪ねることで、修行への道が開けます。',
                '一度出会った相手の呼び方を覚えたら、チャットで呼びかけて会いに行けます。'
            ]
        },
        {
            id: 'business.restaurant',
            category: '仕事',
            section: 'レストラン',
            title: 'レストランの基本',
            paragraphs: [
                'レストランでは、仕込み、開店、接客、片付け、休息という流れを意識します。お客さんの様子と店の在庫を見ながら、AIに覚えた言葉で方針を伝えましょう。'
            ]
        }
    ];

    const catalogById = new Map(CATALOG.map(entry => [entry.id, entry]));
    let selectedTutorialId = null;

    function emptyArchive() {
        return { version: STORAGE_VERSION, entries: {} };
    }

    function readArchive() {
        try {
            const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
            if (!parsed || typeof parsed !== 'object') return emptyArchive();
            if (!parsed.entries || typeof parsed.entries !== 'object') parsed.entries = {};
            parsed.version = STORAGE_VERSION;
            return parsed;
        } catch (error) {
            console.warn('[Tutorial Archive] 履歴を読み込めませんでした。', error);
            return emptyArchive();
        }
    }

    function writeArchive(archive) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(archive));
        } catch (error) {
            console.warn('[Tutorial Archive] 履歴を保存できませんでした。', error);
        }
    }

    function getUnlockedEntries(archive) {
        return CATALOG.filter(entry => archive.entries[entry.id]);
    }

    function getUnreadCount(archive) {
        return getUnlockedEntries(archive).filter(entry => !archive.entries[entry.id].viewedAt).length;
    }

    function updateTutorialButton() {
        const button = document.getElementById('btnTutorial');
        if (!button) return;
        const unread = getUnreadCount(readArchive());
        button.textContent = unread > 0 ? `📘 チュートリアル (${unread})` : '📘 チュートリアル';
        button.title = unread > 0 ? `未読のチュートリアルが${unread}件あります` : '解放済みのチュートリアルを見る';
    }

    function showUnlockToast(entry) {
        let toast = document.getElementById('tutorial-unlock-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'tutorial-unlock-toast';
            toast.setAttribute('role', 'status');
            document.body.appendChild(toast);
        }
        toast.textContent = `📘 チュートリアルに「${entry.title}」が追加されました`;
        toast.classList.remove('visible');
        void toast.offsetWidth;
        toast.classList.add('visible');
        clearTimeout(toast._hideTimer);
        toast._hideTimer = setTimeout(() => toast.classList.remove('visible'), 3600);
    }

    window.unlockTutorialEntry = function(id, options = {}) {
        const entry = catalogById.get(id);
        if (!entry) {
            console.warn(`[Tutorial Archive] 未登録の項目です: ${id}`);
            return false;
        }

        const archive = readArchive();
        const now = Date.now();
        const wasUnlocked = !!archive.entries[id];
        if (!wasUnlocked) archive.entries[id] = { unlockedAt: now, viewedAt: null };
        if (options.viewed && !archive.entries[id].viewedAt) archive.entries[id].viewedAt = now;
        writeArchive(archive);
        updateTutorialButton();

        const overlay = document.getElementById('tutorial-archive-overlay');
        if (overlay && overlay.classList.contains('active')) renderArchive(id);
        if (!wasUnlocked && !options.silent) showUnlockToast(entry);
        return !wasUnlocked;
    };

    window.markTutorialViewed = function(id) {
        const archive = readArchive();
        if (!archive.entries[id] || archive.entries[id].viewedAt) return false;
        archive.entries[id].viewedAt = Date.now();
        writeArchive(archive);
        updateTutorialButton();
        return true;
    };

    function removeTutorialEntry(id) {
        const archive = readArchive();
        if (!archive.entries[id]) return false;
        delete archive.entries[id];
        writeArchive(archive);
        updateTutorialButton();
        const overlay = document.getElementById('tutorial-archive-overlay');
        if (overlay && overlay.classList.contains('active')) renderArchive();
        return true;
    }

    function createArchiveUI() {
        if (document.getElementById('tutorial-archive-overlay')) return;

        const style = document.createElement('style');
        style.id = 'tutorial-archive-styles';
        style.textContent = `
            #tutorial-archive-overlay { position:fixed; inset:0; z-index:120000; display:none; align-items:center; justify-content:center; padding:12px; background:rgba(0,0,0,.72); box-sizing:border-box; }
            #tutorial-archive-overlay.active { display:flex; }
            .tutorial-archive-panel { width:min(960px, 100%); max-height:90vh; display:flex; flex-direction:column; overflow:hidden; color:#eee; background:#17191d; border:2px solid #5c7ea5; border-radius:14px; box-shadow:0 18px 60px rgba(0,0,0,.65); }
            .tutorial-archive-header { display:flex; align-items:center; gap:12px; padding:15px 18px; border-bottom:1px solid #39424e; background:linear-gradient(135deg, #24374d, #1a2028); }
            .tutorial-archive-header h2 { flex:1; margin:0; color:#cce6ff; font-size:22px; }
            .tutorial-archive-header p { margin:3px 0 0; color:#9fb1c4; font-size:12px; }
            .tutorial-archive-close { border:1px solid #71869d; border-radius:8px; padding:7px 12px; color:#fff; background:#303b47; cursor:pointer; font-size:16px; }
            .tutorial-archive-body { min-height:0; display:grid; grid-template-columns:minmax(270px, 38%) 1fr; }
            .tutorial-archive-tree { overflow:auto; padding:12px; border-right:1px solid #39424e; background:#121419; }
            .tutorial-category, .tutorial-section { margin-bottom:7px; }
            .tutorial-category > summary, .tutorial-section > summary { list-style:none; cursor:pointer; user-select:none; }
            .tutorial-category > summary::-webkit-details-marker, .tutorial-section > summary::-webkit-details-marker { display:none; }
            .tutorial-category > summary { padding:10px 12px; border-radius:8px; color:#dcecff; background:#293545; font-weight:bold; }
            .tutorial-category > summary::before, .tutorial-section > summary::before { content:'▶'; display:inline-block; width:18px; color:#83b9e8; transition:transform .15s; }
            .tutorial-category[open] > summary::before, .tutorial-section[open] > summary::before { transform:rotate(90deg); }
            .tutorial-section { margin:7px 0 7px 10px; }
            .tutorial-section > summary { padding:8px 10px; border-left:3px solid #506b86; color:#c5d2de; background:#1d242d; }
            .tutorial-entry-list { display:flex; flex-direction:column; gap:5px; padding:7px 0 2px 13px; }
            .tutorial-entry-button { width:100%; display:flex; align-items:center; gap:7px; border:1px solid transparent; border-radius:7px; padding:8px 10px; color:#c8c8c8; background:#171b21; text-align:left; cursor:pointer; }
            .tutorial-entry-button:hover, .tutorial-entry-button.selected { border-color:#5f89b1; color:#fff; background:#253445; }
            .tutorial-unread-dot { flex:0 0 auto; width:8px; height:8px; border-radius:50%; background:#ffb13b; box-shadow:0 0 7px rgba(255,177,59,.75); }
            .tutorial-archive-detail { overflow:auto; padding:24px 28px; line-height:1.75; }
            .tutorial-archive-detail h3 { margin:0 0 18px; color:#8fc9ff; font-size:24px; }
            .tutorial-archive-detail p { margin:0 0 14px; color:#d7d7d7; }
            .tutorial-tip-list { display:grid; gap:9px; margin-top:18px; }
            .tutorial-tip { padding:10px 12px; border-left:4px solid #5c92c2; border-radius:5px; background:#202832; }
            .tutorial-tip strong { color:#ffcf72; }
            .tutorial-archive-empty { color:#aeb8c2; text-align:center; padding:50px 20px; }
            #tutorial-unlock-toast { position:fixed; left:50%; bottom:86px; z-index:120100; max-width:min(520px, calc(100vw - 24px)); box-sizing:border-box; padding:11px 16px; border:1px solid #7fb4e3; border-radius:22px; color:#e6f4ff; background:rgba(25,42,58,.96); box-shadow:0 7px 24px rgba(0,0,0,.45); opacity:0; transform:translate(-50%, 12px); pointer-events:none; transition:opacity .25s, transform .25s; text-align:center; }
            #tutorial-unlock-toast.visible { opacity:1; transform:translate(-50%, 0); }
            @media (max-width:720px) {
                .tutorial-archive-panel { max-height:94vh; }
                .tutorial-archive-header h2 { font-size:18px; }
                .tutorial-archive-header p { display:none; }
                .tutorial-archive-body { display:flex; flex-direction:column; overflow:auto; }
                .tutorial-archive-tree { flex:0 0 auto; max-height:38vh; border-right:0; border-bottom:1px solid #39424e; }
                .tutorial-archive-detail { overflow:visible; padding:18px; }
            }
        `;
        document.head.appendChild(style);

        const overlay = document.createElement('div');
        overlay.id = 'tutorial-archive-overlay';
        overlay.setAttribute('aria-hidden', 'true');
        overlay.innerHTML = `
            <section class="tutorial-archive-panel" role="dialog" aria-modal="true" aria-labelledby="tutorial-archive-title">
                <header class="tutorial-archive-header">
                    <div>
                        <h2 id="tutorial-archive-title">📘 チュートリアル</h2>
                        <p>ゲームの進行に応じて、知ったことがここに追加されます</p>
                    </div>
                    <button type="button" class="tutorial-archive-close" aria-label="閉じる">✕</button>
                </header>
                <div class="tutorial-archive-body">
                    <nav class="tutorial-archive-tree" aria-label="チュートリアル項目"></nav>
                    <article class="tutorial-archive-detail"></article>
                </div>
            </section>
        `;
        document.body.appendChild(overlay);
        overlay.querySelector('.tutorial-archive-close').addEventListener('click', window.closeTutorialArchive);
        overlay.addEventListener('click', event => {
            if (event.target === overlay) window.closeTutorialArchive();
        });
    }

    function groupEntries(entries) {
        const categories = [];
        entries.forEach(entry => {
            let category = categories.find(item => item.name === entry.category);
            if (!category) {
                category = { name: entry.category, sections: [] };
                categories.push(category);
            }
            let section = category.sections.find(item => item.name === entry.section);
            if (!section) {
                section = { name: entry.section, entries: [] };
                category.sections.push(section);
            }
            section.entries.push(entry);
        });
        return categories;
    }

    function renderDetail(container, entry) {
        container.replaceChildren();
        if (!entry) {
            const empty = document.createElement('div');
            empty.className = 'tutorial-archive-empty';
            empty.textContent = 'ゲームを進めると、ここにチュートリアルが追加されます。';
            container.appendChild(empty);
            return;
        }

        const heading = document.createElement('h3');
        heading.textContent = entry.title;
        container.appendChild(heading);
        entry.paragraphs.forEach(text => {
            const paragraph = document.createElement('p');
            paragraph.textContent = text;
            container.appendChild(paragraph);
        });
        if (entry.tips && entry.tips.length > 0) {
            const list = document.createElement('div');
            list.className = 'tutorial-tip-list';
            entry.tips.forEach(([label, text]) => {
                const tip = document.createElement('div');
                tip.className = 'tutorial-tip';
                const strong = document.createElement('strong');
                strong.textContent = `${label}：`;
                tip.append(strong, document.createTextNode(text));
                list.appendChild(tip);
            });
            container.appendChild(list);
        }
    }

    function renderArchive(preferredId) {
        createArchiveUI();
        const overlay = document.getElementById('tutorial-archive-overlay');
        const tree = overlay.querySelector('.tutorial-archive-tree');
        const detail = overlay.querySelector('.tutorial-archive-detail');
        const archive = readArchive();
        const entries = getUnlockedEntries(archive);
        const preferred = catalogById.has(preferredId) && archive.entries[preferredId] ? preferredId : selectedTutorialId;
        selectedTutorialId = preferred && archive.entries[preferred] ? preferred : (entries[0] ? entries[0].id : null);
        if (selectedTutorialId && overlay.classList.contains('active') && !archive.entries[selectedTutorialId].viewedAt) {
            archive.entries[selectedTutorialId].viewedAt = Date.now();
            writeArchive(archive);
            updateTutorialButton();
        }
        tree.replaceChildren();

        if (entries.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'tutorial-archive-empty';
            empty.textContent = 'まだ解放された項目はありません。';
            tree.appendChild(empty);
            renderDetail(detail, null);
            return;
        }

        groupEntries(entries).forEach(category => {
            const categoryNode = document.createElement('details');
            categoryNode.className = 'tutorial-category';
            const categoryContainsSelected = category.sections.some(section => section.entries.some(entry => entry.id === selectedTutorialId));
            categoryNode.open = categoryContainsSelected;
            const categorySummary = document.createElement('summary');
            categorySummary.textContent = category.name;
            categoryNode.appendChild(categorySummary);

            category.sections.forEach(section => {
                const sectionNode = document.createElement('details');
                sectionNode.className = 'tutorial-section';
                const sectionContainsSelected = section.entries.some(entry => entry.id === selectedTutorialId);
                sectionNode.open = sectionContainsSelected;
                const sectionSummary = document.createElement('summary');
                sectionSummary.textContent = section.name;
                sectionNode.appendChild(sectionSummary);
                const entryList = document.createElement('div');
                entryList.className = 'tutorial-entry-list';

                section.entries.forEach(entry => {
                    const button = document.createElement('button');
                    button.type = 'button';
                    button.className = `tutorial-entry-button${entry.id === selectedTutorialId ? ' selected' : ''}`;
                    if (!archive.entries[entry.id].viewedAt) {
                        const dot = document.createElement('span');
                        dot.className = 'tutorial-unread-dot';
                        dot.setAttribute('aria-label', '未読');
                        button.appendChild(dot);
                    }
                    const label = document.createElement('span');
                    label.textContent = entry.title;
                    button.appendChild(label);
                    button.addEventListener('click', () => {
                        selectedTutorialId = entry.id;
                        window.markTutorialViewed(entry.id);
                        renderArchive(entry.id);
                    });
                    entryList.appendChild(button);
                });
                sectionNode.appendChild(entryList);
                sectionNode.addEventListener('toggle', () => {
                    if (!sectionNode.open) return;
                    categoryNode.querySelectorAll('.tutorial-section[open]').forEach(other => {
                        if (other !== sectionNode) other.open = false;
                    });
                });
                categoryNode.appendChild(sectionNode);
            });

            categoryNode.addEventListener('toggle', () => {
                if (!categoryNode.open) return;
                tree.querySelectorAll('.tutorial-category[open]').forEach(other => {
                    if (other !== categoryNode) other.open = false;
                });
            });
            tree.appendChild(categoryNode);
        });

        renderDetail(detail, catalogById.get(selectedTutorialId));
    }

    window.openTutorialArchive = function() {
        createArchiveUI();
        const overlay = document.getElementById('tutorial-archive-overlay');
        overlay.classList.add('active');
        overlay.setAttribute('aria-hidden', 'false');
        renderArchive();
    };

    window.closeTutorialArchive = function() {
        const overlay = document.getElementById('tutorial-archive-overlay');
        if (!overlay) return;
        overlay.classList.remove('active');
        overlay.setAttribute('aria-hidden', 'true');
    };

    window.syncTutorialArchiveFromLegacy = function() {
        const pet = window.aiPet || (typeof aiPet !== 'undefined' ? aiPet : null);
        if (pet) {
            const learnedWords = pet.apprentice && Array.isArray(pet.apprentice.learnedWords) ? pet.apprentice.learnedWords : [];
            const metMasters = pet.apprentice && Array.isArray(pet.apprentice.metMasters) ? pet.apprentice.metMasters : [];
            if (pet._tutorialDone || learnedWords.length > 0) {
                window.unlockTutorialEntry('basics.first_word', { viewed: true, silent: true });
            }
            if (pet.unlockedFeatures && pet.unlockedFeatures.shop) {
                window.unlockTutorialEntry('systems.rescue', { viewed: true, silent: true });
            }
            const onlineLoginVerified = localStorage.getItem('online_tutorial_login_verified_v1') === 'true';
            const isLoggedIn = typeof window.isOnlineAccountLoggedIn === 'function' && window.isOnlineAccountLoggedIn();
            if (onlineLoginVerified || (isLoggedIn && pet.unlockedFeatures && pet.unlockedFeatures.online)) {
                if (!onlineLoginVerified && isLoggedIn) {
                    localStorage.setItem('online_tutorial_login_verified_v1', 'true');
                }
                window.unlockTutorialEntry('systems.online', { viewed: true, silent: true });
            } else if (!onlineLoginVerified) {
                // 旧実装は言葉数だけで追加していたため、ログイン確認前の誤解放を取り除く。
                removeTutorialEntry('systems.online');
            }
            if (pet.shopTutorialCompleted) {
                window.unlockTutorialEntry('business.restaurant', { viewed: true, silent: true });
            }
            if (metMasters.length > 0) {
                window.unlockTutorialEntry('work.apprenticeship.first_master', { viewed: true, silent: true });
            }
        }

        const collection = window.TCG && Array.isArray(window.TCG.myCollection) ? window.TCG.myCollection : [];
        const legacyCollectionTutorial = !!localStorage.getItem('tcg_tutorial_done_v2');
        if (legacyCollectionTutorial || localStorage.getItem('memory_tutorial_done_v1') || collection.length > 0) {
            window.unlockTutorialEntry('collections.memories', { viewed: true, silent: true });
        }

        // TCG本体が読み込まれてから、旧「カード」項目を現在の正式解放状態へ補正する。
        if (window.TCG && typeof window.isTCGCardGameUnlocked === 'function') {
            const isCardGameUnlocked = window.isTCGCardGameUnlocked();
            const cardUnlockVerified = localStorage.getItem('tcg_card_tutorial_done_v3') === 'true';
            if (cardUnlockVerified || (isCardGameUnlocked && legacyCollectionTutorial)) {
                if (isCardGameUnlocked && legacyCollectionTutorial && !cardUnlockVerified) {
                    localStorage.setItem('tcg_card_tutorial_done_v3', 'true');
                }
                window.unlockTutorialEntry('collections.cards', { viewed: true, silent: true });
            } else if (!isCardGameUnlocked) {
                removeTutorialEntry('collections.cards');
            }
        }
        updateTutorialButton();
    };

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') window.closeTutorialArchive();
    });

    function initializeTutorialArchive() {
        createArchiveUI();
        window.syncTutorialArchiveFromLegacy();
        updateTutorialButton();
        setTimeout(window.syncTutorialArchiveFromLegacy, 500);
        setTimeout(window.syncTutorialArchiveFromLegacy, 2000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeTutorialArchive, { once: true });
    } else {
        initializeTutorialArchive();
    }
})();
