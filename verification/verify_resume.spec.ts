import { test, expect } from '@playwright/test';

test('verify resume contact form', async ({ page }) => {
  await page.goto('http://localhost:3000/');

  // Navigate to About (Resume)
  await page.getByRole('button', { name: 'About', exact: true }).click();

  // Wait for the Resume to load
  await expect(page.getByRole('heading', { name: 'Charlie Feng', exact: true })).toBeVisible();

  // Check that PII is removed
  const bodyText = await page.innerText('body');
  expect(bodyText).not.toContain('917');
  expect(bodyText).not.toContain('charliefengsq@gmail.com');

  // Check for Contact Form
  const contactHeading = page.getByRole('heading', { name: 'Get in Touch' });
  await contactHeading.scrollIntoViewIfNeeded();
  await expect(contactHeading).toBeVisible();

  await expect(page.getByLabel('Name')).toBeVisible();

  // Email input in the form
  // There might be other inputs, but this one is labelled Email
  await expect(page.getByLabel('Email', { exact: true })).toBeVisible();

  await expect(page.getByLabel('Subject')).toBeVisible();

  // Message textarea
  // The error showed strict mode violation because there are other elements.
  // We want the one associated with the contact form.
  // We can filter by the textarea role.
  await expect(page.getByRole('textbox', { name: 'Message' })).toBeVisible();

  // Take screenshot
  await page.screenshot({ path: 'verification/resume_contact.png', fullPage: true });
});
