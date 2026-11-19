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

- 現時点で追加の確定仕様はない。追加課金が必要なら比較を続行しない条件は現在仕様として維持する。

## 構想段階の案

- 同一画面の二方式併記、条件／モデルを変えた評価は今回追加しない。

## 未決定事項

- 理解・行動決定・記憶自体のLLM化、公開／販売版の運用・課金、保存共有、永続LLM会話memoryは未採用。今回の修正をこれらの承認にしない。

## 導入・根拠

- [操作手順](../../word/GEMINI_REPLY.md)、[Google公式の旧CLI移行告知](https://developers.googleblog.com/an-important-update-transitioning-gemini-cli-to-antigravity-cli/)、[契約枠とoverages](https://antigravity.google/docs/plans/)、[CLI credits](https://antigravity.google/docs/cli/credits)、[設定とsession override](https://antigravity.google/docs/settings?tab=cli)、[headless stdin protocol](https://antigravity.google/docs/cli/headless/)、[公式認証](https://antigravity.google/docs/install?tab=cli)、[公式導入](https://antigravity.google/docs/getting-started)。固定版の実helpと、生成しないnative認証停止も別途確認する。fixtureの成功を実Google応答へ読み替えない。
