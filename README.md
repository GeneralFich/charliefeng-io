# Charlie Feng - Digital Twin

A personal "Digital Twin" website for **Charlie Feng**, an Infrastructure Product Leader at Google and Strategic Thought Partner.

This application serves as an interactive portfolio and conversational agent, allowing visitors to explore Charlie's professional background, essays on AGI and infrastructure, and interact with his digital persona powered by Google's Gemini API (with a DeepSeek fallback for regions where Gemini is blocked).

## Features

- **Persistent Split-Panel Layout**: On desktop (lg+), the chat panel is always visible on the left (420–460px) while essays, resume, or the browse panel fill the right. Mobile uses a full-screen single view with a bottom tab bar.
- **Interactive Chat Interface**: Converse with Charlie's "Digital Twin" about his professional experience, product strategy, and essays. Powered by Google Gemini (primary) with a DeepSeek fallback for mainland China and other restricted regions.
- **Browse Panel**: A discovery surface on the home view that surfaces all essays with dates and read times, plus a resume shortcut — all while the chat stays active.
- **Essays with Full Markdown**: Read long-form essays with syntax-highlighted code blocks, LaTeX math rendering (KaTeX), a floating table of contents, scroll progress bar, and inline search with keyword highlighting.
- **Interactive Resume**: A structured view of Charlie's professional experience at Google, Amazon, and Ernst & Young, with PDF export.
- **Dark Mode**: Three-way theme toggle (System / Light / Dark) with OS-level preference detection and `localStorage` persistence.
- **Bilingual Support**: Full English/Chinese (简体中文) language switcher covering all UI text, navigation, and essay content.
- **Animated UI**: Framer Motion spring-physics animations on navigation, tab transitions, and interactive elements. A neural-network particle canvas renders in the background using `requestAnimationFrame`.
- **Keyboard Shortcuts**: Gmail-style chorded shortcuts (`G` then `H`/`A`/`E` to navigate; `?` to open the shortcuts modal).
- **Mobile Bottom Tab Bar**: Frosted-glass fixed bar with animated active-state indicator, replacing the hamburger menu on small screens.

## Tech Stack

