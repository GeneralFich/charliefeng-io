import { GoogleGenAI } from "@google/genai";
import { FULL_CONTEXT } from "../lib/knowledge";
import { Message } from "../types";
import { getRelevantContext } from "../lib/rag";

const apiKey = process.env.API_KEY;

// Initialize the client.
// Note: In a real production app, we might want to handle this initialization 
// in a hook or context to handle missing keys more gracefully in the UI.
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const MAX_INPUT_LENGTH = 10000;

export const sendMessageToGemini = async (
  history: Message[],
  newMessage: string
): Promise<string> => {
  // Security: Input validation to prevent large payloads (DoS/Cost)
  if (!newMessage || newMessage.length > MAX_INPUT_LENGTH) {
    return "Message is too long. Please shorten your query.";
  }

  if (!ai || !apiKey) {
    return "API Key is missing. Please configure the environment variable.";
  }

  try {
    // RAG: Retrieve relevant context from blog
    let additionalContext = "";
    try {
      const relevantChunks = await getRelevantContext(newMessage, apiKey);
      if (relevantChunks.length > 0) {
        additionalContext = "\n\n[RAG CONTEXT - RELEVANT BLOG POSTS]:\n" +
          relevantChunks.map(chunk => `Title: ${chunk.title}\nURL: ${chunk.url}\nExcerpt: ${chunk.text}`).join("\n---\n");
      }
    } catch (ragError) {
      console.warn("RAG retrieval failed, proceeding without it:", ragError);
    }

    // Prepare the conversation for the API
    // We treat the "history" as the context of conversation so far.
    // The "newMessage" is the latest user input.
    // "additionalContext" is injected into the user's message to give the model context for *this specific turn*.

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
    
    return "I'm processing that signal, but returned no data.";

  } catch (error) {
    // Security: Sanitize error logging to prevent leaking sensitive info (e.g. API keys in stack traces)
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Gemini API Error:", errorMessage);
    return "Connection to the neural link failed. Please try again.";
  }
};
