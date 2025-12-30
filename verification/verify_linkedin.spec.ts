
import { test, expect, chromium } from '@playwright/test';

test('Verify LinkedIn link on Resume and Contact pages', async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // 1. Visit the Resume (About) page
  await page.goto('http://localhost:3000/?view=ABOUT');

  // Wait for the Resume component to load
  // Use .last() or specific text matching to disambiguate from the navbar logo which might also be an h1 or contained within one
  await expect(page.getByRole('heading', { name: 'Charlie Feng', level: 1 }).last()).toBeVisible({ timeout: 10000 });

  // Check for LinkedIn button in Resume header
  const linkedinButton = page.getByRole('link', { name: 'View LinkedIn Profile' });
  await expect(linkedinButton).toBeVisible();
  await expect(linkedinButton).toHaveAttribute('href', 'https://www.linkedin.com/in/fengcharlie');

  // Take screenshot of Resume header
  await page.screenshot({ path: 'verification/resume_linkedin.png' });

  // 2. Visit the Contact page
  // Click on "Contact" navigation button
  await page.getByRole('button', { name: 'Contact' }).click();

  // Wait for Contact View to load
  await expect(page.getByRole('heading', { name: 'Contact', level: 2 })).toBeVisible();

  // Check for LinkedIn link in Contact description
  const linkedinLink = page.getByRole('link', { name: 'Connect on LinkedIn' });
  await expect(linkedinLink).toBeVisible();
  await expect(linkedinLink).toHaveAttribute('href', 'https://www.linkedin.com/in/fengcharlie');

  // Take screenshot of Contact page
  await page.screenshot({ path: 'verification/contact_linkedin.png' });

  await browser.close();
});
