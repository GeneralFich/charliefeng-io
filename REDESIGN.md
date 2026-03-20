# charliefeng.io — Redesign Plan

> Transform from "Infrastructure Product Leader portfolio" into a **Product Leadership Studio**.
> Bloomberg Terminal meets Apple editorial restraint. Dark, high-contrast, structured.

---

## 1. Current Architecture Summary

| Aspect | Current Implementation |
|--------|----------------------|
| **Framework** | React 19 + Vite 6 SPA (single-page app) |
| **Styling** | Tailwind CSS 3.4 + custom CSS animations (mesh grid, shimmer, dark/light) |
| **Routing** | Custom `useRouter` hook + `View` enum (`HOME`, `ABOUT`, `ESSAYS`) — no React Router |
| **AI Chat** | Client-side Gemini (primary) + DeepSeek (fallback), streaming, split-panel persistent layout |
| **Content** | 6 markdown essays (EN + ZH pairs) in `/content/posts/`, YAML-structured resume in `/content/resume.md` |
| **i18n** | Full bilingual (EN/ZH) — `LanguageContext`, `translations.ts`, `.zh.md` content files |
| **Data Viz** | D3 force-directed knowledge graph, Recharts for whitepaper charts |
| **SEO** | Build scripts generate static HTML pages for bots, dynamic `<head>` via `useDocumentHead` hook |
| **Build** | `vite build` → `generate_static_pages.ts` → `generate_sitemap.ts` |
| **Deploy** | Vercel with `vercel.json` bot-specific rewrites |
| **Tests** | 26 unit tests (Node.js built-in runner), Playwright E2E |

### Component Inventory (31 components)

**Core Layout:** `App.tsx` (split-panel shell), `Navbar.tsx`, `MobileBottomNav.tsx`
**Chat (6):** `ChatInterface.tsx`, `ChatMessage.tsx`, `ChatWelcome.tsx`, `ChatInput.tsx`, `CodeBlock.tsx`
**Essays (7):** `Essays.tsx`, `EssayList.tsx`, `EssayItem.tsx`, `EssayDetail.tsx`, `EssayHeroCard.tsx`, `EssayMarkdownComponents.tsx`, `TableOfContents.tsx`
**Knowledge Graph (3):** `KnowledgeGraphView.tsx`, `ForceGraph.tsx`, `NodeDetailPanel.tsx`
**Resume (1):** `Resume.tsx`
**Panels (1):** `BrowsePanel.tsx` (right-side discovery surface)
**Viz (2):** `WhitepaperCharts.tsx`, `WhitepaperSummary.tsx`
**UI (8):** `Logo.tsx`, `NavItem.tsx`, `ThemeToggle.tsx`, `LanguageSwitcher.tsx`, `Heading.tsx`, `ShortcutsModal.tsx`, `BackToTop.tsx`, `ScrollProgress.tsx`, `SearchHighlighter.tsx`, `GraphListFallback.tsx`

### Hooks (8)
`useRouter`, `useChat`, `useDocumentHead`, `useGlobalShortcuts`, `useArticleSearch`, `useMediaQuery`, `useDebounce`, `useViewTransition`

### Content Sources
- `/content/posts/` — 12 markdown files (6 EN + 6 ZH)
- `/content/resume.md`, `resume.zh.md` — YAML frontmatter with experience/education/skills arrays
- `/content/graph-data.json` — Knowledge graph nodes and edges
- `/lib/blog_metadata.json` — Per-essay metadata (readTime, tags, featured, accentColor, relatedSlugs)
- `/public/blog_data.json` — Pre-computed embeddings for RAG (2.2MB)

### Services
- `services/geminiService.ts` — Google Gemini streaming + RAG integration
- `services/deepseekService.ts` — DeepSeek fallback (China connectivity)
- `lib/rag.ts` — Client-side RAG: embed query → cosine similarity → top-k chunks
- `lib/knowledge.ts` — Content aggregation via Vite `import.meta.glob`

---

## 2. What to Keep vs. Rebuild

### KEEP (reuse directly or with minor adaptation)

