
import { GoogleGenAI } from "@google/genai";
import blogData from "./blog_data.json";

// Calculate cosine similarity between two vectors
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    if (vecA.length === 0 || vecB.length === 0) return 0;
    // In a production environment, we might want to log this as a warning
    // rather than throwing, to avoid crashing the request for one bad vector.
    return 0;
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    magnitudeA += vecA[i] * vecA[i];
    magnitudeB += vecB[i] * vecB[i];
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) return 0;

  return dotProduct / (magnitudeA * magnitudeB);
}

interface BlogChunk {
  id: string;
  text: string;
  url: string;
  title: string;
  publishedDate: string;
  embedding?: number[];
}

export interface RelevantChunk {
  text: string;
  title: string;
  url: string;
  score: number;
}

// Cast the imported JSON to the interface
const typedBlogData = blogData as BlogChunk[];

export async function getRelevantContext(query: string, apiKey: string): Promise<RelevantChunk[]> {
  try {
    const baseUrl = process.env.GEMINI_API_BASE_URL;
    const ai = new GoogleGenAI({ apiKey, httpOptions: baseUrl ? { baseUrl } : undefined });

    // Generate embedding for the query
    const response = await ai.models.embedContent({
      model: "text-embedding-004",
      contents: [{ parts: [{ text: query }] }]
    });

    if (!response.embeddings || response.embeddings.length === 0 || !response.embeddings[0].values) {
        throw new Error("No embedding returned");
    }

    const queryEmbedding = response.embeddings[0].values;

    // Calculate similarity with all chunks
    const scoredChunks = typedBlogData
      .filter((chunk) => chunk.embedding && chunk.embedding.length > 0)
      .map((chunk) => ({
        text: chunk.text,
        title: chunk.title,
        url: chunk.url,
        score: cosineSimilarity(queryEmbedding, chunk.embedding!)
      }))
      // Filter by threshold to remove irrelevant noise
      .filter(chunk => chunk.score > 0.5);

    // Sort by score descending
    scoredChunks.sort((a, b) => b.score - a.score);

    // Return top 5 chunks
    return scoredChunks.slice(0, 5);

  } catch (error) {
    console.error("Error retrieving relevant context:", error);
    return [];
  }
}
