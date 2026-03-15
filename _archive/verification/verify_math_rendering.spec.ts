import { test, expect } from '@playwright/test';

test('Math formulas are rendered correctly using KaTeX', async ({ page }) => {
  // Navigate to the specific essay that contains math formulas
  await page.goto('/essays/the-thermodynamic-wall');

  // Wait for the content to load and verify the title is visible
  await expect(page.getByRole('heading', { name: 'The Thermodynamic Wall', level: 1 })).toBeVisible();

  // Check for the presence of KaTeX rendered elements
  // KaTeX renders with a class "katex"
  const katexElements = page.locator('.katex');

  // We expect at least one math formula to be rendered
  await expect(katexElements.first()).toBeVisible();

  // Specifically check for the formula mentioned in the issue: Cp ≈ 1.005 J/g·K
  // The KaTeX output is complex HTML, but we can check if the container exists
  // or if the text is not just the raw markdown source.

  // Verify that the raw markdown syntax is NOT present
  // This ensures it was transformed
  await expect(page.getByText('($C_p \\approx 1.005$ J/g·K)')).not.toBeVisible();

  // Verify that we can find parts of the rendered math
  // We search for the text content within the article
  const article = page.locator('article');

  // Check if we can find the text "1.005" inside a katex element or nearby
  // This is a bit loose, but checking for .katex class is the strongest signal of rendering
  const mathCount = await katexElements.count();
  console.log(`Found ${mathCount} rendered math elements.`);
  expect(mathCount).toBeGreaterThan(0);
});
