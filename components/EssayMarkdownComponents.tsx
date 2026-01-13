import React from 'react';
import type { Components } from 'react-markdown';
import { SearchHighlighter } from './SearchHighlighter';
import { isSafeLink } from '../lib/utils';
import { CodeBlock } from './CodeBlock';
import { Heading } from './Heading';
import { WhitepaperCharts } from './WhitepaperCharts';
import { WhitepaperSummary } from './WhitepaperSummary';

/**
 * @fileoverview Markdown Component Overrides
 *
 * "What": This object defines how `react-markdown` renders specific HTML elements.
 * It acts as the "Theme Layer" for the blog essays, controlling typography, syntax highlighting,
 * and interactivity.
 *
 * "Why":
 * 1. **Search Highlighting**: We wrap text elements (p, li, blockquote) in `SearchHighlighter`
 *    to enable "Ctrl+F" functionality within the React tree.
 * 2. **Security**: We intercept `<a>` tags to sanitize links (`isSafeLink`) and prevent
 *    open redirects or XSS.
 * 3. **Interactive Components ("Magic Code Blocks")**:
 *    Standard Markdown is static. To embed interactive React components (like Charts or Summaries)
 *    inside a standard `.md` file, we use a custom pattern:
 *    - The Markdown author writes a code block with language `infographic`.
 *    - The `code` component below detects this language.
 *    - Instead of rendering a code snippet, it mounts the corresponding React component
 *      (e.g., `WhitepaperCharts`).
 *
 * This allows us to keep the "Single Source of Truth" (Markdown files) while having rich UI features.
 */
export const ESSAY_MARKDOWN_COMPONENTS: Components = {
  // Custom Anchor to handle footnotes and external links
  a: ({ node, href, children, ...props }: any) => {
    // Security: Prevent XSS and open redirects
    const safeHref = href || '';
    if (!isSafeLink(safeHref)) {
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
  // Apply context-aware highlighter to text blocks and auto-generated IDs
  h1: (props: any) => <Heading level="h1" className="text-2xl font-bold text-white mt-12 mb-6" {...props} />,
  h2: (props: any) => <Heading level="h2" className="text-xl font-bold text-slate-200 mt-10 mb-4" {...props} />,
  h3: (props: any) => <Heading level="h3" className="text-lg font-bold text-slate-200 mt-8 mb-3" {...props} />,
  p: ({ node, children, ...props }: any) => <SearchHighlighter as="p" className="text-slate-300 leading-relaxed mb-6" {...props}>{children}</SearchHighlighter>,
  li: ({ node, children, ...props }: any) => <SearchHighlighter as="li" className="text-slate-300" {...props}>{children}</SearchHighlighter>,
  blockquote: ({ node, children, ...props }: any) => (
    <blockquote {...props} className="border-l-4 border-blue-500/50 pl-4 italic text-slate-400 my-8">
      <SearchHighlighter>{children}</SearchHighlighter>
    </blockquote>
  ),
  /**
   * Custom Pre Handling
   *
   * "Why": In Markdown, a code block is rendered as `<pre><code>...</code></pre>`.
   * If we want to replace the code block with a Chart, we need to completely replace the `<pre>`
   * wrapper to avoid having a chart inside a preformatted text box.
   *
   * Logic: We check if the inner `<code>` element has the `language-infographic` class.
   * If so, we unwrap it (render `children` directly) so the `code` component below can
   * handle the full rendering of the interactive component.
   */
  pre: ({ node, children, ...props }: any) => {
    // Check for infographic in children
    const codeChild = node.children && node.children.length > 0 ? node.children[0] : null;
    const className = codeChild && codeChild.properties ? (codeChild.properties.className || []) : [];
    const classList = Array.isArray(className) ? className : [className];
    const isInfographic = classList.some((c: string) => c.includes('language-infographic'));

    if (isInfographic) {
      return <>{children}</>;
    }

    return <CodeBlock node={node} {...props}>{children}</CodeBlock>;
  },
  /**
   * Custom Code Handling (The "Magic" Switch)
   *
   * "How": This component inspects the `className` prop (e.g., `language-js`, `language-infographic`).
   *
   * - If it's `language-infographic`: It reads the text content (the "code") as a key.
   *   - "whitepaper-summary" -> Renders <WhitepaperSummary />
   *   - "whitepaper-charts" -> Renders <WhitepaperCharts />
   *   - Others -> Renders an <iframe> for legacy infographics.
   *
   * - If it's standard code (e.g., `language-ts`): It renders a styled <code> block.
   */
  code: ({ node, className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || '');
    const isInfographic = match && match[1] === 'infographic';

    if (isInfographic) {
      const type = String(children).replace(/\n$/, '').trim();

      // Handle Whitepaper Summary
      if (type === 'whitepaper-summary') {
        return <WhitepaperSummary />;
      }

      // Handle Whitepaper Charts
      if (type === 'whitepaper-charts') {
        return <WhitepaperCharts />;
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
};
