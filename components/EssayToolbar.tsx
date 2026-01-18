import React, { useRef, useEffect } from 'react';
import { Search, X, ArrowUpDown } from 'lucide-react';
import { SortOption } from '../types';

interface EssayToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  isInsideSplitView?: boolean;
}

export const EssayToolbar: React.FC<EssayToolbarProps> = ({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  isInsideSplitView
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

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
    <div className={`sticky ${isInsideSplitView ? 'top-0' : 'top-16'} z-40 bg-slate-950/80 backdrop-blur-md py-4 mb-8 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-end gap-4`}>
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
          aria-label="Search essays"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="block w-full pl-10 pr-10 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
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
  );
};
