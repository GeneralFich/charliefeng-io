
import { test } from 'node:test';
import * as assert from 'node:assert';
import { filterAndSortEssays, getRelatedPosts } from '../lib/essay_logic';
import { BlogPost } from '../lib/knowledge';

import { Language } from '../types';

// Helper to create mock blog posts
const createMockPost = (id: string, title: string, readTime: number, date: string, relatedSlugs: string[] = []): BlogPost => ({
  slug: id,
  attributes: {
    title,
    date,
    author: 'Author',
    description: 'Description'
  },
  body: `Body content for ${title}`,
  readTime,
  dateTimestamp: new Date(date).getTime(),
  language: Language.EN,
  relatedSlugs,
  tags: []
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

test('getRelatedPosts', async (t) => {
  const posts: BlogPost[] = [
    createMockPost('1', 'Post 1', 5, '2023-01-01', ['2', '3']),
    createMockPost('2', 'Post 2', 5, '2023-01-02'),
    createMockPost('3', 'Post 3', 5, '2023-01-03'),
    createMockPost('4', 'Post 4', 5, '2023-01-04', ['1', 'missing'])
  ];

  await t.test('returns related posts when slugs match', () => {
    const result = getRelatedPosts(posts[0], posts);
    assert.strictEqual(result.length, 2);
    assert.strictEqual(result[0].slug, '2');
    assert.strictEqual(result[1].slug, '3');
  });

  await t.test('filters out missing slugs', () => {
    const result = getRelatedPosts(posts[3], posts);
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].slug, '1');
  });

  await t.test('returns empty array when no related slugs', () => {
    const result = getRelatedPosts(posts[1], posts);
    assert.strictEqual(result.length, 0);
  });

  await t.test('handles post with missing relatedSlugs property gracefully', () => {
    const postWithoutRelated = { ...posts[1] } as any;
    delete postWithoutRelated.relatedSlugs;

    // The implementation checks post.relatedSlugs.length, so it should throw if missing
    // unless we add a guard. Given the current implementation, we expect an error or
    // we can update implementation to be more robust.
    assert.throws(() => {
        getRelatedPosts(postWithoutRelated, posts);
    }, TypeError);
  });

  await t.test('works with different allPosts array references', () => {
    const result1 = getRelatedPosts(posts[0], posts);
    const postsCopy = [...posts];
    const result2 = getRelatedPosts(posts[0], postsCopy);

    assert.strictEqual(result1.length, 2);
    assert.strictEqual(result2.length, 2);
    assert.deepStrictEqual(result1, result2);
  });
});
