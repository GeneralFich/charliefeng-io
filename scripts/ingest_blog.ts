
import { GoogleGenAI } from "@google/genai";
import Parser from "rss-parser";
import * as cheerio from "cheerio";
import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// Note: I will need to set API_KEY environment variable when running this script
const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.error("API_KEY is missing. Please set the environment variable.");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

const BLOG_RSS_URL = "https://blog.charliefeng.io/feed";
const OUTPUT_FILE = path.join(process.cwd(), "lib", "blog_data.json");

interface BlogChunk {
  id: string;
  text: string;
  url: string;
  title: string;
  publishedDate: string;
  embedding?: number[];
}

const parser = new Parser();

async function getBlogPosts() {
  console.log("Fetching RSS feed...");
  const feed = await parser.parseURL(BLOG_RSS_URL);
  console.log(`Found ${feed.items.length} posts.`);
  return feed.items;
}

function cleanText(html: string): string {
  const $ = cheerio.load(html);
  // Remove scripts, styles
  $('script').remove();
  $('style').remove();
  $('nav').remove();
  $('header').remove();
  $('footer').remove();

  // Get text
  let text = $('body').text();
  // Collapse whitespace
  text = text.replace(/\s+/g, ' ').trim();
  return text;
}

function chunkText(text: string, chunkSize: number = 1000, overlap: number = 100): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    let end = start + chunkSize;

    // If we are not at the end of the text, try to break at a sentence or word
    if (end < text.length) {
      // Look for the last period within the chunk to break cleanly
      const lastPeriod = text.lastIndexOf('.', end);
      if (lastPeriod > start + chunkSize * 0.5) { // Ensure chunk isn't too small
        end = lastPeriod + 1;
      } else {
        // Fallback to space
        const lastSpace = text.lastIndexOf(' ', end);
        if (lastSpace > start) {
          end = lastSpace;
        }
      }
    }

    chunks.push(text.slice(start, end).trim());
    start = end - overlap; // Overlap for continuity
  }

  return chunks;
}

async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await ai.models.embedContent({
      model: "text-embedding-004",
      contents: [{ parts: [{ text }] }]
    });
    if (response.embeddings && response.embeddings.length > 0 && response.embeddings[0].values) {
       return response.embeddings[0].values;
    }
    return [];
  } catch (error) {
    console.error("Error generating embedding:", error);
    return [];
  }
}

async function main() {
  const posts = await getBlogPosts();
  const allChunks: BlogChunk[] = [];

  for (const post of posts) {
    if (!post.content && !post['content:encoded']) {
      console.warn(`Skipping post "${post.title}" (no content)`);
      continue;
    }

    console.log(`Processing "${post.title}"...`);
    const rawContent = post['content:encoded'] || post.content || "";
    const cleanContent = cleanText(rawContent);
    const textChunks = chunkText(cleanContent);

    for (const chunk of textChunks) {
      if (chunk.length < 50) continue; // Skip tiny chunks

      const embedding = await generateEmbedding(chunk);

      allChunks.push({
        id: uuidv4(),
        text: chunk,
        url: post.link || "",
        title: post.title || "",
        publishedDate: post.pubDate || "",
        embedding: embedding
      });

      // Rate limiting helper (simple pause)
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  console.log(`Generated ${allChunks.length} chunks.`);
  await fs.writeFile(OUTPUT_FILE, JSON.stringify(allChunks, null, 2));
  console.log(`Saved to ${OUTPUT_FILE}`);
}

main().catch(console.error);
