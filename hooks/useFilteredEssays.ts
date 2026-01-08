import { useMemo } from 'react';
import { BlogPost } from '../lib/knowledge';
import { filterAndSortEssays } from '../lib/essay_logic';
import { SortOption } from '../types';

export function useFilteredEssays(
  posts: BlogPost[],
  query: string,
  sortBy: SortOption
) {
  // We expect the query passed here to be already debounced if performance is a concern,
  // OR the component uses useDebounce.
  // In `Essays.tsx`, it calculates `debouncedSearchQuery` and passes it.

  const filteredPosts = useMemo(() => {
    return filterAndSortEssays(posts, query, sortBy);
  }, [posts, query, sortBy]);

  return filteredPosts;
}
