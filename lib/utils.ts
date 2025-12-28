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
    // Fallback: try to find the outermost array/object brackets
    const firstOpen = text.indexOf('[');
    if (firstOpen === -1) return null;

    // Try to parse increasingly larger substrings starting from firstOpen
    // This is safer than lastIndexOf(']') which might catch irrelevant trailing brackets
    // Optimization: find all closing brackets
    let currentPos = text.indexOf(']', firstOpen);
    while (currentPos !== -1) {
      try {
        const jsonSubstring = text.substring(firstOpen, currentPos + 1);
        const result = JSON.parse(jsonSubstring);
        // If it parses successfully, it might be the valid JSON we want.
        // However, `JSON.parse` is lenient (e.g. `[1]` parses even if text is `[1] junk`).
        // Wait, JSON.parse throws if there is trailing junk?
        // JSON.parse(" [1] junk ") throws? Yes.
        // JSON.parse("[1]") works.

        // So if this succeeds, it means `jsonSubstring` is a valid JSON.
        // And since we extracted it from the larger string, we found our match.
        return result;
      } catch {
        // Continue searching for the next closing bracket
        currentPos = text.indexOf(']', currentPos + 1);
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

/**
 * Checks if a link URL is safe to render to prevent XSS and open redirects.
 * Explicitly disallows protocol-relative URLs (//) to prevent open redirects.
 *
 * @param href The URL to check.
 * @returns True if the link is safe, false otherwise.
 */
export function isSafeLink(href: string): boolean {
  if (!href) return false;
  // Allow http/https/mailto
  if (href.startsWith('http') || href.startsWith('mailto')) return true;
  // Allow anchors
  if (href.startsWith('#')) return true;
  // Allow internal paths, but reject protocol-relative (//)
  if (href.startsWith('/') && !href.startsWith('//')) return true;

  return false;
}
