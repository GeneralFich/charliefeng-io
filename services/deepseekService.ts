/**
 * @fileoverview DeepSeek AI Service (fallback provider)
 *
 * Drop-in replacement for geminiService used when the Google Generative
 * Language API is inaccessible (e.g. mainland China).  DeepSeek's API
 * is OpenAI-compatible, so we talk to it via raw fetch + SSE parsing
 * without adding an additional npm dependency.
 *
 * Key differences from geminiService:
 * - Message roles: Gemini 'model' → OpenAI 'assistant'
 * - System instruction is sent as a leading {role:'system'} message
 * - RAG is skipped: DeepSeek has no public embeddings API, so we rely
 *   on the rich system prompt (resume + blog list) for context instead.
 * - Streaming uses Server-Sent Events (SSE) parsed manually.
 */

import { getFullContext } from "../lib/knowledge";
import { Message, Language } from "../types";
import { redactSensitiveInfo } from "../lib/utils";
import { validateChatInput, sanitizeInput } from "../lib/security";

const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";
const DEEPSEEK_MODEL = "deepseek-chat";

const apiKey = process.env.DEEPSEEK_API_KEY;

// ── Message format helpers ────────────────────────────────────────────────────

interface OpenAIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * Converts the internal Message[] history (Gemini format) to the
 * OpenAI-compatible format expected by the DeepSeek API.
 */
function buildDeepSeekMessages(
  history: Message[],
  newMessage: string,
  systemPrompt: string
): OpenAIMessage[] {
  const messages: OpenAIMessage[] = [
    { role: "system", content: systemPrompt },
    ...history.map((msg) => ({
      role: (msg.role === "model" ? "assistant" : "user") as "assistant" | "user",
      content: msg.text,
    })),
    { role: "user", content: newMessage },
  ];
  return messages;
}

// ── Streaming SSE parser ──────────────────────────────────────────────────────

/**
 * Reads a streaming SSE response from the DeepSeek API, calling onChunk
 * for each text delta received.  Returns the complete assembled text.
 */
async function readStream(
  response: Response,
  onChunk: (text: string) => void,
  abortSignal?: AbortSignal
): Promise<string> {
  if (!response.body) return "";

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let fullText = "";

  try {
    while (true) {
      if (abortSignal?.aborted) {
        await reader.cancel();
        break;
      }

      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      // Keep incomplete last line in the buffer
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6).trim();
        if (data === "[DONE]") return fullText;

        try {
          const parsed = JSON.parse(data);
          const chunk: string = parsed.choices?.[0]?.delta?.content ?? "";
          if (chunk) {
            fullText += chunk;
            onChunk(chunk);
          }
        } catch {
          // Malformed SSE line — skip silently.
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  return fullText;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Streams a message to the DeepSeek API.
 * Signature mirrors streamMessageToGemini for easy drop-in routing.
 */
export const streamMessageToDeepSeek = async (
  history: Message[],
  newMessage: string,
  language: Language,
  onChunk: (text: string) => void,
  abortSignal?: AbortSignal
): Promise<string> => {
  const validation = validateChatInput(history, newMessage);
  if (!validation.valid) {
    const err = validation.error || "Invalid input.";
    onChunk(err);
    return err;
  }

  if (!apiKey) {
    const err = "DeepSeek API key is missing. Please configure DEEPSEEK_API_KEY.";
    onChunk(err);
    return err;
  }

  const sanitized = sanitizeInput(newMessage);

  try {
    const messages = buildDeepSeekMessages(
      history,
      sanitized,
      getFullContext(language)
    );

    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages,
        stream: true,
        temperature: 0.7,
        max_tokens: 4000,
      }),
      signal: abortSignal,
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => response.statusText);
      const safe = redactSensitiveInfo(errText, [apiKey]);
      console.error("DeepSeek API error:", response.status, safe);
      return "Connection to the neural link failed. Please try again.";
    }

    const fullText = await readStream(response, onChunk, abortSignal);
    return fullText || "I'm processing that signal, but returned no data.";
  } catch (error) {
    if (abortSignal?.aborted) throw error;
    const raw = error instanceof Error ? error.message : "Unknown error";
    console.error("DeepSeek Streaming Error:", redactSensitiveInfo(raw, [apiKey]));
    return "Connection to the neural link failed. Please try again.";
  }
};

/**
 * Sends a non-streaming message to the DeepSeek API.
 * Signature mirrors sendMessageToGemini for easy drop-in routing.
 */
export const sendMessageToDeepSeek = async (
  history: Message[],
  newMessage: string,
  language: Language,
  abortSignal?: AbortSignal
): Promise<string> => {
  const sanitized = sanitizeInput(newMessage);
  const validation = validateChatInput(history, sanitized);
  if (!validation.valid) {
    return validation.error || "Invalid input.";
  }

  if (!apiKey) {
    return "DeepSeek API key is missing. Please configure DEEPSEEK_API_KEY.";
  }

  try {
    const messages = buildDeepSeekMessages(
      history,
      sanitized,
      getFullContext(language)
    );

    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages,
        stream: false,
        temperature: 0.7,
        max_tokens: 4000,
      }),
      signal: abortSignal,
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => response.statusText);
      const safe = redactSensitiveInfo(errText, [apiKey]);
      console.error("DeepSeek API error:", response.status, safe);
      return "Error: Connection to the neural link failed. Please try again.";
    }

    const json = await response.json();
    const text: string = json.choices?.[0]?.message?.content ?? "";
    return text || "I'm processing that signal, but returned no data.";
  } catch (error) {
    if (abortSignal?.aborted) throw error;
    const raw = error instanceof Error ? error.message : "Unknown error";
    console.error("DeepSeek API Error:", redactSensitiveInfo(raw, [apiKey]));
    return "Error: Connection to the neural link failed. Please try again.";
  }
};
