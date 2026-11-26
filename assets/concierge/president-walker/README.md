# 歩くミニ社長

- `president-walker.blend`: 13ボーンで動かすBlenderモデル。Idle / Walk / Talk / Waveの4アクション。
- `president-walker.glb`: 上記のモデル・スキン・4アニメーションを含む書き出し。
- `idle.webp` / `walk.webp` / `talk.webp` / `wave.webp`: Web用の透過スプライト。合計約500KB。
- `president-static-v2.png`: 標準の画像生成ツールで、Blender画像と既存の人物画像を参考に制作した静止画。動きを止めた場合と読み込み失敗時に使用。
- `generation-prompt.txt`: 使用ツールと入力プロンプト。`image2.5`というモデル名はツール上で指定できないため、使用したとは扱っていない。
- `animation.json`: フレーム数・サイズ・再生速度。
- `contact-sheet.jpg`: Blenderの歩行・説明・手振りの確認画像。

## 再生成

プロジェクト直下で実行。

```sh
blender -b --python scripts/build_president_walker.py -- render
python3 scripts/pack_president_sprites.py
node scripts/check_president_walker.mjs
```

Blender 5.2 / Python Pillowを使用。フレームPNGは`frames/`に生成され、Web側は各状態のWebPだけを読み込む。

このフォルダは初期の3Dモデル制作データです。現在のサイトでは元の2D画像を保つ`president-cutout`の素材を使い、画面右下に固定して、その場で身振りしながら説明します。歩行素材は編集用に残しています。OSの動き軽減設定・「動きを止める」操作を優先します。
