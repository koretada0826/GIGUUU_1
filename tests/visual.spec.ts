import { test, expect, Page } from '@playwright/test';

// チェックしたいページをここに追加
const pages = [
  { name: 'top', path: '/index.html' },
  { name: 'recruit', path: '/recruit.html' },
];

// 遅延読み込みやスクロール連動アニメーションを発火させるため、最下部までスクロールして戻る
async function settle(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 400) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 50));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
}

for (const p of pages) {
  test.describe(p.name, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(p.path);
      await settle(page);
    });

    // 1. 横スクロールが発生していないか（基準画像なしで検出できる崩れ）
    test('横はみ出しがない', async ({ page }) => {
      const offenders = await page.evaluate(() => {
        const vw = document.documentElement.clientWidth;
        const list: string[] = [];
        document.querySelectorAll('body *').forEach((el) => {
          const r = el.getBoundingClientRect();
          const style = getComputedStyle(el);
          if (style.position === 'fixed' || r.width === 0) return;
          if (r.right > vw + 1 || r.left < -1) {
            const id = el.id ? `#${el.id}` : '';
            const cls = typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\s+/).join('.') : '';
            list.push(`${el.tagName.toLowerCase()}${id}${cls} (left ${Math.round(r.left)}, right ${Math.round(r.right)}, 画面幅 ${vw})`);
          }
        });
        return {
          scrollWidth: document.documentElement.scrollWidth,
          vw,
          list: list.slice(0, 20),
        };
      });
      expect(offenders.scrollWidth, `横スクロール発生。はみ出している要素:\n${offenders.list.join('\n')}`).toBeLessThanOrEqual(offenders.vw);
    });

    // 2. 画像の読み込み切れがないか
    test('画像が壊れていない', async ({ page }) => {
      const broken = await page.evaluate(() =>
        Array.from(document.images)
          .filter((img) => img.complete && img.naturalWidth === 0)
          .map((img) => img.currentSrc || img.src)
      );
      expect(broken, `読み込めない画像:\n${broken.join('\n')}`).toEqual([]);
    });

    // 3. 前回の基準画像との見た目の差分
    test('見た目の差分', async ({ page }) => {
      await expect(page).toHaveScreenshot(`${p.name}.png`, { fullPage: true });
    });
  });
}
