"""Build the ten static TELEMO hero studies and their comparison page."""

from pathlib import Path


ROOT = Path(__file__).resolve().parent
CTA_TEXT = "音声デモを聴く"
CTA_URL = "../../assets/audio/tob_denwa_kaisen.m4a"
CONTACT_URL = "../../index.html#contact"


def primary():
    return f'<a class="cta" href="{CTA_URL}">{CTA_TEXT}</a>'


def contact():
    return f'<a class="text-link" href="{CONTACT_URL}">導入について相談する</a>'


VARIANTS = [
    (
        "01-editorial-typographic",
        "タイポグラフィ主体",
        "和文の大きな見出しと細い罫線。現場の知見を言葉で伝える。",
        f'''<main class="hero"><div class="inner">
          <h1>営業電話に、<br><em>現場の知見</em>を。</h1>
          <div class="side"><p class="lead">TELEMOは、営業現場の音声とトーク設計を使う自動架電サービスです。</p>{primary()}</div>
        </div><p class="edge-word">TELEMO</p></main>''',
    ),
    (
        "02-asymmetric-bento",
        "ベントー型",
        "架電から改善への工程を、面の大小で見せる。",
        f'''<main class="hero"><div class="inner mosaic">
          <section class="mosaic-main"><h1>架電も、<br>改善も。</h1><p>TELEMOは、商材に合わせて会話を設計し、営業電話を自動化します。</p>{primary()}</section>
          <div class="tile"><small>営業リスト</small><strong>架電する相手を<br>登録する</strong></div>
          <div class="tile"><small>自動架電</small><strong>設計した会話で<br>電話をかける</strong></div>
          <div class="tile"><strong>通話結果を確かめ、<br>トークを見直す。</strong></div>
        </div></main>''',
    ),
    (
        "03-product-screen",
        "製品画面を大きく見せる",
        "実画面が入る位置とサイズを先に決め、未提供であることを明示。",
        f'''<main class="hero"><div class="inner">
          <div class="copy"><h1>結果を見て、<br>次の電話へ。</h1><p class="lead">TELEMOでは、録音・文字起こし・架電結果を確認し、会話の分岐を見直せます。</p>{primary()}</div>
          <figure class="product-slot" aria-label="製品画面の差し替え枠"><strong>TELEMOの<br>実画面</strong><p>ダッシュボード画面の提供後、この枠に配置します。</p><figcaption class="slot-note">要差し替え</figcaption></figure>
        </div></main>''',
    ),
    (
        "04-audio-split",
        "左右分割",
        "コピーの横で実際の営業音声を再生できる。",
        f'''<main class="hero"><div class="copy-half"><h1>営業電話を、<br>TELEMOに。</h1><p class="lead">商品説明から意向確認まで、商材に合わせて会話を設計します。</p><div class="actions">{primary()}{contact()}</div></div>
          <section class="audio-half" aria-labelledby="audio-heading"><div class="sound-mark" aria-hidden="true"><span style="--bar:24%"></span><span style="--bar:61%"></span><span style="--bar:39%"></span><span style="--bar:100%"></span><span style="--bar:68%"></span><span style="--bar:32%"></span><span style="--bar:78%"></span><span style="--bar:45%"></span><span style="--bar:19%"></span></div><h2 id="audio-heading">まず、声を聴く。</h2><p>実際の営業現場で使用しているTELEMOの営業音声です。</p><div><p class="audio-label">回線デモ</p><audio controls preload="metadata" aria-label="TELEMOの回線デモ"><source src="../../assets/audio/tob_denwa_kaisen.m4a" type="audio/mp4">音声を再生できません。</audio></div></section>
        </main>''',
    ),
    (
        "05-full-bleed-photo",
        "全面写真",
        "コールセンターの写真を背景に、内容と行動を一画面にまとめる。",
        f'''<main class="hero"><img class="photo" src="../../assets/hero/callcenter/callcenter-dark-v1.jpg" alt="" aria-hidden="true"><div class="inner"><h1>現場で磨いた話し方を、<br>営業電話に。</h1><p class="lead">トップアポインターの録音を使い、相手の反応に合う音声をAIが選びます。</p>{primary()}</div><p class="photo-note">イメージ写真・要差し替え</p></main>''',
    ),
    (
        "06-minimal-no-gradient",
        "グラデなしのミニマル",
        "白い紙面と一つの文で、営業AIの役割を明快にする。",
        f'''<main class="hero"><div class="inner"><div><h1>営業電話に、<br>現場の経験を。</h1><p class="lead">TELEMOは、営業現場で培ったトークをもとに、法人向けの電話営業を行います。</p>{primary()}</div></div><div class="footline" aria-hidden="true"></div></main>''',
    ),
    (
        "07-abstract-three-dimensional",
        "抽象的な3D",
        "会話の分岐を、パレット内の平面で組んだ浅い立体にする。",
        f'''<main class="hero"><div class="inner"><div><h1>分岐まで、<br>設計する。</h1><p class="lead">質問への回答や断りへの切り返しを、商材に合わせて組み立てます。</p>{primary()}</div><div class="sculpture" aria-hidden="true"><div class="stage"><span class="plate plate-one"></span><span class="plate plate-two"></span><span class="plate plate-three"></span><span class="spine"></span></div><span class="sculpture-caption">会話の分岐をかたちに</span></div></div></main>''',
    ),
    (
        "08-real-data",
        "データを見せる",
        "現行LPに掲載された架電数と料金を主役にする。",
        f'''<main class="hero"><div class="inner"><div><p class="metric-label">1IDあたり・月間コール数</p><strong class="metric">22,000</strong><h1>営業電話を、<br>TELEMOで。</h1></div><div class="right"><p class="lead">月額料金には、通信費6万円分と運用サポートが含まれます。</p><p class="price">月額35万円（税別）</p>{primary()}<p class="fact-note">数値・料金は現行LPの記載に基づきます。架電数は運用条件によって異なります。</p></div></div></main>''',
    ),
    (
        "09-flat-diagram",
        "イラスト",
        "相手の反応から音声選択までを、文字付きの図解で示す。",
        f'''<main class="hero"><div class="inner"><div><h1>反応を聞いて、<br>次のひと言を。</h1><p class="lead">TELEMOは、用意した営業音声から相手の反応に合うものを選びます。</p>{primary()}</div><svg class="diagram" viewBox="0 0 660 480" role="img" aria-labelledby="diagram-title"><title id="diagram-title">相手の反応から音声を選び、通話結果を記録する流れ</title><path class="line" d="M120 120H330V360H550 M330 240H550"/><rect class="panel" x="20" y="65" width="205" height="110" rx="4"/><text x="46" y="116">相手の反応</text><text class="small" x="46" y="143">会話を聞く</text><rect class="panel" x="420" y="185" width="210" height="110" rx="4"/><text x="445" y="237">音声を選ぶ</text><text class="small" x="445" y="264">用意したトーク</text><rect class="panel" x="420" y="330" width="210" height="110" rx="4"/><text x="445" y="382">結果を記録</text><text class="small" x="445" y="409">次の改善へ</text><circle class="point" cx="330" cy="240" r="15"/><circle class="marker" cx="330" cy="360" r="7"/></svg></div></main>''',
    ),
    (
        "10-dark-premium",
        "ダークで高級感",
        "濃紺の余白と和文セリフで、開発者の現場経験を伝える。",
        f'''<main class="hero"><div class="inner"><div><h1>営業の現場から、<br><span>営業のAI</span>を。</h1><p class="lead">TELEMOには、コールセンターを運営する経営者の営業ノウハウが活かされています。</p><div class="actions">{primary()}{contact()}</div></div><aside class="side-rule"><strong>TELEMO</strong><p>営業電話の自動化と、通話結果に基づく改善。</p></aside></div></main>''',
    ),
]


