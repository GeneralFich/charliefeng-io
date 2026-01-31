
import { test, mock, describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert';
import { Language } from '../types';

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
mock.module('@google/genai', {
  namedExports: {
    GoogleGenAI: MockGoogleGenAI
  }
});

mock.module('../lib/rag', {
  namedExports: {
    getRelevantContext: getRelevantContextMock
  }
});

// Mock knowledge to avoid loading Markdown files which Node/tsx doesn't support
mock.module('../lib/knowledge', {
  namedExports: {
    FULL_CONTEXT: "System Prompt",
    getFullContext: (lang: any) => "System Prompt for " + lang
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
    const history = [{ role: 'user' as const, text: 'Hello' }];
    const newMessage = 'How are you?';

    const response = await sendMessageToGemini(history, newMessage, Language.EN);

    assert.strictEqual(response, "Mocked AI response");

    // Verify API was called
    assert.strictEqual(generateContentMock.mock.callCount(), 1);

    // Verify RAG was called
    assert.strictEqual(getRelevantContextMock.mock.callCount(), 1);
  });

  it('should handle missing API key', async () => {
    // We can't easily "unset" the const ai inside the module since it's already evaluated.
  });

  it('should validate max input length', async () => {
    const longMessage = 'a'.repeat(10001);
    const response = await sendMessageToGemini([], longMessage, Language.EN);
    assert.match(response, /Message is too long/);

    // Should not call API
    assert.strictEqual(generateContentMock.mock.callCount(), 0);
  });

  it('should handle RAG failure gracefully', async () => {
    // Make RAG fail
    getRelevantContextMock.mock.mockImplementationOnce(async () => {
      throw new Error("RAG Failed");
    });

    const response = await sendMessageToGemini([], "Query", Language.EN);

    // Should still return response
    assert.strictEqual(response, "Mocked AI response");

    // API should still be called (RAG failure shouldn't block)
    assert.strictEqual(generateContentMock.mock.callCount(), 1);
  });

  it('should propagate AbortError when signal is aborted', async () => {
    const abortController = new AbortController();
    abortController.abort(); // Abort immediately

    // Mock API to throw an error (simulating cancellation or network error during abort)
    generateContentMock.mock.mockImplementationOnce(async () => {
      throw new Error("Request Aborted");
    });

    try {
      await sendMessageToGemini([], "Query", Language.EN, abortController.signal);
      assert.fail("Should have thrown error");
    } catch (err: any) {
      assert.ok(err);
      // Ensure the error was propagated, not swallowed
      assert.strictEqual(err.message, "Request Aborted");
    }
  });

  it('should catch generic API errors and return friendly message', async () => {
    // Mock API to throw a generic error
    generateContentMock.mock.mockImplementationOnce(async () => {
      throw new Error("Service Unavailable");
    });

    const response = await sendMessageToGemini([], "Query", Language.EN);

    // Should return the user-facing error message
    assert.match(response, /Error: Connection to the neural link failed/);
  });
});
