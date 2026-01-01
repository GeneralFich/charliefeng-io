
import { test, expect } from '@playwright/test';

test('Verify focus management when clearing chat and search', async ({ page }) => {
  // 1. Verify Chat Interface Clear Focus
  await page.goto('/');

  // wait for chat to be ready
  await expect(page.getByRole('textbox', { name: 'Chat message' })).toBeVisible();

  // Send a message to get out of initial state
  await page.getByRole('textbox', { name: 'Chat message' }).fill('Hello');
  await page.getByRole('button', { name: 'Send message' }).click();

  // Wait for response (Clear chat button appears only when not initial state)
  // The mock might be slow or fast, but we just need the UI to update.
  // In dev/test, it might use real API or mock.
  // We can just wait for the "Clear chat" button to appear.
  await expect(page.getByRole('button', { name: 'Clear chat' })).toBeVisible({ timeout: 10000 });

  // Click clear chat
  await page.getByRole('button', { name: 'Clear chat' }).click();

  // Verify focus returns to input
  await expect(page.getByRole('textbox', { name: 'Chat message' })).toBeFocused();

  // 2. Verify Essay List Search Clear Focus
  await page.goto('/?view=ESSAYS'); // Navigate to Essays view directly if possible, or click button
  // If ?view=ESSAYS not working directly due to hash router or state, click navigation.
  await page.getByRole('button', { name: 'Essays' }).click();

  // Type in search
  await page.getByRole('textbox', { name: 'Search essays' }).fill('Architecture');

  // Verify clear button appears
  await expect(page.getByRole('button', { name: 'Clear search' })).toBeVisible();

  // Click clear search
  await page.getByRole('button', { name: 'Clear search' }).click();

  // Verify focus returns to search input
  await expect(page.getByRole('textbox', { name: 'Search essays' })).toBeFocused();
});
