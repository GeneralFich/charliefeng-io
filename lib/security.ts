/**
 * @fileoverview Security & Abuse Prevention Logic
 *
 * This module provides utilities to protect the application from abuse,
 * primarily focusing on Rate Limiting.
 *
 * Philosophy ("Defense in Depth"):
 * While client-side checks can be bypassed by determined attackers (e.g., by clearing local storage
 * or modifying the code), they serve as an effective first line of defense against:
 * 1. Accidental abuse (e.g., holding down the Enter key).
 * 2. Automated bots that aren't specifically targeting this site's internal API.
 * 3. "Denial of Wallet" attacks where users might exhaust the Gemini API quota.
 *
 * Note: Since this is a serverless/static app, we lack a persistent backend state
 * for IP-based rate limiting. We rely on the `useChat` hook to persist timestamps
 * in memory (per session) and the API key's own quotas as the hard limit.
 *
 * Input Validation:
 * Note that input validation (length limits, content safety) is currently handled
 * in the `services/geminiService.ts` and `hooks/useChat.ts` layers to ensure
 * immediate feedback to the user and the API client.
 */

/**
 * Checks if a request should be allowed based on a simple sliding window rate limit.
 *
 * Why: To prevent abuse of the API key and denial-of-service attacks by flooding the chat.
 *
 * @param timestamps Array of timestamps (in ms) of past requests.
 * @param windowMs The time window in milliseconds (e.g., 60000 for 1 minute).
 * @param maxRequests The maximum number of requests allowed in the window.
 * @param now Optional timestamp to use as "now" (for testing). Defaults to Date.now().
 * @returns Object containing `allowed` (boolean) and `newTimestamps` (array).
 */
export function checkRateLimit(
  timestamps: number[],
  windowMs: number,
  maxRequests: number,
  now: number = Date.now()
): { allowed: boolean; newTimestamps: number[] } {
  // Filter out timestamps older than the window
  const validTimestamps = timestamps.filter(t => now - t < windowMs);

  if (validTimestamps.length >= maxRequests) {
    return { allowed: false, newTimestamps: validTimestamps };
  }

  // Add current request
  return { allowed: true, newTimestamps: [...validTimestamps, now] };
}

import { Message } from '../types';

// Security: Enforce strict limits to align with UI and prevent "Denial of Wallet".
// Reduced from 10000 to 2000 to match the UI's validation logic, ensuring
// the service layer acts as the Single Source of Truth for security policy.
export const MAX_NEW_MESSAGE_LENGTH = 2000;

// Security: Reduced from 100000 to 20000 (~5k tokens) to prevent excessive
// token usage in a single session while maintaining sufficient context.
export const MAX_TOTAL_HISTORY_LENGTH = 20000;

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
