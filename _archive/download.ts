import { Message } from '../types';

/**
 * Formats chat history into a readable text format.
 *
 * @param messages The array of chat messages.
 * @returns The formatted string.
 */
export function formatChatHistory(messages: Message[]): string {
  return messages
    .map(msg => {
      const role = msg.role === 'user' ? 'You' : 'Charlie (AI)';
      return `[${role}]:\n${msg.text}\n`;
    })
    .join('\n' + '-'.repeat(40) + '\n\n');
}

/**
 * Triggers a browser download of a text file.
 *
 * @param content The text content of the file.
 * @param filename The name of the file to download.
 */
export function downloadTextFile(content: string, filename: string): void {
  // Guard against server-side rendering or non-browser environments
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    console.warn('Download attempted in non-browser environment');
    return;
  }

  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Downloads the current chat history as a text file.
 *
 * @param messages The array of chat messages.
 */
export function downloadChatHistory(messages: Message[]): void {
  if (messages.length <= 1) return;

  const content = formatChatHistory(messages);
  const date = new Date().toISOString().split('T')[0];
  const filename = `charlie-feng-chat-${date}.txt`;

  downloadTextFile(content, filename);
}
