# Verification & Regression Testing

This directory contains the **verification layer** of the application. It ensures that critical frontend flows (like the Contact Form, Navigation, and Chat) continue to work as expected.

## The "Relay" Philosophy 🏃‍♂️

We follow the **Relay** methodology for verification:
1.  **Keep it Green:** Tests must always pass. If a test is flaky, fix it or delete it.
2.  **Small & Reliable:** Prefer targeted tests that verify specific functionality over massive end-to-end suites that break easily.
3.  **Visual Confirmation:** Use screenshots for complex UI states that are hard to assert programmatically (e.g., "does the resume look right?").

## Directory Structure

There are two types of scripts in this directory:

### 1. Regression Tests (`*.spec.ts`)
These are standard **Playwright Test** files. They contain assertions (`expect`) and are designed to be run by the Playwright test runner. They are your primary defense against regressions.

*   **Example:** `scroll_progress_contact.spec.ts` (Verifies the scroll bar logic).
*   **How to run:**
    ```bash
    # Run all specs
    npx playwright test

    # Run a specific spec
    npx playwright test verification/scroll_progress_contact.spec.ts
    ```

### 2. Ad-hoc Verification Scripts (`*.ts`)
These are standalone scripts executed directly with `tsx`. They are useful for tasks that require complex logic not easily fitted into a test runner, or for generating visual artifacts (screenshots) for manual review.

*   **Example:** `verify_contact_form.ts` (Fills out the form and takes a screenshot).
*   **How to run:**
    ```bash
    npx tsx verification/verify_contact_form.ts
    ```

## Quick Start

1.  **Install Browsers:**
    ```bash
    npx playwright install chromium
    ```

2.  **Start the Dev Server:**
    Ensure your local server is running (usually on port 3000):
    ```bash
    pnpm dev
    ```

3.  **Run Verification:**
    In a separate terminal:
    ```bash
    # Run the regression suite
    npx playwright test
    ```

## Troubleshooting

*   **Port Conflicts:** The standalone scripts typically try to connect to `localhost:3000`. If your server is on a different port (e.g., 3001), you may need to update the script or restart your server.
*   **"expect is not defined":** You are likely trying to run a `.spec.ts` file with `tsx`. Use `npx playwright test` instead.
