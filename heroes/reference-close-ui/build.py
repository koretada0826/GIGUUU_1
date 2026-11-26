# -*- coding: utf-8 -*-
from pathlib import Path
from html import escape as e
import json
R=Path(__file__).resolve().parent
specs=json.loads((R/'specs.json').read_text())
def head(title,css):
 return f'<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{e(title)}｜TELEMO</title><link rel="stylesheet" href="{css}"></head>'
for s in specs:
 slug=s['id'];d=R/slug;d.mkdir(exist_ok=True)
 content=head(s['title'],'../ui.css')+f'''<body class="c8-{s['layout']}"><header class="c8-top"><a class="c8-logo" href="../../../index.html">TELEMO</a><nav aria-label="プレビューのナビゲーション"><a href="../../../index.html#founder">私たちについて</a><a href="../../../index.html#telemo-how">サービス</a><a href="../index.html">8案を比較</a></nav></header><main class="c8-hero"><div class="c8-stage"><figure class="c8-art"><img src="../assets/{slug}.png" width="1672" height="941" alt="{e(s['source'])}の構図を参考にした生成イメージ"><figcaption>生成イメージ</figcaption></figure><div class="c8-word" aria-label="TELEMO">TELEMO</div><img class="c8-president" src="../../../assets/concierge/president-cutout/poster.webp" width="256" height="384" alt="ミニ社長"></div><div class="c8-copy"><h1><span class="c8-first"><span>本当の現場を</span><span>知り尽くした、</span></span><small>コールセンター経営者が<br>つくったAI</small></h1><p class="c8-message">現場の知見を、<br>テレモに込めました</p></div><div class="c8-actions"><a class="c8-primary" href="../../../index.html#telemo-how">事業を見る</a><a class="c8-secondary" href="../../../index.html#contact">お問い合わせ</a></div></main></body></html>'''
 (d/'index.html').write_text(content)
cards=[]
for s in specs:
 cards.append(f'''<article class="c8-card"><a class="c8-shot" href="{s['id']}/index.html"><img src="screenshots/{s['id']}-desktop.png" width="1280" height="800" alt="{e(s['title'])}のUI案" loading="lazy"></a><div class="c8-caption"><h2><span>{s['id'][:2]}</span>{e(s['title'])}</h2><p>{e(s['take'])}</p><div class="c8-card-links"><a href="{s['id']}/index.html">案を開く</a><a href="{e(s['url'],quote=True)}">参照サイトを開く</a></div></div></article>''')
(R/'index.html').write_text(head('参照サイトに寄せたヒーロー8案','ui.css')+'''<body class="c8-gallery"><main class="c8-wrap"><header class="c8-intro"><h1>参照サイトの構図で、<br>ミニ社長とTELEMOを。</h1><p>指定の8サイトに1案ずつ対応。主役の大きさ、背景と文字の重ね方、画面の分け方を参照元に寄せました。ミニ社長は既存画像をそのまま使い、各案の構図に合わせて配置。TELEMOの文字と現在のコピー・ボタン・リンクは全案に共通です。</p><p class="c8-note">背景は生成イメージ。実際の職場や導入実績を示すものではありません。参照元のキャラクター・商品・ロゴは流用していません。</p><p class="c8-gallery-links"><a href="NOTES.md">参照と制作のメモ</a><a href="../webdesign30-ui/index.html">前回の10案を見る</a></p></header><div class="c8-grid">'''+''.join(cards)+'</div></main></body></html>')
print(f'{len(specs)} UI pages and gallery built')