| Asset | Path | Notes |
|-------|------|-------|
| 6 English essays | `/content/posts/*.md` | Convert to MDX, merge metadata from `blog_metadata.json` into frontmatter |
| 6 Chinese essays | `/content/posts/*.zh.md` | Convert to MDX for bilingual support |
| Resume data (EN + ZH) | `/content/resume.md`, `resume.zh.md` | Rich YAML frontmatter — perfect for structured rendering |
| Vector/math utilities | `/lib/vector.ts` | Cosine similarity — framework-agnostic, copy verbatim |
| General utilities | `/lib/utils.ts` | `slugify`, `calculateReadTime`, `chunkText`, `safeJsonParse` |
| Security utilities | `/lib/security.ts` | `checkRateLimit`, `validateChatInput`, `sanitizeInput` |
| Essay filtering logic | `/lib/essay_logic.ts` | `filterAndSortEssays`, `getAllTags`, `getRelatedPosts` |
| Pre-computed embeddings | `/public/blog_data.json` | Reuse for RAG chatbot; re-ingest only when content changes |
| Static assets | `/public/og-image.png`, `favicon.svg` | Replace favicon in P6, OG image updated |
| Infographics | `/public/infographics/thermodynamic-wall/` | 4 interactive HTML files embedded via iframe |
| UI translations | `/lib/i18n/translations.ts` | Adapt for `next-intl`; base translation strings reusable |

### REBUILD (framework-dependent)

| What | Why |
|------|-----|
| Routing | Custom `useRouter` → Next.js App Router file-system routing |
| App shell | Split-panel layout → standard layout with header/footer + floating chat widget |
| Content loading | Vite `import.meta.glob` → `next-mdx-remote` + `gray-matter` |
| AI services | Client-side API calls → Next.js Route Handlers (keys server-side) |
| RAG pipeline | Client-side embedding + search → server-side in API route |
| All React components | New Deep Winter design system, different layout paradigm |
| Build/SEO | Custom static page generation → Next.js native SSR/SSG + `generateMetadata()` |
| i18n | Custom context + translations → `next-intl` with middleware-based locale routing |

### DROP

| What | Reason |
|------|--------|
| Knowledge graph (D3) | Not in redesign spec; `ForceGraph.tsx`, `KnowledgeGraphView.tsx`, `NodeDetailPanel.tsx`, `graph-data.ts/json` |
| `MobileBottomNav.tsx` | Replaced by responsive hamburger nav |
| `BrowsePanel.tsx` | Replaced by new homepage sections |
| `WhitepaperCharts.tsx`, `WhitepaperSummary.tsx` | Specific to old whitepaper rendering |
| `useViewTransition` | Replaced by Framer Motion page transitions |
| `useDocumentHead` | Replaced by Next.js metadata API |
| `useGlobalShortcuts`, `ShortcutsModal` | Not in redesign spec |
| `ScrollProgress.tsx`, `BackToTop.tsx` | Can re-add as polish in P6 if desired |
| `ThemeToggle.tsx` | New site is dark-only (Deep Winter palette) |

---

## 3. Migration Plan

### Strategy: Clean-Room Rebuild

The framework differences are too fundamental for incremental migration (Vite SPA → Next.js App Router SSR, `import.meta.glob` → file-system routing, client-side env vars → server-side). We initialize a new Next.js 15 project, copy reusable content and logic, and build phase-by-phase.

### Target Project Structure

