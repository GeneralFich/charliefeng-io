
import { test } from 'node:test';
import * as assert from 'node:assert';
import { getRelevantContext, BlogChunk } from '../lib/rag';

// Mock embedder that returns a simple vector [1, 0, 0] for the query
const mockEmbedder = async (text: string) => {
  if (text === 'empty') return []; // simulate empty embedding
  if (text === 'orthogonal') return [0, 1, 0]; // simulate orthogonal query
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
      },
      {
        id: '3',
        text: 'Barely Irrelevant',
        title: 'Title 3',
        url: '/url3',
        publishedDate: '2023-01-01',
        embedding: [0.5, 0.866, 0], // Sim = 0.5 (cos 60) -> Should filter if > 0.5 logic holds
        _magnitude: 1
      }
    ];

    const results = await getRelevantContext('query', 'fake-key', mockEmbedder, mockData);

    // If threshold is strictly > 0.5, then 0.5 is excluded.
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

  await t.test('returns empty array if nothing matches', async () => {
    const mockData: BlogChunk[] = [
      {
        id: '1',
        text: 'Opposite',
        title: 'Title 1',
        url: '/url1',
        publishedDate: '2023-01-01',
        embedding: [-1, 0, 0], // Sim -1
        _magnitude: 1
      }
    ];

    const results = await getRelevantContext('query', 'fake-key', mockEmbedder, mockData);
    assert.strictEqual(results.length, 0);
  });

  await t.test('handles orthogonal vectors correctly', async () => {
    const mockData: BlogChunk[] = [
      {
        id: '1',
        text: 'Orthogonal',
        title: 'Title 1',
        url: '/url1',
        publishedDate: '2023-01-01',
        embedding: [0, 1, 0],
        _magnitude: 1
      }
    ];
    // query [1,0,0] vs [0,1,0] -> 0
    const results = await getRelevantContext('query', 'fake-key', mockEmbedder, mockData);
    assert.strictEqual(results.length, 0);
  });
});
