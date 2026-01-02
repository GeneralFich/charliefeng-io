# Charlie Feng - Digital Twin

A personal "Digital Twin" website for **Charlie Feng**, an Infrastructure Product Leader at Google and Strategic Thought Partner.

This application serves as an interactive portfolio and conversational agent, allowing visitors to explore Charlie's professional background, thoughts on AGI and infrastructure, and interact with his digital persona powered by Google's Gemini API.

## Features

- **Interactive Chat Interface**: Converse with Charlie's "Digital Twin" about his professional experience, product strategy, and "The Asymptotic Trajectory" manifesto. Powered by the Google Gemini API.
- **Dynamic Dashboard**: Visualizes key metrics and insights (e.g., AGI timelines, compute capacity trends).
- **Interactive Resume**: A structured view of Charlie's professional experience at Google, Amazon, and Ernst & Young.
- **Responsive Design**: Built with a mobile-first approach using Tailwind CSS.

## Tech Stack

- **Frontend**: [React](https://react.dev/), [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **AI Integration**: [Google Gemini API](https://ai.google.dev/) (`@google/genai`)
- **Package Manager**: [pnpm](https://pnpm.io/)
- **Icons**: [Lucide React](https://lucide.dev/)

## System Architecture

The application is designed as a "Glass Box" AI system, prioritizing transparency and local-first performance.

### 1. Data Flow (The "Cognitive Loop")
- **`App.tsx`**: The application shell that handles routing and layout.
- **`useChat` Hook**: Manages the ephemeral state (messages, loading status) and handles race conditions for the chat.
- **`geminiService`**: The "Cognitive Layer" that orchestrates the AI interaction. It combines the user's query with the System Persona (`lib/knowledge.ts`) and Retrieved Context (`lib/rag.ts`) before sending it to Google Gemini.

### 2. Single Source of Truth
- **`lib/knowledge.ts`**: This module acts as the central data registry. It imports raw Markdown files (Resume, Blog Posts) at build time and parses them into structured data.
- **Unified Context**: The same Markdown content that renders the "Essays" and "About" pages is fed directly into the AI's system prompt, ensuring the chatbot never hallucinates about Charlie's background.

### 3. RAG Pipeline (Retrieval-Augmented Generation)
- **Ingestion (`scripts/ingest_blog.ts`)**: A build-time script that chunks blog posts and generates vector embeddings using `text-embedding-004`. Results are saved to `lib/blog_data.json`.
- **Retrieval (`lib/rag.ts`)**: A lightweight, in-memory vector search engine. It performs cosine similarity checks against the pre-loaded JSON index to find relevant blog chunks in O(1) time, without needing an external vector database.

### 4. Custom Routing
- **`useRouter` Hook**: A lightweight, custom router implementation using the History API (`pushState`/`popstate`). This avoids the overhead of heavy routing libraries while preserving deep-linking capabilities (e.g., `?view=ESSAYS&essay=my-post`).

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

- Node.js (v18 or higher recommended)
- [pnpm](https://pnpm.io/installation)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**
    ```bash
    pnpm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env.local` file in the root directory and add the following keys:

    **Required for AI Chat:**
    ```env
    GEMINI_API_KEY=your_api_key_here
    ```

    **Required for Contact Form (EmailJS):**
    ```env
    VITE_EMAILJS_SERVICE_ID=your_service_id
    VITE_EMAILJS_TEMPLATE_ID=your_template_id
    VITE_EMAILJS_PUBLIC_KEY=your_public_key
    ```
    *Note: If EmailJS keys are missing, the contact form will run in "Demo Mode" and simulate successful submissions.*

### Running the App

Start the development server:

```bash
pnpm dev
```

Open your browser and navigate to `http://localhost:3000` (or the port shown in your terminal).

## Scripts

- **`pnpm dev`**: Starts the development server.
- **`pnpm build`**: Builds the production-ready bundle.
- **`npx tsx scripts/ingest_blog.ts`**: Runs the RAG ingestion pipeline to update the blog index (`lib/blog_data.json`). Run this after adding new essays.
- **`npx playwright test`**: Runs the frontend verification suite.

## Project Structure

The project uses a flat structure to minimize nesting:

- `components/`: React components (ChatInterface, ContactForm, Resume, etc.)
- `lib/`: Utility libraries and static data (knowledge base, resume data, RAG logic)
- `services/`: API services (Gemini integration)
- `hooks/`: Custom React hooks (`useChat`, `useRouter`, etc.)
- `content/`: Markdown source files (Blog posts, Resume)
- `verification/`: Playwright verification scripts
- `App.tsx`: Main application component
- `types.ts`: TypeScript definitions

## License

MIT
