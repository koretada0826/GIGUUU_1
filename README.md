# GIGUUU株式会社 — 近未来コーポレートサイト（Three.js）

GIGUUU株式会社の公式サイトを題材にした、**近未来デザインの1ページ構成サイト**。
背景に Three.js のリアルタイム3D（ガラス結晶＋星間飛行＋星雲＋ブルーム）を全画面固定で描画し、
その上にグラスモーフィズム／ネオン／グリッチ／スキャンライン／スクロール演出を重ねている。

## ファイル構成
| ファイル | 役割 |
|---|---|
| `index.html` | ページ本体。GIGUUUの全セクションを踏襲（Hero / 01 About / 02 Mission / 03 Vision / 04 Value / 05 Story / 06 Business / TELEMO / 07 Message / 会社情報 / ポリシー / お問い合わせ / フッター） |
| `styles.css` | 近未来デザインシステム（カラー変数・グラス・ネオン・グリッチ・レスポンシブ） |
| `main.js` | Three.js の3D背景（全画面固定キャンバス。スクロール／マウス視差連動） |
| `site.js` | UI挙動（ローダー・ナビ・スクロール演出・数字カウントアップ・フォーム） |

## 起動方法
`type="module"` を使うため `file://` 直開きは不可。**http:// で配信**する。

```bash
cd /Users/koretada/Three.js
python3 -m http.server 5577
# → ブラウザで http://localhost:5577/index.html
```

VS Code の **Live Server（Go Live）** でも可。

## 技術メモ
- Three.js は importmap + CDN(unpkg) で読み込み（ビルド不要・`three@0.160.0`）。
- ポストプロセス：`EffectComposer` → `RenderPass` → `UnrealBloomPass` → `VignetteShader` → `OutputPass`。
- 背景はタブ非表示時に描画停止（省電力）。スクロール量で星の流速・カメラ奥行き・結晶回転が変化。
- お問い合わせフォームは**デモ**（実送信なし）。バックエンド接続で実運用化可能。

## 未確定・差し替えポイント
- 会社情報の **設立 / 代表者 / 所在地** は元サイトに記載がなく「―」表示。確定後に差し替え。
- ポリシー各ページ・SNSリンク・問い合わせ送信先は現状ダミー。
