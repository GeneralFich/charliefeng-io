
import { chromium } from 'playwright';

async function verifyShareFeature() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // 1. Navigate to the Essays view using URL params
    console.log('Navigating to Essays view...');
    await page.goto('http://localhost:3000/?view=ESSAYS');
    await page.waitForLoadState('networkidle');

    // 2. Click on the first essay
    console.log('Opening first essay...');
    await page.locator('button.group.flex-col').first().click();
    await page.waitForTimeout(1000); // Wait for animation

    // 3. Locate the Share button
    const shareButton = page.getByRole('button', { name: 'Share' });

    // 4. Take a screenshot of the header with the Share button
    console.log('Taking screenshot...');
    await page.screenshot({ path: 'verification/share_button.png' });
    console.log('Screenshot saved to verification/share_button.png');

  } catch (error) {
    console.error('Verification failed:', error);
  } finally {
    await browser.close();
  }
}

verifyShareFeature();
