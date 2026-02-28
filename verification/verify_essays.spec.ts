import { test, expect } from '@playwright/test';

test('Essays view allows searching and filtering', async ({ page }) => {
  // Navigate directly to essays view
  await page.goto('/essays');

  // Verify header is present
  await expect(page.getByRole('heading', { name: 'Essays' })).toBeVisible();

  // Count initial essays by counting the titles (h3 elements in the grid)
  const essayTitles = page.locator('h3.font-bold');
  const initialCount = await essayTitles.count();

  // We expect at least the 4 known essays
  expect(initialCount).toBeGreaterThanOrEqual(4);

  // Search for specific term unique to one essay
  // "thermodynamic" should match "The Thermodynamic Wall"
  const searchInput = page.getByPlaceholder('Search essays...');
  await searchInput.fill('thermodynamic');

  // Assert that the list filters down
  // 1. "The Thermodynamic Wall" should be visible
  await expect(page.getByRole('heading', { name: 'The Thermodynamic Wall' })).toBeVisible();

  // 2. "Strategic Whitepaper" (or others) should disappear
  await expect(page.getByRole('heading', { name: 'Strategic Whitepaper' })).not.toBeVisible();

  // Verify count is exactly 1
  await expect(essayTitles).toHaveCount(1);

  // Clear search using the X button
  const clearButton = page.getByRole('button', { name: 'Clear search' });
  await expect(clearButton).toBeVisible();
  await clearButton.click();

  // Verify list is restored to original count
  await expect(essayTitles).toHaveCount(initialCount);
});
