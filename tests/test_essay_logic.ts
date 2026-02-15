
import { test } from 'node:test';
import * as assert from 'node:assert';
import { filterAndSortEssays, searchPostSlugs } from '../lib/essay_logic';
import { BlogPostMeta } from '../lib/knowledge';

import { Language } from '../types';

// Helper to create mock blog post metadata
const createMockPost = (id: string, title: string, readTime: number, date: string): BlogPostMeta => ({
  slug: id,
  filename: `${id}.md`,
  attributes: {
    title,
    date,
    author: 'Author',
    description: 'Description'
  },
  readTime,
  dateTimestamp: new Date(date).getTime(),
  language: Language.EN,
});

test('filterAndSortEssays', async (t) => {
  // Setup: Create a list of posts sorted by newest (default assumption)
  const posts: BlogPostMeta[] = [
    createMockPost('1', 'React Hooks', 5, '2023-01-03'), // Newest
    createMockPost('2', 'TypeScript Tips', 2, '2023-01-02'),
    createMockPost('3', 'CSS Grid', 10, '2023-01-01')    // Oldest
  ];

  await t.test('shows all posts when matchingSlugs is null (no search)', () => {
    const result = filterAndSortEssays(posts, null, 'newest');
    assert.strictEqual(result.length, 3);
    assert.strictEqual(result[0].slug, '1');
    assert.strictEqual(result[1].slug, '2');
    assert.strictEqual(result[2].slug, '3');
  });

  await t.test('filters by matching slugs', () => {
    const result = filterAndSortEssays(posts, new Set(['2']), 'newest');
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].attributes.title, 'TypeScript Tips');
  });

  await t.test('returns empty array when no slugs match', () => {
    const result = filterAndSortEssays(posts, new Set(['nonexistent']), 'newest');
    assert.strictEqual(result.length, 0);
  });

  await t.test('returns empty array for empty slug set', () => {
    const result = filterAndSortEssays(posts, new Set(), 'newest');
    assert.strictEqual(result.length, 0);
  });

  await t.test('sorts by newest (default)', () => {
    const result = filterAndSortEssays(posts, null, 'newest');
    assert.strictEqual(result[0].slug, '1');
    assert.strictEqual(result[1].slug, '2');
    assert.strictEqual(result[2].slug, '3');
  });

  await t.test('sorts by oldest', () => {
    const result = filterAndSortEssays(posts, null, 'oldest');
    assert.strictEqual(result[0].slug, '3'); // Oldest first
    assert.strictEqual(result[1].slug, '2');
    assert.strictEqual(result[2].slug, '1'); // Newest last
  });

  await t.test('sorts by shortest read time', () => {
    const result = filterAndSortEssays(posts, null, 'shortest');
    assert.strictEqual(result[0].readTime, 2);
    assert.strictEqual(result[1].readTime, 5);
    assert.strictEqual(result[2].readTime, 10);
  });

  await t.test('sorts by longest read time', () => {
    const result = filterAndSortEssays(posts, null, 'longest');
    assert.strictEqual(result[0].readTime, 10);
    assert.strictEqual(result[1].readTime, 5);
    assert.strictEqual(result[2].readTime, 2);
  });

  await t.test('combines filtering and sorting', () => {
    // Filter to all slugs, then sort by shortest
    const result = filterAndSortEssays(posts, new Set(['1', '2', '3']), 'shortest');
    assert.strictEqual(result.length, 3);
    assert.strictEqual(result[0].slug, '2'); // 2 mins
    assert.strictEqual(result[1].slug, '1'); // 5 mins
    assert.strictEqual(result[2].slug, '3'); // 10 mins
  });
});

test('searchPostSlugs', async (t) => {
  const searchIndex = [
    { slug: '1', language: 'en', title: 'React Hooks', description: 'Learn about hooks', body: 'Body content for React Hooks' },
    { slug: '2', language: 'en', title: 'TypeScript Tips', description: 'TS best practices', body: 'Body content for TypeScript Tips' },
    { slug: '3', language: 'en', title: 'CSS Grid', description: 'Grid layout guide', body: 'Body content for CSS Grid' },
    { slug: '1', language: 'zh', title: 'React Hooks 中文', description: '学习钩子', body: '关于React Hooks的内容' },
  ];

  await t.test('finds matches by title', () => {
    const result = searchPostSlugs(searchIndex, 'typescript', 'en');
    assert.strictEqual(result.size, 1);
    assert.ok(result.has('2'));
  });

  await t.test('finds matches case-insensitively', () => {
    const result = searchPostSlugs(searchIndex, 'HOOKS', 'en');
    assert.strictEqual(result.size, 1);
    assert.ok(result.has('1'));
  });

  await t.test('finds matches in body text', () => {
    const result = searchPostSlugs(searchIndex, 'Body content', 'en');
    assert.strictEqual(result.size, 3);
  });

  await t.test('finds matches in description', () => {
    const result = searchPostSlugs(searchIndex, 'best practices', 'en');
    assert.strictEqual(result.size, 1);
    assert.ok(result.has('2'));
  });

  await t.test('returns empty set when no matches', () => {
    const result = searchPostSlugs(searchIndex, 'python', 'en');
    assert.strictEqual(result.size, 0);
  });

  await t.test('filters by language', () => {
    const result = searchPostSlugs(searchIndex, 'React', 'zh');
    assert.strictEqual(result.size, 1);
    assert.ok(result.has('1'));
  });
});
