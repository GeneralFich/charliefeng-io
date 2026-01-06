import React, { useState, useCallback } from 'react';
import { BLOG_POSTS, BlogPost } from '../lib/knowledge';
import { EssayList } from './EssayList';
import { EssayDetail } from './EssayDetail';
import { useFilteredEssays } from '../hooks/useFilteredEssays';

interface EssaysProps {
  initialSlug?: string | null;
}

export const Essays: React.FC<EssaysProps> = ({ initialSlug }) => {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  // Use the custom hook for filtering and sorting logic
  const {
    filteredPosts,
    searchQuery,
    setSearchQuery,
    debouncedSearchQuery,
    sortBy,
    setSortBy
  } = useFilteredEssays(BLOG_POSTS);

  // Handle initial slug prop
  React.useEffect(() => {
    if (initialSlug) {
      const post = BLOG_POSTS.find(p => p.slug === initialSlug);
      if (post) {
        setSelectedPost(post);
      }
    }
  }, [initialSlug]);

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
