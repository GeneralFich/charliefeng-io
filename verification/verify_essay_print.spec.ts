import { test, expect } from '@playwright/test';

test('Verify Essay Print Button and Styles', async ({ page }) => {
  // Go to an essay
  await page.goto('http://localhost:3000/?view=ESSAYS&essay=strategic-whitepaper');

  // Wait for content to load
  await expect(page.locator('h1')).toBeVisible();

  // 1. Verify "PDF" button exists and is visible
  const pdfButton = page.getByRole('button', { name: 'Print or Save as PDF' });
  await expect(pdfButton).toBeVisible();
  await expect(pdfButton).toHaveText(/PDF/);

  // 2. Verify "Share" button is next to it
  const shareButton = page.getByRole('button', { name: 'Share' });
  await expect(shareButton).toBeVisible();

  // 3. Verify Print Styles

  // Header should be hidden in print
  const header = page.locator('.sticky.top-16');
  await expect(header).toHaveClass(/print:hidden/);

  // Footer navigation should be hidden in print
  const footer = page.locator('.grid.grid-cols-1.md\\:grid-cols-2.gap-4').last();
  await expect(footer).toHaveClass(/print:hidden/);

  // Table of Contents wrapper should be hidden in print
  // Find the wrapper that strictly contains the Table of Contents text and has print:hidden
  const tocWrapper = page.locator('div.print\\:hidden').filter({ hasText: 'Table of Contents' }).first();
  await expect(tocWrapper).toBeVisible(); // Visible on screen
  await expect(tocWrapper).toHaveClass(/print:hidden/);

  // 4. Emulate Print Media and Screenshot
  await page.emulateMedia({ media: 'print' });

  await page.screenshot({ path: 'verification/essay_print_preview.png', fullPage: true });

  await page.emulateMedia({ media: null });
});
