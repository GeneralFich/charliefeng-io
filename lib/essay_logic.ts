import { BlogPost } from './knowledge';
import { SortOption } from '../types';

/**
 * Filters and sorts a list of blog posts based on a search query, active tags, and sort option.
 *
 * @param posts - The list of blog posts to filter and sort.
 * @param searchQuery - The search query string.
 * @param sortBy - The sort option ('newest', 'oldest', 'shortest', 'longest').
 * @param activeTags - Optional set of active tag filters.
 * @returns The filtered and sorted list of blog posts.
 */
export function filterAndSortEssays(
  posts: BlogPost[],
  searchQuery: string,
  sortBy: SortOption,
  activeTags?: Set<string>
): BlogPost[] {
  let filteredPosts = posts;
  // Track if we have created a new array (via filter) that we can safely mutate
  let isMutable = false;

  // Tag filtering
  if (activeTags && activeTags.size > 0) {
    filteredPosts = filteredPosts.filter(post =>
      post.tags.some(tag => activeTags.has(tag))
    );
    isMutable = true;
  }

  if (searchQuery) {
    // Optimization: Use RegExp with 'i' flag to avoid creating lowercased copies of content
    // Escape special regex characters to treat the query as a literal string
    const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedQuery, 'i');

    filteredPosts = filteredPosts.filter(post =>
      regex.test(post.attributes.title) ||
      regex.test(post.attributes.description) ||
      regex.test(post.body)
    );
    isMutable = true;
  }

  // Optimization: posts is assumed to be sorted by newest (descending date) initially.
  // This assumption comes from lib/knowledge.ts where the blog posts are sorted during discovery.
  switch (sortBy) {
    case 'newest':
      return filteredPosts;
    case 'oldest':
      // Reverse is faster than sorting, and posts is already sorted by newest
      // If we already possess a mutable array (from filter), reverse in place to avoid copying
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
 * Extracts all unique tags from a list of blog posts.
 */
export function getAllTags(posts: BlogPost[]): string[] {
  const tagSet = new Set<string>();
  for (const post of posts) {
    for (const tag of post.tags) {
      tagSet.add(tag);
    }
  }
  return Array.from(tagSet).sort();
}

/**
 * Internal cache for slug-to-post mapping to optimize getRelatedPosts.
 * Using WeakMap to avoid memory leaks when allPosts array is garbage collected.
 */
const relatedPostsCache = new WeakMap<BlogPost[], Map<string, BlogPost>>();

/**
 * Gets related posts for a given post, based on relatedSlugs metadata.
 */
export function getRelatedPosts(post: BlogPost, allPosts: BlogPost[]): BlogPost[] {
  if (post.relatedSlugs.length === 0) return [];

  let postMap = relatedPostsCache.get(allPosts);
  if (!postMap) {
    postMap = new Map(allPosts.map(p => [p.slug, p]));
    relatedPostsCache.set(allPosts, postMap);
  }

  return post.relatedSlugs
    .map(slug => postMap!.get(slug))
    .filter((p): p is BlogPost => p !== undefined);
}
