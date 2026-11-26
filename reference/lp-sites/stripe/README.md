# Stripe 日本語トップページのローカル参考資料

取得元: https://stripe.com/jp （2026-10-01）

| ファイル | 内容 |
| --- | --- |
| `source.html` | 取得した元HTML |
| `index.html` | ローカルCSS・画像・フォントに書き換えた静的表示用HTML |
| `logo-wall.html` | 元HTMLの15社分のSVGを取り出したロゴ一覧。外部へのリンクは削除 |
| `css-source/` | 取得した元CSS 5点 |
| `css/` | フォント参照先をローカルに書き換えたCSS 5点 |
| `assets/` | 表示用画像・アイコン34点、フォント2点 |
| `manifest.json` | 保存したアセットの元URL・ローカルパス・サイズ |
| `mirror.py` | `source.html`から静的表示用HTMLとアセットを再生成するスクリプト |

`index.html`は見た目の確認用です。元サイトのReact実行用JS、解析タグ、遷移先ページ、`srcset`の全サイズは保存していないため、メニューや動的な操作は再現しません。元HTMLは`source.html`に残しています。

`business.html`には`logo-wall.html`を仮表示しています。ここに並ぶ企業はTELEMOの導入企業ではありません。実際の導入企業ロゴが確定したら差し替えます。
