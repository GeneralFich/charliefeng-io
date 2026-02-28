import { test, expect } from '@playwright/test';

test('verify EssayItem accessibility structure', async ({ page }) => {
  // Navigate to Essays view
  await page.goto('http://localhost:3000/essays');

  // Wait for the list to load
  await expect(page.getByRole('heading', { name: 'Essays', level: 2 })).toBeVisible();

  // Find the first h3 title
  const firstTitle = page.locator('h3').first();
  await expect(firstTitle).toBeVisible();

  // 1. Assert that the card container does NOT have role="button"
  // The card is the grandparent of the h3 (h3 is inside div which is inside card div)
  const card = firstTitle.locator('xpath=../..');

  // Initially, this SHOULD FAIL because it currently has role="button"
  const role = await card.getAttribute('role');
  expect(role).not.toBe('button');

  // 2. Assert that the title IS contained within a button
  // Initially, this SHOULD FAIL because it's just text inside h3
  const titleButton = firstTitle.locator('button');
  await expect(titleButton).toBeVisible();

  // 3. Verify interaction
  // Clicking the title button should change the view (implied by it being a button)
  // We can check if onClick works later, but structure is key here.

  // Take screenshot for verification
  await page.screenshot({ path: 'verification/essay_item_a11y.png' });
});
