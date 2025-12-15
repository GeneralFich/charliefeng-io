import { GoogleGenAI } from "@google/genai";
import { FULL_CONTEXT } from "../lib/knowledge";
import { Message } from "../types";

const apiKey = process.env.API_KEY;

// Initialize the client.
// Note: In a real production app, we might want to handle this initialization 
// in a hook or context to handle missing keys more gracefully in the UI.
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const sendMessageToGemini = async (
  history: Message[],
  newMessage: string
): Promise<string> => {
  if (!ai) {
    return "API Key is missing. Please configure the environment variable.";
  }

  try {
    // We construct the prompt by prepending the system context.
    // While systemInstruction is available in config, stuffing context 
    // into the conversation flow often yields very robust results for "Digital Twin" 
    // personas on the Flash model.
    
    // Construct the chat history for the API
    const contents = [
      {
        role: "user",
        parts: [{ text: FULL_CONTEXT }],
      },
      {
        role: "model",
        parts: [{ text: "Understood. I am ready to act as Charlie Feng's Digital Twin." }],
      },
      ...history.map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.text }],
      })),
      {
        role: "user",
        parts: [{ text: newMessage }],
      },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        temperature: 0.7, // Balanced creativity and precision
        maxOutputTokens: 4000,
      }
    });

    if (response.text) {
      return response.text;
    }
    
    return "I'm processing that signal, but returned no data.";

  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Connection to the neural link failed. Please try again.";
  }
};
