import { chromium } from 'playwright';

async function verifyCodeSplitting() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('Navigating to home...');
    await page.goto('http://localhost:3000');

    // Wait for initial load
    await page.waitForLoadState('networkidle');
    console.log('Home loaded');

    // 1. Verify Resume (About) Lazy Loading
    console.log('Clicking About...');
    // Use more specific locator - targeting the main nav
    await page.locator('nav').getByRole('button', { name: 'About' }).first().click();

    // Wait for Resume content to appear (verifying lazy load worked and resolved)
    await page.waitForSelector('text=Executive Summary', { timeout: 10000 });
    console.log('Resume loaded successfully');

    await page.screenshot({ path: 'verification/resume_loaded.png' });

    // 2. Verify Essays Lazy Loading
    console.log('Clicking Essays...');
    await page.locator('nav').getByRole('button', { name: 'Essays' }).first().click();

    // Wait for Essays content
    await page.waitForSelector('text=Thoughts on technology', { timeout: 10000 });
    console.log('Essays loaded successfully');

    await page.screenshot({ path: 'verification/essays_loaded.png' });

    console.log('Verification passed!');
  } catch (error) {
    console.error('Verification failed:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

verifyCodeSplitting();
