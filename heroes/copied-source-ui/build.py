# -*- coding: utf-8 -*-
from pathlib import Path
from html import escape as e
import json
R=Path(__file__).resolve().parent
base_specs=json.loads((R/'specs.json').read_text())
extra_specs=json.loads((R/'page31-specs.json').read_text()) if (R/'page31-specs.json').exists() else []
excluded=set(json.loads((R/'excluded-proposals.json').read_text())) if (R/'excluded-proposals.json').exists() else set()
base_specs=[s for s in base_specs if int(s['id'][:2]) not in excluded]
extra_specs=[s for s in extra_specs if int(s['id'][:2]) not in excluded]
specs=base_specs+extra_specs
def head(title,css):
 return f'<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{e(title)}｜TELEMO</title><link rel="stylesheet" href="{css}"></head>'
for s in base_specs:
 slug=s['id'];d=R/slug;d.mkdir(exist_ok=True)
 page_head=head(s['title'],'../ui.css')
 if int(slug[:2])>=9:page_head=page_head.replace('</head>','<link rel="stylesheet" href="../additional.css"></head>')
 content=page_head+f'''<body class="d8-{s['layout']}"><header class="d8-top"><a class="d8-logo" href="../../../index.html">TELEMO</a><nav aria-label="プレビューのナビゲーション"><a href="../../../index.html#founder">私たちについて</a><a href="../../../index.html#telemo-how">サービス</a><a href="../index.html">{len(specs)}案を比較</a></nav></header><main class="d8-hero"><div class="d8-stage"><figure class="d8-art"><img src="../assets/{slug}.png" width="1672" height="941" alt="{e(s['source'])}の構図を参考にした生成イメージ"><figcaption>生成イメージ</figcaption></figure><div class="d8-word" aria-label="TELEMO">TELEMO</div><img class="d8-president" src="../../../assets/concierge/president-cutout/poster.webp" width="256" height="384" alt="ミニ社長"></div><div class="d8-copy"><h1><span class="d8-first"><span>営業電話は、</span><span>TELEMOがかけます。</span></span><small>商品説明から意向確認まで、<br>AIが電話で対応します。</small></h1><p class="d8-message">現場の知見を、<br>テレモに込めました</p></div><div class="d8-actions"><a class="d8-primary" href="../../../index.html#telemo-listen">音声デモを聴く</a><a class="d8-secondary" href="../../../index.html#contact">導入を相談する</a></div></main></body></html>'''
 (d/'index.html').write_text(content)
cards=[]
for s in specs:
 source_image=s.get("source_image",f"../../reference/eight-sites-copy/{s['id']}/screenshots/hero-ready-desktop.png")
 tag=s.get('source_tag','コピーしたページの表示')
 if s['id']=='05-dars':
  source_image='../../reference/eight-sites-copy/keyvisuals/05-dars.jpg'
  tag='コピーしたキービジュアル画像'
 cards.append(f'''<article class="d8-comparison" id="proposal-{s['id'][:2]}"><h2>{s['id'][:2]}　{e(s['source'])}の構図から</h2><p>{e(s['take'])}</p><div class="d8-pair"><figure><a href="{e(s['copy_url'],quote=True)}"><img src="{source_image}" width="1440" height="1000" alt="{e(s['source'])}の参照コピー" loading="lazy"></a><figcaption><span>{tag}</span><a href="{e(s['copy_url'],quote=True)}">{e(s.get('copy_label','ローカルコピーを開く'))}</a></figcaption></figure><figure><a href="{s['id']}/index.html"><img src="screenshots/{s['id']}-desktop.png" width="1440" height="1000" alt="TELEMOのヒーローUI案" loading="lazy"></a><figcaption><span>TELEMOへの展開</span><a href="{s['id']}/index.html">UI案を開く</a></figcaption></figure></div><p class="d8-reference-tag">出典：<a href="{e(s['url'],quote=True)}">{e(s['url'])}</a></p></article>''')
(R/'index.html').write_text(head(f'営業電話をかけるAI・TELEMOのヒーロー{len(specs)}案','ui.css')+f'''<body class="d8-gallery"><main class="d8-wrap"><header class="d8-intro"><h1>営業電話は、<br>TELEMOがかけます。</h1><p class="d8-lead">商品説明から意向確認まで、AIが電話で対応します。</p><p>{len(specs)}サイトの構図を参考にしたヒーロー{len(specs)}案を比較できます。掲載する案を選び、元の案番号を保って比較しています。</p><p class="d8-note">右側の背景は生成イメージ。実際の職場や導入実績を示すものではありません。参照元の人物・キャラクター・商品・ロゴはTELEMO案に使用していません。</p><p class="d8-gallery-links"><a href="#proposal-{extra_specs[0]['id'][:2]}">31ページ目の案を見る</a><a href="../../reference/webdesignclip31/index.html">今回の参照15サイト</a><a href="../../reference/eight-sites-copy/index.html">既存の参照14サイト</a><a href="NOTES.md">制作・確認メモ</a><a href="../reference-close-ui/index.html">前回の8案</a></p></header><section class="d8-copy-ideas" aria-labelledby="copy-ideas-title"><h2 id="copy-ideas-title">伝え方の候補</h2><div class="d8-copy-idea-grid"><article><p class="d8-copy-idea-name">A　何をするか</p><h3>営業電話は、<br>TELEMOがかけます。</h3><p>{len(specs)}案のヒーローに採用。最初にサービスの役割が伝わる言い方です。</p></article><article><p class="d8-copy-idea-name">B　どう始めるか</p><h3>営業リストを登録。<br>TELEMOが電話をかけます。</h3><p>導入後の最初の手順から伝える言い方です。</p></article></div></section><div class="d8-comparisons">'''+''.join(cards)+'</div></main></body></html>')
print(f'{len(specs)} UI pages and source comparison gallery built')
