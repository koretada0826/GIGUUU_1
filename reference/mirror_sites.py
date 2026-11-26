#!/usr/bin/env python3
"""Save one-page, local reference copies of the selected landing pages."""

from __future__ import annotations

import hashlib
import html
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import socket
import ssl
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request


ROOT = Path(__file__).resolve().parent / "lp-sites"
SITES = {
    "haagen-dazs": "https://www.haagen-dazs.co.jp/",
    "sunshine-autumn": "https://sunshinecity.jp/file/official/autumn/",
    "many-people": "https://www.manypeople-k.com/recruit/",
    "misignal": "https://misignal.jp/",
    "financial-japan": "https://financialjapan.jp/recruit/",
    "elixir": "https://www.shiseido.co.jp/elixir/promotion/brightening-lotion-emulsion/",
    "balmuda": "https://www.balmuda.com/jp/",
}
ASSET_SUFFIXES = {".css", ".js", ".mjs", ".png", ".jpg", ".jpeg", ".svg", ".webp", ".gif", ".avif", ".ico", ".woff", ".woff2", ".ttf", ".otf", ".mp4", ".webm"}
CSS_URL = re.compile(r"url\(\s*(['\"]?)(.*?)\1\s*\)", re.I)
CSS_IMPORT = re.compile(r"(@import\s+)(['\"])(.*?)\2", re.I)
MAX_ASSETS = 3000
MAX_TOTAL = 160 * 1024 * 1024
MAX_FILE = 16 * 1024 * 1024

_original_getaddrinfo = socket.getaddrinfo
_dns_cache: dict[str, str] = {}


def resolve(host: str) -> str:
    if host not in _dns_cache:
        query = "https://1.1.1.1/dns-query?" + urllib.parse.urlencode({"name": host, "type": "A"})
        raw = subprocess.check_output(["curl", "-fsSL", "--max-time", "10", "-H", "accept: application/dns-json", query])
        answers = json.loads(raw).get("Answer", [])
        addresses = [item["data"] for item in answers if item.get("type") == 1]
        if not addresses:
            raise OSError(f"DNS lookup failed: {host}")
        _dns_cache[host] = addresses[0]
    return _dns_cache[host]


def patched_getaddrinfo(host, port, *args, **kwargs):
    if host and not re.fullmatch(r"[\d.]+", host):
        host = resolve(host)
    return _original_getaddrinfo(host, port, *args, **kwargs)


socket.getaddrinfo = patched_getaddrinfo


def fetch(url: str) -> tuple[bytes, str, str]:
    request = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/130.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,text/css,image/avif,image/webp,image/*,*/*;q=0.8",
    })
    try:
        with urllib.request.urlopen(request, timeout=18) as response:
            length = response.headers.get("Content-Length")
            if length and int(length) > MAX_FILE:
                raise ValueError("asset too large")
            data = response.read(MAX_FILE + 1)
            if len(data) > MAX_FILE:
                raise ValueError("asset too large")
            return data, response.geturl(), response.headers.get_content_type()
    except urllib.error.URLError as error:
        if not isinstance(error.reason, ssl.SSLError):
            raise
        host = urllib.parse.urlsplit(url).hostname
        command = ["curl", "-fsSL", "--max-time", "20", "--max-filesize", str(MAX_FILE),
                   "--resolve", f"{host}:443:{resolve(host)}", "-w", "\n__MIRROR_META__%{url_effective}\t%{content_type}", url]
        output = subprocess.check_output(command)
        data, metadata = output.rsplit(b"\n__MIRROR_META__", 1)
        if len(data) > MAX_FILE:
            raise ValueError("asset too large")
        final_url, content_type = metadata.decode().split("\t", 1)
        return data, final_url, content_type.split(";", 1)[0]


def decode(data: bytes) -> str:
    for encoding in ("utf-8", "shift_jis", "euc_jp"):
        try:
            return data.decode(encoding)
        except UnicodeDecodeError:
            continue
    return data.decode("utf-8", "replace")


def image_extension(data: bytes) -> str | None:
    if data[4:8] == b"ftyp" and b"avif" in data[:16]:
        return ".avif"
    if data.startswith(b"\x89PNG"):
        return ".png"
    if data.startswith(b"\xff\xd8"):
        return ".jpg"
    if data.startswith(b"RIFF") and data[8:12] == b"WEBP":
        return ".webp"
    return None


