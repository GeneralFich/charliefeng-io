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
