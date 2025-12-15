from playwright.sync_api import Page, expect, sync_playwright

def test_dashboard_move(page: Page):
    # 1. Arrange: Go to the app homepage.
    page.goto("http://localhost:3001")

    # 2. Assert: Check Nav items
    # Dashboard link should NOT exist
    expect(page.get_by_role("button", name="Dashboard")).not_to_be_visible()

    # "Resume" should be renamed to "About"
    # Filter by the class used for nav items or just pick the first visible one in the header
    about_links = page.get_by_role("button", name="About")

    # We expect one in desktop nav, one in mobile nav (which is hidden)
    # The error said "resolved to 2 elements", but one was "Tell me about your work..." which is a prompt?
    # Actually the error log shows:
    # 1) <button ...> (This is the NavItem)
    # 2) <button ...>Tell me about your work at Google.</button> (This matches "About"??)
    # "Tell me about your work at Google" contains "about".
    # Use exact=True to avoid partial match.

    about_link = page.get_by_role("button", name="About", exact=True).first
    expect(about_link).to_be_visible()

    # 3. Act: Click "About"
    about_link.click()

    # 4. Assert: Check for Dashboard content in About page
    # Look for the section header we added
    expect(page.get_by_text("Live Research: Preparing for AGI")).to_be_visible()

    # Look for some dashboard specific content, e.g., "Consensus AGI Arrival Trajectory"
    expect(page.get_by_text("Consensus AGI Arrival Trajectory")).to_be_visible()

    # 5. Screenshot: Capture the About page with the embedded dashboard
    page.screenshot(path="verification/about_page_with_dashboard.png", full_page=True)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_dashboard_move(page)
            print("Verification script finished successfully.")
        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="verification/failure.png")
        finally:
            browser.close()
