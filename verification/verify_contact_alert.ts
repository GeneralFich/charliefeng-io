
import { test, expect, chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Navigate to the contact page
    await page.goto('http://localhost:3000');

    // The navigation uses state-based routing. Click "Contact" in nav.
    await page.waitForSelector('nav', { state: 'visible' });

    // Click "Contact" button in nav using the precise locator
    const nav = page.locator('nav');
    await nav.getByRole('button', { name: 'Contact' }).click();

    // Verify we are on contact page. The heading text is "Contact" in ContactView.tsx
    // (Note: The previous attempt looked for "Get in Touch" which does not exist)
    await expect(page.getByRole('heading', { name: 'Contact' })).toBeVisible();

    // Trigger error by submitting empty form
    await page.getByRole('button', { name: 'Send Message' }).click();

    // Wait for error message
    // Now we expect role="alert"
    const errorAlert = page.getByRole('alert');
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText('Please fill in all required fields');

    // Verify accessibility attributes
    await expect(errorAlert).toHaveClass(/animate-in/);
    await expect(errorAlert).toHaveAttribute('aria-live', 'assertive');

    // Take screenshot
    await page.screenshot({ path: 'verification/contact_error.png' });
    console.log('Screenshot saved to verification/contact_error.png');

  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
