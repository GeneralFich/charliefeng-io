## 2024-05-24 - Visibility of Hover-Only Actions
**Learning:** Interactive elements that use `opacity-0` and `group-hover:opacity-100` (like 'Copy' buttons) become invisible traps for keyboard users.
**Action:** Always pair `group-hover:opacity-100` with `focus:opacity-100` or `group-focus:opacity-100` to ensure keyboard discoverability.

## 2025-12-23 - Focus Management for Input Utilities
**Learning:** When implementing utility actions like "Clear Input", simply clearing the state is insufficient; focus must be explicitly returned to the input to maintain flow.
**Action:** Use `inputRef.current?.focus()` immediately after state clearing actions.
