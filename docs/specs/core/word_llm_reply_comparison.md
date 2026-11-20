# Geminiによる応答比較版

## 現在の実装仕様

- 2026-11-20ユーザー依頼：通常のLLMなし版を保持し、別コマンド・別保存で、自由入力への本人の返答だけをGemini自身の一般知識で生成する。既存理解・学習・行動／経験、実理解に基づく心の声を保持し、生成文から知識・ノート・実績を自動取得しない。[元方式](experimental_word_learning.md)のLLMなし方針は通常版で維持する。
- 追加条件は「別途課金が必要なら比較自体を中止」。個人Google AI Proの既存枠を使う後継Antigravity CLIへ接続を修正する。追加クレジット／APIキー／Google Cloud従量課金へ自動切替しない。旧Gemini CLIの個人Pro／Ultra向け提供は2026-06-18に終了済みで、ユーザーの実試行でUNSUPPORTED_CLIENTを確認した。5cbda74のfixture検証・ブラウザー許可成功を、実モデル接続成功として扱わない。
- `npm run start:word:gemini`は開発Electronの比較modeを起動し、保存先は既存の`AIPetGame-WordLearning-Gemini`を維持する。通常版`AIPetGame-WordLearning`とは別で、通常版の子をコピー／上書きしない。今回の比較版で作った子・声設定も維持する。製品配布版・公開Webへ自動接続しない。
- 対象は共通自由入力への本人応答（おまかせが同じ入力へ送る声かけを含む）。師匠の固定会話・自発的な生活／探索報告・同行教示は既存方式。core/worldの理解・学習・判断、被害／共通体力・育ち・ノート・星座・進化・図鑑／思い出は生成文で上書きしない。
- 生成文は表示と本人の選択声だけに使う。身ぶり主体でもLLM応答は会話として読める。[心の声](word_constellation_and_voice.md)は既存の実理解だけから表示するので、未理解の心の声と一般知識による返答が並ぶことがある。生成文は本人が理解／習得した証拠ではない。
- `replyPresentation`→`presentInputReply`→`showReply`で非同期表示する。元の受信処理・原reply／原表示・学習後state/worldを保持し、ノート／星座は原理解を描く。成功生成はinputId・原reply／原表示・source付き`guidance:llm_response`として分離し、旧発話記録へ偽装しない。新sourceは`antigravity-cli`、歴史の`gemini-cli`を改変しない。Node接続sourceは私用試遊版資料へ含め、HTTP配信対象にはしない。
- 待機中は世界／探索・おまかせ時計を保留する。新入力・停止／音声停止・設定／声選択・言語変更・非表示・新規開始等で取り消し、遅延結果を表示／発声しない。60秒上限、同時1件。取消し前に成立した入力理解／行動を巻き戻す機能ではない。
- 未認証／CLI未導入、契約内quota到達、サポート終了、その他の接続失敗を別の七言語案内で表示し、その入力は通常方式の返答に戻す。接続状態のDOMには日本語原文を渡し、翻訳層で一度だけ翻訳する。quota到達時は追加クレジットを使わず、枠の回復を待つ。追加料金や上位契約を要求する導線は作らない。
- 外部送信と別保存、追加クレジット不使用を画面で案内する。送信するのは最新入力・本人の名前／一人称／呼び方・姿、原応答状況、直近最大6件の生成成功会話。本人セーブ／ノート全体、ソース、秘密情報は送らない。直近会話は起動中だけで新規開始／終了時に破棄。生成文は1200文字まで、入力／本人の呼び名・生成文は保存時に翻訳しない。
- `antigravity_install.js`はGoogle公式installerのmanifestで確認したWindows x64 CLI1.5.12を固定URL／SHA512で検証し、プロジェクトの`node_modules/.cache/word-antigravity/agy.exe`へ配置する。installer自体は実行せず、PATH／拡張／グローバル導入は変更しない。取得途中のファイルを実行せず、上限400MiBとhash一致を要求する。旧npm CLI依存は削除。現在の実導入対象はWindows x64で、他OSの導入を確認済みにしない。
- `gemini_reply.configuration`は比較版配下`antigravity-home`の専用home／作業場とsession設定を使い、HOME／USERPROFILE／APPDATA等を子プロセスだけへ渡す。公式CLIのSSH/manual認証transportを一貫して使い、専用homeの`antigravity-oauth-token`をCLI自身に保存させる。OS全体のkeyringや旧CLIのtokenを読み出し／コピーしない。ゲーム側はファイルの存在だけを検査し、欠落時はCLIを起動しない。認証要求を検知したら自身の子だけを停止し、認証URL／tokenをUI・ログへ渡さない。
- 各起動の`--settings`で`useG1Credits:false`、`modelProvider:""`、空gcp設定、strict権限・全対応actionのdeny、slash／skill展開禁止を渡す。毎回この設定を書き直し、書込失敗なら生成を始めない。API鍵／ADC・Cloud関連の環境値を除去する。私用homeの外のhooks/MCP等を取り込まず、組込みtoolが存在してもファイル／コマンド／Web／MCPの実行は許可しない。自動更新もOFFにし、実行binaryのhashを確認する。
- CLIとの往復はshellなし・非表示の子へstdin NDJSONを1件送り、stream-jsonの単一terminal resultのSUCCESS／responseだけを使う。tool step、重複result、不正／未完status、過大出力は採用しない。思考過程はゲームの表示／保存へ取り込まない。CLI自身のローカル会話保存は専用home内で、`historySize:0`を会話DB全体の削除と解釈しない。実CLIでは`--print`が後続flagをpromptとして取得し、空printではstdinが使えなかったため、公式の`--input-format stream-json`経路を使用する。
- Electronのwindow/frame URL検査と取消・終了時の子停止を保持する。モデルはCLIの既定、任意の利用可能IDは`WORD_GEMINI_MODEL`で指定できる。契約名とモデル名を同一視しない。利用枠の消費はあり、追加料金なしを無制限利用と解釈しない。
- 2026-11-20、ユーザーがGoogle OAuthの新規認証と`/quit`を完了後、実際の接続helperから追加クレジットOFFの短い合成入力を送り、実モデル応答を取得した。fixtureの画面／学習状態照合と実Google応答は別の検証として[CURRENT](../../CURRENT_IMPLEMENTATION.md)に記録する。

