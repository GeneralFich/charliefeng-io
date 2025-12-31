import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    await page.goto('http://localhost:3000/');

    // Send a message to populate the chat
    const input = page.getByRole('textbox', { name: 'Chat message' });
    await input.fill('Hello');
    await page.keyboard.press('Enter');

    // Wait for the thinking state to resolve
    await page.waitForTimeout(4000);

    // Take a screenshot of the chat interface with the new button
    await page.screenshot({ path: 'verification/chat_download_button.png' });

  } catch (error) {
    console.error('Error during verification:', error);
  } finally {
    await browser.close();
  }
})();
