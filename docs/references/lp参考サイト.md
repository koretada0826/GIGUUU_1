# LP参考サイト

8つの参考サイトを、1つのページからタブで切り替えて閲覧できます。

**閲覧URL:** http://127.0.0.1:4173/reference/lp-sites/

| サイト | 元サイト | 保存先 | 表示方法 |
| --- | --- | --- | --- |
| ハーゲンダッツ | [公式サイト](https://www.haagen-dazs.co.jp/) | `../../reference/lp-sites/haagen-dazs/` | 公式サイトをライブ表示 |
| サンシャインシティ 秋 | [特設ページ](https://sunshinecity.jp/file/official/autumn/) | `../../reference/lp-sites/sunshine-autumn/` | ローカル保存版 |
| MANY PEOPLE | [採用サイト](https://www.manypeople-k.com/recruit/) | `../../reference/lp-sites/many-people/` | ローカル保存版 |
| マイシグナル | [公式サイト](https://misignal.jp/) | `../../reference/lp-sites/misignal/` | ローカル保存版 |
| ファイナンシャル・ジャパン | [採用サイト](https://financialjapan.jp/recruit/) | `../../reference/lp-sites/financial-japan/` | ローカル保存版 |
| エリクシール | [美白化粧水・乳液の紹介ページ](https://www.shiseido.co.jp/elixir/promotion/brightening-lotion-emulsion/) | `../../reference/lp-sites/elixir/` | ローカル保存版 |
| Stripe | [日本語トップページ](https://stripe.com/jp) | `../../reference/lp-sites/stripe/` | ローカル静的保存版 |
| Zendesk | [サポート製品LP](https://www.zendesk.co.jp/lp/nb-support/) | `../../reference/lp-sites/zendesk/` | ローカル静的保存版 |

## 開き方

作業フォルダのルートで次を実行し、上記の閲覧URLを開きます。

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

タブを選ぶとURLの末尾にサイト名が付きます。例: [エリクシールのタブ](http://127.0.0.1:4173/reference/lp-sites/#elixir)。

## 保存内容と制限

ローカル保存したサイトには、取得したHTML、CSS、画像、フォントなどを配置しています。各サイトの `source.html` が取得時のHTML、`index.html` がローカル参照用のHTML、`assets/` が取得した素材、`manifest.json` が取得結果です。StripeとZendeskはサーバーで描画されたHTMLを静的表示用に保存しており、JSによる動的操作は含めていません。

ハーゲンダッツはコマンドラインからの取得にHTTP 403が返るため、タブ内で公式サイトを直接表示します。ほかのサイトでも、元サイトがHTTP 404を返した一部の素材や、閲覧中に追加読み込みされる素材・別ページは保存版に含まれない場合があります。

取得処理: 既存サイトは `python3 reference/mirror_sites.py <保存先ディレクトリ名>`、Stripeは `python3 reference/lp-sites/stripe/mirror.py`、Zendeskは保存済みHTMLから `python3 reference/lp-sites/zendesk/mirror.py`。
