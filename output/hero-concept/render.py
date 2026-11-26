#!/usr/bin/env python3
"""TELEMO ヒーロー改善案のプレビュー（preview.html）を PNG に書き出す。

使い方:
    python output/hero-concept/render.py                     # 既定の写真（assets/hero/callcenter-hero-poster.jpg）
    python output/hero-concept/render.py --img assets/hero/concept/telemo-hero-concept-v1-a.png
    python output/hero-concept/render.py --out DIR           # 書き出し先（既定はこのフォルダ）

書き出すもの（--img を付けたときは名前に -<画像のベース名> を付ける）:
    preview-1440.png   1440x900
    preview-1280.png   1280x800
    preview-390.png    390x844（倍率 2）

http://localhost:8000/（ROOT がルート）で開く。応答が無ければ scripts/serve.py 8000 を裏で起動する（終了後も動かしたまま）。
--img は ROOT からの相対パスか絶対パス。ROOT の外の画像は Playwright が直接返す。
Google Chrome があれば channel=chrome、無ければ Playwright の Chromium を使う。
コンソールのエラー、読み込みの失敗、横スクロール、見出しの折り返し・カードとの重なりがあれば、最後に列挙して終了コード 1。
"""

from __future__ import annotations

import argparse
import os
import shutil
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

from playwright.sync_api import sync_playwright

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
PORT = 8000
BASE = f"http://localhost:{PORT}/"
PAGE = HERE.relative_to(ROOT).as_posix() + "/preview.html"
EXTERNAL = "__render_img__/"  # ROOT の外の画像を返す仮の URL
SHOTS = [  # (名前, 幅, 高さ, 倍率)
    ("1440", 1440, 900, 1),
    ("1280", 1280, 800, 1),
    ("390", 390, 844, 2),
]

# 見出し・カード・横スクロールの確認
CHECK_JS = r"""
() => {
  const box = el => { const b = el.getBoundingClientRect(); return {x: b.left, y: b.top, r: b.right, b: b.bottom}; };
  const hit = (a, b) => a.x < b.r && b.x < a.r && a.y < b.b && b.y < a.b;
  const shown = el => el && getComputedStyle(el).display !== 'none';
  const title = document.querySelector('.hero__title');
  const lines = [...title.querySelectorAll('span')].map(span => {
    const range = document.createRange();
    range.selectNodeContents(span);
    return {text: span.textContent, rows: range.getClientRects().length, ...box(range)};
  });
  const call = document.querySelector('.call');
  const log = document.querySelector('.call__log');
  const card = box(call);
  const copy = [title, document.querySelector('.hero__lead'), ...document.querySelectorAll('.hero__actions .btn')].map(box);
  const media = box(document.querySelector('.hero__media'));
  const img = document.querySelector('.hero__img');
  return {
    img: {src: img.currentSrc, ok: img.complete && img.naturalWidth > 0},
    titleFont: getComputedStyle(title).fontSize + ' ' + getComputedStyle(title).fontFamily.split(',')[0],
    lines,
    titleRight: Math.round(Math.max(...lines.map(l => l.r))),
    card: shown(log) ? {x: Math.round(card.x), y: Math.round(card.y), r: Math.round(card.r), b: Math.round(card.b)} : null,
    cardHitsCopy: copy.some(c => hit(c, card)),
    titleOutsidePanel: lines.some(l => l.r > media.r || l.x < media.x),
    scrollWidth: document.documentElement.scrollWidth,
    scrollHeight: document.documentElement.scrollHeight,
    innerWidth, innerHeight,
  };
}
"""


def page_status() -> int | None:
    try:
        with urllib.request.urlopen(BASE + PAGE, timeout=2) as res:
            return res.status
    except urllib.error.HTTPError as err:
        return err.code
    except OSError:
        return None


def ensure_server() -> None:
    status = page_status()
    if status == 200:
        return
    if status is not None:
        sys.exit(f"localhost:{PORT} は応答していますが {PAGE} が {status} でした。ROOT 以外を配信していないか確認してください。")
    python = shutil.which("python3") or sys.executable
    subprocess.Popen(
        [python, str(ROOT / "scripts" / "serve.py"), str(PORT)],
        cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, start_new_session=True,
    )
    for _ in range(50):
        time.sleep(0.2)
        if page_status() == 200:
            print(f"scripts/serve.py {PORT} を裏で起動しました（{BASE}）")
            return
    sys.exit(f"{BASE} を起動できませんでした")


