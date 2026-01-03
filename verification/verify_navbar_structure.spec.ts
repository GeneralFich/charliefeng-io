import { test, expect } from '@playwright/test';

test('verify navbar structure and navigation', async ({ page }) => {
  // 1. Arrange: Go to home page
  await page.goto('http://localhost:3000');

  // 2. Assert: Verify desktop nav items exist
  await expect(page.getByRole('button', { name: 'Chat' }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'About' }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Essays' }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Contact' }).first()).toBeVisible();

  // 3. Act: Click on 'About'
  await page.getByRole('button', { name: 'About' }).first().click();

  // 4. Assert: Check if view changed (Resume component visible)
  // Assuming Resume has a unique header or text
  await expect(page.getByRole('heading', { name: 'Charlie Feng', exact: true }).last()).toBeVisible(); // Resume header

  // 5. Screenshot
  await page.screenshot({ path: 'verification/navbar_refactor.png' });
});
