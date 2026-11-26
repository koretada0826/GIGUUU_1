# ヒーロー画像UI 調査レポート（TELEMO 向け）2026-10-12

## 1. 概要

### 目的
- 優れたサイトのヒーロー（ファーストビュー）を短時間で多数巡回し、画像UIのアイデアを持ち帰る。
- 対象は GIGUUU社「TELEMO」の LP ヒーロー。現行は、コールセンターで働く人のドキュメンタリー風映像（12秒ループ）を全面に敷き、左に実HTMLの見出し・リード・ボタン2つを重ねる構成。

### 方法
- 4人の調査員が分担して巡回した。
- 撮影は Playwright の共通スクリプト（`scripts/hero_capture.py`）。PC 1440×900 で 0.8秒・3秒・6秒後の3フレーム、700px スクロール後、SP 390×844 を撮った。
- ノートは「画像を見て確認できたこと」だけを書く方針。見ていない点は「未確認」「unknown」。
- 動きは静止フレームの差分からの推定が中心。motion-craft 担当のみ 7サイトを 0.3〜0.5秒刻みとスクロール位置別でも撮った。

### 巡回ソースと件数

| 担当 | 主なソース | 撮影数 | 詳細ノート |
|---|---|---:|---:|
| 日本のLPギャラリー（jp-galleries） | lp.webdesignclip.com、muuuuu.org、sankoudesign.com、io3000.com、81-web.com | 62（失敗・到達不可 3） | 28 |
| 同業・隣接業界（industry-direct） | AI電話・CTI・コールセンター/BPO・HR/業務SaaS・大企業を直接訪問 | 39（試行40、取得失敗1。うち5件はヒーロー確認不可） | 20（ほか一言メモ 14） |
| 動きの設計（motion-craft） | 映像・動きが特徴のサイトを直接訪問 | 22（成功20・失敗2） | 20 |
| 海外ギャラリー（global-galleries） | land-book.com、lapa.ninja、httpster.net、saaslandingpage.com、siteinspire.com、minimal.gallery ほか | 70（観察可65・観察不能5） | 20（ほか一言メモ 34） |
| 合計 | | 193（各担当の申告の合計） | 88 |

- `shots/` フォルダの meta.json は 194 ファイル。申告の合計（193）との差1件は未確認。
- 撮影の注意: 共通スクリプトの同意ボタン処理（`OK` の部分一致）で、ページが最下部へ飛んだ状態で撮れたサイトがあった。global-galleries 担当が報告し、担当分は再撮影済み。
- 21:30〜21:32 に共通スクリプトが更新され、locomotive-ca と、ノート未作成の5サイト（Talkdesk、Gong、HubSpot JP、ANA、コマツ）が再撮影された（更新者は未確認）。locomotive-ca は現在の画像にヒーローが写っているが、ノートは旧画像（フッター）に基づく記述のまま。
- `sites.json` は詳細ノート 88件を slug で重複排除したもの（重複なし、88件）。
- score は各担当の「TELEMO への参考度」（5段階）。担当ごとに基準の言い回しが少し違うので、横比較は目安。

### 見方
- 一覧ビューア: http://localhost:8000/output/hero-research/ （型・タグ・担当・score で絞り込み、比較、アイデア一覧タブあり）
- 統合データ: `output/hero-research/sites.json`
- 担当別ノート: `output/hero-research/notes/{jp-galleries,industry-direct,motion-craft,global-galleries}.md`（JSON も同名）
- 画像: `output/hero-research/shots/<slug>-pc-f0|f1|f2.jpg`、`-pc-scroll.jpg`、`-sp.jpg`

### 結論（先に）
- 現行の「働く人の映像＋実HTML文字」は、国内の同業では希少。方向性は維持してよい。
- 一方、海外の音声AI（Parloa、Clarion）は同じ型をすでに採っている。差は「文字の下地」「AIが働いている証拠の重ね方」「白地へのつなぎ方」の作り込みで出る。
- 推奨トップ3（詳細は 6章）:
  1. 映像に「AI通話ログ」のガラスカードを重ねる（Parloa 型）
  2. 文字の下地をティールの下側グラデにし、実績・ロゴ帯を同居させる（Clarion 型）
  3. 映像を余白付きの角丸パネルに収め、白地とつなぐ（Lightship・Aevion 型）

## 2. ヒーロー画像UIの型（タクソノミー）

`sites.json` の hero_type 集計（88件）。平均は score の平均。

