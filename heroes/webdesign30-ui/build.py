# -*- coding: utf-8 -*-
from pathlib import Path
from html import escape as e
import json
R=Path(__file__).resolve().parent
specs=json.loads((R/'specs.json').read_text())
refs=json.loads((R/'references.json').read_text())
by_id={x['id']:x for x in refs}
def head(title,css):
 return f'<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{e(title)}｜TELEMO</title><link rel="stylesheet" href="{css}"></head>'
for s in specs:
 slug=s['id'];d=R/slug;d.mkdir(exist_ok=True)
 content=head(s['title'],'../ui.css')+f'''<body class="h30-{s['layout']}"><header class="h30-top"><a class="h30-logo" href="../../../index.html">TELEMO</a><nav aria-label="プレビューのナビゲーション"><a href="../../../index.html#founder">私たちについて</a><a href="../../../index.html#telemo-how">サービス</a><a href="../index.html">10案を比較</a></nav></header><main class="h30-hero"><figure class="h30-art"><img src="../assets/{slug}.png" width="1672" height="941" alt="{e(s['title'])}を表現した生成イメージ"><figcaption>生成イメージ</figcaption></figure><div class="h30-copy"><h1><span>本当の現場を</span><span>知り尽くした、</span><small>コールセンター経営者が<br>つくったAI</small></h1><p class="h30-message">現場の知見を、<br>テレモに込めました</p><div class="h30-actions"><a class="h30-primary" href="../../../index.html#telemo-how">事業を見る</a><a class="h30-secondary" href="../../../index.html#contact">お問い合わせ</a></div></div></main><aside class="h30-president" aria-label="TELEMOを案内するミニ社長"><img src="../../../assets/concierge/president-cutout/poster.webp" width="256" height="384" alt="ミニ社長"></aside></body></html>'''
 (d/'index.html').write_text(content)
cards=[]
for s in specs:
 sources=' ／ '.join(f'<a href="{e(by_id[n]["gallery_url"],quote=True)}">{n:02} {e(by_id[n]["title"].split(" | ")[0].split("｜")[0])}</a>' for n in s['refs'])
 cards.append(f'''<article class="h30-card"><a class="h30-shot" href="{s['id']}/index.html"><img src="screenshots/{s['id']}-desktop.png" width="1280" height="800" alt="{e(s['title'])}のUI案" loading="lazy"></a><div class="h30-caption"><h2><span>{s['id'][:2]}</span>{e(s['title'])}</h2><p>{e(s['desc'])}</p><p class="h30-sources">参照：{sources}</p><a class="h30-open" href="{s['id']}/index.html">この案を開く</a></div></article>''')
(R/'index.html').write_text(head('30サイトから考えたヒーロー10案','ui.css')+'''<body class="h30-gallery"><main class="h30-wrap"><header class="h30-intro"><h1>30サイトから考えた、<br>TELEMOのヒーロー10案。</h1><p>Web Design Clipの14ページ目から22サイト、15ページ目から8サイトを抽出。各案に3サイトずつ、文字・素材・構図の考え方を組み合わせました。ミニ社長の画像と固定位置、元のコピー・ボタン・リンクは共通です。</p><p class="h30-note">写真・立体・イラストは生成イメージです。実際の現場や製品、導入実績を示すものではありません。参照元の画像・ロゴ・キャラクターは流用していません。</p><p class="h30-gallery-links"><a href="references.html">30サイトの参照メモを見る</a><a href="../six-reference-ui/index.html">前の8案を見る（05・10削除済み）</a><a href="NOTES.md">制作・確認メモ</a></p></header><div class="h30-grid">'''+''.join(cards)+'</div></main></body></html>')
items=[]
for x in refs:
 live=x.get('live',{});status=str(live.get('status',live.get('error','未確認')))
 use='・'.join(s['id'][:2] for s in specs if x['id'] in s['refs'])
 items.append(f'''<li><h2><strong>{x['id']:02}</strong>　{e(x['title'])}</h2><p>{e(x['observation'])}</p><p class="h30-status">掲載元：{x['page']}ページ目 ／ 使用案：{use}<br>現行ページ確認：{e(status)}<br>参照基準：Web Design Clip掲載画像</p><div class="h30-ref-links"><a href="{e(x['gallery_url'],quote=True)}">掲載ページ</a><a href="{e(x['url'],quote=True)}">参照サイト</a><a href="{e(x['thumbnail'],quote=True)}">掲載時の画像</a></div></li>''')
(R/'references.html').write_text(head('30サイトの参照メモ','ui.css')+'''<body class="h30-gallery"><main class="h30-wrap"><header class="h30-intro"><h1>30サイトの参照メモ</h1><p>掲載画像30点を確認し、現行URLもブラウザで開きました。現行ページが掲載時と異なるものや、導入画面から進まなかったもの、終了・取得制限のあるものがあります。構図の基準を掲載画像に統一し、現行URLの確認結果を併記しています。確認日：2026年11月4日。</p><p><a href="index.html">ヒーロー10案に戻る</a>　<a href="https://lp.webdesignclip.com/page/14/">抽出元の14ページ目</a>　<a href="https://lp.webdesignclip.com/page/15/">15ページ目</a></p></header><ol class="h30-ref-list">'''+''.join(items)+'</ol></main></body></html>')
print(f'{len(specs)} UI pages, gallery, {len(refs)} reference notes built')
