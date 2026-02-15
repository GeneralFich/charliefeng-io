import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { BlogPostMeta, getPostMetas, getFullPost, getSearchIndex, BlogPost } from '../lib/knowledge';
import { EssayList } from './EssayList';
import { SortOption, View } from '../types';
import { EssayDetail } from './EssayDetail';
import { useDebounce } from '../hooks/useDebounce';
import { filterAndSortEssays, searchPostSlugs } from '../lib/essay_logic';
import { useLanguage } from '../lib/i18n/LanguageContext';

interface EssaysProps {
  slug?: string | null;
  onNavigate: (view: View, slug?: string, hash?: string) => void;
  isInsideSplitView?: boolean;
}

export const Essays: React.FC<EssaysProps> = ({ slug, onNavigate, isInsideSplitView }) => {
  const { language } = useLanguage();
  const posts = useMemo(() => getPostMetas(language), [language]);

  // Lazy-loaded full post for detail view
  const [loadedPost, setLoadedPost] = useState<BlogPost | null>(null);
  const [isLoadingPost, setIsLoadingPost] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // Debounce the search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Async search: matching slugs from the lazy-loaded search index
  const [matchingSlugs, setMatchingSlugs] = useState<Set<string> | null>(null);

  // Load search index and perform search when debounced query changes
  useEffect(() => {
    if (!debouncedSearchQuery.trim()) {
      setMatchingSlugs(null);
      return;
    }

    let cancelled = false;
    (async () => {
      const index = await getSearchIndex();
      if (cancelled) return;
      const slugs = searchPostSlugs(index, debouncedSearchQuery, language);
      setMatchingSlugs(slugs);
    })();

    return () => { cancelled = true; };
  }, [debouncedSearchQuery, language]);

  // Filter and sort posts using matching slugs
  const filteredPosts = useMemo(() => {
    return filterAndSortEssays(posts, matchingSlugs, sortBy);
  }, [matchingSlugs, sortBy, posts]);

  // Load full post content when slug changes
  useEffect(() => {
    if (!slug) {
      setLoadedPost(null);
      return;
    }

    let cancelled = false;
    setIsLoadingPost(true);

    (async () => {
      const fullPost = await getFullPost(slug, language);
      if (cancelled) return;
      setLoadedPost(fullPost);
      setIsLoadingPost(false);
    })();

    return () => { cancelled = true; };
  }, [slug, language]);

  const handleSelectPost = useCallback((post: BlogPostMeta) => {
    onNavigate(View.ESSAYS, post.slug);
  }, [onNavigate]);

  const handleBack = useCallback(() => {
    onNavigate(View.ESSAYS, undefined);
  }, [onNavigate]);

  const handleNavigate = useCallback((post: BlogPostMeta) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    onNavigate(View.ESSAYS, post.slug);
  }, [onNavigate]);

  if (slug) {
    if (isLoadingPost || !loadedPost) {
      return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in duration-500">
          <div className="flex items-center justify-center py-24">
            <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      );
    }

    return (
      <EssayDetail
        post={loadedPost}
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
      searchQuery={searchQuery}
      highlightQuery={debouncedSearchQuery}
      onSearchChange={setSearchQuery}
      sortBy={sortBy}
      onSortChange={setSortBy}
      onSelectPost={handleSelectPost}
      isInsideSplitView={isInsideSplitView}
    />
  );
};