| 型 | 件数 | 平均 | 特徴 | 成立条件 | 代表例 | TELEMO 適性 |
|---|---:|---:|---|---|---|---|
| full-bleed-photo（全面写真） | 17 | 4.2 | 写真を全面に敷き、文字を重ねる | 写真内に文字の置き場（空・壁・白飛び）があるか、スクリム・ベール・帯で作る。顔と文字を重ねない | [Clarion](https://www.clarionhealth.com/)、[Career Kikkake](https://agent.kikkake.cc/)、[ウェアラ](https://www.weara.co.jp/tedori/) | ◎ 現行の静止画版にあたる。下地処理の質で差が出る |
| full-bleed-video（全面映像） | 14 | 4.0 | ループ映像を全面に敷く | カットが変わっても文字位置は固定。軽量化と一時停止の手段 | [Parloa](https://www.parloa.com/)、[Lightship](https://www.lightshiprv.com/)、[パタゴニア](https://www.patagonia.jp/) | ◎ 現行と同型 |
| framed-image-card（額縁カード） | 12 | 4.2 | 写真・映像を角丸カードに収め、周囲は白や色面 | 周囲の地色、角丸・余白のルール。文字はカードの外か、カード内の空き | [ベルシステム24](https://www.bell24.co.jp/)、[Reevo](https://reevo.ai/)、[自由が丘クリニック 採用](https://jcdc.co.jp/recruit/01/) | ◎ 白地×ティールのLPと地続きにしやすい |
| collage-grid（コラージュ） | 7 | 4.0 | 複数の人物写真をグリッド・マーキーで並べる | 同じ光・同じ背景で撮った写真が複数枚必要 | [Hakuhodo DY ONE 採用](https://recruit.hakuhodody-one.co.jp/)、[クレア・ライフ・パートナーズ 採用](https://crea-lp.com/recruit/)、[TVer 採用](https://recruit.tver.co.jp/) | △ 採用サイト向き。素材が足りない |
| typographic-with-small-image（文字主役＋小写真） | 7 | 3.4 | 大きな見出しが主役。写真は小さく添える | コピーが強いこと | [ギフティグループ](https://giftee-group.com/)、[Town](https://www.town.com/)、[Y Combinator](https://www.ycombinator.com/) | ○ 映像を使わない代替案 |
| split-text-image（左右分割） | 5 | 4.0 | 左に文字、右に画像 | 右側の画像が単独で成立すること | [SmartHR](https://smarthr.jp/)、[LayerX](https://layerx.co.jp/)、[Overpass](https://www.overpass.com/) | ○ 国内SaaSの定番。差別化は弱い |
| device-mockup（UIモック） | 6 | 3.3 | 製品画面のモックが主役 | 見せられる製品UIがあること | [IVRy](https://ivry.jp/)、[Giga](https://giga.ai/)、[MiiTel](https://miitel.com/) | △ 同業の定番で埋もれる。UIは写真上の部品として使う |
| slider-carousel（カルーセル） | 6 | 2.8 | 複数スライドを自動で切り替える | 訴求を1つに絞れない場合 | [Anam](https://anam.ai/)、[TMJ](https://www.tmj.jp/)、[Rivian](https://rivian.com/) | × 訴求が散る（Anam の「中央1枚だけ動画」は参考） |
| 3d-canvas（3D） | 3 | 3.7 | WebGL の3Dが主役 | 3D制作の予算 | [Aevion（Riotters）](https://drone.riotters.com/)、[Lusion](https://lusion.co/) | △ 出現の順序だけ参考 |
| illustration（イラスト） | 2 | 2.0 | イラストが主役 | — | [SmartHR 10th Anniversary](https://smarthr.jp/smarthr-10th-anniversary/)、[Unseen Studio](https://unseen.co/)（入口画面。参考外） | × |
| other（その他） | 9 | 2.9 | ロゴ文字の写真窓、ブロブマスク、入口画面など | — | [UNION TEC](https://www.union-tec.jp/)、[Somali](https://somali.co.jp/lp01/)、[unrep](https://unrep.jp/) | △ 部品として参考 |

タグの傾向（担当ごとの自由記述なので表記ゆれあり。目安）:
- `people-photo` が 88件中 37件。人物写真を主役か準主役にする例が最多。
- 動きの実装は `gsap` 9件、`lenis` 7件、`preloader` 8件。
- 信頼要素は `logo-marquee` 4件、`laurel-badges` 4件。SP 専用の縦動画 `separate-sp-video` は 4件。

## 3. 文字を写真に載せる技法の整理

評価はノートと画像からの定性判断。実測ではない。

| 技法 | 代表サイト | 可読性 | 写真の濁り | 実装の軽さ | TELEMO との相性 | メモ |
|---|---|---|---|---|---|---|
| 下側だけのスクリム（ブランド色） | [Clarion](https://www.clarionhealth.com/)、[Parloa](https://www.parloa.com/) | ◎ | 中（下1/3だけ） | ◎ CSS グラデ1枚 | ◎ | Clarion は黒でなく濃いティールで落とす。顔の位置より下だけ |
| 全面の薄い暗幕 | [Huts](https://huts.com/)、[Institute of Health](https://www.instituteofhealth.com/)、[Oscar](https://www.hioscar.com/) | ○ | 大 | ◎ | △ | 白地LPの中で暗い塊になりやすい |
| 方向性スクリム（文字側だけ） | [デジタルハリウッド 採用](https://www.dhw.co.jp/jobs/2024/)、[Genesys](https://www.genesys.com/) | ◎ | 小〜中 | ◎ | ○ | 現行の「左に文字」にそのまま合う |
| 白ベール（白→透明の横グラデ） | [Career Kikkake](https://agent.kikkake.cc/)、[らくしふ](https://rakushifu.jp/)、[日本新薬 採用](https://www.nippon-shinyaku.co.jp/recruit/) | ◎（濃色文字） | 小（明るくなる） | ◎ | ○ | 素材が明るい（ハイキー）ことが前提。暗い映像だと灰色に濁る |
| 帯ラベル（行ごとに不透明の帯） | [ウェアラ](https://www.weara.co.jp/tedori/)、[SmartHR 採用](https://recruit.smarthr.co.jp/)、[アルティウスリンク](https://www.altius-link.com/) | ◎ | なし | ◎ | ○ | 写真は無加工のまま。主張が強いので明朝との相性は未確認 |
| 半透明キャプションボックス | [リクルート](https://www.recruit.co.jp/) | ○ | 局所 | ◎ | ○ | 白基調のサイトに合う |
| 額縁カード（文字は写真の外） | [ベルシステム24](https://www.bell24.co.jp/)、[Reevo](https://reevo.ai/)、[LANDIC 採用](https://www.landic.com/recruit/)、[Unify](https://www.unifygtm.com/) | ◎ | なし | ○ | ◎ | 文字と写真を分ける。映像の見える面積は減る |
| インセット枠（左右に余白の角丸パネル） | [Lightship](https://www.lightshiprv.com/)、[Aevion](https://drone.riotters.com/)、[Palantir](https://www.palantir.com/) | 文字の置き方次第 | なし | ◎ | ◎ | 余白は 8〜30px。白地と地続きになる |
| 形のマスク（六角形・ブロブ・ロゴ窓） | [LayerX](https://layerx.co.jp/)、[Somali](https://somali.co.jp/lp01/)、[UNION TEC](https://www.union-tec.jp/)、[JR西日本電気システム 採用](https://www.j-nesco.com/recruit/) | ◎（文字は白地側） | なし | △ clip-path/SVG の調整 | ○ | ロゴ形状と合わせると固有性が出る |
| 色面で切る（波形・斜め） | [VESSEL](https://vessel-for.jp/)、[ベルシステム24](https://www.bell24.co.jp/) | ◎ | なし | ○ | ◎ | 次セクションも同色にすると地続きになる |
| 2トーン文字（1行目濃色、2行目グレー） | [Aevion](https://drone.riotters.com/)、[Intercom](https://www.intercom.com/)、[14islands](https://14islands.com/) | 背景次第 | — | ◎ | ○ | 下地処理ではなく文字側の工夫。ティール＋グレーで組める |
| デュオトーン（写真をブランド1色に） | [クレア・ライフ・パートナーズ 採用](https://crea-lp.com/recruit/)、[DMJ 採用](https://dmj-japan.co.jp/recruit/) | ◎ | 意図的に色を落とす | ○ | △ | ドキュメンタリーの現実感が薄れる |
| ガラス調カード・ピル | [Parloa](https://www.parloa.com/)、[REKKI](https://rekki.com/)、[Institute of Health](https://www.instituteofhealth.com/) | ○（背景次第） | 局所 | △ 映像上の backdrop-filter は重い可能性 | ○ | 見出しではなく「UIの証拠」を載せる用途 |
| 切り抜き人物＋色面 | [SmartHR](https://smarthr.jp/)、[Overpass](https://www.overpass.com/)、[越前信用金庫 採用](https://www.shinkin.co.jp/echishin/recruit/) | ◎ | なし | △ 切り抜き素材が要る | △ | 映像では難しい。広告キャスト風に見える危険 |
| 無加工（空など均質な領域に直接） | [Revolut](https://www.revolut.com/)、[Lightship](https://www.lightshiprv.com/) | 素材次第 | なし | ◎ | ○ | Gemini 生成時に「文字用の余白」を構図で指定すれば成立 |

まとめ:
- 人物写真が主役のサイトの多くは、全面を暗くせず「部分的な下地」で文字の面を作っている。
- 顔と文字を重ねない配置（顔の下、顔の逆側、写真の外）がほぼ共通。

## 4. 同業・隣接業界の傾向と差別化の余地

出典: `notes/industry-direct.md`（詳細20件＋一言メモ14件）。海外の音声AIは global-galleries から補足。

### 定番
- 左に見出し、右にビジュアルの左右分割。見出し直下に実績バッジ（月桂冠の「No.1・シェア・社数」）と導入ロゴ帯。例: [MiiTel](https://miitel.com/)、[IVRy](https://ivry.jp/)、[SmartHR](https://smarthr.jp/)、[マネーフォワード クラウド](https://biz.moneyforward.com/)。
- CTA は主（塗り）＋副（白枠）の2つ。日本勢はボタン上に吹き出しラベルで行動理由を足す（SmartHR、マネーフォワード、IVRy）。
- 主役のビジュアルは UIモックか抽象グラフィックが多数派。人物写真が主役なのは少数（SmartHR、LayerX、Genesys、カオナビ、ベルシステム24）。
- 動きは静止かカルーセルが大半。スクロール連動は [Genesys](https://www.genesys.com/)（写真が楕円に縮む）と [LayerX](https://layerx.co.jp/) のみ確認。

### 弱点（同業）
- コールセンター/BPO（[TMJ](https://www.tmj.jp/)、[アルティウスリンク](https://www.altius-link.com/) など）は、文字を焼き込んだバナーの自動カルーセルとストック風のヘッドセット写真が主流。写真の扱いが粗い。
- 今回見た AI電話・音声AI（国内: MiiTel、IVRy、[KARAKURI](https://karakuri.ai/)／海外: [Five9](https://www.five9.com/)、[Aircall](https://aircall.io/)）は、人物写真ヒーローがほぼ無い。UI・イラスト・抽象グラフィックが中心。

### 差別化の余地
- 「現場で働く人のドキュメンタリー映像＋実HTML見出し」は国内同業では希少。信頼感と業務感で差が出る。
- ただし海外の音声AIでは [Parloa](https://www.parloa.com/)（人物映像＋通話チャットUI）、[Clarion](https://www.clarionhealth.com/)（電話を受ける人＋ティールの下側スクリム）が同じ型を採っている。型の新しさではなく作り込みで勝負する。
- 写真と AI の価値をつなぐ UI（通話要約カード、会話吹き出し）の重ね方は、今回見た範囲では [Dialpad](https://www.dialpad.com/)、Genesys、Aircall、Parloa に限られる。国内同業ではまだ少ない。
- 電話番号/QR でその場で体験させる CTA は、industry-direct の範囲では IVRy のみ。海外は [Giga](https://giga.ai/)（TALK ボタン）、Clarion（マイク付き「Try it out」）。

### 避けるべき点
- コピーを映像・画像に焼き込む（SEO・翻訳・アクセシビリティ・可変レイアウトに不利）。
- 自動カルーセルで複数訴求を並べる（[カオナビ](https://www.kaonavi.jp/)、TMJ）。
- 細字×淡色の見出し（カオナビ、[ダイキン](https://www.daikin.co.jp/)）。コントラスト不足。
- SP でオーバーレイが H1 に衝突（Genesys）。告知バー・フロートバナー・固定バーの重なり（[RingCentral](https://www.ringcentral.com/)、SmartHR）。
- ストック風の「ヘッドセット女性」や広告キャスト風の切り抜き。TELEMO はドキュメンタリー調を維持する。

## 5. 動きの設計の型

出典: `notes/motion-craft.md`（20件）。数値は観察値。「提案値」と書いたものは担当の提案。

### 読み込み直後の時系列
- **文字を先に出し、映像は1カットで決める型**: [Apple MacBook Pro](https://www.apple.com/jp/macbook-pro/) は 0.5秒で見出し・CTA 表示済み。映像は 1.0秒で暗がりから現れ、約3秒の1カットを1回だけ再生して最終フレームで止まる（loop=false）。[Oura](https://ouraring.com/) は写真が先、文字は 0.8秒で半透明、3秒で不透明＋CTA。
- **1要素ずつ組み上げる型**: [Aevion](https://drone.riotters.com/) はローダー（0.3〜2.7秒）→被写体（3.5秒）→空のパネルがマスクで開く（6秒）→言葉（10秒）。静かだが約10秒は営業LPには長い。[Garden Eight](https://garden-eight.com/) は見出しが1行ずつ下から現れる。
- **文字そのものを動かす型**: [Palantir](https://www.palantir.com/) は約0.5秒開始、約40ms/字のタイプ表示で 1.8秒で全文。ランダム記号から組み上がる演出（Locomotive）は明朝の日本語に不向き。
- 注意: プリローダーを挟む構成は jp-galleries だけで 7件あった。LP では表示の遅れになりやすい。

### ループ映像
- [パタゴニア](https://www.patagonia.jp/) は 8秒ループ（ファイル名 `ambient_hero_8s`）。
- [WHOOP](https://www.whoop.com/) は 2〜3秒ごとにカットが変わる（速め）。文字は暗部に置く。
- 映像ヒーローでも、カットが変わる間に見出し・CTA の位置は動かさない（Parloa、Lightship、Huts、Wonderful、Maple）。
- 白文字は真っ白にしない例: Apple rgb(245,245,247)、[Mercury](https://mercury.com/) rgb(237,237,243)。暗い文字の Oura も暖色グレー rgb(74,71,65)。

### スクロール時の挙動
- **ピン留め＋スクラブ**: Mercury は 0〜100px 変化なし → 300px でカメラ前進 → 400px で文字が半透明 → 600px で文字が消える → 900px で PC 画面が視界を占める → 1300px で実際の UI につながる。約1300px 固定。
- **カードがせり上がって広がる**: [14islands](https://14islands.com/) は 200px でカードが上がり、400px で幅いっぱい。700〜1000px で中身が切り替わる。
- **全面→形が縮む**: [Genesys](https://www.genesys.com/)（楕円へ）、[Oscar](https://www.hioscar.com/)（角丸カードへ）、[UNION TEC](https://www.union-tec.jp/)（ロゴの窓が楕円へ）。
- **窓が開く**: [Lightship](https://www.lightshiprv.com/)（初回は四隅を欠いた多角形マスク→全面）、[Jesko Jets](https://jeskojets.com/)（窓枠がスクロールで拡大）。

### 数値の目安
| 項目 | 観察値 | 出典 |
|---|---|---|
| 文字・CTA の表示 | 0.5〜0.8秒で表示済み | Apple、WHOOP、Mercury |
| 映像の長さ | 約3秒×1回 ／ 8秒ループ ／ 2〜3秒でカット替え | Apple ／ パタゴニア ／ WHOOP |
| 映像パネルの左右余白 | 8px、24px、約28px、30px、54px→約30px | Lightship、Aevion、Lusion、Palantir、14islands |
| ヒーローの高さ | 594px、600px、765px（100vh にしない） | パタゴニア、[Maple](https://www.getmaple.ca/)、Rivian |
| スクロール固定の長さ | 約1300px | Mercury |
| タイプ表示 | 約40ms/字 | Palantir |
| 1行ずつのマスク出現（提案値） | translateY 100%→0、700ms、行ごとに120ms遅延、0.4秒開始 | motion-craft 担当の提案 |
| 現行の視差 | 0.1倍（実装済み） | TELEMO |

## 6. TELEMO ヒーロー改善案 トップ10

前提: 現行の映像ヒーロー（全面映像、左に実HTML、グレイン、露出のゆらぎ、視差0.1倍、画面外で停止、reduced-motion 対応）を活かす。数値やロゴは、TELEMO の実績として確認できる事実だけを使う（現時点の実績値は未確認）。

### 案1 映像に「AI通話ログ」のガラスカードを重ねる（Parloa 型）
- 一言: 「人が働く映像」と「AIが働いている証拠」を1画面に同居させる。
- レイアウト: 見出し・CTA は左下に固定。右下に顧客／AIの吹き出し2〜3個と「アポ獲得・通話◯秒」のピル。吹き出しは数秒おきに1つずつ増える。
```
+--------------------------------------------------+
| LOGO                         nav     [資料請求]   |
|                                                  |
|            (働く人の映像)                         |
|                              +-----------------+ |
| 見出し（明朝）                | 顧客: ...        | |
| リード                        | AI  : ...        | |
| [主CTA] [副CTA]               | (v) アポ獲得 ◯秒  | |
+--------------------------------------------------+
```
- 根拠: [Parloa](https://www.parloa.com/)（右下に通話チャット＋「Resolved • 46 sec」、f0→f2 で会話が進む）、[Dialpad](https://www.dialpad.com/)（写真カードに AI 通話要約）、[REKKI](https://rekki.com/)（稼働ログのピルを階段状に積む）、[Aircall](https://aircall.io/)（"CALL COMPLETED BY AI"）。
- 変更点: 映像の上に HTML のカード部品を追加。登場アニメーション（reduced-motion では最初から全表示）。
- 工数: M（静的に置くだけなら S）
- リスク: 吹き出しが顔や見出しに重ならないよう、Gemini 生成時に右下を空けた構図を指定する。backdrop-filter を映像の上で使うと重い可能性（未検証）。SP では省略か下へ移す（Parloa も SP では非表示、[Genesys](https://www.genesys.com/) は SP で H1 と衝突）。

### 案2 ティールの下側スクリム＋実績・ロゴ帯（Clarion 型）
- 一言: 黒ではなくブランド色で下だけ落とし、文字と信頼要素の台にする。
- レイアウト: 顔の位置より下に、透明→#007d8c のグラデ。下端はほぼ単色にして導入ロゴのマーキー（または実績3項目）を載せる。見出しは左寄せのままでよい。
- 根拠: [Clarion](https://www.clarionhealth.com/)（電話を受ける人の写真、y≈450 から下だけ濃いティール、下端にロゴのマーキー）、[Parloa](https://www.parloa.com/)（下側を黒に落とすスクリム）、[Maple](https://www.getmaple.ca/)（映像の直下に実績ストリップ）、[MiiTel](https://miitel.com/)（月桂冠バッジ＋ロゴマーキー）。
- 変更点: 現行の文字下地（詳細は未確認）を下側グラデに置き換え。ロゴ帯または実績帯を追加。
- 工数: S
- リスク: ロゴ掲載の許諾が必要。ティールの不透明度が高いと映像が緑かぶりに見える。数値は確認できる事実のみ。

### 案3 余白付きの角丸パネルに映像を収める（Lightship・Aevion 型）
- 一言: 全面映像を「白地の中の窓」にして、白×ティールのページと地続きにする。
- レイアウト: 左右・下に 8〜24px の余白、角丸 12〜24px。初回表示でパネルがマスクで開く（任意）。
```
+--------------------------------------------------+
|  LOGO                        nav     [資料請求]   |
|  +--------------------------------------------+  |
|  |                                            |  |
|  |   見出し        (働く人の映像)              |  |
|  |   [主CTA][副CTA]                           |  |
|  +--------------------------------------------+  |
|          (白地: 次のセクションへ)                 |
+--------------------------------------------------+
```
- 根拠: [Lightship](https://www.lightshiprv.com/)（8px インセットの角丸フレーム、初回は多角形マスクから開く）、[Aevion](https://drone.riotters.com/)（左右24px のパネル、下端が白に溶ける）、[Palantir](https://www.palantir.com/)（左右30px）、[ベルシステム24](https://www.bell24.co.jp/)（角丸カード内で映像）。
- 変更点: 映像コンテナに余白・角丸・overflow:hidden を追加。視差0.1倍・一時停止はそのまま使える。
- 工数: S
- リスク: 映像の見える面積が少し減る。ヘッダーをパネルの外に出すか内に重ねるかの判断が要る（Lightship はパネル内に重ねている）。

### 案4 白ベール＋ハイキー映像（Career Kikkake 型）
- 一言: 暗くせず、左から白へ溶かして濃色の明朝を載せる。
- レイアウト: 左 40% ほどに白→透明の横グラデ。見出しは濃紺かティール。強調語の下に薄いミントのマーカー帯。被写体は右寄せ。
- 根拠: [Career Kikkake](https://agent.kikkake.cc/)（白×ティールのハイキー写真、左が白に溶ける、強調語にマーカー帯）、[らくしふ](https://rakushifu.jp/)（人物の縁を白にフェード）、[デジタルハリウッド 採用](https://www.dhw.co.jp/jobs/2024/)（文字側だけの方向性スクリム）。
- 変更点: 下地のグラデ色と文字色の反転。Gemini の指示に「明るい自然光・被写体は右・左は明るい壁」を加える。
- 工数: S（素材の作り直しを含めると M）
- リスク: 映像が暗いと白ベールが灰色に濁る。ドキュメンタリーの重さが軽く見える。グレインとの相性は未確認。案2とはどちらか一方を選ぶ。

### 案5 下端をティールの波形・斜めで切り、次のセクションへ地続きにする（VESSEL 型）
- 一言: ヒーローの終わりをブランドの形にする。
- レイアウト: 映像の下端 15〜25% を #007d8c の波形（または斜め）で覆う。CTA か実績をそこに置き、次セクションの背景も同色にする。
- 根拠: [VESSEL](https://vessel-for.jp/)（写真の下端をティールの波形で切り、次セクションも同色）、[Indeed 特設](https://jp.indeed.com/cm/iimirai)（写真の色がそのまま本文背景へ）、[越前信用金庫 採用](https://www.shinkin.co.jp/echishin/recruit/)（同じ背景色が下まで続く）、[ベルシステム24](https://www.bell24.co.jp/)（斜めの1色の帯）。
- 変更点: SVG かclip-path の下端シェイプを追加。次セクションの背景色を調整。
- 工数: S〜M
- リスク: 波形はやや装飾的。直線の斜めの方が B2B らしい可能性（未検証）。

### 案6 文字を先に、見出しは1行ずつ（時系列の整理）
- 一言: 映像の読み込みを待たせず、0.5秒以内に読める状態にする。
- レイアウト: 変更なし。表示の順番だけを決める。見出し（1行ずつマスクで出現）→リード→CTA。映像は 0.5〜1.0秒でフェードイン。
- 根拠: [Apple MacBook Pro](https://www.apple.com/jp/macbook-pro/)（0.5秒で文字表示済み、映像は後から）、[Oura](https://ouraring.com/)（写真が先、文字は遅れてフェード）、[Garden Eight](https://garden-eight.com/)（1行ずつ下から）、[Palantir](https://www.palantir.com/)（約40ms/字）。
- 変更点: CSS アニメーションの追加のみ。reduced-motion では即表示（実装済みの仕組みに合わせる）。
- 工数: S
- リスク: 演出過多になりやすい。明朝の1字ずつ表示は読みにくい。リードの「文字起こし風」は通話の比喩になるが、好みが分かれる。

### 案7 スクロールで全面映像→角丸カードへ縮む（Genesys・Oscar 型）
- 一言: スクロールの最初の動きで「次の情報」に自然につなぐ。
- レイアウト: スクロール 0〜400px ほどで映像が縮み、角丸カードになる。周囲に次セクションの見出しが現れる。
- 根拠: [Genesys](https://www.genesys.com/)（写真が楕円に縮む）、[Oscar](https://www.hioscar.com/)（角丸カードに縮み、別写真が扇状に覗く）、[14islands](https://14islands.com/)（カードがせり上がって広がる）。
- 変更点: 視差0.1倍の代わりに（または加えて）、スクロール連動の scale と border-radius。sticky コンテナが要る。
- 工数: M
- リスク: スクロールを奪う感覚。低スペック端末での負荷（未検証）。reduced-motion では無効化。

### 案8 現場→画面へカメラが寄り、実際の管理画面につながる（Mercury 型）
- 一言: 映像の中のモニタが、そのまま TELEMO の画面になる。
- レイアウト: 全景→オペレーターのモニタへ寄るワンカット映像をスクロールでスクラブ。300〜600px で文字が消え、約1300px で次セクションの実HTMLの画面へ。
- 根拠: [Mercury](https://mercury.com/)（約1300px 固定、最後に実際の UI へ）、[Aevion](https://drone.riotters.com/)（被写体のピン留め、単語ごとに色が付く）。
- 変更点: 映像の作り直し（スクラブ用の書き出し）。ピン留めとスクラブの実装。現行の視差0.1倍とは別方式。
- 工数: L
- リスク: 制作が重い。スクラブ用の動画は全フレームをキーフレームにする必要（一般的な注意。今回は未検証）。SP は別素材。

### 案9 副CTA を「AIの声を聞く／電話で試す」にする（IVRy・Clarion 型）
- 一言: AI電話そのものを、ヒーローで体験させる。
- レイアウト: 主CTA（資料請求・デモ予約）はそのまま。副CTA をマイクアイコン付きの輪郭ボタンにし、デモ音声の再生か、デモ電話番号/QR のカードを開く。
- 根拠: [IVRy](https://ivry.jp/)（電話番号/QR で「電話して試す」）、[Clarion](https://www.clarionhealth.com/)（マイク付き「Try it out」）、[Giga](https://giga.ai/)（ヒーロー内の TALK ボタン）、[Anam](https://anam.ai/)（人物カードに「Talk with Mia」）。
- 変更点: 副CTA の文言・アイコンと、音声プレーヤーまたは番号カードの追加。
- 工数: M（デモ音声・番号の用意を含む）
- リスク: デモ音声やデモ番号が用意できるかは未確認。音声の自動再生はしない。

### 案10 SP は縦の別映像＋写真と文字の上下分離＋固定CTA＋一時停止ボタン
- 一言: 16:9 の切り抜きで顔や余白を失わない。
- レイアウト: 上に縦長映像（顔が上部）、下は白かティールの面に見出し・CTA。下端に固定 CTA バー。映像の右下に 44px 程度の一時停止ボタン。
- 根拠: [WHOOP](https://www.whoop.com/)（SP は 9:16 の別映像＋一時停止ボタン）、[Parloa](https://www.parloa.com/)（SP は映像を上部 390×557 に収め、下に単色面）、[Apple MacBook Pro](https://www.apple.com/jp/macbook-pro/)（SP 用の縦素材）、[SmartHR](https://smarthr.jp/)（SP の固定 CTA バー）。
- 変更点: SP 用の映像ソースの出し分け、レイアウトの縦積み、停止ボタンの追加。既存の「画面外で停止」と併用できる。
- 工数: M
- リスク: 素材が2本になる。固定バーと Cookie バナー・チャットの重なり（REKKI の SP で CTA に Cookie バナーが被っていた）。

### 推奨トップ3とその理由
現行の映像ヒーローを活かし、効果と工数のバランスで選んだ。3つは同時に組み合わせられる。

1. **案1 AI通話ログのガラスカード（M）**
   - 理由: 国内同業にほぼ無く、差別化の効果が最も大きい。「人の映像」に「AIが何をしたか」を足せる。最も近い先行例が音声AIの Parloa。
2. **案2 ティールの下側スクリム＋実績・ロゴ帯（S）**
   - 理由: 工数が小さい。映像の明暗に左右されにくく、ブランド色で文字の台と信頼要素を同時に作れる。電話を受ける人＋ティールという、最も近い先行例が Clarion。
3. **案3 余白付きの角丸パネル（S）**
   - 理由: CSS 中心で済む。全面映像の迫力を残したまま、白×ティールのフラットなページとの継ぎ目を消せる。視差・一時停止など既存実装をそのまま使える。

組み合わせた姿:
```
+--------------------------------------------------+
|  LOGO                        nav     [資料請求]   |
|  +--------------------------------------------+  |
|  |                (働く人の映像)               |  |
|  |                              [顧客: ...]    |  |
|  | 見出し（明朝）                [AI  : ...]    |  |
|  | [主CTA] [副CTA]              [(v) アポ獲得] |  |
|  |~~~~~~~~~ ティールの下側グラデ ~~~~~~~~~~~~~|  |
|  | 導入ロゴ / 実績 3項目                      |  |
|  +--------------------------------------------+  |
+--------------------------------------------------+
```
- 次点: 案6（文字を先に。S）は、どの案とも併用でき、手間が小さい。

## 7. スマホでの扱い

ノートの mobile 欄から見えた定石:

- **写真と文字の上下分離（縦積み）が最も多い**（mobile 欄に縦積み・1カラム・上下分離の記述がある例が約30件。キーワード一致の目安）: 上に映像・写真、下に見出しと CTA。[Parloa](https://www.parloa.com/)（映像を上部 390×557、下は単色面）、[SmartHR](https://smarthr.jp/)、[LayerX](https://layerx.co.jp/)、[ダイキン](https://www.daikin.co.jp/)。[Reevo](https://reevo.ai/) は見出し→映像カード→リード→CTA。
- **縦の別素材**: [Apple MacBook Pro](https://www.apple.com/jp/macbook-pro/)（585×800）、[WHOOP](https://www.whoop.com/)（9:16）、[Rivian](https://rivian.com/)（390×760）、[Mercury](https://mercury.com/)（390×844）。[Maple](https://www.getmaple.ca/) や [Huts](https://huts.com/) は SP で別カット・別アングルが映る。
- **16:9 の切り抜き**: [パタゴニア](https://www.patagonia.jp/)（390×375）、[Palantir](https://www.palantir.com/)（350×197）。顔や余白が切れやすい。
- **中央揃えへの組み替え**: PC の左下／右下の分割を中央に寄せる（[Wonderful](https://www.wonderful.ai/)）。顔のクローズアップ＋下1/3に見出し（[Oscar](https://www.hioscar.com/)、[Clarion](https://www.clarionhealth.com/)）。CTA は全幅で縦積み（Clarion、Reevo）。
- **固定 CTA**: 下端固定バー（SmartHR）、2分割の固定 pill（[ビジネスラップ](https://bizrap.jp/)、[自由が丘クリニック 採用](https://jcdc.co.jp/recruit/01/)）。
- **一時停止ボタン**: WHOOP は SP の右下に常設。[ギフティグループ](https://giftee-group.com/) も停止ボタンあり。
- **重ねた UI の扱い**: 省略（Parloa はチャット UI を出さない）、縮退（[Institute of Health](https://www.instituteofhealth.com/) は統計パネルを1段に）、縮小して残す（[REKKI](https://rekki.com/)）。[Genesys](https://www.genesys.com/) は SP でオーバーレイが H1 に衝突しており反面教師。
- **インセット枠**: [Lightship](https://www.lightshiprv.com/) は SP で余白16px の縦長角丸フレーム。Aevion は約8px。
- **構成の回転**: [Indeed 特設](https://jp.indeed.com/cm/iimirai) は PC の左右配置を SP で上下に回す。
- **静止画化**: SP だけ静止画に切り替えた例は、今回のノートでは確認できなかった。reduced-motion 時に最終フレームの静止画にする案は motion-craft 担当の提案。
- **注意**: Cookie バナーやチャットウィジェットが SP の CTA に被る例が複数あった（REKKI など）。

TELEMO への当てはめ:
- Gemini で縦 9:16 版を別に生成する。顔は上部、下側に机や床など文字を置ける余白を入れる構図を指定する。
- SP は「映像（上）→見出し→CTA」の縦積み。案1のカードは SP では省略するか、映像の下に1枚だけ置く。
- 一時停止ボタン（44px 程度）を常設し、既存の「画面外で停止」「reduced-motion」と併用する。

## 付録 A. score 4 以上のサイト一覧

全88件はビューア（http://localhost:8000/output/hero-research/ ）で絞り込み・比較できる。一言は `sites.json` の why_good の冒頭。担当: jp=jp-galleries、ind=industry-direct、mot=motion-craft、glb=global-galleries。

対象 58 件（score 5: 20 件、score 4: 38 件）。

| 名前 | URL | hero_type | score | 一言 | 担当 |
|---|---|---|---:|---|---|
| Clarion | https://www.clarionhealth.com/ | full-bleed-photo | 5 | 顔と受話器という『電話に出る人』を隠さず、文字を顔の下に逃がして下側だけを濃色で落とすため、表情の見えと白文字の可読性が… | glb |
| Hakuhodo DY ONE Recruit Site | https://recruit.hakuhodody-one.co.jp/ | collage-grid | 5 | 同一背景・同一ライティングの人物写真を群像として並べ、手書き風コピーと縦書き職種ラベルで1人ずつ語らせている | glb |
| Lightship | https://www.lightshiprv.com/ | full-bleed-video | 5 | 額縁付きの全面動画＋マスクが開く入場演出で『特別な体験』を作り、見出しを被写体の左右に振り分けて主役を隠さない | glb |
| Oscar | https://www.hioscar.com/ | full-bleed-photo | 5 | 感情の出る集合写真を全面に敷き、巨大なセリフ見出しで一言を言い切る | glb |
| Parloa | https://www.parloa.com/ | full-bleed-video | 5 | 『人が会話している瞬間』の動画を全面に置きながら、製品の通話ログ（吹き出し）を重ねて写真と製品UIを一画面で結び付けてい… | glb |
| Genesys | https://www.genesys.com/ | full-bleed-photo | 5 | 逆光の街頭写真＋暗いスクリムで『顧客の日常』と製品メッセージをつなぎ、CTAと受賞バッジまで1画面で完結 | ind |
| LayerX | https://layerx.co.jp/ | split-text-image | 5 | 人の写真を会社のロゴ形状でマスクし、半透明図形を重ねて『写真＝ブランド』にしている点が秀逸 | ind |
| SmartHR | https://smarthr.jp/ | split-text-image | 5 | ブランドのティール(TELEMOと同系)＋表情豊かな人物＋極太見出しで『親しみ×実績』を即伝達 | ind |
| ベルシステム24 | https://www.bell24.co.jp/ | framed-image-card | 5 | コールセンター企業なのに『現場の作業』ではなく『挑戦する人』の物語を、切り抜きモノクロ人物＋1色の幾何学というアートディ… | ind |
| Career Kikkake（キャリア支援） | https://agent.kikkake.cc/ | full-bleed-photo | 5 | TELEMOと同じ『白×ティール』の配色で、ハイキーな人物写真を白いベールで文字側にフェードさせている | jp |
| DMJ（デジタルマーケティングジャパン）採用サイト | https://dmj-japan.co.jp/recruit/ | full-bleed-photo | 5 | 複数の社員の笑顔を『縦のカラム』で等間隔に並べ、見出しを顔の下に重ねるので、人の表情と大きなコピーが両立する | jp |
| UNION TEC（ユニオンテック） | https://www.union-tec.jp/ | other | 5 | 『ロゴ文字の中の1文字を写真の窓にする』ことで、ブランド名と実写を1つの構図に統合し、ローダー→窓→スクロールで窓が変形… | jp |
| VESSEL（ヴェゼル株式会社） | https://vessel-for.jp/ | full-bleed-photo | 5 | ヒーロー最下部の波形のティール面が、そのまま次セクションの背景色になり、写真から本文へ『色で』繋がる | jp |
| Wantedly コーポレートサイト | https://wantedlyinc.com/ | full-bleed-photo | 5 | 『働く人2人が話している』写真を、角丸カードの全面＋人物に重なる大きな白見出しで見せる | jp |
| ウェアラ（ユニフォームレンタル）手取りLP | https://www.weara.co.jp/tedori/ | full-bleed-photo | 5 | 現場の人の写真を大きく使いながら、文字は『帯』で貼るのでスクリムなしでも読める | jp |
| ギフティグループ コーポレートサイト | https://giftee-group.com/ | typographic-with-small-image | 5 | 写真を大きく見せず、白地の中で人の写真を『小さく・ゆっくり漂わせる』ことで、コピーを主役にしたまま人の気配を出している | jp |
| クレア・ライフ・パートナーズ 採用サイト | https://crea-lp.com/recruit/ | collage-grid | 5 | ブランド色1色（黄）で写真をデュオトーン化し、写真バーと無地バーを混ぜて『棒グラフ＝成長』という意味を付けている | jp |
| 自由が丘クリニック ドクターズコスメティクス 採用（ルート営業） | https://jcdc.co.jp/recruit/01/ | framed-image-card | 5 | ティール系・営業職の募集という点でTELEMOの文脈に近い | jp |
| Aevion（Riotters Tech Demo） | https://drone.riotters.com/ | 3d-canvas | 5 | 白地・淡色・細線だけで組み、動くのは被写体だけ | mot |
| Mercury | https://mercury.com/ | full-bleed-video | 5 | 『現実の風景→自社プロダクトの画面』へカメラが寄るだけの1カットで、B2Bの抽象的な価値を具体的なUIへ自然に受け渡して… | mot |
| Anam | https://anam.ai/ | slider-carousel | 4 | 『人が話しかけてくる』体験をカードUIにして、ヒーロー内に『Talk with ◯◯』という通話ボタンまで置いている | glb |
| Giga | https://giga.ai/ | device-mockup | 4 | ヒーローそのものが製品体験（TALKボタンで声を試す）になっており、音声AIの価値を最初の画面で体験させる | glb |
| Huts | https://huts.com/ | full-bleed-video | 4 | 全面動画の上に『中央揃えのセリフ見出し＋手描きアンダーライン＋1個のCTA』を置くシンプルな型で、暗いオーバーレイと文字… | glb |
| Institute of Health (IOH) | https://www.instituteofhealth.com/ | full-bleed-video | 4 | 暗幕で揃えた複数シーンの映像で『現場と専門性』を見せつつ、実績をカウントアップするHUD風パネルで信頼を数字で補強してい… | glb |
| Jesko Jets | https://jeskojets.com/ | framed-image-card | 4 | 窓というのぞき穴が、スクロールで全面写真へ広がることで『見る→入り込む』の没入を作る | glb |
| Maple | https://www.getmaple.ca/ | full-bleed-video | 4 | 感情の高い『人々の群像』動画に、極太の短いコピーと単一CTAだけを重ね、直下の実績ストリップで信頼を補強する | glb |
| Overpass | https://www.overpass.com/ | split-text-image | 4 | 『電話をしながら笑う営業人材』の写真に、プロフィールチップを被せることで“人を選んで雇う”というサービス内容を一目で伝え… | glb |
| REKKI | https://rekki.com/ | full-bleed-photo | 4 | 『AIが何をしたか』を件数付きのログのピルとして見出しの手前に積み、製品の仕事ぶりを写真の上で先に見せている | glb |
| Reevo | https://reevo.ai/ | framed-image-card | 4 | 巨大な見出しで主張しつつ、人が働く動画を枠付きカードで文字と分離して置くので可読性が崩れない | glb |
| Revolut | https://www.revolut.com/ | full-bleed-photo | 4 | 人物ポートレートに“スマホ形の枠と残高UI”を重ねて、人の写真と製品を一体の画として見せる | glb |
| Tilton | https://www.tiltongroup.com/en/ | framed-image-card | 4 | 見出しの位置を固定したまま背景だけが『人の手の写真→製品』へ入れ替わるので、文字を主役にしたまま現場から製品への流れを見… | glb |
| Town | https://www.town.com/ | typographic-with-small-image | 4 | 写真を“見出しの一部”として語間に埋め込み、人とAI（マスコット）の協働を絵面で説明している | glb |
| Unify | https://www.unifygtm.com/ | framed-image-card | 4 | 見出しを画像に重ねずクリーム地に1行で置き、その下の大きな写真に『製品の入口（プロンプト欄）』を重ねている | glb |
| Wonderful | https://www.wonderful.ai/ | full-bleed-video | 4 | 見出しを左下、補足とCTAを右下に分けて映像の中央を空けるので被写体を邪魔せず、映像がカット替わりしても文字位置は固定さ… | glb |
| Y Combinator | https://www.ycombinator.com/ | typographic-with-small-image | 4 | 第一画面を言葉だけで言い切り、直後のスクロールで『過去と現在の人物写真ペア』を見せるので、写真が見出しの主張の証拠として… | glb |
| Dialpad（日本語サイト） | https://www.dialpad.com/ | framed-image-card | 4 | 中央見出し＋大きな写真カードという落ち着いた構成で、『通話の手元写真』に『AIが作った要約UI』を重ねて通話→要約→CR… | ind |
| RingCentral | https://www.ringcentral.com/ | framed-image-card | 4 | ヒーロー全体を1つの角丸カードにまとめ、ガラスの二重フチ＋暖色グラデで製品動画を宝物のように見せている | ind |
| アイブリー（IVRy） | https://ivry.jp/ | device-mockup | 4 | 『実際に電話をかけて試せる』電話番号＋QRをヒーロー直下に置き、AI電話という商材の体験をそのままCTAにしている | ind |
| パナソニック ホールディングス | https://holdings.panasonic/jp/ | collage-grid | 4 | 異なる業界の映像をタイル化して事業の幅(インフラ/航空/物流/小売)を一瞬で示し、青の統一グレーディングで一体感を保つ | ind |
| リクルート | https://www.recruit.co.jp/ | full-bleed-photo | 4 | 人を直接写さず、環境(街・オフィス)とブランドの弧で『出会い』を語り、半透明の白い箱で可読性を担保する上品な設計 | ind |
| Benesse DIGITAL TRANSFORMATION『INNOVATION CATALYST』 | https://www.benesse.co.jp/digital/ | framed-image-card | 4 | 写真フレームを『はみ出す大見出し』で破り、白帯ブロックで可読性を確保 | jp |
| Indeed CM特設『いい未来は探せる』 | https://jp.indeed.com/cm/iimirai | full-bleed-photo | 4 | 顔を大きくクロップして感情を作りつつ、中央の空きにUIを置いて『写真が UI の額縁』になっている | jp |
| JR西日本電気システム 採用サイト | https://www.j-nesco.com/recruit/ | collage-grid | 4 | 六角形マスクを『会社のモチーフ』にして、写真・ボタン・装飾を同じ形で揃えている | jp |
| LANDIC 採用サイト | https://www.landic.com/recruit/ | framed-image-card | 4 | 写真に文字を重ねず、見出しは写真の外（上）に置くので、写真の質感を壊さない | jp |
| SmartHR 採用サイト | https://recruit.smarthr.co.jp/ | other | 4 | 写真がなくても、ラベル帯・直角のCTA・ディザのグラデで強い視覚言語を作っている | jp |
| Somali（ソマリ）ハイクラス転職 LP | https://somali.co.jp/lp01/ | other | 4 | 写真を矩形で置かず『余白の形』を作る素材として使い、中央の見出しを主役にしている | jp |
| TVer 採用サイト | https://recruit.tver.co.jp/ | collage-grid | 4 | 巨大な文字と手書きの1語でブランドの声を作り、その直下から『人の写真』が密に並ぶので、ファーストビューの1/3が人の顔に… | jp |
| bright avenue（ブライトアベニュー） | https://bright-avenue.jp/ | full-bleed-video | 4 | ローダーの小さな写真が全面映像に拡大し、スクロールで再び写真カードの群れに分解される、『写真が主役のトランジション』が一… | jp |
| unrep（アンレップ）WordPressテーマ | https://unrep.jp/ | other | 4 | 読み手の課題を『そのままの文』にしたチップを流し続け、黒い吹き出しで『解決できます』と答えるので、写真なしでも共感→解決… | jp |
| らくしふ by SmartHR | https://rakushifu.jp/ | split-text-image | 4 | 『誰が・何で楽になるか』を、笑顔の現場スタッフ＋画面モックの1枚で伝える | jp |
| デジタルハリウッド 採用情報 | https://www.dhw.co.jp/jobs/2024/ | full-bleed-photo | 4 | 文字の側（右）だけを暗く、人物の側（左）は明るいまま残す方向性スクリムで、顔を隠さずに見出しを読ませている | jp |
| 日本新薬 新卒採用サイト | https://www.nippon-shinyaku.co.jp/recruit/ | framed-image-card | 4 | 写真を角丸フレームに入れ、白いベールと縦書き明朝で『静かな重み』を作る | jp |
| 越前信用金庫 採用サイト | https://www.shinkin.co.jp/echishin/recruit/ | collage-grid | 4 | 人物を『切り抜きステッカー』にして背景色の上に並べることで、堅い業種でも親しみのあるコラージュになる | jp |
| 14islands | https://14islands.com/ | framed-image-card | 4 | 最初は文字だけで静かに見せ、スクロールした人にだけ映像カードが『育って』見える | mot |
| MacBook Pro - Apple（日本） | https://www.apple.com/jp/macbook-pro/ | full-bleed-video | 4 | 文字を最初から出し、映像は『暗→光』の短いワンショットで構図が決まったら止める | mot |
| Palantir（日本語トップ） | https://www.palantir.com/ | typographic-with-small-image | 4 | 映像を見出しの下に一段下げ、まず言葉を読ませる | mot |
| WHOOP | https://www.whoop.com/ | full-bleed-video | 4 | マクロ撮影の質感だけで『素材・精度』を語り、文字を暗部に置いて読みやすさを確保 | mot |
| パタゴニア | https://www.patagonia.jp/ | full-bleed-video | 4 | ヒーローを全画面にせず約2/3の高さに収め、8秒の自然光アンビエント映像と短い一言だけにしている | mot |
