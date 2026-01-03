import { test, expect } from '@playwright/test';

test('verify rate limiting blocks messages after limit exceeded', async ({ page }) => {
  // 1. Mock the API to be instant so we can send messages rapidly
  await page.route('https://generativelanguage.googleapis.com/**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        candidates: [{
          content: { parts: [{ text: "Mock response" }] },
          finishReason: "STOP"
        }]
      })
    });
  });

  await page.goto('/');

  // 2. Wait for initial load
  await expect(page.getByRole('textbox', { name: 'Chat message' })).toBeVisible();

  // 3. Send 12 messages rapidly
  // The rate limit we will implement is 10 messages per minute.
  // We send 12 to ensure we hit it.
  for (let i = 1; i <= 12; i++) {
    const input = page.getByRole('textbox', { name: 'Chat message' });
    await input.fill(`Message ${i}`);
    await input.press('Enter');

    // Wait for the "Thinking..." state to resolve (which should be fast due to mock)
    // We wait for the specific message to appear to ensure the cycle is complete
    if (i <= 10) {
      // For the first 10, we expect normal responses
      await expect(page.getByText('Mock response').nth(i - 1)).toBeVisible();
    } else {
       // For 11+, we expect immediate rejection, so no "Thinking" or mock response
       // We just wait a tiny bit to ensure UI updated
       await page.waitForTimeout(100);
    }
  }

  // 4. Verify that the rate limit warning appears
  // Use .first() because if the user spam clicked, it might appear multiple times.
  const warningText = "You are sending messages too quickly. Please wait a moment.";
  await expect(page.getByText(warningText).first()).toBeVisible();
});
