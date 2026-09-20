# ゲーム仕様書インデックス

更新日: 2026-09-12

## この仕様書群の役割

このディレクトリは、ゲームに現在実装されている恒久仕様と、ユーザーが考えている将来仕様をコンテンツ単位で管理する。

- `AGENTS.md`: Codexの作業規則。
- `docs/CURRENT_IMPLEMENTATION.md`: 現在進行中の作業、直近の変更、未検証事項。
- `docs/specs/`: コンテンツごとの恒久仕様と将来構想。
- `game_system.md`: 移行元の旧マスター仕様。移行確認が終わるまで削除しない。
- [工程6の再開メモ](../STEP6_CHECKPOINT.md): 一旦中断する実装の到達点、残作業、検証入口。機能仕様の正本は引き続き本仕様書群とする。

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
| タイトル画面、キャラクター自由エディット | [`core/title_screen_editor.md`](core/title_screen_editor.md) |
| 育成メイン画面、島・建物自由エディット | [`core/main_map_editor.md`](core/main_map_editor.md) |
| チュートリアル、解放済みヒント、既読・世代継承 | [`core/tutorial_archive.md`](core/tutorial_archive.md) |
| 言葉、チャット、自律行動、作戦 | [`core/ai_words_and_tasks.md`](core/ai_words_and_tasks.md) |
| 自動通知、AI吹き出し、失敗再試行の重複抑止 | [`core/automatic_feedback_and_retry.md`](core/automatic_feedback_and_retry.md) |
| 警告、確認、通知、文字入力、共通ゲーム内ダイアログ | [`core/ui_dialogs_and_notifications.md`](core/ui_dialogs_and_notifications.md) |
| 通常探検、森・山、深層素材、探検中断 | [`core/field_exploration.md`](core/field_exploration.md) |
| 島、農業、釣り、アイテム、施設 | [`core/world_items_and_facilities.md`](core/world_items_and_facilities.md) |
| 屋内水槽・池、釣った魚の収容 | [`core/indoor_aquariums_and_ponds.md`](core/indoor_aquariums_and_ponds.md) |
| 進化、余生、死亡、世代交代 | [`core/evolution_lifecycle_inheritance.md`](core/evolution_lifecycle_inheritance.md) |
| 過去世代の住人、専用住居、住人名簿 | [`core/island_residents.md`](core/island_residents.md) |
| 弟子入り共通処理 | [`careers/apprenticeship_common.md`](careers/apprenticeship_common.md) |
| 個別職業 | [`careers/README.md`](careers/README.md) から対象職業へ |
| 図鑑、放牧 | [`collections/pokedex_and_grazing.md`](collections/pokedex_and_grazing.md) |
| 思い出アルバム | [`collections/memories_and_album.md`](collections/memories_and_album.md) |
| 知識の手帳 | [`collections/knowledge_notebook.md`](collections/knowledge_notebook.md) |
| 音楽館 | [`collections/music_hall.md`](collections/music_hall.md) |
| 音楽制作室、自作CD、ボイス収録 | [`collections/music_creation_studio.md`](collections/music_creation_studio.md) |
| マイホーム | [`myhome/myhome_and_concierge.md`](myhome/myhome_and_concierge.md) |
| マイホーム自由エディット、コンシェルジュポイント | [`myhome/myhome_editor_and_concierge_points.md`](myhome/myhome_editor_and_concierge_points.md) |
| レストラン、鍛冶屋、ショップ経営 | [`business/`](../specs/business/) |
| レストラン・鍛冶屋・カジノ自由エディット共通 | [`business/facility_layout_editors.md`](business/facility_layout_editors.md) |
| レストラン調理設備の画像制作 | [`business/restaurant_kitchen_asset_manifest.md`](business/restaurant_kitchen_asset_manifest.md) |
| 追加機能全体の不足画像制作一覧 | [`internal/missing_image_asset_manifest.md`](internal/missing_image_asset_manifest.md) |
| ダンジョン | [`dungeon/dungeon_common.md`](dungeon/dungeon_common.md) と対象ダンジョン |
| カジノ、ディーラー | [`casino/casino_dealer_and_map.md`](casino/casino_dealer_and_map.md) |
| トランプ | [`casino/trump_games.md`](casino/trump_games.md) |
| スロット | [`casino/slots.md`](casino/slots.md) |
| TCG | [`casino/tcg.md`](casino/tcg.md) |
| 闘技場 | [`castle/arena.md`](castle/arena.md) |
| 防衛戦 | [`castle/defense.md`](castle/defense.md) |
| 城の屋内マップ | [`castle/indoor_map.md`](castle/indoor_map.md) |
| フレンド、酒場、島訪問 | [`online/friends_tavern_and_visits.md`](online/friends_tavern_and_visits.md) |
| ランキング | [`online/rankings_and_async_battles.md`](online/rankings_and_async_battles.md) |
| 売買、競売、郵便受け | [`online/trading_auction_and_mailbox.md`](online/trading_auction_and_mailbox.md) |
| ダンジョン救助 | [`online/dungeon_rescue.md`](online/dungeon_rescue.md) |
| TCGリアルタイムP2P対戦 | [`online/tcg_realtime_p2p.md`](online/tcg_realtime_p2p.md) |
| セーブ互換・移行 | [`internal/save_data_and_migration.md`](internal/save_data_and_migration.md) |
| Steam体験版、製品版とのビルド分離、データ引継ぎ | [`internal/steam_demo_and_full_release.md`](internal/steam_demo_and_full_release.md) |
| ログイン・ログアウト、オンライン無効構成の認証境界 | [`online/online_foundation.md`](online/online_foundation.md) |
| Electron、Steam、Web起動 | [`internal/runtime_platform_and_audio.md`](internal/runtime_platform_and_audio.md) |
| オンライン中核、販売、運営費、ローカライズ | [`internal/online_release_and_localization_strategy.md`](internal/online_release_and_localization_strategy.md) |
| デバッグ、検証支援 | [`internal/debug_and_testing.md`](internal/debug_and_testing.md) |

