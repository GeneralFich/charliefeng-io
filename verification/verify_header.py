from playwright.sync_api import sync_playwright

def verify_header(page):
    page.goto("http://localhost:3000")

    # Wait for the logo button to be visible
    logo_button = page.locator("button[aria-label=\"Go to Home\"]")
    logo_button.wait_for(state="visible", timeout=30000)

    # Take a screenshot of the header
    page.screenshot(path="verification/header.png")

    # Click the button
    logo_button.click()

    # Since we are already on home, we can just verify it is still clickable and visible
    logo_button.wait_for(state="visible", timeout=1000)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_header(page)
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()
