
from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto("http://localhost:3000")

    # 1. Verify Navbar does not have "Contact"
    print("Checking Navbar...")
    nav = page.locator("nav")
    expect(nav.get_by_role("button", name="Contact")).not_to_be_visible()

    # Take a screenshot of the navbar
    page.screenshot(path="verification/navbar.png", clip={"x":0, "y":0, "width": 1280, "height": 80})

    # 2. Verify Shortcuts Modal
    print("Checking Shortcuts Modal...")
    # Open modal using Shift + ?
    page.keyboard.press("Shift+?")

    # Wait for modal
    modal = page.get_by_role("dialog", name="Keyboard Shortcuts")
    expect(modal).to_be_visible()

    # Check that "Go to Contact" is NOT present
    expect(modal.get_by_text("Go to Contact")).not_to_be_visible()

    # Take a screenshot of the modal
    page.screenshot(path="verification/shortcuts_modal.png")

    print("Verification complete.")
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
