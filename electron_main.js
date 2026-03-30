// electron_main.js
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow () {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // メニューバーを隠す（ゲームっぽくするため）
  win.setMenuBarVisibility(false);

  // ゲームのindex.htmlを読み込む
  win.loadFile('index.html');
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