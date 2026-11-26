# 日本のLPギャラリー調査 — ヒーロー画像UI（TELEMO 向け）

- 調査日: 2026-10-12 21:05〜（JST）／担当: 日本のギャラリー（lp.webdesignclip.com ほか）
- 撮影: **62 サイト**（うち失敗・到達不可 3）／ 観察ノート作成: **28 サイト**（スコア4以上 22、スコア3以下 6）／ 残りは閲覧のみ（下記）
- 画像: `output/hero-research/shots/`（各サイト `<slug>-pc-f0/f1/f2.jpg`・`-pc-scroll.jpg`・`-sp.jpg`・`<slug>.meta.json`）
- 詳細（レイアウト・写真処理・書体・CTA・動き・SP・TELEMO 転用案）: `jp-galleries.json`
- 書き方の基準: 画像を見て確認できたことだけを記載。f0/f1/scroll を見ていない項目は『未確認』『unknown』と明記。スコアは『TELEMO（白×ティール、働く人の写真＋実HTML）への転用価値と表現の秀逸さ』の5段階。

## 巡回したギャラリー

| ギャラリー | 結果 | 実サイトURLの抽出数 | 撮影に使った件数 |
|---|---|---|---|
| lp.webdesignclip.com | トップ、カテゴリ（ビジネス・会社／採用サイト／情報・WEBサービス）、タグ（ビジネス）の一覧を巡回。一覧に実サイトURLが直接載る | 約83（重複含む） | 29 |
| muuuuu.org | トップ1ページから抽出（実サイトへ直リンク） | 約98 | 21 |
| sankoudesign.com | トップから抽出 | 19 | 6 |
| io3000.com | トップから抽出 | 24 | 6 |
| 81-web.com | トップから抽出 | 27 | 9 |
| bookma.org | 別ドメイン（駐車ページ）へリダイレクトされ、ギャラリーとして機能せず → 不採用 | 0 | 0 |
| rdlp.jp/lp-archive/ | 一覧は内部の絞り込みリンクのみで外部URLが取れず（総数46,445件の表示あり）。詳細経由の抽出は時間内に行わず → 不採用 | 0 | 0 |
| lp-web.com | BtoB・求人の一覧は取れたが、詳細ページに実サイトへのリンクがなくスクショのみ → 不採用 | 0 | 0 |

※ 『撮影に使った件数』は複数ギャラリーに載るサイトを重複して数えている。除外指定のサイト（elixir, financial-japan, haagen-dazs, many-people, misignal, stripe, sunshine-autumn, zendesk, aevion, flite, radian, autonomous, kingjim-mark, rig, balmuda）は撮影していない。

## サイト一覧（スコア4以上: 22件）

