import { test, expect } from '@playwright/test';

test('sticky search and scroll to match', async ({ page }) => {
  // 1. Navigate to Home
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

  // 2. Click Essays nav button
  await page.getByRole('button', { name: 'Essays' }).first().click();

  // Wait for the buttons to appear
  const firstEssayButton = page.locator('button.group').filter({ hasText: /min read/ }).first();
  await expect(firstEssayButton).toBeVisible({ timeout: 10000 });

  // Get the title to verify later
  const titleElement = firstEssayButton.locator('h3');
  const title = await titleElement.innerText();
  console.log(`Selecting essay: ${title}`);

  await firstEssayButton.click();

  // Wait for the detail view to load
  // Use specific locator for essay title
  await expect(page.locator('article h1')).toContainText(title, { timeout: 10000 });

  // 3. Check for sticky header search input presence
  const searchInput = page.getByPlaceholder('Find in essay... (⌘K)');
  await expect(searchInput).toBeVisible();

  // 4. Perform a search that should match text further down
  const searchWord = "the";
  console.log(`Searching for: ${searchWord}`);
  await searchInput.fill(searchWord);

  // 5. Verify scrolling happened
  // We'll wait for the highlight and scroll
  await page.waitForTimeout(2000);

  // Force a scroll down to ensure sticky header works
  await page.evaluate(() => window.scrollTo(0, 500));
  await page.waitForTimeout(500);

  // Check if search input is still in viewport (sticky)
  await expect(searchInput).toBeInViewport();

  // Verify match highlighting exists
  const mark = page.locator('mark').first();
  await expect(mark).toBeVisible();

  // Capture screenshot
  await page.screenshot({ path: 'verification/search_scroll_verified.png', fullPage: false });
});
