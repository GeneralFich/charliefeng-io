## 2024-05-22 - Icon-Only Button Feedback
**Learning:** For icon-only buttons (like "Copy Link"), updating just the icon isn't enough for screen readers. The `aria-label` and `title` must also be dynamic to convey the success state (e.g., "Copied!").
**Action:** When toggling icons on buttons, always update `aria-label` and `title` to reflect the new state immediately.
