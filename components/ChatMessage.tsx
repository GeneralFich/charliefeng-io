import React from 'react';
import { motion } from 'framer-motion';
import { Bot, User, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { Message, View } from '../types';
import { isSafeLink } from '../lib/utils';
import { CodeBlock } from './CodeBlock';
import { useLanguage } from '../lib/i18n/LanguageContext';

const MARKDOWN_PLUGINS = [remarkGfm];
const REHYPE_PLUGINS   = [rehypeSanitize];

// Helper for handling internal links
const handleLinkClick = (href: string, onNavigate?: (view: View, slug?: string, hash?: string) => void) => {
  if (!onNavigate) return false;

  const parseUrl = (url: string) => {
    const [path, hash] = url.split('#');
    return { path, hash };
  };

  const { path, hash } = parseUrl(href);

  if (path === '/whitepaper' || path === '/dashboard') {
    onNavigate(View.DASHBOARD, undefined, hash);
    return true;
  }
  if (path === '/resume' || path === '/about') {
    onNavigate(View.ABOUT, undefined, hash);
    return true;
  }
  if (path === '/contact') {
    onNavigate(View.ABOUT, undefined, hash);
    return true;
  }
  if (path.startsWith('/essays/')) {
    const slug = path.replace('/essays/', '');
    onNavigate(View.ESSAYS, slug, hash);
    return true;
  }
  if (path === '/essays' || path === '/blog') {
    onNavigate(View.ESSAYS, undefined, hash);
    return true;
  }
  return false;
};

// Define static components outside to ensure stability
const STATIC_MARKDOWN_COMPONENTS = {
  p:          ({node, ...props}: any) => <p className="mb-2 last:mb-0" {...props} />,
  ul:         ({node, ...props}: any) => <ul className="list-disc list-outside ml-4 mb-2" {...props} />,
  ol:         ({node, ...props}: any) => <ol className="list-decimal list-outside ml-4 mb-2" {...props} />,
  li:         ({node, ...props}: any) => <li className="mb-1" {...props} />,
  strong:     ({node, ...props}: any) => <strong className="font-bold text-slate-100" {...props} />,
  pre:        CodeBlock,
  code:       ({node, ...props}: any) => (
    <code className="bg-slate-800 px-1 py-0.5 rounded text-xs font-mono text-slate-200" {...props} />
  ),
  blockquote: ({node, ...props}: any) => (
    <blockquote className="border-l-4 border-slate-600 pl-4 italic text-slate-400 my-2" {...props} />
  ),
  h1: ({node, ...props}: any) => <h1 className="text-lg font-bold mb-2 text-slate-100" {...props} />,
  h2: ({node, ...props}: any) => <h2 className="text-base font-bold mb-2 text-slate-100" {...props} />,
  h3: ({node, ...props}: any) => <h3 className="text-sm font-bold mb-2 text-slate-100" {...props} />,
  table:  ({node, ...props}: any) => <div className="overflow-x-auto my-2"><table className="min-w-full divide-y divide-slate-700" {...props} /></div>,
  thead:  ({node, ...props}: any) => <thead className="bg-slate-800" {...props} />,
  tbody:  ({node, ...props}: any) => <tbody className="divide-y divide-slate-700" {...props} />,
  tr:     ({node, ...props}: any) => <tr {...props} />,
  th:     ({node, ...props}: any) => <th className="px-3 py-2 text-left text-xs font-medium text-slate-300 uppercase tracking-wider" {...props} />,
  td:     ({node, ...props}: any) => <td className="px-3 py-2 whitespace-nowrap text-sm text-slate-300" {...props} />,
};

interface ChatMessageProps {
  message: Message;
  onNavigate?: (view: View, slug?: string, hash?: string) => void;
  isStreaming?: boolean;
}

// Spring config — slight overshoot so it feels bouncy but not cartoonish
const messageSpring = {
  type: 'spring' as const,
  stiffness: 380,
  damping: 26,
};


export const ChatMessage: React.FC<ChatMessageProps> = React.memo(({ message, onNavigate, isStreaming }) => {
  const { language } = useLanguage();
  const [isCopied, setIsCopied] = React.useState(false);

  // Resolve the text to display: prefer the translation for the current UI
  // language so toggling EN↔ZH immediately shows the alternate response.
  // During streaming the translation isn't stored yet, so we fall back to
  // message.text which is being built up chunk-by-chunk in real time.
  const displayText = message.translations?.[language] ?? message.text;

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(displayText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy message: ', err);
    }
  };

  const markdownComponents = React.useMemo(() => ({
    ...STATIC_MARKDOWN_COMPONENTS,
    a: ({node, ...props}: any) => {
      const href = props.href || '';
      if (!isSafeLink(href)) return <span {...props} title="Link disabled">{props.children}</span>;

      const isInternal = href.startsWith('/') && !href.startsWith('//');
      const handleClick = (e: React.MouseEvent) => {
        if (isInternal && handleLinkClick(href, onNavigate)) e.preventDefault();
      };

      return (
        <a
          className="text-blue-400 hover:underline cursor-pointer"
          onClick={handleClick}
          target={isInternal ? undefined : '_blank'}
          rel={isInternal ? undefined : 'noopener noreferrer'}
          {...props}
        />
      );
    },
  }), [onNavigate]);

  const isError = message.role === 'model' &&
    (displayText.startsWith('Error:') || displayText.startsWith('System:'));

  const isUser = message.role === 'user';

  return (
    <motion.div
      // Slide in from the appropriate side with a spring overshoot
      initial={{ opacity: 0, y: 16, scale: 0.96, x: isUser ? 8 : -8 }}
      animate={{ opacity: 1, y: 0,  scale: 1,    x: 0            }}
      transition={messageSpring}
      className={`group flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser
            ? 'bg-blue-600'
            : isError
              ? 'bg-red-900/20 border border-red-500/30'
              : 'bg-slate-700 border border-slate-600'
        }`}
      >
        {isUser
          ? <User size={16} />
          : <Bot size={16} className={isError ? 'text-red-400' : 'text-blue-400'} />
        }
      </div>

      {/* Bubble */}
      <div
        className={`relative group p-4 rounded-2xl max-w-[80%] text-sm leading-relaxed ${
          isUser
            ? 'bg-blue-600/20 border border-blue-500/30 text-blue-100 rounded-tr-sm'
            : isError
              ? 'bg-red-900/10 border border-red-500/30 text-red-200 rounded-tl-sm shadow-xl'
              : 'bg-slate-900/80 border border-slate-800 text-slate-300 rounded-tl-sm shadow-xl'
        }`}
      >
        {/* Copy Button for model messages */}
        {message.role === 'model' && (
          <button
            onClick={handleCopyMessage}
            className="absolute top-2 right-2 p-1.5 rounded-md text-slate-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-slate-700 hover:text-white focus:opacity-100 bg-slate-800/50 backdrop-blur-sm z-10"
            aria-label={isCopied ? 'Copied to clipboard' : 'Copy message'}
            title={isCopied ? 'Copied to clipboard' : 'Copy message'}
          >
            {isCopied
              ? <Check size={14} className="text-green-400" />
              : <Copy size={14} />
            }
          </button>
        )}

        <ReactMarkdown
          remarkPlugins={MARKDOWN_PLUGINS}
          rehypePlugins={REHYPE_PLUGINS}
          components={markdownComponents as any}
        >
          {displayText}
        </ReactMarkdown>

        {/* Streaming cursor */}
        {isStreaming && message.role === 'model' && (
          <span
            className="inline-block w-0.5 h-4 bg-blue-400 animate-pulse ml-0.5 align-middle"
            aria-hidden="true"
          />
        )}
      </div>
    </motion.div>
  );
});

ChatMessage.displayName = 'ChatMessage';