- **Frontend**: [React 19](https://react.dev/), [Vite 6](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **AI Integration (Primary)**: [Google Gemini API](https://ai.google.dev/) (`@google/genai`, model: `gemini-3-flash-preview`)
- **AI Integration (Fallback)**: [DeepSeek API](https://platform.deepseek.com/) — OpenAI-compatible, used when Gemini is inaccessible
- **Markdown Rendering**: `react-markdown` + `remark-gfm` + `rehype-katex` + `rehype-sanitize`
- **Math Rendering**: [KaTeX](https://katex.org/)
- **Charts**: [Recharts](https://recharts.org/)
- **Package Manager**: [pnpm](https://pnpm.io/)
- **Icons**: [Lucide React](https://lucide.dev/)

## System Architecture

The application is designed as a "Glass Box" AI system, prioritizing transparency and local-first performance.

### 1. Data Flow (The "Cognitive Loop")
- **`App.tsx`**: The application shell. Manages the split-panel layout, routing, view transitions, and keyboard shortcuts.
- **`useChat` Hook**: Manages ephemeral chat state (messages, loading status) and handles race conditions.
- **`geminiService` / `deepseekService`**: The "Cognitive Layer" that orchestrates AI interaction. On send, the service selects the active provider, combines the user's query with the System Persona (`lib/knowledge.ts`) and Retrieved Context (`lib/rag.ts`), then streams the response chunk-by-chunk.

### 2. Dual AI Provider Routing
- **Primary**: Google Gemini (`gemini-3-flash-preview`) with RAG embeddings via `text-embedding-004`.
- **Fallback**: DeepSeek (`deepseek-chat`), used in regions where the Google Generative Language API is blocked. DeepSeek uses the OpenAI-compatible SSE format; RAG is omitted since DeepSeek has no public embeddings API — the rich system prompt (resume + blog list) provides context instead.

### 3. Single Source of Truth
- **`lib/knowledge.ts`**: Central data registry. Imports raw Markdown files (Resume, Blog Posts) at build time and parses them into structured data.
- **Unified Context**: The same Markdown that renders Essays and Resume pages is fed directly into the AI's system prompt, so the chatbot never hallucinates about Charlie's background.

### 4. RAG Pipeline (Retrieval-Augmented Generation)
- **Ingestion (`scripts/ingest_blog.ts`)**: A build-time script that chunks blog posts and generates vector embeddings using `text-embedding-004`. Results are saved to `lib/blog_data.json`.
- **Retrieval (`lib/rag.ts`)**: A lightweight, in-memory vector search engine. It performs cosine similarity checks against the pre-loaded JSON index to find relevant blog chunks without needing an external vector database.

### 5. Theme & i18n
- **`lib/ThemeContext.tsx`**: React context for system/light/dark theme. Persists the user's choice in `localStorage` and applies the Tailwind `dark` class to `<html>`.
- **`lib/i18n/`**: Language context and translation maps for English and Chinese. All UI strings, navigation labels, and content metadata are i18n-aware.

### 6. Custom Routing
- **`useRouter` Hook**: A lightweight, custom router using the History API (`pushState`/`popstate`). Supports deep-linking (e.g., `?view=ESSAYS&essay=my-post`) without a heavy routing library.

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- [pnpm](https://pnpm.io/installation)

### Installation

1. **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2. **Install dependencies:**
    ```bash
    pnpm install
    ```

3. **Configure Environment Variables:**
    Create a `.env.local` file in the root directory and add the following keys:

    **Required for AI Chat (Gemini):**
    ```env
    API_KEY=your_gemini_api_key_here
    ```

    **Optional — DeepSeek fallback (for regions where Gemini is blocked):**
    ```env
    DEEPSEEK_API_KEY=your_deepseek_api_key_here
    ```

### Running the App

Start the development server (also generates blog metadata):

```bash
pnpm dev
```

Open your browser and navigate to `http://localhost:3000` (or the port shown in your terminal).

## Scripts

- **`pnpm dev`**: Generates blog metadata then starts the development server.
- **`pnpm build`**: Generates blog metadata then builds the production-ready bundle.
- **`npx tsx scripts/generate_metadata.ts`**: Regenerates `lib/blog_metadata.json` (read-time data). Run after adding new essays.
- **`npx tsx scripts/ingest_blog.ts`**: Runs the RAG ingestion pipeline to update the blog vector index (`lib/blog_data.json`). Run after adding or editing essays.
- **`pnpm test`**: Runs the unit test suite.
- **`pnpm test:coverage`**: Runs the unit tests with code coverage reporting (c8).
- **`npx playwright test`**: Runs the frontend E2E verification suite.

## Testing

The project employs a dual testing strategy:

1. **Unit Tests (`tests/`)**: Verify backend logic, RAG math, AI service integration, security utilities, and more using `node:test` and `tsx`.
    - Run with `pnpm test`.
    - See [tests/README.md](tests/README.md) for details on writing and running unit tests.

2. **E2E Verification (`verification/`)**: Verifies UI and browser interactions using Playwright.
    - Run with `npx playwright test`.

## Project Structure

The project uses a flat structure to minimize nesting:

- `components/`: React components (`ChatInterface`, `Essays`, `Resume`, `BrowsePanel`, `MobileBottomNav`, `ThemeToggle`, etc.)
- `lib/`: Utility libraries and static data (knowledge base, RAG logic, theme context, i18n translations)
- `lib/i18n/`: Language context and English/Chinese translation maps
- `services/`: AI provider services (`geminiService.ts`, `deepseekService.ts`)
- `hooks/`: Custom React hooks (`useChat`, `useRouter`, `useGlobalShortcuts`, `useViewTransition`, etc.)
- `content/`: Markdown source files (blog posts and resume in English and Chinese)
- `scripts/`: Build-time scripts (`generate_metadata.ts`, `ingest_blog.ts`)
- `verification/`: Playwright E2E verification specs
- `App.tsx`: Main application component (layout shell and router)
- `types.ts`: TypeScript definitions

## License

MIT
