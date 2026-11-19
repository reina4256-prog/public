# Geminiによる応答比較版

## 現在の実装仕様

- 2026-11-20ユーザー依頼：既存のLLMなし版を残し、起動コマンドを変えて、同じ自由入力の本人応答だけを実際のLLMへ替えて比較する。本人の理解済み知識に制限する案ではなく、Gemini自身の一般知識で自由に返答する案を採用。接続は契約中Googleアカウントで使うGemini CLIを採用し、APIキー方式ではない。[元方式](experimental_word_learning.md)のLLMなし方針は通常版で維持する。
- `npm run start:word:gemini`は開発Electronを比較modeで起動し、userDataを通常版の`AIPetGame-WordLearning`とは別の`AIPetGame-WordLearning-Gemini`にする。通常の起動コマンドは変更しない。通常版の保存をコピー／上書きせず、比較版では独立した子を開始／続行する。製品配布版・公開Webへ自動接続しない。
- 対象は共通自由入力への本人の返答（おまかせが同じ入力へ送る声かけを含む）。師匠の固定会話・自発的な生活／探索結果の報告・冒険家同行の教示用会話は既存方式。原理解・学習・行動決定・経験・被害／体力・育ち・ノート・星座・進化・図鑑／思い出は従来のcore/world／接続で処理し、生成文で上書きしない。
- 生成文は表示と本人の選択声での読み上げだけに使い、語彙・知識・経験・完了実績へ採用しない。身ぶり主体でも比較版のLLM応答は会話として読める。心の声は[既存の実理解](word_constellation_and_voice.md)だけから表示するため、意味を理解できていない心の声と、一般知識によるGemini返答が並ぶことがある。これは二つの処理の比較であり、本人が理解／習得した証拠ではない。
- UIは`replyPresentation`で元の表示を投影し、`presentInputReply`で生成依頼する。受信処理・原reply・学習後state／worldを先に従来どおり保存する。ノートと会話道筋は原reply／原表示に基づき、生成文を原理解の結果として描かない。成功した生成文は別の`guidance:llm_response`へinputId・原reply／原表示・source付きで記録する。LLM発言を本人の既存発話記録として偽装しない。試遊の版資料へ新しいNode接続sourceも含め、HTTP配信対象には追加しない。
- 待機中は世界／探索・おまかせの時計を保留する。新入力、既存停止、音声停止、設定／声選択、言語変更・非表示・新規開始等で古い生成を取り消し、遅延返答を表示／発声しない。取得失敗／未ログイン／利用枠等は明示案内し、その入力は元方式の返答を表示する。待機上限60秒、1件だけを処理し、新依頼は古い依頼を取り消す。取消済み入力の学習／行動を巻き戻す機能ではない。
- 表示に生成元・外部送信・別保存を案内する。Googleへ渡すのは最新入力、本人の名前／一人称／呼び方・姿、原応答による状況、直近最大6件の生成成功会話。本人セーブ全体・ノート全体・ソースファイルや秘密情報を送らない。直近会話は起動中の補助文脈で、新規開始／終了時に破棄し、本人知識へ保存しない。表示／読み上げの生成文は1200文字まで。原呼び名／入力／生成文は翻訳しない。
- Nodeの`gemini_reply.js`は公式`@google/gemini-cli@0.69.0`を`node`互換プロセスからshellなし・非表示で起動し、文脈をstdin、結果をJSONの最終responseだけから読む。promptへコマンドを埋め込まず、思考過程は取得しない。CLI home・作業場・設定／OAuth認証・履歴は比較版配下へ隔離する。`tools.core=[]`と全tool拒否policy、MCP許可空、extensions none、hooks／skills／agents／自動memoryを無効化。OAuth方式を固定しAPIキー等の環境値を除去する。CLIの任意ファイル／コマンド操作へ自由入力を渡さない。
- Electron IPCは既存のwindow／frame URL検査を使う。未ログインならCLIを起動して認証画面を勝手に開かず、初回setupコマンドを案内する。返答の取得に失敗してもraw stderr・認証URL・tokenをrendererや試遊記録へ出さない。子プロセスは自身が起動した1件だけを停止する。
- Googleアカウントの契約枠を使い、APIキーの従量課金へ自動切替しない。モデルはCLIの既定選択で、必要なら起動前の`WORD_GEMINI_MODEL`で利用可能なモデルIDを指定する。契約名と実モデルを同一視せず、利用枠と可用性はGoogle側に依存する。

## 確定している将来仕様

- 比較版の実装依頼は採用済み。初回ログインと実際の応答の聞こえ方はユーザーの契約アカウントで確認する。実装・検証／発行の確定状態は[CURRENT](../../CURRENT_IMPLEMENTATION.md)に記録する。

## 構想段階の案

- 同一画面で二方式の応答を並べる比較、プロンプト条件やモデルを変えた評価は今回追加しない。

## 未決定事項

- 既存理解・行動決定・記憶そのもののLLM化、公開版／販売版の運用・課金・全体保存共有、永続LLM会話memory。今回の応答比較をこれらの実装承認にしない。

## 導入・根拠

- [操作手順](../../word/GEMINI_REPLY.md)。公式の[CLI利用枠](https://geminicli.com/docs/resources/quota-and-pricing/)、[非対話JSON応答](https://geminicli.com/docs/cli/headless/)、[認証](https://geminicli.com/docs/get-started/authentication/)、[設定](https://geminicli.com/docs/reference/configuration/)、[tool拒否policy](https://geminicli.com/docs/reference/policy-engine/)を確認。Gemini APIの直接利用は[Google AIプランとは別枠](https://aistudio.google.com/docs/google-ai-plans)。CLI導入／fixture検証を実Google応答の成功へ読み替えない。
