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

## 2025-02-13 - [Error State Verification]
**Learning:** Playwright's `page.route` is effective for testing error UI by aborting network requests. However, verifying text alone is insufficient; UI state often depends on specific data patterns (e.g., "Error:" prefix).
**Action:** When testing error states, verify both the message text AND the visual style (class name) to catch silent UI regressions where errors look like normal messages.

## 2025-02-13 - [Browser Globals Mocking in Node]
**Learning:** Functions relying on `window` or `document` can be unit tested in `node:test` by temporarily assigning to `global` in `before` hooks and restoring in `after`.
**Action:** Use this pattern to test utility functions that mix logic with DOM manipulation, instead of skipping them.

## 2025-02-14 - [List Filtering Verification]
**Learning:** When testing search filtering in a grid layout where items act as buttons, generic locators like `getByRole('button')` can be too broad (capturing clear buttons, share buttons, etc.).
**Action:** Use specific locators like `h3` or `article` titles to count visible items, or combine `getByRole` with accessible names if available.