
import { test } from 'node:test';
import * as assert from 'node:assert';
import { filterAndSortEssays } from '../lib/essay_logic';
import { BlogPost } from '../lib/knowledge';

// Helper to create mock blog posts
const createMockPost = (id: string, title: string, readTime: number, date: string): BlogPost => ({
  slug: id,
  attributes: {
    title,
    date,
    author: 'Author',
    description: 'Description'
  },
  body: `Body content for ${title}`,
  readTime,
});

test('filterAndSortEssays', async (t) => {
  // Setup: Create a list of posts sorted by newest (default assumption)
  const posts: BlogPost[] = [
    createMockPost('1', 'React Hooks', 5, '2023-01-03'), // Newest
    createMockPost('2', 'TypeScript Tips', 2, '2023-01-02'),
    createMockPost('3', 'CSS Grid', 10, '2023-01-01')    // Oldest
  ];

  await t.test('filters by search query', () => {
    const result = filterAndSortEssays(posts, 'typescript', 'newest');
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].attributes.title, 'TypeScript Tips');
  });

  await t.test('filters by search query (case insensitive)', () => {
    const result = filterAndSortEssays(posts, 'HOOKS', 'newest');
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].attributes.title, 'React Hooks');
  });

  await t.test('returns empty array when no matches', () => {
    const result = filterAndSortEssays(posts, 'python', 'newest');
    assert.strictEqual(result.length, 0);
  });

  await t.test('sorts by newest (default)', () => {
    // Should preserve input order if already sorted
    const result = filterAndSortEssays(posts, '', 'newest');
    assert.strictEqual(result[0].slug, '1');
    assert.strictEqual(result[1].slug, '2');
    assert.strictEqual(result[2].slug, '3');
  });

  await t.test('sorts by oldest', () => {
    const result = filterAndSortEssays(posts, '', 'oldest');
    assert.strictEqual(result[0].slug, '3'); // Oldest first
    assert.strictEqual(result[1].slug, '2');
    assert.strictEqual(result[2].slug, '1'); // Newest last
  });

  await t.test('sorts by shortest read time', () => {
    const result = filterAndSortEssays(posts, '', 'shortest');
    assert.strictEqual(result[0].readTime, 2);
    assert.strictEqual(result[1].readTime, 5);
    assert.strictEqual(result[2].readTime, 10);
  });

  await t.test('sorts by longest read time', () => {
    const result = filterAndSortEssays(posts, '', 'longest');
    assert.strictEqual(result[0].readTime, 10);
    assert.strictEqual(result[1].readTime, 5);
    assert.strictEqual(result[2].readTime, 2);
  });

  await t.test('combines filtering and sorting', () => {
    // Filter "s" (all match "s") then sort by shortest
    // React Hook(s), Type(S)cript Tips, C(SS) Grid
    const result = filterAndSortEssays(posts, 's', 'shortest');
    assert.strictEqual(result.length, 3);
    assert.strictEqual(result[0].slug, '2'); // 2 mins
    assert.strictEqual(result[1].slug, '1'); // 5 mins
    assert.strictEqual(result[2].slug, '3'); // 10 mins
  });
});
