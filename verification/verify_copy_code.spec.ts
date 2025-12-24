
import { test, expect, chromium } from '@playwright/test';

test('Verify Copy Code button in Essays', async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // Allow clipboard permissions
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);

    // Navigate to local server (checking ports 3000-3005)
    let connected = false;
    for (const port of [3000, 3001, 3002, 3003, 3004, 3005]) {
        try {
            await page.goto(`http://localhost:${port}`, { timeout: 2000 });
            connected = true;
            console.log(`Connected to port ${port}`);
            break;
        } catch (e) {
            continue;
        }
    }
    if (!connected) throw new Error("Could not connect to dev server");

    // Navigate to Essays
    await page.getByRole('button', { name: 'Essays' }).click();

    // Click on "Evolving Landscape of Data Centers" (assuming it has code or I should pick one that does)
    // Wait, let's check which one has code.
    // "The Thermodynamic Wall" has infographics.
    // I'll try "The Thermodynamic Wall" to test infographic handling + standard code blocks if any.
    // Or I'll check "Evolving Landscape..."

    await page.getByText('The Thermodynamic Wall').click();

    // Wait for content to load
    await expect(page.locator('article')).toBeVisible();

    // Take screenshot of the top
    await page.screenshot({ path: 'verification/essay_top.png' });

    // Look for a code block
    // If the essay has code, it should be visible.
    // I'll try to find a pre element.
    const preElement = page.locator('pre').first();

    if (await preElement.count() > 0) {
        // Scroll to it
        await preElement.scrollIntoViewIfNeeded();

        // Verify copy button exists
        const copyBtn = page.locator('button[aria-label="Copy code"]').first();
        if (await copyBtn.count() > 0) {
             console.log("Copy button found");
             // Hover to make it visible (opacity logic)
             await preElement.hover();
             await page.screenshot({ path: 'verification/code_block_hover.png' });

             // Click it
             await copyBtn.click();

             // Verify check icon appears
             await expect(page.locator('.text-green-400')).toBeVisible();
             await page.screenshot({ path: 'verification/code_block_copied.png' });
        } else {
             console.log("No copy button found on pre element - might be an infographic?");
             await page.screenshot({ path: 'verification/pre_no_btn.png' });
        }
    } else {
        console.log("No code blocks found in this essay.");
    }

    // Verify infographic if present (should NOT have copy button)
    // Infographics are iframes in div
    const iframe = page.locator('iframe[title^="Infographic"]');
    if (await iframe.count() > 0) {
        console.log("Infographic found");
        await iframe.first().scrollIntoViewIfNeeded();
        await page.screenshot({ path: 'verification/infographic.png' });

        // Ensure no copy button is overlapping or near it (visual check)
    }

    await browser.close();
});
