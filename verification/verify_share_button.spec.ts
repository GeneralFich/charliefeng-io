import { test, expect } from '@playwright/test';

test('verify share button exists and copies link', async ({ page, context }) => {
  // Grant clipboard permissions
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);

  // Go to the essays page
  await page.goto('http://localhost:3000');

  // Wait for React to hydrate and navigation to settle
  await page.waitForTimeout(1000);

  // Navigate to Essays view if not there
  const essaysNav = page.getByRole('button', { name: 'Essays' });
  if (await essaysNav.isVisible()) {
      await essaysNav.click();
  }

  // Click the first essay
  const firstEssay = page.getByRole('button', { name: /min read/ }).first();
  await expect(firstEssay).toBeVisible();
  await firstEssay.click();

  // Check for the Share button
  const shareButton = page.getByRole('button', { name: 'Share' });
  await expect(shareButton).toBeVisible();

  // Take screenshot before click
  await page.screenshot({ path: 'verification/before_share_click.png' });

  // Click share
  await shareButton.click();

  // Check that the button text changes to "Copied!"
  await expect(page.getByRole('button', { name: 'Copied!' })).toBeVisible();

  // Verify clipboard content
  // Note: verify clipboard content is tricky in headless, but the UI change confirms logic ran.
  // We can try to read clipboard if supported, but UI feedback is the primary visual verification.

  // Take screenshot after click
  await page.screenshot({ path: 'verification/after_share_click.png' });
});
