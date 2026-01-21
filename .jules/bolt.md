## 2025-12-19 - Scroll Performance Pattern
**Learning:** Attaching direct event listeners to `scroll` events that perform DOM reads (like `scrollY`) causes layout thrashing and performance degradation on high-refresh displays.
**Action:** Use the `requestAnimationFrame` "ticking" pattern for all scroll listeners to decouple the read/write operations from the event firing rate. Always ensure to cancel the animation frame in the cleanup function to avoid updates on unmounted components.

## 2025-12-22 - Configuration Object Pattern
**Learning:** Replacing `if-else` chains with configuration objects (Map/Object lookup) improves runtime complexity from O(N) to O(1) and enhances readability for component mapping.
**Action:** Use `Object.prototype.hasOwnProperty.call(config, key)` when looking up dynamic keys in a configuration object to prevent prototype pollution or reserved word collisions (e.g., "toString").
