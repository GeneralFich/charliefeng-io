import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeKatex from 'rehype-katex';
import { ArrowLeft, ArrowRight, Calendar, Clock, User, Search, X, Share2, Download, Check, ChevronUp, ChevronDown, BookOpen } from 'lucide-react';
import { BlogPost } from '../lib/knowledge';
import { highlightNodes, HighlightContext } from './SearchHighlighter';
import { TableOfContents } from './TableOfContents';
import { useArticleSearch } from '../hooks/useArticleSearch';
import { ESSAY_MARKDOWN_COMPONENTS } from './EssayMarkdownComponents';
import { getRelatedPosts } from '../lib/essay_logic';
import { useLanguage } from '../lib/i18n/LanguageContext';

interface EssayDetailProps {
  post: BlogPost;
  allPosts: BlogPost[];
  filteredPosts: BlogPost[];
  onBack: () => void;
  onNavigate: (post: BlogPost) => void;
  isInsideSplitView?: boolean;
}

// Define plugins outside component to maintain reference stability.
// singleDollarTextMath: false — only $$...$$ triggers math rendering,
// so bare currency like "$30" or "$2" is treated as plain text.
const MARKDOWN_PLUGINS = [remarkGfm, [remarkMath, { singleDollarTextMath: false }]];
const REHYPE_PLUGINS = [
  [rehypeSanitize, {
    ...defaultSchema,
    attributes: {
      ...defaultSchema.attributes,
      // Allow className on spans and divs so KaTeX can find them
      span: [
        ...(defaultSchema.attributes?.span || []),
        ['className', 'math-inline', 'math-display', 'katex']
      ],
      div: [
        ...(defaultSchema.attributes?.div || []),
        ['className', 'math-inline', 'math-display', 'katex']
      ]
    }
  }],
  rehypeKatex
];

