# Sentinel's Journal

## 2024-05-22 - Missing Content Security Policy
**Vulnerability:** The application `index.html` lacked a Content Security Policy (CSP), allowing potential execution of malicious scripts if XSS vulnerabilities were present, and unrestricted loading of external resources.
**Learning:** Even in modern React apps that mitigate XSS, a CSP is a critical defense-in-depth layer. The memory incorrectly stated a CSP existed, highlighting that documentation/memory can drift from implementation.
**Prevention:** Implement a strict CSP in `index.html` during the initial setup and verify it against the actual code, not just documentation. Use `connect-src` to explicitly whitelist necessary APIs (Gemini).