def page(slug, title, body):
    number = slug.split("-", 1)[0]
    return f'''<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>TELEMO ヒーロー案 {number}｜{title}</title>
  <link rel="stylesheet" href="../shared.css">
</head>
<body class="v{int(number)}">
  <header class="site-head"><a class="brand" href="../../index.html" aria-label="TELEMOの現行LPへ">TELEMO</a><a class="head-return" href="../index.html">10案を比較</a></header>
  {body}
</body>
</html>
'''


for slug, title, summary, body in VARIANTS:
    directory = ROOT / slug
    directory.mkdir(parents=True, exist_ok=True)
    (directory / "index.html").write_text(page(slug, title, body), encoding="utf-8")

cards = "\n".join(
    f'''<article class="card"><div class="preview"><img src="./screenshots/{slug[:2]}-home-laptop.png" width="1280" height="800" alt="{title}の画面" loading="lazy"></div><div class="meta"><span class="number">{slug[:2]}</span><div><h2>{title}</h2><p>{summary}</p></div><a href="./{slug}/index.html">全画面で見る</a></div></article>'''
    for slug, title, summary, _ in VARIANTS
)

gallery = f'''<!doctype html>
<html lang="ja">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>TELEMO ヒーロー案 10種</title>
<style>
@import url("../reference/fonts.css");
:root{{--paper:#fff;--navy:#0a2a44;--teal:#007d8c;--orange:#fd8e44;--line:#d8e8ec;--soft:#f4f6f8;--sans:"Noto Sans JP","Hiragino Sans",sans-serif}}
*{{box-sizing:border-box}}html,body{{margin:0;overflow-x:clip}}body{{background:var(--soft);color:var(--navy);font-family:var(--sans)}}a{{color:inherit;text-underline-offset:4px}}a:focus-visible{{outline:3px solid var(--orange);outline-offset:4px}}.wrap{{width:min(100% - 48px,1400px);margin:auto}}header{{padding:65px 0 36px}}h1{{font-size:clamp(34px,4vw,58px);line-height:1.3;letter-spacing:-.03em;margin:0}}header p{{max-width:760px;line-height:1.7}}.grid{{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:28px;padding-bottom:90px}}.card{{min-width:0;background:var(--paper);border:1px solid var(--line)}}.preview{{position:relative;width:100%;aspect-ratio:16/10;overflow:hidden;background:var(--paper)}}.preview img{{display:block;width:100%;height:auto}}.meta{{display:grid;grid-template-columns:45px 1fr auto;align-items:start;gap:14px;padding:20px 22px 24px;border-top:1px solid var(--line)}}.number{{font-size:18px;font-weight:800;color:var(--teal)}}h2{{margin:0;font-size:20px}}.meta p{{margin:9px 0 0;font-size:13px;line-height:1.65}}.meta a{{font-size:13px;font-weight:700;white-space:nowrap}}@media(max-width:850px){{.grid{{grid-template-columns:1fr}}.meta{{grid-template-columns:35px 1fr}}.meta a{{grid-column:2}}}}@media(max-width:450px){{.wrap{{width:min(100% - 28px,1400px)}}.meta{{padding:16px}}}}
</style></head>
<body><div class="wrap"><header><h1>TELEMO<br>ヒーロー10案</h1><p>同じサービスを、異なる構図で比較します。各案は単独で開けます。製品画面と写真には差し替え注記があります。</p><a href="./NOTES.md">前提と素材のメモ</a></header><main class="grid">{cards}</main></div></body></html>'''
(ROOT / "index.html").write_text(gallery, encoding="utf-8")

