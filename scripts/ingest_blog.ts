import { GoogleGenAI } from '@google/genai';
import { writeFileSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import fm from 'front-matter';
import { chunkText } from '../lib/utils';

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
