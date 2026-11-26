"""Capture the selected support section after the user authorizes Playwright QA."""
import json
from pathlib import Path

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "output/telemo-support-redesign"
URL = "http://localhost:8000/index.html#telemo-support-accompaniment"


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    results = []
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(channel="chrome", headless=True)
        for width in [1727, 1440, 768, 390, 320]:
            context = browser.new_context(viewport={"width": width, "height": 1100}, device_scale_factor=1)
            page = context.new_page()
            errors = []
            page.on("pageerror", lambda error: errors.append(str(error)))
            page.goto(URL, wait_until="networkidle")
            component = page.locator("#telemo-support-accompaniment")
            component.scroll_into_view_if_needed()
            page.evaluate("document.fonts.ready")
            component.locator("img").evaluate_all("images => Promise.all(images.map(image => image.decode().catch(() => {})))")
            component.screenshot(path=str(OUT / f"implementation-{width}.png"), animations="disabled")
            metrics = component.evaluate("""element => {
              const bounds = element.getBoundingClientRect();
              const css = getComputedStyle(element.querySelector('h3'));
              return {
                width: innerWidth,
                componentWidth: bounds.width,
                componentHeight: bounds.height,
                overflow: document.documentElement.scrollWidth > innerWidth,
                brokenImages: [...element.querySelectorAll('img')].filter(i => !i.complete || !i.naturalWidth).map(i => i.src),
                headlineFont: css.fontFamily,
                headlineSize: css.fontSize,
                headlineWeight: css.fontWeight,
                supportItems: [...element.querySelectorAll('li')].map(i => i.textContent.trim())
              };
            }""")
            metrics["errors"] = errors
            metrics["screenshot"] = f"implementation-{width}.png"
            results.append(metrics)
            context.close()
        browser.close()
    (OUT / "browser-verification.json").write_text(json.dumps(results, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps(results, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
