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
- npm (or yarn/pnpm)
- A Google Gemini API Key

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env.local` file in the root directory and add your Google Gemini API key:
    ```env
    GEMINI_API_KEY=your_api_key_here
    ```
    *Note: The `vite.config.ts` is configured to map this variable to the application.*

### Running the App

Start the development server:

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:5173` (or the port shown in your terminal).

## Project Structure

- `src/`: Source code
  - `components/`: React components (ChatInterface, Dashboard, Resume, etc.)
  - `lib/`: Utility libraries and static data (knowledge base, resume data)
  - `services/`: API services (Gemini integration)
  - `App.tsx`: Main application component
  - `types.ts`: TypeScript definitions
- `public/`: Static assets

## License

[MIT](LICENSE)
