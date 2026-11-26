# グローバルLPギャラリー調査：ヒーロー画像UI（海外ギャラリー担当）

調査日: 2026-10-12 / 目的: TELEMO（GIGUUU社・AI電話営業／コールセンター向けB2B）のヒーロー（写真・動画＋実HTMLの見出し・CTA）に転用できる、画像のUIとしての扱い方を海外ギャラリー掲載サイトから集める。

- JSON（機械可読・20件）: `output/hero-research/notes/global-galleries.json`
- 画像: `output/hero-research/shots/<slug>-pc-f0/f1/f2.jpg`（1440×900・0.8s/3s/6s後）、`-pc-scroll.jpg`（700pxスクロール後）、`-sp.jpg`（390×844）、`<slug>.meta.json`

## 1. 巡回したギャラリーと件数

| ギャラリー | 見たページ | 外部URLの取り方 | 抽出した外部サイト数※ | キャプチャ数 | 掲載 |
|---|---|---|---:|---:|---:|
| land-book.com | トップ／?sort=recommended&from=year／/design/landing-page?sort=recommended&from=year／?sort=like&from=month | 一覧に外部URL（?ref=land-book.com）が直接出る | 59 | 18 | 9 |
| lapa.ninja | トップ／/category/saas/／/category/business/ | 一覧に外部URL（?ref=lapaninja）が直接出る | 65 | 16 | 2 |
| saaslandingpage.com | トップ（/category/ai/ は404） | 『Visit Website』リンクから外部URLを取得 | 11 | 5 | 2 |
| onepagelove.com | トップ | 『Launch website』リンクから外部URLを取得 | 16 | 3 | 0 |
| godly.website | トップ | recent.design に移行しており投稿ページ（/i/…）のリンクのみ。外部URLを直接取れず飛ばした | 0 | 0 | 0 |
| siteinspire.com | トップ | 『Visit … website』リンクから取得 | 39 | 2 | 1 |
| minimal.gallery | トップ／/tag/saas/／/tag/consulting/ | 一覧に外部URL（?ref=minimal.gallery）が直接出る | 60 | 5 | 1 |
| httpster.net | トップ／/style/photographic/／/type/application-or-software/ | 『Visit』リンクから取得 | 269 | 19 | 5 |
| awwwards.com | /websites/ 一覧（ブロックはされず表示できた） | 詳細ページ経由の外部URL抽出は時間の都合で未実施。一覧に出ていた1件のみ使用 | - | 1 | 0 |
| cssdesignawards.com | トップ | 一覧に外部URLが直接出る | 14 | 1 | 0 |

※ ユニークドメイン数（既存の除外サイトを除く）。ページを足すほど増えるため、網羅数ではなく取り出せた母数。

- キャプチャ総数 **70 件**（観察できた 65 件／観察不能 5 件）。うち掲載 **20 件**（質優先で絞り込み。写真・動画ヒーロー中心に、対比用のタイポ主体2件を含む）。

## 2. 掲載サイト（20件、点数順）

点数は『TELEMOのヒーロー画像UI研究への示唆の大きさ』（5=人物写真/動画＋文字の重ね方＋動きが秀逸で転用しやすい）。

