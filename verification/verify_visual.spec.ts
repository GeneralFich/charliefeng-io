
import { test, expect } from '@playwright/test';

test('verify highlighting optimization visual', async ({ page }) => {
  // Navigate to Essays
  await page.goto('/');
  await page.getByRole('button', { name: 'Essays' }).click();

  // Search for "infrastructure" to trigger highlighting
  const searchInput = page.getByPlaceholder('Search essays...');
  await searchInput.fill('infrastructure');

  // Wait for highlighting
  await expect(page.locator('mark').first()).toBeVisible();

  // Take screenshot of list highlighting
  await page.screenshot({ path: 'verification/highlight_list.png' });

  // Click first essay
  await page.locator('.group.flex.flex-col').first().click();

  // Search in essay
  await page.getByPlaceholder('Find in essay...').fill('the');
  await expect(page.locator('article mark').first()).toBeVisible();

  // Take screenshot of article highlighting
  await page.screenshot({ path: 'verification/highlight_article.png' });
});