| 点 | サイト | URL | 型 | 一言 |
|---|---|---|---|---|
| 5 | ウェアラ（ユニフォームレンタル）手取りLP | https://www.weara.co.jp/tedori/ | full-bleed-photo | 作業現場の全面写真に、不透明な白/黒の帯ラベルで見出しを貼る（スクリム不要）。右に円形の実績バッジ3つ。 |
| 5 | ギフティグループ コーポレートサイト | https://giftee-group.com/ | typographic-with-small-image | 白地に180〜270pxの社員写真タイルをゆっくり漂わせ、見出しを主役に。一時停止ボタン付き。 |
| 5 | Wantedly コーポレートサイト | https://wantedlyinc.com/ | full-bleed-photo | 角丸の全面写真カードに、人物に重なる大きな白見出し。写真サムネ付きの採用チップと浮遊ナビ。 |
| 5 | VESSEL（ヴェゼル株式会社） | https://vessel-for.jp/ | full-bleed-photo | 屋上を歩く5人の写真の下端をティールの波形で切り、曲線に沿う見出し。次セクションが同色で地続き。 |
| 5 | UNION TEC（ユニオンテック） | https://www.union-tec.jp/ | other | 巨大ワードマークの『O』がピル型の写真窓になり、スクロールで楕円に変形して本文へ。 |
| 5 | DMJ（デジタルマーケティングジャパン）採用サイト | https://dmj-japan.co.jp/recruit/ | full-bleed-photo | 社員4人の縦カラム（モノクロ＋下から赤グラデ）に大見出しを重ね、スクロールで写真がぼけて次のコピーへ。 |
| 5 | クレア・ライフ・パートナーズ 採用サイト | https://crea-lp.com/recruit/ | collage-grid | 人物を黄のデュオトーン化し、階段状の角丸バーに切り抜く。下端固定のピルナビ。 |
| 5 | Career Kikkake（キャリア支援） | https://agent.kikkake.cc/ | full-bleed-photo | 白×ティールのハイキー写真。左を白へフェードして文字を載せ、強調語にミントのマーカー帯、追従pill CTA。 |
| 5 | 自由が丘クリニック ドクターズコスメティクス 採用（ルート営業） | https://jcdc.co.jp/recruit/01/ | framed-image-card | ティール方眼の角丸パネルに切り抜き人物、縦書きの大文字を人物の前後に挟む。ロゴ/CTAはパネルのノッチ。 |
| 4 | LANDIC 採用サイト | https://www.landic.com/recruit/ | framed-image-card | 見出しは写真の上、写真は文字を載せない額縁。ナビはヒーロー下端。ローダー→1文字ずつの見出し。 |
| 4 | らくしふ by SmartHR | https://rakushifu.jp/ | split-text-image | 笑顔のスタッフ写真の縁を白にフェードし、製品画面モックを重ねる。黄の大きなCTAと下端固定バー。 |
| 4 | Somali（ソマリ）ハイクラス転職 LP | https://somali.co.jp/lp01/ | other | ブロブ形にマスクした写真を左右に置き、中央に大きな明朝見出し。実績バッジを写真に重ねる。 |
| 4 | Indeed CM特設『いい未来は探せる』 | https://jp.indeed.com/cm/iimirai | full-bleed-photo | 顔を大きくクロップし、中央の空きに検索UI。PCは左右、SPは上下に回転。背景が本文まで地続き。 |
| 4 | Benesse DIGITAL TRANSFORMATION『INNOVATION CATALYST』 | https://www.benesse.co.jp/digital/ | framed-image-card | 写真フレームを大見出しがはみ出し、白帯ブロックで可読性を確保。後続写真にも同じネオングラデ。 |
| 4 | TVer 採用サイト | https://recruit.tver.co.jp/ | collage-grid | 巨大欧文＋手書き1語（描線アニメ）、直下から角丸の人物写真マソンリー。 |
| 4 | SmartHR 採用サイト | https://recruit.smarthr.co.jp/ | other | 写真なし。白ラベル見出し＋ディザのグラデ＋画面端に接する直角2連CTA。 |
| 4 | 越前信用金庫 採用サイト | https://www.shinkin.co.jp/echishin/recruit/ | collage-grid | 白縁の切り抜き職員ステッカーを珊瑚色の地に散らすコラージュ。巨大 RECRUIT 文字。 |
| 4 | JR西日本電気システム 採用サイト | https://www.j-nesco.com/recruit/ | collage-grid | 六角形マスクの写真＋六角CTA＋方眼紙背景＋線画。形をシステム化。 |
| 4 | 日本新薬 新卒採用サイト | https://www.nippon-shinyaku.co.jp/recruit/ | framed-image-card | 角丸フレーム＋白いベール＋縦書き明朝がタイプイン。写真はクロスフェード。ロゴの白タブが写真に食い込む。 |
| 4 | bright avenue（ブライトアベニュー） | https://bright-avenue.jp/ | full-bleed-video | ローダーの小写真→全面映像→スクロールで写真コラージュに分解。巨大ワードマークが物体の背後に回る。 |
| 4 | デジタルハリウッド 採用情報 | https://www.dhw.co.jp/jobs/2024/ | full-bleed-photo | 写真の右側だけに方向性スクリムを掛けて右に文字。SPの3秒時点は受話器を持つ女性の写真。 |
| 4 | unrep（アンレップ）WordPressテーマ | https://unrep.jp/ | other | 課題チップが2段で流れ続け、黒い吹き出し『コレ、解決出来ます』で答える。写真なし。 |

## サイト一覧（参考・スコア3以下: 6件）

