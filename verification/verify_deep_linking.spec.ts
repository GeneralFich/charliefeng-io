import { test, expect } from '@playwright/test';
import { View } from '../types';

test.describe('Deep Linking and Share Feature', () => {
  test('navigating between views updates URL', async ({ page }) => {
    await page.goto('/');

    // Wait for the app to be ready
    await page.waitForLoadState('networkidle');

    // Go to About
    await page.getByRole('button', { name: 'About' }).first().click();
    await expect(page).toHaveURL(/view=ABOUT/);

    // Go back to Home
    await page.getByRole('button', { name: 'Chat' }).first().click();
    await expect(page).toHaveURL(/view=HOME/);
  });

  test('loading URL with view param opens correct view', async ({ page }) => {
    await page.goto('/?view=ABOUT');

    // Check for the "Download PDF" button by its accessible name (aria-label)
    await expect(page.getByLabel('Print or Save as PDF')).toBeVisible();

    // Also verify the heading - use exact match or filter to find the one in the Resume content
    // The logo also has "Charlie Feng" but it might be inside a button
    // The main heading in Resume is H1
    await expect(page.locator('main h1').filter({ hasText: 'Charlie Feng' })).toBeVisible();
  });

  test('loading URL with essay param opens specific essay', async ({ page }) => {
    const slug = 'strategic-whitepaper';
    await page.goto(`/?view=ESSAYS&essay=${slug}`);

    await expect(page.locator('article h1')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Back to Essays' })).toBeVisible();
  });

  test('share button copies correct URL to clipboard', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    await page.goto('/?view=ESSAYS');

    // Click on the first essay
    await page.locator('button.group.flex-col').first().click();

    // Get the share button
    const shareButton = page.getByRole('button', { name: 'Share' });
    await expect(shareButton).toBeVisible();

    await shareButton.click();

    await expect(page.getByText('Copied!')).toBeVisible();

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toContain('?view=ESSAYS&essay=');
  });
});
