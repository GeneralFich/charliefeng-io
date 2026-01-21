## 2024-05-24 - Visibility of Hover-Only Actions
**Learning:** Interactive elements that use `opacity-0` and `group-hover:opacity-100` (like 'Copy' buttons) become invisible traps for keyboard users.
**Action:** Always pair `group-hover:opacity-100` with `focus:opacity-100` or `group-focus:opacity-100` to ensure keyboard discoverability.

## 2024-10-27 - Silent Failure Patterns
**Learning:** The chat interface silently swallowed API errors, leaving users confused. `catch` blocks often only logged to console.
**Action:** Audit all async hooks (`useChat`, etc.) to ensure user-facing feedback is provided on failure.

## 2025-05-27 - Scrollable Code Blocks
**Learning:** Code blocks (`pre` tags) with `overflow: auto` are inaccessible to keyboard users unless they are focusable.
**Action:** Always add `tabIndex={0}`, `role="region"`, and an `aria-label` to scrollable code containers to ensure keyboard accessibility.

## 2025-06-05 - Destructive Action Confirmation
**Learning:** Immediate execution of destructive actions (like clearing chat) creates anxiety and potential data loss for users.
**Action:** Implement "double-tap to confirm" for icon-only destructive actions. Use distinct visual states (color, icon) and updated ARIA labels during the confirmation phase.
