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
    const firstOpen = text.indexOf('[');
    if (firstOpen === -1) return null;
    let currentPos = text.indexOf(']', firstOpen);
    while (currentPos !== -1) {
      try {
        const jsonSubstring = text.substring(firstOpen, currentPos + 1);
        return JSON.parse(jsonSubstring);
      } catch {
        currentPos = text.indexOf(']', currentPos + 1);
      }
    }
    return null;
  }
}

export function parseFollowUpPrompts(text: string): { cleanText: string; prompts: string[] } {
  const marker = '[FOLLOW_UP]';
  if (!text.includes(marker)) {
    return { cleanText: text, prompts: [] };
  }
  const parts = text.split(marker);
  const cleanText = parts[0].trim();
  const potentialJson = parts.slice(1).join(marker).trim();
  const prompts = safeJsonParse<string[]>(potentialJson);
  return { cleanText, prompts: prompts || [] };
}

export function calculateReadTime(text: string): number {
  if (!text) return 1;
  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

export function redactSensitiveInfo(text: string, secrets: (string | undefined | null)[]): string {
  if (!text) return text;
  let sanitized = text;
  secrets.forEach(secret => {
    if (secret && typeof secret === 'string' && secret.length > 4) {
      const escapedSecret = secret.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escapedSecret, 'g');
      sanitized = sanitized.replace(regex, '[REDACTED]');
    }
  });
  return sanitized;
}

export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Splits text into manageable chunks.
 * Simplified robust logic to avoid double spaces and handle huge sentences.
 */
export function chunkText(text: string, maxChars: number = 1000): string[] {
  const chunks: string[] = [];
  let currentChunk = "";

  // Check for Intl.Segmenter support
  // @ts-ignore
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    // @ts-ignore
    const segmenter = new Intl.Segmenter('en', { granularity: 'sentence' });
    const segments = segmenter.segment(text);
    for (const { segment } of segments) {
      if (currentChunk.length > 0 && (currentChunk.length + segment.length) > maxChars) {
        chunks.push(currentChunk.trim());
        currentChunk = "";
      }
      currentChunk += segment;
    }
  } else {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    for (const sentence of sentences) {
      if (currentChunk.length > 0 && (currentChunk.length + sentence.length) > maxChars) {
        chunks.push(currentChunk.trim());
        currentChunk = "";
      }
      currentChunk += sentence;
      if (!/\s$/.test(sentence)) {
          currentChunk += " ";
      }
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }
  return chunks;
}
