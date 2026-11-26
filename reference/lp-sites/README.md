# LP reference snapshots

The `index.html` in each directory is a local-path copy of the selected page. `source.html` is the unmodified HTML response, `assets/` contains downloaded CSS, JavaScript, images, and fonts, and `manifest.json` records the source and download failures.

| Directory | Original page |
| --- | --- |
| `haagen-dazs` (live view) | https://www.haagen-dazs.co.jp/ |
| `sunshine-autumn/` | https://sunshinecity.jp/file/official/autumn/ |
| `many-people/` | https://www.manypeople-k.com/recruit/ |
| `misignal/` | https://misignal.jp/ |
| `financial-japan/` | https://financialjapan.jp/recruit/ |
| `elixir/` | https://www.shiseido.co.jp/elixir/promotion/brightening-lotion-emulsion/ |
| `stripe/` | https://stripe.com/jp |
| `zendesk/` | https://www.zendesk.co.jp/lp/nb-support/ |
| `balmuda/` | https://www.balmuda.com/jp/ |

Häagen-Dazs returns HTTP 403 to command-line downloads from this environment and does not display inside the reference iframe. Its tab shows a link to the official page. The other pages have local HTML and assets. A few URLs supplied by the MANY PEOPLE, Financial Japan, and Elixir source pages return HTTP 404 and remain as source references; see each `manifest.json`.

The miSignal preview uses 44 original WebP/PNG/JPEG image files in place of browser-incompatible optimized AVIF variants. Three Zendesk logos served as SVG despite `.png` URLs are saved with `.svg` extensions so local servers send the correct MIME type. BALMUDA は `python3 reference/mirror_sites.py balmuda` で取得した静的HTMLミラー(GTM / HM タグは削除、拡張子 `.bin` の SVG ロゴ2点は `.svg` に変更、トップの About 画像は個別に取得して書き換え)。

## Aevion 系（2026-10-12 追加）

drone.riotters.com を基準に lp.webdesignclip.com から選んだ5サイトと、基準サイト自体の6件。いずれも JavaScript で組まれたページなので、`mirror_sites.py` ではなく `../mirror_browser.py`（ヘッドレス Chromium で描画した状態を保存する）で取得した。

| Directory | Original page | 取得方法 |
| --- | --- | --- |
| `aevion/` | https://drone.riotters.com/ | 描画後のDOMを静的保存。3D描画の `<canvas>` 4点はスクリーンショットに置換 |
| `flite/` | https://flite.bike/ | 描画後のDOMを静的保存。28MBの動画1本はポスター画像のみ |
| `radian/` | https://www.rideradian.com/ | 描画後のDOMを静的保存。Cookie同意は「Accept All」を押してから保存。HLS配信の動画はポスター画像のみ |
| `autonomous/` | https://becomeautonomous.com/ | スクロール位置ごとの画面キャプチャ（21枚）を縦に並べたページ。パネルを JavaScript で動かすため、DOM保存では1画面しか再現できなかった |
| `kingjim-mark/` | https://www.kingjim.co.jp/sp/mark/ | 描画後のDOMを静的保存 |
| `rig/` | https://rig.ai/ | 描画後のDOMを静的保存 |

静的保存したページの共通事項:

- `<script>`、解析タグ、Cookie ダイアログ、Framer / Webflow のバッジは削除。ホバーやスクロール連動のアニメーションは動かない。
- スクロールでピン留めされる場面（sticky 要素や GSAP の pin-spacer）は通常の流れに戻してある。元ページで何画面分もかけて切り替わる内容は、最初の状態だけが残る。
- 12MB を超える動画は保存せず、表示されていたフレームをポスター画像にした。
- ページ内リンクはそのまま、他ページへのリンクは元サイトの URL に向けた。
- フォントは閲覧時にブラウザが読み込んだものだけを保存している（Google Fonts の場合は全サブセット）。

再取得: `pip install playwright && python3 -m playwright install chromium` のうえで `python3 reference/mirror_browser.py aevion flite ...`（引数なしで6件すべて）。

## 表示方法

Run `python3 -m http.server 8000` from the workspace root, then open `http://localhost:8000/reference/lp-sites/`. The page switches between the fourteen sites with tabs; its URL hash selects a site directly, for example `#zendesk` or `#aevion`. Recreate a local snapshot with `python3 reference/mirror_sites.py <directory>` (first eight) or `python3 reference/mirror_browser.py <directory>` (Aevion 系). Stripe and Zendesk have separate `mirror.py` scripts in their directories.

These are single-page captures. They include assets referenced by the initial HTML and downloaded CSS (or, for the Aevion 系, the assets the browser loaded while scrolling through the page). Runtime API responses, pages reached through navigation, and browser-only lazy loads are outside the capture.
