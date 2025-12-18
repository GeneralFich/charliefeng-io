# Sentinel Journal

## 2024-05-22 - CSP and Link Hardening
**Vulnerability:** Weak link sanitization and missing CSP.
**Learning:** `startsWith` is insufficient for protocol validation due to case sensitivity and normalization. `URL` API is safer.
**Prevention:** Use `URL` constructor for protocol checks; implement strict CSP.
