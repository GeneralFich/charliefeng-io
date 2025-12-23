/**
 * Helper to safely parse JSON from a string, with a fallback strategy for embedded JSON.
 *
 * @param text The text containing JSON.
 * @returns The parsed object or null if parsing fails.
 */
function safeJsonParse<T>(text: string): T | null {
  try {
    return JSON.parse(text);
  } catch {
    // Fallback: try to find the array/object brackets if direct parse fails
    const firstOpen = text.indexOf('[');
    const firstClose = text.lastIndexOf(']');

    if (firstOpen !== -1 && firstClose !== -1 && firstClose > firstOpen) {
      try {
        const jsonSubstring = text.substring(firstOpen, firstClose + 1);
        return JSON.parse(jsonSubstring);
      } catch {
        return null;
      }
    }
    return null;
  }
}

/**
 * Parses the AI response to extract follow-up prompts formatted with a [FOLLOW_UP] tag.
 *
 * @param text The full response text from the AI.
 * @returns An object containing the cleaned response text and an array of suggested prompts.
 */
export function parseFollowUpPrompts(text: string): { cleanText: string; prompts: string[] } {
  const marker = '[FOLLOW_UP]';
  if (!text.includes(marker)) {
    return { cleanText: text, prompts: [] };
  }

  const parts = text.split(marker);
  const cleanText = parts[0].trim();
  // Handle case where marker appears multiple times or in the content
  // We want everything AFTER the first marker.
  const potentialJson = parts.slice(1).join(marker).trim();

  const prompts = safeJsonParse<string[]>(potentialJson);

  return {
    cleanText,
    prompts: prompts || []
  };
}

/**
 * Calculates the estimated read time for a given text.
 * Assumes a reading speed of 200 words per minute.
 *
 * @param text The text to calculate read time for.
 * @returns The estimated read time in minutes (minimum 1).
 */
export function calculateReadTime(text: string): number {
  if (!text) return 1;
  const wordsPerMinute = 200;
  // Split by whitespace and filter out empty strings to get accurate word count
  const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

/**
 * Redacts sensitive information from a text string.
 *
 * @param text The text to sanitize.
 * @param secrets An array of sensitive strings to redact.
 * @returns The sanitized text with sensitive strings replaced by [REDACTED].
 */
export function redactSensitiveInfo(text: string, secrets: (string | undefined | null)[]): string {
  if (!text) return text;
  let sanitized = text;
  secrets.forEach(secret => {
    // Only redact if secret is substantial (>4 chars) to avoid false positives
    if (secret && typeof secret === 'string' && secret.length > 4) {
      // Escape special regex characters in the secret
      const escapedSecret = secret.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escapedSecret, 'g');
      sanitized = sanitized.replace(regex, '[REDACTED]');
    }
  });
  return sanitized;
}

/**
 * Escapes special characters in a string for use in a regular expression.
 *
 * @param string The string to escape.
 * @returns The escaped string.
 */
export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
