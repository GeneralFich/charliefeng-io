import { test, expect } from '@playwright/test';

test('rate limit persists across reloads', async ({ page }) => {
  // Mock the Gemini API to be fast and not use quota
  await page.route('**/models/gemini-3-flash-preview:generateContent*', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        candidates: [{
          content: {
            parts: [{ text: "I am a mock response." }]
          },
          role: "model"
        }]
      })
    });
  });

  await page.goto('/');

  // wait for initial message
  await expect(page.locator('text=Hello! I can answer questions')).toBeVisible();

  // Send 10 messages to hit the limit (limit is 10 per minute)
  // Note: The first "Hello!" message is hardcoded and doesn't count against rate limit.
  for (let i = 0; i < 10; i++) {
    // Wait for input to be enabled (not loading)
    const input = page.getByPlaceholder('Ask anything...');
    await expect(input).toBeEnabled();

    await input.fill(`Message ${i}`);
    await page.getByRole('button', { name: 'Send message' }).click();

    // Wait for the mock response to appear to ensure the cycle completes
    // We use a specific selector to ensure we are seeing the NEW response
    // Since all responses are identical, we check the count or wait for loading to finish
    await expect(page.getByLabel('Send message')).toBeVisible(); // Button goes back to "Send message" from "Sending..."
  }

  // 11th message should be blocked
  await page.getByPlaceholder('Ask anything...').fill('Message 11');
  await page.getByRole('button', { name: 'Send message' }).click();

  // Expect error message
  await expect(page.locator('text=System: Rate limit exceeded')).toBeVisible();

  // RELOAD the page
  await page.reload();

  // Wait for app to hydrate
  await expect(page.getByPlaceholder('Ask anything...')).toBeVisible();

  // Try to send another message immediately.
  // If persistence works, this should still be blocked because we are still within the 1-minute window of the previous 10 requests.
  await page.getByPlaceholder('Ask anything...').fill('Message 12 (After Reload)');
  await page.getByRole('button', { name: 'Send message' }).click();

  // Expect error message AGAIN
  // This step will FAIL if persistence is not implemented
  await expect(page.locator('text=System: Rate limit exceeded')).toBeVisible();
});
