import { GoogleGenAI } from "@google/genai";
import { FULL_CONTEXT } from "../lib/knowledge";
import { Message } from "../types";
import { getRelevantContext } from "../lib/rag";
import { sendMessageToDeepSeek } from "./deepseekService";

const apiKey = process.env.API_KEY;
const baseUrl = process.env.GEMINI_API_BASE_URL;

// Initialize the client.
const ai = apiKey ? new GoogleGenAI({ apiKey, httpOptions: baseUrl ? { baseUrl } : undefined }) : null;

export const sendMessage = async (
  history: Message[],
  newMessage: string
): Promise<string> => {
  // RAG: Retrieve relevant context from blog (Shared logic)
  // We try to retrieve context regardless of the model,
  // but we need the Gemini API Key for embeddings.
  // If Gemini is blocked, this RAG step might fail if it relies on Google's embedding model.
  // In that case, we proceed with empty context.

  let additionalContext = "";
  if (apiKey) {
    try {
      const relevantChunks = await getRelevantContext(newMessage, apiKey);
      if (relevantChunks.length > 0) {
        additionalContext = "\n\n[RAG CONTEXT - RELEVANT BLOG POSTS]:\n" +
          relevantChunks.map(chunk => `Title: ${chunk.title}\nURL: ${chunk.url}\nExcerpt: ${chunk.text}`).join("\n---\n");
      }
    } catch (ragError) {
      console.warn("RAG retrieval failed, proceeding without it:", ragError);
    }
  }

  // 1. Try Gemini
  if (ai && apiKey) {
    try {
      const userMessageWithContext = additionalContext
        ? `Context for this query:\n${additionalContext}\n\nUser Query: ${newMessage}`
        : newMessage;

      const contents = [
         ...history.map((msg) => ({
          role: msg.role,
          parts: [{ text: msg.text }],
        })),
        {
          role: "user",
          parts: [{ text: userMessageWithContext }],
        },
      ];

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: contents,
        config: {
          systemInstruction: { parts: [{ text: FULL_CONTEXT }] },
          temperature: 0.7,
          maxOutputTokens: 4000,
        }
      });

      if (response.text) {
        return response.text;
      }
    } catch (error) {
      console.error("Gemini API Error (Primary):", error);
      // Fallback proceeds below
    }
  }

  // 2. Fallback to DeepSeek
  if (process.env.DEEPSEEK_API_KEY) {
    console.log("Falling back to DeepSeek API...");
    try {
      return await sendMessageToDeepSeek(history, newMessage, additionalContext);
    } catch (deepseekError) {
      console.error("DeepSeek API Error (Fallback):", deepseekError);
      return "Connection to the neural link failed (both primary and backup uplinks).";
    }
  }

  return "Connection to the neural link failed. Please check your API configuration.";
};
