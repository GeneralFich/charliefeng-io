
import { test, expect } from '@playwright/test';

test('verify clear button in chat input', async ({ page }) => {
  // Go to home page
  await page.goto('/');

  // Wait for input to be visible
  const input = page.getByRole('textbox', { name: 'Chat message' });
  await expect(input).toBeVisible();

  // Type something
  await input.fill('Hello world');

  // Verify clear button appears
  const clearButton = page.getByRole('button', { name: 'Clear input' });
  await expect(clearButton).toBeVisible();

  // Take screenshot with text and button
  await page.screenshot({ path: 'verification/chat_input_filled.png' });

  // Click clear button
  await clearButton.click();

  // Verify input is empty
  await expect(input).toHaveValue('');

  // Verify clear button disappears
  await expect(clearButton).not.toBeVisible();

  // Take screenshot cleared
  await page.screenshot({ path: 'verification/chat_input_cleared.png' });
});
