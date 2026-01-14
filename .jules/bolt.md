## 2025-12-19 - Scroll Performance Pattern
**Learning:** Attaching direct event listeners to `scroll` events that perform DOM reads (like `scrollY`) causes layout thrashing and performance degradation on high-refresh displays.
**Action:** Use the `requestAnimationFrame` "ticking" pattern for all scroll listeners to decouple the read/write operations from the event firing rate. Always ensure to cancel the animation frame in the cleanup function to avoid updates on unmounted components.

## 2025-12-20 - Recursive Tree Optimization
**Learning:** Recursive React node transformation functions (like search highlighting) often rebuild the entire component tree even when no changes are applied, forcing unnecessary reconciliation and garbage collection.
**Action:** Implement "identity checks" in recursive mappers: if the transformed children are strictly equal to the original children, return the original node reference to allow React's `memo` and diffing to bail out early.
