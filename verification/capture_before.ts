import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('Navigating to home page...');
    await page.goto('http://localhost:3000');

    // Wait for the welcome message to appear
    await page.waitForSelector('text=Welcome to the digital extension');

    console.log('Taking screenshot...');
    await page.screenshot({ path: 'verification/before_changes.png' });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();
