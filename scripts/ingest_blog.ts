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
 *   public/blog_data.json - Contains text chunks and their 768-dimensional embeddings.
 *
 * Requirements:
 *   - `GEMINI_API_KEY` must be set in `.env.local` or environment.
 *   - `content/posts/*.md` files must exist.
 */

import { GoogleGenAI } from '@google/genai';
import { join } from 'path';
import dotenv from 'dotenv';
import path from 'path';
import { promises as fsPromises } from 'fs';
import fm from 'front-matter';
import { chunkText } from '../lib/utils';
import { magnitude } from '../lib/vector';

// --- Configuration ---
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const POSTS_DIR = join(process.cwd(), 'content', 'posts');
const OUTPUT_FILE = join(process.cwd(), 'public', 'blog_data.json');

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
  _magnitude?: number;
  language?: string;
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
 * Helper to process items concurrently with a limit.
 */
async function processConcurrently<T, R>(
  items: T[],
  concurrency: number,
  processor: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let index = 0;

  const worker = async () => {
    while (index < items.length) {
      const i = index++;
      if (i >= items.length) break;
      results[i] = await processor(items[i]);
    }
  };

  const workers = [];
  for (let i = 0; i < concurrency; i++) {
    workers.push(worker());
  }

  await Promise.all(workers);
  return results;
}


/**
 * Main ingestion routine.
 * Scans `content/posts/`, chunks the markdown body, generates embeddings,
 * and saves the result to `lib/blog_data.json`.
 */
async function ingest() {
  console.log(`Scanning for posts in ${POSTS_DIR}...`);

  try {
      await fsPromises.access(POSTS_DIR);
  } catch {
      console.error(`Directory not found: ${POSTS_DIR}`);
      process.exit(1);
  }

  const allFiles = await fsPromises.readdir(POSTS_DIR);
  const mdFiles = allFiles.filter(f => f.endsWith('.md'));

  console.log(`Found ${mdFiles.length} posts.`);

  // Phase 1: Parallel Read & Parse
  // We read and parse all files concurrently to maximize I/O and CPU throughput.
  const parsedDocs = await Promise.all(mdFiles.map(async (file) => {
    const filePath = join(POSTS_DIR, file);
    const content = await fsPromises.readFile(filePath, 'utf-8');
    const parsed = fm<PostAttributes>(content);

    let language = 'en';
    let slug = file.replace('.md', '');

    if (file.endsWith('.zh.md')) {
        language = 'zh';
        slug = file.replace('.zh.md', '');
    } else if (file.endsWith('.es.md')) {
        language = 'es';
        slug = file.replace('.es.md', '');
    }

    const url = `/essays/${slug}`;
    const textChunks = chunkText(parsed.body);

    return {
      file,
      attributes: parsed.attributes,
      url,
      language,
      slug,
      textChunks
    };
  }));

  // Ensure deterministic order
  parsedDocs.sort((a, b) => a.file.localeCompare(b.file));

  // Phase 2: Parallel Embedding
  // We use a concurrency limit to speed up processing while respecting API rate limits.
  const CONCURRENCY = 5;
  console.log(`Generating embeddings with concurrency: ${CONCURRENCY}...`);

  // Flatten all chunks into a single list of tasks
  const tasks: { doc: typeof parsedDocs[0]; text: string; chunkIndex: number }[] = [];
  for (const doc of parsedDocs) {
    for (let i = 0; i < doc.textChunks.length; i++) {
      tasks.push({ doc, text: doc.textChunks[i], chunkIndex: i });
    }
  }

  const processedChunks = await processConcurrently(tasks, CONCURRENCY, async (task) => {
    if (task.text.length < 50) return null; // Skip tiny chunks

    const embedding = await getEmbeddings(task.text);

    if (embedding && embedding.length > 0) {
      return {
        id: `${task.doc.slug}#chunk${task.chunkIndex}`,
        url: task.doc.url,
        title: task.doc.attributes.title,
        publishedDate: task.doc.attributes.date,
        text: task.text,
        embedding: embedding,
        _magnitude: magnitude(embedding),
        language: task.doc.language
      };
    }
    return null;
  });

  const validChunks = processedChunks.filter((c): c is BlogChunk => c !== null);

  await fsPromises.writeFile(OUTPUT_FILE, JSON.stringify(validChunks, null, 2));
  console.log(`Successfully wrote ${validChunks.length} chunks to ${OUTPUT_FILE}`);
}

ingest();
