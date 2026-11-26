# TELEMO ヒーロー改善案プレビュー

- 何か: 調査レポート `docs/research/hero-ui-ideas-2026-10-12.md`「6. 改善案」の推奨3案（AI通話ログのガラスカード／透明→ティールの下側グラデ＋導入ロゴ帯（ダミー）／余白付きの角丸パネル）を、現行ヒーローの書体・文言・ボタンに重ねた静止プレビュー。サイト本体（index.html・CSS）は変更していない。
- 開き方: `python3 scripts/serve.py 8000` を動かした状態で http://localhost:8000/output/hero-concept/preview.html?img=../../assets/hero/concept/telemo-hero-concept-v1-a.png （`img` は preview.html からの相対パス。省略時は `assets/hero/callcenter-hero-poster.jpg`）。
- 書き出し: `python output/hero-concept/render.py [--img assets/hero/concept/telemo-hero-concept-v1-a.png] [--out DIR]` → `preview-1440.png`（1440×900）・`preview-1280.png`（1280×800）・`preview-390.png`（390×844、倍率 2）。`--img` を付けると名前に `-<画像のベース名>` が付く。Playwright（Python）が必要。サーバーが動いていなければ自動で起動する。
