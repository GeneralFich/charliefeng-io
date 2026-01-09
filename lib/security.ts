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
