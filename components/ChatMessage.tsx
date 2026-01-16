import React from 'react';
import { Bot, User, Copy, Check, Calendar } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { Message, View } from '../types';
import { isSafeLink } from '../lib/utils';
import { CodeBlock } from './CodeBlock';

const MARKDOWN_PLUGINS = [remarkGfm];
const REHYPE_PLUGINS = [rehypeSanitize];

// Helper for handling internal links
const handleLinkClick = (href: string, onNavigate?: (view: View, slug?: string) => void) => {
  if (!onNavigate) return false;

  if (href === '/whitepaper' || href === '/dashboard') {
    onNavigate(View.DASHBOARD);
    return true;
  }
  if (href === '/resume' || href === '/about') {
    onNavigate(View.ABOUT);
    return true;
  }
  if (href === '/contact') {
    // Redirect legacy contact links to About page (which has LinkedIn)
    onNavigate(View.ABOUT);
    return true;
  }
  if (href.startsWith('/essays/')) {
    const slug = href.replace('/essays/', '');
    onNavigate(View.ESSAYS, slug);
    return true;
  }
  if (href === '/essays' || href === '/blog') {
    onNavigate(View.ESSAYS);
    return true;
  }
  return false;
};

// Define static components outside to ensure stability
const STATIC_MARKDOWN_COMPONENTS = {
  p: ({node, ...props}: any) => <p className="mb-2 last:mb-0" {...props} />,
  ul: ({node, ...props}: any) => <ul className="list-disc list-outside ml-4 mb-2" {...props} />,
  ol: ({node, ...props}: any) => <ol className="list-decimal list-outside ml-4 mb-2" {...props} />,
  li: ({node, ...props}: any) => <li className="mb-1" {...props} />,
  strong: ({node, ...props}: any) => <strong className="font-bold text-slate-100" {...props} />,
  pre: CodeBlock,
  code: ({node, ...props}: any) => {
    return <code className="bg-slate-800 px-1 py-0.5 rounded text-xs font-mono text-slate-200" {...props} />
  },
  blockquote: ({node, ...props}: any) => <blockquote className="border-l-4 border-slate-600 pl-4 italic text-slate-400 my-2" {...props} />,
  h1: ({node, ...props}: any) => <h1 className="text-lg font-bold mb-2 text-slate-100" {...props} />,
  h2: ({node, ...props}: any) => <h2 className="text-base font-bold mb-2 text-slate-100" {...props} />,
  h3: ({node, ...props}: any) => <h3 className="text-sm font-bold mb-2 text-slate-100" {...props} />,
  table: ({node, ...props}: any) => <div className="overflow-x-auto my-2"><table className="min-w-full divide-y divide-slate-700" {...props} /></div>,
  thead: ({node, ...props}: any) => <thead className="bg-slate-800" {...props} />,
  tbody: ({node, ...props}: any) => <tbody className="divide-y divide-slate-700" {...props} />,
  tr: ({node, ...props}: any) => <tr {...props} />,
  th: ({node, ...props}: any) => <th className="px-3 py-2 text-left text-xs font-medium text-slate-300 uppercase tracking-wider" {...props} />,
  td: ({node, ...props}: any) => <td className="px-3 py-2 whitespace-nowrap text-sm text-slate-300" {...props} />,
};

interface ChatMessageProps {
  message: Message;
  onNavigate?: (view: View, slug?: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = React.memo(({ message, onNavigate }) => {
  const [isCopied, setIsCopied] = React.useState(false);

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy message: ', err);
    }
  };

  // Memoize the components object to prevent re-renders on every token update
  const markdownComponents = React.useMemo(() => ({
    ...STATIC_MARKDOWN_COMPONENTS,
    a: ({node, ...props}: any) => {
      // Security: Prevent XSS via malicious links (e.g. javascript:)
      const href = props.href || '';

      if (!isSafeLink(href)) return <span {...props} title="Link disabled">{props.children}</span>;

      const isInternal = href.startsWith('/') && !href.startsWith('//');

      // Intercept internal links
      const handleClick = (e: React.MouseEvent) => {
        if (isInternal) {
          if (handleLinkClick(href, onNavigate)) {
            e.preventDefault();
          }
        }
      };

      return <a className="text-blue-400 hover:underline cursor-pointer" onClick={handleClick} target={isInternal ? undefined : "_blank"} rel={isInternal ? undefined : "noopener noreferrer"} {...props} />;
    },
  }), [onNavigate]);

  // Handle scheduling token replacement
  const hasSchedulingToken = message.text.includes('[SCHEDULE]');

  // If we have a scheduling token, we need to split the message and render the button
  // We can't easily do this inside ReactMarkdown, so we pre-process or split parts
  const renderContent = () => {
    if (!hasSchedulingToken) {
        return (
            <ReactMarkdown
                remarkPlugins={MARKDOWN_PLUGINS}
                rehypePlugins={REHYPE_PLUGINS}
                components={markdownComponents as any}
            >
                {message.text}
            </ReactMarkdown>
        );
    }

    const parts = message.text.split('[SCHEDULE]');

    return (
        <>
            {parts.map((part, index) => (
                <React.Fragment key={index}>
                    <ReactMarkdown
                        remarkPlugins={MARKDOWN_PLUGINS}
                        rehypePlugins={REHYPE_PLUGINS}
                        components={markdownComponents as any}
                    >
                        {part}
                    </ReactMarkdown>
                    {index < parts.length - 1 && (
                        <div className="my-4">
                            <a
                                href="https://calendly.com/charliefengsq/30min"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors shadow-lg hover:shadow-blue-500/20"
                            >
                                <Calendar size={16} />
                                <span>Schedule a Deep Dive</span>
                            </a>
                        </div>
                    )}
                </React.Fragment>
            ))}
        </>
    );
  };

  return (
    <div
      className={`group flex items-start gap-3 ${
        message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          message.role === 'user' ? 'bg-blue-600' : 'bg-slate-700 border border-slate-600'
        }`}
      >
        {message.role === 'user' ? <User size={16} /> : <Bot size={16} className="text-blue-400" />}
      </div>
      <div
        className={`relative group p-4 rounded-2xl max-w-[80%] text-sm leading-relaxed ${
          message.role === 'user'
            ? 'bg-blue-600/20 border border-blue-500/30 text-blue-100 rounded-tr-sm'
            : 'bg-slate-900/80 border border-slate-800 text-slate-300 rounded-tl-sm shadow-xl'
        }`}
      >
        {/* Copy Button for Model messages */}
        {message.role === 'model' && (
          <button
            onClick={handleCopyMessage}
            className="absolute top-2 right-2 p-1.5 rounded-md text-slate-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-slate-700 hover:text-white focus:opacity-100 bg-slate-800/50 backdrop-blur-sm z-10"
            aria-label={isCopied ? "Copied to clipboard" : "Copy message"}
            title={isCopied ? "Copied to clipboard" : "Copy message"}
          >
            {isCopied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
          </button>
        )}

        {renderContent()}
      </div>
    </div>
  );
});

ChatMessage.displayName = 'ChatMessage';
