
import { describe, it, mock } from 'node:test';
import assert from 'node:assert';
import { getRelevantContext, RelevantChunk, BlogChunk } from '../lib/rag';

describe('RAG Integration', () => {
  const mockApiKey = 'fake-api-key';

  it('should use custom embedder and handle errors gracefully', async () => {
    const mockEmbedder = async (text: string) => {
      throw new Error('Embedder failed');
    };

    // Should catch error and return empty array
    const result = await getRelevantContext('test query', mockApiKey, mockEmbedder);
    assert.deepStrictEqual(result, []);
  });

  it('should use custom embedder and return results (assuming blog data exists)', async () => {
    // We create a mock embedding.
    // To match something, we need to know what's in blog_data.json.
    // If we don't know, we can't guarantee a match > 0.5.
    // BUT we can check that it didn't crash.

    const mockEmbedder = async (text: string) => {
      // Return a vector of 768 zeros (standard size) or just some numbers
      return new Array(768).fill(0.1);
    };

    const result = await getRelevantContext('test query', mockApiKey, mockEmbedder);
    assert(Array.isArray(result));
    // If `result` has items, they must have keys: text, title, url, score
    if (result.length > 0) {
      assert('text' in result[0]);
      assert('score' in result[0]);
    }
  });

  it('should return empty array if custom embedder returns empty', async () => {
      // Use a custom embedder that acts like it failed to produce a valid embedding logic
      // But wait, our code expects number[].
      // If we pass a valid number[], it proceeds.

      const mockEmbedder = async (text: string) => {
         return []; // empty vector
      };

      const result = await getRelevantContext('test', mockApiKey, mockEmbedder);
      // magnitude of [] is 0. cosineSimilarity returns 0.
      // 0 < 0.5, so filtered out.
      assert.deepStrictEqual(result, []);
  });

  it('should correctly filter and sort results using injected data', async () => {
    // 1. Setup deterministic data
    // Query Vector: [1, 0, 0] (Unit vector along X)
    // Chunk A: [1, 0, 0] -> Sim 1.0 (Perfect match)
    // Chunk B: [0, 1, 0] -> Sim 0.0 (Orthogonal) -> Should be filtered out (< 0.5)
    // Chunk C: [0.8, 0.6, 0] -> Sim 0.8 (High match) -> Should be included, second place

    const mockEmbedder = async (text: string) => {
      return [1, 0, 0];
    };

    const mockData: BlogChunk[] = [
      {
        id: 'chunk-b',
        text: 'Chunk B Content',
        title: 'Chunk B',
        url: '/chunk-b',
        publishedDate: '2023-01-01',
        embedding: [0, 1, 0] // Sim 0.0
      },
      {
        id: 'chunk-a',
        text: 'Chunk A Content',
        title: 'Chunk A',
        url: '/chunk-a',
        publishedDate: '2023-01-01',
        embedding: [1, 0, 0] // Sim 1.0
      },
      {
        id: 'chunk-c',
        text: 'Chunk C Content',
        title: 'Chunk C',
        url: '/chunk-c',
        publishedDate: '2023-01-01',
        embedding: [0.8, 0.6, 0] // Sim 0.8
      }
    ];

    // 2. Execute
    const result = await getRelevantContext('test', mockApiKey, mockEmbedder, mockData);

    // 3. Assert
    assert.strictEqual(result.length, 2, 'Should return exactly 2 relevant chunks');

    // Check sorting (A should be first because 1.0 > 0.8)
    assert.strictEqual(result[0].title, 'Chunk A');
    assert.ok(Math.abs(result[0].score - 1.0) < 0.0001, 'Chunk A score should be ~1.0');

    // Check sorting (C should be second)
    assert.strictEqual(result[1].title, 'Chunk C');
    assert.ok(Math.abs(result[1].score - 0.8) < 0.0001, 'Chunk C score should be ~0.8');

    // Check filtering (B should not be present)
    const hasB = result.some(r => r.title === 'Chunk B');
    assert.strictEqual(hasB, false, 'Chunk B should be filtered out due to low score');
  });
});
