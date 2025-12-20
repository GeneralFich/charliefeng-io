import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, Calendar, Clock, User, Search, X, ArrowUpDown } from 'lucide-react';
import { BLOG_POSTS, BlogPost } from '../lib/knowledge';

// --- Highlight Utilities ---

// Helper to escape regex special characters
function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Function to recursively highlight text in React nodes
const highlightNodes = (nodes: React.ReactNode, query: string): React.ReactNode => {
  if (!query || query.trim() === '') return nodes;

  if (typeof nodes === 'string') {
    const parts = nodes.split(new RegExp(`(${escapeRegExp(query)})`, 'gi'));
    if (parts.length === 1) return nodes;

    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase()
        ? <mark key={i} className="bg-yellow-500/50 text-white rounded-sm px-0.5">{part}</mark>
        : part
    );
  }

  if (Array.isArray(nodes)) {
    return nodes.map((node, i) => <React.Fragment key={i}>{highlightNodes(node, query)}</React.Fragment>);
  }

  if (React.isValidElement(nodes)) {
    return React.cloneElement(nodes as React.ReactElement<any>, {
      children: highlightNodes((nodes.props as any).children, query)
    });
  }

  return nodes;
};

// Component wrapper to apply highlighting
const Highlighter = ({ children, query, as: Component = 'div', ...props }: { children: React.ReactNode, query: string, as?: any, [key: string]: any }) => {
  const highlighted = highlightNodes(children, query);
  return <Component {...props}>{highlighted}</Component>;
};

interface EssaysProps {
  initialSlug?: string | null;
}

type SortOption = 'newest' | 'oldest' | 'shortest' | 'longest';

// Define plugins outside component to maintain reference stability
const MARKDOWN_PLUGINS = [remarkGfm];

export const Essays: React.FC<EssaysProps> = ({ initialSlug }) => {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  React.useEffect(() => {
    if (initialSlug) {
      const post = BLOG_POSTS.find(p => p.slug === initialSlug);
      if (post) {
        setSelectedPost(post);
      }
    }
  }, [initialSlug]);
  const [articleSearchQuery, setArticleSearchQuery] = useState('');

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
          const el = document.getElementById(id);
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
    // Apply highlighter to text blocks
    h1: ({ node, children, ...props }: any) => <Highlighter as="h1" query={articleSearchQuery} className="text-2xl font-bold text-white mt-12 mb-6" {...props}>{children}</Highlighter>,
    h2: ({ node, children, ...props }: any) => <Highlighter as="h2" query={articleSearchQuery} className="text-xl font-bold text-slate-200 mt-10 mb-4" {...props}>{children}</Highlighter>,
    h3: ({ node, children, ...props }: any) => <Highlighter as="h3" query={articleSearchQuery} className="text-lg font-bold text-slate-200 mt-8 mb-3" {...props}>{children}</Highlighter>,
    p: ({ node, children, ...props }: any) => <Highlighter as="p" query={articleSearchQuery} className="text-slate-300 leading-relaxed mb-6" {...props}>{children}</Highlighter>,
    li: ({ node, children, ...props }: any) => <Highlighter as="li" query={articleSearchQuery} className="text-slate-300" {...props}>{children}</Highlighter>,
    blockquote: ({ node, children, ...props }: any) => (
      <blockquote {...props} className="border-l-4 border-blue-500/50 pl-4 italic text-slate-400 my-8">
         {highlightNodes(children, articleSearchQuery)}
      </blockquote>
    ),
  }), [articleSearchQuery]);

  if (selectedPost) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <button
            onClick={() => {
              setSelectedPost(null);
              setArticleSearchQuery('');
            }}
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
              {highlightNodes(selectedPost.attributes.title, articleSearchQuery)}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-blue-400" />
                <time dateTime={selectedPost.attributes.date}>
                  {new Date(selectedPost.attributes.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </time>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-blue-400" />
                <span>{selectedPost.readTime} min read</span>
              </div>
              <div className="flex items-center gap-2">
                <User size={16} className="text-blue-400" />
                <span>{selectedPost.attributes.author}</span>
              </div>
            </div>
          </header>

          <ReactMarkdown
            remarkPlugins={MARKDOWN_PLUGINS}
            components={markdownComponents}
          >
            {selectedPost.body}
          </ReactMarkdown>
        </article>
      </div>
    );
  }

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
              onClick={() => setSelectedPost(post)}
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
