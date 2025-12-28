import React, { useMemo } from 'react';
import { Search, X, ArrowUpDown } from 'lucide-react';
import { BlogPost, BLOG_POSTS } from '../lib/knowledge';
import { highlightNodes } from './SearchHighlighter';

export type SortOption = 'newest' | 'oldest' | 'shortest' | 'longest';

interface EssayListProps {
  onSelectPost: (post: BlogPost) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
}

export const EssayList: React.FC<EssayListProps> = ({
  onSelectPost,
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy
}) => {
  // Filter and sort posts for the main list
  const filteredPosts = useMemo(() => {
    let posts = BLOG_POSTS;

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      posts = posts.filter(post =>
        post.attributes.title.toLowerCase().includes(lowerQuery) ||
        post.attributes.description.toLowerCase().includes(lowerQuery) ||
        post.body.toLowerCase().includes(lowerQuery)
      );
    }

    return [...posts].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.attributes.date).getTime() - new Date(a.attributes.date).getTime();
        case 'oldest':
          return new Date(a.attributes.date).getTime() - new Date(b.attributes.date).getTime();
        case 'shortest':
          return a.readTime - b.readTime;
        case 'longest':
          return b.readTime - a.readTime;
        default:
          return 0;
      }
    });
  }, [searchQuery, sortBy]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-4">Essays</h2>
          <p className="text-slate-400 text-lg max-w-2xl">
            Thoughts on technology, infrastructure, and the future of AI.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          {/* Sort Dropdown */}
          <div className="relative group w-full md:w-48">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <ArrowUpDown size={16} className="text-slate-400 group-focus-within:text-blue-400 transition-colors" />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
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
              type="text"
              placeholder="Search essays..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-10 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-300"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <button
              key={post.slug}
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
                  {highlightNodes(post.attributes.title, searchQuery)}
                </h3>
                <p className="text-slate-400 leading-relaxed line-clamp-2">
                  {/* Highlight match in description if searching */}
                  {highlightNodes(post.attributes.description, searchQuery)}
                </p>
              </div>
            </button>
          ))
        ) : (
          <div className="text-center py-12 text-slate-400">
            <p>No essays found matching "{searchQuery}"</p>
            <button
              onClick={() => setSearchQuery('')}
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
