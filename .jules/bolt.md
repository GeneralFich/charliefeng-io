## 2025-12-19 - Scroll Performance Pattern
**Learning:** Attaching direct event listeners to `scroll` events that perform DOM reads (like `scrollY`) causes layout thrashing and performance degradation on high-refresh displays.
**Action:** Use the `requestAnimationFrame` "ticking" pattern for all scroll listeners to decouple the read/write operations from the event firing rate. Always ensure to cancel the animation frame in the cleanup function to avoid updates on unmounted components.

## 2024-05-22 - Configuration Object Pattern
**Learning:** Using `if/else if` chains or `switch` statements for mapping keys to components inside render functions creates O(N) complexity and reduces readability.
**Action:** Use static configuration objects (hash maps) for O(1) lookups. Define these outside the component or memoize them to prevent recreation on every render.