```
app/
  [locale]/                 # next-intl locale wrapper (en, zh)
    layout.tsx              # Root layout (header, footer, fonts, providers)
    page.tsx                # Homepage (P2)
    work/
      page.tsx              # Case study index
      [slug]/page.tsx       # Individual case study
    writing/
      page.tsx              # Essays index
      [slug]/page.tsx       # Individual essay
    artifacts/
      page.tsx              # Artifacts index
      [slug]/page.tsx       # Individual artifact
    resume/page.tsx         # Resume page
    about/page.tsx          # About page
    not-found.tsx           # 404 page
  api/
    chat/route.ts           # Chat API (P7)
  sitemap.ts
  robots.ts
components/
  ui/                       # shadcn/ui components
  layout/
    Header.tsx              # Nav: Work | Artifacts | Writing | About | Resume
    Footer.tsx              # LinkedIn, Substack, email
    PageTransition.tsx      # Framer Motion AnimatePresence
    LocaleSwitcher.tsx      # EN/ZH toggle
  home/
    Hero.tsx
    ProofBar.tsx
    FeaturedWork.tsx
    HowIThink.tsx
    WritingPreview.tsx
    HomeCTA.tsx
  case-study/
    CaseStudyHeader.tsx
    Snapshot.tsx
    StickySidebar.tsx
    DecisionTable.tsx
  writing/
    EssayCard.tsx
    TagFilter.tsx
  artifacts/
    ArtifactCard.tsx
    TypeFilter.tsx
  resume/
    NarrativeView.tsx
    TraditionalView.tsx
    ViewToggle.tsx
  chat/
    ChatWidget.tsx
    ChatMessage.tsx
    ChatInput.tsx
  shared/
    MDXComponents.tsx       # Custom MDX renderers
content/
  case-studies/
    en/rivian.mdx
    zh/rivian.mdx
  essays/
    en/                     # 6 migrated English essays
    zh/                     # 6 migrated Chinese essays
  artifacts/
    en/                     # 5 placeholder artifacts
    zh/
  resume.en.mdx
  resume.zh.mdx
lib/
  mdx.ts                    # MDX loading (compileMDX, getAllPosts, getCaseStudy, etc.)
  vector.ts                 # Copied from current
  utils.ts                  # Copied from current
  security.ts               # Copied from current
  essay-logic.ts            # Copied from current
  rag.ts                    # Server-side RAG (adapted)
  fonts.ts                  # next/font config (Inter, Geist, JetBrains Mono)
  metadata.ts               # Shared metadata helpers
messages/
  en.json                   # next-intl UI translations (English)
  zh.json                   # next-intl UI translations (Chinese)
i18n/
  config.ts                 # next-intl configuration
  request.ts                # Server-side i18n request config
middleware.ts               # next-intl locale detection middleware
services/
  ai.ts                     # Unified AI service (Gemini primary)
styles/
  globals.css               # Tailwind directives + custom CSS
public/
  blog_data.json            # Pre-computed embeddings
  infographics/             # Copied from current
scripts/
  ingest.ts                 # Adapted embedding ingestion script
```

### Design System: Deep Winter

**Color palette** (Tailwind config):
```
obsidian:  '#0A0A0F'    // Primary background
midnight:  '#0D1117'    // Secondary background
charcoal:  '#1C1C1E'    // Card/surface background
silver:    '#C0C0C0'    // Borders, secondary text
steel:     '#8B8B8D'    // Muted text
ghost:     '#F5F5F5'    // Primary text
sapphire:  '#2563EB'    // Interactive: hover, active, links
emerald:   '#059669'    // Success, positive metrics
ruby:      '#DC2626'    // Error, emphasis
```

**Typography:**
- **Inter** — body text (via `next/font/google`)
- **Geist** — headings (via `geist` package / `next/font/local`)
- **JetBrains Mono** — metrics, labels, code (via `next/font/google`)
- All with `font-display: swap`

**Design rules:**
- 1px silver borders for structure
- No gradients (except subtle hero obsidian→midnight)
- No blobs, no earth tones
- Jewel accents (sapphire, emerald, ruby) sparingly — interactive states only
- 12-column grid, `max-w-7xl` centered
- Dark-only (no light mode toggle)

---

## Build Order

### P1: Design System & Layout Shell

**Dependencies:**
```
next@15 react@19 react-dom@19 typescript @types/react @types/node
tailwindcss@3.4 @tailwindcss/typography postcss autoprefixer
shadcn/ui (npx shadcn@latest init)
framer-motion@12 lucide-react geist
next-intl
```

**Deliverables:**
- Tailwind config with Deep Winter palette
- Root layout with fonts (Inter, Geist, JetBrains Mono)
- `Header.tsx` — "Charlie Feng" in Geist tracking-tight, nav links (Work | Artifacts | Writing | About | Resume), hamburger on mobile, locale switcher
- `Footer.tsx` — LinkedIn, Substack, email links
- `PageTransition.tsx` — Framer Motion `AnimatePresence` wrapper
- `next-intl` setup with middleware, `messages/en.json`, `messages/zh.json`
- 12-column grid system, `max-w-7xl` centered
- `globals.css` — Tailwind directives, obsidian background, ghost text

**Verify:** `pnpm dev` — shell renders, fonts load, nav links present, locale switcher works, responsive hamburger menu on mobile.

---

### P2: Homepage

