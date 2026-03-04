import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Clock, ArrowRight, Share2, Check } from 'lucide-react';
import { BlogPost, AccentColor } from '../lib/knowledge';
import { highlightNodes } from './SearchHighlighter';

interface EssayHeroCardProps {
  post: BlogPost;
  searchRegex: RegExp | null;
  onSelectPost: (post: BlogPost) => void;
  index: number;
}

const ACCENT_STYLES: Record<AccentColor, {
  gradient: string;
  border: string;
  tagBg: string;
  tagText: string;
  timeBg: string;
  timeText: string;
  hoverGlow: string;
}> = {
  indigo: {
    gradient: 'from-indigo-500/10 via-transparent to-transparent dark:from-indigo-500/15',
    border: 'border-indigo-200/60 dark:border-indigo-500/20 hover:border-indigo-400/60 dark:hover:border-indigo-400/40',
    tagBg: 'bg-indigo-50 dark:bg-indigo-500/10',
    tagText: 'text-indigo-600 dark:text-indigo-400',
    timeBg: 'bg-indigo-50 dark:bg-indigo-500/10',
    timeText: 'text-indigo-600 dark:text-indigo-400',
    hoverGlow: '0 20px 60px rgba(99,102,241,0.15)',
  },
  emerald: {
    gradient: 'from-emerald-500/10 via-transparent to-transparent dark:from-emerald-500/15',
    border: 'border-emerald-200/60 dark:border-emerald-500/20 hover:border-emerald-400/60 dark:hover:border-emerald-400/40',
    tagBg: 'bg-emerald-50 dark:bg-emerald-500/10',
    tagText: 'text-emerald-600 dark:text-emerald-400',
    timeBg: 'bg-emerald-50 dark:bg-emerald-500/10',
    timeText: 'text-emerald-600 dark:text-emerald-400',
    hoverGlow: '0 20px 60px rgba(16,185,129,0.15)',
  },
  amber: {
    gradient: 'from-amber-500/10 via-transparent to-transparent dark:from-amber-500/15',
    border: 'border-amber-200/60 dark:border-amber-500/20 hover:border-amber-400/60 dark:hover:border-amber-400/40',
    tagBg: 'bg-amber-50 dark:bg-amber-500/10',
    tagText: 'text-amber-600 dark:text-amber-400',
    timeBg: 'bg-amber-50 dark:bg-amber-500/10',
    timeText: 'text-amber-600 dark:text-amber-400',
    hoverGlow: '0 20px 60px rgba(245,158,11,0.15)',
  },
  rose: {
    gradient: 'from-rose-500/10 via-transparent to-transparent dark:from-rose-500/15',
    border: 'border-rose-200/60 dark:border-rose-500/20 hover:border-rose-400/60 dark:hover:border-rose-400/40',
    tagBg: 'bg-rose-50 dark:bg-rose-500/10',
    tagText: 'text-rose-600 dark:text-rose-400',
    timeBg: 'bg-rose-50 dark:bg-rose-500/10',
    timeText: 'text-rose-600 dark:text-rose-400',
    hoverGlow: '0 20px 60px rgba(244,63,94,0.15)',
  },
  cyan: {
    gradient: 'from-cyan-500/10 via-transparent to-transparent dark:from-cyan-500/15',
    border: 'border-cyan-200/60 dark:border-cyan-500/20 hover:border-cyan-400/60 dark:hover:border-cyan-400/40',
    tagBg: 'bg-cyan-50 dark:bg-cyan-500/10',
    tagText: 'text-cyan-600 dark:text-cyan-400',
    timeBg: 'bg-cyan-50 dark:bg-cyan-500/10',
    timeText: 'text-cyan-600 dark:text-cyan-400',
    hoverGlow: '0 20px 60px rgba(6,182,212,0.15)',
  },
  violet: {
    gradient: 'from-violet-500/10 via-transparent to-transparent dark:from-violet-500/15',
    border: 'border-violet-200/60 dark:border-violet-500/20 hover:border-violet-400/60 dark:hover:border-violet-400/40',
    tagBg: 'bg-violet-50 dark:bg-violet-500/10',
    tagText: 'text-violet-600 dark:text-violet-400',
    timeBg: 'bg-violet-50 dark:bg-violet-500/10',
    timeText: 'text-violet-600 dark:text-violet-400',
    hoverGlow: '0 20px 60px rgba(139,92,246,0.15)',
  },
};

