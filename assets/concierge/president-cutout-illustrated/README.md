# 元のデザインを保つ2.5D社長

元のPNG画像をUVテクスチャとしてそのまま使い、細分化した薄いメッシュに13ボーンを設定しています。顔・髪・服は描き直していません。3Dで造形を作り直す方式とは異なり、背面など画像にない角度は再現しません。

- `president-cutout.blend`: 元画像を内部に含むBlender編集データ。
- `president-cutout.glb`: テクスチャと4アニメーションを含む2.5Dモデル。
- `idle.webp` / `walk.webp` / `talk.webp` / `wave.webp`: Web用透過アニメーション。
- `animation.json`: 元画像とフレーム情報。
- `contact-sheet.jpg`: 各動作の確認用。

作成コマンド（プロジェクト直下）:

```sh
blender -b --python scripts/build_president_cutout.py -- STYLE render
python3 scripts/pack_president_sprites.py FOLDER
```

STYLEは`original`または`illustrated`。FOLDERは`president-cutout`または`president-cutout-illustrated`。
元画像はそれぞれ`assets/concierge/president-mini-v1.png`と`assets/concierge/president-walker/president-static-v2.png`です。

通常表示は最初の社長の見た目。URLに`?president=illustrated`を付けると直前のイラスト調の見た目を確認できます。現在のサイトでは歩行を停止し、画面右下での説明・身振り・予約導線を表示します。歩行素材は編集用に残しています。
