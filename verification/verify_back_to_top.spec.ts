
import { test, expect } from '@playwright/test';

test('BackToTop button appears and handles click', async ({ page }) => {
  // Go to a page that has enough content to scroll (e.g. Essays)
  await page.goto('http://localhost:3000');

  // Navigate to Essays to ensure we have content to scroll
  await page.getByRole('button', { name: 'Essays' }).click();

  // Wait for content to load
  await page.waitForTimeout(1000);

  // Force scroll to make button appear (needs > 300px)
  await page.evaluate(() => window.scrollTo(0, 1000));

  // Wait specifically for the button to have the visible class or opacity 1
  // The component toggles classes: 'opacity-100' vs 'opacity-0'
  const backToTop = page.getByRole('button', { name: 'Back to top' });

  // Wait for the opacity class to be applied
  await expect(backToTop).toHaveClass(/opacity-100/, { timeout: 10000 });

  // Take a screenshot of the button visible
  await page.screenshot({ path: 'verification/back_to_top_visible.png' });

  // Click the button
  await backToTop.click();

  // Verify we are back at the top
  await page.waitForFunction(() => window.scrollY === 0);

  // Verify focus management
  // We expect 'main-content' to be focused
  const focusedId = await page.evaluate(() => document.activeElement?.id);
  expect(focusedId).toBe('main-content');

  console.log('BackToTop verification successful');
});
