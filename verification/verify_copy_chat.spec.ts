import { test, expect } from '@playwright/test';

test('Verify Copy Chat to Clipboard button', async ({ page, context }) => {
  // Grant clipboard permissions
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);

  await page.goto('/');

  // Wait for the app to load
  await expect(page.getByRole('heading', { name: 'Charlie Feng' })).toBeVisible();

  // Initially, the button should not be visible (only visible when !isInitialState)
  // We need to send a message first.

  // Fill the chat input
  const input = page.getByPlaceholder('Ask anything...');
  await input.fill('Hello');
  await input.press('Enter');

  // Wait for the response (loading state to finish)
  // Note: The app might be fast or slow, but we expect "THINKING..." to appear or the button to eventually appear.
  // Ideally we should wait for the copy button.

  // Wait for the copy button to appear.
  // We can target it by aria-label "Copy chat to clipboard"
  const copyButton = page.getByRole('button', { name: 'Copy chat to clipboard' });
  await expect(copyButton).toBeVisible();

  // Click it
  await copyButton.click();

  // Verify icon changes to check (aria-label changes)
  await expect(page.getByRole('button', { name: 'Copied chat to clipboard' })).toBeVisible();

  // Verify clipboard content
  const handle = await page.evaluateHandle(() => navigator.clipboard.readText());
  const clipboardContent = await handle.jsonValue();

  expect(clipboardContent).toContain('**You**:');
  expect(clipboardContent).toContain('Hello');
});
