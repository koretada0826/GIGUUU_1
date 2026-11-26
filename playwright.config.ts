import { defineConfig } from '@playwright/test';

// UI崩れチェック用の設定
// 静的HTMLを python3 の簡易サーバーで配信してから撮影します
export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  fullyParallel: true,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    reducedMotion: 'reduce', // アニメーションによる誤検出を減らす
  },
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.01, // 1%までの差分は許容
      animations: 'disabled',
    },
  },
  projects: [
    { name: 'sp-375', use: { browserName: 'chromium', viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } },
    { name: 'tb-768', use: { browserName: 'chromium', viewport: { width: 768, height: 1024 } } },
    { name: 'pc-1440', use: { browserName: 'chromium', viewport: { width: 1440, height: 900 } } },
  ],
  webServer: {
    command: 'python3 -m http.server 4173 --bind 127.0.0.1',
    url: 'http://127.0.0.1:4173/index.html',
    reuseExistingServer: true,
    stderr: 'ignore',
  },
});
