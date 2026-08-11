// electron_main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const steamworks = require('steamworks.js');

// Steamworksの初期化 (AppID 480はテスト用)
let steamClient;
try {
  // ★追加：Steamクライアント経由の起動を強制する（DRM機能）
  // if (steamworks.restartAppIfNecessary(480)) {
  //   app.quit();
  //   process.exit(0); // アプリを強制終了して、Steamからの再起動に任せる
  // }

  steamClient = steamworks.init(480);
  console.log('Steamworks APIが正常に初期化されました！');
  console.log('ログイン中のSteamユーザー:', steamClient.localplayer.getName());
} catch (error) {
  console.error('Steamの初期化に失敗しました。Steamクライアントが起動しているか確認してください。', error);
}

// ★追加：ゲーム側からSteam情報を要求された時に返す処理
ipcMain.handle('get-steam-info', () => {
  if (steamClient && steamClient.localplayer) {
    return {
      name: steamClient.localplayer.getName(),
      // IDは巨大な数値(BigInt)なので、エラー防止のため文字列に変換して送る
      steamId: steamClient.localplayer.getSteamId().steamId64.toString() 
    };
  }
  return null;
});

// ★追加：ゲーム側から実績解除を要求された時の処理
ipcMain.on('unlock-achievement', (event, achievementId) => {
  if (steamClient && steamClient.achievement) {
    try {
      const activated = steamClient.achievement.activate(achievementId);
      if (activated) {
        console.log(`🏆 実績解除リクエスト送信: ${achievementId}`);
      } else {
        console.log(`実績解除失敗（存在しないID、または既に解除済み）: ${achievementId}`);
      }
    } catch (error) {
      console.error(`実績解除エラー (${achievementId}):`, error);
    }
  }
});

// ★追加：テスト用に実績を「未解除（ロック状態）」に戻す処理
ipcMain.on('clear-achievement', (event, achievementId) => {
  if (steamClient && steamClient.achievement) {
    try {
      steamClient.achievement.clear(achievementId);
      console.log(`🗑️ 実績をリセットしました: ${achievementId}`);
    } catch (error) {
      console.error(`実績リセットエラー:`, error);
    }
  }
});

// ★追加：ゲーム内から「終了」を指示された時の処理
ipcMain.on('quit-app', () => {
  app.quit();
});

function createWindow () {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 640,  // これ以上小さくならない
    minHeight: 360,
    useContentSize: true, // フレームを含まない「中身」のサイズを1280x720にする
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // メニューバーを隠す（ゲームっぽくするため）
  win.setMenuBarVisibility(false);

  // ゲームのindex.htmlを読み込む
  win.loadFile('index.html');

  // 開発時だけDevToolsを開き、配布版ではゲーム画面だけを表示する
  if (!app.isPackaged) {
    win.webContents.openDevTools();
  }

  // F11キーでフルスクリーン切替、ESCキーで解除する処理を追加
  win.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F11' && input.type === 'keyDown') {
      win.setFullScreen(!win.isFullScreen());
      event.preventDefault(); // デフォルトの動作をブロック
    }
    if (input.key === 'Escape' && win.isFullScreen() && input.type === 'keyDown') {
      win.setFullScreen(false);
      event.preventDefault();
    }
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// SteamオーバーレイをElectron上で有効化するための必須コード
steamworks.electronEnableSteamOverlay();
