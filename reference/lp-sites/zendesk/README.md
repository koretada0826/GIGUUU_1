# Zendesk サポート製品LPのローカル参考資料

取得元: https://www.zendesk.co.jp/lp/nb-support/ （2026-10-01）

| ファイル | 内容 |
| --- | --- |
| `source.html` | 取得した元HTML |
| `index.html` | 画像・フォント参照をローカルに書き換えた静的表示用HTML |
| `assets/` | 画像、アイコン、フォント |
| `manifest.json` | 素材の元URL、保存先、代替フォントの記録 |
| `mirror.py` | 保存済みHTMLから静的表示用HTMLと素材を再生成するスクリプト |

`index.html` はデザイン参照用です。元ページの実行用JSと解析タグは含めていないため、フォーム送信やJSによる操作は再現しません。極細のVanillaSansフォント4件は元URLがHTTP 403を返したため、Lightウェイトで代用しています。
