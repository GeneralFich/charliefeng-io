
import { test, expect, chromium } from '@playwright/test';

// We'll use a standalone script runner approach since we're running via tsx/node directly
// or we can use the playwright test runner if configured.
// Given the instructions say "write a Playwright script", I'll write a standalone script.

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    permissions: ['clipboard-read', 'clipboard-write'],
  });
  const page = await context.newPage();

  try {
    console.log('Navigating to app...');
    await page.goto('http://localhost:3000');

    // Wait for the initial message to load
    console.log('Waiting for initial message...');
    await page.waitForSelector('text=Hello! I\'m Charlie\'s AI.', { timeout: 10000 });

    // Send a message to get a model response
    console.log('Sending message...');
    await page.getByPlaceholder('Ask anything...').fill('Hello');
    await page.getByRole('button', { name: 'Send message' }).click();

    // Wait for the response (model message)
    // The first message is a welcome message which is "model" role but rendered differently (ChatWelcome).
    // We need a standard chat message. The "Hello" user message will appear, then the response.
    // Wait for the user message first
    await page.waitForSelector('.bg-blue-600\\/20', { timeout: 10000 }); // User message bubble class

    // Wait for the model response (standard ChatMessage)
    // It has bg-slate-900/80
    console.log('Waiting for model response...');
    const modelMessage = page.locator('.bg-slate-900\\/80').first();
    await modelMessage.waitFor({ state: 'visible', timeout: 30000 });

    // Hover over the message to reveal the copy button
    console.log('Hovering over message...');
    await modelMessage.hover();

    // Find the copy button
    const copyButton = modelMessage.locator('button[aria-label="Copy message"]');
    await expect(copyButton).toBeVisible();

    // Click the copy button
    console.log('Clicking copy button...');
    await copyButton.click();

    // Verify aria-label changes
    console.log('Verifying aria-label change...');
    const copiedButton = modelMessage.locator('button[aria-label="Copied to clipboard"]');
    await expect(copiedButton).toBeVisible();

    // Take screenshot
    console.log('Taking screenshot...');
    await page.screenshot({ path: 'verification/copy_button_verified.png' });

    console.log('Verification successful!');
  } catch (error) {
    console.error('Verification failed:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