## コンテンツ状態

| 領域 | 状態 | 備考 |
|---|---|---|
| Steam体験版・製品版分離 | 未実装・構想段階 | 1世代限定、能力上限は暫定150、進化不可。基本職はRank 8報告まで、Rank 9不可、能力上限での課題停滞は許容。余生・世代引継ぎ画面を非公開とし寿命で体験終了・保存。製品版タイトルで任意読込みまたは新規開始を選択し、寿命到達済みデータは世代引継ぎ画面から開始。詳細相談中、実装は仕様整理後 |
| 基本育成・進化・世代交代 | 実装済み | 継続的に調整中 |
| 共通ゲームシェル・画面遷移 | 一部実装 | 島・マイホーム・レストラン・鍛冶屋の中央表示、共通コマンド・ログ・クエストHUD、シーン／停止所有を実装。城・カジノ・ダンジョンは未移行 |
| 過去世代の島住人 | 一部実装 | 世代登録・保存復旧・検索付き名簿・４人小屋・島内移動・基本日課／不在精算を実装。工程６の全付随効果と職業実技は未完了。住人用上級職実技は各職業仕様で確定。工程７と城移行は保留 |
| タイトル画面キャラクター自由エディット | 未実装・仕様確定 | 引継ぎ時10Gで永久解放。図鑑解放済みキャラクターの配置・表示・前後順等を編集 |
| 育成メイン画面・島自由エディット | 未実装・仕様確定 | 建築士皆伝の次世代クエストで永久解放。既存の地形・自然物・建物だけを再配置 |
| マイホーム自由エディット | 未実装・仕様確定 | 皆伝後、マップ・ライセンス両引継ぎの次世代会話で永久解放。可変部屋、将来家具、増減するコンシェルジュポイントを前提に全構成要素を編集 |
| 経営施設自由エディット | 一部実装 | 鍛冶屋はLv5永久解放、未設置設備、代替設備、可変床形状、自動外壁、4内装、3マス入口、基準位置、複数階、保存検証、Undo/Redoを個別実装済み。レストラン・カジノとの共通化、一括ロック、AI自動配置等は未実装 |
| 屋内水槽・池 | 未実装・仕様確定 | 全屋内施設で配置可能。専用モーダル、容量別収容、魚の成長・繁殖・食物連鎖、出し入れ・鑑賞、中庭配置に対応する共通設備を予定 |
| BGM自由選択エディット | 未実装・仕様確定 | 現行全必須曲の再生後、引継ぎ時10Gで永久解放。全再生文脈を個別に従来選曲または解放済み1曲へ変更 |
| 音楽制作室・自作CD・ボイス制作 | 未実装・仕様確定 | 2階8×6の制作室、かんたん／こだわり制作、自動・住人共同作曲、固定音源CD、全会話対象の生声・AI音声制作を導入。採用音声モデル、音色数、配置座標等の実装カタログは未決定 |
| チュートリアル図鑑 | 実装済み | 進行解放、非ネタバレ表示、世代をまたぐ履歴を実装 |
| 自動通知・失敗再試行の重複抑止 | 未実装・仕様確定 | 同一状態の継続中は自動報告と進展しない同一行動を一回に抑え、解消後の再発だけ再通知 |
| 共通ダイアログ・警告・通知UI | 一部実装 | ゲーム内UIは複数存在するが標準alert／confirm／promptが多数残る。新規・変更コードでは直接使用せず共通ゲーム内UIへ統一 |
| 通常探検 | 実装済み | 詳細仕様を試作済み。高優先度5項目は決定・反映済み。耐久度、デイリー二重進捗等は継続検討 |
| 基本職6種 | 実装済み | 冒険家、農家、漁師、料理人、鍛冶師、建築士 |
| 上級職6種 | 実装済み | 薬剤師、仕立屋、パティシエ、美容師、コンシェルジュ、ディーラー |
| 占い師 | 一部実装 | 城内NPC・通常会話とTCG人物カードを先行実装。弟子入り・Rank課題は未実装 |
| 科学者 | 一部実装 | 城内NPC・通常会話とTCG人物カードを先行実装。弟子入り・Rank課題は未実装 |
| 販売員 | 一部実装・将来仕様確定 | 城内NPC・通常会話とTCG人物カードを先行実装。内部ID `merchant`、自動回答型Rank 0～9、皆伝後の既存ショップ経営を確定 |
| スカル／クリスタルダンジョン | 実装済み | 共通ローグライク基盤を共有 |
| カジノ | 一部実装 | ディーラー進行、4種トランプ、スロット、シングルTCG、免許皆伝後のTCGタッグ戦は実装済み。一般CPUの補充を住人へ置換し、人数不足時は減員・最低人数未満なら開始不可とする仕様が確定 |
| 城の屋内マップ | 実装済み | 3×2の6室を扉遷移なしで構成。チャット移動、6NPC、受注元復帰、専用マップチップ調整に対応 |
| 闘技場／防衛戦 | 実装済み | 隊長／王様から受注。防衛戦の自動発生と王城総合受付は廃止。オンラインランキング連携あり |
| オンライン要素 | 実装済み・一部要確認 | Firebase非同期連携とTCGフルメッシュP2P。実Firebase・複数PC検証が必要 |
| オンライン中核・販売・ローカライズ再設計 | 一部実装 | Steam優先。体験版はオンライン非表示・無効、製品版もオンラインなしで配布できる構成を予定（発売時の採否は未決定）。オフライン構成の認証選択・名前登録省略と製品版のログアウトボタンを予定。初期7言語基盤実装、人手LQA未完了 |

