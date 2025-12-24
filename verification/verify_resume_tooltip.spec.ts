import { test, expect } from '@playwright/test';

test('verify tooltip visibility on focus for resume contact info', async ({ page }) => {
  // Go to the chat interface first
  await page.goto('http://localhost:3000/');

  // Navigate to About (Resume) page
  await page.click('button:has-text("About")');

  // Find the email copy button
  const emailButton = page.locator('button[aria-label^="Copy Email"]');
  await expect(emailButton).toBeVisible();

  // Focus the button
  await emailButton.focus();

  // Take a screenshot
  await page.screenshot({ path: 'verification/resume_copy_state.png' });

  // Check if the tooltip is visible
  // The tooltip is the span with "Click to copy" text
  const tooltip = emailButton.locator('span', { hasText: 'Click to copy' });

  // Since opacity is used for visibility, we check the CSS property
  await expect(tooltip).toHaveCSS('opacity', '1');
});
