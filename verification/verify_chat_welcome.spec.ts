import { test, expect } from '@playwright/test';

test('Verify Chat Welcome component rendering', async ({ page }) => {
  // 1. Arrange: Go to the app
  await page.goto('http://localhost:3000');

  // 2. Assert: Verify key elements of the Welcome screen are present
  // The 'CF' avatar (scoping to main content to avoid header logo collision)
  const mainContent = page.locator('main');
  await expect(mainContent.getByText('CF', { exact: true })).toBeVisible();

  // The Welcome Heading
  await expect(page.getByRole('heading', { name: "Hello! I'm Charlie's AI." })).toBeVisible();

  // The suggested prompts (from hooks/useChat.ts)
  const prompts = [
    "Who is Charlie?",
    "Show me his resume.",
    "What are his core skills?",
    "When will AGI arrive?"
  ];

  for (const prompt of prompts) {
    await expect(page.getByRole('button', { name: prompt })).toBeVisible();
  }

  // 3. Screenshot: Capture the Welcome screen
  await page.screenshot({ path: 'verification/chat_welcome_refactor.png', fullPage: true });
});
