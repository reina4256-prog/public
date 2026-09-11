(function () {
    'use strict';

    const STORAGE_KEY = 'ai_pet_game_settings_v1';
    const DEFAULTS = Object.freeze({ bgmVolume: 0.5 });
    let settings = loadSettings();

    function clampVolume(value) {
        const number = Number(value);
        return Number.isFinite(number) ? Math.max(0, Math.min(1, number)) : DEFAULTS.bgmVolume;
    }

    function loadSettings() {
        let saved = null;
        try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch (_) {}
        const legacyVolume = window.aiPet && window.aiPet.bgmVolume !== undefined
            ? window.aiPet.bgmVolume
            : DEFAULTS.bgmVolume;
        return {
            bgmVolume: clampVolume(saved && saved.bgmVolume !== undefined ? saved.bgmVolume : legacyVolume)
        };
    }

    function saveSettings() {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)); } catch (_) {}
    }

    function getBgmVolume() {
        return clampVolume(settings.bgmVolume);
    }

    function setBgmVolume(value) {
        settings.bgmVolume = clampVolume(value);
        saveSettings();
        if (window.aiPet) window.aiPet.bgmVolume = settings.bgmVolume;
        if (window.audioManager && window.audioManager.currentAudio) {
            window.audioManager.currentAudio.volume = settings.bgmVolume;
        }
        const output = document.getElementById('game-settings-bgm-value');
        if (output) output.textContent = `${Math.round(settings.bgmVolume * 100)}%`;
        return settings.bgmVolume;
    }

    function fullscreenActive() {
        return !!document.fullscreenElement;
    }

    function updateFullscreenButton() {
        const button = document.getElementById('game-settings-fullscreen');
        if (!button) return;
        button.textContent = fullscreenActive() ? 'フルスクリーンを解除' : 'フルスクリーンにする';
    }

    async function toggleFullscreen() {
        const notice = document.getElementById('game-settings-notice');
        if (notice) notice.textContent = '';
        try {
            if (fullscreenActive()) await document.exitFullscreen();
            else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
            else throw new Error('fullscreen unsupported');
        } catch (_) {
            if (notice) notice.textContent = 'この環境では画面からフルスクリーンへ切り替えられません。PC版ではF11キーも利用できます。';
        }
        updateFullscreenButton();
    }

    function settingsMarkup() {
        return `
            <style>
                @media (max-width: 540px) {
                    #game-settings-overlay .game-settings-row {
                        grid-template-columns: 1fr !important;
                        gap: 10px !important;
                    }
                }
            </style>
            <div style="width:min(620px,92vw);max-height:88vh;overflow:auto;padding:28px;box-sizing:border-box;border:2px solid #7cc8ff;border-radius:18px;background:linear-gradient(145deg,#202a3a,#10141d 68%);box-shadow:0 20px 65px rgba(0,0,0,.72);color:#fff;font-family:sans-serif;">
                <div style="display:flex;align-items:center;justify-content:space-between;gap:14px;padding-bottom:16px;border-bottom:1px solid #526274;">
                    <div>
                        <h2 style="margin:0;color:#b9e2ff;font-size:28px;">⚙️ ゲーム設定</h2>
                        <div style="margin-top:5px;color:#9aa9b9;font-size:12px;">ゲーム全体に適用され、この端末に保存されます。</div>
                    </div>
                    <button type="button" id="game-settings-close-top" class="quiz-btn" style="min-width:92px;background:#4c5664;">閉じる</button>
                </div>

                <div style="display:grid;gap:14px;margin-top:20px;">
                    <section class="game-settings-row" style="display:grid;grid-template-columns:minmax(150px,1fr) minmax(210px,1.4fr);align-items:center;gap:18px;padding:16px;border:1px solid #44546a;border-radius:12px;background:rgba(9,14,23,.62);">
                        <div>
                            <strong style="display:block;color:#fff;font-size:16px;">🌐 表示言語</strong>
                            <span style="display:block;margin-top:4px;color:#91a1b2;font-size:11px;line-height:1.45;">画面表示と音声入力の言語を変更します。</span>
                        </div>
                        <select id="game-settings-language" aria-label="表示言語" style="width:100%;padding:11px;border:1px solid #6f8299;border-radius:8px;background:#171d27;color:#fff;font-size:15px;"></select>
                    </section>

                    <section class="game-settings-row" style="display:grid;grid-template-columns:minmax(150px,1fr) minmax(210px,1.4fr);align-items:center;gap:18px;padding:16px;border:1px solid #44546a;border-radius:12px;background:rgba(9,14,23,.62);">
                        <div>
                            <strong style="display:block;color:#fff;font-size:16px;">🔊 BGM音量</strong>
                            <span style="display:block;margin-top:4px;color:#91a1b2;font-size:11px;line-height:1.45;">タイトルとゲーム中の音楽に適用します。</span>
                        </div>
                        <div style="display:flex;align-items:center;gap:12px;">
                            <input id="game-settings-bgm" type="range" min="0" max="1" step="0.05" style="flex:1;cursor:pointer;">
                            <output id="game-settings-bgm-value" style="width:44px;text-align:right;color:#b9e2ff;font-weight:bold;"></output>
                        </div>
                    </section>

                    <section class="game-settings-row" style="display:grid;grid-template-columns:minmax(150px,1fr) minmax(210px,1.4fr);align-items:center;gap:18px;padding:16px;border:1px solid #44546a;border-radius:12px;background:rgba(9,14,23,.62);">
                        <div>
                            <strong style="display:block;color:#fff;font-size:16px;">🖥️ 画面表示</strong>
                            <span style="display:block;margin-top:4px;color:#91a1b2;font-size:11px;line-height:1.45;">フルスクリーン表示を切り替えます。</span>
                        </div>
                        <button type="button" id="game-settings-fullscreen" class="quiz-btn" style="width:100%;background:#315f88;"></button>
                    </section>
                </div>

                <div id="game-settings-notice" style="min-height:20px;margin-top:13px;color:#ffb4a7;font-size:12px;line-height:1.5;"></div>
                <button type="button" id="game-settings-close" class="quiz-btn" style="display:block;min-width:180px;margin:10px auto 0;background:#4c5664;">設定を閉じる</button>
            </div>`;
    }

    function populateLanguageSelect(select) {
        if (!select || !window.GameI18n) return;
        select.innerHTML = '';
        for (const [code, config] of Object.entries(window.GameI18n.languages)) {
            const option = document.createElement('option');
            option.value = code;
            option.textContent = config.label;
            option.dataset.i18nSkip = 'true';
            select.appendChild(option);
        }
        select.value = window.GameI18n.language;
    }

    function closeGameSettings() {
        const overlay = document.getElementById('game-settings-overlay');
        if (overlay) overlay.remove();
        if (typeof window.render === 'function') window.render();
    }

    function openGameSettings() {
        closeGameSettings();
        const overlay = document.createElement('div');
        overlay.id = 'game-settings-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-label', 'ゲーム設定');
        overlay.style.cssText = 'position:fixed;inset:0;z-index:2147483600;display:grid;place-items:center;padding:18px;box-sizing:border-box;background:rgba(3,6,11,.86);backdrop-filter:blur(7px);';
        overlay.innerHTML = settingsMarkup();
        document.body.appendChild(overlay);

        const language = overlay.querySelector('#game-settings-language');
        populateLanguageSelect(language);
        language.addEventListener('change', event => {
            window.GameI18n.setLanguage(event.target.value);
            event.target.value = window.GameI18n.language;
            if (typeof window.render === 'function') window.render();
        });

        const slider = overlay.querySelector('#game-settings-bgm');
        slider.value = String(getBgmVolume());
        slider.addEventListener('input', event => setBgmVolume(event.target.value));
        setBgmVolume(slider.value);

        overlay.querySelector('#game-settings-fullscreen').addEventListener('click', toggleFullscreen);
        overlay.querySelector('#game-settings-close').addEventListener('click', closeGameSettings);
        overlay.querySelector('#game-settings-close-top').addEventListener('click', closeGameSettings);
        overlay.addEventListener('mousedown', event => {
            if (event.target === overlay) closeGameSettings();
        });
        updateFullscreenButton();
        setTimeout(() => language.focus(), 0);
    }

    document.addEventListener('fullscreenchange', updateFullscreenButton);
    window.addEventListener('keydown', event => {
        if (event.key === 'Escape' && document.getElementById('game-settings-overlay') && !document.fullscreenElement) {
            closeGameSettings();
        }
    });

    if (window.aiPet) window.aiPet.bgmVolume = getBgmVolume();

    window.GameSettings = Object.freeze({
        close: closeGameSettings,
        get: key => settings[key],
        getBgmVolume,
        open: openGameSettings,
        set: (key, value) => {
            if (key === 'bgmVolume') return setBgmVolume(value);
            settings[key] = value;
            saveSettings();
            return value;
        },
        setBgmVolume,
        toggleFullscreen
    });
    window.closeGameSettings = closeGameSettings;
    window.openGameSettings = openGameSettings;
})();
