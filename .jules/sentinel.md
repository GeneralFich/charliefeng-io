# Sentinel's Journal

## 2024-05-22 - Missing Content Security Policy
**Vulnerability:** The application `index.html` lacked a Content Security Policy (CSP), allowing potential execution of malicious scripts if XSS vulnerabilities were present, and unrestricted loading of external resources.
**Learning:** Even in modern React apps that mitigate XSS, a CSP is a critical defense-in-depth layer. The memory incorrectly stated a CSP existed, highlighting that documentation/memory can drift from implementation.
**Prevention:** Implement a strict CSP in `index.html` during the initial setup and verify it against the actual code, not just documentation. Use `connect-src` to explicitly whitelist necessary APIs (Gemini).

## 2025-02-12 - Protocol-Relative URL Open Redirect
**Vulnerability:** The link handling logic in `ChatMessage.tsx` checked `href.startsWith('/')` to identify internal links, incorrectly capturing protocol-relative URLs (e.g., `//malicious.com`) as internal. This caused them to open in the same tab/window instead of a new tab with `noopener`, creating a potential open redirect or tabnabbing risk.
**Learning:** Checking for internal paths via `startsWith('/')` is insufficient because `//` is a valid start for external URLs. Security logic must explicitly distinguish between root-relative paths and protocol-relative URLs.
**Prevention:** Use stricter checks for internal links (e.g., `href.startsWith('/') && !href.startsWith('//')`) or leverage URL parsing APIs to determine origin reliability. Always verify "edge case" URL formats like protocol-relative links.

## 2025-02-23 - Client-Side Validation Bypass in React Forms
**Vulnerability:** The `ContactForm` relied implicitly on HTML5 browser validation (e.g., `type="email"`). While convenient, this meant the custom React `onSubmit` logic (and its associated error handling/logging) was effectively unreachable for simple validation failures, and relied entirely on browser UI implementation which varies.
**Learning:** Relying solely on `type="email"` creates a "dead code" path in React handlers if `noValidate` isn't used. To truly control the validation UX and ensure custom security checks run, one must disable native validation and implement explicit checks in the handler.
**Prevention:** When implementing custom validation logic in React forms, explicitly add `noValidate` to the `<form>` element and replicate necessary checks (required, format) in JavaScript to ensure the handler is the single source of truth for validation.

## 2025-02-26 - Data Loss in RAG Ingestion due to Naive Regex
**Vulnerability:** The ingestion script `scripts/ingest_blog.ts` used a naive regex `/[^.!?]+[.!?]+/` to split text into sentences. This regex implicitly assumed that every sentence must end with punctuation. Consequently, headers (e.g., `# Introduction`) and sentences lacking trailing punctuation were silently discarded, compromising the integrity and availability of the RAG knowledge base.
**Learning:** Regex patterns for natural language processing often fail on edge cases like headers or unpunctuated text. Duplicating logic (DRY violation) between the ingestion script and the main application led to a discrepancy where the app had robust logic but the data pipeline did not.
**Prevention:** Always test regex boundaries against diverse inputs (headers, empty lines, no punctuation). Centralize utility functions like `chunkText` in a shared library (`lib/utils.ts`) to ensure consistency between data processing and runtime logic.
