
import { test, expect } from '@playwright/test';

test.describe('Essay List Sorting', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the Essays page
    await page.goto('/');

    // Check if we are on mobile or desktop to find the Essays button
    const menuButton = page.getByRole('button', { name: 'Open menu' });
    if (await menuButton.isVisible()) {
        await menuButton.click();
        await page.getByRole('button', { name: 'Essays' }).click();
    } else {
        await page.getByRole('button', { name: 'Essays' }).click();
    }

    // Wait for the essays header to appear
    await expect(page.getByRole('heading', { name: 'Essays' })).toBeVisible();
  });

  test('should sort by Newest (default)', async ({ page }) => {
    // Check default value of select
    const sortSelect = page.getByLabel('Sort essays');
    await expect(sortSelect).toHaveValue('newest');

    // Get all dates
    const dates = await page.locator('time').allTextContents();
    const timestamps = dates.map(d => new Date(d).getTime());

    // Verify descending order
    for (let i = 0; i < timestamps.length - 1; i++) {
      expect(timestamps[i]).toBeGreaterThanOrEqual(timestamps[i + 1]);
    }
  });

  test('should sort by Oldest', async ({ page }) => {
    const sortSelect = page.getByLabel('Sort essays');
    await sortSelect.selectOption('oldest');

    // Verify that the first date is less than the last date (ascending)
    // We use expect.poll to retry until the sort is applied
    await expect.poll(async () => {
        const dates = await page.locator('time').allTextContents();
        if (dates.length < 2) return true; // Can't verify sort with < 2 items
        const first = new Date(dates[0]).getTime();
        const last = new Date(dates[dates.length - 1]).getTime();
        return first <= last;
    }).toBe(true);

    // Detailed verification
    const dates = await page.locator('time').allTextContents();
    const timestamps = dates.map(d => new Date(d).getTime());
    for (let i = 0; i < timestamps.length - 1; i++) {
      expect(timestamps[i]).toBeLessThanOrEqual(timestamps[i + 1]);
    }
  });

  test('should sort by Shortest Read', async ({ page }) => {
    const sortSelect = page.getByLabel('Sort essays');
    await sortSelect.selectOption('shortest');

    // Wait for sort to apply using poll
    await expect.poll(async () => {
        const readTimeElements = await page.locator('text=/\\d+ min read/').allTextContents();
        if (readTimeElements.length < 2) return true;
        const first = parseInt(readTimeElements[0].split(' ')[0], 10);
        const last = parseInt(readTimeElements[readTimeElements.length - 1].split(' ')[0], 10);
        return first <= last;
    }).toBe(true);

    const readTimeElements = await page.locator('text=/\\d+ min read/').allTextContents();
    const readTimes = readTimeElements.map(t => parseInt(t.split(' ')[0], 10));

    // Verify ascending order
    for (let i = 0; i < readTimes.length - 1; i++) {
      expect(readTimes[i]).toBeLessThanOrEqual(readTimes[i + 1]);
    }
  });

  test('should sort by Longest Read', async ({ page }) => {
    const sortSelect = page.getByLabel('Sort essays');
    await sortSelect.selectOption('longest');

    // Wait for sort to apply using poll
    await expect.poll(async () => {
        const readTimeElements = await page.locator('text=/\\d+ min read/').allTextContents();
        if (readTimeElements.length < 2) return true;
        const first = parseInt(readTimeElements[0].split(' ')[0], 10);
        const last = parseInt(readTimeElements[readTimeElements.length - 1].split(' ')[0], 10);
        return first >= last;
    }).toBe(true);

    const readTimeElements = await page.locator('text=/\\d+ min read/').allTextContents();
    const readTimes = readTimeElements.map(t => parseInt(t.split(' ')[0], 10));

    // Verify descending order
    for (let i = 0; i < readTimes.length - 1; i++) {
      expect(readTimes[i]).toBeGreaterThanOrEqual(readTimes[i + 1]);
    }
  });
});
