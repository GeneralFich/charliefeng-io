
import { test, expect, chromium } from '@playwright/test';

test('Verify EssayList Accessibility', async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Go to Essays page
  await page.goto('http://localhost:3000/?view=ESSAYS');

  // 1. Verify Search Input ARIA Label
  const searchInput = page.getByLabel('Search essays');
  await expect(searchInput).toBeVisible();

  // 2. Trigger Empty State
  await searchInput.fill('xyznonexistentsearchterm');

  // 3. Verify Empty State ARIA Attributes
  const emptyState = page.getByRole('status');
  await expect(emptyState).toBeVisible();
  await expect(emptyState).toHaveText(/No essays found matching "xyznonexistentsearchterm"/);

  // Take screenshot
  await page.screenshot({ path: 'verification/essay_list_a11y.png' });

  await browser.close();
});
