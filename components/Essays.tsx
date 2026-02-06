import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { BlogPostMetadata, getPosts } from '../lib/knowledge';
import { EssayList } from './EssayList';
import { SortOption } from '../types';
import { EssayDetail } from './EssayDetail';
import { useDebounce } from '../hooks/useDebounce';
import { filterAndSortEssays, BlogSearchEntry } from '../lib/essay_logic';
import { useLanguage } from '../lib/i18n/LanguageContext';

interface EssaysProps {
  initialSlug?: string | null;
  isInsideSplitView?: boolean;
}

export const Essays: React.FC<EssaysProps> = ({ initialSlug, isInsideSplitView }) => {
  const { language } = useLanguage();
  const posts = useMemo(() => getPosts(language), [language]);

  const [selectedPost, setSelectedPost] = useState<BlogPostMetadata | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const [searchIndex, setSearchIndex] = useState<BlogSearchEntry[] | undefined>(undefined);

  useEffect(() => {
    // Lazy load the search index
    import('../lib/blog_search_index.json')
      .then(mod => {
        setSearchIndex(mod.default as BlogSearchEntry[]);
      })
      .catch(err => console.error("Failed to load search index", err));
  }, []);

  // Debounce the search query to avoid filtering and re-rendering the list
  // on every keystroke. This improves performance for fast typists.
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Handle initial slug prop
  React.useEffect(() => {
    if (initialSlug) {
      const post = posts.find(p => p.slug === initialSlug);
      if (post) {
        setSelectedPost(post);
      }
    }
  }, [initialSlug, posts]);

  // Filter and sort posts for the main list
  // Kept in parent to preserve context for navigation between posts
  // Depends on debouncedSearchQuery instead of searchQuery
  const filteredPosts = useMemo(() => {
    return filterAndSortEssays(posts, debouncedSearchQuery, sortBy, searchIndex);
  }, [debouncedSearchQuery, sortBy, posts, searchIndex]);

  // Helper to update URL silently without triggering a reload
  const updateUrl = useCallback((slug?: string) => {
    const url = new URL(window.location.href);
    if (slug) {
      url.searchParams.set('essay', slug);
    } else {
      url.searchParams.delete('essay');
    }
    window.history.pushState({}, '', url.toString());
  }, []);

  const handleSelectPost = useCallback((post: BlogPostMetadata) => {
    setSelectedPost(post);
    updateUrl(post.slug);
  }, [updateUrl]);

  const handleBack = useCallback(() => {
    setSelectedPost(null);
    updateUrl(undefined);
  }, [updateUrl]);

  const handleNavigate = useCallback((post: BlogPostMetadata) => {
    setSelectedPost(post);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    updateUrl(post.slug);
  }, [updateUrl]);

  if (selectedPost) {
    return (
      <EssayDetail
        post={selectedPost}
        filteredPosts={filteredPosts}
        onBack={handleBack}
        onNavigate={handleNavigate}
        isInsideSplitView={isInsideSplitView}
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
      isInsideSplitView={isInsideSplitView}
    />
  );
};
