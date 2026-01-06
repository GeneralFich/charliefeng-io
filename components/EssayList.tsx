import React from 'react';
import { Search, SortAsc, SortDesc, BookOpen, Clock, RefreshCw, X } from 'lucide-react';
import { BlogPost } from '../lib/knowledge';
import { EssayItem } from './EssayItem';
import { SortOption } from '../types';

interface EssayListProps {
  posts: BlogPost[];
  searchQuery: string;
  highlightQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  onSelectPost: (post: BlogPost) => void;
}

export const EssayList: React.FC<EssayListProps> = ({
  posts,
  searchQuery,
  highlightQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  onSelectPost
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Focus input on command+k
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        inputRef.current?.blur();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleClearSearch = () => {
    onSearchChange('');
    inputRef.current?.focus();
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-8 min-h-[calc(100vh-64px)]">
      {/* Header & Controls */}
      <div className="space-y-6 sticky top-16 z-40 bg-slate-950/80 backdrop-blur-md py-4 -mx-4 px-4 sm:mx-0 sm:px-0 border-b border-slate-800/50 sm:border-none">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Essays
          </h2>
          <div className="text-sm text-slate-500 font-mono">
            {posts.length} {posts.length === 1 ? 'post' : 'posts'}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
              <Search size={18} />
            </div>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search essays... (Cmd+K)"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              aria-label="Search essays"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                title="Clear search"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="relative min-w-[160px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              {sortBy === 'newest' || sortBy === 'oldest' ? <SortDesc size={18} /> :
               sortBy === 'shortest' || sortBy === 'longest' ? <SortAsc size={18} /> :
               <SortAsc size={18} />}
            </div>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 appearance-none cursor-pointer transition-all hover:bg-slate-800"
              aria-label="Sort essays"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="shortest">Shortest Read</option>
              <option value="longest">Longest Read</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-6">
        {posts.length > 0 ? (
          posts.map(post => (
            <EssayItem
              key={post.slug}
              post={post}
              onSelectPost={onSelectPost}
              searchRegex={highlightQuery ? new RegExp(highlightQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi') : null}
            />
          ))
        ) : (
          <div className="text-center py-20 bg-slate-900/30 rounded-2xl border border-slate-800 border-dashed">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800/50 mb-4">
              <Search size={32} className="text-slate-600" />
            </div>
            <h3 className="text-lg font-medium text-slate-300 mb-2">No essays found</h3>
            <p className="text-slate-500 max-w-sm mx-auto">
              We couldn't find any posts matching "{searchQuery}". Try a different keyword or clear the search.
            </p>
            <button
              onClick={() => onSearchChange('')}
              className="mt-6 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors flex items-center gap-2 mx-auto"
            >
              <RefreshCw size={14} />
              Clear Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
