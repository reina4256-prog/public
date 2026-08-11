# 職業仕様インデックス

## 分類

基本職と上級職の分類はユーザー確認済み。職業は今後さらに増える可能性があるため、1職業1ファイルで管理する。

### 基本職

| 職業 | 実装状態 | 仕様書 |
|---|---|---|
| 冒険家 | 実装済み | [`basic/adventurer.md`](basic/adventurer.md) |
| 農家 | 実装済み | [`basic/farmer.md`](basic/farmer.md) |
| 漁師 | 実装済み | [`basic/fisherman.md`](basic/fisherman.md) |
| 料理人 | 実装済み | [`basic/cook.md`](basic/cook.md) |
| 鍛冶師 | 実装済み | [`basic/blacksmith.md`](basic/blacksmith.md) |
| 建築士 | 実装済み | [`basic/builder.md`](basic/builder.md) |

### 上級職

| 職業 | 実装状態 | 仕様書 |
|---|---|---|
| 薬剤師 | 実装済み | [`advanced/pharmacist.md`](advanced/pharmacist.md) |
| 仕立屋 | 実装済み | [`advanced/tailor.md`](advanced/tailor.md) |
| パティシエ | 実装済み | [`advanced/pastry_chef.md`](advanced/pastry_chef.md) |
| 美容師 | 実装済み | [`advanced/hairdresser.md`](advanced/hairdresser.md) |
| コンシェルジュ | 実装済み | [`advanced/concierge.md`](advanced/concierge.md) |
| ディーラー | 実装済み | [`advanced/dealer.md`](advanced/dealer.md) |
| 占い師 | 未実装・構想段階 | [`advanced/fortune_teller.md`](advanced/fortune_teller.md) |
| 科学者 | 未実装・構想段階 | [`advanced/scientist.md`](advanced/scientist.md) |
| 販売員 | 未実装・構想段階 | [`advanced/salesperson.md`](advanced/salesperson.md) |

## 仕様の所有関係

- 全職業共通の遭遇、試験、Rank、報告、破門、皆伝、世代交代は [`apprenticeship_common.md`](apprenticeship_common.md)。
- 上級職に共通する複数職ライセンス・素材・施設連携は [`advanced/advanced_careers_common.md`](advanced/advanced_careers_common.md)。
- Rank課題、正解語、師匠口調、称号、固有報酬は各職業ファイル。
- 店舗・屋内ゲームの詳細は職業ファイルからコンテンツ仕様へリンクする。
- 共通仕様と個別仕様が衝突する場合は個別職業仕様を優先する。

## 職業追加時の必須項目

新職業では、内部ID、分類、解放条件、師匠、施設、遭遇動画、入門試験3問、Rank 1～9、習得語、バイト、皆伝称号・報酬、余生、次世代特別依頼、人物思い出、TCG人物カード、セーブ・移行、他コンテンツ依存を決める。
