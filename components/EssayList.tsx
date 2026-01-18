import React, { useMemo } from 'react';
import { BlogPost } from '../lib/knowledge';
import { escapeRegExp } from '../lib/utils';
import { EssayItem } from './EssayItem';
import { EssayToolbar } from './EssayToolbar';
import { SortOption } from '../types';

interface EssayListProps {
  posts: BlogPost[];
  searchQuery: string;
  // Optional debounced query for highlighting to avoid re-calculating regex on every keystroke
  highlightQuery?: string;
  onSearchChange: (query: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  onSelectPost: (post: BlogPost) => void;
  isInsideSplitView?: boolean;
}

export const EssayList: React.FC<EssayListProps> = ({
  posts,
  searchQuery,
  highlightQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  onSelectPost,
  isInsideSplitView
}) => {
  // Use highlightQuery if provided, otherwise fallback to searchQuery
  // This allows the list to highlight based on the debounced value (matching the filtered list)
  // while the input remains responsive
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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">Essays</h2>
        <p className="text-slate-400 text-lg max-w-2xl">
          Thoughts on technology, infrastructure, and the future of AI.
        </p>
      </div>

      <EssayToolbar
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        sortBy={sortBy}
        onSortChange={onSortChange}
        isInsideSplitView={isInsideSplitView}
      />

      <div className="grid gap-6">
        {posts.length > 0 ? (
          posts.map((post) => (
            <EssayItem
              key={post.slug}
              post={post}
              searchRegex={searchRegex}
              onSelectPost={onSelectPost}
            />
          ))
        ) : (
          <div
            className="text-center py-12 text-slate-400"
            role="status"
            aria-live="polite"
          >
            <p>No essays found matching "{searchQuery}"</p>
            <button
              onClick={() => onSearchChange('')}
              className="text-blue-400 hover:text-blue-300 text-sm mt-2"
            >
              Clear search
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