| 点 | サイト | URL | 型 | 一言 |
|---|---|---|---|---|
| 3 | ビジネスラップ produced by ロックオン柳田 | https://bizrap.jp/ | full-bleed-video | 動画に吹き出し5つ＋下部固定の2分割pill CTA。 |
| 3 | TREND 3D フルカラー3Dプリント | https://trend-3d.com/lp/ | full-bleed-video | ローダー→暗幕の全面映像＋細字見出し。右下に Full Movie チップ。 |
| 3 | MABATAKI（株式会社マバタキ） | https://mabataki.jp/ | full-bleed-video | 映像の上に採用チップ2つ・再生ボタン、最下部にティッカーバー。 |
| 3 | SmartHR 10th Anniversary | https://smarthr.jp/smarthr-10th-anniversary/ | illustration | スクロールで円が膨らみ縦書き見出しが出る。人の顔は楕円マスクの Pickup カードのみ。 |
| 3 | DENTSU DATA SCIENCE INTERNSHIP 2026 | https://www.career.dentsu.jp/intern/ds/2026/ | other | 右下だけ大きく丸い白パネルで映像を窓にする。見出し文字にグラデ。 |
| 3 | CANaYELL（カナエル） | https://www.can-a-yell.jp/ | device-mockup | CTAの上辺に黄色のミニラベル『3分でわかる』等を重ねる。手持ちスマホの3D。 |

## TELEMO に効きそうなヒーローUIアイデア トップ5

