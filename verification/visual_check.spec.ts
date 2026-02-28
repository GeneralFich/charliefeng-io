import { test, expect } from '@playwright/test';

test('Capture screenshot of math formulas', async ({ page }) => {
  await page.goto('/essays/the-thermodynamic-wall');
  await expect(page.getByRole('heading', { name: 'The Thermodynamic Wall' })).toBeVisible();

  // Wait for katex to render
  await expect(page.locator('.katex').first()).toBeVisible();

  // Scroll to the specific formula
  // The formula is "Cp ≈ 1.005 J/g·K"
  const formula = page.locator('.katex', { hasText: '1.005' });
  if (await formula.isVisible()) {
      await formula.scrollIntoViewIfNeeded();
  }

  // Take a screenshot of the visible area
  await page.screenshot({ path: 'verification/math_rendering.png', fullPage: false });
});
