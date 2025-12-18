## 2024-05-23 - [React.memo and Object Stability]
**Learning:** Extracting complex object props (like `components` for `react-markdown`) outside the render scope is crucial when using `React.memo`. If defined inline, they create new references on every render, defeating the memoization.
**Action:** Always check if objects passed to memoized components are stable references. Define them as constants outside the component or use `useMemo`.
