# Relay's Journal

## 2024-05-22 - [Deep Linking Persistence]
**Learning:** Playwright tests using `page.goto()` with query parameters (e.g., `?view=essays`) work reliably, but verifying state persistence across navigation (e.g., clicking a link vs. back button) requires careful handling of browser history.
**Action:** When testing deep links, explicitly verify the final URL and the state of the rendered component (e.g., specific input values) to ensure the router correctly reconstituted the state.

## 2024-05-23 - [Mobile Navigation Verification]
**Learning:** On mobile viewports, the navigation menu is often hidden behind a hamburger button. Standard locators will fail.
**Action:** Always start mobile tests by clicking the "Open menu" button before attempting to access navigation items.

## 2024-05-24 - [Clipboard Permissions in Playwright]
**Learning:** Testing "Copy to Clipboard" functionality requires explicit browser permissions.
**Action:** Use `context.grantPermissions(['clipboard-read', 'clipboard-write'])` in the test setup.
