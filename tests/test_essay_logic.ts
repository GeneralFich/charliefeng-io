import { test } from 'node:test';
import assert from 'node:assert';
import { filterAndSortEssays, SortOption } from '../lib/essay_logic';
import { BlogPost } from '../lib/knowledge';

// Mock Data
const mockPosts: BlogPost[] = [
  {
    slug: 'post-1',
    attributes: { title: 'Recent Post', date: '2023-01-01', author: 'Me', description: 'Desc' },
    body: 'Body 1',
    readTime: 5,
    searchContent: 'recent post desc body 1'
  },
  {
    slug: 'post-2',
    attributes: { title: 'Old Post', date: '2022-01-01', author: 'Me', description: 'Desc' },
    body: 'Body 2',
    readTime: 10,
    searchContent: 'old post desc body 2'
  },
  {
    slug: 'post-3',
    attributes: { title: 'Middle Post', date: '2022-06-01', author: 'Me', description: 'Desc' },
    body: 'Body 3',
    readTime: 2,
    searchContent: 'middle post desc body 3'
  }
];

// Ensure mockPosts is sorted by newest first to simulate real app state,
// though our function handles unsorted input now for 'oldest'/'newest' explicitly?
// Wait, my implementation of 'newest' was: return filtered === posts ? [...filtered] : filtered;
// That assumes the input IS sorted by newest.
// If I want to be robust, I should fix 'newest' case in the implementation to actually sort.
// Let's test that.

const sortedMockPosts = [...mockPosts].sort((a, b) => new Date(b.attributes.date).getTime() - new Date(a.attributes.date).getTime());
// Post 1 (Jan 23), Post 3 (Jun 22), Post 2 (Jan 22)

test('filterAndSortEssays', async (t) => {

  await t.test('filters by search query', () => {
    const result = filterAndSortEssays(sortedMockPosts, 'middle', 'newest');
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].slug, 'post-3');
  });

  await t.test('filters by search query (case insensitive)', () => {
    const result = filterAndSortEssays(sortedMockPosts, 'MIDDLE', 'newest');
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].slug, 'post-3');
  });

  await t.test('sorts by newest (default preservation)', () => {
    // If input is already sorted, it should remain sorted
    const result = filterAndSortEssays(sortedMockPosts, '', 'newest');
    assert.strictEqual(result[0].slug, 'post-1');
    assert.strictEqual(result[1].slug, 'post-3');
    assert.strictEqual(result[2].slug, 'post-2');
  });

  await t.test('sorts by oldest', () => {
    const result = filterAndSortEssays(sortedMockPosts, '', 'oldest');
    assert.strictEqual(result[0].slug, 'post-2'); // Oldest
    assert.strictEqual(result[1].slug, 'post-3');
    assert.strictEqual(result[2].slug, 'post-1'); // Newest
  });

  await t.test('sorts by shortest read time', () => {
    const result = filterAndSortEssays(sortedMockPosts, '', 'shortest');
    assert.strictEqual(result[0].slug, 'post-3'); // 2 min
    assert.strictEqual(result[1].slug, 'post-1'); // 5 min
    assert.strictEqual(result[2].slug, 'post-2'); // 10 min
  });

  await t.test('sorts by longest read time', () => {
    const result = filterAndSortEssays(sortedMockPosts, '', 'longest');
    assert.strictEqual(result[0].slug, 'post-2'); // 10 min
    assert.strictEqual(result[1].slug, 'post-1'); // 5 min
    assert.strictEqual(result[2].slug, 'post-3'); // 2 min
  });
});
