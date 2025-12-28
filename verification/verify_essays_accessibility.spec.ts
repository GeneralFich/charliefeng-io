import { test, expect } from '@playwright/test';

test('essays search inputs have accessibility attributes and focus styles', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Navigate to Essays
  const essaysButton = page.getByRole('button', { name: 'Essays' });
  await essaysButton.click();

  // Wait for the Essays view to load by checking for the main heading
  await expect(page.getByRole('heading', { name: 'Essays' })).toBeVisible();

  // Check Global Search Input
  const globalSearch = page.getByRole('textbox', { name: 'Search essays' });
  await expect(globalSearch).toBeVisible();

  // Type something to show the clear button
  await globalSearch.fill('test');

  // Check Global Clear Button
  const globalClear = page.getByRole('button', { name: 'Clear search' });
  await expect(globalClear).toBeVisible();

  // Clear it
  await globalClear.click();
  await expect(globalSearch).toHaveValue('');

  // Now let's try to enter an article to check the in-article search.
  // We use a more robust locator based on the snapshot.
  // The articles are buttons with text content.
  const articleButtons = page.locator('button').filter({ hasText: 'min read' });
  await articleButtons.first().click();

  // Check In-Article Search Input
  const articleSearch = page.getByRole('textbox', { name: 'Find in essay' });
  await expect(articleSearch).toBeVisible();

  // Type something
  await articleSearch.fill('something');

  // Check Article Clear Button
  const articleClear = page.getByRole('button', { name: 'Clear search' });
  await expect(articleClear).toBeVisible();

  await articleClear.click();
  await expect(articleSearch).toHaveValue('');
});
