import { test, expect } from '@playwright/test';

test('feedback form UI flow (mocked network)', async ({ page }) => {
  // Mock the EmailJS API call to return success
  await page.route('https://api.emailjs.com/api/v1.0/email/send', async route => {
    // We can also verify the request payload here if we want
    const postData = route.request().postDataJSON();
    console.log('Intercepted EmailJS request:', postData);

    // Respond with success
    await route.fulfill({
      status: 200,
      contentType: 'text/plain',
      body: 'OK'
    });
  });

  // Go to an essay page
  await page.goto('/?view=ESSAYS&essay=strategic-whitepaper');

  // Wait for the form to be visible
  const feedbackForm = page.locator('text=Leave a thought');
  await expect(feedbackForm).toBeVisible();

  // Fill out the form
  await page.fill('textarea[id="feedback-message"]', 'Test feedback message from verification script.');
  await page.fill('input[id="feedback-email"]', 'test@example.com');

  // Click send
  await page.click('button:has-text("Send")');

  // Expect success message
  const successMessage = page.locator('text=Thank you for your thoughts!');
  await expect(successMessage).toBeVisible({ timeout: 10000 });

  console.log("Feedback form UI flow verified successfully (mocked backend).");
});
