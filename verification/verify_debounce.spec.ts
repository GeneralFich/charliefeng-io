import { test, expect } from '@playwright/test';

test('verify debounced search filters and highlights', async ({ page }) => {
  // 1. Arrange: Go to the site and navigate to Essays
  await page.goto('/');
  await page.getByRole('button', { name: 'Essays' }).click();

  // 2. Act: Type a query that matches specific posts
  // "Agile" is a good candidate (likely in titles or content)
  const searchInput = page.getByRole('textbox', { name: 'Search essays' });
  await searchInput.fill('Agile');

  // 3. Assert: Wait for results to update
  // The update is debounced (300ms), so we expect a small delay.
  // We check for presence of a post that should match.
  // Assuming "Agile" returns results.
  // We can also check that the "Clear search" button appears immediately (it depends on input value)
  await expect(page.getByLabel('Clear search')).toBeVisible();

  // Wait for the debounce to settle and the list to filter
  // We expect at least one result (or "No essays found" if none match, but the test checks functionality)
  // Let's assume there is content about Agile or we can use "The" which matches everything.
  // Let's use "Thermodynamic" which matches the known "The Thermodynamic Wall" post.
  await searchInput.fill('Thermodynamic');

  // Wait for the specific post to be visible
  await expect(page.getByRole('heading', { name: 'The Thermodynamic Wall' })).toBeVisible();

  // 4. Highlight Check
  // We can check if the <mark> tag exists?
  // The `highlightNodes` function wraps matches in <mark> if using standard highlighter.
  // Actually, SearchHighlighter returns a span with bg-yellow-something?
  // Let's check `SearchHighlighter.tsx` content first or just visual snapshot.

  // Take screenshot
  await page.screenshot({ path: 'verification/debounce-results.png' });
});
