## 2025-12-19 - Scroll Performance Pattern
**Learning:** Attaching direct event listeners to `scroll` events that perform DOM reads (like `scrollY`) causes layout thrashing and performance degradation on high-refresh displays.
**Action:** Use the `requestAnimationFrame` "ticking" pattern for all scroll listeners to decouple the read/write operations from the event firing rate. Always ensure to cancel the animation frame in the cleanup function to avoid updates on unmounted components.

## 2025-05-21 - Memory Efficiency with matchAll
**Learning:** Using `String.match(globalRegex)` creates an array of all matches in memory, which can be expensive for large texts (O(N) space).
**Action:** Use `String.matchAll(globalRegex)` to get an iterator and process matches lazily (O(1) space for the match list), especially when processing large documents or logs.
