from playwright.sync_api import sync_playwright

def verify_manifesto(page):
    # Go to localhost
    page.goto("http://localhost:3001")

    # Wait for the page to load
    page.wait_for_load_state("networkidle")

    # Click on "My Research" or "Dashboard" link/tab to see the manifesto
    # Based on memory, "My Research" is View.DASHBOARD
    # I need to find the navigation element.
    # Looking at App.tsx or similar might help, but I'll try to find text "My Research"

    page.get_by_text("My Research").click()

    # Wait for content to load
    page.wait_for_timeout(2000)

    # Scroll down to see the Manifesto
    # It is at the bottom, so we scroll to bottom
    page.evaluate("window.scrollTo(0, document.body.scrollHeight)")

    # Take a screenshot of the Manifesto section
    # I'll try to locate the header "Full Manifesto" and screenshot the area below it

    manifesto_section = page.get_by_text("Full Manifesto")
    manifesto_section.scroll_into_view_if_needed()

    # Screenshot the whole page or just the relevant part
    page.screenshot(path="verification/manifesto_formatting.png", full_page=True)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            verify_manifesto(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()
