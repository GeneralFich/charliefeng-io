import fs from 'fs';
import path from 'path';
import { cosineSimilarity } from './vector';

interface EmbeddedChunk {
  text: string;
  embedding: number[];
  source: string;
}

// Module-scope cache for warm invocations in serverless
let cachedChunks: EmbeddedChunk[] | null = null;

function loadChunks(): EmbeddedChunk[] {
  if (cachedChunks) return cachedChunks;

  const filePath = path.join(process.cwd(), 'public', 'blog_data.json');
  if (!fs.existsSync(filePath)) {
    console.warn('blog_data.json not found — RAG disabled');
    return [];
  }

  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw);
    cachedChunks = Array.isArray(data) ? data : data.chunks || [];
    return cachedChunks!;
  } catch {
    console.warn('Failed to parse blog_data.json');
    return [];
  }
}

/**
 * Find the top-k most relevant content chunks for a query embedding.
 */
export function getRelevantContext(
  queryEmbedding: number[],
  topK: number = 5
): string[] {
  const chunks = loadChunks();
  if (chunks.length === 0 || queryEmbedding.length === 0) return [];

  const scored = chunks
    .filter((chunk) => chunk.embedding && chunk.embedding.length > 0)
    .map((chunk) => ({
      text: chunk.text,
      source: chunk.source,
      score: cosineSimilarity(queryEmbedding, chunk.embedding),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  return scored.map(
    (s) => `[Source: ${s.source}]\n${s.text}`
  );
}

/**
 * Build a system prompt with RAG context.
 */
export function buildSystemPrompt(contextChunks: string[]): string {
  const context =
    contextChunks.length > 0
      ? `\n\nRelevant context from Charlie's portfolio:\n\n${contextChunks.join('\n\n---\n\n')}`
      : '';

  return `You are an AI assistant for Charlie Feng's portfolio. Answer questions about Charlie's product experience, case studies, and essays based on the provided context. Be concise, specific, and direct. If you don't have enough context to answer, say so. Do not make up information.

Charlie is a Product Leader at Google working on AI infrastructure for data centers. Previously a Senior PM at Amazon (Rivian EV fleet). Yale MBA, NYU Stern BS.

Key accomplishments:
- $50M+ efficiency gains from Climate Intelligence platform at Google
- Launched agentic AI platform for 500+ engineers (150k+ assets, 90%+ accuracy)
- Scaled Amazon's Rivian EV fleet from 4 to 100+ vehicles
- 18% improvement in First Time Delivery Success for 100k+ users${context}`;
}
