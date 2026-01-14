
import { test, expect } from '@playwright/test';

test('verify BackToTop visual state', async ({ page }) => {
  // 1. Navigate to the app (Essays page to ensure scrolling)
  await page.goto('http://localhost:3000/?view=ESSAYS');

  // Force body height to ensure scrolling is possible
  await page.evaluate(() => {
    document.body.style.minHeight = '2000px';
    document.documentElement.style.minHeight = '2000px';
  });

  // 2. Scroll down to trigger BackToTop visibility
  await page.evaluate(() => window.scrollTo(0, 500));

  // Wait for the button to appear
  const backToTopButton = page.getByRole('button', { name: 'Back to top' });
  await expect(backToTopButton).toBeVisible();

  // 3. Take screenshot of the button
  await backToTopButton.screenshot({ path: 'verification/back_to_top_btn.png' });
});
