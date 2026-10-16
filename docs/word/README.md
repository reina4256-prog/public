# 新方式：普段読む入口

2026-10-17の資料・検証整理により追加。このファイルは参照の入口であり、ゲーム内容の成立条件はリンク先の所有仕様に従う。

2026-10-17：bsの実装後OKを維持し、ユーザーがbtの対象／成立保持を個別採用。[同じbtの継続案内](NEXT_CHAT.md)と[bt所有仕様](../specs/core/experimental_word_learning.md#diary-incomplete-negated-preference-reports-bt)を参照。

## 現在地

- 2026-10-17最新：bt対象／成立保持を個別採用、[否定好悪報告の意味・関係不足](../specs/core/experimental_word_learning.md#diary-incomplete-negated-preference-reports-bt)は採用範囲の実装・Codex検証完了。専用39・全Node1721・七言語14957・別run関連renderer3085通過。bt実装後OK未受領。

- btの最新commit/push結果は[現在作業](../CURRENT_IMPLEMENTATION.md)を参照。従前ゲーム実装5dd4a25・確認移動文書ac12086、ゲーム所有core/world最終936df00を維持。
- bsまでの採用範囲は実装・Codex検証・ユーザー実装後OK確認済み。最新ao〜bs人間OKを旧固定監査のnot_received／ao=falseより優先し、再確認を求めない。
- 83枠82確認済み、正式子72。採用されたbtの一枠一子だけ追加。同じbtで実装後のフィードバック・OK確認を待つ。4d12／4d／ID4全体未完、総残数再算定なし。
- 旧仮0〜5工程・中心2はbr確認前の過去予測。今回は総残数を再算定しない。ID4本接続・本文・絵・暦・保存・成長等を4d12の残数に混算しない。

## 読む順序

1. ローカルの[現在作業](../CURRENT_IMPLEMENTATION.md)で最新依頼・完了／未完・次の検査点を読む。
2. 本ファイルと[維持条件・保留](OPEN_ITEMS.md)を読む。
3. [担当索引](OWNERS.md)から今回変更する部品と所有仕様の該当節を読む。基盤変更ならその呼出先・依存先も読む。
4. [検証方針](VALIDATION.md)に従い計画を出し、対象と未実行範囲を確認して実行する。
5. 過去の理由・検証途中詳細・不一致調査が必要な場合に、下の原資料の該当箇所へ進む。

全履歴の毎回全文再読・全参照先の無制限再帰読取を開始条件にしない。参照が残っていること、原文保持、機械的一致、意味上の読了、人間の確認を別々に記録する。読んでいない範囲を読了と報告しない。

## 内容別の所有先

| 内容 | 所有する仕様・次の参照 |
| --- | --- |
| brの既存not_now必要意味関係不足 | [正本br節](../specs/core/experimental_word_learning.md#diary-incomplete-desire-reports-br)と[担当索引](OWNERS.md) |
| 日記の基本合意・未決定境界 | [日記合意](../specs/core/experimental_word_learning.md#合意済みの日記方針ゲームへの本接続は未実装)、[未決定境界](../specs/core/experimental_word_learning.md#未決定既存実装との境界) |
| 4a〜4i、ID5〜10の範囲 | [既存工程表](../WORD_DEMO_ROADMAP.md#残作業10単位)、[保留表](OPEN_ITEMS.md)。実装済みへの自動昇格なし |
| 全入口の意味照合と担当重複 | [既存監査仕様](../specs/core/experimental_word_diary_audit.md#担当と具体範囲の索引)、[担当索引](OWNERS.md) |
| 今後の検証・ログ運用 | [検証方針](VALIDATION.md)。内容仕様・理解規則の変更ではない |
| 過去検証の基準点 | [検証基準点](BASELINE.md)。今回再実行した結果とは区別 |
| 新方式以外のゲーム領域 | [総合仕様索引の読み分け表](../specs/README.md#読み分け表) |

## 過去原文・履歴の所在

- [既存工程表](../WORD_DEMO_ROADMAP.md)の全181開始／継続文、[正本](../specs/core/experimental_word_learning.md)、[監査仕様](../specs/core/experimental_word_diary_audit.md)、[総合仕様索引](../specs/README.md)の旧本文は元の場所へ保持。既存リンクの参照先は変更しない。
- 旧巨大ローカルhandoffは`docs/.local-history/CURRENT_IMPLEMENTATION-before-organization-2026-10-17.md`へバイト一致のコピーを保存し、Git対象外を維持した。現在のhandoffは短い作業メモへ置き換え済み。保存確認の基準点は[PRESERVATION.json](PRESERVATION.json)。
- 過去文中の「末尾開始文全文を読む」等は当時の再開手順として保持する。今後の通常開始は本ファイルの読む順序を優先し、必要な原文だけを参照する。
- 仕様の「現在の実装仕様」「確定している将来仕様」「構想段階の案」「未決定事項」を維持する。索引追加や履歴保存を、未採用の内容仕様の採用へ変換しない。
