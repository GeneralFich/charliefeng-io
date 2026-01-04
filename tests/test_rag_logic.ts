
import { test } from 'node:test';
import * as assert from 'node:assert';
import { getRelevantContext, BlogChunk } from '../lib/rag';

// Mock embedder that returns a simple vector [1, 0, 0] for the query
const mockEmbedder = async (text: string) => {
  return [1, 0, 0];
};

test('getRelevantContext Logic', async (t) => {
  await t.test('filters out chunks with score <= 0.5', async () => {
    const mockData: BlogChunk[] = [
      {
        id: '1',
        text: 'Relevant',
        title: 'Title 1',
        url: '/url1',
        publishedDate: '2023-01-01',
        embedding: [1, 0, 0], // Similarity 1.0
        _magnitude: 1
      },
      {
        id: '2',
        text: 'Irrelevant',
        title: 'Title 2',
        url: '/url2',
        publishedDate: '2023-01-01',
        embedding: [0, 1, 0], // Similarity 0.0
        _magnitude: 1
      }
    ];

    const results = await getRelevantContext('query', 'fake-key', mockEmbedder, mockData);

    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].text, 'Relevant');
    assert.strictEqual(results[0].score, 1);
  });

  await t.test('sorts chunks by score descending', async () => {
    const mockData: BlogChunk[] = [
      {
        id: '1',
        text: 'Semi-relevant',
        title: 'Title 1',
        url: '/url1',
        publishedDate: '2023-01-01',
        embedding: [0.8, 0.6, 0], // Similarity 0.8
        _magnitude: 1
      },
      {
        id: '2',
        text: 'Most Relevant',
        title: 'Title 2',
        url: '/url2',
        publishedDate: '2023-01-01',
        embedding: [1, 0, 0], // Similarity 1.0
        _magnitude: 1
      }
    ];

    const results = await getRelevantContext('query', 'fake-key', mockEmbedder, mockData);

    assert.strictEqual(results.length, 2);
    assert.strictEqual(results[0].text, 'Most Relevant');
    assert.strictEqual(results[1].text, 'Semi-relevant');
  });

  await t.test('limits results to top 5', async () => {
    // Generate 10 chunks with varying scores (all relevant)
    const mockData: BlogChunk[] = [];
    for (let i = 0; i < 10; i++) {
        // [1, 0, 0] is query.
        // We vary the first component to change similarity slightly.
        // 0.9, 0.8, etc.
        const val = 0.9 + (i * 0.01);
        mockData.push({
            id: `${i}`,
            text: `Chunk ${i}`,
            title: `Title ${i}`,
            url: `/url${i}`,
            publishedDate: '2023-01-01',
            embedding: [val, 0, 0],
            _magnitude: val
        });
    }

    const results = await getRelevantContext('query', 'fake-key', mockEmbedder, mockData);
    assert.strictEqual(results.length, 5);
    // Should be sorted
    assert.ok(results[0].score >= results[1].score);
  });

  await t.test('handles chunks without pre-calculated magnitude', async () => {
     // The loop logic uses `chunk._magnitude`.
     // We need to ensure that if we pass custom data without _magnitude, it still works.
     // Wait, the loop in `rag.ts` calls `cosineSimilarity(..., chunk._magnitude)`.
     // If `chunk._magnitude` is undefined, `cosineSimilarity` calculates it.

     const mockData: BlogChunk[] = [
      {
        id: '1',
        text: 'No Mag',
        title: 'Title 1',
        url: '/url1',
        publishedDate: '2023-01-01',
        embedding: [1, 0, 0]
      }
    ];

    const results = await getRelevantContext('query', 'fake-key', mockEmbedder, mockData);
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].text, 'No Mag');
    assert.strictEqual(results[0].score, 1);
  });
});
