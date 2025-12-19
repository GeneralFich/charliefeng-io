import React from 'react';
import { Bot, User, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message, View } from '../types';

const MARKDOWN_PLUGINS = [remarkGfm];

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

// CodeBlock component with copy functionality
const CodeBlock = ({ node, children, ...props }: any) => {
  const [isCopied, setIsCopied] = React.useState(false);
  const preRef = React.useRef<HTMLPreElement>(null);

  const handleCopy = async () => {
    if (preRef.current) {
      const text = preRef.current.innerText;
      try {
        await navigator.clipboard.writeText(text);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    }
  };

  return (
    <div className="relative group my-2">
      <pre
        ref={preRef}
        className="bg-slate-800 p-4 rounded-lg overflow-x-auto [&>code]:bg-transparent [&>code]:p-0 pr-12"
        {...props}
      >
        {children}
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 rounded-md bg-slate-700/50 text-slate-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-slate-600 hover:text-white"
        aria-label="Copy code"
        title="Copy code"
      >
        {isCopied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
      </button>
    </div>
  );
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
  // Memoize the components object to prevent re-renders on every token update
  const markdownComponents = React.useMemo(() => ({
    ...STATIC_MARKDOWN_COMPONENTS,
    a: ({node, ...props}: any) => {
      // Security: Prevent XSS via malicious links (e.g. javascript:)
      const href = props.href || '';
      const isSafe = href.startsWith('http') || href.startsWith('mailto') || href.startsWith('/');
      if (!isSafe) return <span {...props} title="Link disabled">{props.children}</span>;

      // Intercept internal links
      const handleClick = (e: React.MouseEvent) => {
        if (href.startsWith('/')) {
          if (handleLinkClick(href, onNavigate)) {
            e.preventDefault();
          }
        }
      };

      return <a className="text-blue-400 hover:underline cursor-pointer" onClick={handleClick} target={href.startsWith('/') ? undefined : "_blank"} rel={href.startsWith('/') ? undefined : "noopener noreferrer"} {...props} />;
    },
  }), [onNavigate]);

  const [isMessageCopied, setIsMessageCopied] = React.useState(false);

  const handleMessageCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
      setIsMessageCopied(true);
      setTimeout(() => setIsMessageCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy message: ', err);
    }
  };

  return (
    <div
      className={`flex items-start gap-3 ${
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
        className={`relative group p-4 rounded-2xl max-w-[80%] text-sm leading-relaxed pr-10 ${
          message.role === 'user'
            ? 'bg-blue-600/20 border border-blue-500/30 text-blue-100 rounded-tr-sm'
            : 'bg-slate-900/80 border border-slate-800 text-slate-300 rounded-tl-sm shadow-xl'
        }`}
      >
        <button
          onClick={handleMessageCopy}
          className={`absolute top-2 right-2 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-all ${
             message.role === 'user'
               ? 'text-blue-200 hover:bg-blue-500/30 hover:text-white'
               : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
          }`}
          aria-label="Copy message"
          title="Copy message"
        >
          {isMessageCopied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
        </button>
        <ReactMarkdown
          remarkPlugins={MARKDOWN_PLUGINS}
          components={markdownComponents as any}
        >
          {message.text}
        </ReactMarkdown>
      </div>
    </div>
  );
});

ChatMessage.displayName = 'ChatMessage';