**Deliverables — 6 sections in `app/[locale]/page.tsx`:**

1. **Hero** — "I build AI systems for the infrastructure that runs the internet." + "Product Leader at Google · ex-Amazon PM · Yale MBA". Subtle obsidian→midnight gradient. No photo.
2. **ProofBar** — 4 metrics in JetBrains Mono: "Thousands of engineers served" | "Millions of assets automated" | "$50M+ operational savings" | "4→100+ EV fleet scaled". Charcoal cards, 1px silver borders.
3. **FeaturedWork** — 3 editorial cards (Rivian EV Fleet Platform, GemDC, DCAI Agent Suite). Dark bg, sapphire hover, "Read Case Study →".
4. **HowIThink** — 2×2 grid of principles. Charcoal cards, ghost text, sapphire left-border accent.
5. **WritingPreview** — "Latest Thinking" + 3 most recent essays. Card: title, description, date, "Read →".
6. **HomeCTA** — "View Resume" (sapphire primary) + "Get in Touch" (outlined secondary).

**Requires:** `lib/mdx.ts` partial implementation (`getAllEssays()` for WritingPreview).

**Verify:** All sections render, responsive at 375/768/1440px, generous vertical padding.

---

### P3: Case Study Template + Rivian

**Dependencies:** `next-mdx-remote@5`, `gray-matter`

**Case study MDX frontmatter:**
```yaml
title, company, role, dates, teamSize, metrics[], tags[], skills[]
```

**Case study layout (9 visual blocks):**
1. Header — title, role, company, timeline, team size
2. Snapshot — 4-5 key metrics in monospace horizontal strip
3. The Problem — what was broken
4. Why It Mattered — stakes and consequences
5. Product Framing — users, success metrics, tradeoffs
6. Key Decisions — options, what was prioritized, why (decision table)
7. Execution — architecture/workflow diagram (styled code block or SVG)
8. Outcomes — business impact with numbers
9. Reflection — what I'd do differently

**Sticky sidebar** (desktop): Role, Company, Timeline, Team, Skills, Related artifacts.

**Content:** `content/case-studies/en/rivian.mdx` — written as a Lenny's Newsletter-style product narrative. `[PLACEHOLDER]` where Charlie's input needed. Chinese version shell at `content/case-studies/zh/rivian.mdx`.

**Verify:** `/work/rivian` renders all sections, sticky sidebar tracks scroll, `generateStaticParams` works.

---

### P3.5: Essays Migration

**Content migration** — for each of the 6 essays:
1. Rename `.md` → `.mdx`
2. Merge metadata from `blog_metadata.json` into frontmatter (tags, readTime, featured, relatedSlugs)
3. Move to `content/essays/en/` and `content/essays/zh/`

**Example merged frontmatter:**
```yaml
---
title: "Your AI Strategy Is Already Wrong"
date: 2026-02-23
author: Charlie Feng
description: "Most AI strategy writing fails..."
readTime: 8
tags: ["AI Strategy", "Enterprise AI"]
featured: true
relatedSlugs: ["ai-roadmaps-context-layer", "strategic-whitepaper"]
---
```

**Dependencies** (for math in whitepaper/thermodynamic essays): `remark-math`, `rehype-katex`, `katex`, `remark-gfm`

**Deliverables:**
- `app/[locale]/writing/page.tsx` — "Writing" header, tag filter (AI, Infrastructure, Product, Strategy), single-column editorial layout, newest first
- `app/[locale]/writing/[slug]/page.tsx` — clean reading (max-w-prose/65ch, line-height 1.8), reading time at top, prev/next nav, sapphire links

**Verify:** All 6 essays render in both EN and ZH, tag filtering works, KaTeX math renders in thermodynamic/whitepaper essays.

---

### P4: Artifacts

**Deliverables:**
- `app/[locale]/artifacts/page.tsx` — "Product Artifacts" header, filter tabs (All | PRDs | Decision Docs | Frameworks | Strategy), grid of artifact cards
- `app/[locale]/artifacts/[slug]/page.tsx` — artifact detail from MDX, "Context" callout box at top

