import { test, expect } from '@playwright/test';

test('verify clear input button functionality', async ({ page }) => {
  // Navigate to the app
  await page.goto('http://localhost:3000');

  // Locate the chat input
  const chatInput = page.getByRole('textbox', { name: 'Chat message' });
  await expect(chatInput).toBeVisible();

  // Type some text
  await chatInput.fill('Hello, world!');

  // Locate the clear button - it should be visible now
  // Since I haven't added it yet, I'll use a locator that I intend to add: aria-label="Clear input"
  const clearButton = page.getByRole('button', { name: 'Clear input' });

  // Verify it's visible
  await expect(clearButton).toBeVisible();

  // Click the clear button
  await clearButton.click();

  // Verify the input is empty
  await expect(chatInput).toHaveValue('');

  // Verify the input has focus
  await expect(chatInput).toBeFocused();

  // Verify the clear button is hidden when input is empty
  await expect(clearButton).toBeHidden();
});
