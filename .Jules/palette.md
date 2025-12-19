## 2024-05-23 - Dark Mode Text Contrast
**Learning:** In dark mode interfaces (slate-950 background), `text-slate-500` can be too subtle for secondary information like character counters, failing WCAG AA standards. `text-slate-400` offers significantly better legibility while remaining visually distinct from primary text (`text-slate-100`).
**Action:** When adding secondary text elements in dark mode, default to `text-slate-400` or lighter, verifying contrast against the background.
