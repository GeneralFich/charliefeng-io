/**
 * @fileoverview RAG Ingestion Script
 *
 * This script is responsible for "teaching" the AI about the blog posts.
 * It reads all Markdown files from `content/posts/`, generates embeddings
 * for their content using Google's Gemini API, and saves the result to a JSON file.
 *
 * "Why": The main application needs a fast way to find relevant blog context
 * without reading and embedding files on every request. This script pre-calculates
 * everything so the runtime is fast (O(1) lookup + cosine similarity).
 *
 * Usage:
 *   npx tsx scripts/ingest_blog.ts
 *
 * Output:
 *   lib/blog_data.json - Contains text chunks and their 768-dimensional embeddings.
 *
 * Requirements:
 *   - `GEMINI_API_KEY` must be set in `.env.local` or environment.
 *   - `content/posts/*.md` files must exist.
 */

import { GoogleGenAI } from '@google/genai';
import { writeFileSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import fm from 'front-matter';

// --- Configuration ---
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const POSTS_DIR = join(process.cwd(), 'content', 'posts');
const OUTPUT_FILE = join(process.cwd(), 'lib', 'blog_data.json');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn("Warning: GEMINI_API_KEY not found. Embeddings will be empty.");
}

const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

interface PostAttributes {
  title: string;
  date: string;
  author: string;
  description: string;
}

interface BlogChunk {
  id: string;
  url: string;
  title: string;
  publishedDate: string;
  text: string;
  embedding?: number[];
}

/**
 * Generates vector embeddings for a given text using the Gemini `text-embedding-004` model.
 *
 * @param text - The text content to embed.
 * @returns A promise resolving to the embedding vector (array of numbers).
 */
async function getEmbeddings(text: string): Promise<number[]> {
    if (!ai) return [];
    try {
        const result = await ai.models.embedContent({
            model: "text-embedding-004",
            contents: [{ parts: [{ text: text }] }]
        });
        const embedding = result.embeddings?.[0]?.values;
        if (!embedding) return [];
        return embedding;
    } catch (e) {
        console.error("Error generating embedding:", e);
        return [];
    }
}

/**
 * Splits text into manageable chunks while preserving sentence boundaries.
 *
 * Why: Splitting by sentences rather than arbitrary character counts ensures that
 * semantic meaning is preserved, which significantly improves the quality of vector embeddings
 * and the relevance of RAG retrieval. Truncating a sentence in the middle often results in lost context.
 *
 * Strategy:
 * 1. Split text into sentences using regex `/[^.!?]+[.!?]+/g`.
 * 2. Accumulate sentences into a chunk until `maxChars` is reached.
 * 3. Push the chunk and start a new one.
 *
 * @param text - The raw text content to be chunked.
 * @param maxChars - The target maximum length for each chunk (default 1000).
 *                   1000 chars is roughly 200-250 words, a balanced size for the model's context window.
 * @returns An array of text strings (chunks).
 */
function chunkText(text: string, maxChars: number = 1000): string[] {
  // NOTE: This is a simplified, standalone implementation specific to this script.
  // The robust, canonical implementation is `chunkText` in `lib/utils.ts`, which
  // handles edge cases (like missing punctuation) better.
  //
  // We duplicate it here to keep this script self-contained and avoid potential
  // module resolution issues when running via `tsx` (e.g. importing from a file
  // that imports React types).

  const chunks: string[] = [];
  let currentChunk = "";

  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxChars) {
      chunks.push(currentChunk.trim());
      currentChunk = "";
    }
    currentChunk += sentence + " ";
  }
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }
  return chunks;
}

/**
 * Main ingestion routine.
 * Scans `content/posts/`, chunks the markdown body, generates embeddings,
 * and saves the result to `lib/blog_data.json`.
 */
async function ingest() {
  console.log(`Scanning for posts in ${POSTS_DIR}...`);

  if (!fs.existsSync(POSTS_DIR)) {
      console.error(`Directory not found: ${POSTS_DIR}`);
      process.exit(1);
  }

  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
  const chunks: BlogChunk[] = [];

  console.log(`Found ${files.length} posts.`);

  for (const file of files) {
    const filePath = join(POSTS_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const parsed = fm<PostAttributes>(content);

    console.log(`Processing: ${parsed.attributes.title}`);

    const slug = file.replace('.md', '');
    // Using a fake URL format that could be useful later, or just informative
    const url = `/essays/${slug}`;

    const textChunks = chunkText(parsed.body);

    for (let i = 0; i < textChunks.length; i++) {
       const chunk = textChunks[i];
       if (chunk.length < 50) continue; // Skip tiny chunks

       const embedding = await getEmbeddings(chunk);

       chunks.push({
           id: `${slug}#chunk${i}`,
           url: url,
           title: parsed.attributes.title,
           publishedDate: parsed.attributes.date,
           text: chunk,
           embedding: embedding
       });

       // Rate limiting aid
       await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  writeFileSync(OUTPUT_FILE, JSON.stringify(chunks, null, 2));
  console.log(`Successfully wrote ${chunks.length} chunks to ${OUTPUT_FILE}`);
}

ingest();