notes = '''# TELEMO ヒーロー案 — 仮置きの前提

- 対象サービス：TELEMO。現行 `index.html` の説明に基づき、営業現場の音声と商材別のトーク設計を使う自動架電サービスとして扱った。
- 読者：法人営業の責任者・担当者を想定。中小企業だけに限定する根拠は見つからなかったため、規模は指定しない。
- 主ボタン：仮に「音声デモを聴く」。既存の回線デモ音声ファイルに接続。二次導線は `#contact`。資料請求の実資料と導線は確認できなかった。
- トーン：現行LPの濃紺・ティール・オレンジ・白を使い、信頼感と落ち着きを優先。色違いではなく構図・素材・文字の役割を10案で変えた。
- 実在の根拠：現行LPにある営業音声3件、月間22,000コール／1ID、月額35万円（税別）、通信費6万円分、録音・文字起こし・架電結果・会話分岐の説明。
- 顧客ロゴ、導入社数、お客様の声、架空の成果数字は使用していない。

## 要差し替え素材

| 案 | 素材 | 推奨サイズ・条件 |
|---|---|---|
| 03 | TELEMOの実際のダッシュボード画面 | 横長 1600×1000px程度。個人情報を伏せた実画面 |
| 05 | 実際のコールセンター写真 | 横長 2000×1200px以上。現状は既存のイメージ画像を明示して使用 |

07の立体はCSSで作った抽象形状、09の図解は現行LPの説明をもとにした図形です。実物を示す素材としては扱いません。

## 文章の確認

各案の見出しは短くし、説明文は主語と動作を明確にした。現行LPの内容より強い成果保証は入れていない。「現場の知見」「営業電話」「音声を選ぶ」「通話結果を見直す」を核にし、過度な比喩や煽りを避けた。

## 実装

`build.py` で10個の独立したHTMLと比較ページを生成します。共通のタイポ、色、フォーカス表示、レスポンシブは `shared.css` にあります。既存LPは変更しません。
'''
if not (ROOT / "NOTES.md").exists():
    (ROOT / "NOTES.md").write_text(notes, encoding="utf-8")

print(f"generated {len(VARIANTS)} variants")
