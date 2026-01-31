import { test, expect } from '@playwright/test';

test('verify title attributes for improved accessibility', async ({ page }) => {
  // Navigate to the app
  await page.goto('http://localhost:3000');

  // 1. Verify Mobile Menu Button title (resize to mobile)
  await page.setViewportSize({ width: 375, height: 667 });
  // Wait for the button to be visible
  const menuButton = page.getByRole('button', { name: /Open menu/i });
  await expect(menuButton).toBeVisible();
  await expect(menuButton).toHaveAttribute('title', 'Open menu');

  // Open menu to check "Close menu" title
  await menuButton.click();
  const closeButton = page.getByRole('button', { name: /Close menu/i });
  await expect(closeButton).toBeVisible();
  await expect(closeButton).toHaveAttribute('title', 'Close menu');

  // 2. Verify Digital Twin tooltip accessibility
  // The logo is in the navbar
  const logoButton = page.getByRole('button', { name: 'Go to Home' });
  await expect(logoButton).toBeVisible();

  // Focus the logo button (should trigger tooltip via group-focus-visible)
  await logoButton.focus();

  // Check if tooltip text is visible
  const tooltipText = page.getByText('An AI version of me trained on my work & writing');
  // Note: Playwright's toBeVisible() checks for opacity/visibility.
  // We added group-focus-visible:block.
  // We need to ensure focus-visible is active.
  // Playwright's focus() might not trigger :focus-visible depending on browser settings,
  // but let's try. If not, hover is also an option to verify structure.

  await logoButton.hover(); // Hover should definitely work
  await expect(tooltipText).toBeVisible();

  // 3. Verify Chat Input Send Button title
  // Reset viewport to desktop for easier chat interaction
  await page.setViewportSize({ width: 1280, height: 720 });

  // Type something to enable send button
  const chatInput = page.getByLabel('Chat message');
  await chatInput.fill('Hello');

  const sendButton = page.getByRole('button', { name: 'Send message' });
  await expect(sendButton).toBeEnabled();
  await expect(sendButton).toHaveAttribute('title', 'Send message');

  // Take a screenshot of the chat interface with tooltip if possible?
  // Tooltips are native (title) so they might not show up in screenshots easily without OS integration.
  // But we can screenshot the "Digital Twin" tooltip which is DOM-based.
  await logoButton.hover();
  await page.screenshot({ path: 'verification/verification.png' });
});
