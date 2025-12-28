import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { ArrowLeft, ArrowRight, Calendar, Clock, User, Search, X } from 'lucide-react';
import { BlogPost, BLOG_POSTS } from '../lib/knowledge';
import { SearchHighlighter, highlightNodes, HighlightContext } from './SearchHighlighter';
import { CodeBlock } from './CodeBlock';
import { WhitepaperCharts } from './WhitepaperCharts';
import { WhitepaperSummary } from './WhitepaperSummary';

interface EssayDetailProps {
  post: BlogPost;
  onBack: () => void;
  onNavigate: (post: BlogPost) => void;
}

// Define plugins outside component to maintain reference stability
const MARKDOWN_PLUGINS = [remarkGfm];
const REHYPE_PLUGINS = [rehypeSanitize];

export const EssayDetail: React.FC<EssayDetailProps> = ({ post, onBack, onNavigate }) => {
  const [articleSearchQuery, setArticleSearchQuery] = useState('');

  // Memoize markdown components to prevent unnecessary re-renders
  const markdownComponents = useMemo(() => ({
    // Custom Anchor to handle footnotes and external links
    a: ({ node, href, children, ...props }: any) => {
      // Security: Prevent XSS via malicious links (e.g. javascript:)
      const safeHref = href || '';
      const isSafe = safeHref.startsWith('http') || safeHref.startsWith('mailto') || safeHref.startsWith('/') || safeHref.startsWith('#');

      if (!isSafe) {
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
    // Apply context-aware highlighter to text blocks
    h1: ({ node, children, ...props }: any) => <SearchHighlighter as="h1" className="text-2xl font-bold text-white mt-12 mb-6" {...props}>{children}</SearchHighlighter>,
    h2: ({ node, children, ...props }: any) => <SearchHighlighter as="h2" className="text-xl font-bold text-slate-200 mt-10 mb-4" {...props}>{children}</SearchHighlighter>,
    h3: ({ node, children, ...props }: any) => <SearchHighlighter as="h3" className="text-lg font-bold text-slate-200 mt-8 mb-3" {...props}>{children}</SearchHighlighter>,
    p: ({ node, children, ...props }: any) => <SearchHighlighter as="p" className="text-slate-300 leading-relaxed mb-6" {...props}>{children}</SearchHighlighter>,
    li: ({ node, children, ...props }: any) => <SearchHighlighter as="li" className="text-slate-300" {...props}>{children}</SearchHighlighter>,
    blockquote: ({ node, children, ...props }: any) => (
      <blockquote {...props} className="border-l-4 border-blue-500/50 pl-4 italic text-slate-400 my-8">
         <SearchHighlighter>{children}</SearchHighlighter>
      </blockquote>
    ),
    pre: ({ node, children, ...props }: any) => {
      // Check for infographic in children
      // The structure is typically pre > code.language-infographic
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
  ), [post.body, markdownComponents]);

  // Contextual Navigation Logic
  // We need to know the *current sorted order* of essays to provide correct Next/Prev buttons.
  // However, since we don't have the sort state here, we'll default to the BLOG_POSTS order (Newest First).
  // If we wanted to preserve the list sort order, we'd need to pass the sorted list as a prop.
  // For simplicity and standard UX, article navigation usually follows chronological order.

  const currentIndex = BLOG_POSTS.findIndex(p => p.slug === post.slug);
  const newerPost = currentIndex > 0 ? BLOG_POSTS[currentIndex - 1] : null;
  const olderPost = currentIndex !== -1 && currentIndex < BLOG_POSTS.length - 1 ? BLOG_POSTS[currentIndex + 1] : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <button
          onClick={onBack}
          className="group flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors w-fit"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Essays</span>
        </button>

        {/* In-Article Search */}
        <div className="relative group w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={14} className="text-slate-400 group-focus-within:text-blue-400 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Find in essay..."
            value={articleSearchQuery}
            onChange={(e) => setArticleSearchQuery(e.target.value)}
            className="block w-full pl-9 pr-8 py-1.5 bg-slate-900/50 border border-slate-700 rounded-full text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
          />
          {articleSearchQuery && (
            <button
              onClick={() => setArticleSearchQuery('')}
              aria-label="Clear search"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-300"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <article className="prose prose-invert prose-lg max-w-none">
        <header className="mb-10 not-prose border-b border-slate-800 pb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight">
            {highlightNodes(post.attributes.title, articleSearchQuery)}
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

        <HighlightContext.Provider value={articleSearchQuery}>
          {markdownContent}
        </HighlightContext.Provider>
      </article>

      {/* Contextual Navigation Footer */}
      <div className="mt-16 pt-8 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          {newerPost && (
            <button
              onClick={() => {
                onNavigate(newerPost);
                setArticleSearchQuery('');
                window.scrollTo({ top: 0, behavior: 'smooth' });
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
                onNavigate(olderPost);
                setArticleSearchQuery('');
                window.scrollTo({ top: 0, behavior: 'smooth' });
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
