import React, { useState, useMemo, useCallback } from 'react';
import { BlogPost, getPosts } from '../lib/knowledge';
import { EssayList } from './EssayList';
import { SortOption, View } from '../types';
import { EssayDetail } from './EssayDetail';
import { useDebounce } from '../hooks/useDebounce';
import { filterAndSortEssays } from '../lib/essay_logic';
import { useLanguage } from '../lib/i18n/LanguageContext';

interface EssaysProps {
  slug?: string | null;
  onNavigate: (view: View, slug?: string, hash?: string) => void;
  isInsideSplitView?: boolean;
}

export const Essays: React.FC<EssaysProps> = ({ slug, onNavigate, isInsideSplitView }) => {
  const { language } = useLanguage();
  const posts = useMemo(() => getPosts(language), [language]);

  const selectedPost = useMemo(() => {
    return slug ? posts.find(p => p.slug === slug) || null : null;
  }, [slug, posts]);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // Debounce the search query to avoid filtering and re-rendering the list
  // on every keystroke. This improves performance for fast typists.
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Filter and sort posts for the main list
  // Kept in parent to preserve context for navigation between posts
  // Depends on debouncedSearchQuery instead of searchQuery
  const filteredPosts = useMemo(() => {
    return filterAndSortEssays(posts, debouncedSearchQuery, sortBy);
  }, [debouncedSearchQuery, sortBy, posts]);

  const handleSelectPost = useCallback((post: BlogPost) => {
    onNavigate(View.ESSAYS, post.slug);
  }, [onNavigate]);

  const handleBack = useCallback(() => {
    onNavigate(View.ESSAYS, undefined);
  }, [onNavigate]);

  const handleNavigate = useCallback((post: BlogPost) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    onNavigate(View.ESSAYS, post.slug);
  }, [onNavigate]);

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
