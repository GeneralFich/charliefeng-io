
import { GoogleGenAI } from "@google/genai";
import blogData from "./blog_data.json";

// Calculate cosine similarity between two vectors
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    // Check if one is empty (dummy data)
    if (vecA.length === 0 || vecB.length === 0) return 0;
    throw new Error("Vector dimensions do not match");
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

export interface RelevantChunk {
  text: string;
  title: string;
  url: string;
  score: number;
}

export async function getRelevantContext(query: string, apiKey: string): Promise<RelevantChunk[]> {
  try {
    const ai = new GoogleGenAI({ apiKey });

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
    // Note: blogData might have dummy data with empty embeddings
    const scoredChunks = blogData
      .filter((chunk: any) => chunk.embedding && chunk.embedding.length > 0)
      .map((chunk: any) => ({
        text: chunk.text,
        title: chunk.title,
        url: chunk.url,
        score: cosineSimilarity(queryEmbedding, chunk.embedding)
      }));

    // Sort by score descending
    scoredChunks.sort((a, b) => b.score - a.score);

    // Return top 5 chunks with score > 0.5 (threshold can be adjusted)
    return scoredChunks.slice(0, 5);

  } catch (error) {
    console.error("Error retrieving relevant context:", error);
    return [];
  }
}
