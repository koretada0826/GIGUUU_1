#!/usr/bin/env python3
"""Save browser-rendered, local reference copies of JavaScript-heavy landing pages.

mirror_sites.py downloads the HTML response and the files it names. That is not
enough for pages built with Next.js, Framer or Webflow, whose images, fonts and
CSS-in-JS styles only exist after the browser has run the page. This script drives
headless Chromium (Playwright), scrolls through the page so lazy content loads,
then writes a static snapshot of the rendered DOM:

- scripts, analytics tags and cookie dialogs are removed
- <canvas> elements become PNG screenshots, videos above MAX_FILE keep a poster frame
- every CSS, image, font and video the browser used is saved under assets/
- links to other pages point at the live site

Usage:
    python3 reference/mirror_browser.py [directory ...]      # default: every site
Requires: pip install playwright && python3 -m playwright install chromium
"""

from __future__ import annotations

import base64
import datetime as dt
import hashlib
import json
from pathlib import Path
import re
import sys
import urllib.parse

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parent / "lp-sites"
SITES: dict[str, dict] = {
    "aevion": {"url": "https://drone.riotters.com/", "settle_ms": 9000},
    "flite": {
        "url": "https://flite.bike/",
        "remove": ["#__framer-badge-container", "iframe[src*='framer.com/edit']"],
        # Framer appear effects leave untriggered elements at opacity 0.
        "css": "[data-framer-appear-id]{opacity:1!important;transform:none!important}",
    },
    "radian": {
        "url": "https://www.rideradian.com/",
        "click": ["button:has-text('Accept All')", "button:has-text('Deny')"],
        "remove": ["#usercentrics-root", "#usercentrics-cmp-ui", ".w-webflow-badge"],
    },
    # Panels are positioned by JavaScript while scrolling, so a DOM snapshot shows one panel only.
    "autonomous": {"url": "https://becomeautonomous.com/", "mode": "filmstrip", "step": 600},
    "kingjim-mark": {"url": "https://www.kingjim.co.jp/sp/mark/"},
    "rig": {"url": "https://rig.ai/"},
}

USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
VIEWPORT = {"width": 1440, "height": 900}
MAX_FILE = 12 * 1024 * 1024
MAX_TOTAL = 160 * 1024 * 1024
MAX_ASSETS = 900
BLOCKED_HOSTS = re.compile(
    r"(googletagmanager|google-analytics|doubleclick|googleadservices|googlesyndication|facebook\.(net|com)|"
    r"hotjar|usercentrics|cloudflareinsights|challenges\.cloudflare|events\.framer|framer\.com/edit|app\.framerstatic|"
    r"ads-twitter|analytics\.twitter|clarity\.ms|linkedin\.com|segment\.(io|com)|intercom|hubspot|ph\.atg\.science|"
    r"plausible\.io|vercel-insights|sentry\.io)", re.I)
ASSET_SUFFIXES = {".css", ".png", ".jpg", ".jpeg", ".svg", ".webp", ".gif", ".avif", ".ico", ".woff", ".woff2", ".ttf", ".otf", ".mp4", ".webm", ".mov"}
EXT_BY_TYPE = {"text/css": ".css", "image/png": ".png", "image/jpeg": ".jpg", "image/svg+xml": ".svg", "image/webp": ".webp", "image/gif": ".gif", "image/avif": ".avif", "image/x-icon": ".ico", "image/vnd.microsoft.icon": ".ico", "font/woff2": ".woff2", "font/woff": ".woff", "application/font-woff2": ".woff2", "application/font-woff": ".woff", "font/ttf": ".ttf", "font/otf": ".otf", "video/mp4": ".mp4", "video/webm": ".webm", "video/quicktime": ".mov"}
CSS_URL = re.compile(r"url\(\s*(['\"]?)(.*?)\1\s*\)", re.I | re.S)
CSS_IMPORT = re.compile(r"(@import\s+)(['\"])(.*?)\2", re.I)

