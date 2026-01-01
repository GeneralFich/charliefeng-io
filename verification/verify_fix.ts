import { chromium, Page } from 'playwright';
import { View } from '../types';

async function verifyPrintLayouts() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('Navigating to app...');
    // Ensure viewport is large enough for desktop
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('http://localhost:3000');

    // Wait for the app to load
    await page.waitForSelector('text=Charlie\'s Digital Twin');
    console.log('App loaded.');

    // --- TEST 1: Full About View ---
    console.log('\n--- Testing Full About View ---');

    // Click "About" in Navbar
    await page.getByRole('button', { name: 'About' }).click();

    // Wait for Resume to appear
    await page.waitForSelector('text=Professional Experience');
    console.log('About view loaded.');

    // Emulate Print
    await page.emulateMedia({ media: 'print' });

    // Take Screenshot regardless of pass/fail
    await page.screenshot({ path: 'verification/print_full_about.png', fullPage: true });
    console.log('Screenshot taken: verification/print_full_about.png');

    // Check for visibility of Chat Container
    const welcomeText = page.getByText("Hello! I'm Charlie's digital twin");

    // Use evaluate to check if it's hidden in print
    const isWelcomeHidden = await welcomeText.isHidden();
    if (!isWelcomeHidden) {
         console.error('Chat Interface is NOT hidden. Checking parent styles...');
         // Try to find the parent container and check classes
         // The parent of ChatInterface is the Chat Container.
         // We can't easily select it without an ID, but we can verify our expectation.
         throw new Error('Chat Interface should be hidden in Full About View print!');
    }
    console.log('Chat Interface is hidden (PASS).');

    // Check visibility of Resume
    const resumeHeader = page.getByText('CHARLIE FENG').first();
    const isResumeVisible = await resumeHeader.isVisible();

    if (!isResumeVisible) {
         console.error('Resume header is NOT visible.');
         // Maybe it's occluded?
         throw new Error('Resume header should be visible!');
    }
    console.log('Resume header is visible (PASS).');

    console.log('Full About View verified successfully!');

  } catch (error) {
    console.error('Verification failed:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

verifyPrintLayouts();
