/**
 * Checks if a request should be allowed based on a simple sliding window rate limit.
 *
 * Why: To prevent abuse of the API key and denial-of-service attacks by flooding the chat.
 *
 * @param timestamps Array of timestamps (in ms) of past requests.
 * @param windowMs The time window in milliseconds (e.g., 60000 for 1 minute).
 * @param maxRequests The maximum number of requests allowed in the window.
 * @returns Object containing `allowed` (boolean) and `newTimestamps` (array).
 */
export function checkRateLimit(
  timestamps: number[],
  windowMs: number,
  maxRequests: number
): { allowed: boolean; newTimestamps: number[] } {
  const now = Date.now();
  // Filter out timestamps older than the window
  const validTimestamps = timestamps.filter(t => now - t < windowMs);

  if (validTimestamps.length >= maxRequests) {
    return { allowed: false, newTimestamps: validTimestamps };
  }

  // Add current request
  return { allowed: true, newTimestamps: [...validTimestamps, now] };
}

import { Message } from '../types';

export const MAX_NEW_MESSAGE_LENGTH = 10000;
export const MAX_TOTAL_HISTORY_LENGTH = 100000;

/**
 * Validates the chat input to prevent Denial of Service (DoS) and abuse.
 *
 * Why: Prevents processing of excessively large payloads that could crash the client
 * or consume excessive API tokens/costs. "Defense in Depth".
 *
 * @param history The conversation history.
 * @param newMessage The new message to append.
 */
export function validateChatInput(history: Message[], newMessage: string): { valid: boolean; error?: string } {
    if (!newMessage || newMessage.length > MAX_NEW_MESSAGE_LENGTH) {
        return { valid: false, error: "Message is too long. Please shorten your query." };
    }

    // Basic structural validation
    if (!Array.isArray(history)) {
        return { valid: false, error: "Invalid history format." };
    }

    let totalLength = newMessage.length;

    for (const msg of history) {
        if (!msg || typeof msg !== 'object' || !msg.role || typeof msg.text !== 'string') {
             return { valid: false, error: "Invalid message format in history." };
        }
        totalLength += msg.text.length;
    }

    if (totalLength > MAX_TOTAL_HISTORY_LENGTH) {
        return { valid: false, error: "Conversation history is too long. Please clear chat to continue." };
    }

    return { valid: true };
}
