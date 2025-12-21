/**
 * Parses the AI response to extract follow-up prompts formatted with a [FOLLOW_UP] tag.
 *
 * @param text The full response text from the AI.
 * @returns An object containing the cleaned response text and an array of suggested prompts.
 */
export function parseFollowUpPrompts(text: string): { cleanText: string; prompts: string[] } {
  let cleanText = text;
  let prompts: string[] = [];

  if (text.includes('[FOLLOW_UP]')) {
    const parts = text.split('[FOLLOW_UP]');
    cleanText = parts[0].trim();
    const potentialJson = parts.slice(1).join('[FOLLOW_UP]').trim();

    try {
      prompts = JSON.parse(potentialJson);
    } catch (e) {
      // Fallback: try to find the array brackets if direct parse fails (e.g. trailing text)
      const firstBracket = potentialJson.indexOf('[');
      const lastBracket = potentialJson.lastIndexOf(']');
      if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
        try {
          const jsonSubstring = potentialJson.substring(firstBracket, lastBracket + 1);
          prompts = JSON.parse(jsonSubstring);
        } catch (innerE) {
          console.error("Failed to parse extracted JSON substring", innerE);
        }
      } else {
          console.error("Failed to parse follow-up prompts directly", e);
      }
    }
  }

  return { cleanText, prompts };
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
