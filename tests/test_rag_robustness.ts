
import { test } from 'node:test';
import * as assert from 'node:assert';
import { getRelevantContext, BlogChunk } from '../lib/rag';
import { Language } from '../types';

// Mock embedder
const mockEmbedder = async (text: string) => [1, 0, 0];

test('getRelevantContext skips chunks with missing embeddings instead of failing completely', async (t) => {
    const mockData: BlogChunk[] = [
      {
        id: '1',
        text: 'Valid Chunk',
        title: 'Title 1',
        url: '/url1',
        publishedDate: '2023-01-01',
        embedding: [1, 0, 0], // Similarity 1
        _magnitude: 1
      },
      {
        id: '2',
        text: 'Invalid Chunk',
        title: 'Title 2',
        url: '/url2',
        publishedDate: '2023-01-01',
        // embedding is undefined
      }
    ];

    // Current behavior: Returns [] because of catch block (TypeError stops loop)
    // Desired behavior: Returns ['Valid Chunk']

    const results = await getRelevantContext('query', 'fake-key', Language.EN, mockEmbedder, mockData);

    assert.strictEqual(results.length, 1, "Should return 1 valid chunk");
    assert.strictEqual(results[0].text, 'Valid Chunk');
});

test('getRelevantContext handles unexpected TypeErrors during loop', async (t) => {
    const mockData: BlogChunk[] = [
      {
        id: '1',
        text: 'Valid Chunk',
        title: 'Title 1',
        url: '/url1',
        publishedDate: '2023-01-01',
        embedding: [1, 0, 0],
        _magnitude: 1
      },
      {
        id: '2',
        text: 'Broken Chunk',
        title: 'Title 2',
        url: '/url2',
        publishedDate: '2023-01-01',
        // embedding is present but accessing its properties throws
        embedding: {
            get length() { throw new TypeError('Simulated TypeError'); }
        } as any
      }
    ];

    const results = await getRelevantContext('query', 'fake-key', Language.EN, mockEmbedder, mockData);

    assert.strictEqual(results.length, 1, "Should return 1 valid chunk even if one chunk throws");
    assert.strictEqual(results[0].text, 'Valid Chunk');
});
