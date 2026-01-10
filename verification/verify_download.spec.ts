import { test, expect } from '@playwright/test';

test('chat interface download button works', async ({ page }) => {
  // 1. Arrange: Go to home page
  await page.goto('http://localhost:3001');

  // 2. Act: Send a message to get into non-initial state
  // Using the actual placeholder from the snapshot
  const input = page.getByRole('textbox', { name: 'Chat message' });
  await input.fill('Hello');
  await page.keyboard.press('Enter');

  // Wait for response to appear (or just check the buttons appear)
  // We need to wait for the "Download chat" button to be visible.
  // It appears when messages.length > 1 (initial msg + user msg).
  const downloadBtn = page.getByRole('button', { name: 'Download chat' });
  await expect(downloadBtn).toBeVisible({ timeout: 10000 });

  // 3. Screenshot the chat interface with the button
  await page.screenshot({ path: 'verification/chat_download_btn.png' });
});
