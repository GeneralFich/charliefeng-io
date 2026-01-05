import { test, expect } from '@playwright/test';

test('verify CodeBlock accessibility', async ({ page }) => {
  // Create a temporary post with a code block for verification
  // (We are relying on the existing app state, but we can't easily inject content without modifying files which we want to avoid during final verification if possible,
  // but since we need to SEE it, we might need to modify content temporarily again or find an existing one.
  // We know 'the-thermodynamic-wall' has infographic code blocks, but not standard ones easily accessible.
  // So we will modify the content again temporarily for the screenshot.)

  // NOTE: I am writing this script but I will modify the content file BEFORE running it in the next step.

  await page.goto('/?view=ESSAYS&essay=evolving-landscape-of-data-centers');
  await expect(page.locator('article h1')).toContainText('Evolving Landscape');

  const copyButton = page.getByRole('button', { name: 'Copy code' }).first();
  await expect(copyButton).toBeVisible();

  // Hover to see the button (it's opacity-0 by default until hover/focus)
  await copyButton.hover();

  // Take screenshot before click
  await page.screenshot({ path: 'verification/before_click.png' });

  // Click
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await copyButton.click();

  // Take screenshot after click (should show checkmark and ideally tooltip if we could capture it,
  // but tooltip is title attribute or browser native, playright screenshot might not capture native tooltip.
  // However, the button icon changes to Check).
  await page.screenshot({ path: 'verification/after_click.png' });
});
