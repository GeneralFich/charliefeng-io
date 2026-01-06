import { useState, useMemo } from 'react';
import { BLOG_POSTS, BlogPost } from '../lib/knowledge';
import { useDebounce } from './useDebounce';
import { SortOption } from '../types';

export function useFilteredEssays(initialPosts: BlogPost[] = BLOG_POSTS) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const filteredPosts = useMemo(() => {
    let posts = initialPosts;

    if (debouncedSearchQuery) {
      const lowerQuery = debouncedSearchQuery.toLowerCase();
      posts = posts.filter(post => post.searchContent.includes(lowerQuery));
    }

    // Optimization: BLOG_POSTS is already sorted by newest (descending date).
    switch (sortBy) {
      case 'newest':
        return posts;
      case 'oldest':
        // Reverse is faster than sorting, and posts is already sorted by newest
        return [...posts].reverse();
      case 'shortest':
        return [...posts].sort((a, b) => a.readTime - b.readTime);
      case 'longest':
        return [...posts].sort((a, b) => b.readTime - a.readTime);
      default:
        return posts;
    }
  }, [debouncedSearchQuery, sortBy, initialPosts]);

  return {
    filteredPosts,
    searchQuery,
    setSearchQuery,
    debouncedSearchQuery,
    sortBy,
    setSortBy
  };
}
