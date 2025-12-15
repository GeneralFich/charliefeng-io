from playwright.sync_api import sync_playwright, expect
import time

def verify_suggestions():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        try:
            print("Navigating to localhost:3000...")
            page.goto("http://localhost:3000")

            # Wait for the initial message and suggestions
            print("Waiting for initial suggestions...")
            page.wait_for_selector("text=Summarize Charlie's experience.", timeout=10000)

            # Take a screenshot of the initial state
            page.screenshot(path="verification/initial_state.png")
            print("Initial state screenshot captured.")

            # Click a suggestion
            print("Clicking a suggestion...")
            page.click("text=Summarize Charlie's experience.")

            # Wait for some time to simulate interaction
            time.sleep(2)

            page.screenshot(path="verification/after_click.png")
            print("After click screenshot captured.")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_suggestions()
