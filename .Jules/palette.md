## 2024-05-24 - Visibility of Hover-Only Actions
**Learning:** Interactive elements that use `opacity-0` and `group-hover:opacity-100` (like 'Copy' buttons) become invisible traps for keyboard users.
**Action:** Always pair `group-hover:opacity-100` with `focus:opacity-100` or `group-focus:opacity-100` to ensure keyboard discoverability.