const TILT_MAX = 3;

export const EssayHeroCard: React.FC<EssayHeroCardProps> = React.memo(({ post, searchRegex, onSelectPost, index }) => {
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const accent = ACCENT_STYLES[post.accentColor || 'indigo'];

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const url = `${window.location.origin}/essays/${post.slug}`;
      await navigator.clipboard.writeText(url);
      setCopiedSlug(post.slug);
      setTimeout(() => setCopiedSlug(null), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const rx = ((e.clientY - cy) / (rect.height / 2)) * -TILT_MAX;
    const ry = ((e.clientX - cx) / (rect.width / 2)) * TILT_MAX;
    setTilt({ x: rx, y: ry });
  };

  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  return (
    <div style={{ perspective: '1200px' }}>
      <motion.div
        ref={cardRef}
        onClick={() => onSelectPost(post)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        animate={{ rotateX: tilt.x, rotateY: tilt.y }}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ type: 'spring', stiffness: 200, damping: 24, delay: index * 0.1 }}
        whileHover={{
          y: -5,
          scale: 1.01,
          boxShadow: accent.hoverGlow,
        }}
        whileTap={{ scale: 0.985 }}
        className={`relative group p-8 md:p-10 rounded-2xl bg-white dark:bg-slate-900/40 border ${accent.border} cursor-pointer transition-colors duration-300 overflow-hidden`}
      >
        {/* Accent gradient overlay */}
        <div className={`absolute inset-0 bg-gradient-to-br ${accent.gradient} pointer-events-none`} />

        {/* Content */}
        <div className="relative z-10">
          {/* Top row: tags + read time */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2 flex-wrap">
              {post.tags.map(tag => (
                <span
                  key={tag}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${accent.tagBg} ${accent.tagText}`}
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${accent.timeBg} ${accent.timeText}`}>
              <Clock size={12} />
              <span>{post.readTime} min read</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4 leading-tight tracking-tight">
            <button
              onClick={(e) => { e.stopPropagation(); onSelectPost(post); }}
              className="text-left w-full focus:outline-none focus:underline"
            >
              {highlightNodes(post.attributes.title, searchRegex)}
            </button>
          </h3>

          {/* Excerpt - 2-3 lines */}
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base md:text-lg line-clamp-3 mb-6">
            {highlightNodes(post.attributes.description, searchRegex)}
          </p>

          {/* Bottom row: date + read more */}
          <div className="flex items-center justify-between">
            <time
              dateTime={post.attributes.date}
              className="text-sm text-slate-400 dark:text-slate-500"
            >
              {new Date(post.attributes.date).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </time>
            <span className={`flex items-center gap-1.5 text-sm font-medium ${accent.tagText} opacity-0 group-hover:opacity-100 transition-opacity`}>
              Read essay <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </div>

        {/* Share button */}
        <motion.button
          onClick={handleShare}
          onKeyDown={(e) => e.stopPropagation()}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 500, damping: 26 }}
          className="absolute top-8 right-8 md:top-10 md:right-10 p-2 bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg opacity-0 group-hover:opacity-100 focus:opacity-100 transition-colors z-20"
          title={copiedSlug === post.slug ? 'Copied!' : 'Copy link'}
          aria-label={copiedSlug === post.slug ? 'Link copied to clipboard' : 'Copy link to clipboard'}
        >
          {copiedSlug === post.slug
            ? <Check size={16} className="text-green-400" />
            : <Share2 size={16} />
          }
        </motion.button>
      </motion.div>
    </div>
  );
});

EssayHeroCard.displayName = 'EssayHeroCard';
