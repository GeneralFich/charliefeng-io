import React, { useRef, useEffect, useMemo } from 'react';
import { Search, X, ArrowUpDown } from 'lucide-react';
import { BlogPost } from '../lib/knowledge';
import { highlightNodes } from './SearchHighlighter';
import { escapeRegExp } from '../lib/utils';

export type SortOption = 'newest' | 'oldest' | 'shortest' | 'longest';

interface EssayListProps {
  posts: BlogPost[];
  searchQuery: string;
  // Optional debounced query for highlighting to avoid re-calculating regex on every keystroke
  highlightQuery?: string;
  onSearchChange: (query: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  onSelectPost: (post: BlogPost) => void;
}

interface EssayItemProps {
  post: BlogPost;
  searchRegex: RegExp | null;
  onSelectPost: (post: BlogPost) => void;
}

const EssayItem = React.memo(({ post, searchRegex, onSelectPost }: EssayItemProps) => {
  return (
    <button
      onClick={() => onSelectPost(post)}
      className="group flex flex-col md:flex-row gap-6 p-6 rounded-xl bg-slate-900/30 border border-slate-800/50 hover:bg-slate-800/50 hover:border-blue-500/30 transition-all duration-300 text-left"
    >
      <div className="flex-1">
        <div className="flex items-center gap-3 text-xs text-blue-400 mb-3 font-medium uppercase tracking-wider">
          <time dateTime={post.attributes.date}>
            {new Date(post.attributes.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </time>
          <span>•</span>
          <span>{post.readTime} min read</span>
        </div>
        <h3 className="text-xl font-bold text-slate-100 mb-3 group-hover:text-blue-400 transition-colors">
          {/* Highlight match in title if searching */}
          {highlightNodes(post.attributes.title, searchRegex)}
        </h3>
        <p className="text-slate-400 leading-relaxed line-clamp-2">
          {/* Highlight match in description if searching */}
          {highlightNodes(post.attributes.description, searchRegex)}
        </p>
      </div>
    </button>
  );
});

EssayItem.displayName = 'EssayItem';

export const EssayList: React.FC<EssayListProps> = ({
  posts,
  searchQuery,
  highlightQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  onSelectPost
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command/Ctrl + K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }

      // Escape to blur input
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
        <h2 className="text-3xl font-bold text-white mb-4">Essays</h2>
        <p className="text-slate-400 text-lg max-w-2xl">
          Thoughts on technology, infrastructure, and the future of AI.
        </p>
      </div>

      <div className="sticky top-16 z-40 bg-slate-950/80 backdrop-blur-md py-4 mb-8 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-end gap-4">
        {/* Sort Dropdown */}
        <div className="relative group w-full md:w-48">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <ArrowUpDown size={16} className="text-slate-400 group-focus-within:text-blue-400 transition-colors" />
          </div>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="block w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
            aria-label="Sort essays"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="shortest">Shortest Read</option>
            <option value="longest">Longest Read</option>
          </select>
          {/* Custom arrow for select */}
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
            placeholder="Search essays... (⌘K)"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="block w-full pl-10 pr-10 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-300"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

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
          <div className="text-center py-12 text-slate-400">
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
