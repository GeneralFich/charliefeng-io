import { test, expect } from '@playwright/test';

test.describe('Rate Limiting Security', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => {
        window.localStorage.clear();
    });
  });

  test('should persist rate limit across reloads', async ({ page }) => {
    // 1. Send messages up to the limit (10)
    // We mock the API to be fast and not cost money
    await page.route('https://generativelanguage.googleapis.com/**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          candidates: [{
            content: {
              parts: [{ text: "Mock response" }]
            }
          }]
        })
      });
    });

    const input = page.getByRole('textbox', { name: 'Chat message' });
    const sendButton = page.getByRole('button', { name: 'Send message' });

    // Send 10 messages
    for (let i = 0; i < 10; i++) {
        await input.fill(`Message ${i}`);
        await sendButton.click();
        // Wait for response to appear or input to clear
        await expect(input).toBeEmpty();
        // Small delay to ensure state updates
        await page.waitForTimeout(100);
    }

    // 2. Verify localStorage has data
    const storage = await page.evaluate(() => localStorage.getItem('chat_rate_limit_timestamps'));
    expect(storage).toBeTruthy();
    const timestamps = JSON.parse(storage as string);
    expect(timestamps.length).toBe(10);

    // 3. Reload the page
    await page.reload();

    // 4. Try to send the 11th message
    await input.fill('Message 11 - Should fail');
    await sendButton.click();

    // 5. Check for rate limit error message
    // "System: Rate limit exceeded"
    await expect(page.getByText(/System: Rate limit exceeded/)).toBeVisible();
  });
});
