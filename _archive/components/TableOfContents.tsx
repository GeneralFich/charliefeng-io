import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, List } from 'lucide-react';
import { slugify, extractTextFromMarkdown } from '../lib/utils';

/**
 * @fileoverview Table of Contents Component
 *
 * This component renders a floating/collapsible Table of Contents for blog posts.
 *
 * "Why" Manual Regex Parsing?
 * 1. **Separation of Concerns:** `react-markdown` handles the rendering of the post body, but
 *    extracting a metadata structure (TOC) from the AST during render is complex and side-effect prone.
 * 2. **Simplicity:** Since we already have the raw markdown string, parsing headers with a regex (`O(n)`)
 *    is significantly lighter than writing a custom Remark/Rehype plugin to traverse the AST.
 * 3. **Flexibility:** It allows us to build the TOC structure completely independent of the render cycle.
 *
 * "Why" IntersectionObserver?
 * - To provide a "Spy" effect where the active section is highlighted as the user scrolls.
 *
 * Limitations:
 * - Only supports H1-H3.
 * - Assumes standard Markdown header syntax (`# Title`).
 */

interface TableOfContentsProps {
  /** The raw markdown string of the blog post. */
  markdown: string;
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ markdown }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>('');

  // Parse headers from markdown
  const tocItems = React.useMemo(() => {
    const items: TocItem[] = [];
    const lines = markdown.split('\n');

    // Only capture H1-H3 for TOC to avoid clutter
    const headerRegex = /^\s*(#{1,3})\s+(.+)$/;

    // Flag to skip frontmatter and code blocks
    // "Why": We must ignore # comments in code blocks and key: value pairs in frontmatter
    let inFrontmatter = false;
    let inCodeBlock = false;
    let lineIndex = 0;

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Handle Frontmatter (starts and ends with ---)
      if (lineIndex === 0 && trimmedLine === '---') {
        inFrontmatter = true;
        lineIndex++;
        continue;
      }
      if (inFrontmatter) {
        if (trimmedLine === '---') {
            inFrontmatter = false;
        }
        lineIndex++;
        continue;
      }

      // Handle Code Blocks (toggles with ```)
      if (trimmedLine.startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        lineIndex++;
        continue;
      }
      if (inCodeBlock) {
        lineIndex++;
        continue;
      }

      const match = line.match(headerRegex);
      if (match) {
        const level = match[1].length;
        const rawText = match[2];
        const cleanText = extractTextFromMarkdown(rawText);
        const id = slugify(cleanText);

        // Skip empty headers
        if (cleanText) {
             items.push({ id, text: cleanText, level });
        }
      }
      lineIndex++;
    }

    return items;
  }, [markdown]);

  // Handle intersection observer to highlight active section
  useEffect(() => {
    if (tocItems.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      // rootMargin centers the intersection area (trigger when header is near top/middle)
      { rootMargin: '-100px 0px -66% 0px' }
    );

    tocItems.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [tocItems]);

  // Don't render if there's only one section (usually the title)
  if (tocItems.length < 2) return null;

  return (
    <div className="mb-8 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-900/30 overflow-hidden transition-all duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors text-left"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-semibold">
          <List size={18} className="text-blue-600 dark:text-blue-400" />
          <span>Table of Contents</span>
          <span className="text-xs text-slate-500 font-normal ml-2">
            ({tocItems.length} sections)
          </span>
        </div>
        {isOpen ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
      </button>

      {isOpen && (
        <div className="p-4 pt-0 border-t border-slate-200 dark:border-slate-800/50">
          <nav className="flex flex-col gap-1 mt-3">
            {tocItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById(item.id);
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                    // Update URL hash without jumping
                    window.history.pushState(null, '', `#${item.id}`);
                    setActiveId(item.id);
                  }
                }}
                className={`
                  text-sm py-1.5 transition-colors duration-200 border-l-2 pl-3
                  ${item.level === 1 ? 'font-semibold' : ''}
                  ${item.level === 3 ? 'ml-4' : ''}
                  ${activeId === item.id
                    ? 'border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 bg-blue-400/5 -ml-[1px]'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'}
                `}
              >
                {item.text}
              </a>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
};
