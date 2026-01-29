# Content Directory 📚

This directory is the **Single Source of Truth** for the application's knowledge base. It contains the raw Markdown files that power the Blog, the Resume view, and the AI's "Long-Term Memory" (via RAG).

## Structure

- **`posts/`**: Contains all blog essays. Each file represents a single post.
- **`resume.md`**: The source for the "About" page and the AI's professional persona.

## How to Add a New Blog Post

1.  Create a new `.md` file in `content/posts/`. The filename will become the URL slug (e.g., `my-new-post.md` -> `/essays/my-new-post`).
2.  Add the **Required Frontmatter** (YAML) at the top of the file.
3.  Write your content in standard Markdown.
4.  (Optional) Embed custom infographics using the special syntax below.
5.  **Important:** Run `npx tsx scripts/ingest_blog.ts` to update the AI's vector index with your new content.

### Required Frontmatter

The application (`lib/knowledge.ts`) expects specific metadata fields to parse the post correctly.

```yaml
---
title: "The Title of Your Essay"
date: 2025-12-14          # YYYY-MM-DD format
author: Charlie Feng      # Displayed author name
description: "A short summary used for the list view and SEO."
---
```

## Special Features

### Embedding Infographics & Components

The application uses a **Component Hijack Pattern** to render rich, interactive content within standard Markdown. This is handled in `components/EssayMarkdownComponents.tsx`.

To embed a component or infographic, use a code block with the language set to `infographic`.

#### 1. React Components
Specific keywords trigger built-in React components:

```markdown
```infographic
whitepaper-summary
```
```
*Renders the `<WhitepaperSummary />` component.*

```markdown
```infographic
whitepaper-charts
```
```
*Renders the `<WhitepaperCharts />` component.*

#### 2. Static HTML Infographics (Iframes)
Any other text inside the block is treated as a filename for a static HTML file located in `public/infographics/thermodynamic-wall/`.

**Example:**
```markdown
```infographic
collision
```
```
*Embeds an iframe pointing to `/infographics/thermodynamic-wall/collision.html`.*

> **Note:** Ideally, this logic should be more generic. Currently, it is hardcoded to the `thermodynamic-wall` directory in `EssayMarkdownComponents.tsx`. Future refactoring should allow specifying the full path.

### Footnotes

Standard Markdown footnotes are supported and styled automatically.

```markdown
Here is a claim.[^1]

[^1]: This is the citation for the claim.
```
