import React, { useRef, useEffect, useMemo } from 'react';
import { Search, X, ArrowUpDown, Tag } from 'lucide-react';
import { BlogPost } from '../lib/knowledge';
import { escapeRegExp } from '../lib/utils';
import { EssayItem } from './EssayItem';
import { EssayHeroCard } from './EssayHeroCard';
import { SortOption } from '../types';
import { useLanguage } from '../lib/i18n/LanguageContext';

interface EssayListProps {
  posts: BlogPost[];
  allPosts: BlogPost[];
  searchQuery: string;
  // Optional debounced query for highlighting to avoid re-calculating regex on every keystroke
  highlightQuery?: string;
  onSearchChange: (query: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  onSelectPost: (post: BlogPost) => void;
  isInsideSplitView?: boolean;
  allTags: string[];
  activeTags: Set<string>;
  onToggleTag: (tag: string) => void;
}

export const EssayList: React.FC<EssayListProps> = ({
  posts,
  allPosts,
  searchQuery,
  highlightQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  onSelectPost,
  isInsideSplitView,
  allTags,
  activeTags,
  onToggleTag,
}) => {
  const { t } = useLanguage();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Use highlightQuery if provided, otherwise fallback to searchQuery
  const queryToHighlight = highlightQuery !== undefined ? highlightQuery : searchQuery;

  // Create regex for main list search (memoized)
  const searchRegex = useMemo(() => {
    if (!queryToHighlight.trim()) return null;
    try {
      return new RegExp(`(${escapeRegExp(queryToHighlight)})`, 'gi');
    } catch {
      return null;
    }
  }, [queryToHighlight]);

  // Split posts into featured heroes and regular cards
  // Only show heroes when no search query and no active tag filters (full browsing mode)
  const isFiltering = !!queryToHighlight.trim() || activeTags.size > 0;

  const featuredPosts = useMemo(() => {
    if (isFiltering) return [];
    return allPosts.filter(p => p.featured).slice(0, 2);
  }, [allPosts, isFiltering]);

  const featuredSlugs = useMemo(() => new Set(featuredPosts.map(p => p.slug)), [featuredPosts]);

  const regularPosts = useMemo(() => {
    if (isFiltering) return posts;
    return posts.filter(p => !featuredSlugs.has(p.slug));
  }, [posts, featuredSlugs, isFiltering]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        if (document.activeElement === searchInputRef.current) {
          searchInputRef.current?.blur();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">{t.nav.essays}</h2>
        <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl">
          {t.essays.subtitle}
        </p>
      </div>

      {/* Sticky toolbar: sort + search */}
      <div className={`sticky ${isInsideSplitView ? 'top-0' : 'top-16'} z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md py-4 mb-6 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 border-b border-slate-200 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-end gap-4`}>
        {/* Sort Dropdown */}
        <div className="relative group w-full md:w-48">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <ArrowUpDown size={16} className="text-slate-400 group-focus-within:text-blue-400 transition-colors" />
          </div>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="block w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
            aria-label="Sort essays"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="shortest">Shortest Read</option>
            <option value="longest">Longest Read</option>
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <div className="border-t-[4px] border-t-slate-500 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent"></div>
          </div>
        </div>

        {/* Global Search */}
        <div className="relative group w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-slate-400 group-focus-within:text-blue-400 transition-colors" />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            placeholder={`${t.essays.searchPlaceholder} (\u2318K)`}
            aria-label="Search essays"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="block w-full pl-10 pr-10 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
              title="Clear search"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-300"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Topic Tag Filters */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap mb-8">
          <Tag size={14} className="text-slate-400 dark:text-slate-500 mr-1" />
          {allTags.map(tag => {
            const isActive = activeTags.has(tag);
            return (
              <button
                key={tag}
                onClick={() => onToggleTag(tag)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                    : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/50'
                }`}
                aria-pressed={isActive}
              >
                {tag}
              </button>
            );
          })}
          {activeTags.size > 0 && (
            <button
              onClick={() => {
                for (const tag of activeTags) onToggleTag(tag);
              }}
              className="px-3 py-1.5 rounded-full text-xs font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              {t.essays.clearSearch}
            </button>
          )}
        </div>
      )}

      {/* Featured Hero Cards */}
      {featuredPosts.length > 0 && (
        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredPosts.map((post, idx) => (
              <EssayHeroCard
                key={post.slug}
                post={post}
                searchRegex={searchRegex}
                onSelectPost={onSelectPost}
                index={idx}
              />
            ))}
          </div>
        </div>
      )}

      {/* Regular Card Grid */}
      {regularPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {regularPosts.map((post) => (
            <EssayItem
              key={post.slug}
              post={post}
              searchRegex={searchRegex}
              onSelectPost={onSelectPost}
            />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div
          className="text-center py-12 text-slate-400"
          role="status"
          aria-live="polite"
        >
          <p>{t.essays.noResults} &quot;{searchQuery}&quot;</p>
          <button
            onClick={() => onSearchChange('')}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 text-sm mt-2"
          >
            {t.essays.clearSearch}
          </button>
        </div>
      ) : null}
    </div>
  );
};
