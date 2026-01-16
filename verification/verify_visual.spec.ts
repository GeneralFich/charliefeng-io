import { test, expect } from '@playwright/test';

test('visual verification of feedback form', async ({ page }) => {
  // Mock the EmailJS API call to return success
  await page.route('https://api.emailjs.com/api/v1.0/email/send', async route => {
    await route.fulfill({ status: 200, contentType: 'text/plain', body: 'OK' });
  });

  // Go to an essay page
  await page.goto('/?view=ESSAYS&essay=strategic-whitepaper');

  // Wait for the form to be visible
  const feedbackForm = page.locator('text=Leave a thought');
  await expect(feedbackForm).toBeVisible();

  // Fill out the form
  await page.fill('textarea[id="feedback-message"]', 'Visual verification test message.');
  await page.fill('input[id="feedback-email"]', 'visual@test.com');

  // Take screenshot of form filled
  await page.screenshot({ path: 'verification/feedback_form_filled.png' });

  // Click send
  await page.click('button:has-text("Send")');

  // Expect success message
  const successMessage = page.locator('text=Thank you for your thoughts!');
  await expect(successMessage).toBeVisible({ timeout: 10000 });

  // Take screenshot of success
  await page.screenshot({ path: 'verification/feedback_success.png' });
});
