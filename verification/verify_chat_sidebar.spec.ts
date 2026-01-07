import { test, expect } from '@playwright/test';

test('Verify persistent chat sidebar toggle', async ({ page }) => {
  // Go to the app
  await page.goto('http://localhost:3000');

  // 1. Verify we are on the "Home" (About) page by default and CONTENT is visible
  await expect(page.getByText('Executive Summary')).toBeVisible();

  // 2. Click the "Ask Charlie" (Chat) toggle button
  const chatToggle = page.getByRole('button', { name: 'Open chat' }).first();
  await expect(chatToggle).toBeVisible();
  await chatToggle.click();

  // 3. Verify the chat sidebar appears
  const chatInput = page.getByRole('textbox', { name: 'Chat message' });
  await expect(chatInput).toBeVisible();

  // 4. Send a message to verify context injection
  await chatInput.fill('What is this page?');
  const sendButton = page.getByRole('button', { name: 'Send message' });
  await sendButton.click();

  // 5. Verify User Message is visible
  await expect(page.getByText('What is this page?')).toBeVisible();

  // 6. Close the sidebar
  const closeChatToggle = page.getByRole('button', { name: 'Close chat' }).first();
  await expect(closeChatToggle).toBeVisible();
  await closeChatToggle.click();

  // 7. Verify the toggle button reverts to "Open chat"
  await expect(page.getByRole('button', { name: 'Open chat' }).first()).toBeVisible();

  // 8. Verify chat is hidden
  await page.waitForTimeout(1000);
  await expect(chatInput).not.toBeVisible();
});
