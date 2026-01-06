import { test, expect } from '@playwright/test';

test('User can bookmark essays and filter by saved items', async ({ page }) => {
  console.log('Navigating to Essays...');
  await page.goto('/?view=ESSAYS');

  // Ensure we are in List view (default)
  await expect(page).toHaveURL(/view=ESSAYS/);
  await expect(page.locator('h2').filter({ hasText: 'Essays' })).toBeVisible();

  console.log('Locating first essay card...');
  const firstCard = page.locator('div[role="button"]').filter({ hasText: /read/i }).first();
  await expect(firstCard).toBeVisible();

  // Hover to reveal buttons (if needed by UI)
  await firstCard.hover();

  console.log('Clicking bookmark button...');
  const bookmarkBtn = firstCard.locator('button[title="Bookmark essay"]');
  await expect(bookmarkBtn).toBeVisible();

  // Click bookmark and ensure no navigation occurs
  await bookmarkBtn.click();
  await expect(page).toHaveURL(/view=ESSAYS/);
  expect(page.url()).not.toContain('essay=');

  console.log('Clicking Saved filter...');
  const savedFilterBtn = page.getByRole('button', { name: 'Saved', exact: true });
  await expect(savedFilterBtn).toBeVisible();
  await savedFilterBtn.click();

  // Verify filter is active and item is visible
  const visibleItems = page.locator('div[role="button"]').filter({ hasText: /read/i });
  await expect(visibleItems).toHaveCount(1);

  // Verify the saved toggle state (it should be highlighted/active)
  // Checking for the class or aria-pressed if implemented, but checking filtered count is sufficient proof
});
