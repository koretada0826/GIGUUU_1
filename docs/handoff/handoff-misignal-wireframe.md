# 別ターミナルへの引き継ぎ：マイシグナル型 TELEMO LP

作業ディレクトリ: `/Users/rintaro/giguuu改善`

## 最初に読むファイル

1. [`telemo-wireframe.md`](telemo-wireframe.md) — 採用するページ構成と各セクションの対応表
2. `../../business.html` と `../../telemo-lp.css` — 現在のGIGUUU / TELEMO LP
3. `../../reference/lp-sites/misignal/index.html` — マイシグナルのローカル参考ページ

プレビュー: `http://127.0.0.1:4173/business.html`  
参照ページ: `http://127.0.0.1:4173/reference/lp-sites/#misignal`

## 作業の目的

マイシグナルの**情報を見せる順序とセクションの役割**を、GIGUUUのTELEMO LPに適用する。商品そのものの説明はTELEMOのものを維持する。既存LPの作業を引き継ぎ、指定された箇所を編集する。新しいLPをゼロから作り直さない。

構成順: ヘッダー → ヒーロー → 数字・信頼材料 → 導入企業ロゴ欄 → 音声体験 → 営業の7工程 → 4つの仕組み → 改善サイクル → 利用シーン → 開発者の背景 → 料金 → 導入手順 → FAQ → 最終CTA。

## 情報とデザインの境界

- マイシグナルから参考にするのは構成・余白・視線誘導。文章、画像、HTML、CSSはGIGUUU / TELEMOへ流用しない。
- 商品の事実、数値、料金、FAQの根拠は、ユーザー指定の「提案資料0910.pdf」だけ。以前の指定パス `/Users/rintaro/Downloads/提案資料0910.pdf` は現在見つからない。PDFを確認できるまで新しい商品事実を加えず、既存文言を維持する。
- `business.html#clients` の15社のロゴは、Stripe掲載企業の**仮表示**。TELEMOの導入企業ではない。実際の導入企業ロゴが提供されたら差し替える。現在の仮表示を実績として表現しない。
- 色は既存GIGUUUサイトの紺・青・オレンジを基調とする。

## 完了条件

- [`telemo-wireframe.md`](telemo-wireframe.md) と `../../business.html` のセクション順と役割が一致する。
- ページ内リンク、ローカル画像・CSS参照、PCとスマートフォン表示を確認する。
- 変更したファイルと確認結果を報告する。ブラウザで確認できなければ、その点を明記する。
