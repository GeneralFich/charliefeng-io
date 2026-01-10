import React, { useState } from 'react';
import { Share2, Check, Bookmark } from 'lucide-react';
import { BlogPost } from '../lib/knowledge';
import { highlightNodes } from './SearchHighlighter';
import { View } from '../types';

interface EssayItemProps {
  post: BlogPost;
  searchRegex: RegExp | null;
  isBookmarked: boolean;
  onToggleBookmark: (slug: string) => void;
  onSelectPost: (post: BlogPost) => void;
}

export const EssayItem: React.FC<EssayItemProps> = React.memo(({
  post,
  searchRegex,
  isBookmarked,
  onToggleBookmark,
  onSelectPost
}) => {
  const [copiedPostSlug, setCopiedPostSlug] = useState<string | null>(null);

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleBookmark(post.slug);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('view', View.ESSAYS);
      url.searchParams.set('essay', post.slug);

      await navigator.clipboard.writeText(url.toString());
      setCopiedPostSlug(post.slug);
      setTimeout(() => setCopiedPostSlug(null), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  return (
    <div
      onClick={() => onSelectPost(post)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelectPost(post);
        }
      }}
      className="relative group flex flex-col md:flex-row gap-6 p-6 rounded-xl bg-slate-900/30 border border-slate-800/50 hover:bg-slate-800/50 hover:border-blue-500/30 transition-all duration-300 text-left cursor-pointer"
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
        <h3 className="text-xl font-bold text-slate-100 mb-3 group-hover:text-blue-400 transition-colors pr-12">
          {highlightNodes(post.attributes.title, searchRegex)}
        </h3>
        <p className="text-slate-400 leading-relaxed line-clamp-2">
          {highlightNodes(post.attributes.description, searchRegex)}
        </p>
      </div>

      <div className="absolute top-6 right-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
        <button
          onClick={handleBookmark}
          onKeyDown={(e) => e.stopPropagation()}
          className={`p-2 rounded-lg transition-all ${
            isBookmarked
              ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
              : 'bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-blue-400'
          }`}
          title={isBookmarked ? 'Remove from saved' : 'Save for later'}
          aria-label={isBookmarked ? 'Remove from saved' : 'Save for later'}
        >
          <Bookmark size={16} className={isBookmarked ? 'fill-current' : ''} />
        </button>

        <button
          onClick={handleShare}
          onKeyDown={(e) => e.stopPropagation()}
          className="p-2 bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-blue-400 rounded-lg transition-all"
          title="Copy link"
          aria-label="Copy link to clipboard"
        >
          {copiedPostSlug === post.slug ? <Check size={16} className="text-green-400" /> : <Share2 size={16} />}
        </button>
      </div>
    </div>
  );
});

EssayItem.displayName = 'EssayItem';
