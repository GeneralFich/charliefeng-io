import { chromium } from 'playwright';

async function verifyChatInput() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Wait for dev server (retry loop)
    let retries = 5;
    while (retries > 0) {
      try {
        await page.goto('http://localhost:3001'); // UPDATED PORT
        break;
      } catch (e) {
        console.log('Waiting for server...');
        await new Promise(r => setTimeout(r, 2000));
        retries--;
      }
    }

    console.log('Page loaded');

    // The input should be visible
    const input = page.getByPlaceholder('Ask me a question...');
    await input.waitFor();
    console.log('Input found');

    // Type text
    await input.fill('Hello world');
    console.log('Text typed');

    // Verify Clear Button appears
    const clearBtn = page.getByRole('button', { name: 'Clear input' });
    await clearBtn.waitFor();
    console.log('Clear button found');

    // Take screenshot with text
    await page.screenshot({ path: 'verification/1_text_typed.png' });
    console.log('Screenshot 1 taken');

    // Click Clear
    await clearBtn.click();
    console.log('Clicked clear');

    // Verify text is gone
    const value = await input.inputValue();
    if (value === '') {
      console.log('Input cleared successfully');
    } else {
      console.error('Input NOT cleared. Value:', value);
    }

    // Take screenshot after clear
    await page.screenshot({ path: 'verification/2_cleared.png' });
    console.log('Screenshot 2 taken');

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
}

verifyChatInput();