def resolve_img(arg: str) -> Path:
    path = Path(arg).expanduser()
    for candidate in ([path] if path.is_absolute() else [ROOT / path, Path.cwd() / path]):
        if candidate.is_file():
            return candidate.resolve()
    sys.exit(f"画像が見つかりません: {arg}")


def main() -> int:
    parser = argparse.ArgumentParser(description="preview.html を PNG に書き出す")
    parser.add_argument("--img", help="写真（ROOT からの相対パスか絶対パス）。省略時は preview.html の既定")
    parser.add_argument("--out", default=str(HERE), help="書き出し先のフォルダ（既定はこのフォルダ）")
    args = parser.parse_args()

    out = Path(args.out).expanduser().resolve()
    out.mkdir(parents=True, exist_ok=True)
    url = BASE + PAGE
    suffix = ""
    img = None
    if args.img:
        img = resolve_img(args.img)
        suffix = "-" + img.stem
        if img.is_relative_to(ROOT):
            src = Path(os.path.relpath(img, HERE)).as_posix()  # preview.html からの相対パス
        else:
            src = "/" + EXTERNAL + img.name
        url += "?img=" + urllib.parse.quote(src, safe="/")

    ensure_server()
    problems: list[str] = []
    with sync_playwright() as pw:
        try:
            browser = pw.chromium.launch(channel="chrome")
        except Exception:
            browser = pw.chromium.launch()
        for name, width, height, scale in SHOTS:
            context = browser.new_context(
                viewport={"width": width, "height": height}, device_scale_factor=scale,
                is_mobile=width < 768, has_touch=width < 768,
            )
            page = context.new_page()
            if img is not None and not img.is_relative_to(ROOT):
                external = str(img)
                page.route(BASE + EXTERNAL + "**", lambda route: route.fulfill(path=external))
            errors: list[str] = []
            page.on("console", lambda msg, e=errors: e.append(f"console: {msg.text}") if msg.type == "error" else None)
            page.on("pageerror", lambda exc, e=errors: e.append(f"pageerror: {exc}"))
            page.on("requestfailed", lambda req, e=errors: e.append(f"requestfailed: {req.url} {req.failure}"))
            page.on("response", lambda res, e=errors: e.append(f"HTTP {res.status}: {res.url}") if res.status >= 400 else None)
            page.goto(url, wait_until="load")
            page.evaluate("async () => { await document.fonts.ready; }")
            page.wait_for_timeout(150)
            info = page.evaluate(CHECK_JS)
            file = out / f"preview-{name}{suffix}.png"
            page.screenshot(path=str(file))
            context.close()

            card = info["card"]
            print(
                f"{file.name}: 見出し {info['titleFont']} / 右端 {info['titleRight']}px"
                + (f" / カード x{card['x']}-{card['r']} y{card['y']}-{card['b']}" if card else " / カードはピルのみ")
                + f" / ページ {info['scrollWidth']}x{info['scrollHeight']}（画面 {info['innerWidth']}x{info['innerHeight']}）"
            )
            label = f"[{name}]"
            if not info["img"]["ok"]:
                problems.append(f"{label} 写真を読み込めません: {info['img']['src']}")
            for line in info["lines"]:
                if line["rows"] != 1:
                    problems.append(f"{label} 見出し「{line['text']}」が {line['rows']} 行")
            if info["titleOutsidePanel"]:
                problems.append(f"{label} 見出しがパネルからはみ出しています")
            if card and info["cardHitsCopy"]:
                problems.append(f"{label} ガラスカードが見出し・リード・ボタンに重なっています")
            if info["scrollWidth"] > info["innerWidth"]:
                problems.append(f"{label} 横スクロール（{info['scrollWidth']}px > {info['innerWidth']}px）")
            problems += [f"{label} {e}" for e in errors]
        browser.close()

    if problems:
        print("\n問題:")
        for problem in problems:
            print("  - " + problem)
        return 1
    print("確認: 写真の読み込み・見出し 1 行ずつ・カードと文字の重なりなし・横スクロールなし・コンソールエラーなし")
    return 0


if __name__ == "__main__":
    sys.exit(main())