REWRITE_JS = r"""
([map, opts]) => {
  const unmapped = new Set();
  const abs = u => { try { return new URL(u, document.baseURI).href.split('#')[0]; } catch (e) { return null; } };
  const skip = u => !u || /^(data:|blob:|#|javascript:|mailto:|tel:|about:|assets\/)/i.test(u.trim());
  const local = u => { const a = abs(u); return a && map[a] ? map[a] : null; };
  const note = u => { const a = abs(u); if (a && /^https?:/.test(a)) unmapped.add(a); };
  const rewriteAttr = (el, attr) => {
    const v = el.getAttribute(attr); if (skip(v)) return;
    const l = local(v); if (l) el.setAttribute(attr, l); else note(v);
  };
  // srcset parsing as browsers do it: a URL runs until whitespace (it may contain commas, e.g. Cloudflare image URLs),
  // then descriptors run until the next comma.
  const parseSrcset = s => {
    const out = []; let i = 0; s = s.trim();
    while (i < s.length) {
      while (i < s.length && /[\s,]/.test(s[i])) i++;
      if (i >= s.length) break;
      let start = i; while (i < s.length && !/\s/.test(s[i])) i++;
      let url = s.slice(start, i); const endedCandidate = url.endsWith(',');
      while (url.endsWith(',')) url = url.slice(0, -1);
      let d = '';
      if (!endedCandidate) {
        while (i < s.length && /\s/.test(s[i])) i++;
        start = i; while (i < s.length && s[i] !== ',') i++;
        d = s.slice(start, i).trim();
      }
      if (url) out.push({ url, d });
    }
    return out;
  };
  const rewriteSrcset = (el, attr) => {
    const v = el.getAttribute(attr); if (!v) return;
    const kept = [];
    for (const { url, d } of parseSrcset(v)) {
      if (skip(url)) { kept.push((url + ' ' + d).trim()); continue; }
      const l = local(url); if (l) kept.push((l + ' ' + d).trim()); else note(url);
    }
    if (kept.length) el.setAttribute(attr, kept.join(', ')); else if (opts.final) el.removeAttribute(attr);
  };
  const cssRewrite = text => text.replace(/url\(\s*(['"]?)(.*?)\1\s*\)/g, (m, q, u) => {
    if (skip(u)) return m; const l = local(u); if (l) return 'url(' + q + l + q + ')'; note(u); return m;
  });
  for (const sel of opts.remove) document.querySelectorAll(sel).forEach(e => e.remove());
  document.querySelectorAll('[src]:not(script):not(iframe)').forEach(el => rewriteAttr(el, 'src'));
  document.querySelectorAll('[poster]').forEach(el => rewriteAttr(el, 'poster'));
  document.querySelectorAll('[srcset]').forEach(el => rewriteSrcset(el, 'srcset'));
  document.querySelectorAll('[imagesrcset]').forEach(el => rewriteSrcset(el, 'imagesrcset'));
  document.querySelectorAll('link[rel~="stylesheet"][href], link[rel~="icon"][href], link[rel~="apple-touch-icon"][href]').forEach(el => rewriteAttr(el, 'href'));
  document.querySelectorAll('image, use').forEach(el => { for (const attr of ['href', 'xlink:href']) if (el.hasAttribute(attr)) rewriteAttr(el, attr); });
  document.querySelectorAll('[style]').forEach(el => { const s = el.getAttribute('style'); if (s && s.includes('url(')) el.setAttribute('style', cssRewrite(s)); });
  document.querySelectorAll('style').forEach(st => { if (st.textContent.includes('url(')) st.textContent = cssRewrite(st.textContent); });
  if (opts.final) {
    document.querySelectorAll('a[href]').forEach(a => { const v = a.getAttribute('href'); if (skip(v)) return; const u = abs(v); if (u) a.setAttribute('href', u + (v.includes('#') ? '#' + v.split('#')[1] : '')); });
    document.querySelectorAll('form').forEach(f => { f.setAttribute('action', '#'); f.setAttribute('onsubmit', 'event.preventDefault()'); });
    document.querySelectorAll('iframe').forEach(f => { if (opts.blocked.test(f.src)) f.remove(); });
    document.querySelectorAll('img[src^="http"]').forEach(img => { if (opts.blocked.test(img.src)) img.remove(); });
    document.querySelectorAll('script, noscript, base, meta[http-equiv="refresh"], link[rel~="preload"], link[rel~="prefetch"], link[rel~="modulepreload"], link[rel~="preconnect"], link[rel~="dns-prefetch"], link[rel~="manifest"], link[rel~="alternate"]').forEach(e => e.remove());
    document.querySelectorAll('[integrity], [crossorigin]').forEach(e => { e.removeAttribute('integrity'); e.removeAttribute('crossorigin'); });
    if (!document.querySelector('meta[charset]')) { const m = document.createElement('meta'); m.setAttribute('charset', 'utf-8'); document.head.prepend(m); }
    if (opts.css) { const s = document.createElement('style'); s.setAttribute('data-mirror-fix', ''); s.textContent = opts.css; document.head.append(s); }
  }
  return [...unmapped];
}
"""

