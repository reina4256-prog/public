// electron_main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const steamworks = require('steamworks.js');

// Steamworksの初期化 (AppID 480はテスト用)
let steamClient;
try {
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

  // ★追加：起動時に自動で開発者ツール(DevTools)を開く
  // win.webContents.openDevTools();

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