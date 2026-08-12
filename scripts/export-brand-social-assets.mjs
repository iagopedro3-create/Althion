import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const baseUrl = process.env.ALTHION_BRAND_STUDIO_URL ?? 'http://localhost:3001/estudio-marca';
const outputDir = path.resolve('docs/brand/generated-social-kit/highlights');

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ acceptDownloads: true, viewport: { width: 1440, height: 1000 } });

try {
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  const buttons = page.locator('[data-export-highlight]');
  const count = await buttons.count();

  for (let index = 0; index < count; index += 1) {
    const button = buttons.nth(index);
    const filename = await button.getAttribute('data-export-highlight');
    if (!filename) continue;

    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 60_000 }),
      button.click(),
    ]);

    await download.saveAs(path.join(outputDir, filename));
    process.stdout.write(`generated ${filename}\n`);
  }
} finally {
  await browser.close();
}
