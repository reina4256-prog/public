# ゲーム仕様書インデックス

更新日: 2026-08-11

## この仕様書群の役割

このディレクトリは、ゲームに現在実装されている恒久仕様と、ユーザーが考えている将来仕様をコンテンツ単位で管理する。

- `AGENTS.md`: Codexの作業規則。
- `docs/CURRENT_IMPLEMENTATION.md`: 現在進行中の作業、直近の変更、未検証事項。
- `docs/specs/`: コンテンツごとの恒久仕様と将来構想。
- `game_system.md`: 移行元の旧マスター仕様。移行確認が終わるまで削除しない。

新しい作業では、`AGENTS.md`、`docs/CURRENT_IMPLEMENTATION.md`、この索引、対象コンテンツの仕様書、関連コードの順に確認する。

## 記載区分

各仕様書では、次の区分を混同しない。

- **現在の実装仕様**: コード上で現在動作する内容。
- **確定している将来仕様**: 実装前だが、ユーザーが導入を決定した内容。
- **構想段階の案**: 候補であり、採用・詳細・数値が未確定の内容。
- **未決定事項**: 実装前にユーザー判断が必要な点。

状態ラベルは `実装済み`、`一部実装`、`未実装・仕様確定`、`未実装・構想段階` を使う。ユーザーの最新指示が常に優先され、共通仕様と個別仕様が衝突するときは個別仕様を優先する。

## 更新ルール

1. 挙動を変更した実装ターンでは、対象仕様書の「現在の実装仕様」を更新する。
2. 将来構想を追加・変更したときは、該当仕様書の将来区分とこの索引の状態を更新する。
3. 同じルールを複数ファイルへ複製せず、所有する仕様書を1つ決めて他からリンクする。
4. 作業途中の試行錯誤、検証ログ、次の作業点は `CURRENT_IMPLEMENTATION.md` に置き、恒久仕様書を変更履歴にしない。
5. コードと仕様書が食い違う場合は、勝手に片方へ合わせず「実装不一致」として記録し、ユーザー意図を確認する。

新しい仕様書は [`_TEMPLATE.md`](_TEMPLATE.md) を基準に作成する。

## 読み分け表

| 作業対象 | 最初に読む仕様書 |
|---|---|
| 基本育成、性格、能力、体調 | [`core/game_flow_and_growth.md`](core/game_flow_and_growth.md) |
| チュートリアル、解放済みヒント、既読・世代継承 | [`core/tutorial_archive.md`](core/tutorial_archive.md) |
| 言葉、チャット、自律行動、作戦 | [`core/ai_words_and_tasks.md`](core/ai_words_and_tasks.md) |
| 通常探検、森・山、深層素材、探検中断 | [`core/field_exploration.md`](core/field_exploration.md) |
| 島、農業、釣り、アイテム、施設 | [`core/world_items_and_facilities.md`](core/world_items_and_facilities.md) |
| 進化、余生、死亡、世代交代 | [`core/evolution_lifecycle_inheritance.md`](core/evolution_lifecycle_inheritance.md) |
| 弟子入り共通処理 | [`careers/apprenticeship_common.md`](careers/apprenticeship_common.md) |
| 個別職業 | [`careers/README.md`](careers/README.md) から対象職業へ |
| 図鑑、放牧 | [`collections/pokedex_and_grazing.md`](collections/pokedex_and_grazing.md) |
| 思い出アルバム | [`collections/memories_and_album.md`](collections/memories_and_album.md) |
| 知識の手帳 | [`collections/knowledge_notebook.md`](collections/knowledge_notebook.md) |
| 音楽館 | [`collections/music_hall.md`](collections/music_hall.md) |
| マイホーム | [`myhome/myhome_and_concierge.md`](myhome/myhome_and_concierge.md) |
| レストラン、鍛冶屋、ショップ経営 | [`business/`](../specs/business/) |
| ダンジョン | [`dungeon/dungeon_common.md`](dungeon/dungeon_common.md) と対象ダンジョン |
| カジノ、ディーラー | [`casino/casino_dealer_and_map.md`](casino/casino_dealer_and_map.md) |
| トランプ | [`casino/trump_games.md`](casino/trump_games.md) |
| スロット | [`casino/slots.md`](casino/slots.md) |
| TCG | [`casino/tcg.md`](casino/tcg.md) |
| 闘技場 | [`castle/arena.md`](castle/arena.md) |
| 防衛戦 | [`castle/defense.md`](castle/defense.md) |
| フレンド、酒場、島訪問 | [`online/friends_tavern_and_visits.md`](online/friends_tavern_and_visits.md) |
| ランキング | [`online/rankings_and_async_battles.md`](online/rankings_and_async_battles.md) |
| 売買、競売、郵便受け | [`online/trading_auction_and_mailbox.md`](online/trading_auction_and_mailbox.md) |
| ダンジョン救助 | [`online/dungeon_rescue.md`](online/dungeon_rescue.md) |
| セーブ互換・移行 | [`internal/save_data_and_migration.md`](internal/save_data_and_migration.md) |
| Electron、Steam、Web起動 | [`internal/runtime_platform_and_audio.md`](internal/runtime_platform_and_audio.md) |
| オンライン中核、販売、運営費、ローカライズ | [`internal/online_release_and_localization_strategy.md`](internal/online_release_and_localization_strategy.md) |
| デバッグ、検証支援 | [`internal/debug_and_testing.md`](internal/debug_and_testing.md) |

