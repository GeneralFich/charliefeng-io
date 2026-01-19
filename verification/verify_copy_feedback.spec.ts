import { test, expect } from '@playwright/test';

test('verify copy button feedback', async ({ page }) => {
  page.on('console', msg => console.log(`BROWSER LOG: ${msg.text()}`));
  page.on('pageerror', err => console.log(`BROWSER ERROR: ${err}`));

  // Mock clipboard API
  await page.addInitScript(() => {
    if (!navigator.clipboard) {
        // @ts-ignore
        navigator.clipboard = {};
    }
    navigator.clipboard.writeText = async (text) => {
        console.log('Mock writeText called with:', text);
        return Promise.resolve();
    };
  });

  await page.goto('/?view=ESSAYS');

  const card = page.locator('article, div[role="button"]').filter({ hasText: 'min read' }).first();
  await expect(card).toBeVisible();
  await card.hover();

  const shareButton = card.getByRole('button', { name: 'Copy link to clipboard' });
  await expect(shareButton).toBeVisible();

  console.log('Clicking share button...');
  await shareButton.click();

  // Verify feedback
  // Use exact match to avoid matching the parent container if it includes the button text in its name
  const successButton = page.getByRole('button', { name: 'Link copied to clipboard', exact: true });
  await expect(successButton).toBeVisible();
  await expect(successButton).toHaveAttribute('title', 'Copied!');

  // Take a screenshot for verification
  await page.screenshot({ path: 'verification/copy_feedback.png' });
});
