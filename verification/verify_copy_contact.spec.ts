import { test, expect } from '@playwright/test';

test('resume contact info is interactive and shows feedback', async ({ page, context }) => {
  // Grant clipboard permissions
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);

  await page.goto('http://localhost:3000');

  // Navigate to About (Resume) using the button/tab
  // The nav button text is "About"
  const aboutNavButton = page.getByRole('button', { name: 'About' }).first();
  await aboutNavButton.click();

  // Wait for the Resume content to load by checking for the 'Professional Experience' heading
  // which is in the snapshot (ref=e71)
  await expect(page.getByRole('heading', { name: 'Professional Experience' })).toBeVisible();

  // Find the email copy button
  // Note: Using a specific locator strategy based on the aria-label we added
  // In the snapshot: 'button "Copy Email: charliefengsq@gmail.com" [ref=e47] [cursor=pointer]'
  const emailButton = page.getByRole('button', { name: /Copy Email/ });
  await expect(emailButton).toBeVisible();

  // Click the email button
  await emailButton.click();

  // Check that the "Copied!" text exists in the DOM.
  // In snapshot it shows generic text "Click to copy" inside the button.
  // After click, it should change to "Copied!".
  const copiedTooltip = page.getByText('Copied!', { exact: true });
  await expect(copiedTooltip).toBeAttached();

  // Verify clipboard content
  const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboardText).toContain('@'); // Basic check for email-like content

  // Take a screenshot of the "Copied" state
  await page.screenshot({ path: 'verification/resume_copy_state.png' });
});
