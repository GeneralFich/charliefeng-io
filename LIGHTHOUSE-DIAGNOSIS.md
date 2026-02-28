# Lighthouse Audit Diagnosis — charliefeng.io

**Date**: 2026-02-28
**Method**: Static codebase analysis (sandbox network restrictions prevented live Lighthouse/PageSpeed run)
**Stack**: React 19 + Vite 6 + Tailwind CSS 3 + Framer Motion, hosted on Vercel

> **Note**: A live Lighthouse run could not be executed from this environment due to
> network sandboxing. This report is based on a thorough static analysis of every
> source file, build config, and deployment config in the repo. All findings map
> directly to specific Lighthouse audit IDs.

---

## 1. Estimated Scores (Static Analysis Projection)

| Category        | Est. Score | Confidence | Notes |
|-----------------|-----------|------------|-------|
| **Performance** | 55–70     | Medium     | Large JS bundle (blog_data.json = 2.2 MB), no code splitting, canvas animation on every page |
| **Accessibility**| 85–92    | High       | Good foundations (skip link, aria-labels, lang attr) but some gaps |
| **Best Practices**| 80–90   | High       | CSP uses unsafe-inline/unsafe-eval; no HTTPS redirect audit possible |
| **SEO**         | 90–95     | High       | Strong structured data, canonical, sitemap, robots.txt, static pages for crawlers |

---

## 2. Failing / Opportunity Audits — Ordered by Estimated Impact

### CRITICAL — Performance

| # | Issue | Lighthouse Audit | Est. Impact | Change Type |
|---|-------|-----------------|-------------|-------------|
| 1 | **`blog_data.json` is 2.2 MB and bundled into the main JS chunk** | `total-byte-weight`, `unused-javascript` | ~2–4s on 3G | **Build config** |
|   | _Detail_: `lib/rag.ts` uses `await import("./blog_data.json")` which Vite still includes in the build graph. The file contains 768-dim vector embeddings for every blog chunk. This single file likely dominates the entire bundle. | | | |
| 2 | **No code splitting / lazy loading of route components** | `unused-javascript`, `interactive` | ~1–2s TBT | **Code change** |
|   | _Detail_: `App.tsx` eagerly imports all views: `ChatInterface`, `Resume`, `Essays`, `BrowsePanel`, `WhitepaperCharts` (which pulls in Recharts), `EssayDetail` (which pulls in react-markdown + KaTeX + rehype-sanitize). Everything ships in the initial bundle. No `React.lazy()` or dynamic imports for route-level components. | | | |
| 3 | **`ParticleBackground` runs a canvas animation loop on every page** | `total-blocking-time`, `mainthread-work-breakdown` | ~200–500ms TBT | **Code change** |
|   | _Detail_: The `requestAnimationFrame` loop with O(n²) particle-pair distance calculations runs continuously, even when the user is reading an essay. 38 particles × 38 = 703 pair checks per frame at 60fps. | | | |
| 4 | **Google Fonts loaded as render-blocking resource** | `render-blocking-resources` | ~200–400ms FCP | **Code change** |
|   | _Detail_: `index.html:36` loads Noto Sans SC via `media="print" onload="this.media='all'"` — this is the correct async pattern, so impact is mitigated. However, there is no `font-display: swap` fallback declaration, and the font file itself (~120KB for CJK subset) may still block LCP if the user is in Chinese mode. | | | |
| 5 | **Tailwind CDN script in infographic iframes (RENDER-BLOCKING)** | `render-blocking-resources`, `uses-long-cache-ttl` | ~300–600ms per iframe | **Code change** |
|   | _Detail_: All 4 files in `public/infographics/thermodynamic-wall/` load `<script src="https://cdn.tailwindcss.com">` — this is the **Play CDN**, not a production build. It is: (a) render-blocking, (b) ~350KB uncompressed, (c) generates styles at runtime via JS, (d) not cached efficiently. Additionally, each iframe also loads `chart.js` from jsdelivr CDN (~200KB). | | | |
| 6 | **No image optimization / missing og:image** | `uses-optimized-images`, `uses-webp-images` | Minor (few images) | **Code + Build** |
|   | _Detail_: The site has no raster images in `public/` (only an SVG favicon), but `og:image` and `twitter:image` meta tags are missing entirely. Social sharing will have no preview card. | | | |

