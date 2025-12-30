import { test, expect } from '@playwright/test';

test('Chat welcome screen renders correctly', async ({ page }) => {
  // 1. Go to the homepage (Chat view)
  await page.goto('/');

  // 2. Verify the "CF" logo is visible (it has "CF" text)
  await expect(page.locator('text=CF').first()).toBeVisible();

  // 3. Verify the main heading
  await expect(page.getByRole('heading', { name: "Charlie's Digital Twin" })).toBeVisible();

  // 4. Verify the welcome message is present (starts with "Hello!")
  await expect(page.getByText("Hello! I can answer questions")).toBeVisible();

  // 5. Verify suggested prompts are visible
  const firstPrompt = page.getByRole('button', { name: "Who is Charlie?" });
  await expect(firstPrompt).toBeVisible();

  // 6. Verify we are in the initial state by checking for the grid layout
  // The prompts are in a grid in the welcome screen
  const grid = page.locator('.grid.grid-cols-1.sm\\:grid-cols-2');
  await expect(grid).toBeVisible();
});
