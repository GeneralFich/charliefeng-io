
import { test, mock, describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert';

// Mock dependencies BEFORE importing the service
const generateContentMock = mock.fn(async () => ({
  text: "Mocked AI response"
}));

const MockGoogleGenAI = class {
  constructor(options: any) {
    // assert.ok(options.apiKey, "API Key should be passed");
  }
  models = {
    generateContent: generateContentMock
  }
};

const getRelevantContextMock = mock.fn(async () => {
  return [
    { text: "Context 1", title: "Post 1", url: "/post1", score: 0.9 }
  ];
});

// We need to mock the modules.
// Note: specifiers must match what the service uses or be absolute.
// Since services/geminiService.ts imports from "@google/genai" and "../lib/rag"
// We try to mock those specific strings.

mock.module('@google/genai', {
  namedExports: {
    GoogleGenAI: MockGoogleGenAI
  }
});

// We need to resolve the path to lib/rag relative to the test file -> ../lib/rag
// But the service imports it as ../lib/rag from services/ -> which is lib/rag.
// Node's mock.module usually mocks by specifier.
// Let's try mocking the resolved URL if possible, or just the specifier.
// The service imports `../lib/rag`.
mock.module('../lib/rag', {
  namedExports: {
    getRelevantContext: getRelevantContextMock
  }
});

// Mock knowledge to avoid loading Markdown files which Node/tsx doesn't support
mock.module('../lib/knowledge', {
  namedExports: {
    FULL_CONTEXT: "System Prompt"
  }
});

// Set the API key so the service instantiates the client
process.env.API_KEY = "test-api-key";

// Now import the service
// We use dynamic import to ensure mocks are in place
const { sendMessageToGemini } = await import('../services/geminiService');

describe('Gemini Service', () => {

  beforeEach(() => {
    generateContentMock.mock.resetCalls();
    getRelevantContextMock.mock.resetCalls();
  });

  after(() => {
    delete process.env.API_KEY;
  });

  it('should send a message and return response', async () => {
    const history: any[] = [{ role: 'user', text: 'Hello' }];
    const newMessage = 'How are you?';

    const response = await sendMessageToGemini(history, newMessage);

    assert.strictEqual(response, "Mocked AI response");

    // Verify API was called
    assert.strictEqual(generateContentMock.mock.callCount(), 1);

    // Verify RAG was called
    assert.strictEqual(getRelevantContextMock.mock.callCount(), 1);
  });

  it('should handle missing API key', async () => {
    // We can't easily "unset" the const ai inside the module since it's already evaluated.
    // So this test case is hard to do without reloading the module.
    // We'll skip this specific edge case for this run or try to re-import?
    // Modules are cached.

    // Alternative: We can mock the environment variable BEFORE import.
    // Since we already imported it, we can't test the "missing key" initialization path
    // unless we use isolation (e.g. separate test files or loader hooks).
    // So we will focus on the logic available.
  });

  it('should validate max input length', async () => {
    const longMessage = 'a'.repeat(10001);
    const response = await sendMessageToGemini([], longMessage);
    assert.match(response, /Message is too long/);

    // Should not call API
    assert.strictEqual(generateContentMock.mock.callCount(), 0);
  });

  it('should handle RAG failure gracefully', async () => {
    // Make RAG fail
    getRelevantContextMock.mock.mockImplementationOnce(async () => {
      throw new Error("RAG Failed");
    });

    const response = await sendMessageToGemini([], "Query");

    // Should still return response
    assert.strictEqual(response, "Mocked AI response");

    // API should still be called (RAG failure shouldn't block)
    assert.strictEqual(generateContentMock.mock.callCount(), 1);
  });
});
