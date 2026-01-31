## 2025-12-19 - Scroll Performance Pattern
**Learning:** Attaching direct event listeners to `scroll` events that perform DOM reads (like `scrollY`) causes layout thrashing and performance degradation on high-refresh displays.
**Action:** Use the `requestAnimationFrame` "ticking" pattern for all scroll listeners to decouple the read/write operations from the event firing rate. Always ensure to cancel the animation frame in the cleanup function to avoid updates on unmounted components.

## 2025-12-19 - Optimizing Recursive Tree Transformations
**Learning:** When recursively transforming a React Node tree (e.g. for search highlighting), unconditional object creation (mapping arrays, cloning elements) destroys referential equality. This forces React to re-render the entire subtree even if nothing changed.
**Action:** Implement strict equality checks (`===`) after transformation. If the transformed children are identical to the original children, return the original node reference. This allows React's diffing to short-circuit.

## 2024-05-22 - Configuration Object Pattern
**Learning:** Using `if/else if` chains or `switch` statements for mapping keys to components inside render functions creates O(N) complexity and reduces readability.
**Action:** Use static configuration objects (hash maps) for O(1) lookups. Define these outside the component or memoize them to prevent recreation on every render.
