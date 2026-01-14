import { test, expect } from '@playwright/test';

test('verify BackToTop focus management', async ({ page }) => {
  // 1. Navigate to the app (Essays page to ensure scrolling)
  await page.goto('http://localhost:3000/?view=ESSAYS');

  // Force body height to ensure scrolling is possible
  await page.evaluate(() => {
    document.body.style.minHeight = '2000px';
    document.documentElement.style.minHeight = '2000px';
  });

  // 2. Scroll down to trigger BackToTop visibility
  await page.evaluate(() => window.scrollTo(0, 500));

  // Wait for the button to appear (it has a transition and requestAnimationFrame)
  const backToTopButton = page.getByRole('button', { name: 'Back to top' });

  // It might take a moment for the scroll event listener to fire and state to update
  await expect(backToTopButton).toBeVisible({ timeout: 10000 });

  // 3. Click the button
  await backToTopButton.click();

  // 4. Verify scroll position is 0
  // Wait for scroll to complete
  await page.waitForFunction(() => window.scrollY === 0);

  // 5. Verify focus is moved to #main-content
  await expect(page.locator('#main-content')).toBeFocused();
});
