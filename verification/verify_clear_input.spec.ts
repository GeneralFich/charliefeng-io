import { test, expect } from '@playwright/test';

test('Clear Input button clears text and appears correctly', async ({ page }) => {
  // Go to homepage (Chat view)
  await page.goto('http://localhost:3001');

  // Input selector
  const input = page.getByRole('textbox', { name: 'Chat message' });
  const clearButton = page.getByRole('button', { name: 'Clear input' });

  // Initially clear button should not be visible
  await expect(clearButton).not.toBeVisible();

  // Type something
  await input.fill('Hello world');

  // Clear button should be visible
  await expect(clearButton).toBeVisible();

  // Click clear button
  await clearButton.click();

  // Input should be empty
  await expect(input).toHaveValue('');

  // Clear button should be hidden again
  await expect(clearButton).not.toBeVisible();
});
