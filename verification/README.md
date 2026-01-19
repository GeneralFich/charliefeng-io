# Frontend Verification & E2E Testing 🕵️‍♀️

This directory contains **End-to-End (E2E)** tests using **Playwright**.

## Philosophy: Why Verification?

While our Unit Tests (`tests/`) verify that the *logic* is correct (e.g., "does this function calculate the right number?"), these Verification tests ensure the *experience* is correct (e.g., "does the error message actually turn red when the API fails?").

We use Playwright to simulate a real browser environment to catch issues that unit tests miss:
*   **CSS & Styling**: Ensuring error messages look like errors.
*   **Browser APIs**: Verifying integrations with `localStorage`, `window.scroll`, and Network requests.
*   **User Flows**: Simulating clicks, typing, and navigation.
*   **Security**: Verifying that rate limits persist across page reloads.

## Quick Start

### 1. Install Browsers
If this is your first time running Playwright, you need to install the browser binaries:

```bash
npx playwright install
```

### 2. Run All Verifications
To run the full suite in headless mode:

```bash
npx playwright test
```

### 3. Interactive Mode (UI)
To see the browser running and debug tests visually:

```bash
npx playwright test --ui
```

## Directory Structure

*   `*.spec.ts`: The actual test files.
    *   `verify_chat_error.spec.ts`: Mocks API failures to check error UI.
    *   `verify_rate_limit.spec.ts`: Checks if rate limits survive page reloads.
    *   `verify_essays.spec.ts`: Checks the blog list filtering and rendering.
*   `*.png`: Screenshots generated during tests (often used for manual debugging or visual confirmation).

## Key Patterns

*   **Network Mocking**: We often mock external APIs (like Google Gemini) using `page.route` to force specific states (success, failure, delays) without spending money or hitting real rate limits.
*   **Visual Assertions**: We use assertions like `.toHaveClass()` to verify that state changes are reflected in the UI (e.g., red borders for errors).
