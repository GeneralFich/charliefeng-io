import React from 'react';
import { Check, Copy } from 'lucide-react';

interface CodeBlockProps extends React.HTMLAttributes<HTMLPreElement> {
  node?: any;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ node, children, className, ...props }) => {
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
        className={`bg-slate-800 p-4 rounded-lg overflow-x-auto [&>code]:bg-transparent [&>code]:p-0 pr-12 ${className || ''}`}
        {...props}
      >
        {children}
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 rounded-md bg-slate-700/50 text-slate-400 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all hover:bg-slate-600 hover:text-white"
        aria-label="Copy code"
        title="Copy code"
      >
        {isCopied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
      </button>
    </div>
  );
};
