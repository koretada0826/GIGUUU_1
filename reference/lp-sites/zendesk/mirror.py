#!/usr/bin/env python3
"""Build a static Zendesk reference from the saved server-rendered HTML."""

from __future__ import annotations

import hashlib
import json
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
import re
import subprocess
from urllib.parse import quote, urljoin, urlsplit, urlunsplit

from lxml import html


ROOT = Path(__file__).resolve().parent
SOURCE_URL = "https://www.zendesk.co.jp/lp/nb-support/"
SOURCE = ROOT / "source.html"
ASSETS = ROOT / "assets"
ASSETS.mkdir(exist_ok=True)
CSS_URL = re.compile(r"url\(\s*(['\"]?)(https?://[^)'\"]+)\1\s*\)")


def address(host: str) -> str:
    query = f"https://1.1.1.1/dns-query?name={host}&type=A"
    data = subprocess.check_output(
        ["curl", "-fsSL", "--max-time", "15", "-H", "accept: application/dns-json", query]
    )
    return next(item["data"] for item in json.loads(data).get("Answer", []) if item.get("type") == 1)


def filename(url: str) -> str:
    name = Path(urlsplit(url).path).name or "asset"
    name = re.sub(r"[^A-Za-z0-9._-]", "-", name)[:70]
    return f"{hashlib.sha256(url.encode()).hexdigest()[:12]}-{name}"


def download(url: str, ips: dict[str, str]) -> tuple[str, int, str]:
    path = ASSETS / filename(url)
    if path.suffix == ".png" and path.with_suffix(".svg").exists():
        path = path.with_suffix(".svg")
    if not path.exists() or not path.stat().st_size:
        host = urlsplit(url).hostname
        parts = urlsplit(url)
        request_url = urlunsplit((parts.scheme, parts.netloc, quote(parts.path, safe="/%+,="), parts.query, ""))
        subprocess.run(
            ["curl", "-fsSL", "--compressed", "--retry", "2", "--max-time", "40",
             "--resolve", f"{host}:443:{ips[host]}", "-H", "User-Agent: Googlebot", request_url,
             "-o", str(path)],
            check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE,
        )
    if path.suffix == ".png" and b"<svg" in path.read_bytes()[:1024]:
        corrected = path.with_suffix(".svg")
        path.rename(corrected)
        path = corrected
    return url, path.stat().st_size, path.name


def main() -> None:
    document = html.fromstring(SOURCE.read_bytes())
    urls: set[str] = set()

    # The page embeds its CSS. Capture all referenced images and font files.
    for style in document.xpath("//style"):
        content = style.text or ""
        urls.update(match.group(2) for match in CSS_URL.finditer(content))
    for image in document.xpath("//img[@src]"):
        src = image.get("src")
        if src and not src.startswith(("data:", "blob:")):
            urls.add(urljoin(SOURCE_URL, src))
    for link in document.xpath("//link[@href]"):
        rel = (link.get("rel") or "").lower()
        if "icon" in rel or ("preload" in rel and link.get("as") == "image"):
            urls.add(urljoin(SOURCE_URL, link.get("href")))

    hosts = {urlsplit(url).hostname for url in urls}
    ips = {host: address(host) for host in hosts if host}
    results: dict[str, dict[str, object]] = {}
    with ThreadPoolExecutor(max_workers=6) as pool:
        futures = {pool.submit(download, url, ips): url for url in sorted(urls)}
        for future in as_completed(futures):
            url = futures[future]
            try:
                _, size, name = future.result()
                results[url] = {"file": "assets/" + name, "bytes": size}
            except Exception as exc:
                results[url] = {"error": str(exc)}

    # The source references four Extralight font URLs that currently return 403.
    # Use the nearest available weight so the preview remains self-contained.
    for url, value in results.items():
        if "error" in value and "VanillaSans-Extralight" in url:
            substitute = url.replace("VanillaSans-Extralight", "VanillaSans-Light")
            replacement = results.get(substitute, {})
            if "file" in replacement:
                results[url] = {"file": replacement["file"], "fallback_for_unavailable_font": substitute}

    for style in document.xpath("//style"):
        style.text = CSS_URL.sub(
            lambda m: f"url({m.group(1)}{results.get(m.group(2), {}).get('file', m.group(2))}{m.group(1)})",
            style.text or "",
        )
    for image in document.xpath("//img[@src]"):
        src = urljoin(SOURCE_URL, image.get("src"))
        if src in results and "file" in results[src]:
            image.set("src", results[src]["file"])
    for link in document.xpath("//link[@href]"):
        href = urljoin(SOURCE_URL, link.get("href"))
        if href in results and "file" in results[href]:
            link.set("href", results[href]["file"])
        elif (link.get("rel") or "").lower() in {"preconnect", "dns-prefetch", "alternate"}:
            link.drop_tree()
    for script in document.xpath("//script"):
        script.drop_tree()
    for frame in document.xpath("//iframe[contains(@src, 'googletagmanager.com')]"):
        frame.drop_tree()
    for anchor in document.xpath("//a[@href]"):
        href = anchor.get("href")
        if href.startswith("/"):
            anchor.set("href", urljoin(SOURCE_URL, href))
    for form in document.xpath("//form"):
        form.set("onsubmit", "event.preventDefault()")

    output = html.tostring(document, encoding="unicode", method="html")
    (ROOT / "index.html").write_text("<!doctype html>\n" + output, encoding="utf-8")
    (ROOT / "manifest.json").write_text(
        json.dumps({"source": SOURCE_URL, "assets": results}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    saved = sum("file" in value for value in results.values())
    print(f"Saved {saved}/{len(results)} assets")


if __name__ == "__main__":
    main()
