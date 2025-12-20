## 2024-05-23 - Testing Vite-dependent Logic in Node
**Learning:** Logic embedded in files that use `import.meta.glob` or `?raw` imports (Vite specific) cannot be easily tested with `node:test` because `tsx` doesn't handle these non-standard imports.
**Action:** Extract pure logic into separate utility files (like `lib/utils.ts`) that don't depend on Vite, allowing them to be unit tested in isolation.