# Runs while the page is still styled (before resource URLs are rewritten): pinned scroll scenes — a sticky element
# inside a much taller parent, or a GSAP pin-spacer — become normal flow, so the static page does not repeat one
# screen for several viewports.
UNPIN_JS = r"""
() => {
  let count = 0;
  for (const e of document.querySelectorAll('body *')) {
    if (getComputedStyle(e).position !== 'sticky') continue;
    const r = e.getBoundingClientRect(); const p = e.parentElement; if (!p || r.height < innerHeight * 0.5) continue;
    if (p.getBoundingClientRect().height < r.height * 1.3) continue;
    p.style.setProperty('height', 'auto', 'important'); p.style.setProperty('min-height', '0', 'important');
    e.style.setProperty('position', 'relative', 'important'); e.style.setProperty('top', 'auto', 'important'); e.setAttribute('data-mirror-unpinned', '');
    count++;
  }
  for (const sp of document.querySelectorAll('.pin-spacer')) {
    sp.style.setProperty('padding', '0', 'important'); sp.style.setProperty('height', 'auto', 'important'); sp.style.setProperty('min-height', '0', 'important');
    for (const c of sp.children) { c.style.setProperty('position', 'relative', 'important'); c.style.setProperty('top', 'auto', 'important'); c.style.setProperty('left', 'auto', 'important'); c.style.setProperty('transform', 'none', 'important'); c.setAttribute('data-mirror-unpinned', ''); count++; }
  }
  return count;
}
"""

CANVAS_DATA_JS = r"""
(c) => {
  try {
    const t = document.createElement('canvas'); t.width = Math.max(1, Math.min(c.width, 48)); t.height = Math.max(1, Math.min(c.height, 48));
    const ctx = t.getContext('2d'); ctx.drawImage(c, 0, 0, t.width, t.height);
    const d = ctx.getImageData(0, 0, t.width, t.height).data;
    for (let i = 3; i < d.length; i += 4) if (d[i] > 0) return c.toDataURL('image/png');
    return null;
  } catch (e) { return null; }
}
"""

