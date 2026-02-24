## 2024-05-24 - Dynamic Error Messages
**Learning:** Dynamic error messages (like form validation failures) must have `role="alert"` or `aria-live="assertive"` to be announced by screen readers when they appear. Without this, visual-only users see the error, but screen reader users are left unaware of why the form submission failed.
**Action:** Always wrap conditional error messages in a container with `role="alert"`. For success messages that replace content, use `role="status"` or `aria-live="polite"`.

## 2024-05-25 - Redundant Titles
**Learning:** Icon-only buttons with `aria-label` are accessible to screen readers but confusing for mouse users without tooltips. Adding a `title` attribute matching the `aria-label` provides a native tooltip for sighted users, unifying the experience.
**Action:** Always pair `aria-label` with `title` for icon-only interactive elements.
