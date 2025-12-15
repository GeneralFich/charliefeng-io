from playwright.sync_api import sync_playwright

def verify_navigation():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            # Navigate to the app
            page.goto("http://localhost:3000")

            # Wait for navigation to load
            page.wait_for_selector("nav", state="visible")

            # Click on "My Research" tab
            page.click("text=My Research")

            # Wait for Dashboard content
            page.wait_for_selector("text=Agentic Dashboard")

            # Take screenshot
            page.screenshot(path="verification/dashboard_view.png", full_page=True)

            # Check for Manifesto text
            page.wait_for_selector("text=Full Manifesto")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_navigation()