### HIGH — Performance

| # | Issue | Lighthouse Audit | Est. Impact | Change Type |
|---|-------|-----------------|-------------|-------------|
| 7 | **Heavy dependencies shipped to all users** | `unused-javascript`, `total-byte-weight` | ~500KB+ | **Build config** |
|   | _Detail_: `framer-motion` (~120KB min+gz), `recharts` (~200KB), `katex` (~280KB CSS+JS), `react-markdown` + `remark-gfm` + `remark-math` + `rehype-sanitize` + `rehype-katex` are all eagerly loaded. Most users visiting the homepage (chat view) never see essays or charts. | | | |
| 8 | **No `Cache-Control` headers configured in `vercel.json`** | `uses-long-cache-ttl` | Repeat visit perf | **Hosting/Infra** |
|   | _Detail_: `vercel.json` sets security headers but no caching headers. Vite hashed assets (JS/CSS) should get `immutable, max-age=31536000`. Static assets should get appropriate cache lifetimes. Vercel provides defaults, but explicit config ensures optimal behavior. | | | |
| 9 | **Inline `<script>` in `<head>` for theme detection** | `render-blocking-resources` | ~10–50ms | **Code change** |
|   | _Detail_: `index.html:38-54` runs synchronous JS to read `localStorage` and toggle the `dark` class. This is intentional (prevents FOUC) and the script is tiny, so impact is minimal. Listing for completeness. | | | |

### MEDIUM — Accessibility

| # | Issue | Lighthouse Audit | Est. Impact | Change Type |
|---|-------|-----------------|-------------|-------------|
| 10 | **`ParticleBackground` canvas has no accessible fallback** | `canvas-has-alt` | A11y score | **Code change** |
|    | _Detail_: The `<canvas>` has `aria-hidden="true"` which is correct — no issue here. | | | |
| 11 | **Color contrast in small text elements** | `color-contrast` | A11y score | **Code change** |
|    | _Detail_: Multiple components use `text-slate-500` and `text-slate-400` on light/dark backgrounds respectively. The `text-[10px]` elements in `BrowsePanel.tsx` and `Navbar.tsx` (e.g., "DIGITAL TWIN" label, date/time metadata) are very likely to fail WCAG AA contrast ratio at that size (requires 4.5:1 for text < 18px). | | | |
| 12 | **Missing `<label>` elements for search inputs** | `label` | A11y score | **Code change** |
|    | _Detail_: `EssayDetail.tsx:182-193` has `aria-label="Search within article"` on the input, which satisfies the audit. Good. | | | |
| 13 | **Heading hierarchy may skip levels** | `heading-order` | A11y score | **Code change** |
|    | _Detail_: `BrowsePanel.tsx` uses `<h2>` then `<h3>` (good). But within the essay markdown rendering, heading levels depend on content authors — worth auditing specific essays. | | | |

### MEDIUM — Best Practices

| # | Issue | Lighthouse Audit | Est. Impact | Change Type |
|---|-------|-----------------|-------------|-------------|
| 14 | **CSP uses `unsafe-inline` and `unsafe-eval`** | `csp-xss` | BP score | **Code + Build** |
|    | _Detail_: `index.html:6` sets `script-src 'self' 'unsafe-inline' 'unsafe-eval'`. The `unsafe-inline` is needed for the theme-detection script, and `unsafe-eval` may be needed for some dependencies. Consider using nonces or hashes for inline scripts, and auditing whether `unsafe-eval` can be removed. | | | |
| 15 | **API keys defined via `process.env` in client bundle** | `no-vulnerable-libraries` | Security concern | **Build config** |
|    | _Detail_: `vite.config.ts:14-16` injects `GEMINI_API_KEY` and `DEEPSEEK_API_KEY` as string replacements. These will appear in the client-side JS bundle if set. This is a security risk (key exposure in browser DevTools). Not a Lighthouse audit per se, but a Best Practices concern. | | | |

### LOW — SEO

