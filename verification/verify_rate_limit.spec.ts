import { test, expect } from '@playwright/test';

test('Chat basic functionality works (Rate Limit Smoke Test)', async ({ page }) => {
  // 1. Go to homepage
  await page.goto('/');

  // 2. Wait for chat input
  const input = page.getByLabel('Chat message');
  await expect(input).toBeVisible();

  // 3. Send a message
  await input.fill('Hello Test');
  await page.keyboard.press('Enter');

  // 4. Verify message appears in chat
  await expect(page.getByText('Hello Test')).toBeVisible();

  // 5. Verify system is "Thinking..." (loader appears)
  await expect(page.getByLabel('Sending message...')).toBeVisible();

  // Note: We don't wait for the full response as that depends on the external API.
  // The fact that the message was added and "Thinking" state triggered means
  // the rate limiter allowed the first request.
});