前提: TELEMO は白地＋ティール(#007d8c)のフラット、ヒーローはコールセンターで働く人の写真（動画）に実HTMLの見出し・リード・ボタンを重ねる構成。

### 1. 暗いスクリムを使わず、白ベール＋左寄せの文字にする（ハイキー写真）
- 根拠: `agent-kikkake-cc`（写真の左が白へ溶け、強調語にミントのマーカー帯、追従pill CTA）、`rakushifu-jp`（人物の縁を白にフェードして製品画面を重ねる）、`dhw-co-jp-jobs-2024`（文字側だけに方向性スクリム、SPの3秒時点は受話器を持つ女性の写真）
- 案: 写真の上に白→透明の横グラデを重ねて見出し・リード・ボタンを左寄せ。強調語だけ #007d8c、その下に薄いミントのマーカー帯。SPは上=写真、下=白ベール→文字。写真が濁らず、白基調の LP と継ぎ目が出ない。

### 2. 見出しを『不透明な帯ラベル』にして写真へ貼る（スクリム不要、顔は避ける）
- 根拠: `weara-co-jp-tedori`（白帯＋黒文字／黒帯＋白文字、円形の実績バッジ3つ）、`recruit-smarthr-co-jp`（白ラベル見出し、画面端に接する直角2連CTA）、`wantedlyinc-com`（顔を外し、人物の胴体に白い大見出しを重ねる）
- 案: 見出し各行を白（または #007d8c）の帯ラベルにして写真の左下に載せ、右に円形バッジで実績（導入社数・稼働時間など）を3つ縦に並べる。ドキュメンタリー風の色味を落とさずに可読性を確保できる。

### 3. 写真の下端をティールの波形（色面）で切り、次セクションへ色で地続きにする
- 根拠: `vessel-for-jp`（波形のティール面に見出しが曲線で走り、次セクションも同色）、`jp-indeed-com-iimirai`（写真の青がそのまま本文背景へ）、`shinkin-co-jp-echishin-recruit`（同じ背景色が下のセクションまで続く）、`jcdc-co-jp-recruit`（ロゴ/CTA のノッチ付き角丸パネル）
- 案: 写真の下端20〜25%を #007d8c の波形（または斜め）で覆い、そこに白文字のコピーとボタンを置く。次セクションの背景も同じティールにして、ヒーローから本文へ色で繋ぐ。

### 4. 人物写真をティール1色のデュオトーンにして、縦長の角丸バー/カラムに切り抜く
- 根拠: `crea-lp-com-recruit`（黄のデュオトーン、階段状の角丸バーに写真バーと無地バーを混在）、`dmj-japan-co-jp-recruit`（モノクロ＋下から赤グラデの縦カラム4分割、スクロールで写真がぼけて次のコピーへ）
- 案: オペレーター3〜4人をティールのデュオトーンで縦長の角丸バーにして右肩上がりに並べる（成果が伸びる図形）。写真が足りなくても無地ティールのバーで成立。スクロールで写真をぼかし暗くして次のコピーへ切り替える。

### 5. 白地で文字を主役にし、小さな人物写真タイル（または角丸カードのマソンリー）で『人』を足す
- 根拠: `giftee-group-com`（180〜270pxの社員写真タイルがゆっくり左へ漂う、一時停止ボタン）、`recruit-tver-co-jp`（下1/3が角丸の人物写真マソンリー）、`landic-com-recruit`（見出しは写真の外、写真に文字を載せない額縁）
- 案: 現在の白×ティール基調を保ち、見出しとボタンの周囲に現場写真の小タイルを3〜5枚置く（角丸約6px・影なし）。大きな写真を置かないので、実HTMLの見出しとCTAが主役になる。

### 次点（ヒーロー内の部品として使えるもの）
- ロゴ文字の1文字を写真窓にして、スクロールで楕円へ変形: `union-tec-jp`／ローダーの小写真→全面→スクロールで写真コラージュ: `bright-avenue-jp`
- 課題チップを2段のマーキーで流し、『解決できます』の吹き出しで答える: `unrep-jp`
- CTA: 追従pill＋『完全無料｜30秒で完了』タグ（`agent-kikkake-cc`）／下端固定の2分割（`bizrap-jp`、`jcdc-co-jp-recruit` のSP）／画面端に接する直角2連（`recruit-smarthr-co-jp`）／CTA上辺のミニラベル（`can-a-yell-jp`）

## 横断で見えたこと（今回の注釈サイトの範囲）

- 人物写真を主役にした事例の多くは、全面を暗くするより、白ベール・帯ラベル・色面（波/パネル）・切り抜きで文字の面を作っている（`agent-kikkake-cc`、`weara-co-jp-tedori`、`vessel-for-jp`、`jcdc-co-jp-recruit`、`shinkin-co-jp-echishin-recruit`）。
- 写真に文字を載せない構成（`landic-com-recruit`）や、顔を避けて胴体に重ねる構成（`wantedlyinc-com`、`dmj-japan-co-jp-recruit`）が、人物の表情を残すために使われている。
- ローダーを挟んでから本編を出す構成が7件で確認できた（`landic-com-recruit`、`union-tec-jp`、`bright-avenue-jp`、`dhw-co-jp-jobs-2024`、`crea-lp-com-recruit`、`wantedlyinc-com`、`trend-3d-com-lp`）。見出しの1文字ずつの出現（`landic-com-recruit`、`nippon-shinyaku-co-jp-recruit`）や手書きの描線（`recruit-tver-co-jp`）が組み合わされる。
- スクロール連動で写真が形を変える・ぼける事例: `union-tec-jp`（窓が楕円へ）、`bright-avenue-jp`（コラージュへ）、`dmj-japan-co-jp-recruit`（ぼかし＋暗幕）、`smarthr-jp-smarthr-10th-anniversary`（円が拡大）。
- SP では、構成そのものを回転して並べ直す事例（`jp-indeed-com-iimirai`：左右→上下）、下端固定の2分割CTAにする事例（`bizrap-jp`、`jcdc-co-jp-recruit`）がある。`dhw-co-jp-jobs-2024` は3秒時点で PC の6秒時点と別の写真（受話器を持つ女性）が出ているが、SP専用画像かスライドかは未確認。
- 書体: 明朝系の見出し（`landic-com-recruit`、`somali-co-jp-lp01`、`crea-lp-com-recruit`、`nippon-shinyaku-co-jp-recruit`）、縦書き（`nippon-shinyaku-co-jp-recruit`、`jcdc-co-jp-recruit`、`dmj-japan-co-jp-recruit` のスクロール後）、極太ゴシック（`weara-co-jp-tedori`、`recruit-smarthr-co-jp`）が目立つ。

## 撮影したが注釈を書いていないサイト（閲覧のみ・失敗を含む）

| slug | メモ |
|---|---|
| `basec-co-jp-recruit-support` | イラスト型の採用支援LP（f2/SP/scroll 閲覧。ヘッダの白カプセルと、スクロール後に右下へ出る追従CTAのみ記録）。 |
| `recruit-serendip-tec-com` | 【失敗】404 Not Found（www 付きURLでドメイン未登録）。 |
| `recruit-zoccon-me` | 絵文字・文字ノイズの canvas とキャラクター画。表現過多で TELEMO には不向き（f2 のみ閲覧）。 |
| `about-miroom-com` | 巨大欧文見出し＋色ドットが乗るロゴ型タイポ。写真なし（f2/SP 閲覧）。 |
| `info-monex-co-jp-introduction` | 黄色の角丸インセットカード内の手描きイラスト（f2 のみ閲覧）。 |
| `goodpatch-com-ja` | 全面 WebGL（青い3D立体）。6秒時点で見出しが見えず（f1/f2/SP 閲覧）。 |
| `upforward-co-jp` | 写真なし。スプレー質感の矢印＋縦書きコピー＋橙pill CTA（f2/SP 閲覧）。 |
| `stylem-co-jp` | 写真なし。色糸の束が見出しを横切る canvas（f2/SP 閲覧）。 |
| `we-being-net` | パステルの球体の動画。写真なし（f2 のみ）。 |
| `open-rise-jp` | 建築レンダリングの全面画像＋明朝ロゴ（f2 のみ）。 |
| `recruit-diversity-jreast-co-jp` | 角丸インセットカード内のイラスト、左上に緑のロゴ用ノッチ、右に進行ドットと停止ボタン（f2 のみ）。 |
| `tbwahakuhodo-co-jp` | 映像の上に巨大な白い欧文が繰り返し配置される（f2 のみ）。 |
| `campaign-facilo-jp-series-b` | 6秒時点では色面の読み込み表示のみで内容は不明（f2 のみ）。 |
| `corporate-iiba-space-career` | カラフルなブロブ＋極太見出し。写真なし（f2 のみ）。 |
| `talknote-com` | 青地に PC/スマホのモック＋黄/白の2CTA（f2 のみ）。 |
| `recruiting-forkwell-com` | 【失敗】Bot 確認画面（Confirm you are human）で本体に到達できず。 |
| `simpleform-co-jp` | 見出しを上、グラフィックを下に置く構成（f2 のみ）。 |
| `nsl-jp` | イラスト型（f2 のみ）。 |
| `corp-aniera-jp` | 雲形マスクのイラスト型（f2 のみ）。 |
| `bestie-sports-co-jp` | 動画枠が6秒時点で未表示（暗い角丸カード）＋極太見出し（f2 のみ）。 |
| `tyo-co-jp-recruit` | 3Dキャラ映像の下端に巨大なオレンジ欧文見出し（f2 のみ）。 |
| `rgf-professional-jp` | 6秒時点でも白地に『Unleash Potential』のローダー表示で内容は不明（f2 のみ）。 |
| `shimakawa-co-jp` | 青の抽象背景＋右端の縦CTAタブ2つ（f2 のみ）。 |
| `recruit-kyushokuou-com` | 漫画風の加工写真＋巨大 RECRUIT のマーキー（f2 のみ）。 |
| `asuzacgroup-jp-recruit-highschool` | イラスト型（黄地、ジャンプする作業員）（f2 のみ）。 |
| `e-daikoku-com-recruit` | イラストのオープニング（SKIP 付き）で本体未確認（f2 のみ）。 |
| `itszai-jp` | 製品画面に、顔アイコン付きの応募通知カードが重なる（f2 のみ）。 |
| `furazoa-com-recruit` | 暗い背景のタイポ中心＋ライムの強調と Entry（f2 のみ）。 |
| `alice-welfare-jp` | 【失敗】DNS 解決不可（ERR_NAME_NOT_RESOLVED）。 |
| `promotion-cast-com-lp02` | 切り抜き人物＋フィルムストリップ状の写真帯、黄→青グラデ（f2 のみ）。 |
| `linket-jp` | 製品モック型（f2 のみ）。 |
| `ocl-ai-jp` | 製品モック型。CTA上に『1分でカンタン無料登録！』のミニラベル（f2 のみ）。 |
| `unite-yapp-li` | 右に資料請求フォームを置くヒーロー、写真モザイクの U 字マスク（f2 のみ）。 |
| `shinwatsushin-com-lp-hanbaikanri` | 製品画面モック型（f2 のみ）。 |

## 制約・未確認

- 撮影はヘッドレス Chrome（1440×900／390×844）。Cookie バナー等は自動で閉じられない場合があり、SP の一部画像で下部が覆われている（`nippon-shinyaku-co-jp-recruit`、`stylem-co-jp` など）。
- 動画は再生状態を meta.json の `videos[].playing` で確認できたものだけ『再生中』と書いた。再生状態が false のものは、静止画か動画かを unknown とした（`landic-com-recruit`、`union-tec-jp`、`wantedlyinc-com`）。
- 動きは f0(0.8s)/f1(3s)/f2(6s) と 700px スクロール後の静止画の比較でのみ判断。ホバーや連続スクロール中の挙動は見ていない。
- 色コードや px は、meta.json にあるものを除き、スクショからの目測（『約』『系』と表記）。
