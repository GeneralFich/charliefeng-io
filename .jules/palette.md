## 2024-05-24 - Dynamic Error Messages
**Learning:** Dynamic error messages (like form validation failures) must have `role="alert"` or `aria-live="assertive"` to be announced by screen readers when they appear. Without this, visual-only users see the error, but screen reader users are left unaware of why the form submission failed.
**Action:** Always wrap conditional error messages in a container with `role="alert"`. For success messages that replace content, use `role="status"` or `aria-live="polite"`.

## 2024-05-25 - Focus Management for Input Actions
**Learning:** When adding inline actions to input fields (like a "Clear Input" button), simply clearing the state is insufficient. The focus is lost to the body or the clicked button, forcing the user to re-click the input to type again.
**Action:** Always use a `ref` to programmatically restore focus (`inputRef.current?.focus()`) immediately after the action is performed to maintain flow.
