## 2025-12-19 - Scroll Performance Pattern
**Learning:** Attaching direct event listeners to `scroll` events that perform DOM reads (like `scrollY`) causes layout thrashing and performance degradation on high-refresh displays.
**Action:** Use the `requestAnimationFrame` "ticking" pattern for all scroll listeners to decouple the read/write operations from the event firing rate. Always ensure to cancel the animation frame in the cleanup function to avoid updates on unmounted components.

## 2025-12-20 - Regex Instantiation in Recursive Components
**Learning:** Instantiating `new RegExp(query, 'gi')` inside a component's render body (specifically in `SearchHighlighter`) creates a new object for every single text node traversal, causing significant GC pressure and CPU overhead during filtering.
**Action:** Move RegExp construction out of the render loop. Use `useMemo` in the parent component to create the RegExp only when the query string changes, and pass the pre-compiled `RegExp` object down to the child components.
