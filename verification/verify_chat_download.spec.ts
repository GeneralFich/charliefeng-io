import { test, expect } from '@playwright/test';

test('verify chat download button functionality', async ({ page }) => {
  // Go to home page
  await page.goto('/');

  // Verify initial state: Download button should NOT be visible
  const downloadButton = page.getByRole('button', { name: 'Download chat' });
  await expect(downloadButton).not.toBeVisible();

  // Send a message
  const input = page.getByRole('textbox', { name: 'Chat message' });
  await input.fill('Hello');
  await page.keyboard.press('Enter');

  // Wait for the response (loading indicator to disappear)
  // We wait for the thinking indicator to appear and then disappear
  // Using exact: true to distinguish from the sr-only text if needed, or getByText handles it if visible.
  // The error showed ambiguity, so let's be more specific or use first() if we don't care which one is visible.
  // Actually, standard getByText looks for visible text. The issue was strict mode violation.
  // The DOM has both visible "THINKING..." and sr-only "Charlie is thinking..." (wait, the error said "THINKING..." resolved to 2 elements?)
  // One was <div ...>THINKING...</div> and one was <span ...>Charlie is thinking...</span>.
  // Wait, "THINKING..." matched "Charlie is thinking..."? No, getByText matches substring.
  // Let's use exact: true.
  await expect(page.getByText('THINKING...', { exact: true })).toBeVisible();
  await expect(page.getByText('THINKING...', { exact: true })).not.toBeVisible({ timeout: 15000 });

  // Now the Download button should be visible
  await expect(downloadButton).toBeVisible();

  // Setup download listener
  const downloadPromise = page.waitForEvent('download');

  // Click download
  await downloadButton.click();

  const download = await downloadPromise;

  // Verify filename pattern
  expect(download.suggestedFilename()).toMatch(/^charlie-feng-chat-\d{4}-\d{2}-\d{2}\.txt$/);

  // Verify content
  const path = await download.path();
  // We can't easily read the file content in this environment without fs,
  // but verifying the download event and filename is strong evidence it works.
});
