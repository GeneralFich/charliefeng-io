import { test, expect } from '@playwright/test';

test('verify essay list renders correctly with extracted component', async ({ page }) => {
  await page.goto('/');
  const menuButton = page.getByRole('button', { name: 'Open menu' });
  if (await menuButton.isVisible()) {
    await menuButton.click();
    await page.getByRole('button', { name: 'Essays' }).click();
  } else {
    await page.getByRole('button', { name: 'Essays' }).click();
  }

  // Search for 'AI' to trigger filtering and highlighting
  await page.getByPlaceholder('Search essays').fill('AI');

  // Wait for results
  await expect(page.locator('text=min read').first()).toBeVisible();

  // Take screenshot
  await page.screenshot({ path: 'verification/essay_list.png' });
});
