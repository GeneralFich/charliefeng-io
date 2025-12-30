import { test, expect } from '@playwright/test';

test('verify in-article search navigation', async ({ page }) => {
  // 1. Navigate to the app (using UI navigation to be safe)
  await page.goto('/');

  // Open mobile menu if needed (screen size dependent, but usually desktop in tests)
  // Check if mobile menu button is visible, if so click it.
  const menuButton = page.getByLabel('Open menu');
  if (await menuButton.isVisible()) {
    await menuButton.click();
  }

  // Click Essays nav item
  await page.getByRole('button', { name: 'Essays' }).click();

  // Wait for the list to load and click the specific essay
  // Using a loose text match for the title
  const essayLink = page.getByText('Making Data Centers Greener', { exact: false }).first();
  await expect(essayLink).toBeVisible();
  await essayLink.click();

  // 2. Locate the search input
  // Wait for the detail view to load
  const searchInput = page.getByPlaceholder('Find in essay... (⌘K)');
  await expect(searchInput).toBeVisible();

  // 3. Search for a term with multiple occurrences
  await searchInput.fill('machine');

  // 4. Verify match counter appears (format: "1 / X")
  const counter = page.locator('text=/\\d+ \\/ \\d+/');
  await expect(counter).toBeVisible();

  // 5. Verify navigation buttons exist
  const nextButton = page.getByRole('button', { name: 'Next match' });
  const prevButton = page.getByRole('button', { name: 'Previous match' });

  await expect(nextButton).toBeVisible();
  await expect(prevButton).toBeVisible();

  // 6. Test navigation
  // Get initial counter text (e.g., "1 / 5")
  const initialText = await counter.textContent();
  expect(initialText).toContain('1 /');

  // Click next -> should be "2 / X"
  await nextButton.click();
  const secondText = await counter.textContent();
  expect(secondText).toContain('2 /');

  // Click prev -> should be "1 / X"
  await prevButton.click();
  const backText = await counter.textContent();
  expect(backText).toContain('1 /');
});
