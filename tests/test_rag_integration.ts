
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { getRelevantContext, BlogChunk } from '../lib/rag';

describe('RAG Logic (Deterministic)', () => {
  const mockApiKey = 'fake-api-key';

  // Helper to create a chunk
  const createChunk = (id: string, embedding: number[]): BlogChunk => ({
    id,
    text: `Content for ${id}`,
    url: `/post/${id}`,
    title: `Title ${id}`,
    publishedDate: '2023-01-01',
    embedding
  });

  it('should correctly filter and sort results based on similarity', async () => {
    // 1. Setup Mock Data
    // We use simple 2D vectors for easy mental math.
    // Query: [1, 0] (x-axis)
    // Chunk A: [1, 0] -> Similarity 1.0 (Exact match)
    // Chunk B: [0, 1] -> Similarity 0.0 (Orthogonal) -> Should be filtered out (< 0.5)
    // Chunk C: [0.707, 0.707] -> Similarity ~0.707 (45 degrees) -> Should be included

    const mockData: BlogChunk[] = [
      createChunk('A', [1, 0]),
      createChunk('B', [0, 1]),
      createChunk('C', [0.707, 0.707]),
    ];

    const mockEmbedder = async () => [1, 0];

    // 2. Act
    const results = await getRelevantContext('query', mockApiKey, mockEmbedder, mockData);

    // 3. Assert
    assert.strictEqual(results.length, 2, 'Should return exactly 2 results (A and C)');

    // Sort order check: A (1.0) then C (~0.7)
    assert.strictEqual(results[0].title, 'Title A');
    assert.strictEqual(results[1].title, 'Title C');

    // Score checks
    assert.strictEqual(results[0].score, 1);
    assert(results[1].score > 0.7 && results[1].score < 0.71);
  });

  it('should handle empty custom data', async () => {
    const mockEmbedder = async () => [1, 0];
    const results = await getRelevantContext('query', mockApiKey, mockEmbedder, []);
    assert.deepStrictEqual(results, []);
  });

  it('should handle chunks with missing embeddings', async () => {
    const mockData: BlogChunk[] = [
      {
        id: 'D', text: 'No embedding', url: '/d', title: 'D', publishedDate: '2023-01-01'
        // embedding is undefined
      }
    ];
    const mockEmbedder = async () => [1, 0];
    const results = await getRelevantContext('query', mockApiKey, mockEmbedder, mockData);
    assert.deepStrictEqual(results, []);
  });
});

describe('RAG Integration (Error Handling)', () => {
  const mockApiKey = 'fake-api-key';

  it('should use custom embedder and handle errors gracefully', async () => {
    const mockEmbedder = async (text: string) => {
      throw new Error('Embedder failed');
    };

    const result = await getRelevantContext('test query', mockApiKey, mockEmbedder);
    assert.deepStrictEqual(result, []);
  });
});
