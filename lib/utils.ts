/**
 * Helper to safely parse JSON from a string, with a fallback strategy for embedded JSON.
 *
 * Why: Large Language Models (LLMs) often surround JSON output with conversational text
 * (e.g., "Here is the JSON: [...]") or include trailing noise. Standard `JSON.parse` fails
 * on these inputs.
 *
 * Strategy ("Bracket Balance"):
 * 1. Attempt standard `JSON.parse` first.
 * 2. If that fails, locate the first opening bracket `[` or brace `{`.
 * 3. Walk forward, counting brackets/braces to find the matching closing character.
 * 4. This avoids O(N^2) behavior of trying to parse at every closing bracket.
 *
 * @param text The text containing potential JSON.
 * @returns The parsed object or null if parsing fails.
 */
export function safeJsonParse<T>(text: string): T | null {
  try {
    return JSON.parse(text);
  } catch {
    const startInfo = findJsonStart(text);
    if (!startInfo) return null;

    const jsonString = extractBalancedJson(text, startInfo.start, startInfo.openChar, startInfo.closeChar);
    if (!jsonString) return null;

    try {
      return JSON.parse(jsonString);
    } catch {
      return null;
    }
  }
}

/**
 * Finds the starting index and delimiter characters for a potential JSON structure.
 * Prefers whichever structure (array or object) appears first.
 */
function findJsonStart(text: string): { start: number; openChar: string; closeChar: string } | null {
  const firstBracket = text.indexOf('[');
  const firstBrace = text.indexOf('{');

  if (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
    return { start: firstBracket, openChar: '[', closeChar: ']' };
  } else if (firstBrace !== -1) {
    return { start: firstBrace, openChar: '{', closeChar: '}' };
  }

  return null;
}

/**
 * Extracts a balanced JSON substring starting from a given index.
 * Handles nested structures and ignores brackets inside strings.
 */
function extractBalancedJson(text: string, start: number, openChar: string, closeChar: string): string | null {
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
      if (char === openChar) {
        balance++;
      } else if (char === closeChar) {
        balance--;
        if (balance === 0) {
          return text.substring(start, i + 1);
        }
      }
    }
  }
  return null;
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
    prompts: Array.isArray(prompts) ? prompts : []
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

  // Optimization: Count words in a single pass without allocating arrays/strings.
  // Replaces: text.trim().split(/\s+/).filter(w => w.length > 0).length
  // This reduces memory pressure (garbage collection) during large text processing.
  let wordCount = 0;
  let inWord = false;

  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    // Check for common whitespace: Space(32), Tab(9), LF(10), CR(13), FF(12), NBSP(160)
    const isWhitespace = code === 32 || code === 9 || code === 10 || code === 13 || code === 12 || code === 160;

    if (isWhitespace) {
      inWord = false;
    } else if (!inWord) {
      inWord = true;
      wordCount++;
    }
  }

  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
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

/**
 * Splits text into manageable chunks while preserving sentence boundaries.
 *
 * Why: Splitting by sentences rather than arbitrary character counts ensures that
 * semantic meaning is preserved, which significantly improves the quality of vector embeddings
 * and the relevance of RAG retrieval. Truncating a sentence in the middle often results in lost context.
 *
 * Strategy:
 * 1. Split text into sentences using regex `/[^.!?]+[.!?]+/g`.
 * 2. Accumulate sentences into a chunk until `maxChars` is reached.
 * 3. Push the chunk and start a new one.
 *
 * @param text - The raw text content to be chunked.
 * @param maxChars - The target maximum length for each chunk (default 1000).
 *                   1000 chars is roughly 200-250 words, a balanced size for the model's context window.
 * @returns An array of text strings (chunks).
 */
export function chunkText(text: string, maxChars: number = 1000): string[] {
  const chunks: string[] = [];
  let currentChunk = "";

  // The previous regex `/[^.!?]+[.!?]+/g` only matched if punctuation was present.
  // This causes data loss for "This is a test" (no dot) or "Sentence 1. Sentence 2" (last one might not have dot if poorly formatted).
  //
  // Better strategy:
  // 1. Split by delimiters but keep them. `split(/([.!?]+)/)`
  // 2. Re-assemble.

  // Implementation using match with a comprehensive regex to capture "Sentence + Punctuation" OR "Remaining Text"
  // ([^.!?]+[.!?]+) matches normal sentences.
  // ([^.!?]+$) matches text at the end without punctuation.
  const sentenceRegex = /([^.!?]+[.!?]+)|([^.!?]+$)/g;

  // Optimization: Use matchAll to avoid creating an array of all sentences in memory.
  // This is significant for large texts (e.g., RAG ingestion).
  const matches = text.matchAll(sentenceRegex);
  let hasMatches = false;

  for (const match of matches) {
    hasMatches = true;
    const rawSentence = match[0];
    const sentence = rawSentence.trim(); // Normalize whitespace
    if (!sentence) continue;

    const potentialLength = currentChunk.length + (currentChunk ? 1 : 0) + sentence.length;

    if (potentialLength > maxChars) {
       // If current chunk is non-empty, push it
       if (currentChunk.length > 0) {
           chunks.push(currentChunk);
           currentChunk = "";
       }
    }

    // Append to current chunk (or start new one if we just cleared it)
    currentChunk += (currentChunk ? " " : "") + sentence;
  }

  // If no matches (empty string), return empty array
  if (!hasMatches) {
    if (text.trim().length === 0) return [];
    return [text]; // Fallback
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }
  return chunks;
}

/**
 * Escapes HTML characters to prevent Stored XSS.
 *
 * @param unsafe The unsafe string.
 * @returns The escaped string.
 */
export function escapeHtml(unsafe: string): string {
  if (!unsafe) return unsafe;
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
