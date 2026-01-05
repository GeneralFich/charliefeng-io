import { useMemo } from 'react';
import { BlogPost } from '../lib/knowledge';
import { SortOption } from '../types';

/**
 * Custom hook to filter and sort blog posts.
 *
 * @param posts The list of blog posts to filter/sort.
 * @param searchQuery The search query string.
 * @param sortBy The sorting criterion.
 * @returns The filtered and sorted list of posts.
 */
export function useFilteredEssays(
  posts: BlogPost[],
  searchQuery: string,
  sortBy: SortOption
) {
  return useMemo(() => {
    let filtered = posts;

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(post => post.searchContent.includes(lowerQuery));
    }

    // Optimization: BLOG_POSTS is already sorted by newest (descending date).
    switch (sortBy) {
      case 'newest':
        return filtered;
      case 'oldest':
        return [...filtered].reverse();
      case 'shortest':
        return [...filtered].sort((a, b) => a.readTime - b.readTime);
      case 'longest':
        return [...filtered].sort((a, b) => b.readTime - a.readTime);
      default:
        return filtered;
    }
  }, [posts, searchQuery, sortBy]);
}
