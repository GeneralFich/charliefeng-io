import { chromium } from 'playwright';

async function verifyI18n() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('Navigating to home...');
    await page.goto('http://localhost:3000');

    // Wait for load - English default
    await page.waitForSelector('text=Chat', { timeout: 10000 });
    console.log('Found English text "Chat"');

    // Click Language Switcher
    await page.click('button[aria-label="Select Language"]');

    // Click Chinese
    await page.click('text=中文 (Chinese)');

    // Verify "Chat" changed to "对话"
    await page.waitForSelector('text=对话', { timeout: 5000 });
    console.log('Found Chinese text "对话"');

    // Screenshot Home
    await page.screenshot({ path: 'verification/i18n_home_zh.png' });
    console.log('Screenshot saved: verification/i18n_home_zh.png');

    // Navigate to Resume (About)
    // In Navbar, About is translated to '简历'
    // But '简历' also appears in the Resume content itself as a section header?
    // Wait, in Translations: sections.resume is '简历'.
    // Navbar 'About' is '简历'.
    // If we are on Home (Chat), '简历' only appears in Navbar.
    await page.click('text=简历');

    // Verify Resume Content
    // "执行摘要" (Executive Summary)
    await page.waitForSelector('text=执行摘要', { timeout: 5000 });
    console.log('Found Chinese Resume Header "执行摘要"');

    await page.screenshot({ path: 'verification/i18n_resume_zh.png' });
    console.log('Screenshot saved: verification/i18n_resume_zh.png');

  } catch (e) {
    console.error('Verification failed:', e);
    await page.screenshot({ path: 'verification/error.png' });
    process.exit(1);
  } finally {
    await browser.close();
  }
}

verifyI18n();
