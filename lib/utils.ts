/**
 * Helper to safely parse JSON from a string, with a fallback strategy for embedded JSON.
 *
 * Why: Large Language Models (LLMs) often surround JSON output with conversational text
 * (e.g., "Here is the JSON: [...]") or include trailing noise. Standard `JSON.parse` fails
 * on these inputs.
 *
 * Strategy ("Bracket Balance"):
 * 1. Attempt standard `JSON.parse` first.
 * 2. If that fails, locate the first opening bracket `[`.
 * 3. Walk forward, counting brackets to find the matching closing bracket.
 * 4. This avoids O(N^2) behavior of trying to parse at every closing bracket.
 *
 * Note: Currently optimized for JSON Arrays (starting with `[`) as that matches our use case.
 *
 * @param text The text containing potential JSON.
 * @returns The parsed object or null if parsing fails.
 */
function safeJsonParse<T>(text: string): T | null {
  try {
    return JSON.parse(text);
  } catch {
    // Fallback: Locate the start of the JSON array
    const start = text.indexOf('[');
    if (start === -1) return null;

    let balance = 0;
    let inString = false;
    let isEscaped = false;

    for (let i = start; i < text.length; i++) {
      const char = text[i];

      if (isEscaped) {
        isEscaped = false;
        continue;
      }

      if (char === '\\') {
        isEscaped = true;
        continue;
      }

      if (char === '"') {
        inString = !inString;
        continue;
      }

      // Only count brackets outside of strings
      if (!inString) {
        if (char === '[') {
          balance++;
        } else if (char === ']') {
          balance--;
          if (balance === 0) {
            // Found the matching close bracket
            try {
              const jsonSubstring = text.substring(start, i + 1);
              return JSON.parse(jsonSubstring);
            } catch {
              // If the structure is balanced but invalid JSON, stop.
              return null;
            }
          }
        }
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

/**
 * Generates a URL-friendly slug from a string.
 * Compatible with GitHub's slugifier (used by rehype-slug).
 *
 * @param text The text to slugify.
 * @returns The slugified string.
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/&/g, '-and-')      // Replace & with 'and'
    .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
    .replace(/\-\-+/g, '-')      // Replace multiple - with single -
    .replace(/^-+|-+$/g, '');    // Remove leading/trailing -
}

/**
 * Extracts plain text from a markdown string, removing common formatting.
 * Useful for generating TOC labels from raw markdown headers.
 *
 * @param markdown The markdown string.
 * @returns The plain text.
 */
export function extractTextFromMarkdown(markdown: string): string {
  return markdown
    .replace(/\*\*(.*?)\*\*/g, '$1')  // Bold
    .replace(/\*(.*?)\*/g, '$1')      // Italic
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Links
    .replace(/`(.*?)`/g, '$1')        // Inline code
    .replace(/#+\s+/g, '')            // Headers prefix
    .trim();
}

/**
 * Recursively extracts text content from React nodes.
 *
 * @param nodes React nodes.
 * @returns The concatenated text content.
 */
export function extractTextFromReactNode(nodes: any): string {
  if (!nodes) return '';
  if (typeof nodes === 'string') return nodes;
  if (typeof nodes === 'number') return nodes.toString();
  if (Array.isArray(nodes)) return nodes.map(extractTextFromReactNode).join('');
  if (nodes.props && nodes.props.children) return extractTextFromReactNode(nodes.props.children);
  return '';
}
