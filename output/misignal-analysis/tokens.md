# マイシグナル (https://misignal.jp/) デザイントークン実測

本書は DESIGN.md 作成用の根拠データ。値はすべて実ブラウザ(Playwright / Chromium)の computed style と配信CSSからの実測。丸め・推定をした箇所は「推定」と明記した。生データは `tokens/*.json` を参照。

## 0. 計測条件と読み方

- 計測日 2026-10-05。対象: `/`(主)、`/products/scan`、`/faq`、`/article`、`/commitment`、`/contact`(フォームの見た目のみ・送信なし)。ページ遷移は 1.5 秒以上空け、robots.txt の Disallow パスには未アクセス。
- ビューポート: PC = 1440x900 DPR1、SP = 390x844 DPR2 isMobile + iPhone UA。最下部まで 300px 刻みでスクロールして遅延要素を表示後に計測。
- **重要(実測)**: トップ `/` は **ビューポート幅では PC⇄SP が切り替わらない**。幅 600px でも PC レイアウトのまま(横スクロール、実測 scrollWidth=1320px)。SP は iPhone UA でのみ別コンポーネント群(`Kv_*`, `Cta_*`, `AboutPart1_*` 等)として配信される。一方 `/products/scan` `/faq` `/article` は CSS @media で幅800pxでも崩れず追従する。
- 色の頻度: テキスト色=「要素数/文字数」、背景色=「要素数/面積」、その他=要素数。5ページ合算の PC 計測値(SP は `colors.json` の `measured.sp`)。アルファ付き色は `#RRGGBBAA(a=0.x)` 形式。
- 面積・色の集計は「可視(display≠none, visibility, opacity>0, 幅高さ≥1px)」の要素のみ。カルーセルの画面外スライドも含まれる場合がある。
- 本サイトの CSS は CSS Modules(クラス名 `Component_name__hash`)。以降のクラス名はハッシュ省略。

## 0.1 主要トークン早見(詳細は各章)

