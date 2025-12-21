# Sentinel's Journal

## 2024-05-22 - Missing Content Security Policy
**Vulnerability:** The application `index.html` lacked a Content Security Policy (CSP), allowing potential execution of malicious scripts if XSS vulnerabilities were present, and unrestricted loading of external resources.
**Learning:** Even in modern React apps that mitigate XSS, a CSP is a critical defense-in-depth layer. The memory incorrectly stated a CSP existed, highlighting that documentation/memory can drift from implementation.
**Prevention:** Implement a strict CSP in `index.html` during the initial setup and verify it against the actual code, not just documentation. Use `connect-src` to explicitly whitelist necessary APIs (Gemini).

## 2024-05-24 - "Glass Box" Transparency vs Data Leakage
**Context:** Implemented a "Dev Mode" that displays RAG chunks (retrieved context) to the user.
**Risk:** Exposing internal retrieval logic and raw context chunks could inadvertently leak sensitive system instructions or private data if the knowledge base contained such info.
**Mitigation:** In this project, the data is public (blog posts, resume), so the risk is low. However, for future applications, "Dev Mode" features must be gated or strictly sanitized to ensure they don't expose PII or secrets stored in the vector database.
