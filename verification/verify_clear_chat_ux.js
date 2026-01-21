import { chromium } from 'playwright';

async function verify() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('Navigating...');
    // Retry loop for server start
    for (let i = 0; i < 10; i++) {
        try {
            await page.goto('http://localhost:3000');
            break;
        } catch (e) {
            console.log('Waiting for server...');
            await new Promise(r => setTimeout(r, 1000));
        }
    }

    // Wait for input
    const input = page.getByRole('textbox', { name: 'Chat message' });
    await input.waitFor();

    // Type and send message to exit initial state
    await input.fill('Hi');
    await page.keyboard.press('Enter');

    // Wait for "Clear chat" button
    const clearButton = page.getByRole('button', { name: 'Clear chat' });
    await clearButton.waitFor();

    console.log('Clear button found');
    await page.screenshot({ path: 'verification/ux_before_click.png' });

    // Click once
    await clearButton.click();
    console.log('Clicked once');

    // Verify confirmation state
    const confirmButton = page.getByRole('button', { name: 'Confirm clear chat' });
    await confirmButton.waitFor({ timeout: 2000 });

    console.log('Confirmation state active');
    await page.screenshot({ path: 'verification/ux_confirmation_state.png' });

    // Click again to confirm
    await confirmButton.click();
    console.log('Clicked confirm');

    // Wait for clear button to detach (meaning we returned to initial state)
    // Note: Use the original locator because 'confirmButton' might be stale if re-render happened instantly
    // actually, the button disappears entirely.
    await page.getByRole('button', { name: 'Clear chat' }).waitFor({ state: 'detached' });
    await page.getByRole('button', { name: 'Confirm clear chat' }).waitFor({ state: 'detached' });

    console.log('Clear button disappeared (Chat cleared)');

    await page.screenshot({ path: 'verification/ux_cleared.png' });

  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

verify();
