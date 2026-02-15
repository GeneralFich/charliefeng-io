import { BlogPostMeta } from './knowledge';
import { SortOption } from '../types';

/**
 * Filters and sorts a list of blog post metadata based on a search query and sort option.
 *
 * When a search query is provided, matching slugs (determined by the async search) are
 * passed in to filter the metadata list. When no search query is active, all posts are shown.
 *
 * @param posts - The list of blog post metadata to filter and sort.
 * @param matchingSlugs - Set of slugs that match the search query (null = no search active, show all).
 * @param sortBy - The sort option ('newest', 'oldest', 'shortest', 'longest').
 * @returns The filtered and sorted list of blog post metadata.
 */
export function filterAndSortEssays(
  posts: BlogPostMeta[],
  matchingSlugs: Set<string> | null,
  sortBy: SortOption
): BlogPostMeta[] {
  let filteredPosts = posts;
  // Track if we have created a new array (via filter) that we can safely mutate
  let isMutable = false;

  if (matchingSlugs !== null) {
    filteredPosts = filteredPosts.filter(post => matchingSlugs.has(post.slug));
    isMutable = true;
  }

  // Optimization: posts is assumed to be sorted by newest (descending date) initially.
  // This assumption comes from the pre-generated blog_metadata.json.
  switch (sortBy) {
    case 'newest':
      return filteredPosts;
    case 'oldest':
      // Reverse is faster than sorting, and posts is already sorted by newest
      return isMutable ? filteredPosts.reverse() : [...filteredPosts].reverse();
    case 'shortest':
      return isMutable
        ? filteredPosts.sort((a, b) => a.readTime - b.readTime)
        : [...filteredPosts].sort((a, b) => a.readTime - b.readTime);
    case 'longest':
      return isMutable
        ? filteredPosts.sort((a, b) => b.readTime - a.readTime)
        : [...filteredPosts].sort((a, b) => b.readTime - a.readTime);
    default:
      return filteredPosts;
  }
}

/**
 * Searches the search index for posts matching the query.
 * Returns a Set of matching slugs.
 */
export function searchPostSlugs(
  searchIndex: Array<{ slug: string; language: string; title: string; description: string; body: string }>,
  query: string,
  language: string
): Set<string> {
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(escapedQuery, 'i');

  const matchingSlugs = new Set<string>();
  for (const entry of searchIndex) {
    if (entry.language !== language) continue;
    if (regex.test(entry.title) || regex.test(entry.description) || regex.test(entry.body)) {
      matchingSlugs.add(entry.slug);
    }
  }
  return matchingSlugs;
}
