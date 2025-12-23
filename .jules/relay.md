## 2024-05-24 - Robust JSON Extraction
**Learning:** Naive JSON extraction using `lastIndexOf(']')` fails when trailing noise contains brackets (e.g. `["Q1"] and [More]`).
**Action:** Implement iterative parsing that attempts to parse valid JSON from the first open bracket, expanding the substring until valid JSON is found or brackets are exhausted.