class Mirror:
    def __init__(self, name: str, url: str):
        self.name, self.url = name, url
        self.directory = ROOT / name
        self.asset_dir = self.directory / "assets"
        self.asset_dir.mkdir(parents=True, exist_ok=True)
        self.saved: dict[str, str] = {}
        self.failed: dict[str, str] = {}
        self.total = 0

    def local_name(self, url: str) -> str:
        parsed = urllib.parse.urlsplit(url)
        suffix = Path(parsed.path).suffix.lower()
        if suffix not in ASSET_SUFFIXES:
            suffix = ".css" if "fonts.googleapis.com" in parsed.netloc else ".bin"
        digest = hashlib.sha256(url.encode()).hexdigest()[:16]
        stem = re.sub(r"[^a-zA-Z0-9_-]", "-", Path(parsed.path).stem)[:48] or "asset"
        return f"{stem}-{digest}{suffix}"

    def save(self, value: str, base: str, from_css: bool = False) -> str:
        value = html.unescape(value.strip())
        if not value or value.startswith(("data:", "blob:", "#", "javascript:", "mailto:", "tel:")):
            return value
        url = urllib.parse.urljoin(base, value)
        parsed = urllib.parse.urlsplit(url)
        if parsed.scheme not in ("http", "https"):
            return value
        url = urllib.parse.urlunsplit((parsed.scheme, parsed.netloc, parsed.path, parsed.query, ""))
        if url in self.saved:
            return self.saved[url]
        if url in self.failed or len(self.saved) >= MAX_ASSETS or self.total >= MAX_TOTAL:
            return value
        name = self.local_name(url)
        existing = self.asset_dir / name
        if name.endswith(".bin") and not existing.is_file():
            for extension in (".avif", ".png", ".jpg", ".webp"):
                candidate = existing.with_suffix(extension)
                if candidate.is_file():
                    name = candidate.name
                    existing = candidate
                    break
        if name.endswith(".bin") and existing.is_file():
            extension = image_extension(existing.read_bytes()[:16])
            if extension:
                renamed = existing.with_suffix(extension)
                existing.rename(renamed)
                name = renamed.name
        local = ("../" if from_css else "") + "assets/" + name
        self.saved[url] = local
        if (self.asset_dir / name).is_file():
            return local
        try:
            data, final_url, content_type = fetch(url)
            self.total += len(data)
            if name.endswith(".bin"):
                extension = image_extension(data[:16])
                if extension:
                    name = Path(name).with_suffix(extension).name
                    local = ("../" if from_css else "") + "assets/" + name
                    self.saved[url] = local
            if content_type == "text/css" or name.endswith(".css"):
                css = decode(data)
                css = self.rewrite_css(css, final_url)
                data = css.encode("utf-8")
            (self.asset_dir / name).write_bytes(data)
            return local
        except Exception as error:
            self.saved.pop(url, None)
            self.failed[url] = str(error)
            return value

    def rewrite_css(self, css: str, base: str) -> str:
        css = CSS_URL.sub(lambda m: "url(" + m.group(1) + self.save(m.group(2), base, True) + m.group(1) + ")", css)
        return CSS_IMPORT.sub(lambda m: m.group(1) + m.group(2) + self.save(m.group(3), base, True) + m.group(2), css)

    def rewrite_html(self, source: str, base: str) -> str:
        # Preserve the source markup and change only resource references.
        tag_pattern = re.compile(r"<(?P<tag>link|script|img|source|video|audio|picture|input)\b(?P<attrs>[^>]*?)>", re.I | re.S)
        attr_pattern = re.compile(r"(?P<prefix>\b(?:href|src|srcset|poster|imagesrcset)\s*=\s*)(?P<quote>['\"])(?P<value>.*?)(?P=quote)", re.I | re.S)

        def tag_replace(match):
            tag = match.group("tag").lower()
            whole = match.group(0)
            if tag == "link" and not re.search(r"rel\s*=\s*['\"][^'\"]*(stylesheet|icon|preload|modulepreload)", whole, re.I):
                return whole

            def attr_replace(attr):
                key = attr.group("prefix").split("=")[0].strip().lower()
                value = attr.group("value")
                if key in ("srcset", "imagesrcset"):
                    pieces = []
                    for item in value.split(","):
                        parts = item.strip().split()
                        if parts:
                            parts[0] = self.save(parts[0], base)
                        pieces.append(" ".join(parts))
                    value = ", ".join(pieces)
                else:
                    value = self.save(value, base)
                return attr.group("prefix") + attr.group("quote") + value + attr.group("quote")

            return attr_pattern.sub(attr_replace, whole)

        source = tag_pattern.sub(tag_replace, source)
        source = re.sub(r"(<style\b[^>]*>)(.*?)(</style>)", lambda m: m.group(1) + self.rewrite_css(m.group(2), base).replace("../assets/", "assets/") + m.group(3), source, flags=re.I | re.S)
        return source

    def run(self):
        data, final_url, _ = fetch(self.url)
        source = decode(data)
        (self.directory / "source.html").write_text(source, encoding="utf-8")
        result = self.rewrite_html(source, final_url)
        (self.directory / "index.html").write_text(result, encoding="utf-8")
        files = list(self.asset_dir.iterdir())
        report = {"source": self.url, "final_url": final_url, "assets_saved": len(files), "bytes_saved": sum(path.stat().st_size for path in files), "failed": self.failed}
        (self.directory / "manifest.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"{self.name}: {report['assets_saved']} assets, {report['bytes_saved'] / 1024 / 1024:.1f} MB, {len(self.failed)} failed", flush=True)


if __name__ == "__main__":
    ROOT.mkdir(exist_ok=True)
    names = sys.argv[1:] or list(SITES)
    for site_name in names:
        site_url = SITES[site_name]
        try:
            Mirror(site_name, site_url).run()
        except Exception as exc:
            print(f"{site_name}: FAILED: {exc}", flush=True)
