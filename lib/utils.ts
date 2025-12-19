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