## 主な実装所有ファイル

| ファイル | 主な所有領域 |
|---|---|
| `system.js` | グローバル状態、マップ、セーブ、性格、音楽 |
| `ai_core.js` | AI状態、タスク、職業課題、進化、余生、引継ぎ |
| `craft_core.js` | 主人公・住人の調合・裁縫の個人材料、成功判定、成果・技能、通常課題回数 |
| `ui_controller.js` | チャット、師匠会話、各種UI、施設ルーティング |
| `tutorial_core.js` | チュートリアル項目、進行解放、既読、世代をまたぐ保存、分類UI |
| `game_manager.js` | フィールド行動、農業、建築、経済 |
| `myhome_map_core.js` | マイホームとコンシェルジュ屋内処理 |
| `shop_map_core.js` | レストラン屋内マップと経営 |
| `blacksmith_map_core.js` | 鍛冶屋屋内マップ、チュートリアル、固定レシピ、仕込み・営業動線、Lv、自由エディット |
| `dungeon_*.js` | ダンジョン生成、戦闘、ターン、描画、アイテム、特性 |
| `casino_map_core.js` | カジノ進行、屋内マップ、設備、スロット、トランプ連携 |
| `tcg_core.js` | 思い出カード、デッキ、TCG、カードショップ・競売 |
| `tcg_tag_core.js` / `tcg_p2p_core.js` | ローカル／オンラインのタッグ系ルール、WebRTC対戦、ホスト移行 |
| `feature_pokedex.js` / `feature_grazing.js` | 図鑑と放牧 |
| `feature_arena.js` / `feature_defense.js` | 闘技場と防衛戦 |
| `castle_map_core.js` | 城内連続マップ、チャット移動、6NPC、王様／隊長クエスト導線 |
| `cloud_manager.js` | 認証、クラウドセーブ、オンライン通信、キャッシュ |

## 既知の資料上の注意

- `game_system.md` は旧仕様と日付別更新メモが混在しており、最新コードと一致しない箇所がある。
- `CURRENT_IMPLEMENTATION.md` にはカジノ、思い出、マイホームの詳細な直近仕様がある。各仕様書へ移した後も、現在の作業引継ぎとして必要な部分だけを残す。
- 本仕様書群の初版は既存コードと資料から整理したもの。正確な数値表を持つ実装では、変更時にコードと仕様書を同時確認する。
- `core/field_exploration.md` はコード判定を再現できる粒度で作成した最初の詳細仕様試作である。他領域の概要仕様を同じ粒度へ展開する際の構成例とする。
