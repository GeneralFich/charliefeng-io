
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { getRelevantContext, BlogChunk } from '../lib/rag';

/**
 * @fileoverview RAG Integration Tests
 *
 * "Why": While `test_rag_logic.ts` focuses on the mathematical correctness of filtering and sorting,
 * this file tests the "Integration Plumbing" of the `getRelevantContext` function.
 *
 * Specifically, it verifies:
 * 1. Error handling when the Embedder fails.
 * 2. Proper handling of empty/invalid embeddings from the provider.
 * 3. End-to-end flow using injected `customData` to ensure determinism without relying on the file system.
 */

describe('RAG Integration Plumbing', () => {
  const mockApiKey = 'fake-api-key';

  // Deterministic mock data for testing
  const mockData: BlogChunk[] = [
    {
      id: '1',
      text: 'Target Content',
      title: 'Title 1',
      url: '/url1',
      publishedDate: '2023-01-01',
      embedding: [1, 0, 0], // Magnitude 1
      _magnitude: 1
    }
  ];

  it('should handle Embedder failures gracefully (return empty array)', async () => {
    const mockEmbedder = async () => {
      throw new Error('API Rate Limit');
    };

    // Should catch error and return empty array instead of crashing
    const result = await getRelevantContext('test query', mockApiKey, mockEmbedder, mockData);
    assert.deepStrictEqual(result, []);
  });

  it('should handle empty embeddings from provider', async () => {
    const mockEmbedder = async () => {
       return []; // Simulating an API response that has no vector
    };

    const result = await getRelevantContext('test', mockApiKey, mockEmbedder, mockData);
    // magnitude of [] is 0. cosineSimilarity returns 0.
    // 0 < 0.5 (threshold), so filtered out.
    assert.deepStrictEqual(result, []);
  });

  it('should successfully retrieve context using injected data', async () => {
    const mockEmbedder = async () => {
      return [1, 0, 0]; // Perfect match for the mock data
    };

    const result = await getRelevantContext('test query', mockApiKey, mockEmbedder, mockData);

    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].text, 'Target Content');
    assert.strictEqual(result[0].score, 1);
  });
});