| # | サイト | ギャラリー | 型 | 点 | 一言 |
|---:|---|---|---|---:|---|
| 1 | [Clarion](https://www.clarionhealth.com/) | land-book.com | full-bleed-photo | 5 | 受話器を持つ女性の全面写真。顔の下だけ濃いティールに落とし、中央に見出し＋CTA2段（デモ予約／マイク付き『Try it out』）。 |
| 2 | [Parloa](https://www.parloa.com/) | land-book.com | full-bleed-video | 5 | 人物動画を全面に敷き、左下にセリフ見出し。右下に半透明ガラスの通話チャット（『Resolved • 46 sec』）を重ねる。 |
| 3 | [Lightship](https://www.lightshiprv.com/) | land-book.com | full-bleed-video | 5 | 角丸の額縁付き全面動画。多角形マスクが開く入場、見出しを被写体の左右に振り分け、直後に人物写真コラージュ。 |
| 4 | [Hakuhodo DY ONE Recruit Site](https://recruit.hakuhodody-one.co.jp/) | httpster.net | collage-grid | 5 | 同トーンの社員ポートレートを2段の逆方向マーキーで流し、中央を極太コピーが貫通。縦スリットから開く登場。 |
| 5 | [Oscar](https://www.hioscar.com/) | saaslandingpage.com | full-bleed-photo | 5 | 家族の全面写真に大きなセリフ見出し。スクロールで写真が角丸カードに縮み、別写真が扇状に覗く。 |
| 6 | [Wonderful](https://www.wonderful.ai/) | land-book.com | full-bleed-video | 4 | 全面の映像モンタージュ。見出しを左下、リード＋CTA2つを右下に分けて中央を空ける。 |
| 7 | [Giga](https://giga.ai/) | land-book.com | device-mockup | 4 | 写真なし。ヒーロー自体を『TALK』ボタン付きの音声デモ筐体にし、WebGLグラデの上に載せる。 |
| 8 | [Anam](https://anam.ai/) | land-book.com | slider-carousel | 4 | 白地に見出し＋CTA、直下に人物カードのカルーセル。中央の1枚だけ動画で『Talk with Mia』ピルを重ねる。 |
| 9 | [Overpass](https://www.overpass.com/) | httpster.net | split-text-image | 4 | 左に白地の見出し＋メール入力、右に水色ブロックの切り抜き人物と白ピルの数値チップ。 |
| 10 | [Reevo](https://reevo.ai/) | land-book.com | framed-image-card | 4 | 巨大見出し・CTAを上に、働く営業担当の動画を左右余白付きカードとして直下に分離配置。 |
| 11 | [REKKI](https://rekki.com/) | httpster.net | full-bleed-photo | 4 | 暗い机の写真に『処理件数』ログのガラスピルを階段状に積み、極大見出し＋青CTA1個。 |
| 12 | [Institute of Health (IOH)](https://www.instituteofhealth.com/) | land-book.com | full-bleed-video | 4 | 暗幕の映像モンタージュ。右上にカウントアップのKPI（HUD）、左下に見出し。 |
| 13 | [Jesko Jets](https://jeskojets.com/) | land-book.com | framed-image-card | 4 | 航空機の窓枠が見出しと重なり、スクロールで窓が拡大して雲海の全面写真に開く。CTAは下端中央に固定。 |
| 14 | [Huts](https://huts.com/) | lapa.ninja | full-bleed-video | 4 | 全面動画に暗幕。中央揃えのセリフ見出し＋手描き風アンダーライン＋ピルCTA1組。 |
| 15 | [Maple](https://www.getmaple.ca/) | saaslandingpage.com | full-bleed-video | 4 | 約600px高の人物群像動画に極太の短いコピー＋CTA1個、直下に実績ストリップ。 |
| 16 | [Unify](https://www.unifygtm.com/) | minimal.gallery | framed-image-card | 4 | 見出し1行を写真の外に置き、ブラーした群衆写真の上にAIプロンプト入力欄だけを重ねる。 |
| 17 | [Y Combinator](https://www.ycombinator.com/) | lapa.ninja | typographic-with-small-image | 4 | 第一画面は文字だけのセリフ見出し。スクロールで『Then/Now』の人物写真ペアが現れる（SPは直下に写真カード）。 |
| 18 | [Town](https://www.town.com/) | siteinspire.com | typographic-with-small-image | 4 | 見出しの語間に人物ポートレートを挟み、手描きマスコットと人物が時間で入れ替わる。 |
| 19 | [Revolut](https://www.revolut.com/) | httpster.net | full-bleed-photo | 4 | 青空の人物ポートレート全面に、スマホ形の角丸フレームと残高UIを重ねる。巨大な白見出し。 |
| 20 | [Tilton](https://www.tiltongroup.com/en/) | httpster.net | framed-image-card | 4 | インセット角丸の写真パネルに階段状の大見出し。スクロールで見出しを固定したまま背景が写真→透明な製品に入れ替わる。 |

## 3. TELEMO に効きそうなヒーローUIアイデア トップ5

### 1. 顔を避けて“下側だけ”落とすスクリム＋中央見出し＋CTA2段（デモ予約／AIの声を試す）
- 根拠: **clarionhealth-com**（受話器を持つスクラブ姿の女性の全面写真。y≈450から下だけ濃いティールのグラデーションを敷き、セリフの白見出し・リード・CTA2つを中央揃え。CTAは白塗り『Schedule a demo』と、マイクアイコン付きの輪郭ボタン『Try it out』。下端はティール一色にロゴのマーキー。SPでも顔と受話器を残して拡大し、CTAは全幅で縦積み）。補強: **huts-com**（全面動画に暗幕＋中央見出し＋ピルCTA1組）、**giga-ai**（ヒーロー内の『TALK』ボタン＝声を体験する入口）、**anam-ai**（人物カードに『Talk with Mia』ピル）。
- TELEMOでの具体案: 受話器・ヘッドセットで話す働く人の動画を全面に敷き、顔の位置を避けて下1/3だけを TELEMO のティール(#007d8c)のグラデに落とす。見出し・リードは中央、CTAは『デモを予約』（塗り）＋『AIの声を聞く』（輪郭・マイクアイコン）の2段。下端のティール帯に導入企業ロゴを流す。

### 2. 写真の上に“製品の仕事ぶり”を半透明ガラスのカード／ピルで重ねる
- 根拠: **parloa-com**（顧客／エージェントの通話チャット吹き出しと『Resolved • 46 sec』ピルを右下に重ね、f0→f2で会話が進む）、**rekki-com**（『processed 34 orders』『replied to 15 emails』等の稼働ログを階段状ピルで積み、上ほど薄くフェード）、**instituteofhealth-com**（右上のKPIパネルがカウントアップ、右下に半透明ガラスのカード）、**revolut-com**（スマホ形の角丸フレームの中だけに残高UIを出す）。
- 注意点（観察）: revolutは1440幅でリード文がフレームの枠線と顔に被って読みにくく、parloaはSPでチャットUIを出していない。UIは見出し・CTAと領域を分ける。
- TELEMOでの具体案: 働く人の動画の右下に『架電中→接続→アポ獲得』の通話ログをガラスピルで数秒ごとに積み、右上に架電数・接続率・アポ数のカウントアップKPIを置く。見出し・CTAは左下に固定して動画が替わっても動かさない。

### 3. 額縁インセット＋マスクで開く入場／窓がスクロールで全面に開く
- 根拠: **lightshiprv-com**（8pxインセットの角丸フレームに入った全面動画。f0は四隅が斜めに欠けた多角形マスク、f2でフルフレームに開く。見出しを被写体の左右に振り分け、スクロール直後に人物写真の自由配置コラージュ）、**jeskojets-com**（飛行機の窓枠がスクロールで拡大し雲海の全面写真に開く。CTAは下端中央に常駐）、**hioscar-com**（全面の家族写真がスクロールで角丸カードに縮み、別写真が扇状に覗く）。
- TELEMOでの具体案: 動画を角丸の額縁（または受話器・吹き出し形の窓）に入れ、初回表示で枠が開き、スクロールで全面→カードへ遷移させる。見出しは人物の左右に振り分け、顔を隠さない。

### 4. 働く人を“群像”で見せる：同トーンのポートレート＋逆方向マーキー＋貫通コピー
- 根拠: **recruit-dac-co-jp**（博報堂DYワンの採用サイト。同じラベンダーグレー背景の社員ポートレートを2段で逆方向に流し、中央を極太の1行コピーが貫通。各カードに手書き風の一言・縦書きの職種ラベル・スライダー表示。初回は縦スリットから開く）、**ycombinator-com**（第一画面は文字のみ、スクロールで『During YC／Now』の人物写真ペア。SPは直下に写真カード）、**town-com**（見出しの語間に人物ポートレートを挟み、人物が時間で入れ替わる）。
- TELEMOでの具体案: コールセンターの働く人（オペレーター／SV）を同じ背景・同じ光で撮り揃え、役割ラベルと一言を重ねたカードを2段で逆方向に流す。見出しは帯として中央を貫通。1枚の写真に頼らず『人の多さ・多様さ』を動きで見せる。

### 5. 文字と写真を重ねない“分離型”：白地の見出し＋写真カード／切り抜き人物＋数値チップ
- 根拠: **overpass-com**（左は白地の見出し・メール入力・黒ピルCTA、右は水色ブロックに電話をしながら笑う人物の切り抜き＋白ピルのプロフィールチップ）、**reevo-ai**（巨大見出し・CTAの直下に、働く人の動画を左右余白つきカードで置く）、**unifygtm-com**（見出し1行を写真の外に置き、写真にはAI入力カードだけを重ねる）。
- TELEMOでの具体案: 白地×ティールのフラットなトーンのまま、見出し・リード・CTAは実HTMLで上（または左）に、働く人の動画を角丸カードで直下（右）に置く。カードの上には『通話数・アポ率』などの白ピルチップだけを重ね、動画の下端をファーストビューの下に覗かせてスクロールを促す。

## 4. 横断メモ（掲載20件を見て言えること）

- **見出しの位置**: 左下（parloa, instituteofhealth）、中央（clarion, huts, getmaple, hioscar）、被写体の左右に振り分け（lightship, jeskojets）、左下＋右下に分割（wonderful）。いずれも人物の顔・被写体を避ける配置。
- **スクリム**: 下側だけ落とす（clarion）、全体に薄い暗幕（huts, instituteofhealth, hioscar）、スクリムなしで空・余白に白文字を置く（revolut）。
- **動画の扱い**: 6秒の間にカットが替わっても見出し・CTAの位置は固定（parloa, lightship, huts, wonderful, getmaple）。入場演出はマスクが開く（lightship, jeskojets）、縦スリットから開く（recruit-dac）、時間差でアンダーラインを描く（huts）、見出しを固定したまま背景が写真→製品に入れ替わる（tiltongroup）。
- **CTA**: 塗り1個（parloa, huts, getmaple, rekki）か、主＋副の2個（clarion, hioscar, reevo, anam）。ボタンを置かずナビの『Build yours』のみ（lightship）や、下端中央に常駐ピル（jeskojets）という例もある。
- **スマホ**: 全面動画は縦長にトリミングして見出し・CTAを中央付近に維持（huts, getmaple）。parloaは動画を上部に収め、下を暗い単色にして見出しを置く。CTAは全幅で縦積み（clarion, reevo）。多枚カード系は1枚ずつ大きく（recruit-dac）。
- **避けたい例（観察）**: revolutのリードが枠線と顔に被る、odysseeclinic-com-au（不採用）は淡色背景に白い細字でコントラストが低い。

## 5. キャプチャしたが掲載しなかったもの／観察できなかったもの

**観察不能（失敗）**
- ha-labo-co-jp: PC・SPともに net::ERR_NAME_NOT_RESOLVED（ドメインが名前解決できない）で取得失敗。画像・meta とも内容なし。
- norosi-jp: ギャラリー掲載時のサイトが失効し、お名前.com のドメイン取得ページ（パーキング）に置き換わっていたため観察不能。
- byhumankind-com: Shopify の『This store is currently unavailable』ページに置き換わっていた（観察不能）。
- sami-marketing: ページ読込が35秒でタイムアウト（PC・SPとも。観察不能）。
- keeper-la: Netlify の『Site not found』ページ（観察不能）。

**掲載を見送ったもの（観察ノートあり。点数＝TELEMOへの示唆）**

点数4の humaninterest-co-nz（白黒の人物写真に巨大見出しを千鳥配置）と rylo-com（縦長の人物写真で顔を下端で切る）は、上限20件の都合で次点。

| slug | 型 | 点 | 備考 |
|---|---|---:|---|
| humaninterest-co-nz | full-bleed-photo | 4 | 人物写真を主役にしつつ、巨大タイポを目を避けて千鳥に置き、写真と文字を1枚の図版にしている |
| rylo-com | full-bleed-photo | 4 | 1枚の人物写真の笑顔が『通話が読める安心』という価値を直接伝え、右カラムに信頼指標（★4.6・FCC・プライバシー）とCTAを短くまとめ… |
| askmidnight-com | other | 3 | 見出しとリードを水平に並べた最小構成と、声を連想させる温度のあるぼかし色面だけで、顔や機材を見せずに音声アドバイザーの空気感を作っている |
| bakstadconstruction-com | typographic-with-small-image | 3 | 余白と淡灰のトーンだけで静かな品格を作り、写真を小さく下端から覗かせて『続きを見たい』動機を作る |
| barrbuild-co-uk | full-bleed-photo | 3 | ファーストビューを『写真＋ロゴ』だけに絞り、写真の質そのものを価値訴求にしている |
| congrue-ai | split-text-image | 3 | 写真の代わりに一枚絵の3Dジオラマを“主役のオブジェ”にして、暗背景＋ライム1色の強い統一感を作る |
| decimals-co | 3d-canvas | 3 | 暖色の紙のようなトーンと詰めたセリフ体で『人が選ぶ』温度感を出し、動く地球儀と流れるロゴで規模を示す |
| factory-ai | device-mockup | 3 | 巨大な短いコピー＋等幅のサブコピーというタイポ主体の構成で、文字がスクランブルから確定していく動きだけで『自己改善』を表現している |
| farmminerals-com | full-bleed-video | 3 | 見出し（左上）と副メッセージ＋CTA（右下）を対角に分け、中央をプロダクトの造形に空けて主役にしている |
| gusto-com | device-mockup | 3 | 写真を使わなくても、巨大セリフ見出し＋製品UIが枠を突き破るレイヤー構成で『動いているサービス』を一目で見せる |
| huddle-works | split-text-image | 3 | 人物の大きな写真ではなく、見出しの中に丸いアバターを差し込んで『人』を示し、右の案件カードで実際の需要を見せている |
| kinhr-com | split-text-image | 3 | 働く現場の人物写真を矩形ではなく斜めの形状マスク＋輪郭線で切り、テンプレ感を消している |
| newmaterial-ai | framed-image-card | 3 | 写真・動画を“額縁カード＋下に重なるカードの縁”で扱い、文字と画像を重ねずに余白と影だけで高級感を作る |
| odysseeclinic-com-au | full-bleed-video | 3 | 文字を極限まで減らして写真・動画を主役にし、ヘッダー行を画面の縦中央に置くという大胆な配置で“見た目が違う”印象を作る |
| oxide-computer | device-mockup | 3 | 製品写真と通話UIならぬCLI UIを『図版（FIG.1）＋引き出し線』で1つの絵として結び、写真がUIの説明になっている |
| podiumautomation-com | illustration | 3 | 『Faster is better.』の一言と淡黄/ダークの2面分割で、文字と図版を重ねずに可読性と工業的な精密感を両立 |
| quinngtl-com | split-text-image | 3 | 写真をブランド2色のデュオトーンにして“ブランドの絵”として扱い、見出しは写真に重ねず巨大なセリフ体で独立させている |
| raneo-co | 3d-canvas | 3 | 『何を自動化するか』を小さな工場ジオラマの動きで見せ、写真に頼らず業務プロセスを説明している |
| redcollar-co | 3d-canvas | 3 | 『human face（人の顔）』という言葉と3Dの顔を一致させ、見出しの意味を画像が補強している |
| secoda-co | split-text-image | 3 | 製品の会話UIを淡いグラデの額縁に収めてループ再生し、左の文字を邪魔せず用途を連続提示している |
| seed-com | full-bleed-photo | 3 | 写真そのものに『文字のための淡いボケ領域』があり、スクリムや暗幕を使わずに濃色の見出しを載せている |
| signwithenvoy-com | collage-grid | 3 | 見出しを白い“読むためのカード”に隔離し、周囲に業種別の絵カードを敷くことで可読性と多業種感を両立している |
| stellar-work | slider-carousel | 3 | 黒地に大きな見出しだけを置き、作品カードを折り返しから覗かせてスクロールを誘う |
| tines-com | illustration | 3 | 紫一色の大きなタイポと花柄の巨大イラスト文字だけでブランドを立て、製品動画を『チャプター付きプレーヤー』の枠に収めて、再生前に所要時間（… |
| vivmgmt-com | collage-grid | 3 | 人物写真そのものをUI（ナビの代わり）にし、巨大ロゴと写真をわざと重ねてコラージュ感を作る |
| yourmainstays-com | full-bleed-photo | 3 | 見出しを写真に直接置く大胆さと、足元のマーキー帯（コピーが流れる）でヒーローの終わりを明確に作っている |
| calendly-com | device-mockup | 2 | 登録の手間を減らすOAuthボタンを主CTAにして、行動までの距離を最短にしている |
| column-com | other | 2 | 背景ビジュアル（地図）と製品UI（送金カード）を一体化し、『お金がどこへでも動く』を描画アニメで見せる |
| maximatherapy-com | illustration | 2 | 写真を使わず、極太の丸ゴシックと原色イラストだけで『多様な角度で見る』を一言で表現し、ヒーローが文字で完結している |
| overlay-com | other | 2 | 顔を切り抜いてグラデ背景に直接置き、見出し・入力欄を顔の上に分離して置く |
| scotchpos-com | device-mockup | 2 | 暗い背景に製品UIを大きく置く王道構成 |
| slite-com | device-mockup | 2 | 手描きの質感と『タイプされる状態カード』で、AIが勝手に文書を保守するという価値を第一画面の動きだけで伝えている |
| unitedcarriers-com | 3d-canvas | 2 | プリローダーのドット地図から3D地球儀へ繋ぐ演出で世界観を作り、見出しをグラデ文字にして立体感を出している |
| wiz-io | illustration | 2 | B2Bの定番型（左に見出し・メール入力＋1CTA、右にイラスト） |

**ノート未作成（f2などを一度見ただけ。示唆が薄いと判断）**
- hellomonday-com: ブランディング文言が切り替わるイラスト＋動画のヒーロー（f2のみ確認）。人物写真がなく示唆が薄い。
- officecommun-com: 制作実績の動画サムネが横に並ぶデザインスタジオのトップ（f2のみ確認）。ヒーロー画像UIとは言いにくい。
- outseta-com: 黄→ピンクのグラデ背景＋用途タブ＋製品カード（f2のみ確認）。写真なし。
- talent-foam-org: 写真展示サイト。赤い光の写真に装飾書体のタイトルを重ねる（f2のみ確認）。業種ちがいで示唆が薄い。
- rre-com: 抽象的な空撮風の映像に左下見出し・右に長文（f2のみ確認）。人物なし。
- moneda-com: 全面の人物写真に巨大見出しを重ね、シアンの打ち消し線で『No Banks. No Borders.』を強調（f2のみ確認）。B2C。見出しが人物の胴体に重なる。
- wist-chat: 左にAIチャットのデモカード、右にセリフ見出し＋CTAの2カラム（f2のみ確認）。ヒーロー内の対話デモという点はgiga-aiと同系統。
- behaviorai-eu: 見出し＋製品画面の横並びカード（f2のみ確認）。写真なし。
- granola-ai: 見出し＋製品UIとビデオ通話サムネ（Cookieモーダルが全面を覆う状態、f2のみ確認）。
- altina-co: 製品（眼鏡フレーム）の写真に中央揃えのセリフ見出し（f2のみ確認）。人物なし。
- hellomatik-com: 暗色のフロー図・承認カードの製品映像に、左下見出しと右下の小パネル（CTA2つ）（f2のみ確認）。人物なし。

## 6. 方法と限界

- キャプチャは共通スクリプト（`scripts/hero_capture.py`、未変更）。PCは0.8s/3s/6s後の3フレーム＋700pxスクロール後、SPは390×844。**動きの判定は3フレームの差分に基づく推定**で、観測できなかった動きは unknown と書いている。
- 観察ノートは、私とサブエージェント4名（同じ書式・同じ基準）で分担して書いた。上位の代表サイトは私が画像を見て内容を確認した。
- **共通スクリプトの不具合（要共有）**: `dismiss_overlays` の `button:has-text('OK')` が大文字小文字を無視した部分一致のため、『Cookie settings』『Book demo』『For Brokers』などにもマッチし、ページが最下部へ飛ぶ／メニューが開く状態でフレームが撮れる。本調査では anam-ai, calendly-com, getmaple-ca, hioscar-com, overlay-com, slite-com, tines-com, wiz-io, wonderful-ai, maximatherapy-com が該当（unifygtm-com, unitedcarriers-com はSPのみ）。
  - 対処: スクリプト本体は変更せず、import して `dismiss_overlays` だけ安全版に差し替えるラッパ（`scratchpad/global-galleries/recapture.py`）で再撮影し、該当slugの画像を上書きした（anam-ai, calendly-com, getmaple-ca, hioscar-com, slite-com, tines-com, wonderful-ai, wiz-io, overlay-com, unifygtm-com）。maximatherapy-com と unitedcarriers-com は未再撮影（掲載外）。
  - 他の調査員のslugにも同じ兆候（metaのh1が画面外の大きな負のy、scrollYが数千px）がある可能性: locomotive-ca, www-gong-io, www-talkdesk-com, www-ana-co-jp（サブエージェントがmetaだけで見つけた疑いで、私は画像を未確認）。
  - 修正案（共通スクリプト側）: `page.get_by_role('button', name=re.compile(r'^(accept( all)?|allow all|i agree|got it|ok|okay|同意|閉じる)$', re.I))` のように完全一致にし、クリック後に `window.scrollTo(0, 0)` を入れる（recapture.py の safe_dismiss と同じ）。
- Awwwards は一覧は表示できたが、詳細ページ経由の外部URL抽出は時間の都合で行っていない。godly.website は recent.design に移行しており外部URLを直接取れなかった。
- 未確認のことは断定していない。h1が非表示要素だったサイトは、見出しサイズを『スクショからの目測』と明記した。
