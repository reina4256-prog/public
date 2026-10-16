# 検証の実行条件と結果の保存

2026-10-17ユーザー依頼の資料・検証整理。対象は開発作業。ゲームの理解規則・確認済み内容・公開判定は変更しない。

## 実行条件

| 変更・区切り | 必須の検証 |
| --- | --- |
| 文書のみ | ローカルリンク・原文保持・現在状態の整合、`git diff --check`。ゲーム全回帰を行わなかった旨を記録 |
| 検証工具のみ | 工具のテストと日記監査、変更JS構文。旧ゲーム検証を今回再実行済みとしない |
| 単独のゲーム部品・fixture | 変更箇所と推移的依存先テスト、監査、変更JS構文、関連renderer。日記部品変更では動的横断照合のため日記テスト群を含む |
| core/world/catalog、関係／生活／感情学習、careers、storage/serve/launch、ローカライズ、release構成、package.json | 新方式全Node回帰＋監査＋工具テスト＋七言語チェック。関連する実画面／renderer・保存・配布確認も変更に応じ実施 |
| 4d12／4全体／5／6など工程の完了・次の大工程へ移る区切り、複数系統の結合、配布候補 | `--full`による全回帰。実際のゲーム本接続・一時環境保存再開・UI音声・配布等の当該工程の通し確認を別記し、Node成功だけで工程を完了にしない |
| 依存関係が不明・登録外・解析で特定できない変更 | 全新方式回帰へ切替。`reviewRequired`へ残し、担当者が追加対象を調べる。自動的な狭い検証や成功認定をしない |

追加・変更したゲーム表示文は既存の七言語catalog更新・再構築・`i18n:check`を省略しない。既存の全テスト・smoke・npmコマンドは残す。全回帰の頻度変更はテスト削除や未検証機能の確認済み化を意味しない。

## コマンド

```powershell
npm run verify:words:plan -- --files experimental_word_diary_incomplete_desire_reports.js
npm run verify:words -- --files experimental_word_diary_incomplete_desire_reports.js
npm run verify:words -- --full
```

- `--plan`は実行せず、対象・除外・理由・未読未検証をJSON表示。
- `--files`省略時はGitのtracked差分・untracked通常状態から取得。対象外`%SystemDrive%/`を読まない。未追跡ディレクトリは勝手に再帰せず、具体ファイル指定を要求する。
- requireの静的な推移的依存に加え、日記部品の動的横断依存を補う。静的解析が完全だと主張せず、未知の変更は`reviewRequired`付き全回帰にする。
- 全回帰の登録元は既存`package.json`の`test:words`。監査と工具テストを追加して実行。既存`npm run test:words`の対象は変更しない。
- Nodeテストの並列数は2。各コマンド15分を上限とし、timeoutは成功扱いにしない。必要な上限変更は工具側で明示的に行う。
- rendererは既存の非表示・専用一時profile工具を使う。制限内で起動不能なら失敗記録を残し、権限付き再実行は別runとして保存。実ユーザー保存は使わない。

## 結果を読む場所

通常実行は`docs/.local-history/verification-runs/word-verification-*`という一意なローカル保存先へ残す。Git対象外で、既存配布設定の`!docs{,/**/*}`にも該当する。コマンドは最後に実際の絶対パスを表示する。ローカル詳細ログをGitへ一括追加しない。

| ファイル | 内容 |
| --- | --- |
| plan.json | HEAD、変更ファイルとSHA256、選択理由、実行予定、対象外テスト、読取未記録・未検証範囲 |
| summary.json / summary.md | 実行ごとの終了コード・状態・時間・件数、失敗／中断／未実行、残る要調査・未読未検証 |
| 000等のstdout.log / stderr.log | コマンドの詳細原出力。上書きせずrun単位に分離し、SHA256を集計へ保存 |
| 000等のfailures.log | TAP失敗箇所周辺の抜粋。抜粋で足りなければ原ログを読む |

最初にsummaryを読み、不通過があればfailuresとstderr、必要な原ログだけを読む。途中停止ではsummaryのrunning／未実行予定を保持し、完了集計のないexit 0もテスト成功にしない。fail/cancelled/skipped/todoがあればこの工具の完了判定は通さない。

読取記録は自動テストとは別。工具の`reading.status=not_recorded`は自動昇格しない。handoffには今回直接読んだ節／コード、未読、実行した範囲と未実行、過去の成功結果を引用した範囲を短く記す。

旧方式の一時ログと、本工具の初回全回帰の一時フォルダはOS清掃前に上記ローカル保存先へバイト一致で保管する。軽量な基準点・hash・取得可否は[BASELINE](BASELINE.md)へ記録する。過去のログが見つからなければ欠落と明記し、再現したログを過去原本と呼ばない。ローカル原本はこの作業フォルダに属するため、別PCへ渡す場合は原ログも必要に応じ別途引き継ぐ。
