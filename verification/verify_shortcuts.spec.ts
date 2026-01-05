import { test, expect } from '@playwright/test';
import { View } from '../types';

test.describe('Global Keyboard Shortcuts', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    await page.goto('/');
    // Click on body to ensure focus is not on an input
    await page.locator('body').click({ position: { x: 0, y: 0 } });
  });

  test('should open shortcuts modal with ? key', async ({ page }) => {
    // Press '?' (shift+/)
    await page.keyboard.type('?');

    // Check if modal is visible
    const modal = page.getByRole('dialog', { name: 'Keyboard Shortcuts' });
    await expect(modal).toBeVisible();

    // Check for content
    await expect(page.getByText('Go to Chat (Home)')).toBeVisible();
    await expect(page.getByText('Go to About')).toBeVisible();
  });

  test('should close modal with Escape key', async ({ page }) => {
    await page.keyboard.type('?');
    const modal = page.getByRole('dialog', { name: 'Keyboard Shortcuts' });
    await expect(modal).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(modal).not.toBeVisible();
  });

  test('should navigate to different views using shortcuts', async ({ page }) => {
    // Initial state: Chat (Home)
    // Wait for initial render
    await expect(page.getByRole('heading', { name: 'Charlie\'s Digital Twin' })).toBeVisible();

    // Navigate to About (G + A)
    await page.keyboard.type('ga');
    // Verify About page content (Resume)
    await expect(page.getByRole('heading', { name: 'Executive Summary' })).toBeVisible();

    // Navigate to Essays (G + E)
    await page.keyboard.type('ge');
    // Verify Essays page content
    await expect(page.getByRole('heading', { name: 'Essays', exact: true })).toBeVisible();

    // Navigate to Contact (G + C)
    await page.keyboard.type('gc');
    // Verify Contact page content
    await expect(page.getByRole('heading', { name: 'Contact', exact: true })).toBeVisible();

    // Navigate back to Home (G + H)
    await page.keyboard.type('gh');
    await expect(page.getByRole('heading', { name: 'Charlie\'s Digital Twin' })).toBeVisible();
  });

  test('should NOT trigger shortcuts when typing in input', async ({ page }) => {
    // Focus the chat input
    const input = page.getByRole('textbox', { name: 'Chat message' });
    await input.focus();

    // Type "?ga"
    await input.type('?ga');

    // Ensure modal did NOT open
    const modal = page.getByRole('dialog', { name: 'Keyboard Shortcuts' });
    await expect(modal).not.toBeVisible();

    // Ensure navigation did NOT happen (still on Home)
    await expect(page.getByRole('heading', { name: 'Charlie\'s Digital Twin' })).toBeVisible();

    // Ensure text was typed into input
    await expect(input).toHaveValue('?ga');
  });
});
