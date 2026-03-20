# Testing Strategy 🧪

This directory contains the **Unit Tests** for the application's core logic (backend logic, utilities, and services).

## Quick Start

To run the unit test suite:

```bash
pnpm test
```

This runs all tests ending in `.ts` within the `tests/` directory.

## Testing Stack

We use a lightweight, native approach for unit testing:

- **Runner**: `node:test` (Native Node.js test runner)
- **Assertions**: `node:assert` (Native assertions)
- **Execution**: `tsx` (TypeScript Execute) for running TypeScript files directly without a separate build step.

### Why `experimental-test-module-mocks`?

We use the `--experimental-test-module-mocks` flag to enable mocking of ES Modules (ESM). This allows us to mock external dependencies like `@google/genai` or internal modules like `lib/rag.ts` during testing, which is crucial for isolating logic without making real API calls.

## Directory Structure

```
tests/
├── test_*.ts           # Unit test files
└── README.md           # You are here
```

## E2E / Frontend Verification

End-to-End (E2E) tests that verify the UI and browser interactions are located in the `verification/` directory and use **Playwright**.

To run E2E tests:

```bash
npx playwright test
```

## Key Test Suites

- **`test_rag_logic.ts`**: Verifies the vector math (cosine similarity) and retrieval logic.
- **`test_gemini_service.ts`**: Tests the AI service integration, including input validation and error handling.
- **`test_utils.ts`**: Covers shared utility functions like `chunkText`, `safeJsonParse`, etc.
- **`test_security.ts`**: Validates rate limiting and input sanitization.

## Writing New Tests

1. Create a file named `test_YOUR_FEATURE.ts`.
2. Import `describe`, `it` from `node:test` and `assert` from `node:assert`.
3. Use the `describe/it` pattern to structure your tests.

Example:

```typescript
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { myFunc } from '../lib/myFunc';

describe('myFunc', () => {
  it('should return true', () => {
    assert.strictEqual(myFunc(), true);
  });
});
```
