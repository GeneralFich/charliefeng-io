import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const page = await context.newPage();

  try {
    await page.goto('http://localhost:3000/?view=ESSAYS');

    // Wait for the list to load
    await page.waitForSelector('h2:has-text("Essays")');

    // Find the first list item
    const firstPost = page.locator('div[role="button"]').first();
    await firstPost.hover();

    // Take a screenshot of the list with the hovered item showing the share button
    await page.screenshot({ path: 'verification/essay_list_share.png' });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();
