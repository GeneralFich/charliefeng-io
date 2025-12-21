import { GoogleGenAI } from "@google/genai";

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { contents, systemInstruction, model } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response('Missing API Key', { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Default to the preview model if not specified, matching client usage
    const modelName = model || "gemini-3-flash-preview";

    const result = await ai.models.generateContentStream({
      model: modelName,
      contents: contents,
      config: {
        systemInstruction: systemInstruction, // Passed from client
        temperature: 0.7,
        maxOutputTokens: 4000,
      }
    });

    const stream = new ReadableStream({
      async start(controller) {
        try {
            for await (const chunk of result.stream) {
                const text = chunk.text();
                if (text) {
                    controller.enqueue(new TextEncoder().encode(text));
                }
            }
            controller.close();
        } catch (error) {
            console.error("Streaming error:", error);
            controller.error(error);
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked'
      }
    });

  } catch (error) {
    console.error("API Route Error:", error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
