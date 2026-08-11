# 実行環境・配布・共通音声仕様

状態: 実装済み・配布最適化未完了

## 実行環境

- `npm start` はElectron/Steam向けの標準起動。
- `npm run start:web` は `127.0.0.1:4173` で同じゲームを配信する。
- `npm run start:web:lan` はLAN検証用に `0.0.0.0` へバインドする。
- `browser_server.js` は依存なしの静的サーバーで、MIME、Range、パス包含、no-storeへ対応する。
- ブラウザ・Android候補環境では `require` がないため、Electron/Steam呼出しをガードして通常Webとして動かす。

## Electron・Steam

- `electron_main.js` がウィンドウ、フルスクリーン、Steamworksブリッジ、終了処理を所有する。
- 開発ビルドだけDevToolsを開き、パッケージ版では自動表示しない。
- Windows `dir` ビルドは `signAndEditExecutable: false`。現在の友人配布ビルドは未署名で、カスタムEXEメタデータを埋め込まない。
- 配布単位は `dist/win-unpacked` フォルダ全体で、EXE単体ではない。
- 現状は画像・動画・音声を広く同梱するため約5.7GiBで、サイズ最適化は未完了。

## 共通音声

- `audioManager` がBGM停止、再生、通常曲復元、再生済み解放を扱う。
- 各コンテンツは入場・状態・結果・退出で所有BGMを要求し、退出時に通常曲へ戻す。
- 音楽館のプレイヤー向け仕様は `collections/music_hall.md`。

## 検証

- JavaScript変更は対象ファイルごとに `node --check`。
- Web版は `/` とスクリプト、Rangeレスポンス、`node_modules` 遮断を確認する。
- Windowsビルドは `npm run build` 後、環境由来の `ELECTRON_RUN_AS_NODE` を除いて起動確認する。
- Android/Google Playは別ラッパー、AAB、署名、ストア要件が必要で、まだ実装していない。

## 確定している将来仕様

- Electron/Steam版を維持しながら、通常ブラウザ検証経路も維持する。
- 第一販売先はSteamのPC買い切り版とし、オンライン利用を本体価格に含める。発売時サブスクリプションは採用しない。
- 第二販売先が必要な場合は、同じPC/Electron版を大きく作り替えず配布できるダウンロード販売先を先に比較する。
- 有料ブラウザ版とGoogle Play版は現時点の販売対象外とする。ブラウザ版は開発検証と、必要なら軽量な無料デモに使う。
- 現在の画像・音楽・動画の原本を再生成せず保全する。将来の容量最適化は、原本から配布用コピーを機械変換する方式で行う。
- 詳細な判断根拠は [`online_release_and_localization_strategy.md`](online_release_and_localization_strategy.md) が所有する。

## 構想段階の案

- 実際のモバイル需要と対応工数を確認できた場合に、Android/Google Play展開を再検討する可能性がある。
- 配布サイズ削減、アセットパッキング、署名導入の可能性がある。

## 未決定事項

- 第二販売先、署名、Steam本番App ID、アップデート配布、配布用アセット圧縮方式は未決定。
- Google Play版を再検討する場合のAndroid技術方式、アセットパック分割、端末要件は未決定。
