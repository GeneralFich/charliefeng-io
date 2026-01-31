## 2024-05-24 - Visibility of Hover-Only Actions
**Learning:** Interactive elements that use `opacity-0` and `group-hover:opacity-100` (like 'Copy' buttons) become invisible traps for keyboard users.
**Action:** Always pair `group-hover:opacity-100` with `focus:opacity-100` or `group-focus:opacity-100` to ensure keyboard discoverability.

## 2024-10-27 - Silent Failure Patterns
**Learning:** The chat interface silently swallowed API errors, leaving users confused. `catch` blocks often only logged to console.
**Action:** Audit all async hooks (`useChat`, etc.) to ensure user-facing feedback is provided on failure.

## 2025-05-27 - Scrollable Code Blocks
**Learning:** Code blocks (`pre` tags) with `overflow: auto` are inaccessible to keyboard users unless they are focusable.
**Action:** Always add `tabIndex={0}`, `role="region"`, and an `aria-label` to scrollable code containers to ensure keyboard accessibility.

## 2025-06-15 - Nested Interactive Controls
**Learning:** Wrapping complex cards in `role="button"` creates nested interactive control violations when the card contains other buttons (like 'Share'), confusing screen readers.
**Action:** Instead of making the container a button, use the "redundant click handler" pattern: keep the `onClick` on the container for mouse users, but rely on a semantic `<button>` inside the title for keyboard/SR users.

## 2025-06-15 - Destructive Action Confirmation
**Learning:** Destructive actions (like clearing chat) executed immediately on click can cause accidental data loss and user frustration.
**Action:** Implement a "click-to-arm, click-to-fire" pattern for destructive buttons, changing the UI state (color/icon) to warn the user before execution.
