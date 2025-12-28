import { test, expect } from '@playwright/test';

test('verify input max length attributes', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Navigate to Contact view
  await page.getByRole('button', { name: 'Contact' }).click();

  // Check Name input
  const nameInput = page.getByLabel('Name');
  await expect(nameInput).toHaveAttribute('maxLength', '100');

  // Check Email input
  const emailInput = page.getByLabel('Email');
  await expect(emailInput).toHaveAttribute('maxLength', '100');

  // Check Subject input
  const subjectInput = page.getByLabel('Subject');
  await expect(subjectInput).toHaveAttribute('maxLength', '200');

  // Check Message textarea - using getByRole to avoid ambiguity
  const messageInput = page.getByRole('textbox', { name: 'Message' });
  await expect(messageInput).toHaveAttribute('maxLength', '5000');

  // Take screenshot
  await page.screenshot({ path: 'verification/contact_form_limits.png' });
});
