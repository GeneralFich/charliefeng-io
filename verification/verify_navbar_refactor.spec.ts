
import { test, expect } from '@playwright/test';

test('verify navbar navigation', async ({ page }) => {
  await page.goto('http://localhost:3000/');

  // Verify Navbar exists
  const navbar = page.locator('nav');
  await expect(navbar).toBeVisible();

  // Verify Logo navigation
  const logo = page.getByRole('button', { name: 'Go to Home' });
  await expect(logo).toBeVisible();

  // Verify Desktop Navigation
  const chatLink = page.getByRole('button', { name: 'Chat' }).first();
  await expect(chatLink).toBeVisible();

  const aboutLink = page.getByRole('button', { name: 'About' });
  await expect(aboutLink).toBeVisible();

  // Click About and verify navigation
  await aboutLink.click();

  // Verify we are on the Resume page by checking for the "Executive Summary" heading
  await expect(page.getByRole('heading', { name: 'Executive Summary' })).toBeVisible();

  // Also verify the Download PDF button using its accessible name
  await expect(page.getByRole('button', { name: 'Print or Save as PDF' })).toBeVisible();

  // Mobile menu test (resize viewport)
  await page.setViewportSize({ width: 375, height: 667 });

  // Verify mobile menu button exists
  const mobileMenuBtn = page.getByRole('button', { name: 'Open menu' });
  await expect(mobileMenuBtn).toBeVisible();

  // Open menu
  await mobileMenuBtn.click();

  // Verify mobile nav items are visible
  // The mobile menu container has id="mobile-menu"
  const mobileMenu = page.locator('#mobile-menu');
  await expect(mobileMenu).toBeVisible();

  const mobileChatLink = mobileMenu.getByRole('button', { name: 'Chat' });
  await expect(mobileChatLink).toBeVisible();

  // Take screenshot
  await page.screenshot({ path: 'verification/navbar_refactor.png' });
});
