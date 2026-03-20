import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Share2, Check, Clock } from 'lucide-react';
import { BlogPost } from '../lib/knowledge';
import { highlightNodes } from './SearchHighlighter';

interface EssayItemProps {
  post: BlogPost;
  searchRegex: RegExp | null;
  onSelectPost: (post: BlogPost) => void;
}

const TILT_MAX = 5; // maximum degrees of perspective tilt

export const EssayItem: React.FC<EssayItemProps> = React.memo(({ post, searchRegex, onSelectPost }) => {
  const [copiedPostSlug, setCopiedPostSlug] = useState<string | null>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const url = `${window.location.origin}/essays/${post.slug}`;
      await navigator.clipboard.writeText(url);
      setCopiedPostSlug(post.slug);
      setTimeout(() => setCopiedPostSlug(null), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    // rotateX tilts top/bottom, rotateY tilts left/right
    const rx = ((e.clientY - cy) / (rect.height / 2)) * -TILT_MAX;
    const ry = ((e.clientX - cx) / (rect.width  / 2)) *  TILT_MAX;
    setTilt({ x: rx, y: ry });
  };

  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  return (
    // Outer wrapper supplies the perspective context
    <div style={{ perspective: '900px' }}>
      <motion.div
        ref={cardRef}
        onClick={() => onSelectPost(post)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        // Perspective tilt follows the cursor
        animate={{ rotateX: tilt.x, rotateY: tilt.y }}
        // Spring lift + scale on hover
        whileHover={{
          y: -7,
          scale: 1.015,
          boxShadow: '0 14px 40px rgba(59,130,246,0.14)',
        }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 280, damping: 22 }}
        className="relative group flex flex-col h-full p-6 rounded-xl bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-blue-500/30 transition-colors duration-300 text-left cursor-pointer"
      >
        <div className="flex-1">
          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap mb-3">
              {post.tags.map(tag => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors pr-10 leading-snug">
            <button
              onClick={(e) => { e.stopPropagation(); onSelectPost(post); }}
              className="text-left w-full focus:outline-none focus:underline"
            >
              {highlightNodes(post.attributes.title, searchRegex)}
            </button>
          </h3>

          {/* Description */}
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 mb-4">
            {highlightNodes(post.attributes.description, searchRegex)}
          </p>
        </div>

        {/* Meta row pinned to bottom */}
        <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500 mt-auto pt-3 border-t border-slate-100 dark:border-slate-800/50">
          <time dateTime={post.attributes.date}>
            {new Date(post.attributes.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </time>
          <span className="text-slate-300 dark:text-slate-700">&middot;</span>
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {post.readTime} min read
          </span>
        </div>

        {/* Share button */}
        <motion.button
          onClick={handleShare}
          onKeyDown={(e) => e.stopPropagation()}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 500, damping: 26 }}
          className="absolute top-6 right-6 p-2 bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg opacity-0 group-hover:opacity-100 focus:opacity-100 transition-colors"
          title={copiedPostSlug === post.slug ? 'Copied!' : 'Copy link'}
          aria-label={copiedPostSlug === post.slug ? 'Link copied to clipboard' : 'Copy link to clipboard'}
        >
          {copiedPostSlug === post.slug
            ? <Check size={16} className="text-green-400" />
            : <Share2 size={16} />
          }
        </motion.button>
      </motion.div>
    </div>
  );
});

EssayItem.displayName = 'EssayItem';
