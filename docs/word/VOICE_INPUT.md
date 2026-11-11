# デスクトップ版の音声入力

新方式の開発Electronでは、マイク音声をPC内のWhisper.cppで文字にします。VOICEVOXは読み上げ用で、音声入力の認識は行いません。Chromeへの移行・APIキー・認識の従量課金は不要です。

## この作業端末での使い方

認識エンジン／多言語smallモデル／人声検出用VADモデルはこの端末に導入済みです。ゲームを一度終了し、従来どおり `npm run start:word` で起動し直してください。

1. 会話中に「音声で入力」を押し、「聞いています」の表示後に話します。初回はモデル準備の時間があります。Windowsでマイクを拒否している場合は、Windowsのマイクのプライバシー設定でデスクトップアプリのアクセスを確認します。
2. 話している間、途中の認識文が入力欄へ順次表示されます。暫定文は後から修正され、同じ文を重ねて追記しません。既存の下書きは保持します。更新は少し遅れて届き、速度はPC性能・発話長に依存します。
3. 約3秒の無音で録音を終え、録音全体から確定文を作ります。確定後に確認・修正し、自分で送信します。音声入力だけでは送信・学習しません。無音のみ約5秒、1回最大20秒のため長い文は分けてください。会議全体を連続録音する機能ではありません。
4. 認識中にもう一度押すか停止すると取り消します。画面／言語変更や入力編集時も取り消し、古い結果を後から入力しません。

音声入力中はゲームのBGMを一時的に小さくし、終了・取消後に元の設定音量へ戻します。音量設定は保存し直しません。人声検出で発話部分を選びますが、強いBGMや雑音を完全に分離できる保証はありません。最終判定が音楽などになった場合は、途中候補を上書きせず「確定できませんでした」と案内します。残った候補も正しいとは限らないため、確認・修正してから送ってください。

認識モデルをPC内で再利用し、音声はメモリ内のWAVとして処理します。音声ファイルを保存せず、モデル推論・認識音声を外部サービスへ送りません。ブラウザー版の標準認識ではブラウザー提供サービスへ送信される場合があります。

## 別の開発端末で導入する場合

Windows x64で `node scripts/experimental/setup_speech.js` を一度実行します。旧base／small導入済み端末の更新も同じコマンドです。公式Whisper.cpp CPU版約9MB、多言語small-q5_1モデル約190MB、人声検出用Silero VAD約885KBをダウンロードし、公開SHA256を照合します。通常のゲーム起動中にはダウンロードしません。

配置先は `docs/.local-history/voice-input-engine/` です。Git・現行配布対象へ追加しません。VOICEVOX導入済み環境では、そのMicrosoft VC runtimeを開発用フォルダ内だけにコピーします。別端末で不足する場合は[Microsoft公式VC++ runtime案内](https://learn.microsoft.com/en-us/cpp/windows/latest-supported-vc-redist)を確認してください。

ソース・配布元・licenseは[Whisper.cpp公式](https://github.com/ggml-org/whisper.cpp)、[多言語モデル配布元](https://huggingface.co/ggerganov/whisper.cpp)、[モデルのlicense](https://github.com/openai/whisper/blob/main/LICENSE)、[VAD配布元](https://huggingface.co/ggml-org/whisper-vad)、[Sileroのlicense](https://github.com/snakers4/silero-vad/blob/master/LICENSE)を参照。導入フォルダにもlicenseを保存します。

## Steam向け配布で残ること

デスクトップの認識経路は維持します。販売版にはエンジン／モデル／licenseを適切に同梱し、正式なVC++ prerequisiteを設定して、実パッケージでマイク・認識・終了を確認する工程が残ります。現段階で販売版の同梱・配布まで完了したとは扱いません。コードのpackaged参照先は `resources/word-speech/` です。

現在の動作・境界の所有は[音声仕様](../specs/core/word_constellation_and_voice.md)、検証と未確認範囲は[handoff](../CURRENT_IMPLEMENTATION.md)を参照してください。
