import { test, expect } from '@playwright/test';

test('Verify sticky headers in Essays list and detail view', async ({ page }) => {
  // 1. Navigate to Home
  await page.goto('/');

  // Click "Essays" in nav to ensure correct view
  await page.getByRole('button', { name: 'Essays', exact: true }).click();

  await expect(page.getByRole('heading', { name: 'Essays', level: 2 })).toBeVisible();

  // 2. Locate the Search box on the list page
  const listSearch = page.getByPlaceholder('Search essays...');
  await expect(listSearch).toBeVisible();

  // 3. Scroll down significantly
  // Ensure the page has enough content to scroll. The essays list usually has items.
  // We'll check if there are essays first.
  await expect(page.locator('button').filter({ hasText: 'min read' }).first()).toBeVisible();

  await page.evaluate(() => window.scrollTo(0, 1000));

  // 4. Verify Search box is still in viewport (sticky)
  // Initially this might fail if not sticky
  await expect(listSearch).toBeInViewport({ ratio: 0.1 });

  // 5. Navigate to an essay (click the first one)
  await page.locator('button').filter({ hasText: 'min read' }).first().click();

  // Wait for detail view to load
  await expect(page.getByText('Back to Essays')).toBeVisible();

  // 6. Locate sticky elements in detail view
  const backButton = page.getByRole('button', { name: 'Back to Essays' });
  const detailSearch = page.getByPlaceholder('Find in essay...');

  // 7. Scroll down significantly in detail view
  await page.evaluate(() => window.scrollTo(0, 2000));

  // 8. Verify elements are still in viewport
  await expect(backButton).toBeInViewport();
  await expect(detailSearch).toBeInViewport();
});