| # | Issue | Lighthouse Audit | Est. Impact | Change Type |
|---|-------|-----------------|-------------|-------------|
| 16 | **Missing `og:image` and `twitter:image`** | `meta-description` (related) | Social sharing | **Code change** |
|    | _Detail_: No Open Graph image is specified. Social shares to LinkedIn, Twitter/X, Slack will have no visual preview. Need to add an OG image asset and the corresponding meta tags. | | | |
| 17 | **SPA routing without SSR** | `is-crawlable` | SEO impact | **Mitigated** |
|    | _Detail_: The site is a client-side SPA, but this is **well mitigated** by the `generate_static_pages.ts` build script which creates static HTML for crawlers. This is a solid approach. | | | |

---

## 3. Tailwind CDN — Specific Call-Out

**Files affected**:
- `public/infographics/thermodynamic-wall/collision.html`
- `public/infographics/thermodynamic-wall/leverage.html`
- `public/infographics/thermodynamic-wall/mechanics.html`
- `public/infographics/thermodynamic-wall/strategy.html`

**What's happening**: Each of these 4 infographic HTML files includes:
```html
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
```

**Why it's a problem**:
1. **Render-blocking**: The Tailwind Play CDN script (~350KB) must download, parse, and execute before any styled content appears
2. **Runtime CSS generation**: Unlike the build-time Tailwind in the main app, the CDN version generates CSS via JavaScript at runtime — this is explicitly [not recommended for production](https://tailwindcss.com/docs/installation/play-cdn)
3. **No caching benefit**: The CDN URL has no version pin, so cache behavior is unpredictable
4. **Duplicated dependency**: The main app already uses Tailwind via PostCSS — these iframes load a second, complete copy
5. **Chart.js is also unversioned**: `cdn.jsdelivr.net/npm/chart.js` resolves to latest, risking breaking changes

**Recommended fix**: Pre-build the infographic styles into a small CSS file at build time, or inline the ~20 utility classes actually used. Replace Chart.js CDN with a pinned version or bundle it.

---

## 4. Prioritized Action Plan

### P0 — Biggest wins (do first)
1. **Lazy-load `blog_data.json`**: Move to a true async fetch or ensure Vite tree-shakes it out of the initial bundle. Consider loading it only when the chat feature is first used.
2. **Code-split route components**: Use `React.lazy()` for `Essays`, `Resume`, `EssayDetail`, `WhitepaperCharts`. This alone could cut initial bundle by 40–60%.
3. **Replace Tailwind CDN in infographics**: Pre-build or inline the styles. Pin Chart.js version.

### P1 — High value
4. **Add `Cache-Control` headers** in `vercel.json` for hashed assets (`immutable`) and static assets.
5. **Add `og:image`** meta tag with a proper social preview image.
6. **Audit and reduce `unsafe-eval`** in CSP if possible.

### P2 — Polish
7. **Throttle or pause `ParticleBackground`** when not visible (e.g., when user is reading an essay, pause the animation loop).
8. **Fix contrast ratios** on `text-[10px]` metadata elements.
9. **Consider self-hosting Google Fonts** (Noto Sans SC) to eliminate the external request.

### P3 — Nice to have
10. **Move API keys server-side** (Vercel Edge Functions or API routes) instead of embedding in client bundle.
11. **Add `font-display: swap`** to the self-hosted KaTeX CSS import.
12. **Preload critical assets** — consider `<link rel="modulepreload">` for the main entry chunk.

---

## 5. What's Already Done Well

- Skip-to-content link for accessibility
- `aria-hidden="true"` on decorative canvas
- `prefers-reduced-motion` media query respected
- Google Fonts loaded with async pattern (`media="print" onload`)
- Structured data (JSON-LD) for Person and Articles
- Static HTML generation for crawler accessibility
- Proper `robots.txt` with sitemap reference
- Security headers in `vercel.json` (HSTS, X-Frame-Options, etc.)
- `preconnect` hints for Google Fonts domains
- Proper semantic HTML with `<main>`, `<nav>`, `<article>`, `<header>`
- Dynamic `import()` for `blog_data.json` (lazy, but still in build graph)
