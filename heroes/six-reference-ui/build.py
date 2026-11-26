# -*- coding: utf-8 -*-
from pathlib import Path
from html import escape
import json
R=Path(__file__).resolve().parent
specs=json.loads((R/'specs.json').read_text())
for slug,title,source,url,layout,scene in specs:
 d=R/slug;d.mkdir(exist_ok=True)
 dark=slug[:2] in ['10']
 html=f'''<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{escape(title)}｜TELEMOヒーローUI案</title><link rel="stylesheet" href="../ui.css"></head><body class="{'dark' if dark else 'light'} v{slug[:2]} layout-{layout}"><header class="top"><a class="logo" href="../../../index.html">TELEMO</a><nav aria-label="プレビューのナビゲーション"><a href="../../../index.html#founder">私たちについて</a><a href="../../../index.html#telemo-how">サービス</a><a href="../index.html">8案を比較</a></nav></header><main class="hero"><figure class="art"><img src="../assets/{slug}.png" width="1672" height="941" alt="{escape(title)}を表現した生成イメージ"><figcaption>生成イメージ</figcaption></figure><div class="copy"><h1><span>本当の現場を</span><span>知り尽くした、</span><small>コールセンター経営者が<br>つくったAI</small></h1><p class="message">現場の知見を、<br>テレモに込めました</p><div class="actions"><a class="primary" href="../../../index.html#telemo-how">事業を見る</a><a class="secondary" href="../../../index.html#contact">お問い合わせ</a></div></div></main><aside class="president" aria-label="TELEMOを案内するミニ社長"><img src="../../../assets/concierge/president-cutout/poster.webp" width="256" height="384" alt="ミニ社長"></aside></body></html>'''
 (d/'index.html').write_text(html)
cards=''.join(f'<article><a class="shot" href="./{s}/index.html"><img src="./screenshots/{s}-desktop.png" width="1280" height="800" alt="{escape(t)}のUI案" loading="lazy"></a><div class="caption"><span>{s[:2]}</span><div><h2>{escape(t)}</h2><p>参照：{escape(source)}</p></div><a href="./{s}/index.html">案を開く</a></div></article>' for s,t,source,url,layout,scene in specs)
(R/'index.html').write_text('''<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ミニ社長とTELEMOのヒーローUI8案</title><link rel="stylesheet" href="ui.css"></head><body class="gallery"><main class="gallery-wrap"><header class="intro"><h1>5サイトを参照した<br>ヒーロー8案</h1><p>5サイトの構図・素材感・文字の扱いを、案ごとに取り入れました。ミニ社長の画像・ポーズ・固定位置は全案で共通です。</p><p class="note">写真・造形は生成イメージです。実際の現場・製品・導入実績を示すものではありません。</p><p><a href="../webdesign30-ui/index.html">30サイトを参照した新しい10案</a>　<a href="../monograph-ui/index.html">前の文字案を見る</a>　<a href="README.md">参照先と制作メモ</a></p></header><div class="grid">'''+cards+'''</div></main></body></html>''')
print('8 UI pages and gallery built')
