import { chromium } from 'playwright';

async function verifySearchHighlighting() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('Navigating to Essays page...');
    await page.goto('http://localhost:3000');

    // Wait for initial load
    await page.waitForTimeout(1000);

    // Open Essays view (assuming navigation via button)
    // Click "Essays" in nav (if it exists) or directly navigate if possible.
    // Based on memory, app is SPA.
    await page.getByRole('button', { name: 'Essays' }).click();
    await page.waitForTimeout(1000);

    console.log('Searching for "infrastructure"...');
    // Find the global search input
    const searchInput = page.getByPlaceholder('Search essays...');
    await searchInput.fill('infrastructure');
    await page.waitForTimeout(500); // Wait for debounce/render

    // Take screenshot of list view highlighting
    await page.screenshot({ path: 'verification/search_list_highlight.png', fullPage: true });
    console.log('Screenshot of list view saved.');

    // Click on the first result
    console.log('Opening first result...');
    // Assuming the list items are buttons or contain links
    // The code says: button with onClick
    // We can click the first button in the grid
    await page.locator('button.group.flex.flex-col').first().click();

    await page.waitForTimeout(1000);

    // Now in detail view.
    // Use in-article search
    console.log('Using in-article search...');
    const articleSearchInput = page.getByPlaceholder('Find in essay...');
    await articleSearchInput.fill('AI');

    await page.waitForTimeout(500);

    // Take screenshot of article highlighting
    await page.screenshot({ path: 'verification/search_article_highlight.png', fullPage: true });
    console.log('Screenshot of article view saved.');

  } catch (error) {
    console.error('Verification failed:', error);
  } finally {
    await browser.close();
  }
}

verifySearchHighlighting();
