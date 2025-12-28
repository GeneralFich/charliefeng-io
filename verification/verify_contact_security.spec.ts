import { test, expect } from '@playwright/test';

test('Contact form inputs should have maxLength attributes', async ({ page }) => {
  // Navigate to the app (baseURL is configured in playwright.config.ts)
  await page.goto('/');

  // Navigate to Contact view
  // Note: We use getByRole('button', { name: 'Contact' }) to find the nav item.
  // There are two 'Contact' buttons (desktop and mobile), but usually Playwright picks the first visible one or we can be specific.
  // The desktop one is visible by default.
  await page.getByRole('button', { name: 'Contact' }).first().click();

  // Wait for the form to appear
  await page.waitForSelector('form');

  // Check Name input
  const nameInput = page.locator('input[name="name"]');
  await expect(nameInput).toBeVisible();
  await expect(nameInput).toHaveAttribute('maxLength', '100');

  // Check Email input
  const emailInput = page.locator('input[name="email"]');
  await expect(emailInput).toBeVisible();
  await expect(emailInput).toHaveAttribute('maxLength', '100');

  // Check Subject input
  const subjectInput = page.locator('input[name="subject"]');
  await expect(subjectInput).toBeVisible();
  await expect(subjectInput).toHaveAttribute('maxLength', '200');

  // Check Message textarea
  const messageInput = page.locator('textarea[name="message"]');
  await expect(messageInput).toBeVisible();
  await expect(messageInput).toHaveAttribute('maxLength', '5000');
});
