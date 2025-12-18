import React from 'react';
import { Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '../types';

const MARKDOWN_PLUGINS = [remarkGfm];

const MARKDOWN_COMPONENTS = {
  p: ({node, ...props}: any) => <p className="mb-2 last:mb-0" {...props} />,
  ul: ({node, ...props}: any) => <ul className="list-disc list-outside ml-4 mb-2" {...props} />,
  ol: ({node, ...props}: any) => <ol className="list-decimal list-outside ml-4 mb-2" {...props} />,
  li: ({node, ...props}: any) => <li className="mb-1" {...props} />,
  a: ({node, ...props}: any) => {
    // Security: Prevent XSS via malicious links (e.g. javascript:)
    const href = props.href || '';
    const isSafe = href.startsWith('http') || href.startsWith('mailto') || href.startsWith('/');
    if (!isSafe) return <span {...props} title="Link disabled">{props.children}</span>;
    return <a className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />;
  },
  strong: ({node, ...props}: any) => <strong className="font-bold text-slate-100" {...props} />,
  pre: ({node, ...props}: any) => <pre className="bg-slate-800 p-4 rounded-lg overflow-x-auto my-2 [&>code]:bg-transparent [&>code]:p-0" {...props} />,
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
}

export const ChatMessage: React.FC<ChatMessageProps> = React.memo(({ message }) => {
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
        className={`p-4 rounded-2xl max-w-[80%] text-sm leading-relaxed ${
          message.role === 'user'
            ? 'bg-blue-600/20 border border-blue-500/30 text-blue-100 rounded-tr-sm'
            : 'bg-slate-900/80 border border-slate-800 text-slate-300 rounded-tl-sm shadow-xl'
        }`}
      >
        <ReactMarkdown
          remarkPlugins={MARKDOWN_PLUGINS}
          components={MARKDOWN_COMPONENTS as any}
        >
          {message.text}
        </ReactMarkdown>
      </div>
    </div>
  );
});

ChatMessage.displayName = 'ChatMessage';
