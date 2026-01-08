import { BlogPost } from './knowledge';
import { SortOption } from '../types';

/**
 * Filters and sorts blog posts based on a search query and sort option.
 *
 * @param posts The list of blog posts to filter and sort.
 * @param query The search query string.
 * @param sortBy The sort option.
 * @returns A new array of filtered and sorted blog posts.
 */
export function filterAndSortEssays(
  posts: BlogPost[],
  query: string,
  sortBy: SortOption
): BlogPost[] {
  let filtered = posts;

  if (query) {
    const lowerQuery = query.toLowerCase();
    filtered = filtered.filter(post => post.searchContent.includes(lowerQuery));
  }

  // Optimization: BLOG_POSTS is typically already sorted by newest (descending date).
  // However, we shouldn't assume 'posts' passed in is always sorted that way if we want a pure function.
  // But strictly adhering to the original logic:

  switch (sortBy) {
    case 'newest':
      // Ensure we are returning a new array if we didn't filter, to avoid mutation surprises later
      // although filter returns a new array.
      // If no query, 'filtered' is 'posts'.
      // If we want to guarantee 'newest' sort order regardless of input:
      // return [...filtered].sort((a, b) => new Date(b.attributes.date).getTime() - new Date(a.attributes.date).getTime());

      // But the original logic assumed input was sorted by newest.
      // "Optimization: BLOG_POSTS is already sorted by newest"
      // To be safe as a utility, we should probably just return it if we trust the source,
      // OR we explicitly sort it to be robust.
      // Let's stick to the original logic for now, but safer:
      return filtered === posts ? [...filtered] : filtered;

    case 'oldest':
      // Original logic: return [...posts].reverse();
      // This assumes input is newest-first.
      // A robust utility should sort explicitly.
      // return [...filtered].sort((a, b) => new Date(a.attributes.date).getTime() - new Date(b.attributes.date).getTime());
      // Let's stick to the simpler reverse if we document the assumption,
      // OR better: let's make it robust. "Prism" improves quality.
      // Explicit sorting is O(N log N) vs O(N) for reverse.
      // Given N is small (<100), explicit sort is fine and safer.

      // Actually, looking at `lib/knowledge.ts`, BLOG_POSTS is sorted by date.
      // But if we filter, the order is preserved.
      // So reverse() is valid IF the input is guaranteed sorted.
      // BUT if we want a generic utility, we should probably sort.

      // Let's look at `readTime`.

      // I will implement explicit sorting to be safe. It removes the "assumption" debt.
      return [...filtered].sort((a, b) => new Date(a.attributes.date).getTime() - new Date(b.attributes.date).getTime());

    case 'shortest':
      return [...filtered].sort((a, b) => a.readTime - b.readTime);

    case 'longest':
      return [...filtered].sort((a, b) => b.readTime - a.readTime);

    default:
      return filtered === posts ? [...filtered] : filtered;
  }
}
