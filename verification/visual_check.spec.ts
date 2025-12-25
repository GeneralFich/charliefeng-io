import { test, expect } from '@playwright/test';

test('Verify contact page visuals', async ({ page }) => {
  await page.goto('/');

  // Navigate to Contact page
  await page.getByRole('button', { name: 'Contact', exact: true }).click();

  // Wait for the contact view to be visible - the heading is 'Contact' level 2
  await expect(page.getByRole('heading', { name: 'Contact' })).toBeVisible();

  // Take a screenshot of the top area where the progress bar should NOT be
  // We'll capture the top 100px of the viewport, which includes the nav (64px) and some content
  await page.screenshot({ path: 'verification/contact_page_no_progress.png', clip: { x: 0, y: 0, width: 1280, height: 100 } });
});
