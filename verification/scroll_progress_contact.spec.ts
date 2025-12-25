import { test, expect } from '@playwright/test';

test('ScrollProgress visibility', async ({ page }) => {
  await page.goto('/');

  // Navigate to About page
  await page.getByRole('button', { name: 'About', exact: true }).click();

  // Verify ScrollProgress is present on About page
  // The component has classes: fixed top-[64px] left-0 h-1 bg-blue-500
  const progressBar = page.locator('.fixed.top-\\[64px\\].left-0.h-1.bg-blue-500');
  await expect(progressBar).toBeAttached();

  // Navigate to Contact page
  await page.getByRole('button', { name: 'Contact', exact: true }).click();

  // Verify ScrollProgress is NOT present on Contact page
  await expect(progressBar).not.toBeAttached();
});