## 確定している将来仕様

- 2026-11-20実会話後のユーザー指定：プレイヤーが見ている世界を本人へ伝え、覚えていく過程を残す。現在地・周囲の物等を自動供給する先行提案は採用しない。本人は自分がゲーム世界の住人だと知らず、その世界を現実として出発する。一般知識で会話できる現在の方針は維持するが、一般概念を知っていることと、この場の物の名前／意味を教わったことを同一視しない。未習の現地の物を最初から知っているように扱わない。具体的な入力／記憶の表現・制御方法は下記未決定事項として相談する。
- ゲーム内では裏で動くAIの製品名や「Geminiが考えている」等の技術的な処理表示を出さない。ゲーム内の案内・待機／失敗時の表現、本人が返す文への適用方法は実装前に整理する。導入操作書のCLI名／コマンドと、ゲーム内の本人の会話・表示を区別する。現在の実装にはAI名の表示とゲームである旨のpromptが残っており、この指定への対応は未実装。
- 追加課金が必要なら比較を続行しない条件、通常版／比較版の別起動・別保存、比較版の本人と声設定は維持する。

## 構想段階の案

- 同一画面の二方式併記、条件／モデルを変えた評価は今回追加しない。
- 2026-11-20ユーザー希望：プレイヤーとの会話内容を本人の知識／ノートにも残し、返答前に必要な記録を裏で参照して会話を再開したい。既存の「生成文から自動取得しない」境界をどこまで変えるか、保存対象／出所／習得扱いは未合意・未実装。ゲーム側で必要な記録を選んで渡す方式を検討するが、CLIのファイル読取権限を解放する承認ではない。
- 心の声をプログラムによる実理解の文章化から、Geminiに由来する表現へ変えられるかという相談。現接続は最終返答のみを採用し、内部思考の取得・表示は実装していない。別途生成する短い気持ち／迷い等のキャラクター表現は検討案であり、内部思考の逐語記録や実理解の証拠にしない。既存の心の声を置換するか、表示／保存範囲・追加利用量も未合意。

## 未決定事項

- 理解・行動決定のLLM化、公開／販売版の運用・課金、保存共有は未採用。永続会話memory／本人の知識・ノートとの関係／心の声の変更は上記希望を受けて相談中で、実装の承認にしない。
- プレイヤーが教えた内容を「教えてもらった会話記録」として保存して参照する範囲と、既存の習得判定・行動で使う知識へ採用する範囲。本人の生成返答を教示の出所にせず、対象未特定や誤説明の扱い、訂正／保存期間／読み出す量を決める必要がある。

## 導入・根拠

- [操作手順](../../word/GEMINI_REPLY.md)、[Google公式の旧CLI移行告知](https://developers.googleblog.com/an-important-update-transitioning-gemini-cli-to-antigravity-cli/)、[契約枠とoverages](https://antigravity.google/docs/plans/)、[CLI credits](https://antigravity.google/docs/cli/credits)、[設定とsession override](https://antigravity.google/docs/settings?tab=cli)、[headless stdin protocol](https://antigravity.google/docs/cli/headless/)、[公式認証](https://antigravity.google/docs/install?tab=cli)、[公式導入](https://antigravity.google/docs/getting-started)。固定版の実helpと、生成しないnative認証停止も別途確認する。fixtureの成功を実Google応答へ読み替えない。
