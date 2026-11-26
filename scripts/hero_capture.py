#!/usr/bin/env python3
"""ヒーロー（ファーストビュー）調査用の共通キャプチャ。

1 サイトにつき次を output/hero-research/shots/ に書く（既定）:
  <slug>-pc-f0.jpg / -pc-f1.jpg / -pc-f2.jpg   1440x900 の初回表示を 0.8s / 3s / 6s 後に撮る（動きの有無が分かる）
  <slug>-pc-scroll.jpg                        700px スクロール後（スクロール連動ヒーローの挙動）
  <slug>-sp.jpg                               390x844（倍率 2）を 3s 後に撮る
  <slug>.meta.json                            最終 URL / title / h1 とその書体・サイズ / リード / CTA 文言 /
                                              video・canvas・GSAP・three の有無 / 画像枚数 など

使い方:
  python scripts/hero_capture.py <slug> <url> [--out DIR] [--frames 0.8,3,6] [--no-sp] [--no-scroll]
  python scripts/hero_capture.py --batch list.txt   # 1 行 "slug url" を複数

Google Chrome があれば channel=chrome（H.264 動画も再生できる）、無ければ Playwright の Chromium を使う。
失敗しても meta.json に error を書いて次へ進む。
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
from pathlib import Path

from playwright.sync_api import TimeoutError as PWTimeout
from playwright.sync_api import sync_playwright

UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36")

META_JS = r"""
() => {
  const q = s => document.querySelector(s);
  const txt = el => el ? (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 300) : null;
  const h1 = q('h1');
  let h1s = null;
  if (h1) {
    const cs = getComputedStyle(h1);
    const r = h1.getBoundingClientRect();
    h1s = {
      fontFamily: cs.fontFamily.slice(0, 120), fontSize: cs.fontSize, fontWeight: cs.fontWeight,
      lineHeight: cs.lineHeight, letterSpacing: cs.letterSpacing, color: cs.color,
      textAlign: cs.textAlign, writingMode: cs.writingMode,
      box: {x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height)}
    };
  }
  const vh = innerHeight, vw = innerWidth;
  const inFirstScreen = el => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < vh && r.width > 40 && r.height > 40; };
  const videos = [...document.querySelectorAll('video')].filter(inFirstScreen).map(v => ({
    src: (v.currentSrc || v.src || (v.querySelector('source') || {}).src || '').slice(0, 200),
    autoplay: v.autoplay, loop: v.loop, muted: v.muted, w: Math.round(v.getBoundingClientRect().width), h: Math.round(v.getBoundingClientRect().height),
    playing: !v.paused && !v.ended && v.readyState > 2
  }));
  const canvases = [...document.querySelectorAll('canvas')].filter(inFirstScreen).map(c => ({w: Math.round(c.getBoundingClientRect().width), h: Math.round(c.getBoundingClientRect().height)}));
  const imgs = [...document.querySelectorAll('img, picture img')].filter(inFirstScreen).map(i => ({
    src: (i.currentSrc || i.src || '').slice(0, 200), w: Math.round(i.getBoundingClientRect().width), h: Math.round(i.getBoundingClientRect().height), alt: (i.alt || '').slice(0, 80)
  })).slice(0, 12);
  const bgImgs = [];
  for (const el of document.querySelectorAll('body *')) {
    if (bgImgs.length >= 8) break;
    const bg = getComputedStyle(el).backgroundImage;
    if (bg && bg !== 'none' && bg.includes('url(') && inFirstScreen(el)) {
      const r = el.getBoundingClientRect();
      bgImgs.push({bg: bg.slice(0, 200), w: Math.round(r.width), h: Math.round(r.height)});
    }
  }
  const ctas = [...document.querySelectorAll('a, button')].filter(inFirstScreen).map(a => txt(a)).filter(t => t && t.length <= 40).slice(0, 12);
  const lead = h1 ? (() => { let n = h1.nextElementSibling; while (n && !txt(n)) n = n.nextElementSibling; return txt(n); })() : null;
  const fonts = new Set();
  for (const el of document.querySelectorAll('h1, h2, p, a, span')) { if (inFirstScreen(el)) fonts.add(getComputedStyle(el).fontFamily.split(',')[0].replace(/["']/g, '').trim()); if (fonts.size >= 6) break; }
  return {
    finalUrl: location.href, title: document.title.slice(0, 200), lang: document.documentElement.lang || null,
    viewport: {w: vw, h: vh}, pageHeight: Math.round(document.documentElement.scrollHeight),
    h1: txt(h1), h1Style: h1s, lead, ctas,
    videos, canvases, images: imgs, backgroundImages: bgImgs, firstScreenFonts: [...fonts],
    libs: {gsap: !!window.gsap, ScrollTrigger: !!window.ScrollTrigger, three: !!window.THREE, lenis: !!(window.Lenis || window.lenis), swiper: !!window.Swiper, lottie: !!(window.lottie || window.bodymovin)},
    bodyBg: getComputedStyle(document.body).backgroundColor,
    prefersDark: matchMedia('(prefers-color-scheme: dark)').matches
  };
}
"""

# Cookie 同意バーなどを閉じる。ボタン名は「完全一致」で探す（部分一致だと 'OK' が 'Book demo' や 'Cookie settings' に当たり、
# 別のページへ飛んだりメニューが開いたりした状態で撮ってしまう）。
DISMISS_NAMES = re.compile(r"^\s*(同意|同意する|同意して閉じる|すべて同意|すべて同意する|OK|Accept|Accept all|Accept All|Allow all|I agree|閉じる)\s*$", re.I)
DISMISS_SELECTORS = ["#onetrust-accept-btn-handler", "[aria-label='Close']", "[aria-label='閉じる']"]


def launch(p):
    try:
        return p.chromium.launch(channel="chrome", headless=True, args=["--autoplay-policy=no-user-gesture-required"]), "chrome"
    except Exception:
        return p.chromium.launch(headless=True, args=["--autoplay-policy=no-user-gesture-required"]), "chromium"


def shoot(page, path: Path, quality=78):
    page.screenshot(path=str(path), type="jpeg", quality=quality, animations="allow", caret="hide")


def dismiss_overlays(page):
    candidates = [page.get_by_role("button", name=DISMISS_NAMES).first] + [page.locator(sel).first for sel in DISMISS_SELECTORS]
    for el in candidates:
        try:
            if el.count() and el.is_visible(timeout=300):
                label = (el.get_attribute("aria-label") or el.inner_text(timeout=300) or "").strip()[:40]
                el.click(timeout=800, no_wait_after=True)
                page.wait_for_timeout(300)
                return label
        except Exception:
            continue
    return None


def capture(browser, slug: str, url: str, out: Path, frames=(0.8, 3.0, 6.0), sp=True, scroll=True) -> dict:
    t0 = time.time()
    meta = {"slug": slug, "url": url, "capturedAt": time.strftime("%Y-%m-%d %H:%M:%S"), "files": {}, "errors": []}
    ctx = browser.new_context(viewport={"width": 1440, "height": 900}, device_scale_factor=1, locale="ja-JP",
                              user_agent=UA, ignore_https_errors=True)
    page = ctx.new_page()
    page.set_default_timeout(15000)
    try:
        page.goto(url, wait_until="domcontentloaded", timeout=35000)
        loaded = time.time()
        try:
            page.wait_for_load_state("load", timeout=12000)
        except PWTimeout:
            meta["errors"].append("load timeout (continued)")
        meta["dismissed"] = dismiss_overlays(page)
        for i, sec in enumerate(frames):
            wait = max(0.0, loaded + sec - time.time())
            if wait:
                page.wait_for_timeout(int(wait * 1000))
            name = f"{slug}-pc-f{i}.jpg"
            shoot(page, out / name)
            meta["files"][f"pc_f{i}"] = name
            meta.setdefault("frameSeconds", []).append(sec)
        try:
            meta["pc"] = page.evaluate(META_JS)
        except Exception as e:  # noqa: BLE001
            meta["errors"].append(f"meta: {e}"[:200])
        if scroll:
            try:
                page.mouse.wheel(0, 700)
                page.wait_for_timeout(1300)
                name = f"{slug}-pc-scroll.jpg"
                shoot(page, out / name)
                meta["files"]["pc_scroll"] = name
                meta["scrollYAfterWheel"] = page.evaluate("window.scrollY")
            except Exception as e:  # noqa: BLE001
                meta["errors"].append(f"scroll: {e}"[:200])
    except Exception as e:  # noqa: BLE001
        meta["errors"].append(f"pc: {type(e).__name__}: {e}"[:300])
    finally:
        ctx.close()

    if sp:
        ctx = browser.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, is_mobile=True, has_touch=True,
                                  locale="ja-JP", ignore_https_errors=True,
                                  user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1")
        page = ctx.new_page()
        page.set_default_timeout(15000)
        try:
            page.goto(url, wait_until="domcontentloaded", timeout=35000)
            try:
                page.wait_for_load_state("load", timeout=10000)
            except PWTimeout:
                pass
            dismiss_overlays(page)
            page.wait_for_timeout(3000)
            name = f"{slug}-sp.jpg"
            shoot(page, out / name, quality=74)
            meta["files"]["sp"] = name
            try:
                m = page.evaluate(META_JS)
                meta["sp"] = {k: m.get(k) for k in ("h1", "h1Style", "lead", "ctas", "videos", "canvases", "images", "pageHeight")}
            except Exception as e:  # noqa: BLE001
                meta["errors"].append(f"sp meta: {e}"[:200])
        except Exception as e:  # noqa: BLE001
            meta["errors"].append(f"sp: {type(e).__name__}: {e}"[:300])
        finally:
            ctx.close()

    meta["elapsedSec"] = round(time.time() - t0, 1)
    (out / f"{slug}.meta.json").write_text(json.dumps(meta, ensure_ascii=False, indent=1), encoding="utf-8")
    return meta


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("slug", nargs="?")
    ap.add_argument("url", nargs="?")
    ap.add_argument("--batch", help='1 行 "slug url" のテキストファイル')
    ap.add_argument("--out", default="output/hero-research/shots")
    ap.add_argument("--frames", default="0.8,3,6")
    ap.add_argument("--no-sp", action="store_true")
    ap.add_argument("--no-scroll", action="store_true")
    a = ap.parse_args(argv)
    jobs = []
    if a.batch:
        for line in Path(a.batch).read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            parts = line.split(None, 1)
            if len(parts) == 2:
                jobs.append((parts[0], parts[1].strip()))
    elif a.slug and a.url:
        jobs.append((a.slug, a.url))
    else:
        ap.error("slug と url、または --batch を指定")
    out = Path(a.out)
    out.mkdir(parents=True, exist_ok=True)
    frames = tuple(float(x) for x in a.frames.split(","))
    with sync_playwright() as p:
        browser, kind = launch(p)
        print(f"browser: {kind}", file=sys.stderr)
        for slug, url in jobs:
            m = capture(browser, slug, url, out, frames=frames, sp=not a.no_sp, scroll=not a.no_scroll)
            pc = m.get("pc") or {}
            print(f"{slug}\t{m['elapsedSec']}s\th1={str(pc.get('h1'))[:40]!r}\tvideo={len(pc.get('videos') or [])}\tcanvas={len(pc.get('canvases') or [])}\terr={m['errors'] or '-'}")
        browser.close()


if __name__ == "__main__":
    os.chdir(Path(__file__).resolve().parent.parent)  # プロジェクト直下を基準にする
    main()
