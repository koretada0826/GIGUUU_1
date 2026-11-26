"""Build a static local Stripe reference from the saved server-rendered HTML."""

from __future__ import annotations

import hashlib
import html as std_html
import json
import re
import subprocess
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from urllib.parse import urljoin, urlparse

from lxml import html


ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / "source.html"
ASSETS = ROOT / "assets"
CSS = ROOT / "css"
CSS_SOURCE = ROOT / "css-source"
ORIGIN = "https://stripe.com/jp"
USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
ASSETS.mkdir(exist_ok=True)
CSS.mkdir(exist_ok=True)
CSS_SOURCE.mkdir(exist_ok=True)


def run_curl(url: str, destination: Path, ip: str | None = None) -> None:
    hostname = urlparse(url).hostname
    args = ["curl", "-fsSL", "--compressed", "--retry", "2", "--max-time", "40"]
    if ip and hostname:
        args += ["--resolve", f"{hostname}:443:{ip}"]
    args += ["-H", f"User-Agent: {USER_AGENT}", url, "-o", str(destination)]
    subprocess.run(args, check=True, stdout=subprocess.DEVNULL)


def ip_for(hostname: str) -> str:
    query = f"https://dns.google/resolve?name={hostname}&type=A"
    response = subprocess.check_output(
        ["curl", "-fsSL", "--max-time", "15", "--resolve", "dns.google:443:8.8.8.8", query]
    )
    answers = json.loads(response).get("Answer", [])
    return next(item["data"] for item in answers if item["type"] == 1)


def asset_path(url: str) -> Path:
    name = Path(urlparse(url).path).name or "asset"
    name = re.sub(r"[^A-Za-z0-9._-]", "-", name)[:80]
    return ASSETS / f"{hashlib.sha1(url.encode()).hexdigest()[:12]}-{name}"


document = html.fromstring(SOURCE.read_bytes())
stylesheet_urls = [
    urljoin(ORIGIN, link.get("href"))
    for link in document.xpath('//link[contains(@rel,"stylesheet")][@href]')
]
for url in stylesheet_urls:
    destination = CSS_SOURCE / Path(urlparse(url).path).name
    if not destination.exists():
        run_curl(url, destination, ip_for(urlparse(url).hostname))

image_urls: set[str] = set()
for icon in document.xpath('//link[contains(@rel,"icon")][@href]'):
    image_urls.add(urljoin(ORIGIN, icon.get("href")))
for meta in document.xpath('//meta[@property="og:image" or @name="twitter:image"]'):
    if meta.get("content"):
        image_urls.add(urljoin(ORIGIN, meta.get("content")))
for image in document.xpath("//img[@src]"):
    url = urljoin(ORIGIN, image.get("src"))
    if url.startswith("https://"):
        image_urls.add(url)
        image.set("src", "assets/" + asset_path(url).name)
    for attribute in ("srcset", "sizes", "data-srcset"):
        image.attrib.pop(attribute, None)

# The saved HTML already contains the initial page. Use its img fallbacks rather
# than loading every responsive crop, and omit hydration and analytics scripts.
for source in document.xpath("//picture/source"):
    source.drop_tree()
for script in document.xpath("//script"):
    script.drop_tree()
for link in document.xpath("//link"):
    rel = (link.get("rel") or "").lower()
    href = link.get("href")
    if "stylesheet" in rel and href:
        link.set("href", "css/" + Path(urlparse(href).path).name)
    elif "preload" in rel or "preconnect" in rel or "dns-prefetch" in rel:
        link.drop_tree()

for anchor in document.xpath("//a[@href]"):
    href = anchor.get("href")
    if href.startswith("/"):
        anchor.set("href", urljoin("https://stripe.com", href))

font_urls: set[str] = set()
font_re = re.compile(r"url\((['\"]?)(/mkt-ssr-statics/[^)'\"]+)\1\)")
for stylesheet in CSS_SOURCE.glob("*.css"):
    content = stylesheet.read_text()

    def replace_font(match: re.Match[str]) -> str:
        url = "https://b.stripecdn.com" + match.group(2)
        font_urls.add(url)
        return f'url("../assets/{asset_path(url).name}")'

    (CSS / stylesheet.name).write_text(font_re.sub(replace_font, content))

urls = sorted(image_urls | font_urls)
hosts = {urlparse(url).hostname for url in urls}
ips = {host: ip_for(host) for host in hosts if host}
results: dict[str, dict[str, object]] = {}


def download(url: str) -> tuple[str, int]:
    path = asset_path(url)
    if not path.exists() or path.stat().st_size == 0:
        run_curl(url, path, ips[urlparse(url).hostname])
    return url, path.stat().st_size


with ThreadPoolExecutor(max_workers=5) as pool:
    futures = {pool.submit(download, url): url for url in urls}
    for future in as_completed(futures):
        url = futures[future]
        try:
            _, size = future.result()
            results[url] = {"file": "assets/" + asset_path(url).name, "bytes": size}
        except Exception as exc:
            results[url] = {"error": str(exc)}

local_html = SOURCE.read_text()
for url in image_urls:
    local_name = "assets/" + asset_path(url).name
    local_html = local_html.replace(std_html.escape(url, quote=True), local_name)
    local_html = local_html.replace(url, local_name)
for url in stylesheet_urls:
    local_html = local_html.replace(url, "css/" + Path(urlparse(url).path).name)
local_html = re.sub(r"(?is)<script\b[^>]*>.*?</script>", "", local_html)
local_html = re.sub(r"(?is)<source\b[^>]*?/?>", "", local_html)
local_html = re.sub(
    r'(?is)<link\b(?=[^>]*\brel="(?:preload|preconnect|dns-prefetch)")[^>]*>', "", local_html
)
local_html = re.sub(r'\s(?:srcSet|srcset|sizes|data-srcset)="[^"]*"', "", local_html)
local_html = re.sub(
    r'(<a\b[^>]*\bhref=")/([^"]*)"',
    lambda match: match.group(1) + "https://stripe.com/" + match.group(2) + '"',
    local_html,
)
(ROOT / "index.html").write_text(local_html)
(ROOT / "manifest.json").write_text(json.dumps(results, ensure_ascii=False, indent=2) + "\n")
print(
    f"Downloaded {sum('file' in value for value in results.values())}/{len(results)} assets; "
    f"{sum(value.get('bytes', 0) for value in results.values()) / 1024 / 1024:.1f} MiB"
)