**5 placeholder MDX files** in `content/artifacts/en/`:
1. "Platform Prioritization Framework" (Framework)
2. "AI Agent vs. Deterministic Workflow Decision Doc" (Decision Doc)
3. "Fleet Scaling PRD (Sanitized)" (PRD)
4. "Internal Product Success Metrics Template" (Framework)
5. "Capacity Planning Product Strategy Memo" (Strategy)

Cards: title, type badge (color-coded jewel accents), description, read time. Monospace font for document-style sections. `[PLACEHOLDER]` content for Charlie to fill later.

**Verify:** All 5 render, filter tabs work, type badges correctly color-coded.

---

### P5: Resume

**Two view modes with toggle at top:**

**Narrative View** (default) — grouped by PM capability:
- Product Strategy & Vision (GemDC, HC Dashboard, Rivian fleet strategy)
- Platform & Infrastructure Products (DCAI Agent Suite, GemDC platform)
- AI/ML Product Development (AI agents, ML models, capacity planning)
- Scaling & Operations (Rivian fleet 4→100+, $50M savings)
- Cross-functional Leadership (3,100+ person org, multi-team coordination)

Each section: 2-3 bullets pulling strongest evidence, links to case studies.

**Traditional View** — chronological:
- Google TPM (Nov 2023–Present), Google TPM (Jul 2022–Nov 2023)
- Amazon Sr PM (Aug 2021–Jul 2022)
- EY Sr Consultant/Consultant (2015–2019)
- Yale SOM MBA, NYU Stern BS
- Skills + Languages (English, Mandarin Chinese — native)

**Data source:** Parse `content/resume.en.mdx` / `resume.zh.mdx` YAML frontmatter.

**PDF export:** `@react-pdf/renderer` or `react-to-print` for clean, ATS-friendly PDF from traditional view.

**Verify:** Both views render, toggle works, PDF exports correctly, both EN/ZH resumes work.

---

### P6: About + Final Polish

**About page:**
- Short bio (3-4 paragraphs). Lead: "I build products for complex systems."
- "What I'm exploring" — AI infrastructure, internal platforms as products, decision automation
- "Outside work" — Leica Q3 43 photography (6-8 image grid + lightbox), Big Green Egg cooking, structured fitness

**Polish across all pages:**
- `generateMetadata()` on every `page.tsx` — title, description, OG image
- Favicon: "CF" monogram, ghost white on obsidian
- `app/[locale]/not-found.tsx` — minimal, on-brand 404
- `app/sitemap.ts`, `app/robots.ts`
- Lighthouse 95+ (performance, accessibility, SEO)
- Verify all internal links
- Test mobile responsive on all pages

**Verify:** Lighthouse 95+, OG tags valid, sitemap at `/sitemap.xml`, 404 renders, all links work.

---

### P7: RAG Chatbot

**Dependencies:** `ai` (Vercel AI SDK), `@ai-sdk/google` (or `@ai-sdk/anthropic`)

**Architecture:**
- `app/api/chat/route.ts` — POST handler:
  1. Input validation (reuse `lib/security.ts`)
  2. Rate limiting (10 req/min/IP)
  3. RAG retrieval (embed query → cosine similarity search → top-k chunks, server-side)
  4. System prompt: "You are an AI assistant for Charlie Feng's portfolio..."
  5. Streaming via Vercel AI SDK `streamText()`
- `components/chat/ChatWidget.tsx` — floating button (bottom-right), slide-up panel
- `components/chat/ChatMessage.tsx` — obsidian panel, charcoal bubbles, ghost text
- `components/chat/ChatInput.tsx` — "Ask about my product experience..."

**Suggested prompt chips:**
- "What's your experience with AI products?"
- "Tell me about the Rivian fleet scaling"
- "What frameworks do you use for prioritization?"

**Reusable from current project:**
- `lib/vector.ts` — cosine similarity (verbatim)
- `lib/security.ts` — rate limiting, input validation
- `lib/rag.ts` — retrieval algorithm (adapt to server-side data loading)
- `public/blog_data.json` — pre-computed embeddings (load at module scope)

**Env vars:** `GOOGLE_API_KEY` (or `ANTHROPIC_API_KEY`), vector store connection if using pgvector.

**Verify:** Widget opens/closes, streaming responses, RAG returns relevant chunks, API keys not in browser Network tab, rate limiting works.

---

## Risk Areas

