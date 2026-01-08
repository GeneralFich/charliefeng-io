import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { ArrowLeft, ArrowRight, Calendar, Clock, User, Search, X, Share2, Download, Check, ChevronUp, ChevronDown, Link as LinkIcon, Bookmark } from 'lucide-react';
import { BlogPost } from '../lib/knowledge';
import { SearchHighlighter, highlightNodes, HighlightContext } from './SearchHighlighter';
import { isSafeLink, slugify, extractTextFromReactNode } from '../lib/utils';
import { CodeBlock } from './CodeBlock';
import { WhitepaperCharts } from './WhitepaperCharts';
import { WhitepaperSummary } from './WhitepaperSummary';
import { TableOfContents } from './TableOfContents';
import { View } from '../types';
import { useArticleSearch } from '../hooks/useArticleSearch';

interface EssayDetailProps {
  post: BlogPost;
  filteredPosts: BlogPost[];
  onBack: () => void;
  onNavigate: (post: BlogPost) => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
}

// Define plugins outside component to maintain reference stability
const MARKDOWN_PLUGINS = [remarkGfm];
const REHYPE_PLUGINS = [rehypeSanitize];

export const EssayDetail: React.FC<EssayDetailProps> = ({
  post,
  filteredPosts,
  onBack,
  onNavigate,
  isBookmarked,
  onToggleBookmark
}) => {
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
    // Use current location origin and pathname to support sub-paths
    const url = new URL(window.location.href);
    url.searchParams.set('view', View.ESSAYS);
    url.searchParams.set('essay', post.slug);

    try {
      await navigator.clipboard.writeText(url.toString());
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  // Reusable header component to inject IDs and "Copy Link" behavior
  const Heading = ({ level, children, className, ...props }: any) => {
    const text = extractTextFromReactNode(children);
    const id = slugify(text);
    const [justCopied, setJustCopied] = useState(false);

    const handleCopyLink = async (e: React.MouseEvent) => {
      e.preventDefault();
      const url = new URL(window.location.href);
      url.hash = id;
      await navigator.clipboard.writeText(url.toString());
      setJustCopied(true);
      setTimeout(() => setJustCopied(false), 2000);

      // Also scroll to it
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    return (
      <SearchHighlighter
        as={level}
        id={id}
        className={`${className} group relative scroll-mt-24`}
        {...props}
      >
        <span className="relative z-10">{children}</span>
        <a
          href={`#${id}`}
          onClick={handleCopyLink}
          className="ml-2 inline-flex items-center opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 text-slate-500 hover:text-blue-400"
          aria-label="Copy link to section"
          title="Copy link to section"
        >
           {justCopied ? <Check size={16} className="text-green-400" /> : <LinkIcon size={16} />}
        </a>
      </SearchHighlighter>
    );
  };

  // Memoize markdown components to prevent unnecessary re-renders
  const markdownComponents = useMemo(() => ({
    // Custom Anchor to handle footnotes and external links
    a: ({ node, href, children, ...props }: any) => {
      // Security: Prevent XSS and open redirects
      const safeHref = href || '';
      if (!isSafeLink(safeHref)) {
        return <span {...props} className="text-slate-400 cursor-not-allowed" title="Link disabled">{children}</span>;
      }

      const isInternal = safeHref.startsWith('#');
      const handleClick = (e: React.MouseEvent) => {
        if (isInternal && safeHref) {
          e.preventDefault();
          const id = safeHref.slice(1);
          let el = document.getElementById(id);
          // Fallback for double-prefixed IDs (remark-gfm + rehype-sanitize conflict)
          if (!el) {
            el = document.getElementById(`user-content-${id}`);
          }
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }
      };

      return (
        <a
          href={safeHref}
          onClick={handleClick}
          className={`text-blue-400 hover:text-blue-300 transition-colors break-words [overflow-wrap:anywhere] ${!isInternal ? 'no-underline border-b border-blue-400/30 hover:border-blue-300' : ''}`}
          target={isInternal ? undefined : "_blank"}
          rel={isInternal ? undefined : "noopener noreferrer"}
          {...props}
        >
          {children}
        </a>
      );
    },
    // Apply context-aware highlighter to text blocks and auto-generated IDs
    h1: (props: any) => <Heading level="h1" className="text-2xl font-bold text-white mt-12 mb-6" {...props} />,
    h2: (props: any) => <Heading level="h2" className="text-xl font-bold text-slate-200 mt-10 mb-4" {...props} />,
    h3: (props: any) => <Heading level="h3" className="text-lg font-bold text-slate-200 mt-8 mb-3" {...props} />,
    p: ({ node, children, ...props }: any) => <SearchHighlighter as="p" className="text-slate-300 leading-relaxed mb-6" {...props}>{children}</SearchHighlighter>,
    li: ({ node, children, ...props }: any) => <SearchHighlighter as="li" className="text-slate-300" {...props}>{children}</SearchHighlighter>,
    blockquote: ({ node, children, ...props }: any) => (
      <blockquote {...props} className="border-l-4 border-blue-500/50 pl-4 italic text-slate-400 my-8">
        <SearchHighlighter>{children}</SearchHighlighter>
      </blockquote>
    ),
    pre: ({ node, children, ...props }: any) => {
      // Check for infographic in children
      const codeChild = node.children && node.children.length > 0 ? node.children[0] : null;
      const className = codeChild && codeChild.properties ? (codeChild.properties.className || []) : [];
      const classList = Array.isArray(className) ? className : [className];
      const isInfographic = classList.some((c: string) => c.includes('language-infographic'));

      if (isInfographic) {
        return <>{children}</>;
      }

      return <CodeBlock node={node} {...props}>{children}</CodeBlock>;
    },
    code: ({ node, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || '');
      const isInfographic = match && match[1] === 'infographic';

      if (isInfographic) {
        const type = String(children).replace(/\n$/, '').trim();

        // Handle Whitepaper Summary
        if (type === 'whitepaper-summary') {
          return <WhitepaperSummary />;
        }

        // Handle Whitepaper Charts
        if (type === 'whitepaper-charts') {
          return <WhitepaperCharts />;
        }

        // Standard Iframe Infographics
        const src = `/infographics/thermodynamic-wall/${type}.html`;

        // Define heights based on type
        let heightClass = "h-[400px]"; // Default

        if (type === 'collision') {
          heightClass = "h-[600px] md:h-[300px]";
        } else if (type === 'leverage') {
          heightClass = "h-[450px]";
        } else if (type === 'strategy') {
          heightClass = "h-[400px]";
        } else if (type === 'mechanics') {
          heightClass = "h-[400px]";
        }

        return (
          <div className="my-8 rounded-xl overflow-hidden border border-slate-700 bg-slate-950">
            <iframe
              src={src}
              className={`w-full ${heightClass}`}
              style={{ border: 'none' }}
              title={`Infographic: ${type}`}
              loading="lazy"
            />
          </div>
        );
      }

      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
  }), []);

  // Memoize the rendered markdown content
  const markdownContent = useMemo(() => (
    <ReactMarkdown
      remarkPlugins={MARKDOWN_PLUGINS}
      rehypePlugins={REHYPE_PLUGINS}
      components={markdownComponents}
    >
      {post.body}
    </ReactMarkdown>
  ), [post, markdownComponents]);

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

      <div className="sticky top-16 z-40 bg-slate-950/80 backdrop-blur-md -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 py-4 mb-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setArticleSearchQuery('');
              onBack();
            }}
            className="group flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors w-fit"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Essays</span>
          </button>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* Print / Download PDF */}
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/50 border border-slate-700 hover:border-blue-500/50 hover:text-blue-400 text-slate-400 rounded-lg transition-all text-sm hidden sm:flex"
            title="Print or Save as PDF"
            aria-label="Print or Save as PDF"
          >
            <Download size={14} />
            <span>PDF</span>
          </button>

          {/* Bookmark Button */}
          <button
            onClick={onToggleBookmark}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-sm border ${
              isBookmarked
                ? 'bg-blue-500/10 border-blue-500/50 text-blue-400'
                : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:text-blue-400 hover:border-blue-500/50'
            }`}
            title={isBookmarked ? "Remove bookmark" : "Bookmark essay"}
            aria-label={isBookmarked ? "Remove bookmark" : "Bookmark essay"}
          >
            <Bookmark size={14} className={isBookmarked ? "fill-current" : ""} />
            <span>{isBookmarked ? 'Saved' : 'Save'}</span>
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/50 border border-slate-700 hover:border-blue-500/50 hover:text-blue-400 text-slate-400 rounded-lg transition-all text-sm group"
            title="Copy link to clipboard"
            aria-label="Copy link to clipboard"
          >
            {isCopied ? <Check size={14} className="text-green-400" /> : <Share2 size={14} />}
            <span className={isCopied ? 'text-green-400' : ''}>{isCopied ? 'Copied!' : 'Share'}</span>
          </button>

          {/* In-Article Search */}
          <div className="relative group flex-1 md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={14} className="text-slate-400 group-focus-within:text-blue-400 transition-colors" />
            </div>

            <input
              ref={articleSearchInputRef}
              type="text"
              placeholder="Find in essay... (⌘K)"
              aria-label="Search within article"
              value={articleSearchQuery}
              onChange={(e) => setArticleSearchQuery(e.target.value)}
              // Add right padding to accommodate the controls
              className={`block w-full pl-9 py-1.5 bg-slate-900/50 border border-slate-700 rounded-full text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all ${
                totalMatches > 0 ? 'pr-32' : 'pr-8'
              }`}
            />

            <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1">
              {totalMatches > 0 && (
                <>
                  <span className="text-[10px] text-slate-400 mr-1 select-none font-medium tabular-nums">
                    {currentMatchIndex + 1} / {totalMatches}
                  </span>
                  <div className="flex items-center gap-0.5 bg-slate-800/50 rounded-md border border-slate-700/50">
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

      <article className="prose prose-invert prose-lg max-w-none">
        <header className="mb-10 not-prose border-b border-slate-800 pb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight">
            {highlightNodes(post.attributes.title, articleSearchRegex)}
          </h1>
          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400">
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
              <span>{post.readTime} min read</span>
            </div>
            <div className="flex items-center gap-2">
              <User size={16} className="text-blue-400" />
              <span>{post.attributes.author}</span>
            </div>
          </div>
        </header>

        {/* Table of Contents */}
        <div className="print:hidden">
          <TableOfContents markdown={post.body} />
        </div>

        <HighlightContext.Provider value={articleSearchRegex}>
          {markdownContent}
        </HighlightContext.Provider>
      </article>

      {/* Contextual Navigation Footer */}
      <div className="mt-16 pt-8 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4 print:hidden">
        <div>
          {newerPost && (
            <button
              onClick={() => {
                setArticleSearchQuery('');
                onNavigate(newerPost);
              }}
              className="group flex flex-col items-start text-left w-full p-4 rounded-xl border border-slate-800 bg-slate-900/30 hover:bg-slate-800 hover:border-blue-500/30 transition-all"
            >
              <div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wider mb-2 group-hover:text-blue-400 transition-colors">
                <ArrowLeft size={14} />
                <span>Previous</span>
              </div>
              <span className="text-slate-200 font-medium group-hover:text-white transition-colors line-clamp-2">
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
              className="group flex flex-col items-end text-right w-full p-4 rounded-xl border border-slate-800 bg-slate-900/30 hover:bg-slate-800 hover:border-blue-500/30 transition-all"
            >
              <div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wider mb-2 group-hover:text-blue-400 transition-colors">
                <span>Next</span>
                <ArrowRight size={14} />
              </div>
              <span className="text-slate-200 font-medium group-hover:text-white transition-colors line-clamp-2">
                {olderPost.attributes.title}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
