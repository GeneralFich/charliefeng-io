import { BlogPost } from './knowledge';
import { SortOption } from '../types';

/**
 * Filters and sorts a list of blog posts based on a search query and sort option.
 *
 * @param posts - The list of blog posts to filter and sort.
 * @param searchQuery - The search query string.
 * @param sortBy - The sort option ('newest', 'oldest', 'shortest', 'longest').
 * @returns The filtered and sorted list of blog posts.
 */
export function filterAndSortEssays(
  posts: BlogPost[],
  searchQuery: string,
  sortBy: SortOption
): BlogPost[] {
  let filteredPosts = posts;

  if (searchQuery) {
    const lowerQuery = searchQuery.toLowerCase();
    filteredPosts = filteredPosts.filter(post => post.searchContent.includes(lowerQuery));
  }

  // Optimization: posts is assumed to be sorted by newest (descending date) initially.
  // This assumption comes from lib/knowledge.ts where BLOG_POSTS is sorted.
  switch (sortBy) {
    case 'newest':
      return filteredPosts;
    case 'oldest':
      // Reverse is faster than sorting, and posts is already sorted by newest
      return [...filteredPosts].reverse();
    case 'shortest':
      return [...filteredPosts].sort((a, b) => a.readTime - b.readTime);
    case 'longest':
      return [...filteredPosts].sort((a, b) => b.readTime - a.readTime);
    default:
      return filteredPosts;
  }
}
