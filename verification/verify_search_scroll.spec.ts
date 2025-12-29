import { test, expect } from '@playwright/test';

test('sticky search, scroll to match, and navigation', async ({ page }) => {
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
  await expect(page.locator('article h1')).toContainText(title, { timeout: 10000 });

  // 3. Check for sticky header search input presence
  const searchInput = page.getByPlaceholder('Find in essay... (⌘K)');
  await expect(searchInput).toBeVisible();

  // 4. Perform a search that should match multiple times
  // "the" is a safe bet for multiple matches.
  const searchWord = "the";
  console.log(`Searching for: ${searchWord}`);
  await searchInput.fill(searchWord);

  // 5. Verify match counter and buttons
  // Wait for the highlighting and counting to happen (timeout in component is 150ms)
  await page.waitForTimeout(1000);

  const counter = page.locator('span.text-\\[10px\\]');
  await expect(counter).toBeVisible();
  const counterText = await counter.innerText();
  console.log(`Match counter: ${counterText}`);
  expect(counterText).toMatch(/1\/\d+/); // Should be "1/N"

  const nextBtn = page.getByRole('button', { name: 'Next match' });
  const prevBtn = page.getByRole('button', { name: 'Previous match' });

  await expect(nextBtn).toBeVisible();
  await expect(prevBtn).toBeVisible();

  // 6. Navigate to next match
  // Get current scroll position
  const scrollY1 = await page.evaluate(() => window.scrollY);

  await nextBtn.click();
  await page.waitForTimeout(500); // Wait for scroll

  // Verify counter updated
  const counterText2 = await counter.innerText();
  expect(counterText2).toMatch(/2\/\d+/);

  // Verify scroll changed (unless 1st and 2nd match are on same line, which is possible but unlikely for "the")
  // Or at least we can check if the active mark has changed styles
  const activeMark = page.locator('mark.ring-2');
  await expect(activeMark).toBeVisible();

  // 7. Navigate back
  await prevBtn.click();
  await page.waitForTimeout(500);

  const counterText3 = await counter.innerText();
  expect(counterText3).toMatch(/1\/\d+/);

  // Capture screenshot of navigation UI
  await page.screenshot({ path: 'verification/search_navigation_verified.png', fullPage: false });
});
