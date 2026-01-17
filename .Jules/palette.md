## 2024-05-24 - Visibility of Hover-Only Actions
**Learning:** Interactive elements that use `opacity-0` and `group-hover:opacity-100` (like 'Copy' buttons) become invisible traps for keyboard users.
**Action:** Always pair `group-hover:opacity-100` with `focus:opacity-100` or `group-focus:opacity-100` to ensure keyboard discoverability.

## 2024-10-27 - Silent Failure Patterns
**Learning:** The chat interface silently swallowed API errors, leaving users confused. `catch` blocks often only logged to console.
**Action:** Audit all async hooks (`useChat`, etc.) to ensure user-facing feedback is provided on failure.
