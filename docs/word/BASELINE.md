# 検証の基準点

## 2026-10-17・今回の資料／検証整理

- 保存付き全回帰：新方式1589＋監査38＋その時点の工具13＝1640項目通過。Nodeコマンド192999ms（TAP集計188735.7126ms）、七言語14957通過、リンク5文書errors[]・変更JS3本構文通過。
- 初回runはTemp/word-verification-tPJ7OT。完了後21原ファイルを`docs/.local-history/verification-runs/word-verification-tPJ7OT/`へバイト一致で保管し、`archive-index.json`に原パス／保存パス／各hashを記録。原summary内の絶対パスは当時のTempのまま保持。
- その後、通常ログ保存先をGit対象外ローカル履歴へ変更し、永続保存の一件を追加した工具14＋監査38＝52項目を`word-verification-mLOPBX`で再確認。変更依存先検証として85ゲームテストファイル未実行を明記。全回帰1640と後続52を混ぜて「1641件を全回帰済み」とは報告しない。
- renderer／実画面／音声／実ユーザー保存／配布は今回再実行していない。ゲームコード・表示文・保存形式を変更しておらず、brの既存renderer3397成功と今回の工具検証を区別する。
- 共有4文書の旧全行・工程表181text全文不変、ローカル旧handoffバイト一致を確認。原資料識別は[PRESERVATION.json](PRESERVATION.json)。保持検査を全履歴の意味再読に変換しない。

## 取得できた過去原ログ

`docs/.local-history/baseline-e54d423/`へコピーし、原本とhash一致を確認。Git対象外。取得できた三原ログの詳細は同所manifest.json。

| 原ログ | bytes | SHA256 |
| --- | ---: | --- |
| word-br-full-test-limited.log（成功） | 682676 | e6ce3bc17b310cec36e546c198261d7af1045a2160f3223d362c4a047c445c3b |
| word-br-audit-test.log（補正後成功） | 20260 | 17f71079cf76f7870c5355d20be940033c9bcaf39eda3e9b8cd9f2437ee9eb8b |
| word-br-full-test.log（中断・非成功） | 606050 | 203ac45b57eac0cb932473460946d92c13a1bebecbad2b5c47ed6399a686e1fe |

この三本以外の全過去原ログを取得できたとは主張しない。未取得の検証は正本・工程表内の記録と参照先を保持し、欠落ログを新造しない。

## e54d423・4d12br

- 採用範囲の実装・Codex検証・ユーザー実装後OK確認済み。ゲーム所有core/world最終936df00。
- 全1589通過：並列数2、495092.269ms。別監査38、変更七JS構文、七言語14957、独立renderer3397通過。
- 24群1549原616成立、38種23408改変拒否、既存28担当17248拒否、HTTP139要求404・二HTML200。
- [正本br節](../specs/core/experimental_word_learning.md#diary-incomplete-desire-reports-br)と[工程表の181](../WORD_DEMO_ROADMAP.md#word-br-continuation-181)に全API内訳・途中失敗・補正前後・旧条件を保持。今回の整理による再検証結果とは区別する。
- 旧一時ログ名は`word-br-full-test-limited.log`、`word-br-audit-test.log`、中断した初回`word-br-full-test.log`。renderer一時profileは`word-incomplete-desire-report-preview-RXClfB`。取得可否は今回のhandoffに記録し、存在を無条件に保証しない。

## 履歴を読むときの区別

- bq renderer制限内終了1と権限付き終了0、179生成日本語の文字コード補修前後、bp HTTP初回129／最終133と旧bo130、ay空腹補修前全1084と補修後専用20／renderer171を区別して保持。
- br監査の固定28更新漏れによる初回失敗と29へ補正後の成功、全体初回Ctrl-C終了1と並列2再実行成功、renderer制限内起動失敗と権限付き成功を区別する。
- 原資料保持・構造一致・今回の意味読了・人間OK・本接続保存配布検証は別の状態。旧未受領表示から確認済み範囲の再確認を要求しない。