# While a canvas is photographed, hide the elements painted over it (later in DOM order, or with a positive
# z-index) so headings and buttons are not baked into the picture and then drawn twice.
HIDE_OVERLAYS_JS = r"""
([c, hide]) => {
  if (!hide) { for (const e of document.querySelectorAll('[data-mirror-hidden]')) { e.style.visibility = e.getAttribute('data-mirror-hidden'); e.removeAttribute('data-mirror-hidden'); } return 0; }
  const cr = c.getBoundingClientRect(); let n = 0;
  for (const e of document.querySelectorAll('body *')) {
    if (e === c || e.contains(c) || c.contains(e)) continue;
    const r = e.getBoundingClientRect(); if (!r.width || !r.height) continue;
    if (r.right <= cr.left || r.left >= cr.right || r.bottom <= cr.top || r.top >= cr.bottom) continue;
    const z = parseInt(getComputedStyle(e).zIndex, 10);
    const above = (c.compareDocumentPosition(e) & Node.DOCUMENT_POSITION_FOLLOWING) || (z > 0);
    if (!above) continue;
    e.setAttribute('data-mirror-hidden', e.style.visibility || ''); e.style.visibility = 'hidden'; n++;
  }
  return n;
}
"""

SCROLL_POSITION_JS = """
() => { let m = window.scrollY; for (const e of document.querySelectorAll('*')) if (e.scrollTop > m) m = e.scrollTop; return Math.round(m); }
"""


def launch_browser(playwright):
    try:
        return playwright.chromium.launch()
    except Exception:
        cache = Path.home() / "Library/Caches/ms-playwright"
        candidates = sorted(cache.glob("chromium*/*/chrome-headless-shell")) + sorted(cache.glob("chromium*/*/Chromium.app/Contents/MacOS/Chromium"))
        if not candidates:
            raise
        return playwright.chromium.launch(executable_path=str(candidates[-1]))


def sniff_extension(data: bytes) -> str | None:
    head = data[:16]
    if head.startswith(b"\x89PNG"):
        return ".png"
    if head.startswith(b"\xff\xd8"):
        return ".jpg"
    if head.startswith(b"RIFF") and head[8:12] == b"WEBP":
        return ".webp"
    if head[4:8] == b"ftyp":
        return ".avif" if b"avif" in head else ".mp4"
    if head.startswith(b"wOF2"):
        return ".woff2"
    if head.startswith(b"wOFF"):
        return ".woff"
    if head.startswith(b"GIF8"):
        return ".gif"
    if head.startswith(b"OTTO"):
        return ".otf"
    if head.startswith((b"\x00\x01\x00\x00", b"true")):
        return ".ttf"
    if head.startswith(b"\x1a\x45\xdf\xa3"):
        return ".webm"
    if b"<svg" in data[:512]:
        return ".svg"
    return None


