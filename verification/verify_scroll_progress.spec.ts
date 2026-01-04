import { test, expect } from '@playwright/test';

test('ScrollProgress appears on scroll', async ({ page }) => {
  await page.goto('/?view=ESSAYS');
  await expect(page.getByRole('heading', { name: 'Essays' })).toBeVisible();

  // Escape the brackets in the selector
  const bar = page.locator('.fixed.top-\\[64px\\]');

  await expect(bar).toHaveCSS('opacity', '0');

  await page.evaluate(() => window.scrollTo(0, 1000));
  await page.waitForTimeout(500);

  await expect(bar).toHaveCSS('opacity', '1');

  const width = await bar.getAttribute('style');
  console.log('Progress bar style:', width);
  expect(width).toContain('width:');

  await page.screenshot({ path: 'verification/scroll_progress.png' });
});