| 項目 | 値(実測) |
| --- | --- |
| 主色(ブランド青) | #1F7BB8(リンク・アクセント・副ボタン枠・情報バー背景)。見出し濃青 #004380、紺 #182963 / #0F1B43(ダーク面)、フッター #2B4A99 |
| テキスト | 本文 #646464(html)、濃 #4D4D4D、注釈 #838383、反転 #FFFFFF |
| 背景 | #FFFFFF 主、#F5F5F5(グレー帯)、#E9F6FF / #E1EBF2 / #EFF6FA / #DDEBF7(淡青)、#0F1B43(ダーク紺帯) |
| 主CTA | linear-gradient(135deg, #FF5C00, #FA8544)、hover (135deg, #E44912, #F56B1F)、白文字 16〜18px/600(scan 旧層は 20px/700)、radius 4px、高さ PC 52〜60 / SP 45〜56、影 0 2px 5px rgba(0,0,0,.2) |
| 副ボタン | 白地・1px #1F7BB8 枠・文字 #1F7BB8、radius 4px、高さ 54〜58、hover #0063AC |
| フォント | Noto Sans JP(本文・見出し、palt、ls .05em)/ Shippori Mincho B1(明朝見出し・数字)/ Inter(数字・英字)。Google Fonts |
| タイプスケール | PC: 10/12/14/16/18/20/22/24/28/32/36/44(+54/56)px。SP: 9〜10/12/14/16/18/20/22/24/32px。本文 16/28(1.75)、リード 18/31.5、H2 28/37.8(SP 22/29.7) |
| スペーシング | セクション縦 128px(SP 80px)、見出し→内容 64px(SP 48)、コンテナ 992px、SP ガター 16/24px、4/8px 系 + ds(2/4/8/12/16/24/32/48/128) |
| 角丸 | 4px(CTA/副/input)、6px(フッター系)、8px(カード)、12px(アイコンメニュー/フォーム枠)、999px・40〜50px(ピル)、50%(円)。画像は 0 |
| 影 | 0 2px 5px rgba(0,0,0,.2)(CTA)、0 4px 6px rgba(0,0,0,.07)(ヘッダー)、0 3px 6px rgba(0,0,0,.08)(カード) |
| ブレークポイント | max-width 768 / 1000 / 1099 / 1300(+ min 600/744)。トップは UA 切替(SP は iPhone UA) |
| モーション | hover .2s ease(color/opacity/filter brightness .85)、.3s ease(transform / scan ボタン all)、入場 .7s ease-out、主CTA hover は即時 |

## 1. 色

### 1.1 サイト基底(実測)

| 項目 | 値 |
| --- | --- |
| html / body color | #646464(`html{color:#646464}`) |
| body background-color | 透明(ページ地は各セクションの背景。主に #FFFFFF) |
| リンク色(--ds-color-text-link) | #1F7BB8 |
| 選択/フォーカス | 独自スタイルなし(input focus は Chromium 既定 outline: auto 1px rgb(0,95,204)。実測) |

### 1.2 CSS カスタムプロパティ(:root)全列挙

`/_next/static/css/a042fa0acc3b11c6.css` の `:root{}` に **--ds-* が 58 個**(下表)。ただし配信CSS内の `var(--ds-*)` 参照は合計約80箇所で、大半のスタイルは HEX 直書き(新規コンポーネント層のみがトークン参照)。Bootstrap 5 の `--bs-*`(btn/table/alert/modal/spinner/pagination 等)も同梱。

| カテゴリ | トークン | 値 |
| --- | --- | --- |
| color | `--ds-color-base-white` | `#fff` |
| color | `--ds-color-text-primary` | `#4d4d4d` |
| color | `--ds-color-text-input-value` | `#000` |
| color | `--ds-color-text-link` | `#1f7bb8` |
| color | `--ds-color-text-accent` | `#1f7bb8` |
| color | `--ds-color-text-emphasis` | `#f76363` |
| color | `--ds-color-text-mute` | `#838383` |
| color | `--ds-color-text-disable` | `#c1c1c1` |
| color | `--ds-color-text-on-dark-primary` | `#fff` |
| color | `--ds-color-border-default` | `#e0e0e0` |
| color | `--ds-color-border-active` | `#1f7ab8` |
| color | `--ds-color-surface-gray` | `#f5f5f5` |
| color | `--ds-color-surface-gray-strong` | `#efefef` |
| color | `--ds-color-surface-required` | `#fff7f7` |
| color | `--ds-color-surface-lightblue` | `#f5f9fc` |
| color | `--ds-color-action-cta` | `#fa8544` |
| color | `--ds-color-action-cta-gradient` | `linear-gradient(158.4deg,#ff5c00,#ff8947)` |
| color | `--ds-color-state-valid` | `#00a381` |
| color | `--ds-color-button-cta` | `linear-gradient(135deg,#ff5c00,#fa8544)` |
| color | `--ds-color-button-cta-hover` | `linear-gradient(135deg,#e44912,#f56b1f)` |
| color | `--ds-color-button-primary` | `linear-gradient(135deg,#1f7bb8,#4a93c4)` |
| color | `--ds-color-button-primary-hover` | `linear-gradient(135deg,#0063ac,#1f7bb8)` |
| color | `--ds-color-button-secondary-hover` | `#0063ac` |
| color | `--ds-color-button-disabled` | `#c1c1c1` |
| spacing | `--ds-spacing-2xs` | `2px` |
| spacing | `--ds-spacing-xs` | `4px` |
| spacing | `--ds-spacing-sm` | `8px` |
| spacing | `--ds-spacing-sm-md` | `12px` |
| spacing | `--ds-spacing-md` | `16px` |
| spacing | `--ds-spacing-lg` | `24px` |
| spacing | `--ds-spacing-xl` | `32px` |
| spacing | `--ds-spacing-2xl` | `48px` |
| spacing | `--ds-spacing-5xl` | `128px` |
| radius | `--ds-radius-xs` | `2px` |
| radius | `--ds-radius-sm` | `4px` |
| radius | `--ds-radius-lg` | `12px` |
| radius | `--ds-radius-full` | `999px` |
| family | `--ds-family-primary` | `Inter,Noto Sans JP,sans-serif` |
| family | `--ds-family-numeric` | `Inter,sans-serif` |
| size | `--ds-size-caption-md` | `12px` |
| size | `--ds-size-body-sm` | `14px` |
| size | `--ds-size-heading-3xs` | `14px` |
| size | `--ds-size-body-md` | `16px` |
| size | `--ds-size-body-lg` | `18px` |
| size | `--ds-size-heading-sm` | `22px` |
| size | `--ds-size-numeric-3xs` | `12px` |
| size | `--ds-size-numeric-sm` | `18px` |
| size | `--ds-size-numeric-lg` | `24px` |
| weight | `--ds-weight-regular` | `400` |
| weight | `--ds-weight-medium` | `500` |
| weight | `--ds-weight-semibold` | `600` |
| weight | `--ds-weight-bold` | `700` |
| lh | `--ds-lh-body` | `1.75` |
| lh | `--ds-lh-caption` | `1.5` |
| lh | `--ds-lh-heading` | `1.35` |
| lh | `--ds-lh-numeric` | `1` |
| ls | `--ds-ls-jp` | `0.05em` |
| ls | `--ds-ls-numeric` | `0` |

Figma 由来と思われる `var(--名前, フォールバックHEX)` 形式(定義は配信CSSに無く、フォールバック値が使われる)の頻出:

| 変数(フォールバック) | 件数 |
| --- | --- |
| `--text-646464, #646464` | 27 |
| `--gray-gray-100, #646464` | 19 |
| `--red-red-100-f-76363, #f76363` | 17 |
| `--blue-blue-1001-f-7-bb-8, #1f7bb8` | 15 |
| `--blue-blue-5, #eef3f6` | 9 |
| `--lightblue-lightblue-100569-dd-6, #569dd6` | 9 |
| `--maintenance-banner-height, 0px` | 8 |
| `--lightblue-lightblue-10, #eef5fb` | 8 |
| `--line-e-0-e-2-e-3, #e0e2e3` | 7 |
| `--lightblue-lightblue-100, #3f85c9` | 5 |
| `--blue-blue-20, #cde0ec` | 4 |
| `--white, #fff` | 4 |
| `--lightblue-lightblue-80, #78b1de` | 4 |
| `--bg-gray-f-5-f-5-f-5, #f5f5f5` | 3 |
| `--gray-gray-60, #a2a2a2` | 3 |
| `--scroll-duration, 40s` | 2 |
| `--header-height, 68px` | 2 |
| `--gray-white, #fff` | 2 |
| `--gray-gray80, #838383` | 2 |
| `--gray-gray-10, #efefef` | 2 |
| `--back-ground-gray-60-a-2-a-2-a-2, #a2a2a2` | 2 |
| `--green-green-00-a-381, #00a381` | 2 |

### 1.3 役割別カラートークン(実測 HEX と頻度)

**テキスト色**

| 役割 | HEX | 頻度(PC 5ページ) | 備考 |
| --- | --- | --- | --- |
| 本文(グローバル) | #646464 | 214要素/5632字 | html color(継承)。ヘッダー・2nd nav 含む全ページの既定本文色 |
| 本文(濃) | #4D4D4D | 72要素/2496字 | --ds-color-text-primary。カード本文・FAQ回答・ニュース題・コラム題 |
| 注釈・ミュート・タグ | #838383 | 14要素/376字 | --ds-color-text-mute。※注記、#タグ、Promise_note |
| セクション見出し(濃青) | #004380 | 69要素/1018字 | h2/h3。scan ページでは #004381(#004380 と1差の別値) |
| 見出し(ダーク紺) | #182963 | 8要素/82字 | Promise_title、60秒CMボタン文字 |
| 見出し(中紺) | #213882 / #2A4EA3 | 1要素/12字 / 1要素/9字 | Media_title / About_Intro_headingText |
| リンク・アクセント | #1F7BB8 | 141要素/983字 | --ds-color-text-link / -accent。ヘッダー、FAQ Q、副ボタン文字 |
| リンク hover | #0063AC | (hover 時のみ) | --ds-color-button-secondary-hover |
| 反転(ダーク面上) | #FFFFFF | 346要素/6564字 | --ds-color-text-on-dark-primary |
| 反転(薄) | rgba(255,255,255,.6) | 5要素/180字 | フッター著作権 |
| 反転(注記) | #E0E0E0 | 3要素/336字 | PurchaseCta_scanNote |
| KW淡色文字 | #A1AFDE | 2要素/65字 | 「ふたりの自分」篇 の見出し/説明(濃紺面上) |
| 症例アクセント(金茶) | #897645 | 20要素/182字 | EarlyDetectionCases。scan 数値は #BAA85B |
| キャンペーン橙 | #FF5C00 | 2要素/54字 | ScanCtaCompact_campaignText |
| LINE 緑 | #20B646 | 8要素/97字 | LINE 導線の文字 |
| FAQ カテゴリ見出し | #262626 | 18要素/108字 | /faq のみ |
| フッター淡色 | #EDF9F6 / #9AC4E6 | 10要素/80字 / 5要素/60字 | 列見出し / 電話番号 |
| 価格(赤系・濃紺面) | #F88282 | 6要素/21字 | DiscountPriceDisplay。--ds-color-text-emphasis は #F76363(ds定義のみ) |
| placeholder(実測) | #B8B8B8 | (::placeholder) | /contact input |

**背景色**

| 役割 | HEX | 頻度(PC) | 備考 |
| --- | --- | --- | --- |
| 白(ページ地/カード/ヘッダー/FAQ item) | #FFFFFF | 133要素/4973万px² | --ds-color-base-white |
| セクション地(グレー) | #F5F5F5 | 13要素/944万px² | FAQ/News/Column/Media card/2nd nav。--ds-color-surface-gray |
| セクション地(淡青 A) | #E9F6FF | 2要素/724万px² | About(+背景写真に rgba(233,246,255,.5) 膜)、ScanCtaCompact_band |
| セクション地(淡青 B) | #E1EBF2 | 12要素/135万px² | Doctors、ヘッダー上段青タブ |
| 面(scan/faq) | #EFF6FA | 6要素/698万px² | /faq・/products/scan のページ地 |
| カード面(淡青 C) | #DDEBF7 | 1要素/43万px² | ScanCtaCompact_card |
| ダーク紺(主) | #0F1B43 | 4要素/585万px² | Achievements、PurchaseCta。SP の Achievements は #0C2050 |
| フッター | #2B4A99 | 20要素/691万px² | footer_body。--ds 未定義 |
| フッター CTA 帯 | #3B5DB3 | 5要素/239万px² | ProductPageFooterV2_ctaSection |
| フッターボタン | #4469C6 | 15要素/14万px² | medicalText(塗り)。outlined は #2B4A99 + 白枠 |
| 情報バー・青面 | #1F7BB8 | 9要素/29万px² | HeaderInformationBar、Splide active dot(scan)、article 青ボタン |
| LINE ボタン | #20B646 | 5要素/11万px² |  |
| 背景半透明白 | #FFFFFFB3 / #FFFFFF99 / #FFFFFFF2 | 1要素/168万px² / 1要素/123万px² | About_Evidence_root(.7)、TenCancers(.6)、症例カード(.95) |
| 区切り/ドット | #E0E0E0 | 10要素/29万px² | スライダーdot非active、写真フレーム、縦区切り |
| プレースホルダ灰 | #D9D9D9 | 2要素/63万px² | 画像読込前フレーム |

**ボーダー色 / 影色**

| 役割 | HEX | 頻度(PC) | 備考 |
| --- | --- | --- | --- |
| 主枠(青) | #1F7BB8 | 63要素 | 副ボタン、チップ、ヘッダーアイコンメニュー |
| ダーク面アウトライン | #FFFFFF | 52要素 | 特設サイトボタン、フッターボタン/カード |
| ヘッダー白タブ枠 | #4694C9 | 15要素 | border-right/bottom/left 1px |
| ヘアライン | #E0E0E0 | 15要素 | News行/コラムカード。--ds-color-border-default |
| フォーム/区切り | #E0E2E3 | 7要素 | input 枠、フッター下線、breadcrumb |
| その他 | #B8B8B8 / #004380 / #06C755 / #569DD6 / #20B646 / #FF5C00 | 各1〜6要素 | 価格ヘッダー下線 / Flow円 / LINEバナー / Button_secondary / LINE下線 / キャンペーン下線 |
| アクティブ枠(ds) | #1F7AB8 | (ds定義) | --ds-color-border-active(#1F7BB8 と1差) |
| 影: 黒 alpha | rgba(0,0,0,.07 / .08 / .1 / .2 / .25) | 30要素 他 | 詳細は 4.3 |

### 1.4 グラデーション(実測)

| 用途 | CSS(computed を HEX 化) |
| --- | --- |
| 主CTA(ds) | `linear-gradient(135deg, #FF5C00, #FA8544)` / hover `linear-gradient(135deg, #E44912, #F56B1F)` |
| 主CTA(scan Button_cv) | `linear-gradient(94deg, #FF5C00 28.3%, #FF8947 71.7%)` / hover `linear-gradient(94deg, #E44912 28.3%, #F56B1F 71.7%)` |
| 青ボタン(ds) | `linear-gradient(135deg, #1F7BB8, #4A93C4)` / hover `linear-gradient(135deg, #0063AC, #1F7BB8)`(--ds-color-button-primary 系) |
| FAQ 検索ボタン | `linear-gradient(101.58deg, #1F7BB8 12.75%, #4C95C6 87.25%)` |
| KW セクション | `linear-gradient(#182963, #0F1B43)` |
| 価格パネル | `linear-gradient(#213882, #182963)` |
| Benefits セクション | `linear-gradient(#FFFFFF, #EEF3F6)` |
| Promise セクション | `linear-gradient(135deg, #CDE0EC, #DDE2F0)`(+カード `linear-gradient(#FFFFFFE6, #E1EBF2E6)`) |
| Flow セクション | `linear-gradient(135deg, #F5F5F5, #E0E0E0)` |
| Stores カード本文 | `linear-gradient(90deg, #F0F1F8, #DDEBF7)` |
| 見出し下線(PC/SP) | `linear-gradient(90deg, rgba(0,41,128,0), #002980 50%, rgba(0,41,128,0))`(About_AfterSupport/Benefits)、`#004380` 版(Doctors/Intro は #2A4EA3)。幅 280px(SP 200px)x 1px |
| 統計数値文字 | `linear-gradient(#2D7BC4, #112C4D)`(Benefits_statValue*) |
| スライダー active dot | `linear-gradient(#69C0F8, #7693E9)` |
| 下線ハイライト | `linear-gradient(135deg, #CDE0EC, #DDE2F0)`(About_TenCancers_underline) |
| PurchaseCta 背景フェード | `linear-gradient(rgba(15,27,67,0), #0F1B4380 25%, #0F1B43 70%)` |

### 1.5 コントラスト比(WCAG 2.x, 計算値)

| 前景 | 背景 | 比 | 判定 | 用途 |
| --- | --- | --- | --- | --- |
| `#646464` | `#FFFFFF` | 5.92 | AA | 本文標準(html color) × 白 |
| `#646464` | `#F5F5F5` | 5.43 | AA | 本文標準 × グレー面(FAQ/News/Column) |
| `#646464` | `#E9F6FF` | 5.38 | AA | 本文標準 × 淡青面 |
| `#4D4D4D` | `#FFFFFF` | 8.45 | AAA | 本文濃(--ds-color-text-primary) × 白 |
| `#4D4D4D` | `#E1EBF2` | 6.99 | AA | 本文濃 × Doctors面 |
| `#838383` | `#FFFFFF` | 3.79 | 大文字のみ AA | 注釈(--ds-color-text-mute) × 白 |
| `#838383` | `#F5F5F5` | 3.48 | 大文字のみ AA | 注釈 × グレー面 |
| `#838383` | `#E9F6FF` | 3.45 | 大文字のみ AA | 注釈 × 淡青面 |
| `#C1C1C1` | `#FFFFFF` | 1.80 | 不足 | 無効文字(--ds-color-text-disable) × 白 |
| `#B8B8B8` | `#FFFFFF` | 1.98 | 不足 | input placeholder × 白 |
| `#004380` | `#FFFFFF` | 9.93 | AAA | 見出し紺 × 白 |
| `#004380` | `#E9F6FF` | 9.03 | AAA | 見出し紺 × 淡青 |
| `#004380` | `#E1EBF2` | 8.21 | AAA | 見出し紺 × Doctors面 |
| `#004380` | `#DDEBF7` | 8.18 | AAA | 見出し紺 × ScanCtaカード |
| `#182963` | `#FFFFFF` | 13.67 | AAA | ダーク紺文字 × 白(Promise) |
| `#1F7BB8` | `#FFFFFF` | 4.58 | AA | リンク/アクセント青 × 白 |
| `#1F7BB8` | `#F5F5F5` | 4.20 | 大文字のみ AA | アクセント青 × グレー面 |
| `#1F7BB8` | `#E1EBF2` | 3.79 | 大文字のみ AA | アクセント青 × E1EBF2(ヘッダータブ) |
| `#0063AC` | `#FFFFFF` | 6.21 | AA | hover青 × 白 |
| `#FFFFFF` | `#1F7BB8` | 4.58 | AA | 白 × 情報バー/青ボタン |
| `#FFFFFF` | `#FF5C00` | 3.10 | 大文字のみ AA | 白 × CTA開始色 |
| `#FFFFFF` | `#FA8544` | 2.47 | 不足 | 白 × CTA終了色(--ds-color-action-cta) |
| `#FFFFFF` | `#FF8947` | 2.35 | 不足 | 白 × CTA(scan/FAQ検索 90°系)終了色 |
| `#FFFFFF` | `#E44912` | 3.99 | 大文字のみ AA | 白 × CTA hover開始色 |
| `#FFFFFF` | `#F56B1F` | 3.00 | 大文字のみ AA | 白 × CTA hover終了色 |
| `#FF5C00` | `#FFFFFF` | 3.10 | 大文字のみ AA | キャンペーン橙文字 × 白 |
| `#FF5C00` | `#DDEBF7` | 2.55 | 不足 | キャンペーン橙文字 × ScanCtaカード |
| `#FFFFFF` | `#0F1B43` | 16.69 | AAA | 白 × 最濃紺(Achievements/PurchaseCta) |
| `#A1AFDE` | `#182963` | 6.32 | AA | KW説明文(薄紺青) × 紺 |
| `#E0E0E0` | `#0F1B43` | 12.64 | AAA | 注記 × 最濃紺 |
| `#F88282` | `#213882` | 4.36 | 大文字のみ AA | 価格(赤系) × 価格パネル紺 |
| `#FFFFFF` | `#2B4A99` | 8.26 | AAA | 白 × フッター |
| `#FFFFFF` | `#3B5DB3` | 6.17 | AA | 白 × フッターCTA帯 |
| `#FFFFFF` | `#4469C6` | 5.14 | AA | 白 × フッターボタン(medicalText) |
| `#9AC4E6` | `#2B4A99` | 4.49 | 大文字のみ AA | フッター電話番号 × フッター |
| `#EDF9F6` | `#2B4A99` | 7.66 | AAA | フッター列見出し × フッター |
| `#FFFFFF` | `#20B646` | 2.68 | 不足 | 白 × LINEボタン |
| `#20B646` | `#FFFFFF` | 2.68 | 不足 | LINE緑文字 × 白 |
| `#897645` | `#FFFFFF` | 4.43 | 大文字のみ AA | 金茶(症例) × 白 |
| `#897645` | `#F5F5F5` | 4.06 | 大文字のみ AA | 金茶 × グレー |
| `#BAA85B` | `#0F1B43` | 7.03 | AAA | 金(scan数値) × 濃紺 |
| `#FFFFFF` | `#569DD6` | 2.92 | 不足 | 白 × 569DD6(SPメニューバッジ/Button_secondary) |
| `#569DD6` | `#FFFFFF` | 2.92 | 不足 | 569DD6文字 × 白(Button_secondary) |
| `#FFFFFF` | `#F25C72` | 3.21 | 大文字のみ AA | 白 × 必須バッジ |
| `#FFFFFF` | `#A2A2A2` | 2.55 | 不足 | 白 × 無効ボタン(Button_cv disabled) |
| `#FFFFFF` | `#C1C1C1` | 1.80 | 不足 | 白 × --ds-color-button-disabled |
| `#262626` | `#FFFFFF` | 15.13 | AAA | FAQカテゴリ見出し × 白 |
| `#262626` | `#EFF6FA` | 13.86 | AAA | FAQカテゴリ見出し × EFF6FA |
| `#646464` | `#EFF6FA` | 5.42 | AA | 本文 × EFF6FA |
| `#FFFFFF@0.6` | `#2B4A99` | 4.10 | 大文字のみ AA | 著作権表記 rgba(255,255,255,.6) × フッター |

観察: 主CTA は白文字(16〜20px / 600〜700)で、グラデーション始点 #FF5C00 は 3.10、終点 #FA8544 は 2.47 と通常文字の AA(4.5)未満。LINE ボタン白文字(2.68)、ホバー無しの注釈 #838383(3.79)も同様。本文系(#646464 5.92 / #4D4D4D 8.45 / #004380 9.93)は AA 以上。

## 2. タイポグラフィ

### 2.1 フォント(配信元・実ロード)

- 配信元: **Google Fonts**(`https://fonts.googleapis.com/css2?...&display=swap` を <link rel=preload as=style> + <link rel=stylesheet>、woff2 は fonts.gstatic.com。`preconnect` 済)。next/font は不使用。Adobe Fonts 等は検出なし。
- リクエストされているファミリー(10): Montserrat 500/700、Arsenal 400/700、Alexandria 200/400/700、Jost 200–700、Figtree 500/700、**Noto Sans JP 100..900(可変)**、**Inter 200–700**、**Shippori Mincho B1 400–800**、**Shippori Mincho 400/500/700**、Zen Old Mincho 400/600/900。
- 実際に `document.fonts` で loaded になったもの(5ページ実測): **Noto Sans JP**(weight 範囲 100–900 の FontFace 約54 + weight 400 の FontFace 約49。いずれも unicode-range 分割の woff2 で 1ページ約105本)、**Inter**(400/500/600/700)、**Shippori Mincho B1**(500/600/700/800 ※ページにより 400)、**Shippori Mincho**(500/700。ホーム Benefits 統計等)、**Zen Old Mincho 400**(ホームSPのみ loaded)。Montserrat/Arsenal/Alexandria/Jost/Figtree は **リクエストされているが未ロード=未使用**。
- 外部由来: `SF Pro JP`(Paidy 分割払い表記: 「12回払いで月々…」14px/600)、`Avenir Next`(CSS 6 箇所、第三者ウィジェット)。サイトのデザイン文字ではない。
- computed の font-family スタック(上位):
  - `"Noto Sans JP", sans-serif`(本文・ほぼ全て。html は `"Noto Sans JP","Helvetica Neue",Helvetica,Arial,"Hiragino Kaku Gothic Pro","ヒラギノ角ゴ Pro W3",メイリオ,Meiryo,"ＭＳ Ｐゴシック",sans-serif`)
  - `Inter, "Noto Sans JP", sans-serif`(= --ds-family-primary。数字・英字用に Inter を先頭、和文は Noto にフォールバック)
  - `Inter, sans-serif`(= --ds-family-numeric。電話番号・日付・Q. 等の数字)
  - `"Shippori Mincho B1", serif`(明朝見出し・数字強調。CSS 内宣言 62 回)、`"Shippori Mincho", serif`(11 回)、`"Zen Old Mincho", serif`(scan の %数値、3 回)
- CSS 宣言数: 'Noto Sans JP' 系 約 626、'Inter' 系 約 188、'Shippori Mincho B1' 69、'Shippori Mincho' 11、'Zen Old Mincho' 3。

### 2.2 全体ルール(実測の傾向)

| 項目 | 値(頻度は 5 ページ PC の文字数加重) |
| --- | --- |
| font-feature-settings | 日本語テキストの大半に `"palt"`(CSS 宣言: "palt" on 441 / "palt" 1 338 / "palt" 115)。数字には `"lnum","tnum"`(Inter、計 44 宣言)。 |
| text-transform / font-style | **全 1,827 タプルで none / normal**(大文字化・斜体の使用なし)。英字ラベル用の uppercase スタイルは存在しない。 |
| letter-spacing | `0.05em`(= --ds-ls-jp、文字数の最多 10,290 字)。`normal` 7,334 字。`-0.021em`(-0.02em: EarlyDetectionCases_title、フッターCTA説明 14px/-0.3px)、`0.1em`(About lead 3.2px/32px)、`0.02em`(Promise_title 0.72px/36px)。 |
| line-height 比 | `1.5`(html 既定 150%: 7,515 字)、`1.75`(= --ds-lh-body、28/16・31.5/18 他: 4,447+ 字)、`1.35`(= --ds-lh-heading: 37.8/28、32.4/24、29.7/22)、`1.0`(数字: 32/32・18/18)。scan 系の旧書体層は 32/18(1.78)、35/20(1.75)、42/24(1.75)、54/36(1.5)。 |
| font-weight 使用分布 | 400: 10,521字 / 500: 2,784 / 600: 2,875 / 700: 2,035 / 800: 160(PC)。ホーム新デザイン層は 400/500/600、ボタン・ヘッダー・scan 旧層は 700。 |

### 2.3 タイプスケール(トップ `/` 実測、PC 1440 / SP 390)

形式: size / weight / line-height / letter-spacing。「ls」は px 値と em 換算(実測の px ÷ size)。

| 役割 | 例(クラス) | フォント | PC | SP(iPhone UA) | 色 |
| --- | --- | --- | --- | --- | --- |
| H2 標準(ゴシック) | Faq_title ほか(*_title) | Noto Sans JP, palt | 28 / 600 / 37.8 / 1.4px(.05em) | 22 / 600 / 29.7 / 1.1px | #004380 |
| H2 明朝・大 | EarlyDetectionCases_title | Shippori Mincho B1 | 44 / 600 / 61.6 / -0.88px(-.02em) | 24 / 600 / 33.6 / -0.48px | #004380 |
| H2 明朝・中 | Promise_title | Shippori Mincho B1 | 36 / 600 / 54 / 0.72px(.02em) | 22 / 600 / 33 / 0.44px | #182963 |
| H2 明朝(ダーク面) | PurchaseCta_scanTitle | Shippori Mincho B1 | 36 / 600 / 50.4 / normal | 24 / 600 / 33.6 / normal | #FFFFFF |
| H2 コピー(Inter 先頭) | ScanCtaCompact_title | Inter→Noto, palt | 28 / 600 / 37.8 / 1.4px | 22 / 600 / 29.7 / 1.1px(Cta_title) | #004380 |
| H2 KW 副題 | KwSection_cmTitle | Noto Sans JP, palt | 22 / 600 / 38.5 / 1.1px | 18 / 600 / 31.5 / 0.9px | #A1AFDE |
| H3 明朝・リード | About_Intro_lead | Shippori Mincho B1 | 32 / 600 / 48 / 3.2px(.1em) | 24 / 600 / 36 / 2.4px | #004380 |
| H3 明朝・特大 | About_TenCancers_heading / Pancreas_heading | Shippori Mincho B1 | 44 / 600 / 44(77) / 1.32px(1.8px) | (SP別構造 24/600/24 等) | #004380 |
| 明朝リード文 | Benefits_lead / highlightText | Shippori Mincho B1 | 36 / 600 / 48.6 or 54 / normal(.72px) | 24 / 600 / 36 / 0.48px | #004380 |
| H3 カード見出し | About_AfterSupport_cardTitle | Noto Sans JP, palt | 24 / 600 / 32.4 / 1.2px | 22 / 600 / 29.7 / 1.1px | #4D4D4D |
| H3 店舗/導線ラベル | Stores_cardTitle / Consider_label | Noto Sans JP, palt | 22 / 600 / 38.5 / 1.1px | 22 / 600 / 38.5 / 1.1px | #004380 / #FFFFFF |
| 明朝 サブ見出し | Promise_subtitle / About_AfterSupport_lead | Shippori Mincho B1 | 22 / 600 / 33(38.5) / normal(1.4px) | 18 / 600 / 32 / 3px | #182963 / #004380 |
| H3 小(ステップ・医師名) | InspectionFlow_stepTitle / Doctors_name | Noto Sans JP, palt | 18 / 600 / 31.5(24.3) / 0.9px | 18 / 600 / 31.5(16/21.6/0.8px) | #004380 / #4D4D4D |
| リード(大) | EarlyDetectionCases_description / FAQ answer / News title | Noto Sans JP, palt | 18 / 400 / 31.5 / 0.9px | 16 / 400 / 28 / 0.8px(FAQ answer・News title は 18 のまま) | #646464 / #4D4D4D |
| 本文(標準) | KwSection_cmDesc / cardText / Doctors_text / Promise_body | Noto Sans JP, palt | 16 / 400 / 28 / 0.8px | 16 / 400 / 28 / 0.8px(KW説明は 14/400/21/0.7px) | #4D4D4D / #646464 |
| 本文(ブラウザ既定層) | html / body 継承 | Noto Sans JP | 16 / 400 / 24 / normal | 同左 | #646464 |
| 小注釈 | About_Sensitivity_note / ProductPageFooter_testNote / Doctors_role | Noto Sans JP | 12 / 400 / 18 / 0.6px(testNote は palt なし) | 12 / 400 / 18 / 0.6px | #838383 / #4D4D4D |
| 極小注釈 | Achievements_note / ScanCtaCompact_note | Noto Sans JP, palt | 10 / 400 / 15 / 0.5px | 9〜10 / 400 / 13.5〜15 / 0.45〜0.5px | #838383 |
| 主CTA ラベル(ホーム) | Achievements_buttonLabel / ScanCtaCompact_buttonLabel / PurchaseCta_buyButtonText | Noto Sans JP, palt | 16 / 600 / 28 / 0.8px(Achievements)、18 / 600 / 31.5 / 0.9px(Compact/Purchase) | 14 / 600 / 21 / 0.7px(Achievements)、16 / 600 / 28 / 0.9px(Cta)、18/600/31.5/0.9px(Purchase) | #FFFFFF |
| 主CTA ラベル(scan 旧層) | Button_cv | Noto Sans JP | 20 / 700 / 30 / 1px | 20 / 700 / 30 / 1px(/products/scan、ボタン 335x56) | #FFFFFF |
| 副ボタン ラベル | SecondaryButton_label | Noto Sans JP, palt | 16 / 400 / 28 / 0.8px | 16 / 400 / 28 / 0.8px | #1F7BB8 |
| 特設サイトボタン ラベル | KwSection_specialButtonLabel | Noto Sans JP, palt | 18 / 400 / 31.5 / 0.9px | 14 / 400 / 21 / 0.7px | #FFFFFF |
| LINE ボタン | ProductPageFooterV2_lineButton | Noto Sans JP | 16 / 700 / 24 / normal | 16 / 700 / 24 / normal | #FFFFFF |
| ナビ: ヘッダー上段タブ | ProductPageHeader_menu_link_top_tab_* | Noto Sans JP | 13 / 700 / 20 / normal | (非表示) | #1F7BB8 |
| ナビ: ヘッダーメイン | client_menu_item_text | Noto Sans JP | 18 / 700 / 18 / normal | SPメニュー 20 / 700 / 20 / normal #FFFFFF | #1F7BB8 |
| ナビ: 2nd nav | SecondGlobalNavigation_product_name | Noto Sans JP | 14 / 700 / 21 / normal | (非表示) | #646464 |
| ナビ: フッター主リンク | ProductPageFooter_mainItem / productName | Noto Sans JP, palt | 24 / 600 / 32.4 / 1.2px | ドロップダウン 18 / 400 / 24 / normal | #FFFFFF |
| ナビ: フッター副リンク | ProductPageFooter_linkItem(cancerList) | Noto Sans JP, palt | 18 / 600 / 24.3 / 0.9px | 同(アコーディオン内) | #FFFFFF |
| ナビ: フッター小 | columnTitleText / navMenu / productDescription | Noto Sans JP, palt | 14 / 400 / 21 / 0.7px | 16 / 400 / 24 / normal(navMenu) | #FFFFFF |
| 数字強調(明朝) | Benefits_statBig / unit | Shippori Mincho | 54 / 500 / 54 / normal、単位 26 / 700 / 26 | 同 | グラデ文字(#2D7BC4→#112C4D) |
| 数字強調(明朝・症例) | EarlyDetectionCases_cancer / stageValue / stageLabel / small | Shippori Mincho B1 | 36/600/36、32/600/32、25.6/600/25.6、12.8/600/12.8(すべて normal) | 24/600/28.8、—、—、12.27/600/12.27(21/600/21 stage) | #897645 |
| 数字(Inter): 電話 | CustomerSupport_Block_telNumber | Inter, lnum tnum | 32 / 600 / 32 / normal | 24 / 600 / 24 / normal | #1F7BB8 |
| 数字(Inter): FAQ Q | Faq_mark | Inter, lnum tnum | 32 / 600 / 32 / normal | 同 | #1F7BB8 |
| 数字(Inter): 日付 | News_date / Column_cardDate / InspectionFlow_stepNum | Inter | 18/400/18、12/400/12、18/400/18(stepNum のみ lnum tnum) | 同 | #4D4D4D(News SP は #838383)/ #004380 |
| 数字(Inter): 営業時間 / キャンペーン | CustomerSupport_Block_hours / campaignText | Inter, lnum tnum | 12/400/12、16/600/16 | 12/400/12、14/600/18 | #004380 / #FF5C00 |
| バッジ/タグ | News_badgeText / Column_cardBadgeText / LatestColumn_category / Column_cardTag | Noto Sans JP, palt | 14/600/20(News)、14/600/21(Column)、14/400/21(タグ) | 同 | #004380 / #1F7BB8 / #838383 |

### 2.4 サイズヒストグラム(5 ページ・文字数加重)と比率

PC(px: 文字数) 10: 403 / 12: 4254 / 12.8: 116 / 13: 200 / 14: 2487 / 16: 2271 / 18: 5711 / 20: 910 / 22: 241 / 24: 766 / 26: 90 / 28: 215 / 32: 70 / 34: 69 / 36: 298 / 40: 60 / 44: 102  
SP(px: 文字数) 10: 744 / 12: 4133 / 12.2727: 108 / 14: 1868 / 16: 3225 / 18: 5250 / 20: 474 / 22: 520 / 24: 454 / 30: 60

実測の主要サイズ: PC **10 / 12 / 14 / 16 / 18 / 20 / 22 / 24 / 28 / 32 / 36 / 44**(+ 数字特大 54/56)。SP **9〜10 / 12 / 14 / 16 / 18 / 20 / 22 / 24 / 32**。ds トークン(--ds-size-*): 12 / 14 / 16 / 18 / 22(heading-sm)/ 24(numeric-lg)。
隣接段の比は 14→16(×1.14)、16→18(×1.125)、18→22(×1.22)、22→24(×1.09)、24→28(×1.17)、28→36(×1.29)、36→44(×1.22)。単一の等比スケールではなく **+2px 刻みの本文帯(12/14/16/18/20/22/24)と見出し専用帯(28/32/36/44)**(推定)。SP/PC 比(実測): 44→24=0.55、36→22〜24=0.61〜0.67、32→24=0.75、28→22=0.79、24→22=0.92。18 以下の本文系は多くが不変(例外: KW説明 16→14、Achievements ラベル 16→14、Doctors 名 18→16)。

## 3. スペーシング

### 3.1 セクション縦パディングと横余白(トップ、実測)

| セクション | PC padding-top / bottom | PC 左右 / 内側幅 | SP padding-top / bottom | SP 左右 / 内側幅 |
| --- | --- | --- | --- | --- |
| EarlyDetectionCases | 128 / 128 | 0 / 992 | 80 / 80 | 0 / 476(横スクロール行) |
| Benefits | 128 / 128 | 0 / 992 | 80 / 80 | 16 / 358 |
| Doctors | 128 / 128 | 0 / 992 | 80 / 80 | 16 / 358 |
| InspectionFlow | 128 / 64 | 0 / 992 | 80 / 80 | 24 / 342 |
| Stores | 128 / 128 | 0 / 992 | 80 / 80 | 24 / 342 |
| Media | 0 / 128 | 224 / 992 | 0 / 80 | 16 / — |
| Promise | 128 / 128 | 0 / 992(カード内 padding 48 64) | 240 / 80 | 16 / 358 |
| FAQ | 128 / 128 | 0 / 992 | 80 / 80 | 16 / 358 |
| News / Column | 120 / 120 | 224 / 992 | 80 / 80 | 16 / 358 |
| Consider | 128 / 128 | 0 / 992 | 80 / 80 | 16 / 358 |
| KwSection | 96 / 96 | 0 / 992 | 0 / 0(wrapper) | — |
| Achievements(濃紺帯) | 32 / 32 | 260 / 922 | 16 / 16 | 16 / 358 |
| ScanCtaCompact / Cta | 48 / 0 | — / 1120(カード 1120) | 0 / 0 | 16 / 335 |
| CustomerSupport | 24 / 24 | 48 / — | 24 / 24 | 16 / 358 |
| フッター CTA 帯 | 40 / 40 | 24 / 992 | 40 / 40 | 24 |
| フッター | 80 / 40 | 80 / 1280 | 40 / 40 | 20 / 350 |

- **セクション縦余白の主値: PC 128px / SP 80px**(PC: padding-top 128 が 8 セクション、120 が 2、96/48/40/32/24 が各1〜2。SP: padding-top 80 が 10 セクション、40・24・16 が各1〜2、240 は Promise の写真被せ分)。
- **コンテナ幅**: PC の主コンテンツ内側は **992px**(`max-width:992px` を持つコンテナ、3 件)。ScanCtaCompact は 1120px、フッター内側は max-width 1352px で実幅 1280px(左右 padding 80)。ホームの PC レイアウトは幅 1320px で固定的(狭い PC UA では scrollWidth=1320 の横スクロール)。
- **SP 横ガター**: 16px(多数)、24px(Flow/Stores/フッターCTA)、20px(フッター)。内側幅 358 / 342 / 310 などは 390-2×16/24/40。
- 計測したヘッダー系: 情報バー 高さ 35(PC) / 40(SP)、ヘッダー 110(PC) / 68(SP)、PC は 2nd nav(54px, fixed top:108px, z-index:-1)。

### 3.2 見出し・本文・カード内の間隔(実測)

| 対象 | PC | SP |
| --- | --- | --- |
| H2 とその下の 1px 罫線(Heading ブロック内 gap) | 32px(見出し 38px + 罫線 1px = 計 71px、罫線幅 280px) | 24px(30 + 1 = 55px、罫線幅 200px) |
| 見出しブロック → コンテンツ(Faq/News/Column/Consider/Stores/Flow/Doctors の inner gap) | 64px | 48px |
| コンテンツ → 「もっと見る」副ボタン | 64px | 48px |
| 大セクション内ブロック間(Benefits_container、About_container) | 128px / 160px | 48px(Benefits) |
| KwSection の CM ブロック ↔ 特設ブロック | 64px(container gap) | — |
| EarlyDetectionCases: 見出し→ボード→説明 | 32px / 32px | 24px / 24px / 24px |
| FAQ 項目(閉)の内側 | padding 32 48、リストの項目間 gap 8、質問→回答 32px | padding 16 24、質問→回答 約32px(回答が 541-(446+63)=32) |
| カード内 padding | Benefits 32 48、Flow 32、Doctors 32 48、Stores本文 32、症例カード 32 16、Promiseラップ 48 64、Award 40 80、ScanCtaCompact 48 128 128 | Benefits 32 48、Flow 32、症例カード 24 13.5、Stores本文 32、Cta_card 32 24 200 |
| カード間 gap(実測 flex gap) | Benefits stat cards 31 / Column list 31 / Stores 32(縦)/ Doctors slider 32 / Consider 24 / Promise boxes 48 / About_AfterSupport 96 / 症例カード 8 / フッターCTAカード 8 / Media ロゴ grid 12(4列x239px) | Benefits 31(縦)/ Column 16 / Stores 32 / Consider 16 / Doctors 16 / Promise 24 / Flow 8 / Media ロゴ grid 約5.1(3列) |
| ボタン padding | 主CTA 12 48(Achievements 12 144 12 40=パッケージ画像用空き)、副 12 48、LINE 12 20、ヘッダータブ 6 15、フッターボタン 6 16 7 | 主CTA 12 24(Purchase 12 48)、副 12 24、特設 12 24 |

### 3.3 値のヒストグラム(5 ページ計測 / 要素辺単位の出現数、上位)

- padding(PC): 6px×120, 32px×117, 16px×106, 48px×99, 40px×97, 4px×76, 20px×71, 24px×65, 15px×54, 12px×53, 14px×50, 8px×38, 7px×30, 128px×29, 2px×28, 80px×21, 30px×19, 64px×15, 120px×15, 18px×14, 160px×10, 3.6px×8
- padding(SP): 16px×160, 24px×154, 32px×134, 20px×92, 4px×90, 30px×81, 12px×52, 8px×48, 40px×45, 80px×42, 6px×41, 2px×38, 7px×30, 14px×30, 18px×22, 13.5px×16, 48px×14, 0.916667px×12, 10px×12, 2.8px×8, 5px×6, 108px×5
- flex/grid gap(PC): 8px×199, 10px×123, 24px×80, 20px×52, 16px×50, 4px×39, 40px×37, 64px×34, 32px×33, 30px×27, 48px×24, 2px×23, 0px×13, 80px×12, 12px×10, 6px×10, 5px×10, 31px×5, 9.6px×5, 41px×5
- flex/grid gap(SP): 8px×164, 10px×106, 16px×77, 4px×54, 24px×54, 20px×39, 40px×25, 0px×24, 48px×20, 6px×18, 12px×16, 2px×12, 32px×12, 4.28571px×12, 5px×10, 7.2px×5, 30px×5, 36px×5, 30px / 40px×5, 64px×4

**推定スケール**: 4/8px 系。実測の頻出値は 2 / 4 / 8 / 12 / 16 / 24 / 32 / 40 / 48 / 64 / 80 / 96 / 120 / 128 / 160(PC)。ds トークン(--ds-spacing-*)は 2 / 4 / 8 / 12 / 16 / 24 / 32 / 48 / 128(`xs=4, sm=8, sm-md=12, md=16, lg=24, xl=32, 2xl=48, 5xl=128`)。実装には ds に無い 10px(gap 10 が PC 68 件)、6 / 14 / 15 / 20 / 22.5 / 3.6 などの端数も混在(ボタン内・バッジ・Figma 由来)。

## 4. 形状

### 4.1 border-radius(PC / 5 ページ 要素数)と使い分け

| 値 | PC | SP | 使い分け(実測サンプル) |
| --- | --- | --- | --- |
| 4px | 27 | 28 | **主CTA**(Achievements/ScanCtaCompact/PurchaseCta/Button_cv)、副ボタン、特設サイトボタン、input(/contact)。--ds-radius-sm |
| 6px | 40 | 40 | フッターCTAカード、フッター medicalText ボタン(塗り/枠) |
| 8px | 22 | 22 | 統計カード(Benefits_statCard / SP Benefits_card)、scan の DoctorCommentSlide 白カード、LINE アイコン(40x40) |
| 12px | 23 | 23 | ヘッダー右アイコンメニュー(問い合わせ/購入)、/contact フォーム外枠・FAQ カテゴリカード。--ds-radius-lg |
| 40px / 44px / 50px / 100px / 999px | 10/4/2/2/33 | 10/4/2/2/32 | **ピル系**: LINE ボタン(40)、副ボタン scan(Button_secondary 40)、article「すべての記事を見る」(44)、送信ボタン(50)、バッジ・チップ・CMボタン・LINEリンク(999)。--ds-radius-full=999 |
| 50% | 20 | 24 | スライダー矢印円(72px svg)、SP の Pancreas リング(275px)など |
| 0px 0px 4px 4px | 25 | — | ヘッダー上段タブ(青/白)の下側のみ |
| 2px | (ds) | (ds) | --ds-radius-xs(チェックボックス 2px 実測) |
| img 要素 | 0px: 457、8px: 10、50%: 18 |  | **写真・画像はほぼ角丸なし(0)**。例外: LINEアイコン 40x40(8)、scan の医師アイコン 80x80(50%)。ホームの img は 8px(LINEアイコン)以外すべて 0 |

### 4.2 border

| 値(辺) | PC 要素数 | 使用箇所 |
| --- | --- | --- |
| `all 1px solid #1F7BB8` | 53 | div.client_icon_menu_2025 client_is_opacity, div.client_icon_menu_2025 |
| `all 1px solid #FFFFFF` | 35 | a.KwSection_specialButton, div.DiscountPriceDisplayLine_discount_badge DiscountPriceDisplayLine_color_blue |
| `RBL 1px solid #4694C9` | 15 | a.ProductPageHeader_menu_link_top_tab_white |
| `B 1px solid #FFFFFF` | 15 | div.ProductPageFooter_columnTitle |
| `B 1px solid #1F7BB8` | 10 | a.EarlyDetectionCases_link, a.About_Intro_link |
| `all 1px solid #E0E0E0` | 9 | div.LatestColumn_latest_column_area |
| `B 1px solid #B8B8B8` | 6 | div.DiscountPriceDisplayLine_course_header |
| `T 1px solid #E0E2E3` | 6 | div.ProductPageFooter_bottom, div.page_breadcrumb_wrapper_bottom |
| `T 1px solid #E0E0E0` | 5 | a.News_row |
| `all 1px solid #004380` | 3 | div.InspectionFlow_stepCircle |
| `all 1px solid #06C755` | 3 | a.FloatingBanners_lineCard |
| `B 1px solid #20B646` | 2 | span.CustomerSupport_Block_lineButton |

太さは **ほぼ 1px のみ**(例外: SP の左 8px 白三角ポインタ 2 件、/contact checkbox 無枠)。focus は独自枠なし(Chromium 既定 outline)。

### 4.3 box-shadow / text-shadow

| 値 | PC 要素数 | SP 要素数 | 使用箇所 |
| --- | --- | --- | --- |
| `#00000040(A=0.25) 0px 1px 2px 0px` | 30 | 30 | a.ProductPageFooter_medicalText, a.ProductPageFooter_medicalText ProductPageFooter_medicalTextFill |
| `#00000033(A=0.2) 0px 2px 5px 0px` | 17 | 18 | div.client_icon_menu_2025 client_is_opacity, div.client_icon_menu_2025 |
| `#00000012(A=0.07) 0px 4px 6px 0px` | 10 | 5 | div.ProductPageHeader_container_inner, div.SecondGlobalNavigation_second_global_navigation |
| `#00000014(A=0.08) 0px 3px 6px 0px` | 10 | 10 | div.KwSection_cmStill, div.Benefits_statCard |
| `#00000033(A=0.2) 0px 2px 6px 0px` | 9 | 14 | a.ProductPageFooterV2_lineButton, button.Button_btn Button_secondary |
| `#0000001A(A=0.1) 1.81818px 1.81818px 9.09091px 0px` | 4 | — | div.EarlyDetectionCases_card, div.EarlyDetectionCases_cardLast |
| `#0000001F(A=0.12) 0px 2px 6px 0px` | 2 | 2 | div.ModalLinkButton_button_container ScanReasonList_modal_link_button |

補足: SP の症例カード影は `1.22727px 1.22727px 6.13636px`(PC の `1.81818px 1.81818px 9.09091px` の 0.675 倍。拡縮由来の端数と推定)。text-shadow: rgba(0, 0, 0, 0.25) 0px 0px 8px。影は全て純黒 alpha(.07 / .08 / .1 / .12 / .2 / .25)、ぼかし 2〜9px 程度の控えめ設計。

## 5. 主要コンポーネント実測

(値は `components.json` の computed 実測。PC=1440、SP=390。hover は Playwright の hover で発火し 0.9 秒後に取得、**差分のあったプロパティのみ**記載)

### 5.1 ボタン

| 種別 | PC 寸法 | padding / radius | 背景 / 文字 / 枠 / 影 | hover 差分 | SP 寸法 |
| --- | --- | --- | --- | --- | --- |
| 主CTA(ホーム: Achievements_button) | 356.4x52 | 12 144 12 40 / 4px | bg `linear-gradient(135deg,#FF5C00,#FA8544)` / 文字 #FFFFFF 16px 600 / 枠なし / 影なし / 右にパッケージ画像(112x77, top -27.5px) | background-image → `linear-gradient(135deg,#E44912,#F56B1F)`(transition 0s=即時) | 358x45(padding 12 24、影 0 2px 5px rgba(0,0,0,.2)) |
| 主CTA(ScanCtaCompact_button) | 440x55.5 | 12 48 12 48 / 4px | 同グラデ / #FFFFFF 18px 600 / 影 `0 2px 5px 0 rgba(0,0,0,.2)` | 同上 | Cta_button 287x52(12 24) |
| 主CTA(PurchaseCta_buyButton) | 424x55.5 | 12 48 12 48 / 4px | 同グラデ / #FFFFFF 18px 600 / 影 同 | 同上 | 342x56(12 48) |
| 主CTA(scan 旧 Button_cv) | 420x60 | 0 40 / 4px | `linear-gradient(94deg,#FF5C00 28.3%,#FF8947 71.7%)` / #FFFFFF 20px 700 / 影 同 / 右に三角アイコン(20x16) | グラデ → `(94deg,#E44912 28.3%,#F56B1F 71.7%)`。transition `all .3s ease` | 335x56(padding 0 40、同グラデ・同影、transition all .3s ease) |
| 副ボタン(SecondaryButton_button) | 323x57.5 | 12 48 / 4px | bg #FFFFFF / 文字 #1F7BB8 16px 400 / 枠 1px solid #1F7BB8 / 影なし | 枠・文字色 #1F7BB8 → #0063AC(border-color / color) | 250x54(12 24) |
| CM ボタン(KwSection_cmButton) | 400x60 | 8 8 8 48 / 999px | bg #FFFFFF / 文字 #182963(label)/ 影なし | bg #FFFFFF→#E1EBF2、box-shadow none → `0 4px 12px rgba(0,0,0,.24)`(transition: box-shadow, background-color .2s ease) | 184x48 |
| 特設サイト(KwSection_specialButton) | 574x57.5 | 12 48 / 4px | bg 透明 / 文字 #FFFFFF 18px 400 / 枠 1px solid #FFFFFF | bg 透明 → rgba(255,255,255,.12)(transition background-color .2s ease) | 310x47(12 24, 14px) |
| LINE(ProductPageFooterV2_lineButton) | 442x48 | 12 20 / 40px | bg #20B646 / #FFFFFF 16px 700 / 影 `0 2px 6px rgba(0,0,0,.2)` | opacity 1 → .85、filter brightness(.85)(transition opacity .2s ease) | 292x48 |
| LINE(CustomerSupport_Block_lineLink) | 229x64 | 0 24 0 0 / 999px | bg 透明、文字 #20B646、下線 1px solid #20B646、左に 90px 円(LINE ロゴ) | filter brightness(.85) | 199x60 |
| フッター medicalText(塗り) | 233.4x38 / 262x38 | 6 16 7 / 6px | bg #4469C6 / #FFFFFF 14px 400(palt, 0.7px) / 影 `0 1px 2px rgba(0,0,0,.25)` / 左 24px アイコン | opacity 1 → .7、brightness(.85)(transition opacity .2s) | 同寸法 |
| フッター medicalTextOutlined | 132.6x38 | 6 14 7 / 6px | bg #2B4A99 / #FFFFFF / 枠 1px solid #FFFFFF / 影 同 | 同上 | 同 |
| ヘッダー上段タブ(青) | 146.8x33 | 6 15 / 0 0 4px 4px | bg #E1EBF2 / #1F7BB8 13px 700 | opacity .7、brightness(.85) | (非表示) |
| ヘッダー上段タブ(白) | 123x33 | 6 15 / 0 0 4px 4px | bg #FFFFFF / #1F7BB8 / 枠 右下左 1px solid #4694C9 | 同上 | (非表示) |
| ヘッダー右アイコンメニュー(問い合わせ/購入) | 100x90(PC) / 72x52(SP) | 0 12(PC) / 0 4(SP) / 12px | bg #FFFFFF / 枠 1px solid #1F7BB8 / 影 `0 2px 5px rgba(0,0,0,.2)` / 文字 #1F7BB8 12px 700 | (未取得) | 72x52 x2 |
| FAQ 検索(FaqSearchBar_search_button) | 113.6x54 | 16 40 / 50px | bg `linear-gradient(101.58deg,#1F7BB8 12.75%,#4C95C6 87.25%)` / #FFFFFF 16px 700 / 影 `0 2px 5px rgba(0,0,0,.2)` | opacity 1 → .9 | — |
| article「すべての記事を見る」(button_blue) | 231.8x73 | 21 18 / 44px | bg #1F7BB8 / #FFFFFF 20px 700 / 枠 1px solid #1F7BB8 | **色反転**: bg #FFFFFF / 文字・枠 #1F7BB8(transition all .3s) | — |
| scan 副(Button_secondary) | 186x46 | 10 20 / 40px | bg #FFFFFF / #569DD6 16px / 枠 1px solid #569DD6 / 影 `0 2px 6px rgba(0,0,0,.2)` | opacity 1 → .7 | — |
| /contact 送信(Button_cv disabled) | 260x56 | 16 30 / 50px | bg #A2A2A2 / #FFFFFF 16px 700(ls .8px) | (未入力時 disabled) | — |

アイコン有無: 主CTAホームはテキスト+パッケージ画像(Achievements のみ)。scan 旧層 Button_cv は右端に三角アイコン(Button_triangle_right 20x16)。副ボタン・LINEは矢印アイコン(15x12 svg: Faq/Footer LINE)。

**テキストリンク**: `EarlyDetectionCases_link` ラベル #1F7BB8 16px/600 Inter(lnum tnum)、下線は border-bottom 1px solid #1F7BB8、hover で文字・下線とも #0063AC。`Benefits_detailLink` ラベル #1F7BB8 14px 600(palt, .7px)+ 18x18 アイコン、下線 1px #1F7BB8、hover #0063AC。フロー内インラインリンク(InspectionFlow_descLink)は #004380 16px/28、hover は filter brightness(.85)。ナビ系リンクは hover = filter: brightness(.85)。

### 5.2 カード

| カード | PC 寸法 | padding / radius | 背景 / 枠 / 影 | hover |
| --- | --- | --- | --- | --- |
| 統計カード Benefits_statCard | 310x270 | 32 48 / 8px | bg #FFFFFF / 枠なし(SP は 1px solid #76ADD2)/ 影 `0 3px 6px rgba(0,0,0,.08)` | — |
| 症例カード EarlyDetectionCases_card | 240x181.6 | 32 16 / 0(PC) | bg rgba(255,255,255,.95) / 影 `1.8px 1.8px 9.09px rgba(0,0,0,.1)` | — |
| フローカード InspectionFlow_card1 | 315x444 | 32 / 0 | bg #FFFFFF / 枠・影なし。円形 step(40x40, 枠 1px solid #004380, 数字 Inter 18px #004380) | — |
| 店舗カード Stores_card | 992x200(本文 692 + 画像 300x200) | 本文 32 / 0 | 本文 bg `linear-gradient(90deg,#F0F1F8,#DDEBF7)` / 影なし | — |
| Doctors カード | 476x468.3 | 32 48 / — | bg #FFFFFF(非 active は dim) / 内側 380x376 | transition transform, opacity .4s ease(スライダー用) |
| Promise ラップ Promise_card | 992x580 | 48 64 / 0 | `linear-gradient(#FFFFFFE6,#E1EBF2E6)` | — |
| Column カード(ホーム) | 310x477.5(画像 310x210) | 0 / 0 | 白地、枠なし、img 0 radius | filter brightness(.85)(transition filter .2s ease) |
| LatestColumn カード(/article) | 310x537 | — / 0 | bg #FFFFFF / 枠 1px solid #E0E0E0 | brightness(.85) |
| Consider カード | 484x200 | 0 / 0 | 写真 + オーバーレイ rgba(0,0,0,.3)(Consider_overlay30)/ ラベル 22px/600 #FFFFFF | brightness(.85) |
| Media Award カード | 992x335 | 40 80 / 0 | bg #F5F5F5 | — |
| ScanCtaCompact_card | 1120x387.1 | 48 128 128 128 / 0 | bg #DDEBF7 | — |
| 価格パネル PurchaseCta_scanPrice | 504x558 | 48 / 0 | `linear-gradient(#213882,#182963)` | — |
| FAQカテゴリカード(/faq) | 715x378 | 48 / 12px | bg #FFFFFF | — |
| フッターCTAカード | 492x196 | 24 / 6px | 枠 1px solid #FFFFFF(帯 #3B5DB3 上) | — |
| News 行 | 992x128 | 32 0 / 0 | 枠 border-top/bottom 1px solid #E0E0E0 | brightness(.85) |

### 5.3 バッジ・タグ

| 種別 | 寸法 | padding / radius | 背景 / 枠 / 文字 |
| --- | --- | --- | --- |
| News_badge | 150x34 | 6 20 8 / 0 | bg #FFFFFF、文字 #004380 14px/20 600(palt) |
| Column_cardBadge | 90x31 | 4 16 / 999px | 枠 1px solid #1F7BB8、文字 #1F7BB8 14px/21 600(palt)。/article LatestColumn_category は 63.4x31, 同仕様(ls .7px) |
| Column_cardTag | 105.8x21 | 0 | 文字 #838383 14px/21 400(# 付きテキスト、枠なし) |
| 必須バッジ form_group_required | 40x23 | 2.5 / 30px | bg #F25C72、文字 #FFFFFF 12px/18 500(ls .48px) |
| キャンペーン行 ScanCtaCompact_campaignInner | 776x25 | 0 0 4 / 0 | 下線 1px solid #FF5C00、日付ラベル 16px/16 600 Inter #FF5C00 + カレンダーアイコン 20x20 |
| SP メニュー「結果表はこちら」 | 99x26 | 4 8 | bg #569DD6、文字 #FFFFFF 12px/18 700(ls .6px)、左三角(border-left 8px #FFFFFF) |
| 割引バッジ DiscountPriceDisplayLine_discount_badge | — | — | 枠 1px solid #FFFFFF(濃紺面上)、文字 12px/18 400 / SP 10px/15 |

### 5.4 ヘッダー

| 要素 | PC | SP |
| --- | --- | --- |
| 構成 | 情報バー(青)→ ヘッダー(白)+ 2nd nav(グレー、z-index -1 でヘッダー下に重なる)。全体が position:fixed(info+header) | 情報バー → ヘッダー(白)。ハンバーガーで全画面メニュー |
| 情報バー | 高さ 35、bg #1F7BB8、padding 6、文字 14px/24 400 #FFFFFF(全幅中央、右に閉じる×) | 高さ 40、padding 2 0、文字 12px |
| ヘッダー | 高さ 110、padding 0 40、bg #FFFFFF、影 `0 4px 6px rgba(0,0,0,.07)`(container_inner に付与)、position fixed / top:0 / z-index 1000、ロゴ 230x49 | 高さ 68、padding 18 8、同影、ロゴ 150x32、右: 問い合わせ・購入ボタン 72x52 x2 + ハンバーガー 50x44(ラベル「メニュー」12px/20 700 #1F7BB8) |
| 2nd nav(PC のみ) | 高さ 54.2、bg #F5F5F5、padding 14、gap 40、項目 14px/21 700 #646464 + パッケージ画像 33x20、影 同、`animation SecondGlobalNavigation_slideDown .5s ease-out`、position fixed top:108px | 非表示 |
| ナビ | メインリンク 18px/18 700 #1F7BB8(製品一覧▾、ご利用者の声、研究開発▾、お問い合わせ)、上段タブ 13px/20 700(青 2 + 白 3) | SPメニュー: 20px/20 700 #FFFFFF、項目ピッチ 66px(実測)、区切り 1px rgba(255,255,255,.1)(330px 幅)、全画面 390x844 の背景 `linear-gradient(91.545deg, #1F7BB8 12.75%, #4C95C6 87.25%)`、下部ボタン(検査できる医療機関等)bg rgba(255,255,255,.3) / radius 6 / padding 6 16 7(222x38) |
| スクロール後(0 / 400 / 1500px、上戻し) | **矩形・影・背景は不変**(縮小・隠れ・色変化なし。position:fixed で常時表示)。transition プロパティは `transform, opacity 1s ease-in-out`(宣言のみ、発火は観測されず) | 同(不変) |
| PC→縮小の CSS 切替(実測) | ≥1301px: PCナビ幅 648。≤1300px: ハンバーガー表示(70px、padding 20)。≤1000px: 高さ 110→68。≤768px: ハンバーガー幅 50 |  |

### 5.5 フッター

- フッターCTA帯: bg #3B5DB3、padding 40 24、タイトル 24px/36 700 #FFFFFF(SP 20/30/1px)、カード 492x196(枠 1px #FFFFFF, radius 6, padding 24)。LINE ボタン 442x48(上記)。電話番号は Inter 32px/600(PC)。
- フッター本体: bg #2B4A99、padding 80 80 40(PC)/ 40 20(SP)、内側 1280、列 gap 41、列見出し 14px/21 #FFFFFF(palt .7px)、製品名 24px/32.4 600(1.2px)、がん種リンク 18px/24.3 600、下部ナビ 14px/21 400、区切り 1px solid #E0E2E3、著作権 12px/18 rgba(255,255,255,.6)、注記 12px/18(.6px)。SP: 製品一覧はアコーディオン(dropdownBtn 18px/24 400 + 23x24 アイコン)。リンク hover = filter brightness(.85)。

### 5.6 FAQ アコーディオン(トップ Faq_item)

| 状態 | PC | SP |
| --- | --- | --- |
| 閉 | item 992x96、bg #FFFFFF、padding 32 48、radius 0、Q マーク Inter 32px/600/32 #1F7BB8、質問 18px/600/31.5/0.9px #1F7BB8、右に + アイコン(svg 24x24 stroke #646464)、項目間 gap 8 | item 358x95、padding 16 24 |
| 開 | item 高さ 96→317(回答 896x189 追加)。回答 18px/400/31.5/0.9px #4D4D4D、質問→回答 gap 32px。アイコンは縦線が消え「−」(line 幅 0)。**即時(transition 0s)** | item 95→442、回答 310x315 |
| hover(PC) | FaqList(/faq): 行 hover で Q.・題とも #646464→#004380(transition color .2s ease) | — |

/faq ページ: 質問行は `<a>`(Q. = Inter 20px/400 #646464、題 18px/500/31.5/0.9px)、カテゴリカード 715x378(padding 48、radius 12)、見出し 28px/700/42/1.4px #262626、件数 Inter 20px/700。サイドバーのカテゴリリンク 16px/500/28 #646464、hover #1F7BB8。

### 5.7 フォーム(/contact、送信なし)

| 要素 | 実測 |
| --- | --- |
| フォーム外枠 | 464x859、bg #F5F5F5、padding 32、radius 12px |
| ラベル | 20px/700/30、ls 1px、#646464 + 必須バッジ(上記)。ラベル→入力 約 10px |
| text input / textarea | 高さ 62(PC)、border 1px solid #E0E2E3、radius 4px、padding 10、bg #FFFFFF、文字 20px/500/35(textarea は 16px/500/28/0.8px、高さ 160)、color #646464、placeholder #B8B8B8、box-shadow なし |
| 姓名 | 2 列(195px x 2、gap 約 10px)、その他は 400px 幅 |
| フォーカス | 独自スタイルなし: 既定の `outline: auto 1px rgb(0,95,204)`、border 変化なし |
| チェックボックス | 21x21、radius 2px、::before 17x17 / ::after 7x17(カスタム描画) |
| エラー(空 blur) | 観測できず(blur だけでは表示なし。送信は未実施) |
| 送信ボタン | 260x56、radius 50px、bg #A2A2A2(disabled)、#FFFFFF 16px/700、padding 16 30 |

### 5.8 スライダー/ページネーション/その他

- Splide を使用(`.splide__*`)。Doctors/Media の矢印は **72x72 の円(50%)**、白塗り + 24x24 アイコン、dot **12x12(SP 10x10)・999px**、active は `linear-gradient(#69C0F8,#7693E9)`、非 active は #E0E0E0。
- **表(table)**: 計測 5 ページに `<table>` なし(価格・比較は div で構成)。未確認ではなく 0 件。
- breadcrumb: /faq は 12px/18 0.6px(palt)、リンク #1F7BB8、現在地・区切り #A2A2A2。/article・/scan・/commitment は Breadcrumb_*(「トップ」#76ADD2)。

## 6. ブレークポイント

配信CSS 59 ファイル(Vimeo の player.css を除く、5 ページ分)の @media を全収集(`media-queries.json` に全 56 種)。ページ別チャンクが共通CSSを重複内包するため「ルール数」は水増しで、**ファイル数**を併記する。

| 条件 | ルール数 | 含むCSSファイル数 | 用途(実測/推定) |
| --- | --- | --- | --- |
| max-width: 768px | 1577 | 44 | **SP 切替の主**。コンポーネントの縮小(約1,577ルール) |
| max-width: 1099px | 780 | 29 | タブレット(scan/commitment 旧層の縦積み・padding 80 0 等) |
| max-width: 1000px | 609 | 31 | ヘッダー高さ 110→68、layout の padding-top 切替 |
| max-width: 1300px / min-width: 1301px | 54 / 11 | 7 / 2 | PC ナビ→ハンバーガー(実測 ≤1300)、commitment の縦積み |
| max-width: 1200px / min-width: 1200px | 51 / 13 | 10 / 1 | フッターのロゴ列 縦積み |
| min-width: 600px | 40 | 5 | SP ツリー(mobile-first)のタブレット対応: Stores_card を row 化・Stores_root padding 48、VideoGallery 2 列(gap 32 24)など |
| max-width: 400px / 500px | 31 / 28 | 12 / 9 | 小型SP微調整 |
| min-width: 768px / 744px / 1024px / 1100px / 1400px | 17 / 12 / 4 / 2 / 1 | 2 / 4 / 1 / 1 / 1 | タブレット以上の上向きクエリ(例: min-width:744 で Media_root / PurchaseCta の左右 padding 48) |
| max-width: 599 / 380 / 375 / 389 / 414 / 425 / 360 / 367 | 13 / 8 / 4 / 1 / 3 / 1 / 1 / 1 | 1〜3 | SP 小型端末 |
| Bootstrap 由来 | 575.98 / 767.98 / 991.98 / 1199.98 / 1399.98 (max), 576 / 992 (min) 各 2 | 1 | Bootstrap 5 の標準 BP(btn/modal 等) |
| (hover: hover) | 37 ルール | 8 | hover を持つ環境のみ hover 装飾(タッチで貼り付き防止) |
| prefers-reduced-motion: reduce | 19 | 5 | animation: none 等(Vimeo player 分は除外後の数) |
| print / orientation / max-height 系 | print 15、(max-width:932px) and (orientation:landscape) and (max-height:600px) 12 など | 6 / 1 | モーダル・印刷 |

### 6.1 実測で確認した切替挙動

| 幅 | ヘッダー | トップのレイアウト |
| --- | --- | --- |
| 1500px | ヘッダー高 110、ハンバーガー幅 0、PCナビ幅 648、main padding-top 140px、footer padding-left 80px | PCレイアウト(Hero_)のまま。scrollWidth 1500 |
| 1440px | ヘッダー高 110、ハンバーガー幅 0、PCナビ幅 648、main padding-top 140px、footer padding-left 80px | PCレイアウト(Hero_)のまま。scrollWidth 1440 |
| 1301px | ヘッダー高 110、ハンバーガー幅 0、PCナビ幅 648、main padding-top 140px、footer padding-left 80px | PCレイアウト(Hero_)のまま。scrollWidth 1320 |
| 1300px | ヘッダー高 110、ハンバーガー幅 70、PCナビ幅 0、main padding-top 140px、footer padding-left 20px | PCレイアウト(Hero_)のまま。scrollWidth 1320 |
| 1000px | ヘッダー高 68、ハンバーガー幅 70、PCナビ幅 0、main padding-top 103px、footer padding-left 20px | PCレイアウト(Hero_)のまま。scrollWidth 1320 |
| 769px | ヘッダー高 68、ハンバーガー幅 70、PCナビ幅 0、main padding-top 103px、footer padding-left 20px | PCレイアウト(Hero_)のまま。scrollWidth 1320 |
| 768px | ヘッダー高 68、ハンバーガー幅 50、PCナビ幅 0、main padding-top 108px、footer padding-left 20px | PCレイアウト(Hero_)のまま。scrollWidth 1320 |
| 390px | ヘッダー高 68、ハンバーガー幅 50、PCナビ幅 0、main padding-top 108px、footer padding-left 20px | PCレイアウト(Hero_)のまま。scrollWidth 1320 |

- 幅 600〜1301px でホーム(PC UA)を**再読込して**計測しても Hero_ のまま(Kv_ は出ない)。SP レイアウトは UA 判定による別ツリー(フレームワーク仕様: サーバー側 UA 分岐)。
- /products/scan・/faq・/article は 800px で横スクロールなし(CSS 追従)。
- 参考: SP の `isMobile` コンテキストでの実測値は本書 §2〜5 の「SP」列。

## 7. モーション

### 7.1 CSS 宣言の頻出値(配信CSS 59 ファイル静的集計)

- transition(上位): `opacity .2s ease`×24, `none`×18, `opacity .2s`×12, `all .3s ease`×11, `all .2s`×11, `transform .3s ease`×10, `all .2s ease`×8, `opacity .6s ease`×5, `background-color .2s ease`×5, `.24s`×4, `filter .2s ease`×4, `opacity .15s ease`×3
- duration(出現数): .2s×102, .3s×42, .6s×14, .5s×11, .15s×6, 1s×6, .8s×4, .24s×4, .35s×3, 40s×2
- easing: linear×275, ease×118, ease-out×23, ease-in-out×18, cubic-bezier(.22,1,.36,1)×4。サイト固有と思われる cubic-bezier: `.6s cubic-bezier(.22,1,.36,1)`(transition 2 宣言、用途は未特定)。他の cubic-bezier は Vimeo player / 外部由来と推定。

### 7.2 トップで実際に計算されている transition / animation(実測、要素数)

- transition(PC): `color 0.2s ease 0s`×62 / `opacity 0.2s ease 0s`×61 / `transform 0.3s ease 0s`×18 / `filter 0.2s ease 0s`×8 / `all 0.3s ease 0s`×8 / `transform, opacity 0.4s, 0.4s ease, ease 0s, 0s`×6 / `transform 0.3s ease-in-out 0s`×5 / `transform, opacity 1s, 1s ease-in-out, ease-in-out 0s, 0s`×5 / `transform 0.2s linear 0s`×5 / `opacity, transform, visibility 0.25s, 0.25s, 0.25s ease, ease, ease 0s, 0s, 0s`×3
- animation: `SecondGlobalNavigation_slideDown 0.5s ease-out 1 0s`×5 / `(sp) EarlyDetectionCases_marquee-photos 25s linear infinite 0s`×1 / `(sp) EarlyDetectionCases_marquee-cards 12.6s linear infinite 0s`×1

標準値: **.2s ease**(color / opacity / filter / background-color / box-shadow の hover)、**.3s ease**(transform / scan 旧 Button の all)、.4s ease(カルーセル transform+opacity)、.7s ease-out(入場フェード: opacity+transform、stagger delay 0 / .12 / .24 / .36s)、1s ease-in-out(ヘッダー transform+opacity 宣言)。

### 7.3 @keyframes(サイト固有、31 本)

EarlyCancerDetectionSection_fadeIn, EarlyCancerDetectionSection_scrollLeft, toggleOnCheckbox, toggleOnRadio, layout_spin, copyFadeIn, RequestFormsTable_spin, HeaderInformationBar_slotRollUp, HeaderInformationBar_slotRollOut, QrAutofill_reader_spin, checkbox_toggleOnCheckbox, checkbox_toggleOnRadio, page_spin, ExitIntentPopupBanner_fadeIn, ExitIntentPopupBanner_slideUp, AppliedCouponPopup_overlay_in, AppliedCouponPopup_dialog_in, shared_slide-in, Step4ConfirmPanel_premium_sk_pulse, HeroBanner_fadeInUp, AddToCartModalView_scrollDown, KwSection_CmModal_fadeIn, ProductPageHeader_fadeInSlideIn, InfinityPhotoScroller_scrollLeft, splide-loading, SecondGlobalNavigation_slideDown, SupportFloatingBanner_floating, TaidanIntro_fadeIn, VideoGallery_fadeIn, EarlyDetectionCases_marquee-photos, EarlyDetectionCases_marquee-cards。加えて Bootstrap(progress-bar-stripes, spinner-border, spinner-grow)と Vimeo player 由来(LikeButton/ShareButton/Spinner/ShareSheet 等)がある。

ホームで実際に動くもの: `SecondGlobalNavigation_slideDown` .5s ease-out 1回、`EarlyDetectionCases_marquee-photos` 25s linear infinite、`EarlyDetectionCases_marquee-cards` 12.6s linear infinite(SP の計測で検出。PC の計測では検出されず)。

### 7.4 hover パターン(ホーム実測)

| 対象 | 変化 | transition |
| --- | --- | --- |
| 主CTA(グラデ) | background-image を `(135deg,#FF5C00,#FA8544)` → `(135deg,#E44912,#F56B1F)` | ホーム: all 0s(即時)、scan Button_cv: all .3s ease |
| 副ボタン/テキストリンク | color・border-color #1F7BB8 → #0063AC | all 0s(即時) |
| ナビ/カード/News/フッターリンク | filter: brightness(.85) | filter .2s ease |
| ヘッダータブ/フッターボタン/LINEボタン | opacity 1→.7(LINEは .85) + brightness(.85) | opacity .2s ease |
| CMボタン | bg #FFFFFF → #E1EBF2 + box-shadow `0 4px 12px rgba(0,0,0,.24)` | box-shadow, background-color .2s ease |
| 特設サイトボタン | bg 透明 → rgba(255,255,255,.12) | background-color .2s ease |
| FAQ 行(/faq) | 文字色 #646464 → #004380 | color .2s ease |
| article 青ボタン | bg/文字色反転 | all .3s ease |

スクロール演出: 入場フェード(opacity/transform .7s ease-out、stagger 0.12s 刻み)は計測時の transition として確認。IntersectionObserver 系の詳細(発火閾値)は視覚担当領域のため未計測。

## 8. アイコン・画像

- **画像配信**: 写真は next/image(`/_next/image?url=…&w=16〜3840&q=75`)経由で **AVIF**(Content-Type image/avif、ホームPC 44 本 / SP 46 本)。静的素材(CloudFront d1sjb8j5vfrz9p.cloudfront.net/static_pages/…)は **webp**(ロゴ `logo.webp` 1127x240 → 表示 230x49、パッケージ `pkg_scan_front-220.webp` 等)と **avif**(hero: `top2026/pc/hero-1512.avif` / `hero-3024.avif` を 1x/2x の srcset、LCP 用 preload fetchPriority=high)。ロゴ・統計・矢印・アイコンは **SVG**(ホームで 約 44 本)。元素材は png/webp/jpg。動画は webm + Vimeo player。
- **img の角丸**: 0px が 457 件、8px が 10 件、50% が 18 件(写真は直角が基調)。
- **アイコン寸法(img/svg の表示サイズ)**: 12x6 / 12x12(矢印・開閉)、15x12(LINE矢印)、16x16 / 18x18(Benefits_detailLinkIcon)、20x20(カレンダー)、24x24(Faq_icon svg / slider arrow icon / フッターリンクアイコン)、24x19、28x28(電話・カート)、30x16、32x32、44x44(閉じるボタン)、72x72(スライダー矢印の円)。
- **stroke 幅(インライン SVG、全ページ計測)**: 1.5px(round 70 / butt 12)が主、1px butt 4、2px 4、0.611px(SP スケール)等。**線アイコンは 1.5px 基調**。
- アイコン色: #1F7BB8(fill/stroke の最多)、#FFFFFF(濃色面上)、#646464、#B8B8B8、#D9D9D9。
- 角丸・丸ボタン: Doctors/Media 矢印は 72px 円、閉じるは 44x44(FloatingBanners_closeButton)。

## 9. 技術

| 項目 | 実測 |
| --- | --- |
| フレームワーク | Next.js(App Router、`/_next/static/chunks/app/(root)/page-*.js`)。UA によるサーバー側 PC/SP コンポーネント分岐(トップ) |
| スタイル | **CSS Modules**(`Component_name__hash5`、Sass 展開済みと推定)。**Tailwind なし**(`--tw-*` 0 件)。**Bootstrap 5 の一部**(btn/modal/table/alert/spinner/pagination、`--bs-*`)を同梱 |
| トークン | `--ds-*` 58 個(新設中の design system 層)+ Figma 由来 `var(--blue-blue-1001-f-7-bb-8,#1f7bb8)` 形式の旧層。大半は HEX 直書き |
| CSS ファイル構成 | トップだけで 26 本、5 ページ合計 59 本(約 2.8MB、うち ~100KB の共通チャンクがページごと重複)。配信は CloudFront(`/_next/static/css/<hash>.css`) |
| ライブラリ | Splide(カルーセル)、react-calendar、Vimeo player(player.vimeo.com)、Paidy(分割払い表示。SF Pro JP 由来)、Cloudflare Turnstile、Sentry、GTM/Klaviyo/TikTok/LinkedIn/Clarity 等の計測タグ |
| フォント | Google Fonts(<link> 直指定、display=swap)。10 ファミリーを要求し 5 つがロード |

## 10. 取得できなかった・限定的な項目 / 注意

- **表(table)**: 計測ページに存在せず 0 件(未確認ではなく不在)。
- **フォームのエラー状態**: 空 blur では表示されず未取得(送信は禁止のため未実施)。送信ボタンは入力前の disabled 状態のみ実測。
- **:focus-visible / :active / :disabled の hover 以外の状態**: フォーカスは input のみ確認(Chromium 既定 outline)。ボタンの :active / :focus-visible は未計測。
- **SP の hover**: タッチ環境のため未計測(`(hover:hover)` クエリ 37 ルールで PC のみ装飾と推定)。
- **スクロール連動アニメの閾値・タイミング**: 視覚/動き担当の領域。ここでは computed transition/animation の宣言値のみ。
- **SP 側 `/` の一部コンポーネント**(PurchaseCta 以外の AboutPart2 見出し、フッター開閉前の列など)は 0x0 非表示のため未取得(SP は `Cta_/AboutPart*_/Benefits_card` 等クラス名が PC と異なる)。
- **PC 幅 <1320px のトップ**: PC レイアウトは横スクロール(実測)。タブレット実機の UA でのレイアウトは未計測。
- **色の頻度**: 隠れスライド(カルーセル画面外)や opacity 0 の祖先配下も含む場合がある。面積は bounding box であり重なり・クリップは考慮しない(丸め: 万px²単位)。
- **推定**: タイプスケールの「+2px 刻み/見出し専用帯」解釈、4/8px スケール、SP の Sass 展開、ds トークンの採用範囲は実測値からの推定。
- 第三者ウィジェット(Paidy: SF Pro JP / Avenir Next、Vimeo player、Cloudflare)の表示はサイトのデザイン値ではないため除外して解釈した。

## 付録: 生データ

- `tokens/colors.json` … --ds-* 全 58 個、Figma var フォールバック、色別集計(text/background/border/shadow/svg × PC/SP)、グラデーション、コントラスト表
- `tokens/typography.json` … フォント配信/ロード、全スタック、サイズヒストグラム、ページ別タプル(上位80)
- `tokens/spacing.json` … セクション padding、コンテナ、padding/margin/gap ヒストグラム、見出し/ブロック間隔実測、幅別ヘッダー挙動
- `tokens/shape.json` … radius / border / box-shadow / text-shadow(PC/SP)
- `tokens/components.json` … 主要コンポーネント(ホーム PC/SP、scan、faq、article、commitment)の computed と hover 差分、ヘッダースクロール状態、SPメニュー、FAQ 開閉、/contact フォーム
- `tokens/media-queries.json` … 全 @media と幅条件、実測の切替挙動
- `tokens/motion.json` … transition/animation/keyframes と hover パターン
- `tokens/icons-images.json` / `tokens/tech.json`
