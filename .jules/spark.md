## 2024-05-24 - [Contextual Navigation]
**Insight:** Users browsing a filtered list (e.g., search results) expect "Next" to respect that filter, not jump to an unrelated item in the canonical list.
**Principle:** When implementing navigation between items in a list, always use the *current* view context (filtered/sorted) rather than the raw dataset.
