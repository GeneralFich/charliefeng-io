import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';
import { BLOG_POSTS, BlogPost } from '../lib/knowledge';

export const Essays: React.FC = () => {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  if (selectedPost) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in duration-500">
        <button
          onClick={() => setSelectedPost(null)}
          className="group flex items-center gap-2 text-slate-400 hover:text-blue-400 mb-8 transition-colors"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Essays</span>
        </button>

        <article className="prose prose-invert prose-lg max-w-none">
          <header className="mb-10 not-prose border-b border-slate-800 pb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight">
              {selectedPost.attributes.title}
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
                <User size={16} className="text-blue-400" />
                <span>{selectedPost.attributes.author}</span>
              </div>
            </div>
          </header>

          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              a: ({ node, ...props }) => (
                <a {...props} className="text-blue-400 hover:text-blue-300 no-underline border-b border-blue-400/30 hover:border-blue-300 transition-colors" target="_blank" rel="noopener noreferrer" />
              ),
              h1: ({ node, ...props }) => <h1 {...props} className="text-2xl font-bold text-white mt-12 mb-6" />,
              h2: ({ node, ...props }) => <h2 {...props} className="text-xl font-bold text-slate-200 mt-10 mb-4" />,
              p: ({ node, ...props }) => <p {...props} className="text-slate-300 leading-relaxed mb-6" />,
              blockquote: ({ node, ...props }) => (
                <blockquote {...props} className="border-l-4 border-blue-500/50 pl-4 italic text-slate-400 my-8" />
              ),
            }}
          >
            {selectedPost.body}
          </ReactMarkdown>
        </article>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-white mb-4">Essays</h2>
        <p className="text-slate-400 text-lg max-w-2xl">
          Thoughts on technology, infrastructure, and the future of AI.
        </p>
      </div>

      <div className="grid gap-6">
        {BLOG_POSTS.map((post) => (
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
              </div>
              <h3 className="text-xl font-bold text-slate-100 mb-3 group-hover:text-blue-400 transition-colors">
                {post.attributes.title}
              </h3>
              <p className="text-slate-400 leading-relaxed line-clamp-2">
                {post.attributes.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
