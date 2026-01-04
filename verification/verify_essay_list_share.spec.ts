import { test, expect } from '@playwright/test';

test('Verify share button on essay list items', async ({ page, context }) => {
  // Grant clipboard permissions
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);

  await page.goto('/?view=ESSAYS');

  // Wait for list to load
  await expect(page.getByRole('heading', { name: 'Essays' })).toBeVisible();

  // Find the first essay card
  const firstPost = page.locator('div[role="button"]').first();
  await expect(firstPost).toBeVisible();

  // Hover to reveal share button
  await firstPost.hover();

  // Find share button within the card
  const shareButton = firstPost.locator('button[aria-label="Copy link to clipboard"]');
  await expect(shareButton).toBeVisible();

  // Get current URL to check navigation doesn't happen
  const initialUrl = page.url();

  // Click share button
  await shareButton.click();

  // Verify URL hasn't changed (no navigation to detail view)
  expect(page.url()).toBe(initialUrl);

  // Wait for clipboard content
  const handle = await page.evaluateHandle(() => navigator.clipboard.readText());
  const clipboardContent = await handle.jsonValue();

  // Verify URL format
  expect(clipboardContent).toContain('?view=ESSAYS');
  expect(clipboardContent).toContain('&essay=');
});
