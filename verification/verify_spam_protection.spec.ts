import { test, expect } from '@playwright/test';

test('verify spam protection', async ({ page }) => {
  // Go to home
  await page.goto('http://localhost:3000');

  // Wait for initial message
  await expect(page.locator('text=Hello! I can answer questions')).toBeVisible();

  // Type first message
  const input = page.getByPlaceholder('Ask anything...');
  const sendButton = page.getByRole('button', { name: 'Send message' });

  await input.fill('Spam Test');
  await sendButton.click();

  // Wait for user message to appear
  await expect(page.getByText('Spam Test', { exact: true })).toBeVisible();

  // Wait for input to be enabled (loading finished)
  await expect(input).toBeEnabled({ timeout: 10000 });

  // Type SAME message again
  await input.fill('Spam Test');
  await sendButton.click();

  // Verify error message
  // Note: The error message might take a frame to appear since it's a state update.
  await expect(page.getByText('Error: Please avoid repeating the same message.')).toBeVisible();

  // Screenshot
  await page.screenshot({ path: 'verification/spam_protection.png' });
});
