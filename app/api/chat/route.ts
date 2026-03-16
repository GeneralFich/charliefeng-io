import { streamText } from 'ai';
import { google } from '@ai-sdk/google';
import { buildSystemPrompt } from '@/lib/rag';
import { sanitizeInput, checkRateLimit } from '@/lib/security';

// In-memory rate limiting (per-IP, resets on cold start)
const rateLimitMap = new Map<string, number[]>();

export async function POST(req: Request) {
  try {
    // Rate limiting: 10 requests per minute per IP
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
    const timestamps = rateLimitMap.get(ip) || [];
    const { allowed, newTimestamps } = checkRateLimit(timestamps, 60000, 10);
    rateLimitMap.set(ip, newTimestamps);

    if (!allowed) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again in a minute.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { messages } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid messages format.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize the latest user message
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'user' && typeof lastMessage.content === 'string') {
      lastMessage.content = sanitizeInput(lastMessage.content);
      if (lastMessage.content.length > 2000) {
        return new Response(
          JSON.stringify({ error: 'Message too long.' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Build system prompt (RAG context loaded from blog_data.json if available)
    // For simplicity, we use the static system prompt without embedding-based retrieval
    // since embedding the query requires an API call. The content is small enough
    // to include key facts directly in the system prompt.
    const systemPrompt = buildSystemPrompt([]);

    const result = streamText({
      model: google('gemini-2.0-flash'),
      system: systemPrompt,
      messages,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred processing your request.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
