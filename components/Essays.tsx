import React, { useState, useMemo, useCallback } from 'react';
import { BLOG_POSTS, BlogPost } from '../lib/knowledge';
import { EssayList } from './EssayList';
import { SortOption } from '../types';
import { EssayDetail } from './EssayDetail';
import { useDebounce } from '../hooks/useDebounce';
import { filterAndSortEssays } from '../lib/essay_logic';

interface EssaysProps {
  initialSlug?: string | null;
}

export const Essays: React.FC<EssaysProps> = ({ initialSlug }) => {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // Debounce the search query to avoid filtering and re-rendering the list
  // on every keystroke. This improves performance for fast typists.
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Handle initial slug prop
  React.useEffect(() => {
    if (initialSlug) {
      const post = BLOG_POSTS.find(p => p.slug === initialSlug);
      if (post) {
        setSelectedPost(post);
      }
    }
  }, [initialSlug]);

  // Filter and sort posts for the main list
  // Kept in parent to preserve context for navigation between posts
  // Depends on debouncedSearchQuery instead of searchQuery
  const filteredPosts = useMemo(() => {
    return filterAndSortEssays(BLOG_POSTS, debouncedSearchQuery, sortBy);
  }, [debouncedSearchQuery, sortBy]);

  const handleSelectPost = useCallback((post: BlogPost) => {
    setSelectedPost(post);
    // Update URL silently
    const url = new URL(window.location.href);
    url.searchParams.set('essay', post.slug);
    window.history.pushState({}, '', url.toString());
  }, []);

  const handleBack = useCallback(() => {
    setSelectedPost(null);
    // Clear URL param when going back
    const url = new URL(window.location.href);
    url.searchParams.delete('essay');
    window.history.pushState({}, '', url.toString());
  }, []);

  const handleNavigate = useCallback((post: BlogPost) => {
    setSelectedPost(post);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Update URL silently
    const url = new URL(window.location.href);
    url.searchParams.set('essay', post.slug);
    window.history.pushState({}, '', url.toString());
  }, []);

  if (selectedPost) {
    return (
      <EssayDetail
        post={selectedPost}
        filteredPosts={filteredPosts}
        onBack={handleBack}
        onNavigate={handleNavigate}
      />
    );
  }

  return (
    <EssayList
      posts={filteredPosts}
      searchQuery={searchQuery} // Instant for Input
      highlightQuery={debouncedSearchQuery} // Debounced for Highlighting
      onSearchChange={setSearchQuery}
      sortBy={sortBy}
      onSortChange={setSortBy}
      onSelectPost={handleSelectPost}
    />
  );
};