| Risk | Severity | Mitigation |
|------|----------|------------|
| MDX + remark-math + rehype-katex plugin ordering | **High** | Test with `the-thermodynamic-wall` essay immediately in P3.5 |
| RAG cold start on serverless (2.2MB JSON) | **High** | Module-scope caching; consider pgvector for production |
| next-intl + App Router complexity | **Medium** | Follow official next-intl App Router docs; EN is the default locale |
| Case study content depth | **Medium** | Use `[PLACEHOLDER]` blocks; doesn't block technical implementation |
| PDF export cross-browser | **Medium** | Use `@react-pdf/renderer` for consistent output |
| Infographic iframes in essays | **Low** | Copy HTML to `public/infographics/`, same iframe embed pattern |

---

## Content Migration Checklist

### Essays (P3.5)
- [ ] `ai-strategy-wrong.md` → `content/essays/en/ai-strategy-wrong.mdx` (merge: readTime=8, tags=["AI Strategy","Enterprise AI"], featured=true)
- [ ] `ai-roadmaps-context-layer.md` → `content/essays/en/ai-roadmaps-context-layer.mdx` (merge: readTime=7, tags=["AI Strategy","Data Infrastructure"], featured=true)
- [ ] `evolving-landscape-of-data-centers.md` → `content/essays/en/evolving-landscape-of-data-centers.mdx` (merge: readTime=3, tags=["Data Centers","Infrastructure"])
- [ ] `making-data-centers-greener.md` → `content/essays/en/making-data-centers-greener.mdx` (merge: readTime=2, tags=["Data Centers","Sustainability"])
- [ ] `strategic-whitepaper.md` → `content/essays/en/strategic-whitepaper.mdx` (merge: readTime=17, tags=["AGI","AI Strategy"])
- [ ] `the-thermodynamic-wall.md` → `content/essays/en/the-thermodynamic-wall.mdx` (merge: readTime=22, tags=["Infrastructure","Data Centers"])
- [ ] All 6 Chinese `.zh.md` files → `content/essays/zh/` as `.mdx`

### Resume (P5)
- [ ] `content/resume.md` → `content/resume.en.mdx`
- [ ] `content/resume.zh.md` → `content/resume.zh.mdx`

### UI Translations (P1)
- [ ] Extract relevant strings from `/lib/i18n/translations.ts` → `messages/en.json` + `messages/zh.json`
- [ ] Add new strings for all new pages (Work, Artifacts, Resume views, Chat widget, etc.)

---

## Dependency Version Matrix

| Package | Version | Purpose |
|---------|---------|---------|
| next | 15.x | App Router framework |
| react / react-dom | 19.x | UI library (already on v19) |
| typescript | ~5.8 | Type safety |
| tailwindcss | 3.4.x | Styling (v3, not v4) |
| @tailwindcss/typography | 0.5.x | Prose styling |
| framer-motion | 12.x | Animations |
| lucide-react | latest | Icons |
| geist | latest | Geist font package |
| next-mdx-remote | 5.x | MDX rendering |
| gray-matter | 4.x | Frontmatter parsing |
| next-intl | latest | Internationalization |
| remark-gfm | 4.x | GitHub Flavored Markdown |
| remark-math | 6.x | Math notation |
| rehype-katex | 7.x | KaTeX rendering |
| katex | 0.16.x | Math rendering |
| ai (Vercel AI SDK) | 4.x | Chat streaming |
| @ai-sdk/google | latest | Gemini provider |
| @react-pdf/renderer | latest | PDF export |
| @playwright/test | 1.57.x | E2E testing |

---

## Phase Verification Summary

| Phase | Key Verification |
|-------|-----------------|
| P1 | Shell renders, fonts correct, nav works, locale switcher works, responsive |
| P2 | All 6 homepage sections, responsive at 375/768/1440px |
| P3 | `/work/rivian` — all 9 sections, sticky sidebar, SSG works |
| P3.5 | All 6 essays render (EN+ZH), tag filter, KaTeX math works |
| P4 | 5 artifacts render, filter tabs, type badges |
| P5 | Both resume views, toggle, PDF export, EN+ZH |
| P6 | Lighthouse 95+, OG valid, sitemap, 404, all links work |
| P7 | Chat streams, RAG retrieval, keys server-side, rate limited |

Run `pnpm build` after each phase to catch SSR/SSG issues early.
