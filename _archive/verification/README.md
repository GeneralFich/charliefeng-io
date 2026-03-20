# Verification & E2E Testing 🕵️‍♀️

This directory contains End-to-End (E2E) tests powered by [Playwright](https://playwright.dev/). These tests verify the application works correctly in a real browser environment, checking UI interactions, navigation, and visual regressions.

## Prerequisites

Before running any tests, ensure you have installed the necessary browser binaries:

```bash
npx playwright install
```

## Test Types

We employ two types of verification scripts in this directory:

### 1. Standard Playwright Tests (`*.spec.ts`)

These are the primary E2E tests managed by the Playwright Test Runner.

- **Config**: `playwright.config.ts` (in the root)
- **Port**: Auto-starts the dev server on **port 3000**.
- **Runner**: `npx playwright test`

**How to run:**

```bash
# Run all spec tests
npx playwright test

# Run a specific test file
npx playwright test verification/verify_titles.spec.ts

# Run in UI mode (interactive debugger)
npx playwright test --ui
```

### 2. Standalone Verification Scripts (`*.ts`)

These are manual "smoke test" scripts designed to be run individually. They are often used for quick checks or specific scenarios that don't fit the standard runner's lifecycle.

- **Port**: These scripts often assume a server is **already running** or target a specific port (e.g., `verify_chat_input.ts` targets **port 3001** to avoid conflicts with the default dev server).
- **Runner**: `npx tsx verification/<script_name>.ts`

**How to run:**

1.  Start a separate dev server instance on port 3001:
    ```bash
    pnpm dev --port 3001
    ```
2.  In a new terminal, run the script:
    ```bash
    npx tsx verification/verify_chat_input.ts
    ```

## Directory Structure

- `*.spec.ts`: Standard test suites (titles, error handling, etc.).
- `*.ts`: Standalone verification scripts.
- `*.png`: Screenshots generated during test runs (useful for debugging visual changes).
