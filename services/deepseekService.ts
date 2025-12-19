
import { Message } from "../types";
import { FULL_CONTEXT } from "../lib/knowledge";

const deepseekKey = process.env.DEEPSEEK_API_KEY;

export const sendMessageToDeepSeek = async (
  history: Message[],
  newMessage: string,
  context?: string
): Promise<string> => {
  if (!deepseekKey) {
    throw new Error("DeepSeek API Key is missing.");
  }

  const systemMessage = {
    role: "system",
    content: FULL_CONTEXT
  };

  const userContent = context
    ? `Context for this query:\n${context}\n\nUser Query: ${newMessage}`
    : newMessage;

  const messages = [
    systemMessage,
    ...history.map(msg => ({
      role: msg.role === 'model' ? 'assistant' : msg.role,
      content: msg.text
    })),
    { role: "user", content: userContent }
  ];

  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${deepseekKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: messages,
        temperature: 0.7,
        max_tokens: 4000,
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DeepSeek API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;

  } catch (error) {
    console.error("DeepSeek API request failed:", error);
    throw error;
  }
};
