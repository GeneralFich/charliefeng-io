# Verification & E2E Testing 🕵️‍♀️

This directory contains **End-to-End (E2E)** tests that verify the application's behavior from a user's perspective.

Unlike the unit tests in `tests/` which check internal logic (vector math, utilities), these tests launch a real browser (Chromium) to interact with the UI, ensuring that buttons work, styles apply correctly, and accessibility features are functional.

## Prerequisites

Before running these tests, you must install the Playwright browsers:

```bash
npx playwright install
```

## Running Verification

There are two types of verification scripts in this directory:

### 1. Standard Playwright Tests (`*.spec.ts`)

These are the primary E2E tests integrated with the `@playwright/test` runner. They automatically start the dev server (on port 3000), run assertions, and report results.

**To run all spec tests:**
```bash
npx playwright test
```

**To run a specific test:**
```bash
npx playwright test verify_titles.spec.ts
```

### 2. Standalone Scripts (`*.ts`)

Files like `verify_chat_input.ts` are standalone Node.js scripts. They are useful for ad-hoc debugging or generating specific screenshots without the full test runner overhead.

**Note:** You must have the app running locally before executing these scripts.

1. Start the app in one terminal:
   ```bash
   pnpm dev
   ```

2. Run the script in another terminal:
   ```bash
   npx tsx verification/verify_chat_input.ts
   ```

*Warning: Some standalone scripts might have hardcoded ports (e.g., 3001) that differ from the default (3000). Check the file source if connection fails.*

## Generated Artifacts

Tests may generate screenshots or other artifacts in this directory (e.g., `verification.png`, `1_text_typed.png`). These are useful for visual regression checking but are generally git-ignored or treated as temporary.

## Key Files

- **`verify_titles.spec.ts`**: Checks accessibility attributes (titles, tooltips) and mobile menu interaction.
- **`verify_chat_error.spec.ts`**: Mocks network failures to verify the error UI in the chat.
- **`verify_essays.spec.ts`**: Validates the essay list filtering and rendering.
