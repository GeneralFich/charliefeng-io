# RAG Ingestion Pipeline 🧠

This directory contains the scripts responsible for building the knowledge base for the "Charlie Feng Digital Twin" AI.

## `ingest_blog.ts`

This script is the **bridge between the static content and the AI's brain**. It performs the following actions:

1.  **Reads**: Scans all Markdown files in `content/posts/`.
2.  **Chunks**: Splits the text into manageable segments (approx. 1000 chars) to fit within context windows.
3.  **Embeds**: Calls the Google Gemini API (`text-embedding-004`) to generate vector embeddings for each chunk.
4.  **Saves**: Writes the structured data (text + embeddings) to `lib/blog_data.json`.

### Why is this necessary?

The runtime application (`lib/rag.ts`) uses `blog_data.json` to perform **semantic search** (Cosine Similarity). If this file is missing or outdated, the AI will not be able to answer questions about specific blog essays or the "Whitepaper" content effectively.

### Usage

**Prerequisites:**
You must have a `.env.local` file in the project root with a valid `GEMINI_API_KEY`.

```bash
# Run the ingestion script
npx tsx scripts/ingest_blog.ts
```

### Output

- **Source**: `content/posts/*.md`
- **Destination**: `lib/blog_data.json`

> **Note:** Run this script whenever you add or modify a blog post to ensure the AI has the latest context.
