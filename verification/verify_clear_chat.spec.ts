import { test, expect } from '@playwright/test';

test('Clear Chat button requires confirmation', async ({ page }) => {
  await page.goto('/');

  // Wait for initial load
  await expect(page.getByText("Hello! I'm Charlie's AI Digital Twin")).toBeVisible();

  // Type a message to ensure we are not in initial state (buttons are hidden in initial state)
  const input = page.getByPlaceholder('Ask me a question...');
  await input.fill('Test message');
  await input.press('Enter');

  // Wait for the user message to appear
  await expect(page.getByText('Test message', { exact: true })).toBeVisible();

  // Find the Clear Chat button
  const clearButton = page.getByLabel('Clear chat');
  await expect(clearButton).toBeVisible();

  // First click: Should NOT clear, but change state
  await clearButton.click();

  // Verify state change
  await expect(page.getByTitle('Confirm Clear')).toBeVisible();

  // Screenshot of confirmation state
  await page.screenshot({ path: 'verification/clear_confirmation_state.png' });

  // Second click: Should Clear
  await page.getByLabel('Confirm Clear').click();

  // Verify clear
  await expect(page.getByText('Test message', { exact: true })).not.toBeVisible();

  // Screenshot of cleared state
  await page.screenshot({ path: 'verification/cleared_state.png' });
});
