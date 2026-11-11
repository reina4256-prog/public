# デスクトップ版の音声入力

新方式の開発Electronでは、マイク音声をPC内のWhisper.cppで文字にします。VOICEVOXは読み上げ用で、音声入力の認識は行いません。Chromeへの移行・APIキー・認識の従量課金は不要です。

## この作業端末での使い方

認識エンジン／多言語baseモデルは導入済みです。ゲームを一度終了し、従来どおり `npm run start:word` で起動し直してください。

1. 会話中に「音声で入力」を押して話します。Windowsでマイクを拒否している場合は、Windowsのマイクのプライバシー設定でデスクトップアプリのアクセスを確認します。
2. 話し終わって約1.2秒無音になるとPC内で認識します。無音のみの場合は約5秒で終了します。1回最大20秒、長い文は分けて話してください。
3. 入力欄へ入った文を確認・修正し、自分で送信します。音声入力だけでは送信・学習しません。
4. 認識中にもう一度押すか停止すると取り消します。画面／言語変更や入力編集時も取り消し、古い結果を後から入力しません。

認識中は音声を一時WAVファイルとして処理し、結果の読込後に削除します。モデル推論・認識音声は外部サービスへ送りません。ブラウザー版の標準認識ではブラウザー提供サービスへ送信される場合があります。

## 別の開発端末で導入する場合

Windows x64で `node scripts/experimental/setup_speech.js` を一度実行します。公式Whisper.cpp CPU版約9MBと多言語baseモデル約148MBをダウンロードし、公開SHA256を照合します。通常のゲーム起動中にはダウンロードしません。

配置先は `docs/.local-history/voice-input-engine/` です。Git・現行配布対象へ追加しません。VOICEVOX導入済み環境では、そのMicrosoft VC runtimeを開発用フォルダ内だけにコピーします。別端末で不足する場合は[Microsoft公式VC++ runtime案内](https://learn.microsoft.com/en-us/cpp/windows/latest-supported-vc-redist)を確認してください。

ソース・配布元・licenseは[Whisper.cpp公式](https://github.com/ggml-org/whisper.cpp)、[多言語モデル配布元](https://huggingface.co/ggerganov/whisper.cpp)、[モデルのlicense](https://github.com/openai/whisper/blob/main/LICENSE)を参照。導入フォルダにもlicenseを保存します。

## Steam向け配布で残ること

デスクトップの認識経路は維持します。販売版にはエンジン／モデル／licenseを適切に同梱し、正式なVC++ prerequisiteを設定して、実パッケージでマイク・認識・終了を確認する工程が残ります。現段階で販売版の同梱・配布まで完了したとは扱いません。コードのpackaged参照先は `resources/word-speech/` です。

現在の動作・境界の所有は[音声仕様](../specs/core/word_constellation_and_voice.md)、検証と未確認範囲は[handoff](../CURRENT_IMPLEMENTATION.md)を参照してください。
