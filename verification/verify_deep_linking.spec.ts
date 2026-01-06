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

    // Wait for list to load
    await page.waitForLoadState('networkidle');

    // Get the share button from the first item
    const shareButton = page.getByRole('button', { name: 'Copy link' }).first();

    // Hover over the first item to reveal the share button (it's opacity-0)
    await page.locator('div.group').first().hover();

    // Now it should be visible/clickable? Or we can just click it (Playwright handles opacity if we force, or if hover makes it visible)
    // Actually, getByRole('button', { name: 'Copy link' }) matches the button.
    // The previous test logic was: click item -> go to detail -> click share.
    // But my change to test logic was: click item -> go to detail? No, I tried to click item then get share button?
    // The error says "Copy link" not found.
    // Wait, "Copy link" is on the list item. "Share" is on the detail view.

    // If we want to test "Share button copies correct URL", we can test either the one on list item or detail view.
    // The previous test seemed to navigate to detail view.
    // Let's stick to the original intent: Navigate to detail view and use Share button there.

    await page.locator('div[role="button"]').first().click();

    // Now we should be in detail view.
    const shareButtonDetail = page.getByRole('button', { name: 'Share' });
    await expect(shareButtonDetail).toBeVisible();
    await shareButtonDetail.click();

    // The new button shows a Check icon, no text "Copied!"
    // But maybe we can check for the check icon or just check clipboard

    // Actually the share button inside EssayItem does stopPropagation, so clicking it won't navigate.
    // The test clicks the essay item first, which navigates to detail view?
    // Wait, the previous test might have assumed detail view share button.
    // Let's check where we are.
    // If we are on list view, EssayItem has a share button.
    // If we clicked the essay, we are on detail view.
    // The test says "Click on the first essay" then "Get the share button".
    // If we click the essay, we go to detail view.
    // Detail view has a share button "Share".
    // List view item has a share button "Copy link".

    // If the previous test worked, it means clicking 'button.group.flex-col' navigated to detail view.
    // My refactor changed EssayItem from button to div (wait, let me check EssayItem).
    // Yes, EssayItem is now a div with role="button".

    // So if I click the div, I go to detail view.
    // Then I should look for 'Share' button in detail view.

    // Let's correct the locator for the essay item.
    // It's a div with role="button".
    // But there might be multiple buttons.
    // The essay item has text content.
    // Let's use a more robust locator.

    // await page.locator('div[role="button"]').first().click();

    // // Now we should be in detail view.
    // const shareButtonDetail = page.getByRole('button', { name: 'Share' });
    // await expect(shareButtonDetail).toBeVisible();
    // await shareButtonDetail.click();

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toContain('?view=ESSAYS&essay=');
  });
});
