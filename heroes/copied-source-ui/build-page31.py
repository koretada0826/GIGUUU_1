from pathlib import Path
from html import escape as e
import json
R=Path(__file__).resolve().parent
all_specs=json.loads((R/'page31-specs.json').read_text())
excluded=set(json.loads((R/'excluded-proposals.json').read_text())) if (R/'excluded-proposals.json').exists() else set()
base_specs=json.loads((R/'specs.json').read_text())
specs=[s for s in all_specs if int(s['id'][:2]) not in excluded]
active_specs=[s for s in base_specs+all_specs if int(s['id'][:2]) not in excluded]
TAKES={
 'tutor':'淡い写真を大きく使い、左右に人物と説明を分ける。落ち着いた余白で相談へつなぐ。',
 'deskbook':'見下ろした机と紙の質感。中央に重ねた一枚の紙へ、説明と行動をまとめる。',
 'clipboard':'一色の地に大きなクリップボード。短い文字と余白を主役にする。',
 'chalk':'黒板の実写と白い短冊の文字。写真の下にも白場を残して読みやすくする。',
 'loop':'左の力強い文字と、右の大きな円弧。電話と書類を円弧のそばに置く。',
 'circle':'白地の中央に大きな円。小さな会話モチーフを周辺へ散らし、主役を囲む。',
 'juice':'主役を大きく置いた色面と、丸く切り取ったビジュアル。画面の密度を上げる。',
 'contactsheet':'縦に大きく組んだ文字と、右側を埋める写真のコンタクトシート。',
 'showcase':'暗い背景の上に立つ主役。機材の接写と小さな文字で静かに見せる。',
 'pixel':'中央の主役と周辺の細かなドット絵。平面の世界を一つの画面にまとめる。',
 'floating':'淡い空色の中央に文字、その周りに大小のモチーフを浮かべる。',
 'splash':'明るい写真、思い切った主役の大きさ、上下を分ける濃い色の帯。',
 'confetti':'広い白場と幾何学的なモチーフ。中央の大きな文字へ視線を集める。',
 'portrait':'中央の丸い人物枠と、縦組みの短い言葉。親しみを持てる顔を主役にする。',
 'window':'落ち着いた色面に大きな写真窓。端の縦組み文字と写真の余白を合わせる。'
}
def image(src,cls='',alt='電話と書類を題材にしたコンセプト画像'):
 return f'<img class="{cls}" src="{src}" alt="{alt}" width="1672" height="941">'
def art(name,cls='scene',alt='電話と書類を題材にした生成イメージ'):
 return image('../assets/page31/'+name+'.png',cls,alt)
def pres(cls='president'):
 return '<img class="'+cls+'" src="../../../assets/concierge/president-cutout/poster.webp" alt="ミニ社長" width="256" height="384">'
def title():return '<h1><span>営業電話は、</span><span>TELEMOがかけます。</span></h1>'
def actions():return '<div class="actions"><a class="primary" href="../../../index.html#telemo-listen">音声デモを聴く</a><a class="secondary" href="../../../index.html#contact">導入を相談する</a></div>'
def copy():return '<div class="copy">'+title()+'<p class="support">商品説明から意向確認まで、<br>AIが電話で対応します。</p>'+actions()+'</div>'
for i,s in enumerate(specs):
 s['take']=TAKES[s['layout']]
 l=s['layout'];word='<div class="word" aria-hidden="true">TELEMO</div>'
 if l=='tutor':content='<div class="visual">'+art('workspace')+pres()+'</div>'+copy()
 elif l=='deskbook':content=image('../assets/05-dars.png','scene')+'<div class="paper">'+word+copy()+'</div>'+pres()
 elif l=='clipboard':content='<div class="board"><span class="clip" aria-hidden="true"></span>'+word+copy()+pres()+'</div>'
 elif l=='chalk':content='<div class="blackboard">'+art('chalk')+word+copy()+pres()+'</div><p class="chalk-bottom">現場の知見を、テレモに込めました。</p>'
 elif l=='loop':content=art('phone-loop')+copy()+pres()
 elif l=='circle':content='<div class="orbit" aria-hidden="true"></div><div class="orb a" aria-hidden="true"></div><div class="orb b" aria-hidden="true"></div><div class="orb c" aria-hidden="true"></div>'+word+copy()+pres()
 elif l=='juice':content='<div class="juice-visual">'+art('phone-splash')+'</div>'+word+copy()+pres()
 elif l=='contactsheet':
  photos=['03-pilot','05-dars','07-esneaker','13-mamoroom','09-yukimi','10-brother'];content='<div class="editorial">'+word+copy()+'</div><div class="contactsheet">'+''.join(image('../assets/'+p+'.png',alt='電話と机の生成イメージ')for p in photos)+'</div>'+pres()
 elif l=='showcase':content=art('headset-dark')+word+copy()+'<p class="showcase-note">会話を聴けば、役割がわかる。</p>'
 elif l=='pixel':content='<div class="pixel-stage">'+art('pixel-office')+word+pres()+'</div>'+copy()
 elif l=='floating':content='<div class="float-panel left">'+image('../assets/09-yukimi.png')+'</div><div class="float-panel right">'+image('../assets/10-brother.png')+'</div>'+word+copy()+pres()
 elif l=='splash':content=art('phone-splash')+word+copy()+'<p class="splash-bottom">営業リストを登録。<br>TELEMOが電話をかけます。</p>'
 elif l=='confetti':
  content='<div class="confetti-field" aria-hidden="true">'+''.join('<i></i>'for _ in range(12))+'</div>'+word+copy()+pres()
 elif l=='portrait':content='<p class="vertical">現場の知見を、<br>テレモに込めました。</p><div class="portrait-ring">'+pres()+'</div>'+word+copy()
 elif l=='window':content='<p class="vertical">営業電話の、<br>次のかたち。</p><div class="photo-window">'+art('workspace')+pres()+'</div>'+copy()
 position=active_specs.index(s)
 prev=active_specs[position-1] if position else None;next_s=active_specs[position+1] if position<len(active_specs)-1 else None
 pagination=('<a href="../'+prev['id']+'/index.html">前の案</a>'if prev else '')+'<a href="../index.html#proposal-'+s['id'][:2]+'">一覧に戻る</a>'+('<a href="../'+next_s['id']+'/index.html">次の案</a>'if next_s else '')
 html=f'''<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{e(s['source'])}の構図から｜TELEMOのUI案</title><link rel="stylesheet" href="../page31.css"></head><body class="p31-{l}"><header class="top"><a class="logo" href="../../../index.html">TELEMO</a><nav aria-label="プレビューのナビゲーション"><a href="../../../index.html#telemo-how">サービス</a><a href="../index.html#proposal-{s['id'][:2]}">{len(active_specs)}案を比較</a></nav></header><main class="hero">{content}</main><footer><p>構図の参照：<a href="{e(s['url'],quote=True)}">{e(s['source'])}</a> / <a href="{e(s['gallery_url'],quote=True)}">WebDesignClip掲載画面</a></p><p>写真・イラストは生成イメージです。</p><nav aria-label="案の切り替え">{pagination}</nav></footer></body></html>'''
 d=R/s['id'];d.mkdir(exist_ok=True);(d/'index.html').write_text(html)
# Keep the full source inventory; exclusions control the visible proposals.
print(f'{len(specs)} Page 31 hero proposals built')
