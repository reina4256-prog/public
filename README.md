# AIテラリウム — 新方式の島

[ブラウザで遊ぶ](https://reina4256-prog.github.io/public/experimental_word_island.html)

[ダンジョンの独立試作](https://reina4256-prog.github.io/public/experimental_word_dungeon.html)：一部屋で、理解状態を切り替えながら指示と自主判断を比べられます。指示と異なる行動の理由も表示します。本編の知識・保存には未接続で、再読み込みすると初期化されます。ローカル起動は `npm run start:words:dungeon`。範囲は[独立試作仕様](docs/specs/dungeon/word_dungeon_preview.md)を参照してください。

インストールせず、ロゴを押して「はじめから」で始められます。設問に答え、出会った子にサインすると、島での暮らしが始まります。チャットで声をかけ、反応やノートを見ながら遊べます。

このリンクは `npm run start:word` と同じ `experimental_word_island.html` を開きます。ブラウザ版は開いている間だけの試遊で、ページを閉じたり再読み込みしたりすると続きは残りません。専用アプリの保存とは共有しません。試遊レポートはゲーム内のボタンから保存できます。

ローカルで専用アプリを起動する場合は、依存関係をインストールした環境で `npm run start:word` を実行します。ブラウザでローカル確認する場合は `npm run start:web:words` です。

新方式の理解・日記は開発中です。現在相談している日記文章化の規則は、公開ゲームへまだ実装していません。現在の実装範囲は[仕様書](docs/specs/core/experimental_word_learning.md)を参照してください。

公開ゲームは GitHub Pages 上の上記リンクです。リポジトリURLはソースコードを閲覧する場所で、ゲームの入口とは異なります。