## コンテンツ状態

| 領域 | 状態 | 備考 |
|---|---|---|
| 基本育成・進化・世代交代 | 実装済み | 継続的に調整中 |
| チュートリアル図鑑 | 実装済み | 進行解放、非ネタバレ表示、世代をまたぐ履歴を実装 |
| 通常探検 | 実装済み | 詳細仕様を試作済み。高優先度5項目は決定・反映済み。耐久度、デイリー二重進捗等は継続検討 |
| 基本職6種 | 実装済み | 冒険家、農家、漁師、料理人、鍛冶師、建築士 |
| 上級職6種 | 実装済み | 薬剤師、仕立屋、パティシエ、美容師、コンシェルジュ、ディーラー |
| 占い師 | 未実装・構想段階 | TCG人物カードは先行実装 |
| 科学者 | 未実装・構想段階 | TCG人物カードは先行実装 |
| 販売員 | 未実装・構想段階 | TCG人物カードは先行実装 |
| スカル／クリスタルダンジョン | 実装済み | 共通ローグライク基盤を共有 |
| カジノ | 一部実装 | ディーラー進行、4種トランプ、スロット、シングルTCG、免許皆伝後のTCGタッグ戦は実装済み |
| 闘技場／防衛戦 | 実装済み | オンラインランキング連携あり |
| オンライン要素 | 実装済み・一部要確認 | Firebase非同期連携。実機総合検証が必要 |
| オンライン中核・販売・ローカライズ再設計 | 一部実装 | Steam優先。非同期島社会と最低6言語を目標に基盤再設計予定 |

## 主な実装所有ファイル

| ファイル | 主な所有領域 |
|---|---|
| `system.js` | グローバル状態、マップ、セーブ、性格、音楽 |
| `ai_core.js` | AI状態、タスク、職業課題、進化、余生、引継ぎ |
| `ui_controller.js` | チャット、師匠会話、各種UI、施設ルーティング |
| `tutorial_core.js` | チュートリアル項目、進行解放、既読、世代をまたぐ保存、分類UI |
| `game_manager.js` | フィールド行動、農業、建築、経済 |
| `myhome_map_core.js` | マイホームとコンシェルジュ屋内処理 |
| `shop_map_core.js` | レストラン屋内マップと経営 |
| `dungeon_*.js` | ダンジョン生成、戦闘、ターン、描画、アイテム、特性 |
| `casino_map_core.js` | カジノ進行、屋内マップ、設備、スロット、トランプ連携 |
| `tcg_core.js` | 思い出カード、デッキ、TCG、カードショップ・競売 |
| `feature_pokedex.js` / `feature_grazing.js` | 図鑑と放牧 |
| `feature_arena.js` / `feature_defense.js` | 闘技場と防衛戦 |
| `cloud_manager.js` | 認証、クラウドセーブ、オンライン通信、キャッシュ |

## 既知の資料上の注意

- `game_system.md` は旧仕様と日付別更新メモが混在しており、最新コードと一致しない箇所がある。
- `CURRENT_IMPLEMENTATION.md` にはカジノ、思い出、マイホームの詳細な直近仕様がある。各仕様書へ移した後も、現在の作業引継ぎとして必要な部分だけを残す。
- 本仕様書群の初版は既存コードと資料から整理したもの。正確な数値表を持つ実装では、変更時にコードと仕様書を同時確認する。
- `core/field_exploration.md` はコード判定を再現できる粒度で作成した最初の詳細仕様試作である。他領域の概要仕様を同じ粒度へ展開する際の構成例とする。
