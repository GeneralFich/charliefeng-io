import { test, expect } from '@playwright/test';

test('verify navbar rendering and navigation', async ({ page }) => {
  await page.goto('/');

  // Verify Navbar presence
  const navbar = page.locator('nav');
  await expect(navbar).toBeVisible();

  // Verify Logo
  await expect(page.getByRole('button', { name: 'Go to Home' })).toBeVisible();

  // Verify Desktop Nav Items
  // Note: 'Chat' is removed. 'About' is renamed to 'Home'.
  await expect(page.getByRole('button', { name: 'Home' }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Essays' }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Contact' }).first()).toBeVisible();

  // Verify 'Ask Charlie' (Chat Toggle)
  await expect(page.getByRole('button', { name: 'Open chat' }).first()).toBeVisible();

  // Screenshot
  await page.screenshot({ path: 'verification/navbar_verified.png' });
});
