import React, { useState } from 'react';
import { Check, Link as LinkIcon } from 'lucide-react';
import { SearchHighlighter } from './SearchHighlighter';
import { slugify, extractTextFromReactNode } from '../lib/utils';

interface HeadingProps {
  level: 'h1' | 'h2' | 'h3';
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}

export const Heading: React.FC<HeadingProps> = ({ level, children, className, ...props }) => {
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
      className={`${className || ''} group relative scroll-mt-24`}
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
