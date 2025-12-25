import { chromium, Browser, Page } from 'playwright';

async function verifyContactForm() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Navigate to local dev server (default port 3000, but try others if busy)
    // The previous memory mentioned port might increment.
    // I'll try 3000 first.
    let connected = false;
    for (const port of [3000, 3001, 3002, 3003]) {
        try {
            await page.goto(`http://localhost:${port}/`, { timeout: 3000 });
            connected = true;
            console.log(`Connected to port ${port}`);
            break;
        } catch (e) {
            continue;
        }
    }

    if (!connected) {
        throw new Error("Could not connect to localhost on ports 3000-3003");
    }

    // Wait for app to load
    await page.waitForLoadState('networkidle');

    // Open Contact view
    // The navigation might be a button with text "Contact"
    await page.getByRole('button', { name: 'Contact' }).click();

    // Wait for the form to appear
    await page.waitForSelector('form');

    // Fill out the form
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="subject"]', 'Test Subject');
    await page.fill('textarea[name="message"]', 'This is a test message to verify the Contact Form UI.');

    // Take screenshot of filled form
    await page.screenshot({ path: 'verification/contact_form_filled.png' });
    console.log('Screenshot saved to verification/contact_form_filled.png');

    // Click Send
    // Note: Since we don't have valid EmailJS keys in this environment (unless mocked or provided),
    // it will likely fail or hit the fallback if variables are missing.
    // However, the code logs a warning and simulates success if keys are missing (DEMO MODE).
    // If keys ARE present but invalid, it will error.
    // Let's see what happens.

    await page.getByRole('button', { name: 'Send Message' }).click();

    // Wait a bit for state change
    await page.waitForTimeout(2000);

    // Take screenshot of result
    await page.screenshot({ path: 'verification/contact_form_result.png' });
    console.log('Screenshot saved to verification/contact_form_result.png');

  } catch (error) {
    console.error('Verification failed:', error);
  } finally {
    await browser.close();
  }
}

verifyContactForm();
