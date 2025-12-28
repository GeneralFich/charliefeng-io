
import { test, expect } from '@playwright/test';

test('Verify Essays Refactor', async ({ page }) => {
  // 1. Navigate to the Essays page (assuming it's accessible via navigation)
  // Since it's a SPA, we might need to click the nav item.
  await page.goto('http://localhost:3000/');

  // Wait for hydration
  await page.waitForTimeout(1000);

  // Click on "Essays" in navigation
  await page.getByRole('button', { name: 'Essays' }).click();

  // 2. Verify List View
  await expect(page.getByRole('heading', { name: 'Essays' })).toBeVisible();
  await expect(page.getByPlaceholder('Search essays...')).toBeVisible();

  // Check if at least one essay is visible (assuming BLOG_POSTS is not empty)
  // We look for the "min read" text which is common in the list items
  await expect(page.locator('text=min read').first()).toBeVisible();

  // Take a screenshot of the list view
  await page.screenshot({ path: 'verification/essay_list.png' });

  // 3. Verify Detail View
  // Click the first essay
  await page.locator('button.group.flex.flex-col').first().click();

  // Expect back button to be visible
  await expect(page.getByText('Back to Essays')).toBeVisible();

  // Expect article content
  await expect(page.locator('article')).toBeVisible();

  // Take a screenshot of the detail view
  await page.screenshot({ path: 'verification/essay_detail.png' });

  // 4. Verify Back Navigation
  await page.getByText('Back to Essays').click();
  await expect(page.getByRole('heading', { name: 'Essays' })).toBeVisible();
});
