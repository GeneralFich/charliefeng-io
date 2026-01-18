import { test, expect } from '@playwright/test';

test('Chat displays error message when API call fails', async ({ page }) => {
  // Go to the page (assuming chat is on the home page or accessible)
  await page.goto('/');

  // Mock the API request to fail
  // The SDK likely hits https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent
  await page.route('**/models/*:generateContent*', route => {
    route.abort('failed');
  });

  // Find the chat input
  const input = page.getByPlaceholder('Ask anything...');

  // Wait for the chat to be ready (maybe check if initial message is there)
  await expect(page.getByText("Hello! I can answer questions")).toBeVisible();

  // Type a message
  await input.fill('Hello');

  // Send (press Enter)
  await input.press('Enter');

  // Verify the error message appears
  // The error message from useChat.ts / geminiService.ts is:
  // "Connection to the neural link failed. Please try again."
  const errorMessage = page.getByText('Connection to the neural link failed');
  await expect(errorMessage).toBeVisible();

  // Verify that it is styled as an error (red theme)
  // The message bubble should have the red border class
  const messageBubble = errorMessage.locator('..');
  await expect(messageBubble).toHaveClass(/border-red-500\/30/);
});