export const EssayDetail: React.FC<EssayDetailProps> = ({
  post,
  allPosts,
  filteredPosts,
  onBack,
  onNavigate,
  isInsideSplitView
}) => {
  const { t } = useLanguage();
  const [isCopied, setIsCopied] = useState(false);

  const {
    articleSearchQuery,
    setArticleSearchQuery,
    currentMatchIndex,
    totalMatches,
    articleSearchInputRef,
    articleSearchRegex,
    handleNextMatch,
    handlePrevMatch
  } = useArticleSearch(post.slug);

  const handleShare = async () => {
    try {
      const url = `${window.location.origin}/essays/${post.slug}`;
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  // Memoize the rendered markdown content
  const markdownContent = useMemo(() => (
    <ReactMarkdown
      remarkPlugins={MARKDOWN_PLUGINS}
      rehypePlugins={REHYPE_PLUGINS}
      components={ESSAY_MARKDOWN_COMPONENTS}
    >
      {post.body}
    </ReactMarkdown>
  ), [post]);

  // Related posts
  const relatedPosts = useMemo(() => getRelatedPosts(post, allPosts), [post, allPosts]);

  // Navigation Logic
  const currentIndex = filteredPosts.findIndex(p => p.slug === post.slug);
  const newerPost = currentIndex > 0 ? filteredPosts[currentIndex - 1] : null;
  const olderPost = currentIndex !== -1 && currentIndex < filteredPosts.length - 1 ? filteredPosts[currentIndex + 1] : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in duration-500">
      {/* Print Styles */}
      <style media="print">{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .prose-invert {
            --tw-prose-body: #000 !important;
            --tw-prose-headings: #000 !important;
            --tw-prose-lead: #000 !important;
            --tw-prose-links: #000 !important;
            --tw-prose-bold: #000 !important;
            --tw-prose-counters: #000 !important;
            --tw-prose-bullets: #000 !important;
            --tw-prose-hr: #000 !important;
            --tw-prose-quotes: #000 !important;
            --tw-prose-quote-borders: #000 !important;
            --tw-prose-captions: #000 !important;
            --tw-prose-code: #000 !important;
            --tw-prose-pre-code: #000 !important;
            --tw-prose-pre-bg: #eee !important;
            --tw-prose-th-borders: #000 !important;
            --tw-prose-td-borders: #000 !important;
          }
          article {
              color: black !important;
          }
          /* Attempt to force Recharts text to black */
          .recharts-text {
              fill: #000 !important;
          }
          .recharts-cartesian-grid-horizontal line, .recharts-cartesian-grid-vertical line {
              stroke: #ddd !important;
          }
        }
      `}</style>

      <div className={`sticky ${isInsideSplitView ? 'top-0' : 'top-16'} z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 py-4 mb-8 border-b border-slate-200 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden`}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setArticleSearchQuery('');
              onBack();
            }}
            className="group flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors w-fit"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">{t.essays.back}</span>
          </button>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* Print / Download PDF */}
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 hover:border-blue-500/50 hover:text-blue-600 dark:hover:text-blue-400 text-slate-500 dark:text-slate-400 rounded-lg transition-all text-sm hidden sm:flex"
            title={t.actions.downloadPdf}
            aria-label={t.actions.downloadPdf}
          >
            <Download size={14} />
            <span>PDF</span>
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 hover:border-blue-500/50 hover:text-blue-600 dark:hover:text-blue-400 text-slate-500 dark:text-slate-400 rounded-lg transition-all text-sm group"
            title={t.actions.share}
            aria-label={isCopied ? t.actions.copied : t.actions.share}
          >
            {isCopied ? <Check size={14} className="text-green-400" /> : <Share2 size={14} />}
            <span className={isCopied ? 'text-green-400' : ''}>{isCopied ? t.actions.copied : t.actions.share}</span>
          </button>

          {/* In-Article Search */}
          <div className="relative group flex-1 md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={14} className="text-slate-400 group-focus-within:text-blue-400 transition-colors" />
            </div>

            <input
              ref={articleSearchInputRef}
              type="text"
              placeholder={`${t.essays.findInEssay} (⌘K)`}
              aria-label="Search within article"
              value={articleSearchQuery}
              onChange={(e) => setArticleSearchQuery(e.target.value)}
              // Add right padding to accommodate the controls
              className={`block w-full pl-9 py-1.5 bg-white/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-full text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all ${
                totalMatches > 0 ? 'pr-32' : 'pr-8'
              }`}
            />

            <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1">
              {totalMatches > 0 && (
                <>
                  <span className="text-[10px] text-slate-400 mr-1 select-none font-medium tabular-nums">
                    {currentMatchIndex + 1} / {totalMatches}
                  </span>
                  <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800/50 rounded-md border border-slate-300 dark:border-slate-700/50">
                    <button
                      onClick={handlePrevMatch}
                      className="p-1 hover:bg-slate-700 hover:text-white text-slate-400 transition-colors rounded-l-sm"
                      aria-label="Previous match"
                      title="Previous match"
                    >
                      <ChevronUp size={12} />
                    </button>
                    <div className="w-px h-3 bg-slate-700/50" />
                    <button
                      onClick={handleNextMatch}
                      className="p-1 hover:bg-slate-700 hover:text-white text-slate-400 transition-colors rounded-r-sm"
                      aria-label="Next match"
                      title="Next match"
                    >
                      <ChevronDown size={12} />
                    </button>
                  </div>
                  <div className="w-px h-4 bg-slate-700/50 mx-1" />
                </>
              )}

              {articleSearchQuery && (
                <button
                  onClick={() => {
                    setArticleSearchQuery('');
                    articleSearchInputRef.current?.focus();
                  }}
                  aria-label="Clear search"
                  title="Clear search"
                  className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <article className="prose dark:prose-invert prose-lg max-w-none">
        <header className="mb-10 not-prose border-b border-slate-200 dark:border-slate-800 pb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">
            {highlightNodes(post.attributes.title, articleSearchRegex)}
          </h1>
          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-blue-400" />
              <time dateTime={post.attributes.date}>
                {new Date(post.attributes.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-blue-400" />
              <span>{post.readTime} {t.essays.readTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <User size={16} className="text-blue-400" />
              <span>{post.attributes.author}</span>
            </div>
          </div>
          {post.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap mt-4">
              {post.tags.map(tag => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Table of Contents */}
        <div className="print:hidden">
          <TableOfContents markdown={post.body} />
        </div>

        <HighlightContext.Provider value={articleSearchRegex}>
          {markdownContent}
        </HighlightContext.Provider>
      </article>

      {/* Related Essays */}
      {relatedPosts.length > 0 && (
        <div className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800 print:hidden">
          <div className="flex items-center gap-2 mb-6">
            <BookOpen size={18} className="text-blue-400" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{t.essays.relatedEssays}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {relatedPosts.map(related => (
              <button
                key={related.slug}
                onClick={() => {
                  setArticleSearchQuery('');
                  onNavigate(related);
                }}
                className="group flex flex-col text-left p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-blue-500/30 transition-all"
              >
                {related.tags.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap mb-2">
                    {related.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <span className="text-slate-700 dark:text-slate-200 font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mb-2">
                  {related.attributes.title}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                  <Clock size={11} />
                  {related.readTime} {t.essays.readTime}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Contextual Navigation Footer */}
      <div className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4 print:hidden">
        <div>
          {newerPost && (
            <button
              onClick={() => {
                setArticleSearchQuery('');
                onNavigate(newerPost);
              }}
              className="group flex flex-col items-start text-left w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-blue-500/30 transition-all"
            >
              <div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wider mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                <ArrowLeft size={14} />
                <span>{t.actions.previous}</span>
              </div>
              <span className="text-slate-700 dark:text-slate-200 font-medium group-hover:text-slate-900 dark:group-hover:text-white transition-colors line-clamp-2">
                {newerPost.attributes.title}
              </span>
            </button>
          )}
        </div>

        <div className="flex justify-end">
          {olderPost && (
            <button
              onClick={() => {
                setArticleSearchQuery('');
                onNavigate(olderPost);
              }}
              className="group flex flex-col items-end text-right w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-blue-500/30 transition-all"
            >
              <div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wider mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                <span>{t.actions.next}</span>
                <ArrowRight size={14} />
              </div>
              <span className="text-slate-700 dark:text-slate-200 font-medium group-hover:text-slate-900 dark:group-hover:text-white transition-colors line-clamp-2">
                {olderPost.attributes.title}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
