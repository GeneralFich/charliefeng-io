import { test, expect } from '@playwright/test';

test('Verify Essay List state persistence', async ({ page }) => {
  // 1. Go to Essays
  await page.goto('/');
  await page.getByRole('button', { name: 'Essays' }).click();

  // 2. Type a search query
  const searchInput = page.getByPlaceholder('Search essays...');
  await searchInput.fill('energy');

  // 3. Verify input has value
  await expect(searchInput).toHaveValue('energy');

  // 4. Click on an essay (target by text that appears in essay cards)
  const essayButton = page.locator('button').filter({ hasText: /min read/i }).first();
  await essayButton.click();

  // 5. Verify we are in detail view
  await expect(page.getByRole('button', { name: 'Back to Essays' })).toBeVisible();

  // 6. Go back
  await page.getByRole('button', { name: 'Back to Essays' }).click();

  // 7. Verify search input still has "energy"
  await expect(page.getByPlaceholder('Search essays...')).toHaveValue('energy');
});