class Snapshot:
    def __init__(self, name: str, config: dict):
        self.name, self.config = name, config
        self.url = config["url"]
        self.directory = ROOT / name
        self.asset_dir = self.directory / "assets"
        self.asset_dir.mkdir(parents=True, exist_ok=True)
        self.responses: dict[str, tuple[bytes | None, str, int]] = {}
        self.saved: dict[str, str] = {}      # absolute URL -> assets/name
        self.failed: dict[str, str] = {}
        self.skipped: dict[str, int] = {}
        self.notes: list[str] = []
        self.total = 0
        self.source_html: bytes | None = None

    # ---------- network ----------
    def on_response(self, response):
        try:
            url = response.url.split("#")[0]
            if not url.startswith(("http://", "https://")):
                return
            content_type = (response.headers.get("content-type") or "").split(";")[0].strip().lower()
            if response.request.resource_type == "document" and self.source_html is None and response.status == 200:
                self.source_html = response.body()
                return
            if response.status != 200:
                return
            length = response.headers.get("content-length")
            body = None
            wanted = response.request.resource_type in ("stylesheet", "image", "font", "other", "manifest") and not content_type.startswith(("text/html", "application/json", "application/javascript", "text/javascript"))
            if wanted and (not length or int(length) <= MAX_FILE):
                try:
                    body = response.body()
                except Exception:
                    body = None
            self.responses[url] = (body, content_type, int(length) if length else -1)
        except Exception:
            pass

    def local_name(self, url: str, content_type: str, data: bytes) -> str:
        parsed = urllib.parse.urlsplit(url)
        suffix = Path(parsed.path).suffix.lower()
        if suffix not in ASSET_SUFFIXES:
            suffix = EXT_BY_TYPE.get(content_type) or sniff_extension(data) or ".bin"
        if suffix == ".bin":
            suffix = sniff_extension(data) or suffix
        digest = hashlib.sha256(url.encode()).hexdigest()[:12]
        stem = re.sub(r"[^A-Za-z0-9_-]", "-", Path(parsed.path).stem)[:48] or "asset"
        return f"{stem}-{digest}{suffix}"

    def store(self, url: str, data: bytes, content_type: str) -> str | None:
        name = self.local_name(url, content_type, data)
        if name.endswith(".bin"):  # script modules and other blobs the static page cannot use
            self.skipped[url] = -3
            return None
        path = self.asset_dir / name
        if name.endswith(".css") or content_type == "text/css":
            data = self.rewrite_css_bytes(data, url)
        path.write_bytes(data)
        self.total += len(data)
        self.saved[url] = "assets/" + name
        return self.saved[url]

    def fetch(self, context, url: str, referer: str) -> str | None:
        """Download one asset through the browser context. Returns the local path or None."""
        if url in self.saved:
            return self.saved[url]
        if url in self.failed or url in self.skipped:
            return None
        if BLOCKED_HOSTS.search(url):
            self.skipped[url] = 0
            return None
        if len(self.saved) >= MAX_ASSETS or self.total >= MAX_TOTAL:
            self.skipped[url] = -1
            return None
        cached = self.responses.get(url)
        if cached and cached[0] is not None:
            return self.store(url, cached[0], cached[1])
        try:
            response = context.request.get(url, headers={"Referer": referer, "Accept": "*/*"}, timeout=40000, max_redirects=5)
            if not response.ok:
                self.failed[url] = f"HTTP {response.status}"
                return None
            content_type = (response.headers.get("content-type") or "").split(";")[0].strip().lower()
            if content_type.startswith("text/html"):
                self.skipped[url] = -2
                return None
            length = response.headers.get("content-length")
            if length and int(length) > MAX_FILE:
                self.skipped[url] = int(length)
                return None
            data = response.body()
            if len(data) > MAX_FILE:
                self.skipped[url] = len(data)
                return None
            return self.store(url, data, content_type)
        except Exception as error:
            self.failed[url] = str(error).splitlines()[0][:160]
            return None

    # ---------- css ----------
    def rewrite_css_bytes(self, data: bytes, base: str) -> bytes:
        try:
            css = data.decode("utf-8")
        except UnicodeDecodeError:
            return data
        self.css_pending.append((base, css))
        return data  # rewritten later, once referenced files are fetched

    def finish_css(self, context):
        """Rewrite url()/@import inside every saved stylesheet to sibling files in assets/."""
        processed: set[str] = set()
        while self.css_pending:
            base, css = self.css_pending.pop()
            if base in processed:
                continue
            processed.add(base)

            def replace(value: str) -> str:
                raw = value.strip()
                if not raw or raw.startswith(("data:", "blob:", "#")):
                    return value
                absolute = urllib.parse.urljoin(base, raw).split("#")[0]
                local = self.fetch(context, absolute, base)
                return local.split("/", 1)[1] if local else value

            css = CSS_URL.sub(lambda m: "url(" + m.group(1) + replace(m.group(2)) + m.group(1) + ")", css)
            css = CSS_IMPORT.sub(lambda m: m.group(1) + m.group(2) + replace(m.group(3)) + m.group(2), css)
            local_path = self.saved.get(base)
            if local_path:
                (self.directory / local_path).write_text(css, encoding="utf-8")

    # ---------- page ----------
    def scroll_through(self, page, step: int = 800, pause: int = 220, max_steps: int = 90):
        page.mouse.move(VIEWPORT["width"] // 2, VIEWPORT["height"] // 2)
        last, still = -1, 0
        for _ in range(max_steps):
            page.mouse.wheel(0, step)
            page.wait_for_timeout(pause)
            position = page.evaluate(SCROLL_POSITION_JS)
            still = still + 1 if position == last else 0
            last = position
            if still >= 3:
                break
        page.wait_for_timeout(1500)

    def scroll_to_top(self, page):
        page.mouse.move(VIEWPORT["width"] // 2, VIEWPORT["height"] // 2)
        for _ in range(60):
            page.mouse.wheel(0, -1600)
            page.wait_for_timeout(120)
            if page.evaluate(SCROLL_POSITION_JS) == 0:
                break
        page.evaluate("() => { window.scrollTo(0, 0); for (const e of document.querySelectorAll('*')) if (e.scrollTop) e.scrollTop = 0; }")
        page.wait_for_timeout(1500)

    def replace_canvases(self, page):
        handles = page.query_selector_all("canvas")
        replaced = 0
        for index, canvas in enumerate(handles):
            try:
                box = canvas.bounding_box()
                if not box or box["width"] < 64 or box["height"] < 64:
                    page.evaluate("c => c.remove()", canvas)
                    continue
                canvas.scroll_into_view_if_needed(timeout=5000)
                page.wait_for_timeout(700)
                data_url = page.evaluate(CANVAS_DATA_JS, canvas)
                if data_url:
                    png = base64.b64decode(data_url.split(",", 1)[1])
                else:
                    try:
                        page.evaluate(HIDE_OVERLAYS_JS, [canvas, True])
                        page.wait_for_timeout(150)
                        png = canvas.screenshot(type="png", timeout=8000)
                    except Exception:
                        page.evaluate("c => c.remove()", canvas)
                        self.notes.append(f"canvas {index}: not capturable, removed")
                        continue
                    finally:
                        page.evaluate(HIDE_OVERLAYS_JS, [canvas, False])
                name = f"canvas-{index}.png"
                (self.asset_dir / name).write_bytes(png)
                self.total += len(png)
                page.evaluate(
                    """([c, src, w, h]) => { const img = document.createElement('img'); img.src = src;
                       for (const a of c.attributes) if (!['width', 'height', 'src'].includes(a.name)) img.setAttribute(a.name, a.value);
                       img.setAttribute('width', Math.round(w)); img.setAttribute('height', Math.round(h)); img.setAttribute('data-mirror-canvas', '');
                       img.style.cssText = c.style.cssText + ';object-fit:cover;'; c.replaceWith(img); }""",
                    [canvas, "assets/" + name, box["width"], box["height"]])
                replaced += 1
            except Exception as error:
                self.notes.append(f"canvas {index}: {str(error).splitlines()[0][:100]}")
        if replaced:
            self.notes.append(f"{replaced} canvas element(s) replaced with screenshots")

    def handle_videos(self, page, context):
        videos = page.query_selector_all("video")
        postered = kept = 0
        for index, video in enumerate(videos):
            try:
                src = page.evaluate("v => v.currentSrc || v.getAttribute('src') || (v.querySelector('source') || {}).src || ''", video)
                local = None
                if src.startswith("http") and ".m3u8" not in src and not BLOCKED_HOSTS.search(src):
                    size = -1
                    try:
                        head = context.request.head(src, timeout=20000)
                        size = int(head.headers.get("content-length") or -1)
                    except Exception:
                        size = -1
                    if size <= MAX_FILE:  # unknown size: fetch() still enforces the limit
                        local = self.fetch(context, src, page.url)
                    else:
                        self.skipped[src] = size
                if local:
                    kept += 1
                    continue
                box = video.bounding_box()
                poster_name = None
                if box and box["width"] >= 64 and box["height"] >= 64:
                    try:
                        video.scroll_into_view_if_needed(timeout=5000)
                        page.wait_for_timeout(500)
                        poster_name = f"video-{index}-poster.jpg"
                        (self.asset_dir / poster_name).write_bytes(video.screenshot(type="jpeg", quality=82, timeout=8000))
                    except Exception:
                        poster_name = None
                page.evaluate(
                    """([v, poster]) => { v.removeAttribute('src'); v.removeAttribute('autoplay'); v.querySelectorAll('source').forEach(s => s.remove());
                       if (poster) v.setAttribute('poster', poster); v.setAttribute('data-mirror-video', ''); }""",
                    [video, "assets/" + poster_name if poster_name else None])
                if src:
                    self.skipped[src] = size
                postered += 1
            except Exception as error:
                self.notes.append(f"video {index}: {str(error).splitlines()[0][:100]}")
        if videos:
            self.notes.append(f"videos: {kept} kept, {postered} replaced by a poster frame")

    def rewrite_dom(self, page, final: bool) -> list[str]:
        options = {"remove": self.config.get("remove", []), "final": final, "css": self.config.get("css", ""), "blocked": None}
        # Pass the blocked-host pattern as source text so the page can build its own RegExp.
        options_js = json.dumps(options)
        return page.evaluate(
            "([map, opts, blocked]) => { opts.blocked = new RegExp(blocked, 'i'); return (" + REWRITE_JS.strip() + ")([map, opts]); }",
            [self.saved, json.loads(options_js), BLOCKED_HOSTS.pattern])

    def run_filmstrip(self, page, started):
        """Viewport screenshots at each scroll step, stacked in one page."""
        step = int(self.config.get("step", 600))
        if self.source_html:
            (self.directory / "source.html").write_bytes(self.source_html)
        page.mouse.move(VIEWPORT["width"] // 2, VIEWPORT["height"] // 2)
        frames: list[tuple[str, int]] = []
        previous, still = b"", 0
        for index in range(80):
            # Pages that scroll with transforms never change scrollTop, so stop when the picture stops changing.
            image = page.screenshot(type="jpeg", quality=85)
            still = still + 1 if image == previous else 0
            if still >= 2:
                break
            previous = image
            name = f"frame-{index:02d}.jpg"
            (self.asset_dir / name).write_bytes(image)
            frames.append((name, index * step))
            page.mouse.wheel(0, step)
            page.wait_for_timeout(900)
        stamp = started.strftime("%Y-%m-%d %H:%M")
        slides = "\n".join(
            f'<figure><figcaption>scroll {position}px</figcaption><img src="assets/{name}" width="{VIEWPORT["width"]}" height="{VIEWPORT["height"]}" alt="" loading="lazy"></figure>'
            for name, position in frames)
        html = f"""<!DOCTYPE html>
<!-- Filmstrip capture of {self.url} ({stamp}) with reference/mirror_browser.py: the page positions its panels with JavaScript while scrolling, so each frame is a viewport screenshot {step}px further down. -->
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>{page.title()}</title>
<style>body{{margin:0;background:#1b1f27;color:#c9d0dc;font:12px/1.5 -apple-system,BlinkMacSystemFont,sans-serif}}
.note{{padding:10px 16px;background:#272c37;border-bottom:1px solid #3a4150}}.note a{{color:#9fb6ff}}
figure{{margin:0;padding:16px 16px 0}}figcaption{{padding:0 0 4px;color:#8f98a8;font-size:11px;letter-spacing:.04em}}
img{{display:block;width:100%;height:auto;max-width:{VIEWPORT["width"]}px;background:#fff}}</style></head>
<body><div class="note">この複製は、スクロール位置ごとの画面キャプチャを縦に並べたものです（元ページはスクロールに合わせてJavaScriptでパネルを動かすため、HTMLの保存では再現できません）。元サイト: <a href="{self.url}" target="_blank" rel="noopener">{self.url}</a></div>
{slides}
</body></html>
"""
        (self.directory / "index.html").write_text(html, encoding="utf-8")
        self.notes.append(f"filmstrip: {len(frames)} frames, {step}px apart")
        files = list(self.asset_dir.iterdir())
        report = {"source": self.url, "final_url": page.url, "captured_at": stamp, "tool": "mirror_browser.py (filmstrip)",
                  "assets_saved": len(files), "bytes_saved": sum(path.stat().st_size for path in files), "notes": self.notes, "failed": {}, "skipped": {}}
        (self.directory / "manifest.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"{self.name}: filmstrip {len(frames)} frames, {report['bytes_saved'] / 1024 / 1024:.1f} MB, {(dt.datetime.now() - started).seconds}s", flush=True)

    def run(self, playwright):
        started = dt.datetime.now()
        self.css_pending: list[tuple[str, str]] = []
        browser = launch_browser(playwright)
        context = browser.new_context(viewport=VIEWPORT, user_agent=USER_AGENT, locale="ja-JP", device_scale_factor=1)
        page = context.new_page()
        page.on("response", self.on_response)
        page.goto(self.url, wait_until="domcontentloaded", timeout=60000)
        page.wait_for_timeout(self.config.get("settle_ms", 6000))
        for selector in self.config.get("click", []):
            try:
                element = page.query_selector(selector)
                if element and element.is_visible():
                    element.click(timeout=3000)
                    page.wait_for_timeout(800)
                    self.notes.append(f"clicked {selector}")
            except Exception:
                pass
        if self.config.get("mode") == "filmstrip":
            self.run_filmstrip(page, started)
            context.close()
            browser.close()
            return
        self.scroll_through(page)
        self.scroll_to_top(page)
        final_url = page.url
        if self.source_html:
            (self.directory / "source.html").write_bytes(self.source_html)

        # Save everything the browser already loaded, then resolve what the DOM still references.
        for url, (body, content_type, _) in list(self.responses.items()):
            if body is not None and not BLOCKED_HOSTS.search(url):
                self.fetch(context, url, final_url)
        self.replace_canvases(page)
        self.handle_videos(page, context)
        self.scroll_to_top(page)
        unpinned = page.evaluate(UNPIN_JS)  # must run before rewrite_dom: rewriting <link href> unloads the live CSS
        if unpinned:
            self.notes.append(f"{unpinned} pinned scroll element(s) returned to normal flow")
        for _ in range(2):
            unmapped = self.rewrite_dom(page, final=False)
            for url in unmapped:
                self.fetch(context, url, final_url)
        self.finish_css(context)
        self.rewrite_dom(page, final=True)
        html = page.evaluate("() => '<!DOCTYPE html>\\n' + document.documentElement.outerHTML")
        stamp = started.strftime("%Y-%m-%d %H:%M")
        html = html.replace("<html", f"<!-- Static snapshot of {self.url} captured {stamp} with reference/mirror_browser.py. Scripts removed; links go to the live site. -->\n<html", 1)
        (self.directory / "index.html").write_text(html, encoding="utf-8")
        context.close()
        browser.close()

        files = list(self.asset_dir.iterdir())
        report = {
            "source": self.url, "final_url": final_url, "captured_at": stamp, "tool": "mirror_browser.py (static DOM snapshot)",
            "assets_saved": len(files), "bytes_saved": sum(path.stat().st_size for path in files),
            "notes": self.notes, "failed": self.failed,
            "skipped": {url: size for url, size in self.skipped.items() if size != 0},
        }
        (self.directory / "manifest.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"{self.name}: {report['assets_saved']} assets, {report['bytes_saved'] / 1024 / 1024:.1f} MB, {len(self.failed)} failed, {len(report['skipped'])} skipped, {(dt.datetime.now() - started).seconds}s", flush=True)


if __name__ == "__main__":
    ROOT.mkdir(exist_ok=True)
    names = sys.argv[1:] or list(SITES)
    with sync_playwright() as playwright:
        for site_name in names:
            try:
                Snapshot(site_name, SITES[site_name]).run(playwright)
            except Exception as exc:
                print(f"{site_name}: FAILED: {exc}", flush=True)
