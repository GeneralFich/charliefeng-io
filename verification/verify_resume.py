
from playwright.sync_api import sync_playwright
import time

def verify_resume_print(page):
    # Go to local dev server
    page.goto("http://localhost:3000")

    # Wait for the app to load
    page.wait_for_selector("text=Charlie Feng")

    # Click on the "Resume" button in the navbar to navigate to the resume page
    page.get_by_role("button", name="Resume").click()

    # Wait for the resume content to load
    page.wait_for_selector("text=Executive Summary")

    # Take a screenshot of the Resume page in normal view
    page.screenshot(path="verification/resume_normal.png")
    print("Normal view screenshot saved.")

    # Emulate print media type
    page.emulate_media(media="print")

    # Take a screenshot of the Resume page in print view
    page.screenshot(path="verification/resume_print.png")
    print("Print view screenshot saved.")

if __name__ == "__main__":
    with sync_playwright() as p:
        # Launch browser
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            verify_resume_print(page)
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()
