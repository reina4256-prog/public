# AIテラリウム — 新方式の島

[ブラウザで遊ぶ](https://reina4256-prog.github.io/public/experimental_word_island.html)

[島からダンジョンへ](https://reina4256-prog.github.io/public/experimental_word_dungeon.html)：島で「はじめから」育てた同じ子を連れていき、自由入力で呼び名や個体への警告を教えて、接近／回避の違いを比較できます。中央は旧ダンジョン素材、右は共通会話／ノートです。戦闘・永続保存・日記本接続は未実装。ローカル起動は npm run start:words:dungeon。詳細は[所有仕様](docs/specs/dungeon/word_dungeon_preview.md)。

インストールせず、ロゴを押して「はじめから」で始められます。設問に答え、出会った子にサインすると、島での暮らしが始まります。チャットで声をかけ、反応やノートを見ながら遊べます。

このリンクは `npm run start:word` と同じ `experimental_word_island.html` を開きます。ブラウザ版は開いている間だけの試遊で、ページを閉じたり再読み込みしたりすると続きは残りません。専用アプリの保存とは共有しません。試遊レポートはゲーム内のボタンから保存できます。

ローカルで専用アプリを起動する場合は、依存関係をインストールした環境で `npm run start:word` を実行します。ブラウザでローカル確認する場合は `npm run start:web:words` です。

新方式の理解・日記は開発中です。現在相談している日記文章化の規則は、公開ゲームへまだ実装していません。現在の実装範囲は[仕様書](docs/specs/core/experimental_word_learning.md)を参照してください。

公開ゲームは GitHub Pages 上の上記リンクです。リポジトリURLはソースコードを閲覧する場所で、ゲームの入口とは異なります。
