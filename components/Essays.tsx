import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { ArrowLeft, Calendar, Clock, User, Search, X, ArrowUpDown } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { TrendingUp, AlertTriangle, Globe, Layers } from 'lucide-react';
import { BLOG_POSTS, BlogPost } from '../lib/knowledge';
import { SearchHighlighter, highlightNodes, HighlightContext } from './SearchHighlighter';
import { CodeBlock } from './CodeBlock';

// Whitepaper data
const TIMELINE_DATA = [
  { year: '2024', level: 20, stage: 'Generative' },
  { year: '2025', level: 40, stage: 'Teammate Era' },
  { year: '2026', level: 55, stage: 'Teammate Era' },
  { year: '2027', level: 75, stage: 'Weak AGI' },
  { year: '2028', level: 85, stage: 'Weak AGI' },
  { year: '2029', level: 95, stage: 'Robust AGI' },
  { year: '2030', level: 100, stage: 'Robust AGI' },
];

const RISK_DATA = [
  { name: 'Translation', risk: 90, fill: '#ef4444' },
  { name: 'Admin', risk: 80, fill: '#f97316' },
  { name: 'Coding', risk: 50, fill: '#eab308' },
  { name: 'Trades', risk: 10, fill: '#22c55e' },
  { name: 'Nursing', risk: 5, fill: '#3b82f6' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 p-3 rounded shadow-xl">
        <p className="text-slate-200 font-bold mb-1">{label}</p>
        <p className="text-blue-400 text-sm">
          {payload[0].value}% Impact
        </p>
        {payload[0].payload.stage && (
          <p className="text-slate-400 text-xs mt-1 uppercase tracking-wider">
            {payload[0].payload.stage}
          </p>
        )}
      </div>
    );
  }
  return null;
};

interface EssaysProps {
  initialSlug?: string | null;
}

type SortOption = 'newest' | 'oldest' | 'shortest' | 'longest';

// Define plugins outside component to maintain reference stability
const MARKDOWN_PLUGINS = [remarkGfm];
const REHYPE_PLUGINS = [rehypeSanitize];

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
  // Now completely stable as it doesn't depend on articleSearchQuery
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
          return (
            <div className="not-prose mb-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl hover:border-slate-700 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Calendar className="text-blue-400" size={20} />
                  </div>
                  <div className="text-sm text-slate-500 font-medium uppercase tracking-wider">Arrival Consensus</div>
                </div>
                <div className="text-3xl font-bold text-white mb-1">2030</div>
                <div className="text-sm text-slate-400">Most likely year for Robust AGI</div>
              </div>

              <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl hover:border-slate-700 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <Globe className="text-green-400" size={20} />
                  </div>
                  <div className="text-sm text-slate-500 font-medium uppercase tracking-wider">Economic Impact</div>
                </div>
                <div className="text-3xl font-bold text-white mb-1">$13 Trillion</div>
                <div className="text-sm text-slate-400">Global GDP boost by 2030</div>
              </div>

              <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl hover:border-slate-700 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-amber-500/10 rounded-lg">
                    <AlertTriangle className="text-amber-400" size={20} />
                  </div>
                  <div className="text-sm text-slate-500 font-medium uppercase tracking-wider">Near-Term Risk</div>
                </div>
                <div className="text-3xl font-bold text-white mb-1">25%</div>
                <div className="text-sm text-slate-400">Probability of AGI by 2027</div>
              </div>

              <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl hover:border-slate-700 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Layers className="text-purple-400" size={20} />
                  </div>
                  <div className="text-sm text-slate-500 font-medium uppercase tracking-wider">Labor Shift</div>
                </div>
                <div className="text-2xl font-bold text-white mb-1">Unbundling</div>
                <div className="text-sm text-slate-400">Jobs split into agentic tasks</div>
              </div>
            </div>
          );
        }

        // Handle Whitepaper Charts
        if (type === 'whitepaper-charts') {
          return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 my-12">
              {/* Chart 1: AGI Timeline */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-lg font-medium text-slate-200 mb-2 flex items-center gap-2">
                  <TrendingUp size={18} className="text-blue-500" />
                  The Consensus Timeline
                </h3>
                <p className="text-sm text-slate-500 mb-6">
                  Aggregated forecast of AGI capability progression (0-100 scale).
                </p>
                <div className="h-[300px] w-full min-w-0">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <AreaChart data={TIMELINE_DATA}>
                      <defs>
                        <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis
                        dataKey="year"
                        stroke="#475569"
                        tick={{ fill: '#475569', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis hide />
                      <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#3b82f6', strokeWidth: 1 }} />
                      <Area
                        type="monotone"
                        dataKey="level"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorLevel)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Job Risk */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-lg font-medium text-slate-200 mb-2 flex items-center gap-2">
                  <AlertTriangle size={18} className="text-red-500" />
                  Sector Vulnerability Index
                </h3>
                <p className="text-sm text-slate-500 mb-6">
                   Relative risk of displacement due to agentic automation.
                </p>
                <div className="h-[300px] w-full min-w-0">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <BarChart data={RISK_DATA} layout="vertical" margin={{ left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                      <XAxis type="number" hide />
                      <YAxis
                        dataKey="name"
                        type="category"
                        stroke="#94a3b8"
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        width={80}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        cursor={{ fill: '#1e293b' }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                               <div className="bg-slate-900 border border-slate-700 p-2 rounded text-xs text-white">
                                 Risk Score: {payload[0].value}
                               </div>
                            )
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="risk" radius={[0, 4, 4, 0]} barSize={32}>
                        {RISK_DATA.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} fillOpacity={0.8} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          );
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
  // This ensures the heavy ReactMarkdown component doesn't re-render when only the search query changes
  const markdownContent = useMemo(() => (
    <ReactMarkdown
      remarkPlugins={MARKDOWN_PLUGINS}
      rehypePlugins={REHYPE_PLUGINS}
      components={markdownComponents}
    >
      {selectedPost ? selectedPost.body : ''}
    </ReactMarkdown>
  ), [selectedPost, markdownComponents]);

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

          <HighlightContext.Provider value={articleSearchQuery}>
            {markdownContent}
          </HighlightContext.Provider>
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
